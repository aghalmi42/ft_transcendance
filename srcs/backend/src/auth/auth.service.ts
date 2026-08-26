import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {RegisterUserDto} from './dto/register.dto';
import { UsersService } from './../users/users.service';
import {LoginUserDto} from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

const FORTY_TWO_AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize';
const FORTY_TWO_TOKEN_URL = 'https://api.intra.42.fr/oauth/token';
const FORTY_TWO_ME_URL = 'https://api.intra.42.fr/v2/me';

interface FortyTwoTokenResponse {
  access_token: string;
}

interface FortyTwoProfileResponse {
  id: number;
  login: string;
  email: string;
  image?: { link?: string };
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}
  async register(registerUserDto: RegisterUserDto) {
   if (await this.usersService.findOneByUsername(registerUserDto.username)) {
    throw new ConflictException('Username already exists');
   }

   if (await this.usersService.findOneByEmail(registerUserDto.email)) {
    throw new ConflictException('Email already exists');
   }

    const user = await this.usersService.create({
    username: registerUserDto.username,
    email: registerUserDto.email,
    password: registerUserDto.password,
  });

    const accessToken = this.jwtService.sign({ username: user.username, sub: user.id });
    return { accessToken, user };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginUserDto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const match = await bcrypt.compare(
    loginUserDto.password,
    user.passwordHash,
    );
    if (!match) {
        throw new UnauthorizedException('Invalid email or password');
    }
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }

  async issueTokenFor(user: User) {
    const accessToken = this.jwtService.sign({ username: user.username, sub: user.id });
    return { accessToken, user };
  }

  getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  }

  isFortyTwoConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('FORTYTWO_CLIENT_ID') &&
      this.configService.get<string>('FORTYTWO_CLIENT_SECRET') &&
      this.configService.get<string>('FORTYTWO_CALLBACK_URL'),
    );
  }

  // Builds the 42 authorize URL. The "state" is a short-lived JWT of our own,
  // which lets us verify the callback wasn't forged without needing server-side sessions.
  getFortyTwoAuthorizeUrl(): string {
    const clientId = this.configService.get<string>('FORTYTWO_CLIENT_ID');
    const redirectUri = this.configService.get<string>('FORTYTWO_CALLBACK_URL');
    if (!clientId || !redirectUri) {
      throw new ServiceUnavailableException("L'authentification 42 n'est pas configurée sur ce serveur.");
    }

    const state = this.jwtService.sign({ purpose: 'oauth42' }, { expiresIn: '10m' });
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'public',
      state,
    });

    return `${FORTY_TWO_AUTHORIZE_URL}?${params.toString()}`;
  }

  verifyOAuthState(state: string | undefined): void {
    try {
      if (!state) throw new Error();
      const payload = this.jwtService.verify<{ purpose: string }>(state);
      if (payload.purpose !== 'oauth42') throw new Error();
    } catch {
      throw new UnauthorizedException('État OAuth invalide ou expiré.');
    }
  }

  async loginWithFortyTwoCode(code: string) {
    const clientId = this.configService.get<string>('FORTYTWO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('FORTYTWO_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('FORTYTWO_CALLBACK_URL');
    if (!clientId || !clientSecret || !redirectUri) {
      throw new ServiceUnavailableException("L'authentification 42 n'est pas configurée sur ce serveur.");
    }

    const tokenRes = await fetch(FORTY_TWO_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException("Échec de l'authentification 42.");
    }
    const tokenData = (await tokenRes.json()) as FortyTwoTokenResponse;

    const meRes = await fetch(FORTY_TWO_ME_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!meRes.ok) {
      throw new UnauthorizedException('Impossible de récupérer le profil 42.');
    }
    const profile = (await meRes.json()) as FortyTwoProfileResponse;

    const user = await this.usersService.findOrCreateFromOAuth({
      provider: '42',
      providerId: String(profile.id),
      username: profile.login,
      email: profile.email,
      avatar: profile.image?.link,
    });

    return this.issueTokenFor(user);
  }
}

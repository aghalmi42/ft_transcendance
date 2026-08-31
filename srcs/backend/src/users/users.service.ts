import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  username: string;
  email: string;
  avatar?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  findTopByElo(limit = 100): Promise<User[]> {
    return this.usersRepository.find({ order: { eloRating: 'DESC' }, take: limit });
  }

  findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
  findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }
  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }
  findOneByOAuth(provider: string, providerId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ oauthProvider: provider, oauthId: providerId });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const isFirstUser = (await this.usersRepository.count()) === 0;

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
    });

    return this.usersRepository.save(user);
  }

  async findOrCreateFromOAuth(profile: OAuthProfile): Promise<User> {
    const existing = await this.findOneByOAuth(profile.provider, profile.providerId);
    if (existing) return existing;

    const byEmail = await this.findOneByEmail(profile.email);
    if (byEmail) {
      byEmail.oauthProvider = profile.provider;
      byEmail.oauthId = profile.providerId;
      return this.usersRepository.save(byEmail);
    }

    const isFirstUser = (await this.usersRepository.count()) === 0;
    const username = await this.generateUniqueUsername(profile.username);

    const user = this.usersRepository.create({
      username,
      email: profile.email,
      passwordHash: null,
      avatar: profile.avatar,
      oauthProvider: profile.provider,
      oauthId: profile.providerId,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
    });

    return this.usersRepository.save(user);
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    const sanitized = base.replace(/[^a-zA-Z0-9_]/g, '') || 'player';
    let candidate = sanitized;
    let suffix = 0;
    while (await this.findOneByUsername(candidate)) {
      suffix += 1;
      candidate = `${sanitized}${suffix}`;
    }
    return candidate;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User | null> {
    await this.usersRepository.update(id, dto);
    return this.findOneById(id);
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, dto);
    return this.findOneById(id);
  }

  async setAvatar(id: string, avatarUrl: string): Promise<User | null> {
    await this.usersRepository.update(id, { avatar: avatarUrl });
    return this.findOneById(id);
  }

  async setStatus(id: string, status: User['status']): Promise<void> {
    await this.usersRepository.update(id, { status });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOneById(id);
    if (!user || !user.passwordHash) {
      throw new BadRequestException(
        "Ce compte n'a pas de mot de passe local (connexion via OAuth) — rien à changer ici.",
      );
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { passwordHash });
  }

  async recordMatchResult(userId: string, outcome: 'WIN' | 'LOSS' | 'DRAW', newElo: number): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) return;

    const xpGain = outcome === 'WIN' ? 50 : outcome === 'DRAW' ? 20 : 10;
    const xp = user.xp + xpGain;

    await this.usersRepository.update(userId, {
      wins: outcome === 'WIN' ? user.wins + 1 : user.wins,
      losses: outcome === 'LOSS' ? user.losses + 1 : user.losses,
      draws: outcome === 'DRAW' ? user.draws + 1 : user.draws,
      xp,
      level: Math.floor(xp / 100) + 1,
      eloRating: newElo,
    });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}

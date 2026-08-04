import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import {RegisterUserDto} from './dto/register.dto';
import { UsersService } from './../users/users.service';
import {LoginUserDto} from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}
  async register(registerUserDto: RegisterUserDto) {
   if (await this.usersService.findOneByUsername(registerUserDto.username)) {
    throw new ConflictException('Username already exists');
   }

   if (await this.usersService.findOneByEmail(registerUserDto.email)) {
    throw new ConflictException('Email already exists');
   }
    const hash = await bcrypt.hash(registerUserDto.password, 10);
    return this.usersService.create({
    username: registerUserDto.username,
    email: registerUserDto.email,
    passwordHash: hash
  });
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginUserDto.email);
    if (!user) {
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
    return { accessToken };
  }
}

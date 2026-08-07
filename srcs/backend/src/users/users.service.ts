import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {UpdateUserDto } from './dto/update-user.dto'



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  findOneById(id: string): Promise<User | null>{
    return this.usersRepository.findOneBy({id});
  }
  findOneByUsername(username: string): Promise<User | null>{
    return this.usersRepository.findOneBy({username});
  }
  findOneByEmail(email: string): Promise<User | null>{
    return this.usersRepository.findOneBy({email});
  }
  create(createUserDto: CreateUserDto): Promise<User> {
  const user = this.usersRepository.create({
    username: createUserDto.username,
    email: createUserDto.email,
    passwordHash: createUserDto.passwordHash,
  });

  return this.usersRepository.save(user);
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
  await this.usersRepository.update(id, updateUserDto);

  return this.findOneById(id);
  }
  async remove(id: string): Promise<void> {
  await this.usersRepository.softDelete(id);
  }
}
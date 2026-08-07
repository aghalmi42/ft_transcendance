import { Body, Controller, Get, Param, Post, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { isUUID } from 'class-validator';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
  return user;
  }
  @Get(':id')
  getUserById(@Param('id') id: string) {
    if (isUUID(id))
      return this.usersService.findOneById(id);
    return this.usersService.findOneByUsername(id);
  }
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Patch(':id')
  updateUser(@Param('id') id: string,
  @Body() updateUserDto: UpdateUserDto,) {
  return this.usersService.update(id, updateUserDto);
  }
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
  return this.usersService.remove(id);
  }

  
}
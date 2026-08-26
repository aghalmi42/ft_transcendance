import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  label!: string;
}

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(user, dto.label);
  }

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.apiKeysService.listForUser(userId);
  }

  @Delete(':id')
  revoke(@CurrentUser() user: User, @Param('id') id: string) {
    return this.apiKeysService.revoke(user, id);
  }
}

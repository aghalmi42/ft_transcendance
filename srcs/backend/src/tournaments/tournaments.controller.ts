import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ReportMatchResultDto } from './dto/report-match-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTournamentDto) {
    return this.tournamentsService.create(user, dto);
  }

  @Get()
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOneWithDetails(id);
  }

  @Post(':id/register')
  register(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tournamentsService.register(user, id);
  }

  @Delete(':id/register')
  unregister(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tournamentsService.unregister(user, id);
  }

  @Post(':id/matches/:matchId/report')
  reportResult(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('matchId') matchId: string,
    @Body() dto: ReportMatchResultDto,
  ) {
    return this.tournamentsService.reportResult(user, id, matchId, dto);
  }
}

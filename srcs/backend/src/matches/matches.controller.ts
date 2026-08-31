import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('history')
  getHistory(@CurrentUser('id') userId: string) {
    return this.matchesService.getHistory(userId);
  }

  @Get('history/:userId')
  getHistoryForUser(@Param('userId') userId: string) {
    return this.matchesService.getHistory(userId);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.matchesService.getLeaderboard();
  }
}

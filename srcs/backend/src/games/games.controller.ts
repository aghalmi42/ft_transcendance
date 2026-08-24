import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { MakeMoveDto } from './dto/make-move.dto';

@Controller('games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  createGame(
    @CurrentUser() user: User,
    @Body() createGameDto: CreateGameDto,
  ) {
    return this.gamesService.createGame(
      user.id,
      createGameDto.opponentId,
    );
  }

  @Post(':id/join')
  joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: string,
  ) {
    this.gamesService.joinGame(
      gameId,
      user.id,
    );

    return this.gamesService.getGameState(gameId);
  }

  @Post(':id/move')
  makeMove(
    @CurrentUser() user: User,
    @Param('id') gameId: string,
    @Body() makeMoveDto: MakeMoveDto,
  ) {
    return this.gamesService.makeMove(
      gameId,
      user.id,
      makeMoveDto.position,
    );
  }

  @Get(':id')
  getGame(
    @Param('id') gameId: string,
  ) {
    return this.gamesService.getGameState(gameId);
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameResult } from '../games/entities/game-result.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameResult]), UsersModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}

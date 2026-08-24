import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameResult } from './entities/game-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameResult])],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
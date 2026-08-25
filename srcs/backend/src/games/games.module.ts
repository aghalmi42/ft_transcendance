import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameResult } from './entities/game-result.entity';
import { GamesGateway } from './games.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameResult]), AuthModule],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
  exports: [GamesService],
})
export class GamesModule {}
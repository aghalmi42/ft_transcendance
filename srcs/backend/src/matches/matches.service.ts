import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameResult } from '../games/entities/game-result.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(GameResult)
    private readonly gameResultsRepository: Repository<GameResult>,
    private readonly usersService: UsersService,
  ) {}

  async getHistory(userId: string) {
    const results = await this.gameResultsRepository.find({
      where: [{ playerXId: userId }, { playerOId: userId }],
      relations: ['playerX', 'playerO'],
      order: { createdAt: 'DESC' },
    });

    return results.map((r) => {
      const isX = r.playerXId === userId;
      const opponent = isX ? r.playerO : r.playerX;
      const result = r.winnerId === null ? 'DRAW' : r.winnerId === userId ? 'VICTORY' : 'DEFEAT';

      return {
        id: r.id,
        gameType: 'TICTACTOE',
        opponentId: opponent?.id,
        opponentName: opponent?.username || 'Adversaire',
        opponentAvatar: opponent?.avatar,
        player1Score: result === 'VICTORY' ? 1 : 0,
        player2Score: result === 'DEFEAT' ? 1 : 0,
        result,
        matchSize: '1v1',
        createdAt: r.createdAt,
        durationSeconds: null,
      };
    });
  }

  getLeaderboard() {
    return this.usersService.findTopByElo(100);
  }
}

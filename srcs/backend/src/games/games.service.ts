import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { TicTacToe } from './tictactoe';
import { GameResult } from './entities/game-result.entity';
import { GameResultType } from './enums/game-result.enum';

@Injectable()
export class GamesService {
  private readonly games = new Map<string, TicTacToe>();

  constructor(
    @InjectRepository(GameResult)
    private readonly gameResultsRepository: Repository<GameResult>,
  ) {}

  
   // Crée une nouvelle partie.
  
  createGame(
    playerXId: string,
    playerOId: string,
  ): string {
    const gameId = randomUUID();

    const game = new TicTacToe(
      playerXId,
      playerOId,
    );

    this.games.set(gameId, game);

    return gameId;
  }

  
   // Récupère une partie en cours.
   
  getGame(gameId: string): TicTacToe {
    const game = this.games.get(gameId);

    if (!game) {
      throw new NotFoundException('Partie introuvable.');
    }

    return game;
  }

  
   // Permet au joueur défié de rejoindre la partie.
   
  joinGame(
    gameId: string,
    playerId: string,
  ): void {
    const game = this.getGame(gameId);

    try {
      game.join(playerId);
    } catch (error) {
      throw new BadRequestException(this.getGameErrorMessage(error));
    }
  }

  
   // Effectue un coup.
   
  async makeMove(
    gameId: string,
    playerId: string,
    position: number,
  ) {
    const game = this.getGame(gameId);

    try {
      game.makeMove(playerId, position);
    } catch (error) {
      throw new BadRequestException(this.getGameErrorMessage(error));
    }

    const gameState = {
      gameId,
      board: game.getBoard(),
      currentPlayer: game.getCurrentPlayer(),
      status: game.getStatus(),
      winner: game.getWinner(),
      playerXId: game.getPlayerXId(),
      playerOId: game.getPlayerOId(),
    };

    if (game.isFinished()) {
      await this.saveGameResult(game);
      this.games.delete(gameId);
    }

    return gameState;
  }

  
   //Sauvegarde le résultat d'une partie terminée.
   
  private async saveGameResult(
    game: TicTacToe,
  ): Promise<void> {
    const winner = game.getWinner();

    const result = this.gameResultsRepository.create({
      playerXId: game.getPlayerXId(),
      playerOId: game.getPlayerOId(),
      winnerId:
        winner === null
          ? null
          : winner === 'X'
            ? game.getPlayerXId()
            : game.getPlayerOId(),
      result:
        winner === null
          ? GameResultType.DRAW
          : GameResultType.WIN,
    });

    await this.gameResultsRepository.save(result);
  }

  
   //Retourne l'état actuel d'une partie.
   
  getGameState(gameId: string) {
    const game = this.getGame(gameId);

    return {
      gameId,
      board: game.getBoard(),
      currentPlayer: game.getCurrentPlayer(),
      status: game.getStatus(),
      winner: game.getWinner(),
      playerXId: game.getPlayerXId(),
      playerOId: game.getPlayerOId(),
    };
  }

  private getGameErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Action impossible.';
  }
}
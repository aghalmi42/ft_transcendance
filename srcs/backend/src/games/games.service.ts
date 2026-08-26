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
import { UsersService } from '../users/users.service';

const ELO_K_FACTOR = 32;

@Injectable()
export class GamesService {
  private readonly games = new Map<string, TicTacToe>();

  constructor(
    @InjectRepository(GameResult)
    private readonly gameResultsRepository: Repository<GameResult>,
    private readonly usersService: UsersService,
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


   //Sauvegarde le résultat d'une partie terminée et met à jour les stats des joueurs.

  private async saveGameResult(
    game: TicTacToe,
  ): Promise<void> {
    const winner = game.getWinner();
    const playerXId = game.getPlayerXId();
    const playerOId = game.getPlayerOId();
    const winnerId = winner === null ? null : winner === 'X' ? playerXId : playerOId;

    const result = this.gameResultsRepository.create({
      playerXId,
      playerOId,
      winnerId,
      result: winner === null ? GameResultType.DRAW : GameResultType.WIN,
    });

    await this.gameResultsRepository.save(result);
    await this.applyEloAndStats(playerXId, playerOId, winnerId);
  }

  private async applyEloAndStats(
    playerXId: string,
    playerOId: string,
    winnerId: string | null,
  ): Promise<void> {
    const [playerX, playerO] = await Promise.all([
      this.usersService.findOneById(playerXId),
      this.usersService.findOneById(playerOId),
    ]);
    if (!playerX || !playerO) return;

    const expectedX = 1 / (1 + 10 ** ((playerO.eloRating - playerX.eloRating) / 400));
    const expectedO = 1 - expectedX;
    const scoreX = winnerId === null ? 0.5 : winnerId === playerXId ? 1 : 0;
    const scoreO = winnerId === null ? 0.5 : winnerId === playerOId ? 1 : 0;

    const newEloX = Math.round(playerX.eloRating + ELO_K_FACTOR * (scoreX - expectedX));
    const newEloO = Math.round(playerO.eloRating + ELO_K_FACTOR * (scoreO - expectedO));

    const outcomeX = winnerId === null ? 'DRAW' : winnerId === playerXId ? 'WIN' : 'LOSS';
    const outcomeO = winnerId === null ? 'DRAW' : winnerId === playerOId ? 'WIN' : 'LOSS';

    await Promise.all([
      this.usersService.recordMatchResult(playerXId, outcomeX, newEloX),
      this.usersService.recordMatchResult(playerOId, outcomeO, newEloO),
    ]);
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
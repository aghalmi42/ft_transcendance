export type Player = 'X' | 'O';
export type Cell = Player | null;
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'draw';

export interface TicTacToeState {
  gameId: string;
  board: Cell[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  playerXId: string;
  playerOId: string;
}
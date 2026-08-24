export type Player = 'X' | 'O';
export type Cell = Player | null;
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'draw';

export class TicTacToe {
  private board: Cell[] = Array(9).fill(null);
  private currentPlayer: Player = 'X';
  private status: GameStatus = 'waiting';
  private winner: Player | null = null;

  constructor(
  private readonly playerXId: string,
  private readonly playerOId: string,
  ) {}

   //join permet de verifier si le second joueur a bien rejoint la partie.

    join(playerId: string): void {
    if (this.status !== 'waiting') {
        throw new Error('La partie ne peut plus être rejointe.');
    }

    if (playerId !== this.playerOId) {
        throw new Error("Vous n'êtes pas le joueur défié.");
    }

    this.status = 'playing';
    }


//Joue un coup sur une case de 0 à 8.
   
  makeMove(playerId: string, position: number): void {
    if (this.status !== 'playing') {
      throw new Error("La partie n'est pas en cours.");
    }

    if (position < 0 || position > 8 || !Number.isInteger(position)) {
      throw new Error('La position doit être comprise entre 0 et 8.');
    }

    const player = this.getPlayerSymbol(playerId);

    if (player !== this.currentPlayer) {
      throw new Error("Ce n'est pas votre tour.");
    }

    if (this.board[position] !== null) {
      throw new Error('Cette case est déjà occupée.');
    }

    this.board[position] = player;

    if (this.checkWinner(player)) {
      this.status = 'finished';
      this.winner = player;
      return;
    }

    if (this.isDraw()) {
      this.status = 'draw';
      return;
    }

    this.currentPlayer = player === 'X' ? 'O' : 'X';
  }


//Retourne l'état actuel de la grille.
  
  getBoard(): Cell[] {
    return [...this.board];
  }


// Retourne le joueur qui doit jouer.
   
  getCurrentPlayer(): Player {
    return this.currentPlayer;
  }


 //Retourne l'état de la partie.

  getStatus(): GameStatus {
    return this.status;
  }


//Retourne le gagnant, ou null s'il n'y en a pas.

  getWinner(): Player | null {
    return this.winner;
  }

  
   //Retourne true si la partie est terminée.

  isFinished(): boolean {
    return this.status === 'finished' || this.status === 'draw';
  }

  
  //  Retourne l'identifiant du joueur X.
   
  getPlayerXId(): string {
    return this.playerXId;
  }

  
   //Retourne l'identifiant du joueur O.

  getPlayerOId(): string {
    return this.playerOId;
  }

  
   // Détermine le symbole associé à un utilisateur.

  private getPlayerSymbol(playerId: string): Player {
    if (playerId === this.playerXId) {
      return 'X';
    }

    if (playerId === this.playerOId) {
      return 'O';
    }

    throw new Error('Ce joueur ne participe pas à cette partie.');
  }

  
 //  Vérifie si le joueur possède une combinaison gagnante.
   
  private checkWinner(player: Player): boolean {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winningCombinations.some(([a, b, c]) => {
      return (
        this.board[a] === player &&
        this.board[b] === player &&
        this.board[c] === player
      );
    });
  }


   //Vérifie si toutes les cases sont occupées sans gagnant.
   
  private isDraw(): boolean {
    return this.board.every((cell) => cell !== null);
  }
}
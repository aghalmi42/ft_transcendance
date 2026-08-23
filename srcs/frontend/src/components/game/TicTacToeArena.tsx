import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useNotification } from '../../context/NotificationContext';
import { soundEffects } from '../../services/audio';
import { Button } from '../common/Button';

type BoardState = (string | null)[];
type Difficulty = 'EASY' | 'MEDIUM' | 'UNBEATABLE';

interface TicTacToeArenaProps {
  opponentName?: string;
  onExit?: () => void;
}

export const TicTacToeArena: React.FC<TicTacToeArenaProps> = ({
  opponentName,
  onExit,
}) => {
  const { user } = useAuth();
  const { recordMatch } = useGame();
  const { addToast } = useNotification();

  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // X is Player 1 (User)
  const [mode, setMode] = useState<'VS_AI' | 'LOCAL_PVP'>('VS_AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [p1Wins, setP1Wins] = useState<number>(0);
  const [p2Wins, setP2Wins] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);

  const p1Name = user?.username || 'Joueur 1 (X)';
  const p2Name = mode === 'VS_AI' ? `IA Morpion (${difficulty})` : opponentName || 'Joueur 2 (O)';

  const checkWinner = (squares: BoardState): { winner: string | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every((sq) => sq !== null)) {
      return { winner: 'DRAW', line: null };
    }
    return { winner: null, line: null };
  };

  // Minimax algorithm for unbeatable AI
  const minimax = (squares: BoardState, depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(squares);
    if (res.winner === 'O') return 10 - depth;
    if (res.winner === 'X') return depth - 10;
    if (res.winner === 'DRAW') return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const evaluation = minimax(squares, depth + 1, false);
          squares[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const evaluation = minimax(squares, depth + 1, true);
          squares[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  };

  const getBestMove = useCallback(
    (squares: BoardState): number => {
      // 1. Easy: Random choice
      if (difficulty === 'EASY') {
        const available = squares.map((v, i) => (v === null ? i : null)).filter((v) => v !== null) as number[];
        return available[Math.floor(Math.random() * available.length)];
      }

      // 2. Medium: 60% optimal move, 40% random
      if (difficulty === 'MEDIUM' && Math.random() < 0.4) {
        const available = squares.map((v, i) => (v === null ? i : null)).filter((v) => v !== null) as number[];
        return available[Math.floor(Math.random() * available.length)];
      }

      // 3. Unbeatable Minimax
      let bestScore = -Infinity;
      let bestMove = 0;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, 0, false);
          squares[i] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return bestMove;
    },
    [difficulty]
  );

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (mode === 'VS_AI' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const aiIdx = getBestMove(board);
        if (aiIdx !== undefined && board[aiIdx] === null) {
          const next = [...board];
          next[aiIdx] = 'O';
          setBoard(next);
          soundEffects.playPaddleHit();

          const outcome = checkWinner(next);
          if (outcome.winner) {
            handleGameOver(outcome.winner, outcome.line);
          } else {
            setIsXNext(true);
          }
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [board, isXNext, mode, winner, getBestMove]);

  const handleGameOver = (winSym: string, line: number[] | null) => {
    setWinningLine(line);
    if (winSym === 'X') {
      setWinner(p1Name);
      setP1Wins((w) => w + 1);
      soundEffects.playLevelUp();
      addToast(`🎉 Vous avez gagné la partie de Morpion !`, 'success');
      recordMatch({
        gameType: 'TICTACTOE',
        opponentName: p2Name,
        userScore: 1,
        opponentScore: 0,
        result: 'VICTORY',
      });
    } else if (winSym === 'O') {
      setWinner(p2Name);
      setP2Wins((w) => w + 1);
      soundEffects.playDefeat();
      recordMatch({
        gameType: 'TICTACTOE',
        opponentName: p2Name,
        userScore: 0,
        opponentScore: 1,
        result: 'DEFEAT',
      });
    } else {
      setWinner('Égalité');
      setDraws((d) => d + 1);
      soundEffects.playClick();
      recordMatch({
        gameType: 'TICTACTOE',
        opponentName: p2Name,
        userScore: 0,
        opponentScore: 0,
        result: 'DRAW',
      });
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || (mode === 'VS_AI' && !isXNext)) return;

    const sym = isXNext ? 'X' : 'O';
    const next = [...board];
    next[index] = sym;
    setBoard(next);
    soundEffects.playClick();

    const outcome = checkWinner(next);
    if (outcome.winner) {
      handleGameOver(outcome.winner, outcome.line);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    soundEffects.playPowerUp();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left font-sans animate-fadeIn">
      {/* Top Scoreboard */}
      <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        {/* P1 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-500/50 flex items-center justify-center font-black text-violet-400 text-lg">
            X
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{p1Name}</h3>
            <span className="text-xs text-violet-400 font-bold">{p1Wins} Victoires</span>
          </div>
        </div>

        {/* Middle Stats */}
        <div className="text-center">
          <span className="text-xs font-mono text-slate-500 block">{draws} Égalités</span>
          <span className="text-xs font-bold text-slate-300">
            {winner ? 'Partie terminée' : isXNext ? 'Tour : Joueur X' : 'Tour : Joueur O'}
          </span>
        </div>

        {/* P2 */}
        <div className="flex items-center justify-end gap-3 text-right">
          <div>
            <h3 className="font-bold text-white text-sm">{p2Name}</h3>
            <span className="text-xs text-cyan-400 font-bold">{p2Wins} Victoires</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-black text-cyan-400 text-lg">
            O
          </div>
        </div>
      </div>

      {/* Mode & Difficulty toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => { setMode('VS_AI'); resetGame(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              mode === 'VS_AI' ? 'bg-violet-600 text-white' : 'text-slate-400'
            }`}
          >
            🤖 Vs IA
          </button>
          <button
            onClick={() => { setMode('LOCAL_PVP'); resetGame(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              mode === 'LOCAL_PVP' ? 'bg-violet-600 text-white' : 'text-slate-400'
            }`}
          >
            👥 1v1 Local
          </button>
        </div>

        {mode === 'VS_AI' && (
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            {(['EASY', 'MEDIUM', 'UNBEATABLE'] as const).map((d) => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); resetGame(); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  difficulty === d ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                {d === 'UNBEATABLE' ? 'IMBATTABLE' : d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="p-6 bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-2xl flex flex-col items-center">
        <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80">
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={Boolean(cell || winner || (mode === 'VS_AI' && !isXNext))}
                className={`w-full h-full rounded-2xl border-2 transition-all flex items-center justify-center font-black text-4xl sm:text-5xl cursor-pointer ${
                  isWinningCell
                    ? 'bg-violet-600/30 border-violet-400 shadow-lg shadow-violet-500/50 scale-105'
                    : cell
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {cell === 'X' && <span className="text-violet-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">X</span>}
                {cell === 'O' && <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">O</span>}
              </button>
            );
          })}
        </div>

        {/* Win Banner / Play Again Button */}
        {winner && (
          <div className="mt-6 text-center space-y-3 animate-fadeIn">
            <h3 className="text-lg font-black text-white">
              {winner === 'Égalité' ? '🤝 Match Nul !' : `🏆 ${winner} a gagné la partie !`}
            </h3>
            <Button variant="primary" size="md" onClick={resetGame}>
              Rejouer une manche
            </Button>
          </div>
        )}
      </div>

      {onExit && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" onClick={onExit}>
            ← Retour au Hub de Jeux
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicTacToeArena;

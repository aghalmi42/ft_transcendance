import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import type { TicTacToeState } from '../../types';

export const TicTacToeGame: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const [opponentId, setOpponentId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [state, setState] = useState<TicTacToeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  useEffect(() => {
    if (token) socketService.connectTicTacToe(token);
  }, [token]);

  // The backend updates wins/losses/xp/level/ELO server-side once a match ends —
  // pull the fresh profile so the rest of the UI (stats, leaderboard) reflects it.
  useEffect(() => {
    if (state?.status === 'finished' || state?.status === 'draw') {
      refreshUser();
    }
  }, [state?.status, refreshUser]);

  useEffect(() => {
    const handleState = (data: TicTacToeState) => {
      setState((prev) => (prev && data.gameId !== prev.gameId ? prev : data));
      setOpponentDisconnected(false);
    };
    socketService.on('game:state', handleState);
    return () => socketService.off('game:state', handleState);
  }, []);

  // Graceful disconnect handling: the backend notifies the room the moment the
  // other player drops, instead of the game just going silent.
  useEffect(() => {
    const handleOpponentDisconnected = () => setOpponentDisconnected(true);
    socketService.on('game:opponentDisconnected', handleOpponentDisconnected);
    return () => socketService.off('game:opponentDisconnected', handleOpponentDisconnected);
  }, []);

  const joinRoom = useCallback((gameId: string) => {
    socketService.sendTicTacToe('game:join', { gameId });
  }, []);

  const handleCreate = async () => {
    if (!opponentId.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const { gameId } = await api.createTicTacToeGame(opponentId.trim());
      const fresh = await api.getTicTacToeGame(gameId);
      setState(fresh);
      joinRoom(gameId);
    } catch {
      setError("Impossible de créer la partie. Vérifiez l'identifiant (UUID) de l'adversaire.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const fresh = await api.joinTicTacToeGame(joinId.trim());
      setState(fresh);
      joinRoom(joinId.trim());
    } catch {
      setError('Impossible de rejoindre cette partie.');
    } finally {
      setBusy(false);
    }
  };

  const mySymbol =
    state && user ? (state.playerXId === user.id ? 'X' : state.playerOId === user.id ? 'O' : null) : null;

  const handleCellClick = (position: number) => {
    if (!state || state.status !== 'playing') return;
    if (!mySymbol || mySymbol !== state.currentPlayer) return;
    if (state.board[position] !== null) return;
    socketService.sendTicTacToe('game:move', { gameId: state.gameId, position });
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6 text-center font-sans">
      <h2 className="text-xl font-black text-white">⭕ Tic-Tac-Toe</h2>

      {!state && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Créer une partie</label>
            <div className="flex gap-2">
              <input
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
                placeholder="ID (UUID) de l'adversaire"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                onClick={handleCreate}
                disabled={busy || !opponentId.trim()}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Rejoindre une partie</label>
            <div className="flex gap-2">
              <input
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="ID de la partie"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                onClick={handleJoin}
                disabled={busy || !joinId.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Rejoindre
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
      )}

      {state && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-slate-400 break-all">Partie : {state.gameId}</div>

          {opponentDisconnected && state.status === 'playing' && (
            <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800 rounded-lg px-3 py-2">
              ⚠️ Votre adversaire s'est déconnecté. La partie reste ouverte s'il revient.
            </p>
          )}

          <div className="text-sm font-bold text-slate-200">
            {state.status === 'waiting' && "En attente de l'adversaire..."}
            {state.status === 'playing' &&
              (state.currentPlayer === mySymbol ? 'À votre tour' : "Tour de l'adversaire")}
            {state.status === 'finished' && (state.winner === mySymbol ? '🏆 Vous avez gagné !' : 'Défaite...')}
            {state.status === 'draw' && 'Match nul !'}
          </div>

          <div className="grid grid-cols-3 gap-2 w-64 mx-auto">
            {state.board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={!!cell || state.status !== 'playing' || mySymbol !== state.currentPlayer}
                className="aspect-square rounded-xl bg-slate-900 border border-slate-700 text-3xl font-black text-white flex items-center justify-center hover:border-violet-500 disabled:cursor-not-allowed"
              >
                {cell}
              </button>
            ))}
          </div>

          <button onClick={() => setState(null)} className="text-xs text-slate-400 hover:text-white underline">
            Nouvelle partie
          </button>
        </div>
      )}
    </div>
  );
};

export default TicTacToeGame;

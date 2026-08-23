import React, { useState } from 'react';
import { soundEffects } from '../../services/audio';
import { PongArena } from './PongArena';
import { TicTacToeArena } from './TicTacToeArena';
import { QuizArena } from './QuizArena';
import { SpectatorArena } from './SpectatorArena';
import { Button } from '../common/Button';

interface GamingHubPageProps {
  onNavigate?: (tabId: string) => void;
  initialGame?: string;
  initialDuelRoomId?: string;
  initialOpponentName?: string;
}

export const GamingHubPage: React.FC<GamingHubPageProps> = ({
  onNavigate,
  initialGame = 'pong',
  initialOpponentName,
}) => {
  const [activeGame, setActiveGame] = useState<string>(initialGame);

  const gameTabs = [
    { id: 'pong', label: 'Pong 2D Classique', icon: '🏓', desc: '1v1 Local, IA & Tournois' },
    { id: 'tictactoe', label: 'Tic-Tac-Toe (Morpion)', icon: '⭕', desc: 'IA Minimax & 1v1' },
    { id: 'quiz', label: 'Quiz Battle 42', icon: '🧠', desc: 'Trivia chrono multi-thèmes' },
    { id: 'spectator', label: 'Mode Spectateur', icon: '🔴', desc: 'Matchs en direct' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-2 text-left font-sans animate-fadeIn">
      {/* Top Game Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {gameTabs.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setActiveGame(g.id);
                soundEffects.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeGame === g.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <>
              <Button variant="outline" size="sm" onClick={() => onNavigate('tournaments')}>
                🏆 Tournois
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('history')}>
                📊 Historique
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Render Active Game Arena */}
      <div className="w-full">
        {activeGame === 'pong' && (
          <PongArena
            opponentName={initialOpponentName}
            onExit={() => onNavigate?.('games')}
          />
        )}

        {activeGame === 'tictactoe' && (
          <TicTacToeArena
            opponentName={initialOpponentName}
            onExit={() => onNavigate?.('games')}
          />
        )}

        {activeGame === 'quiz' && (
          <QuizArena
            onExit={() => onNavigate?.('games')}
          />
        )}

        {activeGame === 'spectator' && (
          <SpectatorArena
            onExit={() => onNavigate?.('games')}
          />
        )}
      </div>
    </div>
  );
};

export default GamingHubPage;

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import type { User } from '../../types';

export type ChallengeGameType = 'PONG' | 'TICTACTOE';

interface PlatoChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
  targetNick?: string;
  onSendChallenge: (gameType: ChallengeGameType, options?: { targetScore?: number; powerUps?: boolean }) => void;
}

interface GameOption {
  id: 'PONG' | 'TICTACTOE';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
}

const AVAILABLE_GAMES: GameOption[] = [
  {
    id: 'PONG',
    title: 'Pong 1v1',
    subtitle: 'Arène Multijoueur ELO',
    icon: '🏓',
    color: 'from-violet-600 to-indigo-600',
    description: 'Duel de raquettes en temps réel à 60 FPS. Le premier à 5 points gagne.',
  },
  {
    id: 'TICTACTOE',
    title: 'Tic-Tac-Toe',
    subtitle: 'Morpion Réflexion',
    icon: '⭕',
    color: 'from-cyan-600 to-blue-600',
    description: 'Alignez 3 symboles avant votre adversaire dans un match rapide.',
  },
];

export const PlatoChallengeModal: React.FC<PlatoChallengeModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  targetNick,
  onSendChallenge,
}) => {
  const [selectedGame, setSelectedGame] = useState<'PONG' | 'TICTACTOE'>('PONG');
  const [targetScore, setTargetScore] = useState<number>(5);

  const opponentName = targetUser?.username || targetNick || 'votre adversaire';

  const handleLaunch = () => {
    onSendChallenge(selectedGame, { targetScore });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚔️ Provoquer en Duel (Style Plato)"
      maxWidth="md"
    >
      <div className="space-y-5 text-left font-sans">
        {}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
          <Avatar
            username={opponentName}
            src={targetUser?.avatar}
            size="md"
            status={targetUser?.status || 'ONLINE'}
          />
          <div>
            <span className="text-xs text-slate-400 block font-medium">Défi direct envoyé à</span>
            <h4 className="text-base font-black text-white flex items-center gap-2">
              @{opponentName}
              <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {targetUser?.eloRating || 1000} ELO
              </span>
            </h4>
          </div>
        </div>

        {}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Choisissez le Jeu :
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {AVAILABLE_GAMES.map((game) => {
              const isSelected = selectedGame === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-violet-500 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}
                    >
                      {game.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white">{game.title}</h5>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {game.subtitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{game.description}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-violet-500 bg-violet-600' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {}
        {selectedGame === 'PONG' && (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Points pour gagner :</span>
            <div className="flex items-center gap-1.5">
              {[3, 5, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setTargetScore(score)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    targetScore === score
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {score} pts
                </button>
              ))}
            </div>
          </div>
        )}

        {}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="neon"
            size="md"
            onClick={handleLaunch}
            leftIcon={<span>🚀</span>}
          >
            Lancer le Défi !
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PlatoChallengeModal;

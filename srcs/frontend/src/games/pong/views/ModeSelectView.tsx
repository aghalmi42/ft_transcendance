import React from 'react';
import type { MatchSize } from '../types';
import { soundEffects } from '../../../services/audio';

interface ModeSelectViewProps {
  matchSize: MatchSize;
  onSelectMode: (mode: MatchSize) => void;
  onNext: () => void;
}

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({
  matchSize,
  onSelectMode,
  onNext,
}) => {
  const modes = [
    { id: 'PACMAN_GOAL', title: '🟡 Hungry Pacman Goal', desc: 'Duel 1v1 vs Pacman ! Il mange les pièces et grandit, détruisez-le ou marquez 3 buts !', icon: '🟡' },
    { id: 'ONLINE_1v1', title: '🌐 Duel 1v1 Multijoueur', desc: 'Affrontez un autre joueur connecté en temps réel (Serveur 60 Hz)', icon: '🌐' },
    { id: '1v1', title: '1v1 Duel d Honneur', desc: 'Affrontement local en 1 contre 1', icon: '🤺' },
    { id: 'TOUCHDOWN', title: '🏈 Mode Touchdown', desc: 'Portez la balle dans l\'en-but adverse ! Porteur ralenti sans recharge de sprint.', icon: '🏈' },
    { id: '2v2', title: '2v2 Escarmouche Duo', desc: 'Combats en duo coordonné (4 joueurs)', icon: '👥' },
    { id: '4v4', title: '4v4 Guerre Totale', desc: '8 Joueurs simultanés sur le terrain !', icon: '🔥' },
    { id: 'PRACTICE', title: '🎯 Mode Entraînement', desc: 'Bac à sable & Mannequin Fixe (0s CD, PV infinis)', icon: '🎯' },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto text-left font-sans animate-fade-in">

      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>🏓 ÉTAPE 1 : CHOIX DU MODE DE JEU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mode de Jeu Pong
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Sélectionnez votre type de match (Mode Entraînement Sandbox, Duel 1v1, ou Bataille d Équipe jusqu à 4v4).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNext()}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-violet-600/30 hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>Suivant : Touches</span>
          <span>➡️</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {modes.map(m => {
            const isSelected = matchSize === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelectMode(m.id as MatchSize);
                  soundEffects.playClick();
                }}
                onDoubleClick={() => {
                  onSelectMode(m.id as MatchSize);
                  onNext();
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 hover:scale-[1.03] ${
                  isSelected
                    ? m.id === 'PRACTICE'
                      ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-violet-950/70 border-violet-500 ring-2 ring-violet-500/80 shadow-lg shadow-violet-600/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span className="text-3xl">{m.icon}</span>
                <div>
                  <h4 className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-300'}`}>{m.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ModeSelectView;

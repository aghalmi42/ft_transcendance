import React, { useState, useEffect } from 'react';
import type { ControlMode, MatchSize } from '../types';
import { soundEffects } from '../../../services/audio';

interface ControlsSelectViewProps {
  matchSize: MatchSize;
  controlMode: ControlMode;
  onSelectControlMode: (mode: ControlMode) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ControlsSelectView: React.FC<ControlsSelectViewProps> = ({
  matchSize,
  controlMode,
  onSelectControlMode,
  onBack,
  onNext
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key.toUpperCase());
    };
    const handleKeyUp = () => {
      setPressedKey(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left font-sans animate-fade-in">
      {}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/70 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>🎮 ÉTAPE 2 : CONFIGURATION DES COMMANDES & TOUCHES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Style de Contrôle & Touches
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Mode de jeu : <strong className="text-cyan-300 font-mono">{(matchSize || '1v1').toUpperCase()}</strong> • Choisissez entre le mode Clavier + Souris moderne avec visée laser 360°, ou le mode Mouseless rétro.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="flex-1 md:flex-none px-5 py-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-2xl cursor-pointer transition-all"
          >
            ⬅️ Mode de Jeu
          </button>
          <button
            onClick={onNext}
            className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-600/25 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Suivant : Champion</span>
            <span>➡️</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <div
          onClick={() => {
            onSelectControlMode('KEYBOARD_MOUSE');
            soundEffects.playClick();
          }}
          className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            controlMode === 'KEYBOARD_MOUSE'
              ? 'bg-gradient-to-b from-cyan-950/80 to-slate-950 border-cyan-400 ring-2 ring-cyan-400/80 shadow-2xl shadow-cyan-500/20 scale-[1.01]'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🖱️</span>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Clavier + Souris
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      RECOMMANDÉ
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Visée 360° ultra précise au curseur & ZQSD</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  controlMode === 'KEYBOARD_MOUSE' ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'
                }`}
              >
                {controlMode === 'KEYBOARD_MOUSE' && <span className="text-slate-950 text-xs font-black">✓</span>}
              </div>
            </div>

            {}
            <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🏃 Déplacements</span>
                <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [Z] [Q] [S] [D] / [WASD] / [Flèches]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🎯 Visée 360°</span>
                <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Curseur Souris (Ligne Laser)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">💥 Tir & Rafale Continue</span>
                <span className="font-mono font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [Clic Gauche] ou Maintien [ESPACE]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">⚡ Sort 1 & Sort 2</span>
                <span className="font-mono font-bold text-violet-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [A] & [E]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🌀 Sort 3 (Dash / Def)</span>
                <span className="font-mono font-bold text-violet-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [Clic Droit (RMB)]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🔥 Ultime (Sort 4)</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [R]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">💨 Sprint Turbo</span>
                <span className="font-mono font-bold text-emerald-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [SHIFT]
                </span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div
          onClick={() => {
            onSelectControlMode('MOUSELESS');
            soundEffects.playClick();
          }}
          className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            controlMode === 'MOUSELESS'
              ? 'bg-gradient-to-b from-violet-950/80 to-slate-950 border-violet-400 ring-2 ring-violet-400/80 shadow-2xl shadow-violet-500/20 scale-[1.01]'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">⌨️</span>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    100% Clavier (Mouseless)
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                      RÉTRO & RAPIDE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Verrouillage automatique des cibles au clavier</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  controlMode === 'MOUSELESS' ? 'border-violet-400 bg-violet-500' : 'border-slate-600'
                }`}
              >
                {controlMode === 'MOUSELESS' && <span className="text-slate-950 text-xs font-black">✓</span>}
              </div>
            </div>

            {}
            <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🏃 Déplacements</span>
                <span className="font-mono font-bold text-violet-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [↑] [↓] [←] [→] ou [Z] [Q] [S] [D]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🎯 Visée & Verrouillage</span>
                <span className="font-mono font-bold text-violet-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Auto-Aim + Touche [TAB] (Changer de cible)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">💥 Tir & Rafale Continue</span>
                <span className="font-mono font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Maintien Touche [ESPACE]
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">⚡ Sorts 1, 2, 3</span>
                <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [A], [Z], [E] (ou [1], [2], [3])
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">🔥 Ultime (Sort 4)</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [R] (ou [4])
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">💨 Sprint Turbo</span>
                <span className="font-mono font-bold text-emerald-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  [SHIFT]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Testeur de Touches en Direct :</span>
          {pressedKey ? (
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500 font-bold font-mono">
              Touche pressée : [{pressedKey}]
            </span>
          ) : (
            <span className="text-slate-500 italic">Pressez une touche sur votre clavier...</span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          💡 Vous pourrez également basculer de mode à tout moment pendant la partie !
        </div>
      </div>
    </div>
  );
};

export default ControlsSelectView;

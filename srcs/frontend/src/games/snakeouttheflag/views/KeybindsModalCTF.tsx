import React, { useState, useEffect } from 'react';
import type { CTFKeybinds } from '../types';
import { DEFAULT_KEYBINDS_CTF, saveCTFKeybinds } from '../configs';
import { soundEffects } from '../../../services/audio';

interface KeybindsModalCTFProps {
  isOpen: boolean;
  onClose: () => void;
  currentKeybinds: CTFKeybinds;
  onSaveKeybinds: (newKeybinds: CTFKeybinds) => void;
}

export const KeybindsModalCTF: React.FC<KeybindsModalCTFProps> = ({
  isOpen,
  onClose,
  currentKeybinds,
  onSaveKeybinds,
}) => {
  const [config, setConfig] = useState<CTFKeybinds>(currentKeybinds);
  const [bindingAction, setBindingAction] = useState<keyof CTFKeybinds | null>(null);

  useEffect(() => {
    setConfig(currentKeybinds);
  }, [currentKeybinds, isOpen]);

  useEffect(() => {
    if (!bindingAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pressedKey = e.key;
      setConfig((prev) => {
        const next = {
          ...prev,
          [bindingAction]: pressedKey,
        };
        saveCTFKeybinds(next);
        return next;
      });
      soundEffects.playClick();
      setBindingAction(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [bindingAction]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: 'AZERTY' | 'QWERTY' | 'ARROWS') => {
    const selected = DEFAULT_KEYBINDS_CTF[preset];
    setConfig(selected);
    saveCTFKeybinds(selected);
    onSaveKeybinds(selected);
    soundEffects.playClick();
  };

  const handleSaveAndClose = () => {
    saveCTFKeybinds(config);
    onSaveKeybinds(config);
    soundEffects.playClick();
    onClose();
  };

  const formatKeyName = (k: string) => {
    if (k === ' ') return 'ESPACE';
    if (k === 'ArrowUp') return '↑ HAUT';
    if (k === 'ArrowDown') return '↓ BAS';
    if (k === 'ArrowLeft') return '← GAUCHE';
    if (k === 'ArrowRight') return '→ DROITE';
    return k.toUpperCase();
  };

  const actionsList: { key: keyof CTFKeybinds; label: string; icon: string }[] = [
    { key: 'moveUp', label: 'Direction Haut', icon: '⬆️' },
    { key: 'moveDown', label: 'Direction Bas', icon: '⬇️' },
    { key: 'moveLeft', label: 'Direction Gauche', icon: '⬅️' },
    { key: 'moveRight', label: 'Direction Droite', icon: '➡️' },
    { key: 'bomb', label: 'Poser Bombe Plasma (2s AOE)', icon: '💣' },
    { key: 'boost', label: 'Accélération Boost', icon: '⚡' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-left">
        {}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Contrôles Snake Out the Flag</h2>
              <p className="text-xs text-slate-400">Configurez votre disposition AZERTY, QWERTY ou touches sur-mesure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-cyan-400 uppercase block">
            1. Préréglages Rapides :
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['AZERTY', 'QWERTY', 'ARROWS'] as const).map((p) => {
              return (
                <button
                  key={p}
                  onClick={() => handleSelectPreset(p)}
                  className="py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-cyan-500/40"
                >
                  {p === 'AZERTY' ? '🇫🇷 ZQSD' : p === 'QWERTY' ? '🌐 WASD' : '🎮 Flèches'}
                </button>
              );
            })}
          </div>
        </div>

        {}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-cyan-400 uppercase block">
              2. Touches Personnalisées :
            </label>
            {bindingAction && (
              <span className="text-xs text-amber-400 font-mono animate-pulse">
                Appuyez sur une touche...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {actionsList.map((item) => {
              const isBindingThis = bindingAction === item.key;
              const val = config[item.key];

              return (
                <div
                  key={item.key}
                  onClick={() => setBindingAction(item.key)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isBindingThis
                      ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-medium text-slate-300">{item.label}</span>
                  </div>

                  <span
                    className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border ${
                      isBindingThis
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                        : 'bg-slate-950 border-slate-700 text-cyan-300'
                    }`}
                  >
                    {isBindingThis ? '...' : formatKeyName(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => handleSelectPreset('AZERTY')}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
          >
            Réinitialiser
          </button>

          <button
            onClick={handleSaveAndClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase font-mono rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            ✓ Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeybindsModalCTF;

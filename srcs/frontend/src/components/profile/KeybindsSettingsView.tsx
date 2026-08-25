import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { soundEffects } from '../../services/audio';
import { keybindsStore, type GlobalKeybinds } from '../../services/keybindsStore';
import { useNotification } from '../../context/NotificationContext';

export const KeybindsSettingsView: React.FC<{ onNavigate?: (tabId: string) => void }> = () => {
  const { addToast } = useNotification();
  const [keybinds, setKeybinds] = useState<GlobalKeybinds>(keybindsStore.get());
  const [rebindingAction, setRebindingAction] = useState<keyof Omit<GlobalKeybinds, 'preset'> | null>(null);

  useEffect(() => {
    return keybindsStore.subscribe(cfg => setKeybinds(cfg));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (rebindingAction) {
        e.preventDefault();
        e.stopPropagation();
        const newKey = e.key === ' ' ? ' ' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
        keybindsStore.updateKey(rebindingAction, newKey);
        soundEffects.playScore();
        addToast(`Touche réassignée : ${keybindsStore.formatKeyLabel(newKey)}`, 'success');
        setRebindingAction(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rebindingAction, addToast]);

  const actions: Array<{ key: keyof Omit<GlobalKeybinds, 'preset'>; label: string }> = [
    { key: 'moveUp', label: 'Déplacement Haut' },
    { key: 'moveDown', label: 'Déplacement Bas' },
    { key: 'moveLeft', label: 'Déplacement Gauche' },
    { key: 'moveRight', label: 'Déplacement Droite' },
    { key: 'spell1', label: 'Sort 1 (A / Q)' },
    { key: 'spell2', label: 'Sort 2 (Z / W)' },
    { key: 'spell3', label: 'Sort 3 (E)' },
    { key: 'spell4', label: 'Sort Ultime (R)' },
    { key: 'shootAction', label: 'Tir / Smash (Espace)' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left font-sans animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>⌨️</span> Configuration des Touches
          </h2>
          <p className="text-xs text-slate-400">Cliquez sur une action pour lui assigner une touche.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => keybindsStore.setPreset('AZERTY')}>AZERTY</Button>
          <Button variant="secondary" size="sm" onClick={() => keybindsStore.setPreset('QWERTY')}>QWERTY</Button>
        </div>
      </div>

      <Card title="Raccourcis en Jeu" subtitle="Gestion des touches de combat et de mouvement">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map(a => {
            const isRebinding = rebindingAction === a.key;
            return (
              <div key={a.key} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-300 font-bold">{a.label}</span>
                <button
                  onClick={() => setRebindingAction(a.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${isRebinding ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-900 text-cyan-300 border border-slate-700 hover:border-cyan-500'}`}
                >
                  {isRebinding ? 'Appuyez...' : keybindsStore.formatKeyLabel(keybinds[a.key])}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
export default KeybindsSettingsView;

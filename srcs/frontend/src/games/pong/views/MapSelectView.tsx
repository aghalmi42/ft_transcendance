import React from 'react';
import type { HeroRole, MapTheme } from '../types';
import { HERO_CONFIGS, MAP_CONFIGS } from '../configs';
import { soundEffects } from '../../../services/audio';

interface MapSelectViewProps {
  selectedRole: HeroRole;
  selectedMap: MapTheme;
  onSelectMap: (map: MapTheme) => void;
  onBack: () => void;
  onStartMatch?: () => void;
  onStart?: () => void;
}

export const MapSelectView: React.FC<MapSelectViewProps> = ({
  selectedRole,
  selectedMap,
  onSelectMap,
  onBack,
  onStartMatch,
  onStart,
}) => {
  const handleStart = onStart || onStartMatch || (() => {});
  const currentHero = HERO_CONFIGS[selectedRole];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto text-left font-sans animate-fade-in">

      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>🗺️ ÉTAPE 4 : SÉLECTION DE LA MAP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Arène & Champ de Bataille
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Classe : <strong className="text-white">{currentHero.icon} {currentHero.title}</strong> • Choisissez votre arène pour lancer le match Pong !
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer text-center"
          >
            ⬅️ Champion
          </button>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚔️</span>
            <span>LANCER LA PARTIE PONG</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {(Object.values(MAP_CONFIGS)).map(map => {
          const isSelected = selectedMap === map.id;
          return (
            <button
              key={map.id}
              onClick={() => {
                onSelectMap(map.id);
                soundEffects.playClick();
              }}
              className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-2xl scale-[1.02]'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{map.icon}</span>
                  <div>
                    <h3 className="text-base font-black text-white">{map.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 block">{map.subtitle}</span>
                  </div>
                </div>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300">
                {map.hazardDesc}
              </p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Frottement : {map.friction}</span>
                <span className="text-amber-400 font-bold">{isSelected ? '✓ Prête' : 'Sélectionner'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MapSelectView;

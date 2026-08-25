import React, { useRef, useEffect } from 'react';
import type { HeroRole, MatchSize, ChampionSkin } from '../types';
import { HERO_CONFIGS } from '../configs';
import { soundEffects } from '../../../services/audio';
import { drawUnifiedPaddle, getHeroEquippedLoadout } from '../renderers/PaddleRenderer';

interface ChampionSelectViewProps {
  matchSize: MatchSize;
  selectedRole: HeroRole;
  selectedSkin?: ChampionSkin;
  onSelectRole: (role: HeroRole) => void;
  onSelectSkin?: (skin: ChampionSkin) => void;
  onBack: () => void;
  onNext: () => void;
}

const DynamicSkinStage: React.FC<{ role: HeroRole }> = ({ role }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = 420;
    canvas.height = 240;
    const loadout = getHeroEquippedLoadout(role);
    let t = 0;

    const render = () => {
      t += 0.035;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pX = canvas.width / 2 + Math.cos(t * 1.5) * 75;
      const floatY = canvas.height / 2 + Math.sin(t * 3) * 10;

      drawUnifiedPaddle(ctx, {
        x: pX - 10, y: floatY - 37.5, width: 20, height: 75,
        loadout, facingDir: 1, time: t, showAura: true, showWeapon: true,
      });

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [role]);

  return (
    <div className="w-full flex justify-center py-2">
      <canvas ref={canvasRef} className="rounded-2xl border border-slate-800 bg-slate-950 shadow-inner max-w-full" />
    </div>
  );
};

export const ChampionSelectView: React.FC<ChampionSelectViewProps> = ({
  selectedRole,
  onSelectRole,
  onBack,
  onNext,
}) => {
  const roles: HeroRole[] = ['SHOOTER', 'SLAYER', 'SUPPORT', 'TANK'];
  const currentHero = HERO_CONFIGS[selectedRole];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-left font-sans animate-fadeIn pb-12">
      <div className="flex justify-between items-center bg-slate-900/90 border border-slate-800 p-6 rounded-3xl">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">PHASE DE SÉLECTION</span>
          <h1 className="text-2xl font-black text-white">Choisissez votre Champion</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer">
            Retour
          </button>
          <button onClick={onNext} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer">
            Confirmer 🚀
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roles.map(r => {
          const cfg = HERO_CONFIGS[r];
          const isSelected = selectedRole === r;
          return (
            <button
              key={r}
              onClick={() => { onSelectRole(r); soundEffects.playClick(); }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${isSelected ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
            >
              <span className="text-3xl block">{cfg.icon}</span>
              <h3 className="text-sm font-bold text-white truncate">{cfg.title}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2">{cfg.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentHero.icon}</span>
            <div>
              <h2 className="text-lg font-black text-white">{currentHero.title}</h2>
              <span className="text-xs text-cyan-400 font-mono font-bold">{selectedRole}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300">{currentHero.description}</p>
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Sorts & Capacités</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(currentHero.spells).map(([key, spell]) => (
                <div key={key} className="p-2 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400 uppercase">{key}:</span>
                  <span className="text-slate-200 truncate">{spell.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <span className="text-xs font-mono uppercase font-bold text-slate-400 mb-2">Aperçu Visuel en Temps Réel</span>
          <DynamicSkinStage role={selectedRole} />
        </div>
      </div>
    </div>
  );
};
export default ChampionSelectView;

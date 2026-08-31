import React, { useEffect, useRef, useState } from 'react';
import type { HeroRole } from '../../pong/types';
import type { TeamSize, MatchStats, KeybindConfig } from '../types';
import { CHAMPION_SHIPS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../configs';
import { ShooTacToeEngine } from '../engine/ShooTacToeEngine';
import { ShooTacToeRenderer } from '../engine/ShooTacToeRenderer';

interface ShooTacToeArenaProps {
  playerRole: HeroRole;
  teamSize: TeamSize;
  keybinds: KeybindConfig;
  onOpenKeybinds?: () => void;
  onMatchEnd: (stats: MatchStats) => void;
}

export const ShooTacToeArena: React.FC<ShooTacToeArenaProps> = ({
  playerRole,
  teamSize,
  keybinds,
  onOpenKeybinds,
  onMatchEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ShooTacToeEngine | null>(null);

  const keysRef = useRef<Record<string, boolean>>({});
  const mousePosRef = useRef({ x: 0, y: 0, isDown: false });

  const [p1Stats, setP1Stats] = useState({ hp: 220, maxHp: 220, shield: 80, maxShield: 80 });
  const [cooldownsP1, setCooldownsP1] = useState({ q: 0, w: 0, e: 0, r: 0 });
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [winningLineState, setWinningLineState] = useState<number[] | null>(null);
  const [blueCells, setBlueCells] = useState(0);
  const [redCells, setRedCells] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentDim = 3 + teamSize;

  const triggerNotice = (text: string) => {
    setBannerNotice(text);
    setTimeout(() => setBannerNotice(null), 2500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        e.key === ' ' ||
        e.code === 'Tab' ||
        e.code.startsWith('Arrow') ||
        e.code.startsWith('Key') ||
        e.code.startsWith('Digit')
      ) {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.key] = true;
      keysRef.current[e.code] = true;
      keysRef.current[e.code.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.key] = false;
      keysRef.current[e.code] = false;
      keysRef.current[e.code.toLowerCase()] = false;
    };

    const handleBlur = () => {
      keysRef.current = {};
      mousePosRef.current.isDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      mousePosRef.current.x = (e.clientX - rect.left) * scaleX;
      mousePosRef.current.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        mousePosRef.current.isDown = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        mousePosRef.current.isDown = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvasRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      mousePosRef.current.x = (touch.clientX - rect.left) * scaleX;
      mousePosRef.current.y = (touch.clientY - rect.top) * scaleY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!canvasRef.current || e.touches.length === 0) return;
      mousePosRef.current.isDown = true;
      handleTouchMove(e);
    };

    const handleTouchEnd = () => {
      mousePosRef.current.isDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const engine = new ShooTacToeEngine(playerRole, teamSize);
    engine.onNotice = triggerNotice;
    engine.onMatchEnd = (stats) => {
      if (stats.winLine) {
        setWinningLineState(stats.winLine.indices);
      }
      setTimeout(() => onMatchEnd(stats), 1800);
    };
    engineRef.current = engine;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      engine.update(dt, keysRef.current, mousePosRef.current, playerRole, teamSize, keybinds);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ShooTacToeRenderer.render(ctx, engine.state, winningLineState);
        }
      }

      const p1 = engine.state.blueTeam[0];
      if (p1) {
        setP1Stats({
          hp: Math.round(p1.hp),
          maxHp: p1.maxHp,
          shield: Math.round(p1.shield),
          maxShield: p1.maxShield,
        });

        const p1Cfg = CHAMPION_SHIPS[playerRole];
        setCooldownsP1({
          q: engine.state.spellTimersP1.q / p1Cfg.spells.q.cooldown,
          w: engine.state.spellTimersP1.w / p1Cfg.spells.w.cooldown,
          e: engine.state.spellTimersP1.e / p1Cfg.spells.e.cooldown,
          r: engine.state.spellTimersP1.r / p1Cfg.spells.r.cooldown,
        });
      }

      setBlueCells(engine.state.grid.filter(c => c.owner === 'BLUE').length);
      setRedCells(engine.state.grid.filter(c => c.owner === 'RED').length);
      setElapsedTime(Math.floor((Date.now() - engine.state.startTime) / 1000));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [playerRole, teamSize, onMatchEnd, winningLineState, keybinds]);

  const spellKeyLabels = [
    { key: 'q' as const, bind: keybinds.spell1 },
    { key: 'w' as const, bind: keybinds.spell2 },
    { key: 'e' as const, bind: keybinds.spell3 },
    { key: 'r' as const, bind: keybinds.spell4 },
  ];

  const formatKey = (k: string) => {
    if (k === ' ') return 'ESPACE';
    if (k === 'ArrowUp') return '↑';
    if (k === 'ArrowDown') return '↓';
    if (k === 'ArrowLeft') return '←';
    if (k === 'ArrowRight') return '→';
    return k.toUpperCase();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-4">
      {bannerNotice && (
        <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-500 text-cyan-300 text-center font-mono text-xs font-bold shadow-lg animate-pulse">
          ⚡ {bannerNotice}
        </div>
      )}

      <div className="grid grid-cols-3 items-center bg-slate-950/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-cyan-400">🔵 ÉQUIPE BLEUE (X)</span>
            <span className="text-slate-300">{p1Stats.hp} HP / {p1Stats.shield} SHIELD</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-cyan-500 h-full transition-all duration-75"
              style={{ width: `${Math.max(0, (p1Stats.hp / p1Stats.maxHp) * 100)}%` }}
            />
          </div>
        </div>

        <div className="text-center font-mono space-y-1">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-black text-cyan-400">🔵 {blueCells} / {currentDim * currentDim}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 shadow-inner">
              ⏱️ {formatTime(elapsedTime)}
            </span>
            <span className="text-sm font-black text-rose-400">🔴 {redCells} / {currentDim * currentDim}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold uppercase block">
            ⭐ DOMINION {teamSize}v{teamSize} • ALIGNEZ {currentDim} CASES ⭐
          </span>
        </div>

        <div className="space-y-1 text-right flex items-center justify-end gap-3">
          <div className="space-y-1 text-right flex-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-300">{teamSize} Vaisseaux</span>
              <span className="text-rose-400">🔴 ÉQUIPE ROUGE (O)</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
              <div className="bg-rose-500 h-full w-full ml-auto" />
            </div>
          </div>

          {onOpenKeybinds && (
            <button
              onClick={onOpenKeybinds}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
              title="Configurer les touches (Keybinds)"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      {}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-auto block cursor-crosshair"
          style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />
      </div>

      {}
      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
          {spellKeyLabels.map(({ key, bind }) => {
            const sp = CHAMPION_SHIPS[playerRole].spells[key];
            const cd = cooldownsP1[key];
            const isReady = cd <= 0;

            return (
              <div
                key={key}
                className={`relative p-3 rounded-xl border flex items-center gap-2.5 transition-all shrink-0 ${
                  isReady
                    ? 'bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950/40 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-xl">{sp.icon}</span>
                <div className="text-left font-mono">
                  <span className="text-[10px] font-bold block uppercase text-cyan-400">
                    [{formatKey(bind)}] {sp.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[130px] block">
                    {isReady ? 'Prêt' : `${(cd * sp.cooldown).toFixed(1)}s`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-right text-xs font-mono text-slate-400 flex items-center gap-3 shrink-0">
          <span>
            Propulsion : <strong className="text-cyan-400">{formatKey(keybinds.moveUp)}{formatKey(keybinds.moveLeft)}{formatKey(keybinds.moveDown)}{formatKey(keybinds.moveRight)}</strong> • Tir : <strong className="text-cyan-400">{formatKey(keybinds.shoot)}</strong> / Souris
          </span>
          {onOpenKeybinds && (
            <button
              onClick={onOpenKeybinds}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              ⚙️ Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShooTacToeArena;

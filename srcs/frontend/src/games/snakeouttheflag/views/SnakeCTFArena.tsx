import React, { useEffect, useRef, useState } from 'react';
import type { TeamSize, MatchStatsCTF, CTFKeybinds } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, WIN_FLAG_CAPTURES } from '../configs';
import { SnakeCTFEngine } from '../engine/SnakeCTFEngine';
import { SnakeCTFRenderer } from '../engine/SnakeCTFRenderer';

interface SnakeCTFArenaProps {
  teamSize: TeamSize;
  keybinds: CTFKeybinds;
  onOpenKeybinds?: () => void;
  onMatchEnd: (stats: MatchStatsCTF) => void;
}

export const SnakeCTFArena: React.FC<SnakeCTFArenaProps> = ({
  teamSize,
  keybinds,
  onOpenKeybinds,
  onMatchEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeCTFEngine | null>(null);

  const keysRef = useRef<Record<string, boolean>>({});
  const [blueScore, setBlueScore] = useState<number>(0);
  const [redScore, setRedScore] = useState<number>(0);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [blueFlagState, setBlueFlagState] = useState<{ isAtHome: boolean; hasCarrier: boolean }>({ isAtHome: true, hasCarrier: false });
  const [redFlagState, setRedFlagState] = useState<{ isAtHome: boolean; hasCarrier: boolean }>({ isAtHome: true, hasCarrier: false });
  const [playerLength, setPlayerLength] = useState<number>(12);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const triggerNotice = (text: string) => {
    setBannerNotice(text);
    setTimeout(() => setBannerNotice(null), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code.toLowerCase()] = true;
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code.toLowerCase()] = false;
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const engine = new SnakeCTFEngine(teamSize);
    engine.onNotice = triggerNotice;
    engine.onMatchEnd = (stats) => {
      setTimeout(() => onMatchEnd(stats), 1800);
    };
    engineRef.current = engine;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      engine.update(dt, keysRef.current, keybinds);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          SnakeCTFRenderer.render(ctx, engine.state);
        }
      }

      setBlueScore(engine.state.blueCaptures);
      setRedScore(engine.state.redCaptures);
      setBlueFlagState({
        isAtHome: engine.state.blueFlag.isAtHome,
        hasCarrier: !!engine.state.blueFlag.carrierId,
      });
      setRedFlagState({
        isAtHome: engine.state.redFlag.isAtHome,
        hasCarrier: !!engine.state.redFlag.carrierId,
      });

      const p1 = engine.state.blueSnakes[0];
      if (p1) {
        setPlayerLength(Math.floor(p1.length));
      }
      setElapsedTime(Math.floor((Date.now() - engine.state.startTime) / 1000));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [teamSize, onMatchEnd, keybinds]);

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
        <div className="p-3 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-300 text-center font-mono text-xs font-bold shadow-lg animate-pulse">
          ⚡ {bannerNotice}
        </div>
      )}

      {/* Score and Time Header */}
      <div className="grid grid-cols-3 items-center bg-slate-950/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-xl shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-400">ÉQUIPE BLEUE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                {blueFlagState.isAtHome ? '🚩 Drapeau à la Base' : blueFlagState.hasCarrier ? '⚠️ Drapeau Dérobé !' : '❗ Drapeau au Sol'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Votre Serpent : Longueur {playerLength} segments
            </span>
          </div>
        </div>

        <div className="text-center font-mono space-y-1">
          <div className="text-2xl font-black tracking-widest text-white flex items-center justify-center gap-3">
            <span className="text-cyan-400">{blueScore}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 shadow-inner">
              ⏱️ {formatTime(elapsedTime)}
            </span>
            <span className="text-rose-400">{redScore}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold uppercase block">
            ⭐ PREMIÈRE ÉQUIPE À {WIN_FLAG_CAPTURES} DRAPEAUX GAGNE ⭐
          </span>
        </div>

        {}
        <div className="flex items-center justify-end gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">
                {redFlagState.isAtHome ? '🚩 Drapeau à la Base' : redFlagState.hasCarrier ? '🏃 Capturé par Bleu !' : '❗ Drapeau au Sol'}
              </span>
              <span className="text-xs font-mono font-black text-rose-400">ÉQUIPE ROUGE</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {teamSize} Serpents Ennemis
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-xl shadow-md">
            🏰
          </div>
        </div>
      </div>

      {}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="w-full h-auto block cursor-crosshair"
          style={{ aspectRatio: `${ARENA_WIDTH}/${ARENA_HEIGHT}` }}
        />
      </div>

      {}
      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Direction : <strong className="text-cyan-400">{formatKey(keybinds.moveUp)}{formatKey(keybinds.moveLeft)}{formatKey(keybinds.moveDown)}{formatKey(keybinds.moveRight)}</strong>
          </span>
          <span>•</span>
          <span>
            Bombe Plasma : <strong className="text-amber-400">[{formatKey(keybinds.bomb || ' ')}]</strong> (AOE 2s)
          </span>
          <span>•</span>
          <span>
            Boost : <strong className="text-cyan-300">[{formatKey(keybinds.boost)}]</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-emerald-400">
            🛡️ Vos alliés vous escortent et ne vous blessent pas ! Éliminez les ennemis avec vos bombes.
          </span>
          {onOpenKeybinds && (
            <button
              onClick={onOpenKeybinds}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
            >
              ⚙️ Touches
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeCTFArena;

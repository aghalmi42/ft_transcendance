import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useNotification } from '../../context/NotificationContext';
import { soundEffects } from '../../services/audio';
import { Button } from '../common/Button';

interface PongArenaProps {
  mode?: 'VS_AI' | 'LOCAL_PVP' | 'REMOTE_DUEL';
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  targetScore?: number;
  opponentName?: string;
  onMatchComplete?: (winner: string, p1Score: number, p2Score: number) => void;
  onExit?: () => void;
}

export const PongArena: React.FC<PongArenaProps> = ({
  mode = 'VS_AI',
  aiDifficulty = 'MEDIUM',
  targetScore = 5,
  opponentName,
  onMatchComplete,
  onExit,
}) => {
  const { user } = useAuth();
  const { recordMatch } = useGame();
  const { addToast } = useNotification();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [scoreLeft, setScoreLeft] = useState<number>(0);
  const [scoreRight, setScoreRight] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'VS_AI' | 'LOCAL_PVP' | 'REMOTE_DUEL'>(mode);
  const [currentDifficulty, setCurrentDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(aiDifficulty);

  // Canvas dimensions
  const WIDTH = 800;
  const HEIGHT = 480;
  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 10;

  // Refs for physics loop
  const stateRef = useRef({
    paddleLeftY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddleRightY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddleLeftVy: 0,
    paddleRightVy: 0,
    ballX: WIDTH / 2,
    ballY: HEIGHT / 2,
    ballVx: 5,
    ballVy: 3,
    ballSpeed: 6,
    keys: {
      w: false,
      s: false,
      ArrowUp: false,
      ArrowDown: false,
    },
  });

  const p1Name = user?.username || 'Joueur 1';
  const p2Name = currentMode === 'VS_AI' ? `IA (${currentDifficulty})` : opponentName || 'Joueur 2';

  const resetBall = useCallback((towardsPlayer: 'left' | 'right') => {
    const s = stateRef.current;
    s.ballX = WIDTH / 2;
    s.ballY = HEIGHT / 2;
    s.ballSpeed = 6;
    const dir = towardsPlayer === 'left' ? -1 : 1;
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // -30 to +30 deg
    s.ballVx = dir * s.ballSpeed * Math.cos(angle);
    s.ballVy = s.ballSpeed * Math.sin(angle);
  }, []);

  const handleStartGame = () => {
    setScoreLeft(0);
    setScoreRight(0);
    setWinner(null);
    setIsPlaying(true);
    setIsPaused(false);
    stateRef.current.paddleLeftY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    stateRef.current.paddleRightY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall(Math.random() > 0.5 ? 'left' : 'right');
    soundEffects.playPowerUp();
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S', ' '].includes(e.key)) {
        e.preventDefault();
      }
      const k = e.key.toLowerCase();
      if (k === 'w') stateRef.current.keys.w = true;
      if (k === 's') stateRef.current.keys.s = true;
      if (e.key === 'ArrowUp') stateRef.current.keys.ArrowUp = true;
      if (e.key === 'ArrowDown') stateRef.current.keys.ArrowDown = true;
      if (e.key === ' ') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') stateRef.current.keys.w = false;
      if (k === 's') stateRef.current.keys.s = false;
      if (e.key === 'ArrowUp') stateRef.current.keys.ArrowUp = false;
      if (e.key === 'ArrowDown') stateRef.current.keys.ArrowDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Render & Physics Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (!isPaused && !winner) {
        const s = stateRef.current;

        // 1. Move Player Left Paddle
        const speed = 7;
        if (s.keys.w) s.paddleLeftY = Math.max(10, s.paddleLeftY - speed);
        if (s.keys.s) s.paddleLeftY = Math.min(HEIGHT - PADDLE_HEIGHT - 10, s.paddleLeftY + speed);

        // 2. Move Right Paddle (AI or Player 2)
        if (currentMode === 'VS_AI') {
          const aiSpeed = currentDifficulty === 'EASY' ? 3.5 : currentDifficulty === 'MEDIUM' ? 5.2 : 7.0;
          const paddleCenter = s.paddleRightY + PADDLE_HEIGHT / 2;
          const targetY = s.ballY;

          // AI reaction error margin
          const tolerance = currentDifficulty === 'EASY' ? 25 : currentDifficulty === 'MEDIUM' ? 12 : 4;
          if (paddleCenter < targetY - tolerance) {
            s.paddleRightY = Math.min(HEIGHT - PADDLE_HEIGHT - 10, s.paddleRightY + aiSpeed);
          } else if (paddleCenter > targetY + tolerance) {
            s.paddleRightY = Math.max(10, s.paddleRightY - aiSpeed);
          }
        } else {
          // PVP controls
          if (s.keys.ArrowUp) s.paddleRightY = Math.max(10, s.paddleRightY - speed);
          if (s.keys.ArrowDown) s.paddleRightY = Math.min(HEIGHT - PADDLE_HEIGHT - 10, s.paddleRightY + speed);
        }

        // 3. Move Ball
        s.ballX += s.ballVx;
        s.ballY += s.ballVy;

        // Top/Bottom Wall Collisions
        if (s.ballY - BALL_SIZE / 2 <= 5) {
          s.ballY = 5 + BALL_SIZE / 2;
          s.ballVy = Math.abs(s.ballVy);
          soundEffects.playWallHit();
        } else if (s.ballY + BALL_SIZE / 2 >= HEIGHT - 5) {
          s.ballY = HEIGHT - 5 - BALL_SIZE / 2;
          s.ballVy = -Math.abs(s.ballVy);
          soundEffects.playWallHit();
        }

        // Left Paddle Collision
        const paddleLeftX = 30;
        if (
          s.ballX - BALL_SIZE / 2 <= paddleLeftX + PADDLE_WIDTH &&
          s.ballX + BALL_SIZE / 2 >= paddleLeftX &&
          s.ballY >= s.paddleLeftY &&
          s.ballY <= s.paddleLeftY + PADDLE_HEIGHT &&
          s.ballVx < 0
        ) {
          s.ballX = paddleLeftX + PADDLE_WIDTH + BALL_SIZE / 2;
          s.ballSpeed = Math.min(14, s.ballSpeed + 0.35);
          const relativeIntersectY = s.paddleLeftY + PADDLE_HEIGHT / 2 - s.ballY;
          const normalizedRelativeIntersectionY = relativeIntersectY / (PADDLE_HEIGHT / 2);
          const bounceAngle = (normalizedRelativeIntersectionY * Math.PI) / 3; // max 60 deg
          s.ballVx = s.ballSpeed * Math.cos(bounceAngle);
          s.ballVy = -s.ballSpeed * Math.sin(bounceAngle);
          soundEffects.playPaddleHit();
        }

        // Right Paddle Collision
        const paddleRightX = WIDTH - 30 - PADDLE_WIDTH;
        if (
          s.ballX + BALL_SIZE / 2 >= paddleRightX &&
          s.ballX - BALL_SIZE / 2 <= paddleRightX + PADDLE_WIDTH &&
          s.ballY >= s.paddleRightY &&
          s.ballY <= s.paddleRightY + PADDLE_HEIGHT &&
          s.ballVx > 0
        ) {
          s.ballX = paddleRightX - BALL_SIZE / 2;
          s.ballSpeed = Math.min(14, s.ballSpeed + 0.35);
          const relativeIntersectY = s.paddleRightY + PADDLE_HEIGHT / 2 - s.ballY;
          const normalizedRelativeIntersectionY = relativeIntersectY / (PADDLE_HEIGHT / 2);
          const bounceAngle = (normalizedRelativeIntersectionY * Math.PI) / 3;
          s.ballVx = -s.ballSpeed * Math.cos(bounceAngle);
          s.ballVy = -s.ballSpeed * Math.sin(bounceAngle);
          soundEffects.playPaddleHit();
        }

        // Goal Check
        if (s.ballX < 0) {
          // Point for Right
          soundEffects.playScore();
          const newRight = scoreRight + 1;
          setScoreRight(newRight);
          if (newRight >= targetScore) {
            setWinner(p2Name);
            setIsPlaying(false);
            soundEffects.playDefeat();
            recordMatch({
              gameType: 'PONG',
              opponentName: p2Name,
              userScore: scoreLeft,
              opponentScore: newRight,
              result: 'DEFEAT',
            });
            onMatchComplete?.(p2Name, scoreLeft, newRight);
          } else {
            resetBall('left');
          }
        } else if (s.ballX > WIDTH) {
          // Point for Left
          soundEffects.playScore();
          const newLeft = scoreLeft + 1;
          setScoreLeft(newLeft);
          if (newLeft >= targetScore) {
            setWinner(p1Name);
            setIsPlaying(false);
            soundEffects.playLevelUp();
            recordMatch({
              gameType: 'PONG',
              opponentName: p2Name,
              userScore: newLeft,
              opponentScore: scoreRight,
              result: 'VICTORY',
            });
            onMatchComplete?.(p1Name, newLeft, scoreRight);
            addToast(`🏆 Victoire éclatante contre ${p2Name} !`, 'success');
          } else {
            resetBall('right');
          }
        }
      }

      // --- RENDERING ---
      // Background & Grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Subtle Cyber Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }

      // Middle Net Line
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      const s = stateRef.current;

      // Draw Left Paddle (Neon Violet)
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(30, s.paddleLeftY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw Right Paddle (Neon Cyan)
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(WIDTH - 30 - PADDLE_WIDTH, s.paddleRightY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw Ball (Glowing White/Pink)
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadows
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, winner, scoreLeft, scoreRight, currentMode, currentDifficulty, targetScore, p1Name, p2Name, resetBall, recordMatch, onMatchComplete, addToast]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left font-sans animate-fadeIn">
      {/* Top Controls & Scoreboard */}
      <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        {/* P1 Score */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-500/50 flex items-center justify-center font-bold text-violet-300">
            P1
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{p1Name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">Touches : W / S</span>
          </div>
          <span className="text-3xl font-black text-violet-400 ml-3 font-mono">{scoreLeft}</span>
        </div>

        {/* VS / Score Target Badge */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Objectif : {targetScore} Pts
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {isPaused ? '⏸️ EN PAUSE' : isPlaying ? '⚡ EN JEU' : 'PRÊT'}
          </span>
        </div>

        {/* P2 Score */}
        <div className="flex items-center justify-end gap-3">
          <span className="text-3xl font-black text-cyan-400 mr-3 font-mono">{scoreRight}</span>
          <div className="text-right">
            <h3 className="font-bold text-white text-sm">{p2Name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentMode === 'VS_AI' ? 'Intelligence Artificielle' : 'Touches : Haut / Bas'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-300">
            P2
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full max-w-[800px] h-auto aspect-[800/480] block"
        />

        {/* Start / Pause / Win Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-5 text-center">
            {winner ? (
              <div className="space-y-3">
                <span className="text-5xl">{winner === p1Name ? '🏆' : '💀'}</span>
                <h2 className="text-2xl font-black text-white">
                  {winner === p1Name ? 'VICTOIRE !' : 'DÉFAITE'}
                </h2>
                <p className="text-sm text-slate-300">
                  {winner} remporte la manche {scoreLeft} - {scoreRight} !
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-4xl">🏓</span>
                <h2 className="text-xl font-bold text-white">Arène Pong Classic 2D</h2>
                <p className="text-xs text-slate-400 max-w-sm">
                  Utilisez les touches <b>W / S</b> pour le joueur gauche et <b>↑ / ↓</b> pour le joueur droit.
                </p>
              </div>
            )}

            {/* Mode & Difficulty Selector before launch */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => setCurrentMode('VS_AI')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentMode === 'VS_AI' ? 'bg-violet-600 text-white' : 'text-slate-400'
                  }`}
                >
                  🤖 Vs IA
                </button>
                <button
                  onClick={() => setCurrentMode('LOCAL_PVP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentMode === 'LOCAL_PVP' ? 'bg-violet-600 text-white' : 'text-slate-400'
                  }`}
                >
                  👥 1v1 Local
                </button>
              </div>

              {currentMode === 'VS_AI' && (
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setCurrentDifficulty(d)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider ${
                        currentDifficulty === d ? 'bg-cyan-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {onExit && (
                <Button variant="secondary" size="md" onClick={onExit}>
                  Quitter
                </Button>
              )}
              <Button variant="primary" size="md" onClick={handleStartGame}>
                {winner ? 'Rejouer une partie' : 'Lancer le match !'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Game Footbar controls */}
      {isPlaying && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-2">
          <span>Espace : Mettre en pause</span>
          <button
            onClick={() => setIsPlaying(false)}
            className="text-rose-400 hover:underline cursor-pointer"
          >
            Abandonner le match
          </button>
        </div>
      )}
    </div>
  );
};

export default PongArena;

import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGame } from '../../../context/GameContext';
import { socketService } from '../../../services/socket';
import { soundEffects } from '../../../services/audio';
import type { HeroRole, MapTheme, GameOverData } from '../types';

interface OnlinePongDuelArenaProps {
  roomId?: string;
  selectedRole?: HeroRole;
  selectedMap?: MapTheme;
  opponentName?: string;
  onGameOver?: (data: GameOverData) => void;
  onQuit?: () => void;
}

export const OnlinePongDuelArena: React.FC<OnlinePongDuelArenaProps> = ({
  roomId: initialRoomId,
  selectedRole = 'SHOOTER',
  selectedMap = 'CYBER',
  opponentName = 'Adversaire',
  onGameOver,
  onQuit,
}) => {
  const { user, token } = useAuth();
  const { recordMatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'WAITING' | 'PLAYING' | 'FINISHED'>('WAITING');
  const [playerSide, setPlayerSide] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [player1Info, setPlayer1Info] = useState({ id: user?.id || 'p1', username: user?.username || 'Vous', role: selectedRole });
  const [player2Info, setPlayer2Info] = useState({ id: 'p2', username: opponentName, role: 'SLAYER' });
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const matchStartTimeRef = useRef(Date.now());

  const gameStateRef = useRef({
    ball: { x: 480, y: 270, vx: 5, vy: 0, speed: 5, radius: 8 },
    p1: { id: '', x: 60, y: 270, width: 14, height: 80, speed: 6, score: 0, hp: 100, maxHp: 100, shield: 0, stamina: 100, role: selectedRole },
    p2: { id: '', x: 900, y: 270, width: 14, height: 80, speed: 6, score: 0, hp: 100, maxHp: 100, shield: 0, stamina: 100, role: 'SLAYER' },
  });

  const keysPressed = useRef({ up: false, down: false, left: false, right: false, sprint: false });
  const seqCounter = useRef(0);

  useEffect(() => {
    if (!token) return;
    socketService.connectGame(token);

    const targetRoomId = initialRoomId || `duel_${user?.id || 'player'}_${Date.now()}`;
    socketService.sendGame('joinDuelRoom', { roomId: targetRoomId, role: selectedRole });

    const handleMatchFound = (data: any) => {
      setPlayer1Info(data.player1);
      setPlayer2Info(data.player2);
      setPlayerSide(user?.id === data.player2.id ? 'RIGHT' : 'LEFT');
      matchStartTimeRef.current = Date.now();
      setStatus('PLAYING');
      soundEffects.playPowerUp();
    };

    const handleGameSnapshot = (snapshot: any) => {
      if (snapshot.ball) gameStateRef.current.ball = snapshot.ball;
      if (snapshot.player1) gameStateRef.current.p1 = snapshot.player1;
      if (snapshot.player2) gameStateRef.current.p2 = snapshot.player2;
      if (snapshot.scores) {
        setScores(prev => {
          if (prev.p1 !== snapshot.scores.p1 || prev.p2 !== snapshot.scores.p2) soundEffects.playScore();
          return snapshot.scores;
        });
      }
    };

    const handleGameOver = (data: any) => {
      setStatus('FINISHED');
      const isWinner = (data.winner === 'PLAYER1' && playerSide === 'LEFT') || (data.winner === 'PLAYER2' && playerSide === 'RIGHT');
      if (isWinner) soundEffects.playVictory();
      else soundEffects.playDefeat();

      recordMatch({
        opponent: playerSide === 'LEFT' ? player2Info.username : player1Info.username,
        myScore: playerSide === 'LEFT' ? data.score1 : data.score2,
        opponentScore: playerSide === 'LEFT' ? data.score2 : data.score1,
        result: isWinner ? 'VICTORY' : 'DEFEAT',
        gameMode: '1v1 Online Duel',
        duration: '02:00',
        xpEarned: isWinner ? 150 : 50,
      });

      onGameOver?.({
        scoreBlue: data.score1 || scores.p1,
        scoreRed: data.score2 || scores.p2,
        winnerTeam: data.winner === 'PLAYER1' ? 'BLUE' : 'RED',
        durationSeconds: 120,
        matchDurationFormatted: '02:00',
        matchSize: '1v1',
        mode: '1v1',
        selectedMap,
        mapTheme: selectedMap,
        roundsWonBlue: data.winner === 'PLAYER1' ? 1 : 0,
        roundsWonRed: data.winner === 'PLAYER2' ? 1 : 0,
        totalRounds: 1,
        roundHistory: [],
        players: [],
      });
    };

    socketService.on('matchFound', handleMatchFound);
    socketService.on('gameSnapshot', handleGameSnapshot);
    socketService.on('gameOver', handleGameOver);

    return () => {
      socketService.off('matchFound', handleMatchFound);
      socketService.off('gameSnapshot', handleGameSnapshot);
      socketService.off('gameOver', handleGameOver);
    };
  }, [token, user?.id, initialRoomId, selectedRole, playerSide, onGameOver, recordMatch, selectedMap, player1Info.username, player2Info.username, scores.p1, scores.p2]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'z' || k === 'arrowup') keysPressed.current.up = isDown;
      if (k === 's' || k === 'arrowdown') keysPressed.current.down = isDown;
      if (k === 'a' || k === 'q' || k === 'arrowleft') keysPressed.current.left = isDown;
      if (k === 'd' || k === 'arrowright') keysPressed.current.right = isDown;
      if (e.code === 'Space' || e.shiftKey) keysPressed.current.sprint = isDown;
    };
    const onDown = (e: KeyboardEvent) => handleKey(e, true);
    const onUp = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    if (status !== 'PLAYING') return;
    const interval = setInterval(() => {
      seqCounter.current += 1;
      setElapsedTime(Math.floor((Date.now() - matchStartTimeRef.current) / 1000));
      socketService.sendGame('playerInput', {
        seq: seqCounter.current,
        ...keysPressed.current,
      });
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const { ball, p1, p2 } = gameStateRef.current;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(p1.x - p1.width / 2, p1.y - p1.height / 2, p1.width, p1.height);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(p2.x - p2.width / 2, p2.y - p2.height / 2, p2.width, p2.height);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 text-left font-sans animate-fadeIn">
      <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-400">@{player1Info.username}</span>
          <span className="text-xs text-slate-400 font-mono">({player1Info.role})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono font-black text-cyan-400">{scores.p1}</span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold shadow-inner">
            ⏱️ {formatTime(elapsedTime)}
          </span>
          <span className="text-2xl font-mono font-black text-rose-400">{scores.p2}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">({player2Info.role})</span>
          <span className="font-bold text-rose-400">@{player2Info.username}</span>
        </div>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-auto block" />
        {status === 'WAITING' && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
            <span className="text-3xl animate-spin">⏳</span>
            <p className="text-sm font-bold text-white">En attente d'un adversaire...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onQuit} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer">
          Quitter l'Arène
        </button>
      </div>
    </div>
  );
};
export default OnlinePongDuelArena;

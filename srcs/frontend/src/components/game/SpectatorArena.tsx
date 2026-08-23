import React, { useRef, useEffect, useState } from 'react';
import { soundEffects } from '../../services/audio';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface SpectatorMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  time: string;
}

interface SpectatorArenaProps {
  onExit?: () => void;
}

export const SpectatorArena: React.FC<SpectatorArenaProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [p1Score, setP1Score] = useState<number>(3);
  const [p2Score, setP2Score] = useState<number>(4);
  const [cheerCount, setCheerCount] = useState<number>(42);
  const [messages, setMessages] = useState<SpectatorMessage[]>([
    { id: '1', sender: 'Alexandre42', text: 'Incroyable smash de NeonKnight ! 🔥', time: '14:20' },
    { id: '2', sender: 'Sarah_Cyber', text: 'CyberGamer revient à égalité !', time: '14:21' },
    { id: '3', sender: 'CodeMaster', text: 'Allez P1 ! 🏓', time: '14:22' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Dimensions
  const WIDTH = 640;
  const HEIGHT = 380;

  // Physics simulation refs
  const stateRef = useRef({
    p1Y: HEIGHT / 2 - 35,
    p2Y: HEIGHT / 2 - 35,
    ballX: WIDTH / 2,
    ballY: HEIGHT / 2,
    ballVx: 6,
    ballVy: 3.5,
  });

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = stateRef.current;

      // Move paddles autonomously towards ball
      const p1Center = s.p1Y + 35;
      if (p1Center < s.ballY - 5) s.p1Y = Math.min(HEIGHT - 70, s.p1Y + 4.5);
      if (p1Center > s.ballY + 5) s.p1Y = Math.max(0, s.p1Y - 4.5);

      const p2Center = s.p2Y + 35;
      if (p2Center < s.ballY - 5) s.p2Y = Math.min(HEIGHT - 70, s.p2Y + 4.8);
      if (p2Center > s.ballY + 5) s.p2Y = Math.max(0, s.p2Y - 4.8);

      // Move Ball
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Top/Bottom walls
      if (s.ballY <= 6 || s.ballY >= HEIGHT - 6) {
        s.ballVy = -s.ballVy;
      }

      // Paddles
      if (s.ballX <= 35 && s.ballY >= s.p1Y && s.ballY <= s.p1Y + 70 && s.ballVx < 0) {
        s.ballVx = Math.abs(s.ballVx);
      }
      if (s.ballX >= WIDTH - 35 && s.ballY >= s.p2Y && s.ballY <= s.p2Y + 70 && s.ballVx > 0) {
        s.ballVx = -Math.abs(s.ballVx);
      }

      // Goals
      if (s.ballX < 0) {
        setP2Score((s) => s + 1);
        s.ballX = WIDTH / 2;
        s.ballY = HEIGHT / 2;
        s.ballVx = 6;
      }
      if (s.ballX > WIDTH) {
        setP1Score((s) => s + 1);
        s.ballX = WIDTH / 2;
        s.ballY = HEIGHT / 2;
        s.ballVx = -6;
      }

      // Render
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Net
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // P1 Paddle
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(20, s.p1Y, 10, 70);

      // P2 Paddle
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(WIDTH - 30, s.p2Y, 10, 70);

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, 5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: SpectatorMessage = {
      id: String(Date.now()),
      sender: 'Moi (Spectateur)',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
    soundEffects.playMessageSend();
  };

  const handleSendCheer = (emoji: string) => {
    setCheerCount((c) => c + 1);
    soundEffects.playClick();
    const cheerMsg: SpectatorMessage = {
      id: String(Date.now()),
      sender: 'Spectateur',
      text: `a envoyé ${emoji} !`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cheerMsg]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left font-sans animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🔴</span> Mode Spectateur en Direct • Finale Pong 42
            </h1>
            <p className="text-xs text-slate-400">14 spectateurs connectés en direct</p>
          </div>
        </div>

        {onExit && (
          <Button variant="outline" size="sm" onClick={onExit}>
            ← Retour
          </Button>
        )}
      </div>

      {/* Main Grid: Game View + Live Spectator Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Canvas & Score */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Avatar username="NeonKnight" size="sm" />
              <span className="font-bold text-xs text-violet-400">NeonKnight</span>
              <span className="font-mono text-lg font-black text-white ml-2">{p1Score}</span>
            </div>

            <span className="text-xs font-mono text-slate-500 uppercase">Manche 2/3</span>

            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-white mr-2">{p2Score}</span>
              <span className="font-bold text-xs text-cyan-400">CyberGamer</span>
              <Avatar username="CyberGamer" size="sm" />
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full h-auto aspect-[640/380] block" />
          </div>

          {/* Quick Cheer Reactions */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Envoyer une réaction en direct :</span>
            <div className="flex gap-2">
              {['🔥', '👏', '🏓', '😱', '🏆'].map((em) => (
                <button
                  key={em}
                  onClick={() => handleSendCheer(em)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-base transition-transform active:scale-125 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Spectator Chat */}
        <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 flex flex-col h-[460px] shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800">
            💬 Tchat des Spectateurs ({cheerCount} acclamations)
          </h3>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">{m.sender}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{m.time}</span>
                </div>
                <p className="text-slate-400">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Commenter le match..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <Button variant="primary" size="sm" type="submit">
              Envoyer
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpectatorArena;

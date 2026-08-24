import React, { useRef, useEffect, useState } from 'react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MOCK_SPECTATOR_COMMENTS, type MockSpectatorComment } from '../../services/mockData';

export const SpectatorArena: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score1, setScore1] = useState(4);
  const [score2, setScore2] = useState(3);
  const [spectatorCount, setSpectatorCount] = useState(42);
  const [chatMessages, setChatMessages] = useState<MockSpectatorComment[]>(MOCK_SPECTATOR_COMMENTS);
  const [userInput, setUserInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(74);

  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ballX = 350;
    let ballY = 200;
    let ballVx = 6;
    let ballVy = 3.5;
    let p1Y = 150;
    let p2Y = 150;
    const pHeight = 80;
    const pWidth = 10;
    const radius = 6;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      p1Y += (ballY - (p1Y + pHeight / 2)) * 0.12;
      p2Y += (ballY - (p2Y + pHeight / 2)) * 0.11;

      ballX += ballVx;
      ballY += ballVy;

      if (ballY - radius <= 0 || ballY + radius >= h) {
        ballVy = -ballVy;
      }

      if (ballX - radius <= 25 + pWidth && ballY >= p1Y && ballY <= p1Y + pHeight) {
        ballVx = Math.abs(ballVx);
      }

      if (ballX + radius >= w - 25 - pWidth && ballY >= p2Y && ballY <= p2Y + pHeight) {
        ballVx = -Math.abs(ballVx);
      }

      if (ballX < 0) {
        ballX = w / 2;
        ballY = h / 2;
        ballVx = 6;
        setScore2((prev) => (prev + 1) % 11);
      }
      if (ballX > w) {
        ballX = w / 2;
        ballY = h / 2;
        ballVx = -6;
        setScore1((prev) => (prev + 1) % 11);
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.shadowBlur = 12;
      ctx.shadowColor = '#8b5cf6';
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(25, p1Y, pWidth, pHeight);

      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(w - 25 - pWidth, p2Y, pWidth, pHeight);

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSendSpectatorChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newComment: MockSpectatorComment = {
      id: 'sc-' + Date.now(),
      user: 'Vous',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vous',
      text: userInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newComment]);
    setUserInput('');
  };

  const handleCheer = (cheerText: string) => {
    const newComment: MockSpectatorComment = {
      id: 'sc-' + Date.now(),
      user: 'Vous',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vous',
      text: cheerText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newComment]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full text-left">
      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="neon" size="sm" icon={<span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}>
              EN DIRECT
            </Badge>
            <h2 className="text-xl font-black text-slate-100">
              Arène Spectateur & Stream Live
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivez les matchs des meilleurs joueurs en direct et échangez avec les autres spectateurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>👁️</span> {spectatorCount} Spectateurs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-4">
          {}
          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            {}
            <div className="flex items-center gap-3">
              <Avatar username="CyberPonger" size="md" status="IN_GAME" />
              <div>
                <span className="font-bold text-sm text-violet-400 block">MasterBot_Alpha</span>
                <span className="text-[10px] text-slate-500">ELO 1890 &bull; Côté Gauche</span>
              </div>
            </div>

            {}
            <div className="text-center font-mono flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <span className="text-violet-400 font-black text-2xl">{score1}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                ⏱️ {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-pink-400 font-black text-2xl">{score2}</span>
            </div>

            {}
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="font-bold text-sm text-pink-400 block">AI_Grandmaster</span>
                <span className="text-[10px] text-slate-500">ELO 1940 &bull; Côté Droit</span>
              </div>
              <Avatar username="NeonValkyrie" size="md" status="IN_GAME" />
            </div>
          </div>

          {}
          <div className="rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl relative">
            <canvas
              ref={canvasRef}
              width={700}
              height={400}
              className="w-full max-w-full h-auto block select-none aspect-[7/4]"
            />
          </div>

          {}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 mr-2">Encourager :</span>
            <Button variant="secondary" size="sm" onClick={() => handleCheer('🔥 Allez le Joueur 1 !')}>
              🔥 Allez Joueur 1 !
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleCheer('⚡ Magnifique échange !')}>
              ⚡ Quel échange !
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleCheer('🏓 GG !')}>
              🏓 GG !
            </Button>
          </div>
        </div>

        {}
        <Card title="💬 Chat des Spectateurs" subtitle="Discutez du match en direct" className="h-[520px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5 text-xs text-left bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <Avatar username={msg.user} src={msg.avatar} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{msg.user}</span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendSpectatorChat} className="pt-3 mt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Réagir au match..."
              className="flex-1 bg-slate-950 text-xs text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
            />
            <Button variant="primary" size="sm" type="submit" disabled={!userInput.trim()}>
              Envoyer
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

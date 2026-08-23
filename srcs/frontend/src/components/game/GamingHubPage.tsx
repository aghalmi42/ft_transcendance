import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface GamingHubPageProps {
  onNavigate?: (tabId: string) => void;
  initialGame?: string;
  initialDuelRoomId?: string;
  initialOpponentName?: string;
}

export const GamingHubPage: React.FC<GamingHubPageProps> = ({
  onNavigate,
  initialGame = 'pong',
  initialDuelRoomId,
  initialOpponentName,
}) => {
  const [selectedGame, setSelectedGame] = useState<string>(initialGame);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw initial canvas placeholder / grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center divider
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [selectedGame]);

  const gameOptions = [
    { id: 'pong', label: 'Pong 2D', icon: '🏓' },
    { id: 'tictactoe', label: 'Morpion', icon: '⭕' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4 text-left font-sans animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏓</span> Arène de Jeu (Canvas)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {initialDuelRoomId
              ? `Partie en cours contre ${initialOpponentName || 'un adversaire'}`
              : 'Espace réservé pour le moteur de jeu Canvas'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {gameOptions.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedGame === g.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}

          {onNavigate && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('games')}>
              ← Retour aux Jeux
            </Button>
          )}
        </div>
      </div>

      {/* Responsive Canvas Container */}
      <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col items-center justify-center space-y-4 shadow-2xl">
        <div className="relative w-full max-w-[800px] aspect-[800/480] rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            id="transcendence-game-canvas"
            width={800}
            height={480}
            className="w-full h-full block"
          />

          {/* Canvas Placeholder Center Tag */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center space-y-2 p-4 text-center bg-black/20 backdrop-blur-[2px]">
            <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-2xl shadow-xl">
              {selectedGame === 'pong' ? '🏓' : '⭕'}
            </div>
            <h3 className="text-sm font-bold text-white">
              Emplacement du Canvas ({selectedGame.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Cet élément <code>&lt;canvas id="transcendence-game-canvas" /&gt;</code> est prêt à accueillir le moteur de rendu de votre équipe.
            </p>
          </div>
        </div>

        {/* Session Info Bar */}
        <div className="w-full max-w-[800px] p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-slate-500">Jeu : </span>
            <span className="text-white font-bold">{selectedGame}</span>
          </div>
          {initialDuelRoomId && (
            <div>
              <span className="text-slate-500">Room : </span>
              <span className="text-cyan-400 font-bold">{initialDuelRoomId}</span>
            </div>
          )}
          {initialOpponentName && (
            <div>
              <span className="text-slate-500">Adversaire : </span>
              <span className="text-violet-400 font-bold">{initialOpponentName}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Résolution : </span>
            <span className="text-slate-300">800 × 480 px (Canvas 2D/WebGL)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GamingHubPage;

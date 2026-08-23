import React from 'react';
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
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4 text-left font-sans animate-fadeIn">
      {/* Header */}
      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {initialGame === 'pong' ? '🏓 Arène de Jeu Pong' : initialGame === 'tictactoe' ? '⭕ Morpion' : '🐍 Snake'}
          </h1>
          <p className="text-xs text-slate-400">
            {initialDuelRoomId ? `Partie en cours contre ${initialOpponentName || 'un adversaire'}` : 'Espace de jeu'}
          </p>
        </div>

        {onNavigate && (
          <Button variant="outline" size="sm" onClick={() => onNavigate('games')}>
            ← Retour aux Jeux
          </Button>
        )}
      </div>

      {/* Game Placeholder Area for Teammates Integration */}
      <Card className="p-12 bg-slate-900 border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl">
          {initialGame === 'pong' ? '🏓' : initialGame === 'tictactoe' ? '⭕' : '🐍'}
        </div>

        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-white">
            Emplacement du Moteur de Jeu ({initialGame.toUpperCase()})
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cet espace est réservé pour le composant Canvas / WebGL développé par l'équipe.
          </p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 text-left max-w-lg w-full space-y-1">
          <div className="text-slate-500 font-semibold">// Informations de la session de jeu :</div>
          <div>Jeu sélectionné : <span className="text-white">{initialGame}</span></div>
          {initialDuelRoomId && <div>Room ID : <span className="text-white">{initialDuelRoomId}</span></div>}
          {initialOpponentName && <div>Adversaire : <span className="text-white">{initialOpponentName}</span></div>}
        </div>
      </Card>
    </div>
  );
};

export default GamingHubPage;

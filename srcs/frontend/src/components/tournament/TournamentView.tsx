import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { TournamentMatch } from '../../types';

interface TournamentViewProps {
  onNavigate: (tabId: string) => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { activeTournament, createTournament, advanceTournamentMatch, resetTournament } = useGame();

  const [tournName, setTournName] = useState('Tournoi Officiel Pong 42');
  const [size, setSize] = useState<4 | 8>(4);
  const [playerList, setPlayerList] = useState<string[]>([
    user ? user.username : 'Joueur 1',
    'Joueur 2',
    'Joueur 3',
    'Joueur 4',
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTournament(tournName, size, playerList.slice(0, size));
  };

  const handleSimulateMatch = (match: TournamentMatch) => {
    if (!match.player1 || !match.player2 || match.isCompleted) return;

    const isP1Win = Math.random() > 0.5;
    const score1 = isP1Win ? 5 : Math.floor(Math.random() * 4) + 1;
    const score2 = !isP1Win ? 5 : Math.floor(Math.random() * 4) + 1;

    advanceTournamentMatch(match.id, score1, score2);
  };

  const handleUpdatePlayerName = (idx: number, name: string) => {
    const updated = [...playerList];
    updated[idx] = name;
    setPlayerList(updated);
  };

  return (
    <div className="space-y-6 w-full text-left font-sans animate-fadeIn">
      {}
      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tournois Pong</h1>
          <p className="text-xs text-slate-400">Système de tournoi à élimination directe pour 4 ou 8 participants</p>
        </div>

        {activeTournament && (
          <Button variant="outline" size="sm" onClick={resetTournament}>
            Nouveau Tournoi
          </Button>
        )}
      </div>

      {!activeTournament ? (
        <Card className="max-w-2xl mx-auto p-6 bg-slate-900 border-slate-800 space-y-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Nom du Tournoi</label>
              <input
                type="text"
                value={tournName}
                onChange={(e) => setTournName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Nombre de Joueurs</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSize(4);
                    setPlayerList([user?.username || 'Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4']);
                  }}
                  className={`p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    size === 4 ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  4 Participants (Demi-finales + Finale)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSize(8);
                    setPlayerList([
                      user?.username || 'Joueur 1',
                      'Joueur 2',
                      'Joueur 3',
                      'Joueur 4',
                      'Joueur 5',
                      'Joueur 6',
                      'Joueur 7',
                      'Joueur 8',
                    ]);
                  }}
                  className={`p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    size === 8 ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  8 Participants (Quarts + Demi + Finale)
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-slate-300 block">Pseudonymes des Joueurs :</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {playerList.slice(0, size).map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleUpdatePlayerName(idx, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button variant="primary" size="md" type="submit" className="w-full mt-4">
              Créer et Démarrer le Tournoi
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeTournament.champion && (
            <div className="p-6 rounded-xl bg-slate-900 border border-emerald-800 text-center space-y-2">
              <span className="text-4xl block">🏆</span>
              <h3 className="text-lg font-bold text-emerald-300">
                VAINQUEUR DU TOURNOI : {activeTournament.champion.username} !
              </h3>
              <p className="text-xs text-slate-400">
                Félicitations au vainqueur du tournoi "{activeTournament.name}" !
              </p>
            </div>
          )}

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] flex items-stretch justify-between gap-6">
              {}
              <div className="flex-1 space-y-3">
                <div className="text-center font-bold text-xs uppercase text-slate-400 py-1 bg-slate-900 rounded-lg border border-slate-800">
                  {activeTournament.size === 8 ? 'Quarts de Finale' : 'Demi-Finales'}
                </div>
                {activeTournament.matches
                  .filter((m) => m.round === 1)
                  .map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onSimulate={() => handleSimulateMatch(match)}
                      onPlay={() => onNavigate('game')}
                    />
                  ))}
              </div>

              {}
              <div className="flex-1 space-y-3">
                <div className="text-center font-bold text-xs uppercase text-slate-400 py-1 bg-slate-900 rounded-lg border border-slate-800">
                  {activeTournament.size === 8 ? 'Demi-Finales' : 'Grande Finale'}
                </div>
                {activeTournament.matches
                  .filter((m) => m.round === 2)
                  .map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onSimulate={() => handleSimulateMatch(match)}
                      onPlay={() => onNavigate('game')}
                    />
                  ))}
              </div>

              {}
              {activeTournament.size === 8 && (
                <div className="flex-1 space-y-3">
                  <div className="text-center font-bold text-xs uppercase text-white py-1 bg-slate-900 rounded-lg border border-slate-800">
                    Grande Finale 🏆
                  </div>
                  {activeTournament.matches
                    .filter((m) => m.round === 3)
                    .map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onSimulate={() => handleSimulateMatch(match)}
                        onPlay={() => onNavigate('game')}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MatchCardProps {
  match: TournamentMatch;
  onSimulate: () => void;
  onPlay: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSimulate, onPlay }) => {
  const p1 = match.player1;
  const p2 = match.player2;

  const isReady = p1 && p2 && !match.isCompleted;

  return (
    <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
        <span className="font-mono text-slate-500">Match #{match.id}</span>
        {match.isCompleted ? (
          <span className="text-[11px] text-emerald-400 font-medium">Terminé</span>
        ) : (
          <span className="text-[11px] text-slate-400">{isReady ? 'Prêt' : 'En attente'}</span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Avatar username={p1?.username || '?'} size="xs" />
            <span className={`font-medium ${match.winner?.id === p1?.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
              {p1?.username || 'En attente...'}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-300">{match.score1 ?? '-'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Avatar username={p2?.username || '?'} size="xs" />
            <span className={`font-medium ${match.winner?.id === p2?.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
              {p2?.username || 'En attente...'}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-300">{match.score2 ?? '-'}</span>
        </div>
      </div>

      {isReady && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="primary" size="sm" onClick={onPlay}>
            Jouer
          </Button>
          <Button variant="secondary" size="sm" onClick={onSimulate}>
            Simuler
          </Button>
        </div>
      )}
    </div>
  );
};

export default TournamentView;

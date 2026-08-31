import React, { useState } from 'react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';

interface MatchHistoryPageProps {
  onNavigate?: (tabId: string) => void;
}

const getRankLabel = (rating: number): string => {
  if (rating >= 2000) return 'Grand Maître Cyber';
  if (rating >= 1700) return 'Maître Diamant';
  if (rating >= 1400) return 'Champion Platine';
  if (rating >= 1200) return 'Vétéran Or';
  return 'Recrue Argent';
};

const GAME_ICONS: Record<string, string> = {
  PONG: '🏓', TICTACTOE: '⭕', SNAKE: '🐍', QUIZ: '🧠',
};

export const MatchHistoryPage: React.FC<MatchHistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { history } = useGame();
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');

  const totalMatches = history.length;
  const victories = history.filter((m) => m.result === 'VICTORY').length;
  const defeats = history.filter((m) => m.result === 'DEFEAT').length;
  const winrate = totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0;
  const currentElo = user?.eloRating || 1000;
  const leagueTitle = getRankLabel(currentElo);

  const filteredMatches = history.filter((m) => {
    const matchGame = filterGame === 'all' || (m.gameType || '').toLowerCase() === filterGame;
    const matchRes = filterResult === 'all' || m.result === filterResult;
    return matchGame && matchRes;
  });

  return (
    <div className="space-y-6 w-full animate-fadeIn text-left">

      {}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        {}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-violet-600 to-cyan-400 p-1 shadow-lg shadow-violet-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-3xl">
                  🏆
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 text-[10px] font-mono font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full border border-violet-400">
                Niv. {user?.level || 7}
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white">@{user?.username || 'SuperPlayer42'}</h2>
                <Badge variant="purple" size="sm">{leagueTitle}</Badge>
              </div>
              <p className="text-xs font-mono text-cyan-400 font-bold mt-1">
                {currentElo} ELO / LP &bull; Rang Mondial #1
              </p>
            </div>
          </div>

          {}
          <div className="flex items-center space-x-6 bg-slate-950/80 border border-slate-800 px-6 py-3.5 rounded-2xl">
            {}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-emerald-400 font-mono">{winrate}%</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Taux de Victoire</span>
            </div>

            <div className="h-10 w-[1px] bg-slate-800"></div>

            {}
            <div className="flex flex-col space-y-1 text-xs font-mono font-bold">
              <span className="text-emerald-400">{victories}V &bull; Victoires</span>
              <span className="text-rose-400">{defeats}D &bull; Défaites</span>
              <span className="text-[10px] text-slate-500 font-normal">{totalMatches} Parties Jouées</span>
            </div>

            <div className="h-10 w-[1px] bg-slate-800"></div>

            {}
            {onNavigate && (
              <Button variant="gradient" size="sm" onClick={() => onNavigate('game')}>
                ⚔️ Jouer
              </Button>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tous les Jeux' },
            { id: 'pong', label: '🏓 Pong' },
            { id: 'tictactoe', label: '⭕ Morpion' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilterGame(f.id);
                audioService.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap ${
                filterGame === f.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterResult('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${
              filterResult === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterResult('VICTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${
              filterResult === 'VICTORY' ? 'bg-emerald-600 text-white' : 'text-emerald-400'
            }`}
          >
            Victoires
          </button>
          <button
            onClick={() => setFilterResult('DEFEAT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${
              filterResult === 'DEFEAT' ? 'bg-rose-600 text-white' : 'text-rose-400'
            }`}
          >
            Défaites
          </button>
        </div>
      </div>

      {}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-3xl">
            Aucun historique de partie trouvé avec ces filtres.
          </div>
        ) : (
          filteredMatches.map((m) => {
            const isWin = m.result === 'VICTORY';
            return (
              <div
                key={m.id}
                className={`relative flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${
                  isWin
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/80 shadow-emerald-900/10'
                    : 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/80 shadow-rose-900/10'
                }`}
              >
                {}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                    isWin ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />

                {}
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                      isWin
                        ? 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-900/40 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {GAME_ICONS[(m.gameType || '').toUpperCase()] || '🎮'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-black uppercase font-mono tracking-wider px-2 py-0.5 rounded-md ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isWin ? 'VICTOIRE' : 'DÉFAITE'}
                      </span>
                      <span className="text-xs font-bold text-white">{m.gameType || 'Partie'}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-1">
                      <span>{m.gameMode}</span>
                      {m.duration && (<><span>&bull;</span><span>⏱️ {m.duration}</span></>)}
                      <span>&bull;</span>
                      <span>{m.date}</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex items-center space-x-6 my-3 md:my-0">
                  {}
                  <div className="flex items-center space-x-2 font-mono font-black text-xl bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-800">
                    <span className={isWin ? 'text-emerald-400' : 'text-slate-300'}>
                      {m.myScore}
                    </span>
                    {m.opponentScore !== undefined && (
                      <>
                        <span className="text-slate-600">:</span>
                        <span className={!isWin ? 'text-rose-400' : 'text-slate-400'}>
                          {m.opponentScore}
                        </span>
                      </>
                    )}
                  </div>

                  {}
                  {m.opponentName && (
                    <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <span className="text-sm">👤</span>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-200">@{m.opponentName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {}
                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-end font-mono">
                    <span className="text-[10px] text-violet-400 font-semibold">+{m.xpEarned || 0} XP</span>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('game')}
                      title="Lancer une revanche"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 text-xs font-bold transition-all shadow-sm"
                    >
                      Revanche ⚔️
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatchHistoryPage;

import React, { useState } from 'react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { audioService } from '../../services/audio';

export interface MatchRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  result: 'VICTORY' | 'DEFEAT';
  mode: 'Classé 1v1' | 'Tournoi Knockout' | 'Duel Amical' | 'Solo Score Attack';
  myScore: number;
  opponentScore?: number;
  opponentName?: string;
  opponentAvatar?: string;
  opponentLevel?: number;
  duration: string;
  lpChange: number;
  xpEarned: number;
  date: string;
  kdaOrRatio?: string;
}

interface MatchHistoryPageProps {
  onNavigate?: (tabId: string) => void;
}

export const MatchHistoryPage: React.FC<MatchHistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');

  // LoL-Style Match History data
  const [matches] = useState<MatchRecord[]>([
    {
      id: 'm-101',
      gameId: 'pong',
      gameTitle: 'Pong 2D Classic',
      gameIcon: '🏓',
      result: 'VICTORY',
      mode: 'Classé 1v1',
      myScore: 5,
      opponentScore: 2,
      opponentName: 'NeonKnight',
      opponentAvatar: '🛡️',
      opponentLevel: 12,
      duration: '3m 45s',
      lpChange: +28,
      xpEarned: 150,
      date: 'Il y a 15 min',
      kdaOrRatio: '71% précision',
    },
    {
      id: 'm-102',
      gameId: 'tron',
      gameTitle: 'Tron Lightcycles',
      gameIcon: '🏍️',
      result: 'VICTORY',
      mode: 'Tournoi Knockout',
      myScore: 3,
      opponentScore: 1,
      opponentName: 'ShadowStriker',
      opponentAvatar: '⚡',
      opponentLevel: 9,
      duration: '4m 10s',
      lpChange: +35,
      xpEarned: 200,
      date: 'Il y a 1h',
      kdaOrRatio: 'Vitesse max: 320 km/h',
    },
    {
      id: 'm-103',
      gameId: 'pong',
      gameTitle: 'Pong 2D Classic',
      gameIcon: '🏓',
      result: 'DEFEAT',
      mode: 'Classé 1v1',
      myScore: 4,
      opponentScore: 5,
      opponentName: 'CyberBot_X',
      opponentAvatar: '🤖',
      opponentLevel: 15,
      duration: '6m 20s',
      lpChange: -18,
      xpEarned: 50,
      date: 'Il y a 3h',
      kdaOrRatio: 'Match serré',
    },
    {
      id: 'm-104',
      gameId: 'snake',
      gameTitle: 'Cyber Snake Neon',
      gameIcon: '🐍',
      result: 'VICTORY',
      mode: 'Solo Score Attack',
      myScore: 1420,
      duration: '5m 12s',
      lpChange: +15,
      xpEarned: 100,
      date: 'Hier',
      kdaOrRatio: 'Record Personnel',
    },
    {
      id: 'm-105',
      gameId: 'brickbattle',
      gameTitle: 'Brickbattle (Breakout)',
      gameIcon: '🧱',
      result: 'VICTORY',
      mode: 'Solo Score Attack',
      myScore: 2800,
      duration: '4m 30s',
      lpChange: +20,
      xpEarned: 120,
      date: 'Hier',
      kdaOrRatio: 'Grille 100% détruite',
    },
    {
      id: 'm-106',
      gameId: 'morpion',
      gameTitle: 'Morpion Minimax',
      gameIcon: '🕹️',
      result: 'DEFEAT',
      mode: 'Duel Amical',
      myScore: 1,
      opponentScore: 2,
      opponentName: 'AlgoMaster',
      opponentAvatar: '🧠',
      opponentLevel: 14,
      duration: '2m 15s',
      lpChange: 0,
      xpEarned: 40,
      date: 'Il y a 2 jours',
    },
    {
      id: 'm-107',
      gameId: 'spaceinvaders',
      gameTitle: 'Space Invaders 42',
      gameIcon: '🚀',
      result: 'VICTORY',
      mode: 'Solo Score Attack',
      myScore: 3650,
      duration: '7m 45s',
      lpChange: +25,
      xpEarned: 180,
      date: 'Il y a 3 jours',
    },
  ]);

  // Overall Stats Calculation
  const totalMatches = matches.length;
  const victories = matches.filter((m) => m.result === 'VICTORY').length;
  const defeats = matches.filter((m) => m.result === 'DEFEAT').length;
  const winrate = totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0;
  const currentElo = 2450;
  const leagueTitle = 'Diamant II';

  const filteredMatches = matches.filter((m) => {
    const matchGame = filterGame === 'all' || m.gameId === filterGame;
    const matchRes = filterResult === 'all' || m.result === filterResult;
    return matchGame && matchRes;
  });

  return (
    <div className="space-y-6 w-full animate-fadeIn text-left">

      {/* Header Dashboard Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* User Rank & Summary */}
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

          {/* Winrate Stats Box (LoL Style) */}
          <div className="flex items-center space-x-6 bg-slate-950/80 border border-slate-800 px-6 py-3.5 rounded-2xl">
            {/* Winrate Circular Pill */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-emerald-400 font-mono">{winrate}%</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Taux de Victoire</span>
            </div>

            <div className="h-10 w-[1px] bg-slate-800"></div>

            {/* Wins & Losses Counts */}
            <div className="flex flex-col space-y-1 text-xs font-mono font-bold">
              <span className="text-emerald-400">{victories}V &bull; Victoires</span>
              <span className="text-rose-400">{defeats}D &bull; Défaites</span>
              <span className="text-[10px] text-slate-500 font-normal">{totalMatches} Parties Jouées</span>
            </div>

            <div className="h-10 w-[1px] bg-slate-800"></div>

            {/* Action */}
            {onNavigate && (
              <Button variant="gradient" size="sm" onClick={() => onNavigate('game')}>
                ⚔️ Jouer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tous les Jeux' },
            { id: 'pong', label: '🏓 Pong 2D' },
            { id: 'tron', label: '🏍️ Tron' },
            { id: 'snake', label: '🐍 Snake' },
            { id: 'brickbattle', label: '🧱 Casse-Briques' },
            { id: 'spaceinvaders', label: '🚀 Space Invaders' },
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

      {/* LoL-Style Match Cards List */}
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
                {/* Left Result Indicator Stripe */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                    isWin ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />

                {/* Match Game & Status Column */}
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                      isWin
                        ? 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-900/40 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {m.gameIcon}
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
                      <span className="text-xs font-bold text-white">{m.gameTitle}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-1">
                      <span>{m.mode}</span>
                      <span>&bull;</span>
                      <span>⏱️ {m.duration}</span>
                      <span>&bull;</span>
                      <span>{m.date}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Score & Opponent Info */}
                <div className="flex items-center space-x-6 my-3 md:my-0">
                  {/* Score */}
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

                  {/* Opponent pill */}
                  {m.opponentName && (
                    <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <span className="text-sm">{m.opponentAvatar || '👤'}</span>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-200">@{m.opponentName}</span>
                        <span className="text-[9px] font-mono text-slate-500">Niv. {m.opponentLevel || 1}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: LP Gain & Action */}
                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-end font-mono">
                    <span
                      className={`text-xs font-black ${
                        m.lpChange > 0 ? 'text-emerald-400' : m.lpChange < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {m.lpChange > 0 ? `+${m.lpChange} LP` : m.lpChange < 0 ? `${m.lpChange} LP` : '0 LP'}
                    </span>
                    <span className="text-[10px] text-violet-400 font-semibold">+{m.xpEarned} XP</span>
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

export const MatchRecord = {};
export default MatchHistoryPage;

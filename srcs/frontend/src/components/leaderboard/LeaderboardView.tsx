import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Table, type Column } from '../common/Table';
import type { LeaderboardEntry, User } from '../../types';
import { PublicUserProfileModal } from '../profile/PublicUserProfileModal';

interface LeaderboardViewProps {
  onNavigate: (tabId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onNavigate }) => {
  const { sendGameChallenge } = useChat();
  const [search, setSearch] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(() => api.getLeaderboardSync());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    api.getLeaderboard().then((data) => {
      if (Array.isArray(data)) setLeaderboardData(data);
    }).catch(() => {});
  }, []);

  const filtered = leaderboardData.filter((entry) =>
    entry.user.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = leaderboardData.slice(0, 3);

  const columns: Column<LeaderboardEntry>[] = [
    {
      header: 'Rang',
      align: 'center',
      render: (entry) => (
        <span
          className={`font-black font-mono text-sm ${
            entry.rank === 1
              ? 'text-amber-400'
              : entry.rank === 2
              ? 'text-slate-300'
              : entry.rank === 3
              ? 'text-amber-600'
              : 'text-slate-500'
          }`}
        >
          #{entry.rank}
        </span>
      ),
    },
    {
      header: 'Joueur',
      render: (entry) => (
        <div
          onClick={() => setSelectedUser(entry.user)}
          className="flex items-center gap-3 cursor-pointer group"
          title={`Visiter le profil de ${entry.user.username}`}
        >
          <Avatar username={entry.user.username} src={entry.user.avatar} size="sm" status={entry.user.status} />
          <div>
            <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-400 group-hover:underline block transition-colors">{entry.user.username}</span>
            <span className="text-[10px] text-slate-400">Niveau {entry.user.level || 1} • Cliquez pour voir</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Classement ELO',
      align: 'center',
      render: (entry) => (
        <span className="font-mono font-bold text-xs text-violet-400 bg-violet-950/40 px-2 py-1 rounded-md border border-violet-800/40">
          {entry.rating} ELO
        </span>
      ),
    },
    {
      header: 'V / D',
      align: 'center',
      render: (entry) => (
        <span className="font-mono text-xs text-slate-300">
          <strong className="text-emerald-400">{entry.wins}</strong> / <strong className="text-rose-400">{entry.losses}</strong>
        </span>
      ),
    },
    {
      header: 'Taux de Victoire',
      align: 'center',
      render: (entry) => (
        <Badge variant={entry.winRate >= 70 ? 'success' : entry.winRate >= 50 ? 'info' : 'warning'} size="sm">
          {entry.winRate}%
        </Badge>
      ),
    },
    {
      header: 'Série',
      align: 'center',
      render: (entry) => (
        <span className="font-mono text-xs text-amber-400 font-bold">
          🔥 {entry.streak}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (entry) => (
        <Button
          variant="neon"
          size="sm"
          onClick={() => {
            sendGameChallenge(entry.user.id, 'PONG');
            onNavigate('game');
          }}
          leftIcon={<span>🏓</span>}
        >
          Défier
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full text-left">

      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span>🏅</span> Classement Général & ELO
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tableau des meilleurs joueurs de la saison Pong & compétitions ft_transcendence.
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer par joueur..."
          className="w-full sm:w-64 bg-slate-950 text-xs text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-violet-500"
        />
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {}
        {top3[1] && (
          <Card
            hoverEffect
            className="text-center order-2 sm:order-1 border-slate-700/80 bg-slate-900/70 p-5"
          >
            <div className="relative inline-block mb-2">
              <Avatar username={top3[1].user.username} src={top3[1].user.avatar} size="lg" status={top3[1].user.status} />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900">
                2
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-100">{top3[1].user.username}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{top3[1].rating} ELO &bull; {top3[1].winRate}% Victoires</p>
          </Card>
        )}

        {}
        {top3[0] && (
          <Card
            hoverEffect
            glowColor="purple"
            className="text-center order-1 sm:order-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-slate-900/90 p-6 sm:-translate-y-2 shadow-2xl shadow-amber-500/10"
          >
            <div className="relative inline-block mb-2">
              <Avatar username={top3[0].user.username} src={top3[0].user.avatar} size="xl" status={top3[0].user.status} />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                👑
              </span>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
                1
              </span>
            </div>
            <h4 className="font-black text-base text-amber-300">{top3[0].user.username}</h4>
            <p className="text-xs text-amber-200/80 mt-0.5 font-bold">{top3[0].rating} ELO &bull; {top3[0].wins} Victoires</p>
            <Badge variant="warning" size="sm" className="mt-2">
              Champion en titre
            </Badge>
          </Card>
        )}

        {}
        {top3[2] && (
          <Card
            hoverEffect
            className="text-center order-3 sm:order-3 border-slate-700/80 bg-slate-900/70 p-5"
          >
            <div className="relative inline-block mb-2">
              <Avatar username={top3[2].user.username} src={top3[2].user.avatar} size="lg" status={top3[2].user.status} />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-slate-900">
                3
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-100">{top3[2].user.username}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{top3[2].rating} ELO &bull; {top3[2].winRate}% Victoires</p>
          </Card>
        )}
      </div>

      {}
      <Card title="📊 Tableau Complet des Joueurs" subtitle="Mise à jour en temps réel après chaque match enregistré">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.rank}
        />
      </Card>

      {}
      <PublicUserProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};

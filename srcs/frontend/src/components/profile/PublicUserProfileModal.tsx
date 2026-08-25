import React, { useState } from 'react';
import type { User, GameMatchHistory } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { MOCK_MATCH_HISTORY } from '../../services/mockData';
import { soundEffects } from '../../services/audio';

interface PublicUserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDuel?: (roomId?: string, opponentName?: string) => void;
  onNavigate?: (tabId: string) => void;
}

export const PublicUserProfileModal: React.FC<PublicUserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onStartDuel,
  onNavigate,
}) => {
  const { user: currentUser } = useAuth();
  const { setActiveFriendId, sendGameChallenge } = useChat();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'ACHIEVEMENTS'>('OVERVIEW');

  if (!isOpen || !user) return null;

  const isSelf = currentUser?.id === user.id;
  const totalMatches = (user.wins || 0) + (user.losses || 0);
  const winRate = totalMatches > 0 ? (((user.wins || 0) / totalMatches) * 100).toFixed(1) : '0';
  const elo = user.eloRating || 1200 + (user.wins || 0) * 18 - (user.losses || 0) * 12;

  const userMatches: GameMatchHistory[] = MOCK_MATCH_HISTORY.filter(
    (m) => m.opponentName === user.username
  );

  const handleSendMessage = () => {
    setActiveFriendId(user.id);
    onClose();
    if (onNavigate) onNavigate('chat');
    soundEffects.playClick();
  };

  const handleChallengeGame = (gameType: string) => {
    soundEffects.playPowerUp();
    onClose();
    if (onStartDuel) {
      onStartDuel(`duel-${user.id}-${Date.now()}`, user.username);
    } else if (onNavigate) {
      onNavigate(gameType);
    }
    sendGameChallenge(user.id, gameType.toUpperCase());
    addToast(`Invitation de défi envoyée à ${user.username} !`, 'info');
  };

  const getRankBadge = (rating: number) => {
    if (rating >= 2000) return { label: 'Grand Maître Cyber', color: 'bg-rose-950 text-rose-300 border-rose-500/50', icon: '👑' };
    if (rating >= 1700) return { label: 'Maître Diamant', color: 'bg-cyan-950 text-cyan-300 border-cyan-500/50', icon: '💎' };
    if (rating >= 1400) return { label: 'Champion Platine', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/50', icon: '🏆' };
    if (rating >= 1200) return { label: 'Vétéran Or', color: 'bg-amber-950 text-amber-300 border-amber-500/50', icon: '🥇' };
    return { label: 'Recrue Argent', color: 'bg-slate-900 text-slate-300 border-slate-700', icon: '🥈' };
  };

  const rank = getRankBadge(elo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative overflow-hidden">
        {}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-cyan-950/60 via-indigo-950/60 to-purple-950/60 -z-0" />

        {}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
        >
          ✕
        </button>

        {}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-4">
          <div className="relative">
            <Avatar username={user.username} src={user.avatar} size="xl" />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-950 ${
                user.status === 'ONLINE' ? 'bg-emerald-500' : user.status === 'IN_GAME' ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black text-white">{user.username}</h2>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${rank.color}`}>
                <span>{rank.icon}</span>
                <span>{rank.label}</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {user.bio || 'Joueur compétitif sur la plateforme ft_transcendence.'}
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Niveau <strong className="text-white">{user.level || 1}</strong></span>
              <span>•</span>
              <span>ELO <strong className="text-cyan-400">{elo}</strong></span>
              <span>•</span>
              <span>Statut : <strong className={user.status === 'ONLINE' ? 'text-emerald-400' : user.status === 'IN_GAME' ? 'text-amber-400' : 'text-slate-500'}>{user.status}</strong></span>
            </div>
          </div>
        </div>

        {}
        {!isSelf && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <button
              onClick={() => handleChallengeGame('pong')}
              className="py-2.5 px-3 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>🏓 Duel Pong</span>
            </button>

            <button
              onClick={() => handleChallengeGame('shootactoe')}
              className="py-2.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>🚀 ShooTacToe</span>
            </button>

            <button
              onClick={() => handleChallengeGame('snakeouttheflag')}
              className="py-2.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>🐍 Snake CTF</span>
            </button>

            <button
              onClick={handleSendMessage}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>💬 Message</span>
            </button>
          </div>
        )}

        {}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Statistiques
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORY' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚔️ Historique de Matchs
          </button>
          <button
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'ACHIEVEMENTS' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎖️ Succès & Rangs
          </button>
        </div>

        {}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Parties Jouées</span>
                <span className="text-lg font-black text-white">{totalMatches}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Victoires</span>
                <span className="text-lg font-black text-emerald-400">{user.wins || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Défaites</span>
                <span className="text-lg font-black text-rose-400">{user.losses || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Taux de Victoire</span>
                <span className="text-lg font-black text-cyan-400">{winRate}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300">Spécialisation de Jeux :</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-base block">🏓</span>
                  <span className="font-bold text-white">Pong RPG</span>
                  <span className="text-[10px] text-cyan-400 block">{user.wins || 0}W - {user.losses || 0}L</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-base block">🚀</span>
                  <span className="font-bold text-white">ShooTacToe</span>
                  <span className="text-[10px] text-cyan-400 block">Dominion 60 FPS</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-base block">🐍</span>
                  <span className="font-bold text-white">Snake CTF</span>
                  <span className="text-[10px] text-emerald-400 block">Castle Wars</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'HISTORY' && (
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {userMatches.length > 0 ? (
              userMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{m.gameType === 'PONG' ? '🏓' : '🚀'}</span>
                    <div>
                      <span className="font-bold text-white block">vs {m.opponentName}</span>
                      <span className="text-[10px] text-slate-500">{m.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-black ${m.result === 'VICTORY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.result === 'VICTORY' ? 'VICTOIRE' : 'DÉFAITE'} ({(m.myScore ?? m.userScore ?? 0)} - {m.opponentScore ?? 0})
                    </span>
                    <span className="text-[10px] text-slate-500 block">+{m.xpEarned || 50} XP</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                Aucun match récent enregistré pour ce joueur.
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'ACHIEVEMENTS' && (
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <span className="text-xl">🌟</span>
              <div>
                <span className="font-bold text-white block">Premier Sang</span>
                <span className="text-[10px] text-slate-400">Première victoire en match</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <span className="text-xl">🚀</span>
              <div>
                <span className="font-bold text-white block">As de l'Espace</span>
                <span className="text-[10px] text-slate-400">Alignement 4v4 sur ShooTacToe</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <span className="text-xl">🚩</span>
              <div>
                <span className="font-bold text-white block">Voleur de Drapeau</span>
                <span className="text-[10px] text-slate-400">Capture dans Snake Castle Wars</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <span className="text-xl">🛡️</span>
              <div>
                <span className="font-bold text-white block">Rempart Imprenable</span>
                <span className="text-[10px] text-slate-400">Match parfait sans but encaissé</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicUserProfileModal;

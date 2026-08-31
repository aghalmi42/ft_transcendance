import React, { useState, useEffect } from 'react';
import type { User, Friendship } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Tabs } from '../common/Tabs';
import { InviteFriendsModal } from './InviteFriendsModal';
import { PlatoChallengeModal, type ChallengeGameType } from '../chat/PlatoChallengeModal';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import { soundEffects } from '../../services/audio';

interface FriendsListProps {
  onNavigate: (tabId: string) => void;
  onStartDuel?: (roomId?: string, opponentName?: string, gameType?: string, role?: 'host' | 'guest') => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onNavigate, onStartDuel }) => {
  const { user } = useAuth();
  const { setActiveFriendId, sendGameChallenge, blockedUserIds, toggleBlockUser } = useChat();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('friends');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [selectedChallengeUser, setSelectedChallengeUser] = useState<User | null>(null);

  const loadData = async () => {
    try {
      const [u, f] = await Promise.all([api.getUsers(), api.getFriends()]);
      setAllUsers(u || []);
      setFriendships(f || []);
    } catch {}
  };

  useEffect(() => {
    loadData();
    const handlePresence = (data: { userId: string; status: any }) => {
      setAllUsers(prev => prev.map(u => u.id === data.userId ? { ...u, status: data.status } : u));
    };
    socketService.on('presenceUpdate', handlePresence);
    return () => { socketService.off('presenceUpdate', handlePresence); };
  }, []);

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      await api.sendFriendRequest(receiverId);
      addToast("Demande d'ami envoyée !", 'success');
      loadData();
    } catch {
      addToast('Erreur ou demande déjà existante.', 'error');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      addToast("Demande d'ami acceptée !", 'success');
      loadData();
    } catch {
      addToast("Erreur lors de l'acceptation.", 'error');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.declineFriendRequest(requestId);
      addToast('Demande refusée.', 'info');
      loadData();
    } catch {
      addToast('Erreur lors du refus.', 'error');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await api.removeFriend(friendId);
      addToast('Ami retiré de votre liste.', 'info');
      loadData();
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    }
  };

  const handleSendChallenge = async (
    gameType: ChallengeGameType,
    options?: { targetScore?: number; powerUps?: boolean }
  ) => {
    if (!selectedChallengeUser) return;
    const opponent = selectedChallengeUser;
    const roomId = await sendGameChallenge(opponent.id, gameType, options);
    soundEffects.playPowerUp();

    if (roomId && onStartDuel) {
      onStartDuel(roomId, opponent.username, gameType, 'host');
    } else {
      addToast(`Défi ${gameType} envoyé à @${opponent.username} !`, 'success');
      onNavigate('chat');
    }
  };

  const otherUsers = allUsers.filter(u => user && u.id !== user.id && !blockedUserIds.includes(u.id));
  const confirmedFriends = otherUsers.filter(u =>
    friendships.some(f => f.status === 'ACCEPTED' && ((f.sender?.id === u.id && f.receiver?.id === user?.id) || (f.receiver?.id === u.id && f.sender?.id === user?.id)))
  );
  const pendingReceived = friendships.filter(f => f.status === 'PENDING' && f.receiver?.id === user?.id);

  return (
    <div className="space-y-6 w-full text-left font-sans animate-fadeIn">
      {isInviteOpen && <InviteFriendsModal onClose={() => setIsInviteOpen(false)} />}
      {isChallengeOpen && selectedChallengeUser && (
        <PlatoChallengeModal
          targetUser={selectedChallengeUser}
          isOpen={isChallengeOpen}
          onClose={() => setIsChallengeOpen(false)}
          onSendChallenge={handleSendChallenge}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="text-2xl">👥</span> Espace Amis & Duels
          </h2>
          <p className="text-xs text-slate-400">Ajoutez des amis, discutez et lancez des duels en direct.</p>
        </div>
        <Button variant="neon" size="md" onClick={() => setIsInviteOpen(true)} leftIcon={<span>➕</span>}>
          Inviter des amis
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'friends', label: `Mes Amis (${confirmedFriends.length})` },
          { id: 'all', label: `Tous les Joueurs (${otherUsers.length})` },
          { id: 'pending', label: 'Demandes reçues', count: pendingReceived.length },
          { id: 'blocked', label: 'Bloqués', count: blockedUserIds.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {confirmedFriends.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-2">
              <span className="text-3xl block">🤝</span>
              <p className="font-bold text-white">Aucun ami pour le moment</p>
              <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>+ Trouver des amis</Button>
            </div>
          ) : (
            confirmedFriends.map(player => (
              <Card key={player.id} className="flex items-center justify-between gap-4 p-4 border-slate-800 bg-slate-900/80 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar username={player.username} src={player.avatar} size="lg" status={player.status} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{player.username}</span>
                      <Badge variant={player.status === 'ONLINE' ? 'success' : 'slate'} size="sm">
                        {player.status === 'ONLINE' ? 'En ligne' : 'Hors ligne'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{player.bio || 'Joueur'}</p>
                    <div className="flex gap-2 text-[11px] font-mono text-slate-400 mt-1">
                      <span className="text-amber-400 font-bold">{player.eloRating || 1000} ELO</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{player.wins || 0}V</span>
                      <span>/</span>
                      <span className="text-rose-400">{player.losses || 0}D</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button variant="neon" size="sm" onClick={() => { setSelectedChallengeUser(player); setIsChallengeOpen(true); }} leftIcon={<span>⚔️</span>}>
                    Duel
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => { setActiveFriendId(player.id); onNavigate('chat'); }}>
                      💬
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFriend(player.id)}>
                      ✕
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherUsers.map(player => {
            const isFriend = confirmedFriends.some(f => f.id === player.id);
            return (
              <Card key={player.id} className="flex items-center justify-between p-4 border-slate-800 bg-slate-900/80 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar username={player.username} src={player.avatar} size="md" status={player.status} />
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-white truncate block">@{player.username}</span>
                    <span className="text-xs text-slate-400 truncate block">{player.bio || 'Joueur'}</span>
                  </div>
                </div>
                {isFriend ? (
                  <span className="text-xs text-emerald-400 font-bold">✓ Ami</span>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleSendFriendRequest(player.id)}>
                    + Ajouter
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingReceived.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Aucune demande reçue.</p>
          ) : (
            pendingReceived.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Avatar username={req.sender?.username || 'Inconnu'} src={req.sender?.avatar} size="md" />
                  <span className="text-sm font-bold text-white">@{req.sender?.username}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(req.id)}>Accepter</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeclineRequest(req.id)}>Refuser</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="space-y-3">
          {blockedUserIds.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Aucun utilisateur bloqué.</p>
          ) : (
            blockedUserIds.map(id => {
              const u = allUsers.find(x => x.id === id);
              return (
                <div key={id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-sm text-slate-300">@{u?.username || id}</span>
                  <Button variant="ghost" size="sm" onClick={() => toggleBlockUser(id)}>Débloquer</Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
export default FriendsList;

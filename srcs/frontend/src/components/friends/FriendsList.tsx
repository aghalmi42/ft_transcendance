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
import { PlatoChallengeModal } from '../chat/PlatoChallengeModal';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import { soundEffects } from '../../services/audio';

interface FriendsListProps {
  onNavigate: (tabId: string) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { setActiveFriendId, sendGameChallenge, blockedUserIds, toggleBlockUser } = useChat();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('friends');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [selectedChallengeUser, setSelectedChallengeUser] = useState<User | null>(null);

  // Load real users and friends from API
  const loadData = async () => {
    try {
      const [usersData, friendsData] = await Promise.all([
        api.getUsers(),
        api.getFriends(),
      ]);
      setAllUsers(usersData || []);
      setFriendships(friendsData || []);
    } catch {
      // Fallback handled
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time presence changes
    const handlePresence = (data: { userId: string; status: any }) => {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, status: data.status } : u))
      );
    };

    socketService.on('presenceUpdate', handlePresence);
    return () => {
      socketService.off('presenceUpdate', handlePresence);
    };
  }, []);

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      await api.sendFriendRequest(receiverId);
      addToast('Demande d\'ami envoyée avec succès !', 'success');
      loadData();
    } catch {
      addToast('Erreur ou demande déjà existante.', 'error');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      addToast('Demande d\'ami acceptée !', 'success');
      loadData();
    } catch {
      addToast('Erreur lors de l\'acceptation.', 'error');
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

  const handleOpenDuel = (targetUser: User) => {
    setSelectedChallengeUser(targetUser);
    setIsChallengeOpen(true);
  };

  const handleSendChallenge = (gameType: 'PONG' | 'TICTACTOE' | 'SNAKE' | 'QUIZ', options?: { targetScore?: number }) => {
    if (!selectedChallengeUser) return;
    sendGameChallenge(selectedChallengeUser.id, gameType, options);
    soundEffects.playPowerUp();
    addToast(`Défi ${gameType} envoyé à @${selectedChallengeUser.username} !`, 'success');
    onNavigate('chat');
  };

  const handleStartChat = (targetUserId: string) => {
    setActiveFriendId(targetUserId);
    soundEffects.playClick();
    onNavigate('chat');
  };

  // Other users (excluding self and blocked)
  const otherUsers = allUsers.filter((u) => {
    if (user && u.id === user.id) return false;
    if (blockedUserIds.includes(u.id)) return false;
    return true;
  });

  // Confirmed friends
  const confirmedFriends = otherUsers.filter((u) =>
    friendships.some(
      (f) =>
        f.status === 'ACCEPTED' &&
        ((f.sender?.id === u.id && f.receiver?.id === user?.id) ||
         (f.receiver?.id === u.id && f.sender?.id === user?.id))
    )
  );

  const pendingReceived = friendships.filter(
    (f) => f.status === 'PENDING' && f.receiver?.id === user?.id
  );

  return (
    <div className="space-y-6 w-full text-left font-sans animate-fadeIn">
      {/* Header Banner with Plato-Style CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="text-2xl">👥</span> Espace Amis & Duels Plato
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Ajoutez vos camarades, discutez en direct et défiez-les sur les différents jeux (Pong 1v1, Tic-Tac-Toe, Snake) comme sur Plato !
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="neon"
            size="md"
            onClick={() => setIsInviteOpen(true)}
            leftIcon={<span>➕</span>}
            className="w-full sm:w-auto justify-center"
          >
            Inviter des amis
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'friends', label: `Mes Amis (${confirmedFriends.length})` },
          { id: 'all', label: `Tous les Joueurs (${otherUsers.length})` },
          { id: 'pending', label: 'Demandes reçues', count: pendingReceived.length },
          { id: 'blocked', label: 'Bloqués', count: blockedUserIds.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
      />

      {/* Tab: Mes Amis */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {confirmedFriends.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
              <span className="text-4xl block">🤝</span>
              <h3 className="font-bold text-base text-slate-200">Vous n'avez pas encore d'amis ajoutés</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Invitez vos camarades avec un lien d'invitation ou recherchez des joueurs inscrits pour lancer vos premiers duels !
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>
                  + Trouver des amis
                </Button>
              </div>
            </div>
          ) : (
            confirmedFriends.map((player) => (
              <Card
                key={player.id}
                hoverEffect={true}
                className="flex items-center justify-between gap-4 p-4 border-slate-800 bg-slate-900/80 rounded-2xl"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar
                    username={player.username}
                    src={player.avatar}
                    size="lg"
                    status={player.status}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {player.username}
                      </span>
                      <Badge
                        variant={
                          player.status === 'IN_GAME'
                            ? 'purple'
                            : player.status === 'ONLINE'
                            ? 'success'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {player.status === 'IN_GAME'
                          ? 'En Match'
                          : player.status === 'ONLINE'
                          ? 'En ligne'
                          : 'Hors ligne'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[220px]">
                      {player.bio || 'Joueur ft_transcendence'}
                    </p>
                    <div className="flex items-center gap-2.5 mt-2 text-[11px] font-mono text-slate-400">
                      <span className="text-amber-400 font-bold">{player.eloRating || 1000} ELO</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{player.wins || 0}V</span>
                      <span>/</span>
                      <span className="text-rose-400">{player.losses || 0}D</span>
                    </div>
                  </div>
                </div>

                {/* Quick Plato Action Buttons */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => handleOpenDuel(player)}
                    leftIcon={<span>⚔️</span>}
                  >
                    Défier 1v1
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStartChat(player.id)}
                    leftIcon={<span>💬</span>}
                  >
                    Discuter
                  </Button>

                  <button
                    onClick={() => handleRemoveFriend(player.id)}
                    className="text-[10px] text-slate-500 hover:text-rose-400 font-mono transition-colors text-center pt-0.5"
                  >
                    Retirer ami
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Tous les Joueurs */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherUsers.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              Aucun autre joueur inscrit pour le moment.
            </div>
          ) : (
            otherUsers.map((player) => {
              const isFriend = confirmedFriends.some((f) => f.id === player.id);
              return (
                <Card
                  key={player.id}
                  hoverEffect={true}
                  className="flex items-center justify-between gap-4 p-4 border-slate-800 bg-slate-900/70 rounded-2xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      username={player.username}
                      src={player.avatar}
                      size="lg"
                      status={player.status}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {player.username}
                        </span>
                        <Badge
                          variant={
                            player.status === 'IN_GAME'
                              ? 'purple'
                              : player.status === 'ONLINE'
                              ? 'success'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {player.status === 'IN_GAME'
                            ? 'En Match'
                            : player.status === 'ONLINE'
                            ? 'En ligne'
                            : 'Hors ligne'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[200px]">
                        {player.bio || 'Joueur ft_transcendence'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-mono">
                        <span className="text-amber-400 font-bold">{player.eloRating || 1000} ELO</span>
                        <span>•</span>
                        <span>{player.wins || 0}V / {player.losses || 0}D</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => handleOpenDuel(player)}
                      leftIcon={<span>⚔️</span>}
                    >
                      Défier
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartChat(player.id)}
                      leftIcon={<span>💬</span>}
                    >
                      Chat
                    </Button>

                    {!isFriend && (
                      <button
                        onClick={() => handleSendFriendRequest(player.id)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors pt-0.5 text-center"
                      >
                        + Ajouter ami
                      </button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Demandes Reçues */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingReceived.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs bg-slate-900/30 rounded-3xl border border-slate-800">
              Aucune demande d'ami en attente.
            </div>
          ) : (
            pendingReceived.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    username={req.sender?.username || 'Joueur'}
                    src={req.sender?.avatar}
                    size="md"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-100">
                      {req.sender?.username || 'Joueur'}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Souhaite vous ajouter à sa liste d'amis
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    Accepter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeclineRequest(req.id)}
                  >
                    Refuser
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Utilisateurs Bloqués */}
      {activeTab === 'blocked' && (
        <div className="space-y-3">
          {blockedUserIds.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs bg-slate-900/30 rounded-3xl border border-slate-800">
              Vous n'avez bloqué aucun utilisateur.
            </div>
          ) : (
            blockedUserIds.map((userId) => {
              const blocked = allUsers.find((u) => u.id === userId) || {
                id: userId,
                username: 'Utilisateur Bloqué',
                avatar: undefined,
              };
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-rose-950/40"
                >
                  <div className="flex items-center gap-3">
                    <Avatar username={blocked.username} src={blocked.avatar} size="md" />
                    <div>
                      <span className="font-bold text-sm text-slate-200">{blocked.username}</span>
                      <span className="text-xs text-rose-400 block">Bloqué (messages et duels désactivés)</span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleBlockUser(userId)}
                  >
                    Débloquer
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <InviteFriendsModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        users={allUsers}
        friendships={friendships}
        onFriendshipUpdated={loadData}
        onNavigateToChat={handleStartChat}
        onChallengePlayer={(userId) => {
          const target = allUsers.find((u) => u.id === userId);
          if (target) handleOpenDuel(target);
        }}
      />

      <PlatoChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        targetUser={selectedChallengeUser}
        onSendChallenge={handleSendChallenge}
      />
    </div>
  );
};

export default FriendsList;

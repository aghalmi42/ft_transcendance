import React, { useState } from 'react';
import type { User, Friendship } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  friendships: Friendship[];
  onFriendshipUpdated?: () => void;
  onNavigateToChat?: (userId: string) => void;
  onChallengePlayer?: (userId: string) => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  users,
  friendships,
  onFriendshipUpdated,
  onNavigateToChat,
  onChallengePlayer,
}) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'search' | 'link' | 'requests'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}?invite=${encodeURIComponent(user?.username || 'player')}`
    : 'https://ft-transcendence.42.fr/invite';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    addToast('Lien d\'invitation copié dans le presse-papier !', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendRequest = async (receiverId: string) => {
    setLoadingId(receiverId);
    try {
      await api.sendFriendRequest(receiverId);
      addToast('Demande d\'ami envoyée !', 'success');
      if (onFriendshipUpdated) onFriendshipUpdated();
    } catch {
      addToast('Erreur ou demande déjà en cours.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      addToast('Demande d\'ami acceptée !', 'success');
      if (onFriendshipUpdated) onFriendshipUpdated();
    } catch {
      addToast('Erreur lors de l\'acceptation.', 'error');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.declineFriendRequest(requestId);
      addToast('Demande refusée.', 'info');
      if (onFriendshipUpdated) onFriendshipUpdated();
    } catch {
      addToast('Erreur lors du refus.', 'error');
    }
  };

  // Filter users excluding self
  const filteredUsers = users.filter((u) => {
    if (user && u.id === user.id) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const pendingReceived = friendships.filter(
    (f) => f.status === 'PENDING' && f.receiver?.id === user?.id
  );

  const isFriend = (targetId: string) => {
    return friendships.some(
      (f) =>
        f.status === 'ACCEPTED' &&
        ((f.sender?.id === targetId && f.receiver?.id === user?.id) ||
         (f.receiver?.id === targetId && f.sender?.id === user?.id))
    );
  };

  const isPendingSent = (targetId: string) => {
    return friendships.some(
      (f) =>
        f.status === 'PENDING' &&
        f.sender?.id === user?.id &&
        f.receiver?.id === targetId
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="👥 Inviter des Amis & Joueurs"
      maxWidth="lg"
    >
      <div className="space-y-4 text-left font-sans">
        {/* Navigation Tabs inside modal */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🔍 Rechercher un joueur
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'link'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🔗 Partager un lien
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Demandes reçues</span>
            {pendingReceived.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {pendingReceived.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Search Players */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            <Input
              placeholder="Rechercher par pseudo (ex: player42, pong_master)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              leftIcon={
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />

            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Aucun joueur trouvé correspondant à votre recherche.
                </div>
              ) : (
                filteredUsers.map((target) => {
                  const alreadyFriend = isFriend(target.id);
                  const pendingSent = isPendingSent(target.id);

                  return (
                    <div
                      key={target.id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          username={target.username}
                          src={target.avatar}
                          size="md"
                          status={target.status}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100 truncate">
                              {target.username}
                            </span>
                            <Badge
                              variant={
                                target.status === 'IN_GAME'
                                  ? 'purple'
                                  : target.status === 'ONLINE'
                                  ? 'success'
                                  : 'slate'
                              }
                              size="sm"
                            >
                              {target.status === 'IN_GAME'
                                ? 'En Match'
                                : target.status === 'ONLINE'
                                ? 'En ligne'
                                : 'Hors ligne'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {target.bio || 'Joueur ft_transcendence'} • {target.wins || 0}V / {target.losses || 0}D
                          </p>
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Plato Duel button */}
                        {onChallengePlayer && (
                          <Button
                            variant="neon"
                            size="sm"
                            onClick={() => {
                              onChallengePlayer(target.id);
                              onClose();
                            }}
                            title="Provoquer en duel 1v1"
                          >
                            ⚔️ Duel
                          </Button>
                        )}

                        {/* Direct chat */}
                        {onNavigateToChat && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              onNavigateToChat(target.id);
                              onClose();
                            }}
                            title="Envoyer un message"
                          >
                            💬
                          </Button>
                        )}

                        {/* Friendship button */}
                        {alreadyFriend ? (
                          <span className="text-[11px] font-semibold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            ✓ Ami
                          </span>
                        ) : pendingSent ? (
                          <span className="text-[11px] font-semibold text-amber-400 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            ⏳ En attente
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSendRequest(target.id)}
                            isLoading={loadingId === target.id}
                          >
                            + Inviter
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Share Invite Link */}
        {activeTab === 'link' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl">
                  🚀
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Invitez vos amis avec votre lien personnel
                  </h4>
                  <p className="text-xs text-slate-400">
                    Partagez ce lien à vos camarades de 42 ou amis pour les inviter et jouer ensemble !
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-transparent text-xs text-violet-300 font-mono focus:outline-none select-all"
                />
                <Button
                  variant={copied ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? '✓ Copié !' : 'Copier le lien'}
                </Button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-3.5 bg-violet-950/20 border border-violet-500/20 rounded-xl text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-violet-300">💡 Conseil pour tester en local à 2 joueurs :</p>
              <p className="text-slate-400 leading-relaxed">
                Ouvrez une fenêtre de <strong>navigation privée</strong>, créez un second compte (ex: <em>adversaire42</em>), et ajoutez-le en ami pour tester les duels et le chat en direct !
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Pending Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {pendingReceived.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Aucune demande d'ami en attente.
              </div>
            ) : (
              pendingReceived.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
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
      </div>
    </Modal>
  );
};

export default InviteFriendsModal;

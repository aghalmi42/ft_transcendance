import React, { useState, useEffect } from 'react';
import type { User, Friendship } from '../../types';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

export interface InviteFriendsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users?: User[];
  friendships?: Friendship[];
  onFriendshipUpdated?: () => void;
  onNavigateToChat?: (userId: string) => void;
  onChallengePlayer?: (userId: string) => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen = true,
  onClose,
  users: propUsers,
  friendships: propFriendships,
  onFriendshipUpdated,
}) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'search' | 'link'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<User[]>(propUsers || []);
  const [, setFriendships] = useState<Friendship[]>(propFriendships || []);

  useEffect(() => {
    if (!propUsers || !propFriendships) {
      Promise.all([api.getUsers(), api.getFriends()]).then(([u, f]) => {
        if (Array.isArray(u)) setUsers(u);
        if (Array.isArray(f)) setFriendships(f);
      }).catch(() => {});
    }
  }, [propUsers, propFriendships]);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}?invite=${encodeURIComponent(user?.username || 'player')}`
    : 'https://ft-transcendence.42.fr/invite';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    addToast("Lien d'invitation copié !", 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      await api.sendFriendRequest(receiverId);
      addToast("Demande d'ami envoyée !", 'success');
      onFriendshipUpdated?.();
    } catch {
      addToast('Erreur ou demande déjà existante.', 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.id !== user?.id && u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inviter des Amis">
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'search' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            🔍 Rechercher un joueur
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'link' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            🔗 Lien de partage
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="space-y-3">
            <input
              type="text" placeholder="Entrez un pseudo..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Avatar username={player.username} src={player.avatar} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-white block">@{player.username}</span>
                      <span className="text-[10px] text-slate-400 block">{player.bio || 'Joueur'}</span>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleSendFriendRequest(player.id)}>
                    + Ajouter
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-xs text-slate-300">Partagez ce lien direct avec vos camarades :</p>
            <div className="flex gap-2">
              <input
                type="text" readOnly value={inviteLink}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl"
              />
              <Button variant="neon" size="sm" onClick={handleCopyLink}>
                {copied ? '✓ Copié' : 'Copier'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default InviteFriendsModal;

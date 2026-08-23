import React, { useState } from 'react';
import type { User } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useChat } from '../../context/ChatContext';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddFriend: (userId: string) => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddFriend,
}) => {
  const { sendGameChallenge, setActiveFriendId } = useChat();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔍 Trouver des Joueurs"
      maxWidth="md"
    >
      <div className="space-y-4">
        <Input
          placeholder="Rechercher par pseudo ou adresse email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              Aucun joueur trouvé avec ce pseudo
            </div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar username={u.username} src={u.avatar} size="md" status={u.status} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{u.username}</span>
                      <Badge variant="purple" size="sm">
                        Niv. {u.level || 1}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                      {u.bio || 'Joueur ft_transcendence'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveFriendId(u.id);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                    title="Envoyer un message"
                  >
                    💬
                  </button>
                  <button
                    onClick={() => sendGameChallenge(u.id, 'PONG')}
                    className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 text-xs transition-colors"
                    title="Défier au Pong"
                  >
                    🏓
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAddFriend(u.id)}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { soundEffects } from '../../services/audio';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import type { User, Friendship } from '../../types';
import { InviteFriendsModal } from '../friends/InviteFriendsModal';
import { PlatoChallengeModal, type ChallengeGameType } from './PlatoChallengeModal';
import { MOCK_PUBLIC_ROOMS as PUBLIC_ROOMS } from '../../services/mockData';

export const ChatView: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    messages, channelMessages, activeFriendId, setActiveFriendId,
    sendMessage, sendChannelMessage, sendGameChallenge, toggleBlockUser, isUserBlocked,
  } = useChat();
  const { addToast } = useNotification();

  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [, setFriendships] = useState<Friendship[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('room_general');
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('CHAT');
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'online' | 'rooms'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeTargetUser, setChallengeTargetUser] = useState<User | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([api.getUsers(), api.getFriends()]).then(([u, f]) => {
      if (Array.isArray(u)) setRealUsers(u);
      if (Array.isArray(f)) setFriendships(f);
    }).catch(() => {});

    const handlePresence = (data: { userId: string; status: any }) => {
      setRealUsers(prev => prev.map(u => u.id === data.userId ? { ...u, status: data.status } : u));
    };
    socketService.on('presenceUpdate', handlePresence);
    return () => { socketService.off('presenceUpdate', handlePresence); };
  }, []);

  useEffect(() => {
    if (activeFriendId) setSelectedTarget(activeFriendId);
  }, [activeFriendId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, channelMessages, selectedTarget]);

  const otherUsers = realUsers.filter(u => u.id !== user?.id);
  const filteredUsers = otherUsers.filter(u => {
    if (searchQuery.trim() && !u.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTab === 'online' && u.status !== 'ONLINE' && u.status !== 'IN_GAME') return false;
    return true;
  });

  const isRoom = selectedTarget.startsWith('room_');
  const activeRoomId = isRoom ? selectedTarget.replace('room_', '') : null;
  const activeRoom = PUBLIC_ROOMS.find(r => r.id === activeRoomId);
  const activeUser = !isRoom ? realUsers.find(u => u.id === selectedTarget) : null;
  const isSelectedBlocked = activeUser ? isUserBlocked(activeUser.id) : false;

  const handleSelectContact = (userId: string) => {
    setSelectedTarget(userId);
    setActiveFriendId(userId);
    setMobileView('CHAT');
    soundEffects.playClick();
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedTarget(`room_${roomId}`);
    setActiveFriendId(null);
    setMobileView('CHAT');
    soundEffects.playClick();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isRoom && activeRoomId) {
      sendChannelMessage(activeRoomId, inputText.trim());
      soundEffects.playClick();
    } else if (activeUser) {
      if (isSelectedBlocked) {
        addToast("Impossible d'envoyer un message à un utilisateur bloqué.", 'error');
        return;
      }
      sendMessage(activeUser.id, inputText.trim());
      soundEffects.playClick();
    }
    setInputText('');
  };

  const handleOpenChallenge = (targetUser?: User) => {
    const target = targetUser || activeUser;
    if (!target) return;
    setChallengeTargetUser(target);
    setIsChallengeModalOpen(true);
  };

  const handleSendPlatoChallenge = (
    gameType: ChallengeGameType,
    options?: { targetScore?: number; powerUps?: boolean }
  ) => {
    if (!challengeTargetUser) return;
    sendGameChallenge(challengeTargetUser.id, gameType, options);
    soundEffects.playPowerUp();
  };

  const activeDirectMessages = messages.filter(
    m => activeUser && ((m.senderId === user?.id && m.receiverId === activeUser.id) || (m.senderId === activeUser.id && m.receiverId === user?.id))
  );

  const activeRoomMessages = channelMessages.filter(
    m => activeRoomId && (m.channelId === activeRoomId || (!m.channelId && activeRoomId === 'general'))
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] w-full flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-sans text-left animate-fadeIn">
      {isInviteModalOpen && <InviteFriendsModal onClose={() => setIsInviteModalOpen(false)} />}
      {isChallengeModalOpen && challengeTargetUser && (
        <PlatoChallengeModal
          targetUser={challengeTargetUser}
          isOpen={isChallengeModalOpen}
          onClose={() => setIsChallengeModalOpen(false)}
          onSendChallenge={handleSendPlatoChallenge}
        />
      )}

      <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xl">💬</div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>Messagerie & Duels Plato</span>
              <span className="text-[10px] bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded-full font-mono">Direct</span>
            </h2>
            <p className="text-xs text-slate-400">Discutez, invitez vos amis et défiez-les en duel direct !</p>
          </div>
        </div>
        <Button variant="neon" size="sm" onClick={() => setIsInviteModalOpen(true)} leftIcon={<span>👥</span>}>
          Inviter
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-80 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 ${mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-slate-800/80 space-y-2.5">
            <input
              type="text" placeholder="Rechercher..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 text-xs border border-slate-800 focus:outline-none focus:border-violet-500"
            />
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl">
              {(['all', 'online', 'rooms'] as const).map(tab => (
                <button
                  key={tab} onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${filterTab === tab ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {tab === 'all' ? 'Tous' : tab === 'online' ? 'En Ligne' : 'Salons'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {(filterTab === 'all' || filterTab === 'rooms') && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">Salons</span>
                <div className="space-y-1">
                  {PUBLIC_ROOMS.map(room => (
                    <div
                      key={room.id} onClick={() => handleSelectRoom(room.id)}
                      className={`p-2.5 rounded-2xl flex items-center gap-2.5 cursor-pointer transition-all ${selectedTarget === `room_${room.id}` ? 'bg-violet-600 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'}`}
                    >
                      <span className="text-xl">{room.icon}</span>
                      <div className="min-w-0 text-left">
                        <span className="text-xs font-bold truncate block">{room.name}</span>
                        <span className="text-[10px] truncate block text-slate-400">{room.topic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(filterTab === 'all' || filterTab === 'online') && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">Joueurs ({filteredUsers.length})</span>
                <div className="space-y-1">
                  {filteredUsers.map(player => (
                    <div
                      key={player.id} onClick={() => handleSelectContact(player.id)}
                      className={`p-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${selectedTarget === player.id ? 'bg-slate-900 border border-violet-500/80' : 'hover:bg-slate-900/60 border border-transparent'}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar username={player.username} src={player.avatar} size="md" status={player.status} />
                        <div className="min-w-0 text-left">
                          <span className="text-xs font-bold text-white truncate block">@{player.username}</span>
                          <span className="text-[10px] text-slate-400 truncate block">{player.bio || 'Joueur'}</span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleOpenChallenge(player); }}
                        className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs"
                      >
                        ⚔️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col bg-slate-950/80 overflow-hidden ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
            {isRoom ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeRoom?.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeRoom?.name}</h3>
                  <p className="text-xs text-slate-400">{activeRoom?.topic}</p>
                </div>
              </div>
            ) : activeUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Avatar username={activeUser.username} src={activeUser.avatar} size="md" status={activeUser.status} />
                  <div>
                    <h3 className="text-sm font-bold text-white">@{activeUser.username}</h3>
                    <Badge variant={activeUser.status === 'ONLINE' ? 'success' : 'slate'} size="sm">
                      {activeUser.status === 'ONLINE' ? 'En ligne' : 'Hors ligne'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="neon" size="sm" onClick={() => handleOpenChallenge(activeUser)} leftIcon={<span>⚔️</span>}>
                    Duel
                  </Button>
                  <Button variant={isSelectedBlocked ? 'primary' : 'ghost'} size="sm" onClick={() => toggleBlockUser(activeUser.id)}>
                    {isSelectedBlocked ? 'Débloquer' : '🚫'}
                  </Button>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Sélectionnez une discussion</span>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {(isRoom ? activeRoomMessages : activeDirectMessages).map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-sm ${isMe ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                    <p className="text-xs">{msg.content}</p>
                    {msg.isGameInvite && (
                      <button onClick={() => onNavigate('game')} className="mt-2 w-full py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded cursor-pointer">
                        Rejoindre le Match 🏓
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">{msg.timestamp || 'Maintenant'}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-slate-800 flex gap-2">
            <input
              type="text" placeholder="Écrire un message..."
              value={inputText} onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500"
            />
            <Button type="submit" variant="primary" size="md">
              Envoyer
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ChatView;

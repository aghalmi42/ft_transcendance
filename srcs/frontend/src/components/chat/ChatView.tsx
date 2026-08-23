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
import { PlatoChallengeModal } from './PlatoChallengeModal';

interface ChatViewProps {
  onNavigate: (tabId: string) => void;
}

interface PublicRoom {
  id: string;
  name: string;
  icon: string;
  topic: string;
}

const PUBLIC_ROOMS: PublicRoom[] = [
  {
    id: 'general',
    name: 'Salon Général',
    icon: '🌐',
    topic: 'Discussion globale entre tous les joueurs de ft_transcendence',
  },
  {
    id: 'tournaments',
    name: 'Arène Duels & Tournois',
    icon: '🏆',
    topic: 'Trouvez un adversaire pour un duel Pong classé 1v1',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    messages,
    channelMessages,
    activeFriendId,
    setActiveFriendId,
    sendMessage,
    sendChannelMessage,
    sendGameChallenge,
    toggleBlockUser,
    isUserBlocked,
  } = useChat();
  const { addToast } = useNotification();

  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('room_general'); // 'room_general' or user.id
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'online' | 'rooms'>('all');

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [challengeTargetUser, setChallengeTargetUser] = useState<User | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load registered users and friendships
  const loadData = async () => {
    try {
      const [usersData, friendsData] = await Promise.all([
        api.getUsers(),
        api.getFriends(),
      ]);
      if (Array.isArray(usersData)) setRealUsers(usersData);
      if (Array.isArray(friendsData)) setFriendships(friendsData);
    } catch {
      // Fallback handled
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time presence changes
    const handlePresence = (data: { userId: string; status: any }) => {
      setRealUsers((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, status: data.status } : u))
      );
    };

    socketService.on('presenceUpdate', handlePresence);
    return () => {
      socketService.off('presenceUpdate', handlePresence);
    };
  }, []);

  // When activeFriendId changes from another component (e.g. FriendsList), select that conversation
  useEffect(() => {
    if (activeFriendId) {
      setSelectedTarget(activeFriendId);
    }
  }, [activeFriendId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, channelMessages, selectedTarget]);

  // Other users list (excluding self)
  const otherUsers = realUsers.filter((u) => u.id !== user?.id);

  // Filtered users according to search & tab
  const filteredUsers = otherUsers.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!u.username.toLowerCase().includes(q)) return false;
    }
    if (filterTab === 'online') {
      return u.status === 'ONLINE' || u.status === 'IN_GAME';
    }
    return true;
  });

  const isRoom = selectedTarget.startsWith('room_');
  const activeRoomId = isRoom ? selectedTarget.replace('room_', '') : null;
  const activeRoom = PUBLIC_ROOMS.find((r) => r.id === activeRoomId);
  const activeUser = !isRoom ? realUsers.find((u) => u.id === selectedTarget) : null;

  const isSelectedBlocked = activeUser ? isUserBlocked(activeUser.id) : false;

  const handleSelectContact = (userId: string) => {
    setSelectedTarget(userId);
    setActiveFriendId(userId);
    soundEffects.playClick();
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedTarget(`room_${roomId}`);
    setActiveFriendId(null);
    soundEffects.playClick();
  };

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isRoom && activeRoomId) {
      sendChannelMessage(activeRoomId, inputText.trim());
      soundEffects.playClick();
    } else if (activeUser) {
      if (isSelectedBlocked) {
        addToast('Impossible d\'envoyer un message à un utilisateur bloqué.', 'error');
        return;
      }
      sendMessage(activeUser.id, inputText.trim());
      soundEffects.playClick();
    }

    setInputText('');
  };

  // Open Plato duel challenge modal
  const handleOpenChallenge = (targetUser?: User) => {
    const target = targetUser || activeUser;
    if (!target) return;
    setChallengeTargetUser(target);
    setIsChallengeModalOpen(true);
  };

  // Dispatch game challenge
  const handleSendPlatoChallenge = (
    gameType: 'PONG' | 'TICTACTOE' | 'SNAKE' | 'QUIZ',
    options?: { targetScore?: number }
  ) => {
    if (!challengeTargetUser) return;
    sendGameChallenge(challengeTargetUser.id, gameType, options);
    soundEffects.playPowerUp();
  };

  // Accept a game challenge received in chat
  const handleAcceptDuel = (_roomId?: string, _opponentName?: string) => {
    addToast(`⚔️ Défi accepté ! Connexion à l'arène de Pong...`, 'success');
    soundEffects.playPowerUp();
    onNavigate('game');
  };

  // Direct messages with the active user
  const activeDirectMessages = messages.filter(
    (m) =>
      activeUser &&
      ((m.senderId === user?.id && m.receiverId === activeUser.id) ||
       (m.senderId === activeUser.id && m.receiverId === user?.id))
  );

  // Channel messages for the active room
  const activeRoomMessages = channelMessages.filter(
    (m) => activeRoomId && (m.channelId === activeRoomId || (!m.channelId && activeRoomId === 'general'))
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] w-full flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-sans text-left animate-fadeIn">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3 flex items-center justify-between gap-4 flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/20">
            💬
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>Messagerie & Duels Plato</span>
              <span className="text-[10px] bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded-full font-mono border border-violet-500/40">
                Temps Réel
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Discutez, invitez vos amis et provoquez-les en duel direct !
            </p>
          </div>
        </div>

        {/* Global Action: Inviter des amis */}
        <div className="flex items-center gap-2">
          <Button
            variant="neon"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<span>👥</span>}
          >
            Inviter des amis
          </Button>
        </div>
      </div>

      {/* Main 2-Column Chat Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Conversations, Friends & Salons */}
        <div className="w-72 sm:w-80 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
          {/* Search and Tabs */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un ami, un salon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl pl-8 pr-3 py-2 text-xs border border-slate-800 focus:outline-none focus:border-violet-500"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-slate-500">🔍</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'online', label: 'En Ligne' },
                { id: 'rooms', label: 'Salons' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    filterTab === tab.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List Scrollable */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
            {/* Public Salons */}
            {(filterTab === 'all' || filterTab === 'rooms') && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                  Salons Publics
                </span>
                <div className="space-y-1">
                  {PUBLIC_ROOMS.map((room) => {
                    const isSelected = selectedTarget === `room_${room.id}`;
                    return (
                      <div
                        key={room.id}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/20'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl flex-shrink-0">{room.icon}</span>
                          <div className="min-w-0 text-left">
                            <span className="text-xs font-bold truncate block">{room.name}</span>
                            <span
                              className={`text-[10px] truncate block ${
                                isSelected ? 'text-violet-200' : 'text-slate-400'
                              }`}
                            >
                              {room.topic}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Friends & Players */}
            {(filterTab === 'all' || filterTab === 'online') && (
              <div>
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Amis & Joueurs ({filteredUsers.length})
                  </span>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>

                <div className="space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs bg-slate-900/30 rounded-xl">
                      Aucun joueur trouvé.
                    </div>
                  ) : (
                    filteredUsers.map((player) => {
                      const isSelected = selectedTarget === player.id;
                      const isBlocked = isUserBlocked(player.id);

                      // Get last direct message with this player
                      const lastMsg = [...messages]
                        .reverse()
                        .find(
                          (m) =>
                            (m.senderId === player.id && m.receiverId === user?.id) ||
                            (m.senderId === user?.id && m.receiverId === player.id)
                        );

                      return (
                        <div
                          key={player.id}
                          onClick={() => handleSelectContact(player.id)}
                          className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all group ${
                            isSelected
                              ? 'bg-slate-900 border border-violet-500/80 shadow-lg shadow-violet-500/10'
                              : 'hover:bg-slate-900/60 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              username={player.username}
                              src={player.avatar}
                              size="md"
                              status={player.status}
                            />
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                  {player.username}
                                </span>
                                {isBlocked && (
                                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                                    Bloqué
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 truncate block">
                                {lastMsg ? lastMsg.content : player.bio || 'Joueur ft_transcendence'}
                              </span>
                            </div>
                          </div>

                          {/* Quick duel button on hover */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChallenge(player);
                              }}
                              className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs transition-colors"
                              title="Provoquer en duel Plato ⚔️"
                            >
                              ⚔️
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Active Status Footer */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar username={user?.username || 'Moi'} src={user?.avatar} size="sm" status="ONLINE" />
              <span className="font-bold text-slate-200 truncate">@{user?.username || 'Moi'}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              En Ligne
            </span>
          </div>
        </div>

        {/* Right / Center Chat Pane */}
        <div className="flex-1 flex flex-col bg-slate-950/80 overflow-hidden">
          {/* Active Conversation Header */}
          <div className="px-5 py-3 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
            {isRoom ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeRoom?.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-white">{activeRoom?.name}</h3>
                  <p className="text-xs text-slate-400">{activeRoom?.topic}</p>
                </div>
              </div>
            ) : activeUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Avatar
                    username={activeUser.username}
                    src={activeUser.avatar}
                    size="md"
                    status={activeUser.status}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">@{activeUser.username}</h3>
                      <Badge
                        variant={
                          activeUser.status === 'IN_GAME'
                            ? 'purple'
                            : activeUser.status === 'ONLINE'
                            ? 'success'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {activeUser.status === 'IN_GAME'
                          ? 'En Match'
                          : activeUser.status === 'ONLINE'
                          ? 'En ligne'
                          : 'Hors ligne'}
                      </Badge>
                      <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {activeUser.eloRating || 1000} ELO
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {activeUser.bio || 'Joueur ft_transcendence'} • {activeUser.wins || 0} Victoires
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons on Active Friend */}
                <div className="flex items-center gap-2">
                  {/* Plato Challenge Button */}
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => handleOpenChallenge(activeUser)}
                    leftIcon={<span>⚔️</span>}
                  >
                    Défier en Duel
                  </Button>

                  {/* Block / Unblock */}
                  <Button
                    variant={isSelectedBlocked ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => toggleBlockUser(activeUser.id)}
                  >
                    {isSelectedBlocked ? 'Débloquer' : '🚫 Bloquer'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Sélectionnez une discussion</div>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
            {/* When in a Room */}
            {isRoom && (
              <>
                {activeRoomMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-12">
                    <span className="text-4xl">{activeRoom?.icon}</span>
                    <p className="font-bold text-slate-300">Bienvenue dans {activeRoom?.name}</p>
                    <p className="text-xs text-slate-500">Soyez le premier à envoyer un message à la communauté !</p>
                  </div>
                ) : (
                  activeRoomMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const isSystem = msg.senderId === 'system';

                    if (isSystem) {
                      return (
                        <div
                          key={msg.id}
                          className="p-3 bg-violet-950/30 border border-violet-500/30 rounded-2xl text-center text-violet-300 font-medium text-xs my-2"
                        >
                          {msg.content}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <Avatar username={msg.senderName} src={msg.senderAvatar} size="sm" />
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl break-words text-xs leading-relaxed ${
                              isMe
                                ? 'bg-violet-600 text-white rounded-tr-none'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* When in 1v1 Direct Message */}
            {!isRoom && activeUser && (
              <>
                {activeDirectMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 py-12">
                    <Avatar username={activeUser.username} src={activeUser.avatar} size="xl" status={activeUser.status} />
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">
                        Conversation avec @{activeUser.username}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Envoyez un message ou lancez un défi Pong 1v1 pour commencer à jouer !
                      </p>
                    </div>

                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => handleOpenChallenge(activeUser)}
                      leftIcon={<span>⚔️</span>}
                    >
                      Lancer un duel 1v1
                    </Button>
                  </div>
                ) : (
                  activeDirectMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;

                    // Render Plato Game Challenge Card
                    if (msg.isGameInvite) {
                      const gameType = msg.gameInviteDetails?.gameType || 'PONG';
                      const targetScore = msg.gameInviteDetails?.targetScore || 5;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-2`}
                        >
                          <div className="max-w-md w-full p-4 rounded-3xl bg-gradient-to-br from-violet-950/80 to-slate-900 border border-violet-500/50 shadow-xl shadow-violet-500/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">
                                  {gameType === 'TICTACTOE' ? '⭕' : gameType === 'SNAKE' ? '🐍' : '🏓'}
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-white uppercase tracking-wider">
                                    Défi Plato 1v1 • {gameType}
                                  </h5>
                                  <span className="text-[10px] text-violet-300">
                                    Match en {targetScore} points
                                  </span>
                                </div>
                              </div>
                              <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                En Direct
                              </span>
                            </div>

                            <p className="text-xs text-slate-200">
                              <strong>{isMe ? 'Vous avez' : `@${activeUser.username} a`}</strong> provoqué un duel !
                            </p>

                            {!isMe ? (
                              <div className="flex items-center gap-2 pt-1">
                                <Button
                                  variant="neon"
                                  size="sm"
                                  onClick={() => handleAcceptDuel(msg.gameInviteDetails?.roomId, activeUser.username)}
                                  leftIcon={<span>⚔️</span>}
                                  className="w-full justify-center"
                                >
                                  Accepter & Jouer
                                </Button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-violet-300 italic bg-violet-950/40 p-2 rounded-xl border border-violet-500/20 text-center">
                                En attente de la réponse de @{activeUser.username}...
                              </div>
                            )}

                            <span className="text-[9px] text-slate-500 font-mono block text-right">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Standard User Message Bubble
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl max-w-[80%] break-words text-xs leading-relaxed ${
                            isMe
                              ? 'bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/10'
                              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex-shrink-0">
            {isSelectedBlocked ? (
              <div className="flex items-center justify-between p-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
                <span>Cet utilisateur est bloqué. Débloquez-le pour pouvoir échanger.</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => activeUser && toggleBlockUser(activeUser.id)}
                >
                  Débloquer
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Plato Quick Duel shortcut button */}
                {!isRoom && activeUser && (
                  <button
                    type="button"
                    onClick={() => handleOpenChallenge(activeUser)}
                    className="p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold border border-violet-500/30 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    title="Lancer un duel Plato ⚔️"
                  >
                    <span>⚔️</span>
                    <span className="hidden sm:inline">Défier</span>
                  </button>
                )}

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isRoom
                      ? `Écrire dans le ${activeRoom?.name}...`
                      : activeUser
                      ? `Écrire à @${activeUser.username}...`
                      : 'Tapez votre message...'
                  }
                  className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs border border-slate-800 focus:outline-none focus:border-violet-500"
                />

                <Button type="submit" variant="gradient" size="sm" className="font-bold flex-shrink-0">
                  Envoyer ↵
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        users={realUsers}
        friendships={friendships}
        onFriendshipUpdated={loadData}
        onNavigateToChat={(userId) => {
          setSelectedTarget(userId);
          setActiveFriendId(userId);
        }}
        onChallengePlayer={(userId) => {
          const target = realUsers.find((u) => u.id === userId);
          if (target) {
            handleOpenChallenge(target);
          }
        }}
      />

      {/* Plato Challenge Modal */}
      <PlatoChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        targetUser={challengeTargetUser}
        onSendChallenge={handleSendPlatoChallenge}
      />
    </div>
  );
};

export default ChatView;

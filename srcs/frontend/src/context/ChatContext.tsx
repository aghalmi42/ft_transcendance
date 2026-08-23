import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { socketService } from '../services/socket';

export interface ActiveDuelInvite {
  id: string;
  senderName: string;
  gameType: string;
  roomId?: string;
  opponentId?: string;
  targetScore?: number;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isGameInvite?: boolean;
  gameInviteDetails?: any;
}

interface ChatContextType {
  messages: ChatMessage[];
  channelMessages: ChannelMessage[];
  activeFriendId: string | null;
  setActiveFriendId: (id: string | null) => void;
  sendMessage: (receiverId: string, content: string, isGameInvite?: boolean, inviteDetails?: any) => void;
  sendChannelMessage: (channelId: string, content: string) => void;
  blockedUserIds: string[];
  toggleBlockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  sendGameChallenge: (
    receiverId: string,
    gameType: 'PONG' | 'TICTACTOE' | 'SNAKE' | 'QUIZ',
    options?: { targetScore?: number }
  ) => void;
  activeInvite: ActiveDuelInvite | null;
  clearActiveInvite: () => void;
  acceptGameChallenge: (invite: { roomId?: string; opponentName?: string; gameType?: string }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [activeInvite, setActiveInvite] = useState<ActiveDuelInvite | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>([
    {
      id: 'chan-init-1',
      channelId: 'general',
      senderId: 'system',
      senderName: 'ft_transcendence Bot 🤖',
      content: 'Bienvenue sur le Salon Général ! Discutez en direct ou lancez des défis Pong 1v1 avec vos camarades ! 🏓',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Initialize WebSocket connection for Chat
  useEffect(() => {
    if (token && socketService && typeof socketService.connectChat === 'function') {
      try {
        socketService.connectChat(token);
      } catch (e) {
        console.warn('[ChatContext] WebSocket connection notice:', e);
      }
    }

    const handleIncomingDirect = (msg: any) => {
      const formatted: ChatMessage = {
        id: msg.id || 'msg-' + Date.now(),
        senderId: msg.sender?.id || msg.senderId,
        receiverId: msg.receiver?.id || msg.receiverId,
        content: msg.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGameInvite: msg.isGameInvite,
        gameInviteDetails: msg.gameInviteDetails,
      };

      setMessages((prev) => [...prev, formatted]);

      if (formatted.senderId !== user?.id) {
        if (formatted.isGameInvite) {
          const senderName = msg.sender?.username || formatted.gameInviteDetails?.senderName || 'Un joueur';
          setActiveInvite({
            id: formatted.id,
            senderName,
            gameType: formatted.gameInviteDetails?.gameType || 'PONG',
            roomId: formatted.gameInviteDetails?.roomId,
            opponentId: formatted.senderId,
            targetScore: formatted.gameInviteDetails?.targetScore || 5,
          });
          addToast(`🏓 Défi ${formatted.gameInviteDetails?.gameType || 'Pong'} 1v1 reçu de ${senderName} !`, 'warning');
        } else {
          addToast(`Nouveau message de ${msg.sender?.username || 'un utilisateur'}`, 'info');
        }
      }
    };

    const handleIncomingChannel = (msg: any) => {
      const formatted: ChannelMessage = {
        id: msg.id || 'chan-msg-' + Date.now(),
        channelId: msg.channelId || 'general',
        senderId: msg.sender?.id || msg.senderId,
        senderName: msg.sender?.username || msg.senderName || 'Joueur',
        senderAvatar: msg.sender?.avatar || msg.senderAvatar,
        content: msg.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChannelMessages((prev) => [...prev, formatted]);
    };

    const handleChallenge = (challenge: any) => {
      const senderName = challenge.sender?.username || challenge.senderName || 'Joueur';
      setActiveInvite({
        id: 'challenge-' + Date.now(),
        senderName,
        gameType: challenge.gameType || 'PONG',
        roomId: challenge.roomId,
        opponentId: challenge.sender?.id || challenge.senderId,
        targetScore: challenge.targetScore || 5,
      });
      addToast(`Défi ${challenge.gameType || 'Pong'} reçu de ${senderName} !`, 'warning');
    };

    if (socketService && typeof socketService.on === 'function') {
      socketService.on('directMessage', handleIncomingDirect);
      socketService.on('channelMessage', handleIncomingChannel);
      socketService.on('incomingGameChallenge', handleChallenge);
    }

    return () => {
      if (socketService && typeof socketService.off === 'function') {
        socketService.off('directMessage', handleIncomingDirect);
        socketService.off('channelMessage', handleIncomingChannel);
        socketService.off('incomingGameChallenge', handleChallenge);
      }
    };
  }, [token, user, addToast]);

  const sendMessage = (
    receiverId: string,
    content: string,
    isGameInvite = false,
    gameInviteDetails?: any
  ) => {
    if (!user) return;
    if (blockedUserIds.includes(receiverId)) {
      addToast("Impossible d'envoyer un message : utilisateur bloqué.", 'error');
      return;
    }

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGameInvite,
      gameInviteDetails,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Send via WebSocket to real connected user
    try {
      socketService.sendChat('sendDirectMessage', {
        receiverId,
        content,
        isGameInvite,
        gameInviteDetails,
      });
    } catch {
      // Offline fallback
    }
  };

  const sendChannelMessage = (channelId: string, content: string) => {
    if (!user || !content.trim()) return;

    const newChanMsg: ChannelMessage = {
      id: 'chan-msg-' + Date.now(),
      channelId,
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChannelMessages((prev) => [...prev, newChanMsg]);

    try {
      socketService.sendChat('sendChannelMessage', {
        channelId,
        content: content.trim(),
      });
    } catch {
      // Offline fallback
    }
  };

  const sendGameChallenge = (
    receiverId: string,
    gameType: 'PONG' | 'TICTACTOE' | 'SNAKE' | 'QUIZ',
    options?: { targetScore?: number }
  ) => {
    if (!user) return;

    const roomId = `duel_${[user.id, receiverId].sort().join('_')}_${Date.now().toString().slice(-4)}`;

    const inviteDetails = {
      gameType,
      status: 'PENDING',
      roomId,
      senderId: user.id,
      senderName: user.username,
      targetScore: options?.targetScore || 5,
    };

    sendMessage(
      receiverId,
      `🎯 Défi lancé pour une partie de ${gameType} (${options?.targetScore || 5} pts) !`,
      true,
      inviteDetails
    );

    addToast(`Défi ${gameType} envoyé avec succès à l'adversaire !`, 'success');
  };

  const acceptGameChallenge = (invite: { roomId?: string; opponentName?: string; gameType?: string }) => {
    addToast(`Défi accepté ! Lancement de la partie contre ${invite.opponentName || 'l\'adversaire'}...`, 'success');
    clearActiveInvite();
  };

  const toggleBlockUser = (userId: string) => {
    setBlockedUserIds((prev) => {
      const exists = prev.includes(userId);
      if (exists) {
        addToast('Utilisateur débloqué.', 'info');
        return prev.filter((id) => id !== userId);
      } else {
        addToast('Utilisateur bloqué.', 'warning');
        return [...prev, userId];
      }
    });
  };

  const isUserBlocked = (userId: string) => blockedUserIds.includes(userId);

  const clearActiveInvite = () => setActiveInvite(null);

  return (
    <ChatContext.Provider
      value={{
        messages,
        channelMessages,
        activeFriendId,
        setActiveFriendId,
        sendMessage,
        sendChannelMessage,
        blockedUserIds,
        toggleBlockUser,
        isUserBlocked,
        sendGameChallenge,
        activeInvite,
        clearActiveInvite,
        acceptGameChallenge,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const defaultChatFallback: ChatContextType = {
  messages: [],
  channelMessages: [],
  activeFriendId: null,
  setActiveFriendId: () => {},
  sendMessage: () => {},
  sendChannelMessage: () => {},
  blockedUserIds: [],
  toggleBlockUser: () => {},
  isUserBlocked: () => false,
  sendGameChallenge: () => {},
  activeInvite: null,
  clearActiveInvite: () => {},
  acceptGameChallenge: () => {},
};

export const useChat = () => {
  const context = useContext(ChatContext);
  return context || defaultChatFallback;
};

export default ChatContext;

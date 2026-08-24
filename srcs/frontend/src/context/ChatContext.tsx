import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { socketService } from '../services/socket';
interface ActiveDuelInvite {
  id: string;
  senderName: string;
  gameType: string;
  roomId?: string;
  opponentId?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  activeFriendId: string | null;
  setActiveFriendId: (id: string | null) => void;
  sendMessage: (receiverId: string, content: string, isGameInvite?: boolean, inviteDetails?: any) => void;
  blockedUserIds: string[];
  toggleBlockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  channelMessages?: any[];
  sendChannelMessage?: (channelId: string, content: string) => void;
  sendGameChallenge: (receiverId: string, gameType: 'PONG' | 'TICTACTOE' | 'QUIZ' | 'SNAKE' | string, options?: any) => void;
  activeInvite: ActiveDuelInvite | null;
  clearActiveInvite: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [activeInvite, setActiveInvite] = useState<ActiveDuelInvite | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (token && socketService && typeof socketService.connectChat === 'function') {
      try {
        socketService.connectChat(token);
      } catch (e) {
        console.warn('[ChatContext] WebSocket connection notice:', e);
      }
    }

    const handleIncomingMessage = (msg: any) => {
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
          });
          addToast(`🏓 Défi Pong 1v1 reçu de ${senderName} !`, 'warning');
        } else {
          addToast(`Nouveau message de ${msg.sender?.username || 'un utilisateur'}`, 'info');
        }
      }
    };

    const handleChallenge = (challenge: any) => {
      const senderName = challenge.sender?.username || challenge.senderName || 'Joueur';
      setActiveInvite({
        id: 'challenge-' + Date.now(),
        senderName,
        gameType: challenge.gameType || 'PONG',
        roomId: challenge.roomId,
        opponentId: challenge.sender?.id || challenge.senderId,
      });
      addToast(`Défi ${challenge.gameType} reçu de ${senderName} !`, 'warning');
    };

    if (socketService && typeof socketService.on === 'function') {
      socketService.on('directMessage', handleIncomingMessage);
      socketService.on('incomingGameChallenge', handleChallenge);
    }

    return () => {
      if (socketService && typeof socketService.off === 'function') {
        socketService.off('directMessage', handleIncomingMessage);
        socketService.off('incomingGameChallenge', handleChallenge);
      }
    };
  }, [token, user]);

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

    socketService.sendChat('sendDirectMessage', {
      receiverId,
      content,
      isGameInvite,
      gameInviteDetails,
    });
  };

  const sendGameChallenge = (
    receiverId: string,
    gameType: 'PONG' | 'TICTACTOE' | 'QUIZ' | 'SNAKE' | string,
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
      targetScore: options?.targetScore,
    };

    sendMessage(
      receiverId,
      `🎯 Défi lancé pour une partie de ${gameType} !`,
      true,
      inviteDetails
    );

    addToast(`Défi ${gameType} envoyé avec succès à l'adversaire !`, 'success');
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
        activeFriendId,
        setActiveFriendId,
        sendMessage,
        blockedUserIds,
        toggleBlockUser,
        isUserBlocked,
        sendGameChallenge,
        activeInvite,
        clearActiveInvite,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const defaultChatFallback: ChatContextType = {
  messages: [],
  activeFriendId: null,
  setActiveFriendId: () => {},
  sendMessage: () => {},
  blockedUserIds: [],
  toggleBlockUser: () => {},
  isUserBlocked: () => false,
  sendGameChallenge: () => {},
  activeInvite: null,
  clearActiveInvite: () => {},
};

export const useChat = () => {
  const context = useContext(ChatContext);
  return context || defaultChatFallback;
};

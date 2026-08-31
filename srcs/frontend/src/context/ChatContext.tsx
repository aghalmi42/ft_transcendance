import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { socketService } from '../services/socket';
import { api } from '../services/api';

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
  sendGameChallenge: (receiverId: string, gameType: 'PONG' | 'TICTACTOE', options?: any) => Promise<string | undefined>;
  activeInvite: ActiveDuelInvite | null;
  clearActiveInvite: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const mapMessage = (raw: any, meId: string, peerId: string): ChatMessage => ({
  id: raw.id,
  senderId: raw.sender?.id ?? raw.senderId,
  receiverId: (raw.sender?.id ?? raw.senderId) === meId ? peerId : meId,
  content: raw.content,
  timestamp: new Date(raw.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const [activeFriendId, setActiveFriendIdState] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [activeInvite, setActiveInvite] = useState<ActiveDuelInvite | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const conversationByPeer = useRef<Map<string, string>>(new Map());
  const loadedConversations = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (token && socketService && typeof socketService.connectChat === 'function') {
      try {
        socketService.connectChat(token);
      } catch (e) {
        console.warn('[ChatContext] WebSocket connection notice:', e);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!user) return;
    api.getConversations().then((convs: any[]) => {
      convs.forEach((c) => {
        const peer = c.userA?.id === user.id ? c.userB : c.userA;
        if (peer) conversationByPeer.current.set(peer.id, c.id);
      });
    }).catch(() => {});
  }, [user]);

  const ensureConversationLoaded = useCallback(async (peerId: string): Promise<string | null> => {
    if (!user) return null;
    let conversationId = conversationByPeer.current.get(peerId) ?? null;
    if (!conversationId) {
      try {
        const conversation = await api.getOrCreateConversation(peerId);
        conversationId = conversation.id;
        if (conversationId) conversationByPeer.current.set(peerId, conversationId);
      } catch {
        return null;
      }
    }
    if (conversationId && !loadedConversations.current.has(conversationId)) {
      loadedConversations.current.add(conversationId);
      try {
        const history = await api.getConversationMessages(conversationId);
        const mapped = (history as any[]).map((m) => mapMessage(m, user.id, peerId));
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          return [...prev, ...mapped.filter((m) => !existingIds.has(m.id))];
        });
      } catch {
        loadedConversations.current.delete(conversationId);
      }
    }
    return conversationId;
  }, [user]);

  const setActiveFriendId = (id: string | null) => {
    setActiveFriendIdState(id);
    if (id) {
      ensureConversationLoaded(id).then((conversationId) => {
        if (conversationId) api.markConversationRead(conversationId).catch(() => {});
      });
    }
  };

  useEffect(() => {
    const handleIncomingMessage = (msg: any) => {
      if (!user) return;
      const peerId: string = msg.sender?.id ?? msg.senderId;
      if (!peerId) return;
      if (msg.conversationId) {
        conversationByPeer.current.set(peerId, msg.conversationId);
        loadedConversations.current.add(msg.conversationId);
      }

      const formatted = mapMessage(msg, user.id, peerId);
      setMessages((prev) => (prev.some((m) => m.id === formatted.id) ? prev : [...prev, formatted]));
      addToast(`Nouveau message de ${msg.sender?.username || 'un utilisateur'}`, 'info');
    };

    const handleChallenge = (challenge: any) => {
      const senderName = challenge.sender?.username || 'Joueur';
      setActiveInvite({
        id: 'challenge-' + Date.now(),
        senderName,
        gameType: challenge.gameType || 'PONG',
        roomId: challenge.roomId,
        opponentId: challenge.sender?.id,
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
  }, [user, addToast]);

  const sendMessage = (receiverId: string, content: string) => {
    if (!user) return;
    if (blockedUserIds.includes(receiverId)) {
      addToast("Impossible d'envoyer un message : utilisateur bloqué.", 'error');
      return;
    }

    ensureConversationLoaded(receiverId).then(async (conversationId) => {
      if (!conversationId) {
        addToast("Impossible d'envoyer le message.", 'error');
        return;
      }
      try {
        const saved = await api.sendConversationMessage(conversationId, content);
        const formatted = mapMessage(saved, user.id, receiverId);
        setMessages((prev) => (prev.some((m) => m.id === formatted.id) ? prev : [...prev, formatted]));
      } catch {
        addToast("Le message n'a pas pu être envoyé.", 'error');
      }
    });
  };

  const sendGameChallenge = async (
    receiverId: string,
    gameType: 'PONG' | 'TICTACTOE',
    options?: { targetScore?: number }
  ): Promise<string | undefined> => {
    if (!user) return undefined;

    let roomId = `duel_${[user.id, receiverId].sort().join('_')}_${Date.now().toString().slice(-4)}`;

    if (gameType === 'TICTACTOE') {
      try {
        const { gameId } = await api.createTicTacToeGame(receiverId);
        roomId = gameId;
      } catch {
        addToast("Impossible de créer la partie de Tic-Tac-Toe.", 'error');
        return undefined;
      }
    }

    socketService.sendChat('sendGameChallenge', {
      receiverId,
      gameType,
      roomId,
      targetScore: options?.targetScore,
    });

    sendMessage(receiverId, `🎯 Défi lancé pour une partie de ${gameType} !`);

    addToast(`Défi ${gameType} envoyé avec succès à l'adversaire !`, 'success');

    return roomId;
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
  sendGameChallenge: async () => undefined,
  activeInvite: null,
  clearActiveInvite: () => {},
};

export const useChat = () => {
  const context = useContext(ChatContext);
  return context || defaultChatFallback;
};

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import type { User } from '../../types';
import { soundEffects } from '../../services/audio';

interface InGameMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

interface InGameChatOverlayProps {
  gameName: string;
  onOpenUserProfile: (user: User) => void;
}

export const InGameChatOverlay: React.FC<InGameChatOverlayProps> = ({
  gameName,
  onOpenUserProfile,
}) => {
  const { user } = useAuth();
  const { messages, sendChannelMessage } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [localMessages, setLocalMessages] = useState<InGameMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const QUICK_RADIO_CALLS = [
    { text: '🎯 Bien joué !', icon: '👏' },
    { text: '⚡ GG WP !', icon: '🔥' },
    { text: '🛡️ Défendez la base !', icon: '🏰' },
    { text: '🚩 Foncez sur le drapeau !', icon: '🏃' },
    { text: '🚀 Sécurisez les zones !', icon: '⭐' },
    { text: '🔄 Revanche au prochain tour ?', icon: '⚔️' },
  ];

  useEffect(() => {
    if (localMessages.length === 0) {
      setLocalMessages([
        {
          id: 'sys-start',
          senderId: 'system-bot',
          senderName: 'Système Arène',
          senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=System',
          content: `Match en cours sur ${gameName}. Utilisez [T] pour afficher ou masquer ce chat.`,
          timestamp: 'Maintenant',
        },
      ]);
    }
  }, [gameName]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        setLocalMessages((prev) => [
          ...prev,
          {
            id: lastMsg.id,
            senderId: lastMsg.senderId,
            senderName: lastMsg.senderId === user?.id ? (user?.username || 'Moi') : 'Joueur',
            senderAvatar: lastMsg.senderId === user?.id ? user?.avatar : undefined,
            content: lastMsg.content,
            timestamp: lastMsg.timestamp || 'Maintenant',
          },
        ]);
        if (!isOpen) {
          setUnreadCount((c) => c + 1);
          soundEffects.playNotification();
        }
      }
    }
  }, [messages, isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, localMessages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !user) return;

    const newMsg: InGameMessage = {
      id: 'ig-' + Date.now(),
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLocalMessages((prev) => [...prev, newMsg]);
    if (sendChannelMessage) {
      sendChannelMessage('general', text);
    }
    soundEffects.playClick();
    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 text-left font-sans">
      {}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-white font-mono text-xs font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md cursor-pointer hover:scale-105 transition-all"
        >
          <span className="text-lg">💬</span>
          <span>Chat Match [T]</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col h-[440px] animate-fade-in">
          {}
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <span className="text-xs font-mono font-bold text-white uppercase">Chat In-Game • {gameName}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-mono p-1 cursor-pointer"
            >
              ✕ Réduire
            </button>
          </div>

          {}
          <div className="p-2 bg-slate-900/40 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0">
            {QUICK_RADIO_CALLS.map((call, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(call.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white shrink-0 cursor-pointer transition-all flex items-center gap-1"
              >
                <span>{call.icon}</span>
                <span className="truncate max-w-[110px]">{call.text}</span>
              </button>
            ))}
          </div>

          {}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 font-mono text-xs">
            {localMessages.map((msg) => {
              const isMe = msg.senderId === user?.id;

              const senderUser: User = {
                id: msg.senderId,
                username: msg.senderName,
                email: `${msg.senderName}@transcendence.42`,
                avatar: msg.senderAvatar,
                status: 'ONLINE',
                level: 10,
                wins: 25,
                losses: 8,
              };

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    onClick={() => msg.senderId !== 'system-bot' && onOpenUserProfile(senderUser)}
                    className={msg.senderId !== 'system-bot' ? 'cursor-pointer hover:opacity-80 transition-opacity shrink-0' : 'shrink-0'}
                    title={`Voir le profil de ${msg.senderName}`}
                  >
                    <Avatar username={msg.senderName} src={msg.senderAvatar} size="xs" />
                  </div>

                  <div className={`max-w-[75%] space-y-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span
                        onClick={() => msg.senderId !== 'system-bot' && onOpenUserProfile(senderUser)}
                        className={`font-bold ${msg.senderId !== 'system-bot' ? 'text-cyan-400 hover:underline cursor-pointer' : 'text-slate-400'}`}
                      >
                        {msg.senderName}
                      </span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-2 rounded-xl inline-block text-left text-xs ${
                        isMe
                          ? 'bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Écrire dans le chat du match..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs font-mono cursor-pointer"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InGameChatOverlay;

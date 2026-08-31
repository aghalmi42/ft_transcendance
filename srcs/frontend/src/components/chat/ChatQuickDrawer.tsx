import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Button from '../common/Button';
import { audioService } from '../../services/audio';

import { api } from '../../services/api';
import type { User } from '../../types';

interface ChatQuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullChat?: () => void;
  onChallengePlayer?: (username: string) => void;
}

export const ChatQuickDrawer: React.FC<ChatQuickDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToFullChat,
  onChallengePlayer,
}) => {
  const { user } = useAuth();
  const { sendMessage, messages: chatMessages, sendGameChallenge, setActiveFriendId } = useChat();
  const drawerRef = useRef<HTMLDivElement>(null);

  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('');
  const [inputMsg, setInputMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      api
        .getUsers()
        .then((users) => {
          if (Array.isArray(users)) {
            const others = users.filter((u) => u.id !== user?.id);
            setRealUsers(others);
            if (others.length > 0 && !activeUserId) {
              setActiveUserId(others[0].id);
              setActiveFriendId(others[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user?.id, activeUserId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeUser = realUsers.find((u) => u.id === activeUserId) || realUsers[0];

  const handleSend = () => {
    if (!inputMsg.trim() || !activeUser) return;
    sendMessage(activeUser.id, inputMsg.trim());
    setInputMsg('');
    audioService.playClick();
  };

  const handleChallenge = () => {
    if (!activeUser) return;
    sendGameChallenge(activeUser.id, 'PONG');
    if (onChallengePlayer) {
      onChallengePlayer(activeUser.username);
    }
  };

  const filteredMessages = chatMessages.filter(
    (m) =>
      activeUser &&
      ((m.senderId === user?.id && m.receiverId === activeUser.id) ||
       (m.senderId === activeUser.id && m.receiverId === user?.id))
  );

  return (
    <div
      ref={drawerRef}
      className="fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 w-[92vw] max-w-[480px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.75)] z-[60] overflow-hidden animate-fadeIn text-left flex flex-col h-[520px]"
    >
      {}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-base">💬</span>
          <span className="font-bold text-sm text-slate-100">Messages Privés</span>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateToFullChat && (
            <button
              onClick={() => {
                onNavigateToFullChat();
                onClose();
              }}
              className="text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Ouvrir grand écran ↗
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold pl-2">
            ✕
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 flex overflow-hidden">
        {}
        <div className="w-24 sm:w-36 bg-slate-950/60 border-r border-slate-800/80 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
          {realUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-[10px]">
              Aucun autre joueur inscrit.
            </div>
          ) : (
            realUsers.map((u) => {
              const isSelected = u.id === activeUser?.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setActiveUserId(u.id);
                    setActiveFriendId(u.id);
                    audioService.playClick();
                  }}
                  className={`p-2.5 flex flex-col items-center sm:items-start transition-colors cursor-pointer ${
                    isSelected ? 'bg-violet-950/40 border-l-2 border-violet-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div className="relative">
                      <span className="text-base">{u.avatar ? '👤' : '🎮'}</span>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                          u.status === 'ONLINE'
                            ? 'bg-emerald-400'
                            : u.status === 'IN_GAME'
                            ? 'bg-violet-400'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div className="hidden sm:block flex-1 min-w-0 text-left">
                      <h6 className="text-xs font-bold text-slate-200 truncate">@{u.username}</h6>
                      <span className="text-[10px] text-slate-500 font-mono block">Niv. {u.level || 1}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {}
        <div className="flex-1 flex flex-col bg-slate-900/60 overflow-hidden">
          {activeUser ? (
            <>
              {}
              <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">@{activeUser.username}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                      activeUser.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : activeUser.status === 'IN_GAME'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {activeUser.status === 'ONLINE' ? 'En ligne' : activeUser.status === 'IN_GAME' ? 'En jeu' : 'Hors ligne'}
                  </span>
                </div>

                <Button
                  variant="neon"
                  size="sm"
                  onClick={handleChallenge}
                  leftIcon={<span>🏓</span>}
                  className="text-[10px] py-1 px-2 h-auto"
                >
                  Défier 1v1
                </Button>
              </div>

              {}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs">
                {filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-1">
                    <span className="text-2xl">💬</span>
                    <p className="text-[11px]">Démarrez une conversation en direct avec @{activeUser.username}</p>
                  </div>
                ) : (
                  filteredMessages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`px-3 py-2 rounded-2xl max-w-[85%] break-words ${
                            isMe
                              ? 'bg-violet-600 text-white rounded-br-none'
                              : 'bg-slate-800 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p>{m.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 px-1">{m.timestamp}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Écrire à @${activeUser.username}...`}
                  className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
                />
                <Button variant="primary" size="sm" onClick={handleSend} className="py-2 px-3">
                  Envoyer
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs p-6 text-center">
              Sélectionnez un joueur pour discuter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatQuickDrawer;

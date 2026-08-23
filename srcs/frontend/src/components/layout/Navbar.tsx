import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { ChatQuickDrawer } from '../chat/ChatQuickDrawer';
import { soundEffects } from '../../services/audio';
import type { UserStatus } from '../../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
  onToggleSidebar: () => void;
  onSearchQuery?: (query: string) => void;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
  onCloseChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onToggleSidebar,
  onSearchQuery,
  isChatOpen: controlledChatOpen,
  onToggleChat,
  onCloseChat,
}) => {
  const { user, logout, setStatus } = useAuth();
  const { unreadCount } = useNotification();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [internalChatOpen, setInternalChatOpen] = useState(false);

  const isChatOpen = controlledChatOpen !== undefined ? controlledChatOpen : internalChatOpen;
  const toggleChat = onToggleChat || (() => setInternalChatOpen(!internalChatOpen));
  const closeChat = onCloseChat || (() => setInternalChatOpen(false));
  const [soundOn, setSoundOn] = useState(soundEffects.isSoundEnabled());
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEffects.setSoundEnabled(next);
    if (next) soundEffects.playClick();
  };

  const statusOptions: { status: UserStatus; label: string; dot: string }[] = [
    { status: 'ONLINE', label: 'En ligne', dot: 'bg-emerald-400' },
    { status: 'IN_GAME', label: 'En jeu', dot: 'bg-violet-400' },
    { status: 'AWAY', label: 'Absent', dot: 'bg-amber-400' },
    { status: 'OFFLINE', label: 'Hors ligne', dot: 'bg-slate-500' },
  ];

  const userMenuItems = [
    {
      id: 'profile',
      label: 'Mon Profil',
      onClick: () => onNavigate('profile'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Paramètres & 2FA',
      onClick: () => onNavigate('settings'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'gdpr',
      label: 'Données RGPD',
      onClick: () => onNavigate('gdpr'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'logout',
      label: 'Déconnexion',
      danger: true,
      onClick: () => logout(),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-sm shadow-sm">
                🏓
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-xs tracking-tight text-white">
                  ft_transcendence
                </span>
                <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
                  Arcade Hub
                </span>
              </div>
            </div>
          </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate('search');
                }
              }}
              placeholder="Rechercher joueurs, posts, tournois..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2">


          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Effets sonores activés' : 'Effets sonores coupés'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {soundOn ? (
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Quick Chat Drawer Icon */}
          <div className="relative">
            <button
              onClick={toggleChat}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Messages Privés"
              title="Messagerie Privée & DMs"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </button>
            <ChatQuickDrawer
              isOpen={isChatOpen}
              onClose={closeChat}
              onNavigateToFullChat={() => {
                closeChat();
                onNavigate('chat');
              }}
              onChallengePlayer={() => onNavigate('game')}
            />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              onNavigate={(tab) => onNavigate(tab)}
            />
          </div>

          {/* User Status & Profile Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {/* Status Picker */}
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        statusOptions.find((s) => s.status === user.status)?.dot || 'bg-emerald-400'
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {statusOptions.find((s) => s.status === user.status)?.label || 'En ligne'}
                    </span>
                  </div>
                }
                items={statusOptions.map((s) => ({
                  id: s.status,
                  label: s.label,
                  icon: <span className={`w-2 h-2 rounded-full ${s.dot}`} />,
                  onClick: () => setStatus(s.status),
                }))}
              />

              {/* Profile Headbar Pill */}
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer">
                    <Avatar username={user.username} src={user.avatar} size="sm" status={user.status} />
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-100">@{user.username}</span>
                        <span className="text-[10px] font-mono font-bold bg-violet-600/30 text-violet-300 px-1.5 py-0.2 rounded-full border border-violet-500/30">
                          Niv. {user.level || 1}
                        </span>
                      </div>
                      {/* Mini XP progress bar */}
                      <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, ((user.xp || 450) / (user.nextLevelXp || 800)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                }
                items={userMenuItems}
              />
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all shadow-md shadow-violet-600/30"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

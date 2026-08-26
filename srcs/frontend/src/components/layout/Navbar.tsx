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
  const [soundOn, setSoundOn] = useState(soundEffects.isSoundEnabled());
  const [searchTerm, setSearchTerm] = useState('');

  const isChatOpen = controlledChatOpen !== undefined ? controlledChatOpen : internalChatOpen;
  const toggleChat = onToggleChat || (() => setInternalChatOpen(!internalChatOpen));
  const closeChat = onCloseChat || (() => setInternalChatOpen(false));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearchQuery?.(e.target.value);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEffects.setSoundEnabled(next);
    if (next) soundEffects.playClick();
  };

  const statusOptions: Array<{ status: UserStatus; label: string; dot: string }> = [
    { status: 'ONLINE', label: 'En ligne', dot: 'bg-emerald-400' },
    { status: 'IN_GAME', label: 'En jeu', dot: 'bg-violet-400' },
    { status: 'AWAY', label: 'Absent', dot: 'bg-amber-400' },
    { status: 'OFFLINE', label: 'Hors ligne', dot: 'bg-slate-500' },
  ];

  const userMenuItems = [
    { id: 'profile', label: 'Mon Profil', onClick: () => onNavigate('profile') },
    { id: 'controls', label: 'Touches (ZQSD)', onClick: () => onNavigate('controls') },
    { id: 'settings', label: 'Paramètres & 2FA', onClick: () => onNavigate('settings') },
    { id: 'gdpr', label: 'Données RGPD', onClick: () => onNavigate('gdpr') },
    { id: 'logout', label: 'Déconnexion', onClick: () => { soundEffects.playClick(); logout(); }, variant: 'danger' as const },
  ];

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          ☰
        </button>
        <div className="relative hidden sm:block w-48 md:w-64">
          <input
            type="text" placeholder="Rechercher..."
            value={searchTerm} onChange={handleSearchChange}
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button onClick={toggleSound} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs">
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button onClick={toggleChat} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs">
          💬
        </button>
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs relative">
            🔔 {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
          </button>
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} onNavigate={onNavigate} />
        </div>

        <Dropdown
          trigger={
            <div className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-800">
              <Avatar username={user?.username || 'Player'} src={user?.avatar} size="sm" status={user?.status || 'ONLINE'} />
              <span className="text-xs font-bold text-white hidden md:inline">@{user?.username || 'Player'}</span>
            </div>
          }
          items={userMenuItems}
        />
      </div>

      <ChatQuickDrawer isOpen={isChatOpen} onClose={closeChat} />
    </header>
  );
};
export default Navbar;

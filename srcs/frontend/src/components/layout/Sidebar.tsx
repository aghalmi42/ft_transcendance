import React from 'react';
import { useChat } from '../../context/ChatContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDesktopColumn?: boolean;
}

interface NavGroup {
  category: string;
  items: {
    id: string;
    label: string;
    icon: string;
    count?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isOpen,
  onClose,
  isDesktopColumn,
}) => {
  const { messages } = useChat();

  const navGroups: NavGroup[] = [
    {
      category: 'JEUX & TOURNOIS',
      items: [
        { id: 'games', label: 'Jeux (Pong, Morpion, Snake)', icon: '🏓' },
        { id: 'tournaments', label: 'Tournois Pong 42', icon: '🏆' },
      ],
    },
    {
      category: 'COMMUNICATION & SOCIAL',
      items: [
        { id: 'feed', label: 'Fil d’Actualité', icon: '📰' },
        { id: 'chat', label: 'Discussion & Défis 1v1', icon: '💬', count: messages.length > 0 ? messages.length : undefined },
        { id: 'friends', label: 'Liste d\'Amis', icon: '👥' },
      ],
    },
    {
      category: 'MON COMPTE',
      items: [
        { id: 'profile', label: 'Profil Joueur', icon: '👤' },
        { id: 'history', label: 'Historique des Matchs', icon: '📊' },
        { id: 'settings', label: 'Sécurité 2FA & Compte', icon: '⚙️' },
      ],
    },
  ];



  const footerItems = [
    { id: 'gdpr', label: 'RGPD & Données', icon: '🛡️' },
    { id: 'about', label: 'À propos', icon: 'ℹ️' },
  ];

  const handleSelect = (tabId: string) => {
    onNavigate(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!isDesktopColumn && isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sober Minimalist Sidebar */}
      <aside
        className={
          isDesktopColumn
            ? 'sticky top-16 w-64 h-[calc(100vh-4rem)] flex flex-col justify-between p-4 bg-slate-950 border-r border-slate-800'
            : `fixed top-16 bottom-0 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 transition-transform duration-200 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`
        }
      >
        {/* Navigation Sections */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-1 text-left">
          {navGroups.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-500 uppercase px-3 block">
                {group.category}
              </span>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    currentTab === item.id ||
                    (item.id === 'games' && (currentTab === 'games' || currentTab === 'catalog' || currentTab === 'game' || currentTab === 'pong'));
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-white font-bold border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-sm">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.count !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 space-y-1">
          {footerItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer text-left"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="px-3 pt-2 text-[10px] text-slate-600 font-mono">
            ft_transcendence • 42
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

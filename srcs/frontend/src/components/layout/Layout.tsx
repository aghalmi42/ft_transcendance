import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useChat } from '../../context/ChatContext';
import { GameInviteModal } from '../chat/GameInviteModal';
import { MiniMediaPlayer } from '../common/MiniMediaPlayer';

interface LayoutProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
  children: React.ReactNode;
  onSearchQuery?: (query: string) => void;
  onStartDuel?: (roomId?: string, opponentName?: string, gameType?: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onNavigate,
  children,
  onSearchQuery,
  onStartDuel,
}) => {
  const { activeInvite, clearActiveInvite } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSidebarNavigate = (tabId: string) => {
    if (tabId === 'chat') {
      setIsChatOpen((prev) => !prev);
      return;
    }
    onNavigate(tabId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-slate-700 selection:text-white">
      {}
      <Navbar
        currentTab={currentTab}
        onNavigate={onNavigate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSearchQuery={onSearchQuery}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onCloseChat={() => setIsChatOpen(false)}
      />

      {}
      <div className="flex-1 flex items-stretch w-full z-10 relative min-h-[calc(100vh-4rem)]">
        {}
        <div className="hidden lg:flex flex-col shrink-0 w-64 border-r border-slate-800 bg-slate-950 self-stretch">
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleSidebarNavigate}
            isOpen={true}
            onClose={() => {}}
            isDesktopColumn={true}
          />
        </div>

        {}
        <div className="lg:hidden">
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleSidebarNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full">
            {children}
          </main>
          <Footer onNavigate={onNavigate} />
        </div>
      </div>

      {}
      {activeInvite && (
        <GameInviteModal
          isOpen={true}
          onClose={clearActiveInvite}
          senderName={activeInvite.senderName}
          gameType={activeInvite.gameType}
          onAccept={() => {
            if (onStartDuel) {
              onStartDuel(activeInvite.roomId, activeInvite.senderName, activeInvite.gameType);
            } else {
              onNavigate('game');
            }
            clearActiveInvite();
          }}
          onDecline={clearActiveInvite}
        />
      )}

      {}
      <MiniMediaPlayer />
    </div>
  );
};

export default Layout;

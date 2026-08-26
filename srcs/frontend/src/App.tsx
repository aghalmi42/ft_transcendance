import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { GameProvider } from './context/GameContext';
import { Layout } from './components/layout/Layout';

import { LandingPage } from './components/landing/LandingPage';
import { TermsOfService } from './components/legal/TermsOfService';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { GdprCenter } from './components/legal/GdprCenter';

import { GameCatalog } from './components/game/GameCatalog';
import { GamingHubPage } from './components/game/GamingHubPage';
import { MatchHistoryPage } from './components/profile/MatchHistoryPage';
import { TournamentView } from './components/tournament/TournamentView';
import { ChatView } from './components/chat/ChatView';
import { FriendsList } from './components/friends/FriendsList';
import { ProfileView } from './components/profile/ProfileView';
import { FeedView } from './components/feed/FeedView';
import { SearchPage } from './components/search/SearchPage';
import { NotificationsView } from './components/notifications/NotificationsView';

import { SettingsView } from './components/profile/SettingsView';
import { KeybindsSettingsView } from './components/profile/KeybindsSettingsView';
import { AboutView } from './components/legal/AboutView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { StatusPage } from './components/status/StatusPage';

const MainRouter: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('games');
  const [selectedGameId, setSelectedGameId] = useState<string>('pong');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDuelRoomId, setActiveDuelRoomId] = useState<string | undefined>(undefined);
  const [activeOpponentName, setActiveOpponentName] = useState<string | undefined>(undefined);

  const navigate = (tabId: string) => {
    if (tabId !== 'game') {
      setActiveDuelRoomId(undefined);
      setActiveOpponentName(undefined);
    }
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setActiveDuelRoomId(undefined);
    setActiveOpponentName(undefined);
    setCurrentTab('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDuel = (roomId?: string, opponentName?: string) => {
    setActiveDuelRoomId(roomId);
    setActiveOpponentName(opponentName);
    setSelectedGameId('pong');
    setCurrentTab('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    if (['terms', 'privacy', 'gdpr', 'status'].includes(currentTab)) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
          <div className="max-w-4xl w-full space-y-4">
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              ← Retour à l'accueil
            </button>
            {currentTab === 'terms' && <TermsOfService onNavigate={navigate} />}
            {currentTab === 'privacy' && <PrivacyPolicy onNavigate={navigate} />}
            {currentTab === 'gdpr' && <GdprCenter onNavigate={navigate} />}
            {currentTab === 'status' && <StatusPage onNavigate={navigate} />}
          </div>
        </div>
      );
    }

    return (
      <LandingPage
        onLoginSuccess={() => navigate('games')}
        onNavigateLegal={(page) => navigate(page)}
      />
    );
  }

  // 2. Authenticated Platform Shell
  return (
    <Layout
      currentTab={currentTab}
      onNavigate={navigate}
      onSearchQuery={(q) => setSearchQuery(q)}
      onStartDuel={handleStartDuel}
    >
      {(currentTab === 'game' || currentTab === 'pong') && (
        <GamingHubPage
          onNavigate={navigate}
          initialGame={selectedGameId || 'pong'}
          initialDuelRoomId={activeDuelRoomId}
          initialOpponentName={activeOpponentName}
        />
      )}

      {(currentTab === 'catalog' || currentTab === 'games' || currentTab === 'home') && (
        <GameCatalog onSelectGame={handleLaunchGame} searchQuery={searchQuery} />
      )}

      {currentTab === 'feed' && <FeedView onNavigate={navigate} />}
      {currentTab === 'search' && <SearchPage initialQuery={searchQuery} onNavigate={navigate} onStartDuel={handleStartDuel} />}
      {currentTab === 'notifications' && <NotificationsView onNavigate={navigate} onStartDuel={handleStartDuel} />}
      {currentTab === 'tournaments' && <TournamentView onNavigate={navigate} />}
      {currentTab === 'chat' && <ChatView onNavigate={navigate} />}
      {currentTab === 'friends' && <FriendsList onNavigate={navigate} />}

      {currentTab === 'profile' && <ProfileView onNavigate={navigate} />}
      {currentTab === 'admin' && user.role === 'admin' && <AdminUsersView onNavigate={navigate} />}

      {currentTab === 'history' && <MatchHistoryPage onNavigate={navigate} />}
      {(currentTab === 'controls' || currentTab === 'keybinds') && <KeybindsSettingsView onNavigate={navigate} />}
      {currentTab === 'settings' && <SettingsView onNavigate={navigate} />}
      {currentTab === 'terms' && <TermsOfService onNavigate={navigate} />}
      {currentTab === 'privacy' && <PrivacyPolicy onNavigate={navigate} />}
      {currentTab === 'gdpr' && <GdprCenter onNavigate={navigate} />}
      {currentTab === 'about' && <AboutView onNavigate={navigate} />}
      {currentTab === 'status' && <StatusPage onNavigate={navigate} />}
    </Layout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <GameProvider>
            <MainRouter />
          </GameProvider>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

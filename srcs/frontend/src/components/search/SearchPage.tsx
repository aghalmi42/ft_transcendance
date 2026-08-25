import React, { useState, useEffect } from 'react';
import type { User, PostItem } from '../../types';
import { api } from '../../services/api';
import { soundEffects } from '../../services/audio';
import { useNotification } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PostCard } from '../feed/PostCard';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate?: (tabId: string) => void;
  onStartDuel?: (roomId?: string, opponentName?: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onNavigate,
  onStartDuel,
}) => {
  const { addToast } = useNotification();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const performSearch = async (searchStr: string) => {
    if (!searchStr.trim()) {
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    soundEffects.playClick();

    try {
      const results = await api.searchAll(searchStr.trim());
      setUsers(results.users || []);
      setPosts(results.posts || []);
    } catch {
      setUsers([]);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSendFriendRequest = async (targetUser: User) => {
    try {
      await api.sendFriendRequest(targetUser.id);
      soundEffects.playLevelUp();
      addToast(`Demande d'ami envoyée à ${targetUser.username} !`, 'success');
    } catch {
      addToast(`Erreur lors de l'envoi de la demande d'ami`, 'error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-2 text-left font-sans animate-fadeIn">
      {}
      <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔍</span> Recherche Globale
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trouvez des adversaires, des amis ou des publications sur la plateforme.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par pseudo, mots-clés, thèmes de jeu..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              autoFocus
            />
          </div>
          <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
            Rechercher
          </Button>
        </form>

        {}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          {[
            { id: 'all', label: `Tout (${users.length + posts.length})` },
            { id: 'users', label: `Joueurs (${users.length})` },
            { id: 'posts', label: `Publications (${posts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundEffects.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Recherche en cours dans la base de données...</p>
        </div>
      ) : !hasSearched ? (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <span className="text-4xl">🔎</span>
          <p className="text-sm font-semibold">Effectuez une recherche ci-dessus</p>
          <p className="text-xs text-slate-500">
            Tapez un nom d'utilisateur, un titre de jeu ou un sujet pour commencer.
          </p>
        </Card>
      ) : users.length === 0 && posts.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <span className="text-4xl">🤷‍♂️</span>
          <p className="text-sm font-semibold">Aucun résultat trouvé pour "{query}"</p>
          <p className="text-xs text-slate-500">
            Vérifiez l'orthographe ou essayez d'autres mots-clés.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* USERS RESULTS */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>👤</span> Joueurs trouvés ({users.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar username={u.username} avatarUrl={u.avatar} status={u.status || 'ONLINE'} size="md" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{u.username}</h4>
                        <p className="text-xs text-slate-400 truncate">
                          {u.bio || (u.level ? `Niveau ${u.level} • ${u.wins || 0} Victoires` : 'Membre 42')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendFriendRequest(u)}
                        title="Ajouter en ami"
                      >
                        + Ami
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStartDuel?.(undefined, u.username)}
                        title="Défier en 1v1"
                      >
                        ⚔️ Duel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POSTS RESULTS */}
          {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>📰</span> Publications correspondantes ({posts.length})
              </h2>

              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;

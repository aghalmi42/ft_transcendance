import React, { useState, useEffect } from 'react';
import type { PostItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { soundEffects } from '../../services/audio';
import { PostCard } from './PostCard';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface FeedViewProps {
  onNavigate?: (tabId: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'mine'>('all');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isPublishing) return;

    setIsPublishing(true);
    soundEffects.playMessageSend();

    try {
      const created = await api.createPost(newPostContent.trim());
      setPosts((prev) => [created, ...prev]);
      setNewPostContent('');
      addToast('Publication partagée avec la communauté !', 'success');
    } catch {

      const fallbackPost: PostItem = {
        id: 'p-' + Date.now(),
        content: newPostContent.trim(),
        author: user || { id: 'me', username: 'Moi', email: '', status: 'ONLINE' },
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [fallbackPost, ...prev]);
      setNewPostContent('');
      addToast('Publication créée', 'success');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'mine') {
      return p.author?.id === user?.id || p.author?.username === user?.username;
    }
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-2 text-left font-sans animate-fadeIn">
      {}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-violet-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-white tracking-tight">Fil d'actualité Social</h1>
          </div>
          <p className="text-xs text-slate-400">
            Partagez vos scores, organisez des matchs et échangez avec tous les joueurs de l'école.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setFeedFilter('all'); soundEffects.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              feedFilter === 'all'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tous les posts
          </button>
          <button
            onClick={() => { setFeedFilter('mine'); soundEffects.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              feedFilter === 'mine'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Mes publications
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-5">
          {}
          <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-start gap-3">
              <Avatar
                username={user?.username || 'Joueur'}
                avatarUrl={user?.avatar}
                status={user?.status || 'ONLINE'}
                size="md"
              />
              <form onSubmit={handleCreatePost} className="flex-1 space-y-3">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`Quoi de neuf, ${user?.username || 'champion'} ? Racontez une anecdote ou lancez un défi...`}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{newPostContent.length}/500 caractères</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isPublishing}
                    disabled={!newPostContent.trim() || newPostContent.length > 500}
                  >
                    Publier
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {}
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Chargement des actualités...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 space-y-3">
              <span className="text-3xl">📭</span>
              <p className="text-sm font-semibold">Aucune publication pour le moment</p>
              <p className="text-xs text-slate-500">Soyez le premier à partager un message ci-dessus !</p>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
                onNavigate={onNavigate}
              />
            ))
          )}
        </div>

        {}
        <div className="space-y-5">
          {}
          <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              🔥 Tendances & Sujets
            </h3>
            <div className="space-y-2.5">
              {[
                { tag: '#PongTournament2026', posts: '42 matchs' },
                { tag: '#TicTacToeChampion', posts: '18 victoires' },
                { tag: '#42SchoolParis', posts: '89 membres' },
                { tag: '#QuizBattleLive', posts: 'En direct' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-violet-400 hover:underline">{item.tag}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.posts}</span>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-violet-950/60 to-slate-900 border border-violet-800/40 shadow-lg space-y-3 text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h4 className="text-sm font-bold text-white">Duel Rapide</h4>
            </div>
            <p className="text-xs text-slate-300">
              Défiez un joueur aléatoire en ligne ou entraînez-vous contre l'IA.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => onNavigate?.('games')}
            >
              Aller dans l'Arène de Jeu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedView;

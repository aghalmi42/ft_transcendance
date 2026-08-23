import React, { useState } from 'react';
import type { PostItem, CommentItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { soundEffects } from '../../services/audio';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface PostCardProps {
  post: PostItem;
  onDelete?: (postId: string) => void;
  onNavigate?: (tabId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [likesCount, setLikesCount] = useState<number>(post.likes?.length ?? post.likesCount ?? 0);
  const [isLiked, setIsLiked] = useState<boolean>(
    Boolean(post.isLiked || post.likes?.some((l) => l.userId === user?.id || l.user?.id === user?.id))
  );
  const [isLiking, setIsLiking] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(post.comments || []);
  const [commentsLoaded, setCommentsLoaded] = useState(Boolean(post.comments && post.comments.length > 0));
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isAuthor = user?.id === post.author?.id;

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic UI update
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    soundEffects.playClick();

    try {
      const res = await api.togglePostLike(post.id);
      setIsLiked(res.liked);
    } catch {
      // Revert if API fails
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      addToast('Impossible de modifier le like', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleLoadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    if (!commentsLoaded) {
      try {
        const data = await api.getPostComments(post.id);
        setComments(data);
        setCommentsLoaded(true);
      } catch {
        // Fallback to empty comments
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    soundEffects.playMessageSend();
    try {
      const newComment = await api.createComment(post.id, commentInput.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentInput('');
      addToast('Commentaire publié !', 'success');
    } catch {
      // Fallback local addition
      const mockComment: CommentItem = {
        id: 'c-' + Date.now(),
        content: commentInput.trim(),
        author: user || { id: 'temp', username: 'Moi', email: '', status: 'ONLINE' },
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, mockComment]);
      setCommentInput('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    try {
      await api.deletePost(post.id);
      addToast('Publication supprimée', 'info');
      if (onDelete) onDelete(post.id);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : "À l'instant";

  return (
    <div className="rounded-2xl p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all text-left shadow-lg space-y-4">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            username={post.author?.username || 'Joueur'}
            avatarUrl={post.author?.avatar}
            status={post.author?.status || 'ONLINE'}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm hover:text-violet-400 transition-colors cursor-pointer" onClick={() => onNavigate?.('profile')}>
                {post.author?.username || 'Anonyme'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {post.author?.level ? `Niv. ${post.author.level}` : 'Membre'}
              </span>
            </div>
            <span className="text-xs text-slate-500">{formattedDate}</span>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDeletePost}
            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Supprimer la publication"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
        {post.content}
      </div>

      {/* Actions (Like, Comment, Share) */}
      <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            isLiked
              ? 'bg-pink-500/10 text-pink-400 font-semibold'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className={`w-4 h-4 transition-transform ${isLiked ? 'scale-110 fill-pink-500 stroke-pink-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{likesCount} {likesCount === 1 ? 'J’aime' : 'J’aime'}</span>
        </button>

        <button
          onClick={handleLoadComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments.length || post.commentsCount || 0} Commentaires</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Write comment form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingComment} disabled={!commentInput.trim()}>
              Envoyer
            </Button>
          </form>

          {/* Comments list */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pt-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">Soyez le premier à commenter !</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-left">
                  <Avatar username={c.author?.username || 'U'} avatarUrl={c.author?.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">{c.author?.username || 'Membre'}</span>
                      <span className="text-[10px] text-slate-500">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 break-words">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { UserStatus } from '../../types';
import { API_BASE_URL } from '../../services/api';

// Uploaded avatars come back from the backend as a relative path
// ("/uploads/avatars/xxx.png"); the frontend runs on a different origin/port,
// so that path must be resolved against the backend, not the current page.
const resolveAvatarSrc = (src?: string): string | undefined => {
  if (!src) return undefined;
  if (src.startsWith('/')) return `${API_BASE_URL}${src}`;
  return src;
};

interface AvatarProps {
  src?: string;
  avatarUrl?: string;
  alt?: string;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: UserStatus;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  avatarUrl,
  alt = 'Avatar',
  username = '',
  size = 'md',
  status,
  className = '',
}) => {
  const actualSrc = resolveAvatarSrc(src || avatarUrl);
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl font-bold',
  }[size];

  const statusDotSize = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3.5 h-3.5 ring-2',
    lg: 'w-4 h-4 ring-2',
    xl: 'w-5 h-5 ring-4',
  }[size];

  const statusColor = {
    ONLINE: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    IN_GAME: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)] animate-pulse',
    AWAY: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    OFFLINE: 'bg-slate-500',
  };

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : 'U';

  const finalAvatarUrl = actualSrc || (username ? `https://api.dicebear.com/7.x/bottts/svg?seed=${username}` : undefined);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {finalAvatarUrl ? (
        <img
          src={finalAvatarUrl}
          alt={alt || username}
          className={`${sizeMap} rounded-full object-cover bg-slate-800 border border-slate-700/80 shadow-inner`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeMap} rounded-full bg-gradient-to-tr from-violet-700 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner border border-violet-400/30`}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-slate-900 ${statusDotSize} ${
            statusColor[status] || statusColor.OFFLINE
          }`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;

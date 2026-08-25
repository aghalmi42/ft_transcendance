import React, { useRef, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';
import { audioService } from '../../services/audio';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tabId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, addToast } = useNotification();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAccept = (id: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
    if (type === 'FRIEND_REQUEST') {
      addToast('Demande d\'ami acceptée ! Vous êtes maintenant amis.', 'success', 'Nouvel Ami');
      audioService.playScore();
      if (onNavigate) onNavigate('friends');
    } else if (type === 'GAME_INVITE') {
      addToast('Défi accepté ! Lancement de l\'arène...', 'success', 'Match Lancé');
      audioService.playScore();
      if (onNavigate) onNavigate('game');
    } else {
      addToast('Invitation acceptée !', 'success');
      audioService.playScore();
      if (onNavigate) onNavigate('servers');
    }
    onClose();
  };

  const handleDecline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
    addToast('Invitation déclinée.', 'info');
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-left"
    >
      {}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-100">Notifications</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <Badge variant="purple" size="sm">
              {notifications.filter((n) => !n.read).length} nouvelles
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Tout marquer lu
          </button>
          <button
            onClick={clearNotifications}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Effacer
          </button>
        </div>
      </div>

      {}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Aucune notification récente
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-3.5 flex flex-col gap-2 transition-colors cursor-pointer ${
                !n.read ? 'bg-violet-950/20 hover:bg-violet-900/30' : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {n.type === 'FRIEND_REQUEST' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                  {n.type === 'GAME_INVITE' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400 block shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
                  )}
                  {n.type === 'SYSTEM' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
                  )}
                  {((n.type as string) === 'MATCH_RESULT' || (n.type as string) === 'POST_LIKE' || (n.type as string) === 'POST_COMMENT') && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h6 className={`text-xs font-bold truncate ${!n.read ? 'text-slate-100' : 'text-slate-300'}`}>
                      {n.title}
                    </h6>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">{n.timestamp || n.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>

              {}
              {(n.type === 'FRIEND_REQUEST' || n.type === 'GAME_INVITE') && !n.read && (
                <div className="flex items-center justify-end space-x-2 pt-1 pl-5">
                  <button
                    onClick={(e) => handleDecline(n.id, e)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-bold transition-all"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={(e) => handleAccept(n.id, n.type, e)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-[10px] font-bold shadow-md shadow-violet-600/30 transition-all"
                  >
                    {n.type === 'FRIEND_REQUEST' ? 'Accepter l\'Ami ✓' : 'Rejoindre le Match ⚔️'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

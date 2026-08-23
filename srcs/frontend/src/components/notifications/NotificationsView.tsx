import React, { useEffect, useState } from 'react';
import type { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { soundEffects } from '../../services/audio';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface NotificationsViewProps {
  onNavigate?: (tabId: string) => void;
  onStartDuel?: (roomId?: string, opponentName?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onNavigate,
  onStartDuel,
}) => {
  const { addToast } = useNotification();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      } else {
        // Mock fallback notifications for demonstration
        setNotifications([
          {
            id: 'n-1',
            type: 'GAME_INVITE',
            title: 'Défi 1v1 reçu !',
            message: 'CyberGamer vous défie sur Pong en mode Classé !',
            read: false,
            createdAt: new Date(Date.now() - 300000).toISOString(),
            data: { opponentName: 'CyberGamer', gameType: 'PONG' },
          },
          {
            id: 'n-2',
            type: 'FRIEND_REQUEST',
            title: 'Nouvelle demande d\'ami',
            message: 'NeonKnight souhaite vous ajouter à sa liste d\'amis.',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'n-3',
            type: 'MATCH_RESULT',
            title: 'Victoire de Tournoi !',
            message: 'Vous avez progressé en quart de finale du Tournoi Pong 42.',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      soundEffects.playClick();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      soundEffects.playClick();
      addToast('Toutes les notifications sont marquées comme lues', 'info');
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      soundEffects.playClick();
    } catch {
      // ignore
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'GAME_INVITE':
        return '⚔️';
      case 'FRIEND_REQUEST':
        return '👥';
      case 'MATCH_RESULT':
        return '🏆';
      case 'LIKE':
        return '❤️';
      case 'COMMENT':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-2 text-left font-sans animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔔</span> Centre de Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historique de vos alertes, invitations de jeu et interactions sociales.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Chargement des notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <span className="text-4xl">✨</span>
          <p className="text-sm font-semibold">Vous êtes à jour !</p>
          <p className="text-xs text-slate-500">Aucune nouvelle notification pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const timeStr = notif.createdAt
              ? new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Récemment';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 shadow-md ${
                  notif.read
                    ? 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                    : 'bg-slate-900 border-violet-500/40 text-white shadow-violet-500/5'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">{timeStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.type === 'GAME_INVITE' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        onStartDuel?.(undefined, notif.data?.opponentName || 'Adversaire');
                      }}
                    >
                      Rejoindre la partie
                    </Button>
                  )}

                  {notif.type === 'FRIEND_REQUEST' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        onNavigate?.('friends');
                      }}
                    >
                      Voir la demande
                    </Button>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                      title="Marquer comme lu"
                    >
                      ✓
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsView;

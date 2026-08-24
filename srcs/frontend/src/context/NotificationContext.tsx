import React, { createContext, useContext, useState } from 'react';
import type { NotificationItem } from '../types';
import { Toast, type ToastProps } from '../components/common/Toast';
import { soundEffects } from '../services/audio';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addToast: (message: string, type?: ToastProps['type'], title?: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Demande d\'ami reçue',
      message: 'PixelKnight vous a envoyé une demande d\'ami.',
      type: 'FRIEND_REQUEST',
      read: false,
      timestamp: 'Il y a 5 min',
    },
    {
      id: 'n2',
      title: 'Défi Pong',
      message: 'NeonValkyrie vous a défié en match 1v1 !',
      type: 'GAME_INVITE',
      read: false,
      timestamp: 'Il y a 20 min',
    },
    {
      id: 'n3',
      title: 'Succès Débloqué !',
      message: 'Vous avez débloqué le badge "Première Victoire".',
      type: 'SYSTEM',
      read: true,
      timestamp: 'Hier',
    }
  ]);

  const addToast = (message: string, type: ToastProps['type'] = 'info', title?: string) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastProps = {
      id,
      title,
      message,
      type,
      duration: 4500,
      onClose: removeToast,
    };
    setToasts((prev) => [...prev, newToast]);
    soundEffects.playNotification();
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now(),
      read: false,
      timestamp: 'À l\'instant',
    };
    setNotifications((prev) => [newItem, ...prev]);
    addToast(newItem.message, 'info', newItem.title);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}

      {}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const defaultNotifFallback: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addToast: () => {},
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  return context || defaultNotifFallback;
};

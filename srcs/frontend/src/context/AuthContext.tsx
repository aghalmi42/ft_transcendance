import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserStatus } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: Partial<User>) => Promise<void>;
  setStatus: (status: UserStatus) => Promise<void>;
  toggle2FA: () => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  exportData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => api.getLocalUser());
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const savedToken = api.getToken();
      if (savedToken) {
        try {
          // Timeout promise after 1500ms so the app never hangs
          const mePromise = api.getMe();
          const timeoutPromise = new Promise<User>((_, reject) =>
            setTimeout(() => reject(new Error('Auth init timeout')), 1500)
          );
          const me = await Promise.race([mePromise, timeoutPromise]);
          if (isMounted) setUser(me);
        } catch {
          if (isMounted) {
            const local = api.getLocalUser();
            if (local) {
              setUser(local);
            }
          }
        }

      } else {
        if (isMounted) setUser(null);
      }
      if (isMounted) setIsLoading(false);
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.accessToken) setToken(res.accessToken);
      if (res.user) setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ username, email, password });
      if (res.accessToken) setToken(res.accessToken);
      if (res.user) setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('active_user');
  };

  const updateProfile = async (payload: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateUser(user.id, payload);
    setUser(updated);
  };

  const setStatus = async (status: UserStatus) => {
    if (!user) return;
    const updated = { ...user, status };
    setUser(updated);
    api.saveLocalUser(updated);
  };

  const toggle2FA = async (): Promise<boolean> => {
    if (!user) return false;
    const newState = !user.twoFactorEnabled;
    const updated = await api.updateUser(user.id, { twoFactorEnabled: newState });
    setUser(updated);
    return newState;
  };

  const deleteAccount = async () => {
    if (!user) return;
    await api.deleteUser(user.id);
    logout();
  };

  const exportData = () => {
    if (!user) return;
    const data = {
      profile: user,
      exportDate: new Date().toISOString(),
      platform: 'ft_transcendence',
      history: api.getMatchHistorySync(),
      leaderboard: api.getLeaderboardSync().find((l) => l.user.username === user.username),
      gdprDisclaimer: "Conformément au RGPD, voici l'intégralité des données associées à votre compte utilisateur.",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcendence_gdpr_export_${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        setStatus,
        toggle2FA,
        deleteAccount,
        exportData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

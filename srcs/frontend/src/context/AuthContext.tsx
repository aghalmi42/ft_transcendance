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
  uploadAvatar: (file: File) => Promise<void>;
  refreshUser: () => Promise<void>;
  setStatus: (status: UserStatus) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportData: () => Promise<void>;
  oauthError: string | null;
  clearOauthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => api.getLocalUser());
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      // Pick up the token handed back by an OAuth redirect (e.g. "Se connecter avec 42"),
      // which lands the browser back on "/?oauth_token=..." since this SPA has no router.
      const params = new URLSearchParams(window.location.search);
      const oauthToken = params.get('oauth_token');
      const oauthError = params.get('oauth_error');
      if (oauthToken || oauthError) {
        if (oauthToken) api.setToken(oauthToken);
        if (oauthError) setOauthError(oauthError);
        window.history.replaceState({}, '', window.location.pathname);
      }

      const savedToken = api.getToken();
      if (savedToken) {
        try {

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
            } else {
              api.setToken(null);
              setToken(null);
              setUser(null);
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
      setToken(res.accessToken);
      setUser(res.user || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ username, email, password });
      setToken(res.accessToken);
      setUser(res.user || null);
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
    const updated = await api.updateProfile(payload);
    setUser(updated);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const updated = await api.uploadAvatar(file);
    setUser(updated);
  };

  const refreshUser = async () => {
    if (!api.getToken()) return;
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      // transient failure (offline, expired token mid-session) — keep last known state
    }
  };

  const setStatus = async (status: UserStatus) => {
    if (!user) return;
    const updated = { ...user, status };
    setUser(updated);
    api.saveLocalUser(updated);
    try {
      await api.updateProfile({ status });
    } catch (err) {
      console.warn('[AuthContext] Failed to persist status change:', err);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    await api.deleteUser(user.id);
    logout();
  };

  // Pulls the real, server-side export (profile + posts + comments + likes +
  // friendships + game history + notifications + messages) — no local/mock data.
  const exportData = async () => {
    if (!user) return;
    const data = await api.exportGdprData();

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
        uploadAvatar,
        refreshUser,
        setStatus,
        deleteAccount,
        exportData,
        oauthError,
        clearOauthError: () => setOauthError(null),
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

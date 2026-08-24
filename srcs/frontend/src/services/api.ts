import type {
  User,
  Post,
  Comment,
  Friendship,
  LeaderboardEntry,
  GameMatchHistory,
  AuthResponse
} from '../types';
import {
  MOCK_USERS,
  CURRENT_DEMO_USER,
  MOCK_POSTS,
  MOCK_COMMENTS,
  MOCK_FRIENDSHIPS
} from './mockData';
import { APP_CONFIG } from '../config/appConfig';

export const API_BASE_URL = APP_CONFIG.API_BASE_URL;

class ApiService {
  private token: string | null = localStorage.getItem('token');
  private backendAvailable = true;
  private lastBackendFailure = 0;

  public setToken(token: string | null) {
    this.token = token;
    token ? localStorage.setItem('token', token) : localStorage.removeItem('token');
  }

  public getToken() { return this.token || localStorage.getItem('token'); }
  public isBackendOnline() { return this.backendAvailable; }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (Date.now() - this.lastBackendFailure < 12000 && !this.backendAvailable) {
      throw new Error('Backend offline');
    }
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...this.getHeaders(), ...(options.headers || {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.backendAvailable = true;
      this.lastBackendFailure = 0;
      return await res.json();
    } catch (err) {
      this.backendAvailable = false;
      this.lastBackendFailure = Date.now();
      throw err;
    }
  }

  private async fallback<T>(promise: Promise<T>, fallbackVal: T | (() => T)): Promise<T> {
    try {
      return await promise;
    } catch {
      return typeof fallbackVal === 'function' ? (fallbackVal as () => T)() : fallbackVal;
    }
  }

  public async login(emailOrPayload: string | { email: string; password?: string }, passwordParam?: string): Promise<AuthResponse> {
    const email = typeof emailOrPayload === 'object' ? emailOrPayload.email : emailOrPayload;
    const password = typeof emailOrPayload === 'object' ? emailOrPayload.password : passwordParam;
    return this.fallback(
      this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        .then(res => {
          if (res.accessToken) this.setToken(res.accessToken);
          if (res.user) this.saveLocalUser(res.user);
          return res;
        }),
      () => {
        const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || CURRENT_DEMO_USER;
        const fakeToken = `mock_jwt_token_${Date.now()}`;
        this.setToken(fakeToken);
        this.saveLocalUser(found);
        return { accessToken: fakeToken, user: found };
      }
    );
  }

  public async register(usernameOrPayload: string | { username: string; email: string; password?: string }, emailParam?: string, passwordParam?: string): Promise<AuthResponse> {
    const username = typeof usernameOrPayload === 'object' ? usernameOrPayload.username : usernameOrPayload;
    const email = typeof usernameOrPayload === 'object' ? usernameOrPayload.email : (emailParam || '');
    const password = typeof usernameOrPayload === 'object' ? usernameOrPayload.password : passwordParam;
    return this.fallback(
      this.request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) })
        .then(res => {
          if (res.accessToken) this.setToken(res.accessToken);
          if (res.user) this.saveLocalUser(res.user);
          return res;
        }),
      () => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          username, email,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          bio: 'New challenger on ft_transcendence !',
          status: 'ONLINE', level: 1, xp: 0, wins: 0, losses: 0,
          twoFactorEnabled: false, createdAt: new Date().toISOString(),
        };
        const fakeToken = `mock_jwt_token_${Date.now()}`;
        this.setToken(fakeToken);
        this.saveLocalUser(newUser);
        return { accessToken: fakeToken, user: newUser };
      }
    );
  }

  public getMe = () => this.fallback(this.request<User>('/users/me'), () => this.getLocalUser() || CURRENT_DEMO_USER);

  public updateProfile = (payload: Partial<User>) => this.fallback(
    this.request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }),
    () => {
      const updated = { ...(this.getLocalUser() || CURRENT_DEMO_USER), ...payload, updatedAt: new Date().toISOString() };
      this.saveLocalUser(updated);
      return updated;
    }
  );

  public updateUser = async (id: string, payload: Partial<User>) => {
    try {
      return await this.request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    } catch {
      return this.updateProfile(payload);
    }
  };

  public deleteUser = (id: string) => this.fallback(
    this.request<void>(`/users/${id}`, { method: 'DELETE' }),
    () => { localStorage.removeItem('active_user'); this.setToken(null); }
  );

  public generate2FA = () => this.fallback(
    this.request<{ secret: string; otpAuthUrl: string; qrCodeUrl: string }>('/auth/2fa/generate', { method: 'POST' }),
    {
      secret: 'JBSWY3DPEHPK3PXP',
      otpAuthUrl: 'otpauth://totp/ft_transcendence:demo?secret=JBSWY3DPEHPK3PXP',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=otpauth://totp/ft_transcendence:demo',
    }
  );

  public turnOn2FA = (code: string) => this.fallback(
    this.request<{ success: boolean; message: string }>('/auth/2fa/turn-on', { method: 'POST', body: JSON.stringify({ code }) }),
    () => {
      const me = this.getLocalUser() || CURRENT_DEMO_USER;
      me.twoFactorEnabled = true;
      this.saveLocalUser(me);
      return { success: true, message: '2FA activée.' };
    }
  );

  public turnOff2FA = (code: string) => this.fallback(
    this.request<{ success: boolean; message: string }>('/auth/2fa/turn-off', { method: 'POST', body: JSON.stringify({ code }) }),
    () => {
      const me = this.getLocalUser() || CURRENT_DEMO_USER;
      me.twoFactorEnabled = false;
      this.saveLocalUser(me);
      return { success: true, message: '2FA désactivée.' };
    }
  );

  public getPosts = () => this.fallback(this.request<Post[]>('/posts'), MOCK_POSTS);

  public createPost = (content: string, tags: string[] = [], gameResult?: any) => this.fallback(
    this.request<Post>('/posts', { method: 'POST', body: JSON.stringify({ content, tags, gameResult }) }),
    () => {
      const newPost: Post = {
        id: `post-${Date.now()}`, content, author: this.getLocalUser() || CURRENT_DEMO_USER,
        likesCount: 0, isLiked: false, commentsCount: 0, tags, gameResult, createdAt: new Date().toISOString(),
      };
      MOCK_POSTS.unshift(newPost);
      return newPost;
    }
  );

  public deletePost = (id: string) => this.fallback(
    this.request<void>(`/posts/${id}`, { method: 'DELETE' }),
    () => {
      const idx = MOCK_POSTS.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_POSTS.splice(idx, 1);
    }
  );

  public getPostComments = (postId: string) => this.fallback(
    this.request<Comment[]>(`/posts/${postId}/comments`),
    MOCK_COMMENTS[postId] || []
  );

  public createComment = (postId: string, content: string) => this.fallback(
    this.request<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    () => {
      const newComment: Comment = {
        id: `comm-${Date.now()}`, postId, content, author: this.getLocalUser() || CURRENT_DEMO_USER,
        createdAt: new Date().toISOString(),
      };
      if (!MOCK_COMMENTS[postId]) MOCK_COMMENTS[postId] = [];
      MOCK_COMMENTS[postId].push(newComment);
      return newComment;
    }
  );

  public getFriends = () => this.fallback(this.request<Friendship[]>('/friends'), []);
  public getAllUsers = () => this.fallback(this.request<User[]>('/users'), () => { const me = this.getLocalUser(); return me ? [me] : []; });
  public getUsers = () => this.getAllUsers();
  public sendFriendRequest = (receiverId: string) => this.request(`/friends/request/${receiverId}`, { method: 'POST' });
  public acceptFriendRequest = (requestId: string) => this.request(`/friends/accept/${requestId}`, { method: 'PATCH' });
  public declineFriendRequest = (requestId: string) => this.request(`/friends/decline/${requestId}`, { method: 'PATCH' });
  public removeFriend = (friendId: string) => this.request(`/friends/${friendId}`, { method: 'DELETE' });

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.fallback(
      this.request<any[]>('/matches/leaderboard').then(raw => {
        if (!Array.isArray(raw) || raw.length === 0) throw new Error();
        return raw.map((u, idx) => ({
          rank: idx + 1, user: u, rating: u.eloRating || 1000,
          wins: u.wins || 0, losses: u.losses || 0,
          winRate: (u.wins || 0) + (u.losses || 0) > 0 ? Math.round(((u.wins || 0) / ((u.wins || 0) + (u.losses || 0))) * 100) : 0,
          streak: Math.min(u.wins || 0, 5),
        }));
      }),
      () => {
        const me = this.getLocalUser();
        const list = [...MOCK_USERS];
        if (me && !list.some(u => u.id === me.id)) list.unshift(me);
        return list.map((u, idx) => ({
          rank: idx + 1, user: u, rating: u.eloRating || Math.max(800, 1400 - idx * 60),
          wins: u.wins || 0, losses: u.losses || 0,
          winRate: (u.wins || 0) + (u.losses || 0) > 0 ? Math.round(((u.wins || 0) / ((u.wins || 0) + (u.losses || 0))) * 100) : 60,
          streak: Math.min(u.wins || 0, 5),
        }));
      }
    );
  }

  public getLeaderboardSync(): LeaderboardEntry[] {
    const me = this.getLocalUser();
    const list = [...MOCK_USERS];
    if (me && !list.some(u => u.id === me.id)) list.unshift(me);
    return list.map((u, idx) => ({
      rank: idx + 1, user: u, rating: u.eloRating || Math.max(800, 1400 - idx * 60),
      wins: u.wins || 0, losses: u.losses || 0, winRate: 50, streak: 0,
    }));
  }

  public getMatchHistory = () => this.fallback(
    this.request<any[]>('/matches/history').then(raw => {
      if (!Array.isArray(raw)) return [];
      return raw.map(m => ({
        id: m.id, gameType: 'PONG' as const, opponentName: m.opponentName || 'Adversaire',
        userScore: m.player1Score || 0, opponent: m.opponentName || 'Adversaire',
        myScore: m.player1Score || 0, opponentScore: m.player2Score || 0,
        result: (m.result || 'VICTORY') as 'VICTORY' | 'DEFEAT',
        gameMode: m.matchSize || '1v1',
        date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Aujourd\'hui',
        duration: m.durationSeconds ? `${Math.floor(m.durationSeconds / 60)}:${(m.durationSeconds % 60).toString().padStart(2, '0')}` : '02:00',
        xpEarned: m.result === 'VICTORY' ? 150 : 50,
      }));
    }),
    []
  );

  public getMatchHistorySync = (): GameMatchHistory[] => [];
  public getCosmeticsInventory = () => this.fallback(this.request<any[]>('/cosmetics/inventory'), []);
  public getCosmeticsWallet = () => this.fallback(this.request<any>('/cosmetics/wallet'), { credits: 3850, stardust: 180, pityCounter: 18 });
  public equipCosmeticItem = (dto: any) => this.fallback(this.request<any[]>('/cosmetics/equip', { method: 'POST', body: JSON.stringify(dto) }), []);
  public fuseCosmeticItem = (dto: any) => this.request<any>('/cosmetics/fuse', { method: 'POST', body: JSON.stringify(dto) });
  public autoFuseCosmetics = (dto: any) => this.request<any>('/cosmetics/auto-fuse', { method: 'POST', body: JSON.stringify(dto) });
  public gachaPull = (dto: any) => this.request<any>('/cosmetics/gacha/pull', { method: 'POST', body: JSON.stringify(dto) });
  public buyCosmeticItem = (dto: any) => this.request<any>('/cosmetics/shop/buy', { method: 'POST', body: JSON.stringify(dto) });
  public unlockChampion = (championRole: string) => this.request<any>('/cosmetics/champions/unlock', { method: 'POST', body: JSON.stringify({ championRole }) });
  public togglePostLike = (postId: string) => this.fallback(this.request<any>(`/posts/${postId}/like`, { method: 'POST' }), { success: true });
  public getNotifications = () => this.fallback(this.request<any[]>('/notifications'), []);
  public markNotificationAsRead = (id: string) => this.fallback(this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' }), { success: true });
  public markAllNotificationsAsRead = () => this.fallback(this.request<any>('/notifications/read-all', { method: 'POST' }), { success: true });
  public deleteNotification = (id: string) => this.fallback(this.request<any>(`/notifications/${id}`, { method: 'DELETE' }), { success: true });
  public searchAll = (query: string) => this.fallback(this.request<any>(`/search?q=${encodeURIComponent(query)}`), { users: [], games: [], posts: [] });

  public getLocalUser(): User | null {
    const raw = localStorage.getItem('active_user');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  public saveLocalUser(user: User) {
    localStorage.setItem('active_user', JSON.stringify(user));
  }
}

export const api = new ApiService();
export default api;

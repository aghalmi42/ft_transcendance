import type {
  User,
  Post,
  Comment,
  Friendship,
  LeaderboardEntry,
  GameMatchHistory,
  AuthResponse,
  TicTacToeState,
  Tournament,
  TournamentPlayer,
  TournamentMatch
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

const mapTournamentPlayer = (u: any, seed?: number): TournamentPlayer | null => {
  if (!u) return null;
  return { id: u.id, username: u.username, avatar: u.avatar, seed: seed ?? 0 };
};

const mapTournament = (raw: any): Tournament => ({
  id: raw.id,
  name: raw.name,
  size: raw.size,
  status: raw.status,
  players: (raw.participants || []).map((p: any) => mapTournamentPlayer(p.user, p.seed)).filter(Boolean),
  matches: (raw.matches || []).map((m: any): TournamentMatch => ({
    id: m.id,
    round: m.round,
    matchNumber: m.matchNumber,
    player1: mapTournamentPlayer(m.player1),
    player2: mapTournamentPlayer(m.player2),
    score1: m.score1,
    score2: m.score2,
    winner: mapTournamentPlayer(m.winner),
    isCompleted: m.isCompleted,
  })),
  champion: mapTournamentPlayer(raw.champion),
  createdAt: raw.createdAt,
});

const mapMatchHistoryList = (raw: any): GameMatchHistory[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => ({
    id: m.id, gameType: m.gameType || 'PONG', opponentName: m.opponentName || 'Adversaire',
    opponentAvatar: m.opponentAvatar,
    userScore: m.player1Score || 0, opponent: m.opponentName || 'Adversaire',
    myScore: m.player1Score || 0, opponentScore: m.player2Score || 0,
    result: (m.result || 'VICTORY') as 'VICTORY' | 'DEFEAT' | 'DRAW',
    gameMode: m.matchSize || '1v1',
    date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Aujourd\'hui',
    duration: m.durationSeconds ? `${Math.floor(m.durationSeconds / 60)}:${(m.durationSeconds % 60).toString().padStart(2, '0')}` : undefined,
    xpEarned: m.result === 'VICTORY' ? 50 : m.result === 'DRAW' ? 20 : 10,
  }));
};

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
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...this.getHeaders(), ...(options.headers || {}) },
      });
    } catch (err) {
      // Network/connectivity failure: the backend itself is unreachable.
      this.backendAvailable = false;
      this.lastBackendFailure = Date.now();
      throw err;
    }
    this.backendAvailable = true;
    this.lastBackendFailure = 0;
    if (!res.ok) {
      // A real HTTP response from a live backend (e.g. 401 invalid credentials,
      // 409 conflict) is a business-logic error, not a connectivity failure —
      // it must propagate as-is and must NOT trip the offline fallback.
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body?.message) message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      } catch { /* no JSON body */ }
      throw new Error(message);
    }
    return await res.json();
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
    // Authentication must always hit the real backend and validate against the
    // database. No mock fallback here — falling back on a rejected login would
    // let any input in (and previously defaulted to the mock "Administrator" user).
    const res = await this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.accessToken) this.setToken(res.accessToken);
    if (res.user) this.saveLocalUser(res.user);
    return res;
  }

  public async register(usernameOrPayload: string | { username: string; email: string; password?: string }, emailParam?: string, passwordParam?: string): Promise<AuthResponse> {
    const username = typeof usernameOrPayload === 'object' ? usernameOrPayload.username : usernameOrPayload;
    const email = typeof usernameOrPayload === 'object' ? usernameOrPayload.email : (emailParam || '');
    const password = typeof usernameOrPayload === 'object' ? usernameOrPayload.password : passwordParam;
    // Same as login: must hit the real backend so the account actually lands
    // in the database, instead of silently creating a fake local-only user.
    const res = await this.request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
    if (res.accessToken) this.setToken(res.accessToken);
    if (res.user) this.saveLocalUser(res.user);
    return res;
  }

  // No mock fallback: an invalid/expired token must not silently resolve to
  // a cached or demo user. AuthContext already handles the rejection itself.
  public getMe = () => this.request<User>('/users/me');

  // Real GDPR export straight from the backend (profile, posts, comments,
  // likes, friendships, game history, notifications, messages sent) — no
  // mock fallback, a partial/fake export would defeat the point of it.
  public exportGdprData = () => this.request<Record<string, unknown>>('/gdpr/export');

  // No mock fallback: a profile edit that only "succeeds" in localStorage would
  // mislead the user into thinking it was saved when it wasn't (silent data loss).
  public updateProfile = async (payload: Partial<User>): Promise<User> => {
    const updated = await this.request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });
    this.saveLocalUser(updated);
    return updated;
  };

  public updateUser = async (id: string, payload: Partial<User>) => {
    try {
      const updated = await this.request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      this.saveLocalUser(updated);
      return updated;
    } catch {
      return this.updateProfile(payload);
    }
  };

  public async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/users/me/avatar`, { method: 'POST', headers, body: formData });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body?.message) message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      } catch { /* no JSON body */ }
      throw new Error(message);
    }
    const user = await res.json();
    this.saveLocalUser(user);
    return user;
  }

  public deleteUser = (id: string) => this.request<void>(`/users/${id}`, { method: 'DELETE' });

  // No mock fallback: a password change that only "succeeds" locally would be
  // actively dangerous (user believes their credentials rotated when they didn't).
  public changePassword = (currentPassword: string, newPassword: string) =>
    this.request<{ success: boolean }>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

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
    this.request<any[]>('/matches/history').then(mapMatchHistoryList),
    [] as GameMatchHistory[]
  );

  // Same shape, for viewing another player's public match history (e.g. from
  // their profile card).
  public getMatchHistoryFor = (userId: string) => this.fallback(
    this.request<any[]>(`/matches/history/${userId}`).then(mapMatchHistoryList),
    [] as GameMatchHistory[]
  );

  public getMatchHistorySync = (): GameMatchHistory[] => [];
  public togglePostLike = (postId: string) => this.fallback(this.request<any>(`/posts/${postId}/like`, { method: 'POST' }), { success: true });
  public getNotifications = () => this.fallback(this.request<any[]>('/notifications'), []);
  public markNotificationAsRead = (id: string) => this.fallback(this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' }), { success: true });
  public markAllNotificationsAsRead = () => this.fallback(this.request<any>('/notifications/read-all', { method: 'POST' }), { success: true });
  public deleteNotification = (id: string) => this.fallback(this.request<any>(`/notifications/${id}`, { method: 'DELETE' }), { success: true });
  public searchAll = (query: string) => this.fallback(this.request<any>(`/search?q=${encodeURIComponent(query)}`), { users: [], games: [], posts: [] });

  // Public API key management (self-service). The raw key is only ever
  // returned once, right here, at creation time.
  public listApiKeys = () => this.fallback(this.request<any[]>('/api-keys'), [] as any[]);
  public createApiKey = (label: string) =>
    this.request<{ id: string; key: string; label: string }>('/api-keys', { method: 'POST', body: JSON.stringify({ label }) });
  public revokeApiKey = (id: string) => this.request<{ success: boolean }>(`/api-keys/${id}`, { method: 'DELETE' });

  public createTicTacToeGame = (opponentId: string) =>
    this.request<{ gameId: string }>('/games', { method: 'POST', body: JSON.stringify({ opponentId }) });
  public joinTicTacToeGame = (gameId: string) =>
    this.request<TicTacToeState>(`/games/${gameId}/join`, { method: 'POST' });
  public getTicTacToeGame = (gameId: string) =>
    this.request<TicTacToeState>(`/games/${gameId}`);

  public getTournaments = () => this.fallback(
    this.request<any[]>('/tournaments').then((raw) => raw.map(mapTournament)),
    [] as Tournament[],
  );

  public getTournament = (id: string) => this.request<any>(`/tournaments/${id}`).then(mapTournament);

  public createTournament = (name: string, size: 4 | 8) =>
    this.request<any>('/tournaments', { method: 'POST', body: JSON.stringify({ name, size }) }).then(mapTournament);

  public registerForTournament = (id: string) =>
    this.request<any>(`/tournaments/${id}/register`, { method: 'POST' }).then(mapTournament);

  public unregisterFromTournament = (id: string) =>
    this.request<{ success: boolean }>(`/tournaments/${id}/register`, { method: 'DELETE' });

  public reportTournamentMatchResult = (tournamentId: string, matchId: string, winnerId: string, score1: number, score2: number) =>
    this.request<any>(`/tournaments/${tournamentId}/matches/${matchId}/report`, {
      method: 'POST',
      body: JSON.stringify({ winnerId, score1, score2 }),
    }).then(mapTournament);

  // A degraded/down backend answers with a non-2xx status on purpose (so
  // infra monitoring notices) — but that body is still exactly what this
  // status page wants to show, so read it regardless of res.ok.
  public async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptimeSeconds: number;
    database: { status: string; latencyMs?: number; error?: string };
  }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }

  // Whether "Se connecter avec 42" can actually work (FORTYTWO_CLIENT_ID/SECRET
  // configured server-side) — lets the UI disable the button instead of
  // bouncing the user through a redirect that 503s.
  public async getFortyTwoStatus(): Promise<{ configured: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/42/status`);
      return await res.json();
    } catch {
      return { configured: false };
    }
  }

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

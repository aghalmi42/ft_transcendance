// -----------------------------------------------------------------------------
// REAL-TIME API CLIENT & MOCK FALLBACK CONTROLLER (ft_transcendence)
// -----------------------------------------------------------------------------
// - REAL-TIME: Communicates via HTTP fetch with NestJS backend at API_BASE_URL.
// - MOCK FALLBACK: Seamlessly falls back to mockData.ts when offline / backend unavailable.
// -----------------------------------------------------------------------------

import type {
  User,
  Friendship,
  LeaderboardEntry,
  GameMatchHistory,
  AuthResponse,
  PostItem,
  CommentItem
} from '../types';

import {
  MOCK_USERS,
  CURRENT_DEMO_USER
} from './mockData';


export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private token: string | null = localStorage.getItem('token');
  private backendAvailable: boolean = true;

  // --- TOKEN MANAGEMENT ---
  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  public isBackendOnline(): boolean {
    return this.backendAvailable;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private lastBackendFailure = 0;

  // Generic HTTP fetcher with automatic mock fallback on network failure
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    // If backend was checked and offline within the last 60 seconds, immediately use mock fallback
    if (Date.now() - this.lastBackendFailure < 60000 && !this.backendAvailable) {
      throw new Error(`Backend offline (cached)`);
    }


    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      this.backendAvailable = true;
      this.lastBackendFailure = 0;
      return await response.json();
    } catch (err) {
      this.backendAvailable = false;
      this.lastBackendFailure = Date.now();
      throw err;
    }
  }


  // ===========================================================================
  // 1. AUTHENTICATION & PROFILE ENDPOINTS
  // ===========================================================================
  public async login(
    emailOrPayload: string | { email: string; password?: string },
    passwordParam?: string,
  ): Promise<AuthResponse> {
    const email = typeof emailOrPayload === 'object' ? emailOrPayload.email : emailOrPayload;
    const password = typeof emailOrPayload === 'object' ? emailOrPayload.password : passwordParam;

    try {
      const res = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.accessToken) this.setToken(res.accessToken);
      if (res.user) this.saveLocalUser(res.user);
      return res;
    } catch {
      console.info('[API Mock] Simulating login with MOCK_USERS');
      const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || CURRENT_DEMO_USER;
      const fakeToken = 'mock_jwt_token_' + Date.now();
      this.setToken(fakeToken);
      this.saveLocalUser(found);
      return { accessToken: fakeToken, user: found };
    }
  }

  public async register(
    usernameOrPayload: string | { username: string; email: string; password?: string },
    emailParam?: string,
    passwordParam?: string,
  ): Promise<AuthResponse> {
    const username = typeof usernameOrPayload === 'object' ? usernameOrPayload.username : usernameOrPayload;
    const email = typeof usernameOrPayload === 'object' ? usernameOrPayload.email : (emailParam || '');
    const password = typeof usernameOrPayload === 'object' ? usernameOrPayload.password : passwordParam;

    try {
      const res = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      if (res.accessToken) this.setToken(res.accessToken);
      if (res.user) this.saveLocalUser(res.user);
      return res;
    } catch {
      console.info('[API Mock] Simulating registration with new profile');
      const newUser: User = {
        id: 'user-' + Date.now(),
        username,
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        bio: 'New challenger on ft_transcendence !',
        status: 'ONLINE',
        level: 1,
        xp: 0,
        wins: 0,
        losses: 0,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      };
      const fakeToken = 'mock_jwt_token_' + Date.now();
      this.setToken(fakeToken);
      this.saveLocalUser(newUser);
      return { accessToken: fakeToken, user: newUser };
    }
  }

  public async getMe(): Promise<User> {
    if (!this.backendAvailable && Date.now() - this.lastBackendFailure < 60000) {
      return this.getLocalUser() || CURRENT_DEMO_USER;
    }
    try {
      return await this.request<User>('/users/me');
    } catch {
      return this.getLocalUser() || CURRENT_DEMO_USER;
    }
  }


  public async updateProfile(payload: Partial<User>): Promise<User> {
    try {
      return await this.request<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch {
      const me = this.getLocalUser() || CURRENT_DEMO_USER;
      const updated = { ...me, ...payload, updatedAt: new Date().toISOString() };
      this.saveLocalUser(updated);
      return updated;
    }
  }

  public async updateUser(id: string, payload: Partial<User>): Promise<User> {
    try {
      return await this.request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch {
      return this.updateProfile(payload);
    }
  }

  public async deleteUser(id: string): Promise<void> {
    try {
      await this.request(`/users/${id}`, { method: 'DELETE' });
    } catch {
      localStorage.removeItem('active_user');
      this.setToken(null);
    }
  }

  // Real 2FA Backend Integration
  public async generate2FA(): Promise<{ secret: string; otpAuthUrl: string; qrCodeUrl: string }> {
    try {
      return await this.request('/auth/2fa/generate', { method: 'POST' });
    } catch {
      return {
        secret: 'JBSWY3DPEHPK3PXP',
        otpAuthUrl: 'otpauth://totp/ft_transcendence:demo?secret=JBSWY3DPEHPK3PXP',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=otpauth://totp/ft_transcendence:demo',
      };
    }
  }

  public async turnOn2FA(code: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request('/auth/2fa/turn-on', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch {
      const me = this.getLocalUser() || CURRENT_DEMO_USER;
      me.twoFactorEnabled = true;
      this.saveLocalUser(me);
      return { success: true, message: '2FA activée.' };
    }
  }

  public async turnOff2FA(code: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request('/auth/2fa/turn-off', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch {
      const me = this.getLocalUser() || CURRENT_DEMO_USER;
      me.twoFactorEnabled = false;
      this.saveLocalUser(me);
      return { success: true, message: '2FA désactivée.' };
    }
  }

  // ===========================================================================
  // 2. FRIENDS & SOCIAL RELATIONSHIPS (REAL DATABASE USERS)
  // ===========================================================================

  public async getFriends(): Promise<Friendship[]> {
    try {
      return await this.request<Friendship[]>('/friends');
    } catch {
      return [];
    }
  }

  public async getAllUsers(): Promise<User[]> {
    if (!this.backendAvailable && Date.now() - this.lastBackendFailure < 60000) {
      const me = this.getLocalUser();
      return me ? [me] : [];
    }
    try {
      return await this.request<User[]>('/users');
    } catch {
      const me = this.getLocalUser();
      return me ? [me] : [];
    }
  }

  public async getUsers(): Promise<User[]> {
    return this.getAllUsers();
  }

  public async sendFriendRequest(receiverId: string): Promise<any> {
    return await this.request(`/friends/request/${receiverId}`, {
      method: 'POST',
    });
  }

  public async acceptFriendRequest(requestId: string): Promise<any> {
    return await this.request(`/friends/accept/${requestId}`, {
      method: 'PATCH',
    });
  }

  public async declineFriendRequest(requestId: string): Promise<any> {
    return await this.request(`/friends/decline/${requestId}`, {
      method: 'PATCH',
    });
  }

  public async removeFriend(friendId: string): Promise<any> {
    return await this.request(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // 5. STATS & LEADERBOARDS (REAL DATABASE MATCHES)
  // ===========================================================================
  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const rawUsers = await this.request<any[]>('/matches/leaderboard');
      if (Array.isArray(rawUsers) && rawUsers.length > 0) {
        return rawUsers.map((u, idx) => {
          const wins = u.wins || 0;
          const losses = u.losses || 0;
          const total = wins + losses;
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
          return {
            rank: idx + 1,
            user: u,
            rating: 1000,
            wins,
            losses,
            winRate,
            streak: Math.min(wins, 5),
          };
        });
      }
      const allUsers = await this.getAllUsers();
      return allUsers.map((u, idx) => ({
        rank: idx + 1,
        user: u,
        rating: 1000,
        wins: u.wins || 0,
        losses: u.losses || 0,
        winRate: (u.wins || 0) + (u.losses || 0) > 0 ? Math.round(((u.wins || 0) / ((u.wins || 0) + (u.losses || 0))) * 100) : 0,
        streak: Math.min(u.wins || 0, 5),
      }));
    } catch {
      const me = this.getLocalUser();
      const mockList = [...MOCK_USERS];
      if (me && !mockList.some(u => u.id === me.id)) {
        mockList.unshift(me);
      }
      return mockList.map((u, idx) => {
        const wins = u.wins || 0;
        const losses = u.losses || 0;
        const total = wins + losses;
        return {
          rank: idx + 1,
          user: u,
          rating: Math.max(800, 1400 - idx * 60),
          wins,
          losses,
          winRate: total > 0 ? Math.round((wins / total) * 100) : 60,
          streak: Math.min(wins, 5),
        };
      });
    }
  }

  public getLeaderboardSync(): LeaderboardEntry[] {
    const me = this.getLocalUser();
    const mockList = [...MOCK_USERS];
    if (me && !mockList.some(u => u.id === me.id)) {
      mockList.unshift(me);
    }
    return mockList.map((u, idx) => ({
      rank: idx + 1,
      user: u,
      rating: Math.max(800, 1400 - idx * 60),
      wins: u.wins || 0,
      losses: u.losses || 0,
      winRate: 50,
      streak: 0,
    }));
  }

  public async getMatchHistory(): Promise<GameMatchHistory[]> {
    try {
      const raw = await this.request<any[]>('/matches/history');
      if (Array.isArray(raw)) {
        return raw.map(m => ({
          id: m.id,
          gameType: m.gameType || 'PONG',
          opponentName: m.opponentName || 'Adversaire',
          userScore: m.player1Score ?? m.userScore ?? 0,
          opponentScore: m.player2Score ?? m.opponentScore ?? 0,
          result: m.result || 'VICTORY',
          date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Aujourd\'hui',
          durationSeconds: m.durationSeconds || 120,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public getMatchHistorySync(): GameMatchHistory[] {
    return [];
  }

  // ===========================================================================
  // 6. POSTS, COMMENTS & LIKES ENDPOINTS
  // ===========================================================================
  public async getPosts(): Promise<PostItem[]> {
    try {
      const posts = await this.request<PostItem[]>('/posts');
      return Array.isArray(posts) ? posts : [];
    } catch {
      return [];
    }
  }

  public async getPostById(id: string): Promise<PostItem | null> {
    try {
      return await this.request<PostItem>(`/posts/${id}`);
    } catch {
      return null;
    }
  }

  public async getPostsByUser(userId: string): Promise<PostItem[]> {
    try {
      const posts = await this.request<PostItem[]>(`/posts/user/${userId}`);
      return Array.isArray(posts) ? posts : [];
    } catch {
      return [];
    }
  }

  public async createPost(content: string): Promise<PostItem> {
    return this.request<PostItem>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  public async updatePost(id: string, content: string): Promise<PostItem> {
    return this.request<PostItem>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  public async deletePost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  public async getPostComments(postId: string): Promise<CommentItem[]> {
    try {
      const comments = await this.request<CommentItem[]>(`/posts/${postId}/comments`);
      return Array.isArray(comments) ? comments : [];
    } catch {
      return [];
    }
  }

  public async createComment(postId: string, content: string): Promise<CommentItem> {
    return this.request<CommentItem>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  public async updateComment(id: string, content: string): Promise<CommentItem> {
    return this.request<CommentItem>(`/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  public async deleteComment(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  public async togglePostLike(postId: string): Promise<{ liked: boolean }> {
    return this.request<{ liked: boolean }>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  public async toggleCommentLike(commentId: string): Promise<{ liked: boolean }> {
    return this.request<{ liked: boolean }>(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // 7. LOCAL STORAGE HELPERS
  // ===========================================================================
  public getLocalUser(): User | null {
    const raw = localStorage.getItem('active_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }

  public saveLocalUser(user: User) {
    localStorage.setItem('active_user', JSON.stringify(user));
  }
}

export const api = new ApiService();
export default api;


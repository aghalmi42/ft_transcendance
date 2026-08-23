// Runtime & Type Definition for UserStatus
export const UserStatus = {
  ONLINE: 'ONLINE',
  IN_GAME: 'IN_GAME',
  AWAY: 'AWAY',
  OFFLINE: 'OFFLINE',
} as const;

export type UserStatus = 'ONLINE' | 'IN_GAME' | 'AWAY' | 'OFFLINE';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: UserStatus;
  level?: number;
  xp?: number;
  nextLevelXp?: number;
  wins?: number;
  losses?: number;
  eloRating?: number;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: User;
}

export interface Friendship {
  id: string;
  sender: User;
  receiver: User;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
}


export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId?: string;

  channelId?: string;
  content: string;
  createdAt?: string;
  timestamp?: string;
  isGameInvite?: boolean;
  gameInvite?: {
    gameType: 'PONG' | 'TICTACTOE' | 'QUIZ' | 'SNAKE';
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    senderName?: string;
    roomId?: string;
    targetScore?: number;
  };
  gameInviteDetails?: {
    gameType: 'PONG' | 'TICTACTOE' | 'QUIZ' | 'SNAKE';
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    senderName?: string;
    roomId?: string;
    targetScore?: number;
  };
}

export interface GameMatchHistory {
  id: string;
  gameType: 'PONG' | 'TICTACTOE' | 'QUIZ' | 'SNAKE' | string;
  opponentName: string;
  opponentAvatar?: string;
  userScore: number;
  opponentScore: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  date: string;
  durationSeconds?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PongTheme {
  id: string;
  name: string;
  bg: string;
  paddleColor: string;
  ballColor: string;
  lineColor: string;
  glowColor: string;
}

export interface PongConfig {
  maxScore: number;
  ballSpeed: number;
  paddleSize: 'SMALL' | 'NORMAL' | 'LARGE';
  powerUps: boolean;
  theme: string;
  mode: 'LOCAL_PVP' | 'VS_AI' | 'REMOTE_SIM' | 'TOURNAMENT';
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  scoreToWin?: number;
  powerUpsEnabled?: boolean;
}

export interface TournamentPlayer {
  id: string;
  username: string;
  avatar?: string;
  isAI?: boolean;
  seed: number;
}

export interface TournamentMatch {
  id: string;
  round: number;
  matchIndex?: number;
  matchNumber?: number;
  player1?: TournamentPlayer | null;
  player2?: TournamentPlayer | null;
  score1?: number;
  score2?: number;
  winner?: TournamentPlayer | null;
  isCompleted: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  size: 4 | 8;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  champion?: TournamentPlayer | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
}

export interface NotificationItem {
  id: string;
  type: 'FRIEND_REQUEST' | 'GAME_INVITE' | 'MATCH_RESULT' | 'SYSTEM' | string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
  timestamp?: string;
  data?: any;
}

export interface PostLikeItem {
  id: string;
  userId?: string;
  user?: User;
  createdAt?: string;
}

export interface CommentLikeItem {
  id: string;
  userId?: string;
  user?: User;
  createdAt?: string;
}

export interface CommentItem {
  id: string;
  content: string;
  author: User;
  postId?: string;
  likes?: CommentLikeItem[];
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PostItem {
  id: string;
  content: string;
  author: User;
  comments?: CommentItem[];
  commentsCount?: number;
  likes?: PostLikeItem[];
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}


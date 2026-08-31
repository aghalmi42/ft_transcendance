export const UserStatus = {
  ONLINE: 'ONLINE',
  IN_GAME: 'IN_GAME',
  AWAY: 'AWAY',
  OFFLINE: 'OFFLINE',
} as const;

export type UserStatus = 'ONLINE' | 'IN_GAME' | 'AWAY' | 'OFFLINE';

export const UserRole = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: UserStatus;
  role?: UserRole;
  level?: number;
  xp?: number;
  nextLevelXp?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  eloRating?: number;
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

export interface Post {
  id: string;
  content: string;
  author: User;
  likesCount: number;
  likes?: PostLikeItem[];
  isLiked?: boolean;
  commentsCount?: number;
  comments?: CommentItem[];
  tags?: string[];
  gameResult?: {
    gameType: string;
    score: string;
    result: 'VICTORY' | 'DEFEAT';
  };
  createdAt: string;
  updatedAt?: string;
}

export type PostItem = Post;

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CommentItem = Comment;

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

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp?: string;
  createdAt?: string;
  isGameInvite?: boolean;
  gameInviteDetails?: {
    gameType: 'PONG' | 'TICTACTOE' | 'QUIZ' | 'SNAKE' | string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    senderName?: string;
    roomId?: string;
    targetScore?: number;
  };
}

export interface GameMatchHistory {
  id: string;
  gameType?: 'PONG' | 'TICTACTOE' | 'QUIZ' | string;
  opponentName?: string;
  opponent?: string;
  opponentAvatar?: string;
  userScore?: number;
  myScore?: number;
  opponentScore?: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  gameMode?: string;
  duration?: string;
  durationSeconds?: number;
  xpEarned?: number;
  date: string;
}

export interface TicTacToeState {
  gameId: string;
  board: ('X' | 'O' | null)[];
  currentPlayer: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished' | 'draw';
  winner: 'X' | 'O' | null;
  playerXId: string;
  playerOId: string;
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
  matchNumber: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  score1: number;
  score2: number;
  winner: TournamentPlayer | null;
  isCompleted: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  size: 4 | 8;
  status: 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED';
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  champion: TournamentPlayer | null;
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
  title: string;
  message: string;
  type: 'FRIEND_REQUEST' | 'GAME_INVITE' | 'POST_LIKE' | 'POST_COMMENT' | 'MATCH_RESULT' | 'SYSTEM' | string;
  read: boolean;
  timestamp?: string;
  createdAt?: string;
  link?: string;
  data?: any;
}

export const User = {};
export const AuthResponse = {};
export const Friendship = {};
export const Post = {};
export const Comment = {};
export const ChatMessage = {};
export const GameMatchHistory = {};
export const Achievement = {};
export const PongTheme = {};
export const PongConfig = {};
export const TournamentPlayer = {};
export const TournamentMatch = {};
export const Tournament = {};
export const LeaderboardEntry = {};
export const NotificationItem = {};

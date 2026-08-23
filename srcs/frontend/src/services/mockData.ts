// -----------------------------------------------------------------------------
// CENTRALIZED MOCK DATA STORE (ft_transcendence 42 Subject)
// -----------------------------------------------------------------------------

import type {
  User,
  UserStatus,
  Friendship,
  LeaderboardEntry,
  GameMatchHistory,
  ChatMessage
} from '../types';

// =============================================================================
// 1. MOCK USERS & PROFILES
// =============================================================================
export const MOCK_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    username: 'Administrator',
    email: 'admin@admin.fr',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Administrator',
    bio: 'Super Administrateur de la plateforme ft_transcendence.',
    status: 'ONLINE' as UserStatus,
    level: 10,
    xp: 2500,
    wins: 15,
    losses: 2,
    twoFactorEnabled: false,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'CyberPonger',
    email: 'ponger@transcendence.42',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberPonger',
    bio: 'Champion Pong & joueur régulier.',
    status: 'ONLINE' as UserStatus,
    level: 7,
    xp: 1400,
    wins: 18,
    losses: 5,
    twoFactorEnabled: false,
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'NeonValkyrie',
    email: 'valkyrie@transcendence.42',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonValkyrie',
    bio: 'Passionnée de tournois 1v1.',
    status: 'IN_GAME' as UserStatus,
    level: 5,
    xp: 900,
    wins: 10,
    losses: 4,
    twoFactorEnabled: false,
    createdAt: '2026-08-02T14:30:00.000Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    username: 'PixelKnight',
    email: 'knight@transcendence.42',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelKnight',
    bio: 'Stratège Pong & Morpion.',
    status: 'OFFLINE' as UserStatus,
    level: 4,
    xp: 600,
    wins: 8,
    losses: 7,
    twoFactorEnabled: false,
    createdAt: '2026-08-03T09:15:00.000Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    username: 'GlitchMaster',
    email: 'glitch@transcendence.42',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GlitchMaster',
    bio: 'Amateur de Snake et de parties rapides.',
    status: 'AWAY' as UserStatus,
    level: 3,
    xp: 400,
    wins: 5,
    losses: 6,
    twoFactorEnabled: false,
    createdAt: '2026-08-04T18:00:00.000Z',
  },
];

export const CURRENT_DEMO_USER: User = MOCK_USERS[0];

// =============================================================================
// 2. MOCK FRIENDSHIPS & RELATIONSHIPS
// =============================================================================
export const MOCK_FRIENDSHIPS: Friendship[] = [
  {
    id: 'f1',
    sender: MOCK_USERS[0],
    receiver: MOCK_USERS[1],
    status: 'ACCEPTED',
    createdAt: '2026-08-05T12:00:00.000Z',
  },
  {
    id: 'f2',
    sender: MOCK_USERS[0],
    receiver: MOCK_USERS[2],
    status: 'ACCEPTED',
    createdAt: '2026-08-06T15:30:00.000Z',
  },
  {
    id: 'f3',
    sender: MOCK_USERS[3],
    receiver: MOCK_USERS[0],
    status: 'PENDING',
    createdAt: '2026-08-07T08:45:00.000Z',
  },
];

// =============================================================================
// 3. MOCK DIRECT MESSAGES & CHAT
// =============================================================================
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: MOCK_USERS[1].id,
    senderName: MOCK_USERS[1].username,
    receiverId: MOCK_USERS[0].id,
    content: 'Salut ! Prêt pour une partie de Pong 1v1 ?',
    createdAt: '2026-08-08T10:00:00.000Z',
    timestamp: '10:00',
  },
  {
    id: 'msg-2',
    senderId: MOCK_USERS[0].id,
    senderName: MOCK_USERS[0].username,
    receiverId: MOCK_USERS[1].id,
    content: 'Oui avec plaisir, je rejoins le match !',
    createdAt: '2026-08-08T10:02:00.000Z',
    timestamp: '10:02',
  },
  {
    id: 'msg-3',
    senderId: MOCK_USERS[2].id,
    senderName: MOCK_USERS[2].username,
    receiverId: MOCK_USERS[0].id,
    content: 'Défi de Pong lancé !',
    createdAt: '2026-08-08T11:15:00.000Z',
    timestamp: '11:15',
    isGameInvite: true,
    gameInvite: {
      gameType: 'PONG',
      status: 'PENDING',
      senderName: MOCK_USERS[2].username,
      roomId: 'duel-room-42',
    },
  },
];

// =============================================================================
// 4. MOCK LEADERBOARDS & RANKINGS
// =============================================================================
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    user: MOCK_USERS[1],
    rating: 1250,
    wins: 18,
    losses: 5,
    winRate: 78.2,
    streak: 4,
  },
  {
    rank: 2,
    user: MOCK_USERS[0],
    rating: 1200,
    wins: 15,
    losses: 2,
    winRate: 88.2,
    streak: 5,
  },
  {
    rank: 3,
    user: MOCK_USERS[2],
    rating: 1100,
    wins: 10,
    losses: 4,
    winRate: 71.4,
    streak: 2,
  },
  {
    rank: 4,
    user: MOCK_USERS[3],
    rating: 980,
    wins: 8,
    losses: 7,
    winRate: 53.3,
    streak: 1,
  },
];

// =============================================================================
// 5. MOCK MATCH HISTORY
// =============================================================================
export const MOCK_MATCH_HISTORY: GameMatchHistory[] = [
  {
    id: 'm1',
    gameType: 'PONG',
    opponentName: 'NeonValkyrie',
    opponentAvatar: MOCK_USERS[2].avatar,
    userScore: 5,
    opponentScore: 4,
    result: 'VICTORY',
    date: 'Aujourd\'hui',
    durationSeconds: 142,
  },
  {
    id: 'm2',
    gameType: 'PONG',
    opponentName: 'Ordinateur (Moyen)',
    userScore: 5,
    opponentScore: 2,
    result: 'VICTORY',
    date: 'Hier',
    durationSeconds: 120,
  },
  {
    id: 'm3',
    gameType: 'TICTACTOE',
    opponentName: 'PixelKnight',
    opponentAvatar: MOCK_USERS[3].avatar,
    userScore: 3,
    opponentScore: 1,
    result: 'VICTORY',
    date: '19 Août',
    durationSeconds: 65,
  },
];

export default {
  MOCK_USERS,
  CURRENT_DEMO_USER,
  MOCK_FRIENDSHIPS,
  MOCK_CHAT_MESSAGES,
  MOCK_LEADERBOARD,
  MOCK_MATCH_HISTORY,
};

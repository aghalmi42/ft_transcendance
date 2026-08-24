import type {
  User,
  UserStatus,
  Post,
  Comment,
  Friendship,
  LeaderboardEntry,
  GameMatchHistory,
  ChatMessage,
  NotificationItem,
  PongTheme
} from '../types';

const createUser = (id: string, username: string, email: string, avatarSeed: string, bio: string, status: UserStatus, level: number, xp: number, wins: number, losses: number, twoFactor = false): User => ({
  id, username, email,
  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`,
  bio, status, level, xp, wins, losses,
  twoFactorEnabled: twoFactor,
  createdAt: '2026-08-01T00:00:00.000Z',
});

export const MOCK_USERS: User[] = [
  createUser('00000000-0000-0000-0000-000000000000', 'Administrator', 'admin@admin.fr', 'Administrator', 'Super Administrateur de la plateforme ft_transcendence.', 'ONLINE', 99, 99999, 150, 2),
  createUser('11111111-1111-1111-1111-111111111111', 'CyberPonger', 'ponger@transcendence.42', 'CyberPonger', 'Master of retro paddles & arcade tournaments.', 'ONLINE', 14, 4200, 48, 12),
  createUser('22222222-2222-2222-2222-222222222222', 'NeonValkyrie', 'valkyrie@transcendence.42', 'NeonValkyrie', 'Fullstack Slayer main. 15-game win streak.', 'IN_GAME', 21, 8900, 82, 19, true),
  createUser('33333333-3333-3333-3333-333333333333', 'PixelKnight', 'knight@transcendence.42', 'PixelKnight', 'Tank specialist looking for challenges.', 'ONLINE', 8, 1850, 19, 15),
  createUser('44444444-4444-4444-4444-444444444444', 'GlitchMaster', 'glitch@transcendence.42', 'GlitchMaster', 'Enchanteur Support master.', 'AWAY', 17, 5600, 53, 31),
];

export const CURRENT_DEMO_USER: User = MOCK_USERS[0];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    content: '🚀 Victoire incroyable 5-4 dans la Faille Magma contre NeonValkyrie ! Le nouveau tir double du Shooter a fait des ravages !',
    author: MOCK_USERS[0], likesCount: 14, isLiked: false, commentsCount: 3,
    tags: ['#PongChampion', '#Shooter', '#MagmaMap', '#EpicMatch'],
    gameResult: { gameType: 'PONG', score: '5 - 4', result: 'VICTORY' },
    createdAt: '2026-08-21T15:30:00.000Z',
  },
  {
    id: 'post-2',
    content: '🎮 Nouveau record personnel sur le mode 4v4 avec le Tank ! Plus de 2400 points de dégâts absorbés pour mon équipe !',
    author: MOCK_USERS[1], likesCount: 28, isLiked: true, commentsCount: 5,
    tags: ['#TankColosse', '#Pong4v4', '#Tournament'],
    gameResult: { gameType: 'PONG', score: '5 - 2', result: 'VICTORY' },
    createdAt: '2026-08-21T14:10:00.000Z',
  },
  {
    id: 'post-3',
    content: '🧠 10/10 sur le Quizz Spécial Développement Web & 42 ! Le Morpion Minimax reste invincible en mode Hard ! 🦾',
    author: MOCK_USERS[2], likesCount: 9, isLiked: false, commentsCount: 1,
    tags: ['#Quizz', '#Morpion', '#Minimax', '#GamingHub'],
    createdAt: '2026-08-21T11:00:00.000Z',
  }
];

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  'post-1': [
    { id: 'comm-101', postId: 'post-1', content: 'GG ! Ton dernier tir guidé à la 90e seconde était imparable ! 🔥', author: MOCK_USERS[1], createdAt: '2026-08-21T15:45:00.000Z' },
    { id: 'comm-102', postId: 'post-1', content: 'Revanche ce soir sur la Faille Cyber ? 🏓', author: MOCK_USERS[2], createdAt: '2026-08-21T16:00:00.000Z' }
  ],
  'post-2': [
    { id: 'comm-201', postId: 'post-2', content: 'Je m\'inscris au tournoi dès maintenant ! 🏆', author: MOCK_USERS[3], createdAt: '2026-08-21T14:25:00.000Z' }
  ]
};

export const MOCK_FRIENDSHIPS: Friendship[] = [
  { id: 'friend-1', sender: MOCK_USERS[0], receiver: MOCK_USERS[1], status: 'ACCEPTED', createdAt: '2026-08-05T10:00:00.000Z' },
  { id: 'friend-2', sender: MOCK_USERS[0], receiver: MOCK_USERS[2], status: 'ACCEPTED', createdAt: '2026-08-10T12:00:00.000Z' },
  { id: 'friend-3', sender: MOCK_USERS[3], receiver: MOCK_USERS[0], status: 'PENDING', createdAt: '2026-08-20T18:00:00.000Z' }
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'msg-1', senderId: MOCK_USERS[2].id, receiverId: MOCK_USERS[1].id, content: 'Salut ! Tu es chaud pour un match d\'entraînement Pong 4v4 ? 🏓', timestamp: '14:20' },
  { id: 'msg-2', senderId: MOCK_USERS[1].id, receiverId: MOCK_USERS[2].id, content: 'Carrément ! Avec la classe Support et le Trou Noir réanimateur !', timestamp: '14:22' },
  { id: 'msg-3', senderId: MOCK_USERS[2].id, receiverId: MOCK_USERS[1].id, content: 'Je t\'envoie l\'invitation de match direct :', timestamp: '14:23', isGameInvite: true, gameInviteDetails: { gameType: 'PONG', status: 'PENDING' } }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: MOCK_USERS[1], rating: 2150, wins: 82, losses: 19, winRate: 81.2, streak: 9 },
  { rank: 2, user: MOCK_USERS[0], rating: 1890, wins: 48, losses: 12, winRate: 80.0, streak: 4 },
  { rank: 3, user: MOCK_USERS[3], rating: 1640, wins: 53, losses: 31, winRate: 63.1, streak: 2 },
  { rank: 4, user: MOCK_USERS[2], rating: 1420, wins: 19, losses: 15, winRate: 55.8, streak: 1 },
];

export const MOCK_MATCH_HISTORY: GameMatchHistory[] = [
  { id: 'm1', gameType: 'PONG', opponentName: 'NeonValkyrie', opponentAvatar: MOCK_USERS[1].avatar, userScore: 5, opponentScore: 4, result: 'VICTORY', date: 'Aujourd\'hui 15:30', durationSeconds: 142 },
  { id: 'm2', gameType: 'PONG', opponentName: 'AI Bot Master', userScore: 2, opponentScore: 5, result: 'DEFEAT', date: 'Hier 20:12', durationSeconds: 190 },
  { id: 'm3', gameType: 'TICTACTOE', opponentName: 'PixelKnight', opponentAvatar: MOCK_USERS[2].avatar, userScore: 3, opponentScore: 1, result: 'VICTORY', date: '19 Août 16:30', durationSeconds: 65 },
  { id: 'm4', gameType: 'QUIZ', opponentName: 'GlitchMaster', opponentAvatar: MOCK_USERS[3].avatar, userScore: 450, opponentScore: 400, result: 'VICTORY', date: '18 Août 11:20', durationSeconds: 120 }
];

export interface MockGameServer {
  id: string;
  name: string;
  icon: string;
  game: string;
  gameIcon: string;
  description: string;
  membersCount: number;
  onlineCount: number;
  isPrivate: boolean;
  joined: boolean;
  owner: string;
  channels: { id: string; name: string; icon: string }[];
  recentActivity: string;
}

export const MOCK_GAME_SERVERS: MockGameServer[] = [
  {
    id: 'srv-1', name: '42 Pong Elite League', icon: '🏓', game: 'Pong RPG Ultimate', gameIcon: '🏓',
    description: 'Le serveur officiel des compétiteurs de Pong 42. Tournois hebdomadaires, scrims et ladder ELO.',
    membersCount: 142, onlineCount: 38, isPrivate: false, joined: true, owner: 'SuperPlayer42',
    channels: [{ id: 'ch-general', name: 'général-chat', icon: '💬' }, { id: 'ch-matches', name: 'organisation-matchs', icon: '⚔️' }],
    recentActivity: 'Tournoi Knockout programmé ce soir à 20h !',
  },
  {
    id: 'srv-2', name: 'Cyber Tron Grid Warriors', icon: '🏍️', game: 'Tron Lightcycles', gameIcon: '🏍️',
    description: 'Communauté des pilotes de Lightcycles. Défis 1v1 vitesse extrême et analyses de trajectoires.',
    membersCount: 89, onlineCount: 21, isPrivate: false, joined: true, owner: 'NeonKnight',
    channels: [{ id: 'ch-tron-gen', name: 'general-grid', icon: '💬' }],
    recentActivity: 'Record de vitesse battu par @ViperX !',
  }
];

export interface MockServerMessage {
  id: string;
  serverId: string;
  channelId: string;
  author: string;
  avatar: string;
  level: number;
  text: string;
  timestamp: string;
}

export const MOCK_SERVER_MESSAGES: MockServerMessage[] = [
  { id: 'm1', serverId: 'srv-1', channelId: 'ch-general', author: 'NeonKnight', avatar: '🛡️', level: 12, text: 'Bienvenue à tous les nouveaux challengers sur l\'arène !', timestamp: '11:30' },
  { id: 'm2', serverId: 'srv-1', channelId: 'ch-general', author: 'CyberPonger', avatar: '🏓', level: 18, text: 'Quelqu\'un pour tester le nouveau Trou Noir du Support ?', timestamp: '11:42' },
];

export interface MockSpectatorComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export const MOCK_SPECTATOR_COMMENTS: MockSpectatorComment[] = [
  { id: 'sc-1', user: 'NeonValkyrie', avatar: MOCK_USERS[2].avatar, text: 'Quel réflexe incroyable sur le tir guidé ! 🔥', time: '17:50' },
  { id: 'sc-2', user: 'PixelKnight', avatar: MOCK_USERS[3].avatar, text: 'Le Trou Noir du Support a réanimé toute la ligne arrière ! ⚡', time: '17:51' },
];

export const MOCK_NOTIFICATION_ITEMS: NotificationItem[] = [
  { id: 'n-1', type: 'GAME_INVITE', title: 'Défi 1v1 reçu !', message: 'CyberGamer vous défie sur Pong en mode Classé !', read: false, createdAt: new Date(Date.now() - 300000).toISOString(), data: { opponentName: 'CyberGamer', gameType: 'PONG' } },
  { id: 'n-2', type: 'FRIEND_REQUEST', title: 'Nouvelle demande d\'ami', message: 'NeonKnight souhaite vous ajouter à sa liste d\'amis.', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n-3', type: 'MATCH_RESULT', title: 'Victoire de Tournoi !', message: 'Vous avez progressé en quart de finale.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export interface MockMatchRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  result: 'VICTORY' | 'DEFEAT';
  mode: 'Classé 1v1' | 'Tournoi Knockout' | 'Duel Amical' | 'Solo Score Attack';
  myScore: number;
  opponentScore?: number;
  opponentName?: string;
  opponentAvatar?: string;
  opponentLevel?: number;
  duration: string;
  lpChange: number;
  xpEarned: number;
  date: string;
  kdaOrRatio?: string;
}

export const MOCK_PROFILE_MATCH_RECORDS: MockMatchRecord[] = [
  { id: 'm-101', gameId: 'pong', gameTitle: 'Pong RPG 2D', gameIcon: '🏓', result: 'VICTORY', mode: 'Classé 1v1', myScore: 5, opponentScore: 2, opponentName: 'NeonKnight', opponentAvatar: '🛡️', opponentLevel: 12, duration: '3m 45s', lpChange: +28, xpEarned: 150, date: 'Il y a 15 min', kdaOrRatio: '71% précision' },
  { id: 'm-102', gameId: 'shootactoe', gameTitle: 'ShooTacToe Dominion', gameIcon: '🚀', result: 'VICTORY', mode: 'Classé 1v1', myScore: 3, opponentScore: 1, opponentName: 'ViperX', opponentAvatar: '⚡', opponentLevel: 18, duration: '4m 10s', lpChange: +24, xpEarned: 130, date: 'Il y a 1h', kdaOrRatio: '3 alignements' },
  { id: 'm-103', gameId: 'snakeouttheflag', gameTitle: 'Snake Out the Flag', gameIcon: '🐍🚩', result: 'DEFEAT', mode: 'Classé 1v1', myScore: 2, opponentScore: 3, opponentName: 'GlitchMaster', opponentAvatar: '👾', opponentLevel: 22, duration: '5m 02s', lpChange: -15, xpEarned: 45, date: 'Il y a 3h', kdaOrRatio: '2 captures' },
  { id: 'm-104', gameId: 'pong', gameTitle: 'Pong RPG 2D • Pacman Goal', gameIcon: '🟡', result: 'VICTORY', mode: 'Tournoi Knockout', myScore: 3, opponentScore: 0, opponentName: 'ShadowReaper', opponentAvatar: '🗡️', opponentLevel: 15, duration: '2m 30s', lpChange: +35, xpEarned: 200, date: 'Hier', kdaOrRatio: 'MVP Match' },
];

export interface MockPublicRoom {
  id: string;
  name: string;
  icon: string;
  topic: string;
}

export const MOCK_PUBLIC_ROOMS: MockPublicRoom[] = [
  { id: 'general', name: 'Salon Général', icon: '🌐', topic: 'Discussion globale entre tous les joueurs de ft_transcendence' },
  { id: 'tournaments', name: 'Arène Duels & Tournois', icon: '🏆', topic: 'Trouvez un adversaire pour un duel Pong classé 1v1' },
];

export const DEFAULT_PONG_THEMES: PongTheme[] = [
  { id: 'cyber-neon', name: 'Cyber Neon', bg: '#090d16', paddleColor: '#8b5cf6', ballColor: '#38bdf8', lineColor: '#1e293b', glowColor: 'rgba(56, 189, 248, 0.6)' },
  { id: 'retro-arcade', name: 'Retro Arcade Vert', bg: '#051b11', paddleColor: '#10b981', ballColor: '#34d399', lineColor: '#064e3b', glowColor: 'rgba(52, 211, 153, 0.7)' },
  { id: 'synthwave-sunset', name: 'Synthwave Sunset', bg: '#180728', paddleColor: '#ec4899', ballColor: '#f59e0b', lineColor: '#4c1d95', glowColor: 'rgba(236, 72, 153, 0.7)' },
  { id: 'midnight-glitch', name: 'Midnight Glitch', bg: '#020617', paddleColor: '#06b6d4', ballColor: '#e0e7ff', lineColor: '#0f172a', glowColor: 'rgba(6, 182, 212, 0.7)' },
];

export interface GameInfo {
  id: string;
  title: string;
  genre: string;
  category: 'ACTION' | 'RETRO' | 'PUZZLE' | 'RACING';
  icon: string;
  players: string;
  tags: string[];
  bannerGradient: string;
  isPlayable: boolean;
  statusText: string;
  releaseYear?: string;
}

export const MOCK_GAMES_CATALOG: GameInfo[] = [
  {
    id: 'pong', title: 'Pong RPG 2D • Arène Cyber & Pacman Goal',
    genre: 'Hero RPG / Arcade Compétitif & Pacman', category: 'ACTION', icon: '🏓',
    players: '1v1 • 2v2 • 4v4 Raid • Touchdown • Pacman Goal',
    tags: ['Multijoueur', 'Compétitif', '4 Rôles RPG', 'Sorts & Ultime', 'Pacman Goal', 'ELO Ranking'],
    bannerGradient: 'from-slate-900 via-indigo-950 to-slate-900', isPlayable: true,
    statusText: 'Prêt à jouer • 60 FPS', releaseYear: 'Actif',
  },
  {
    id: 'shootactoe', title: 'ShooTacToe • Dominion Spatial',
    genre: 'Space Shooter & Morpion Stratégique', category: 'ACTION', icon: '🚀',
    players: '1v1, 2v2, 3v3, 4v4 • Multijoueur Local & Bots',
    tags: ['Vaisseaux Spatiaux', '4 Rôles RPG', 'Sorts & Ultime', 'Grille Tactique', 'Morpion Spatial'],
    bannerGradient: 'from-slate-900 via-cyan-950 to-slate-900', isPlayable: true,
    statusText: 'Prêt à jouer • 60 FPS', releaseYear: 'Nouveau',
  },
  {
    id: 'snakeouttheflag', title: 'Snake Out the Flag • Castle Wars CTF',
    genre: 'Capture the Flag Tactique & Snake Halo', category: 'ACTION', icon: '🐍🚩',
    players: '1v1, 2v2, 4v4 Castle Wars • Solo / Versus',
    tags: ['Capture the Flag', 'Halo Castle Wars', 'Croissance & Orbes', 'Corps Obstacle Défensif', 'Respawn & Base'],
    bannerGradient: 'from-slate-900 via-emerald-950 to-slate-900', isPlayable: true,
    statusText: 'Prêt à jouer • 60 FPS', releaseYear: 'Nouveau',
  },
];

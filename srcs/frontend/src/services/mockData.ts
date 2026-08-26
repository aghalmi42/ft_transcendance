import type {
  User,
  UserStatus,
  Post,
  Comment,
  Friendship,
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
  {
    id: 'tictactoe', title: 'Tic-Tac-Toe • Morpion en Ligne',
    genre: 'Stratégie Classique 1v1', category: 'PUZZLE', icon: '⭕',
    players: '1v1 en ligne',
    tags: ['Multijoueur', 'Temps Réel', 'Classique'],
    bannerGradient: 'from-slate-900 via-fuchsia-950 to-slate-900', isPlayable: true,
    statusText: 'Prêt à jouer', releaseYear: 'Nouveau',
  },
];

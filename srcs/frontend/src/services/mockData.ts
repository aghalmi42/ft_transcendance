import type {
  PongTheme
} from '../types';

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
    id: 'tictactoe', title: 'Tic-Tac-Toe • Morpion en Ligne',
    genre: 'Stratégie Classique 1v1', category: 'PUZZLE', icon: '⭕',
    players: '1v1 en ligne',
    tags: ['Multijoueur', 'Temps Réel', 'Classique'],
    bannerGradient: 'from-slate-900 via-fuchsia-950 to-slate-900', isPlayable: true,
    statusText: 'Prêt à jouer', releaseYear: 'Nouveau',
  },
];

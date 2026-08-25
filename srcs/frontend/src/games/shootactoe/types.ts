import type { HeroRole } from '../pong/types';

export type TeamColor = 'BLUE' | 'RED';
export type TeamSize = 1 | 2 | 3 | 4;

export interface ShipState {
  id: string;
  name: string;
  role?: HeroRole;
  roleTitle?: string;
  team: TeamColor;
  symbol: 'X' | 'O';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  targetAngle: number;
  radius: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  isAlive: boolean;
  respawnTimer: number;
  score: number;
  kills: number;
  deaths: number;
  dashCooldown: number;
  shootCooldown: number;
  isAI: boolean;
  color: string;
  accentColor: string;
}

export interface Bullet {
  id: string;
  shooterId: string;
  team: TeamColor;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface GridCell {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  owner: TeamColor | null;
  captureProgress: number;
  occupants: string[];
  isContested: boolean;
  isLocked: boolean;
}

export interface WinLine {
  indices: number[];
  type: 'ROW' | 'COL' | 'DIAG';
  winner: TeamColor;
}

export interface MatchStats {
  winner: TeamColor;
  durationSeconds: number;
  blueKills: number;
  redKills: number;
  blueCellsHeld: number;
  redCellsHeld: number;
  teamSize: TeamSize;
  gridDim: number;
  winLine: WinLine | null;
}

export type KeybindPreset = 'AZERTY' | 'QWERTY' | 'ARROWS' | 'CUSTOM';

export interface KeybindConfig {
  preset: KeybindPreset;
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  shoot: string;
  spell1: string;
  spell2: string;
  spell3: string;
  spell4: string;
}

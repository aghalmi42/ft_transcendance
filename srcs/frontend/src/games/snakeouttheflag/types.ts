export type TeamColor = 'BLUE' | 'RED';
export type TeamSize = 1 | 2 | 4;

export interface Point2D {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakePlayer {
  id: string;
  name: string;
  team: TeamColor;
  isAI: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  nextDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  segments: SnakeSegment[];
  length: number;
  targetLength: number;
  speed: number;
  baseSpeed: number;
  boostDuration: number;
  bombCooldown: number;
  hasShield: boolean;
  isAlive: boolean;
  respawnTimer: number;
  hasFlag: boolean;
  kills: number;
  deaths: number;
  flagsCaptured: number;
  color: string;
  accentColor: string;
}

export interface FlagState {
  team: TeamColor;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  isAtHome: boolean;
  carrierId: string | null;
}

export interface BombMine {
  id: string;
  ownerId: string;
  team: TeamColor;
  x: number;
  y: number;
  radius: number;
  explosionRadius: number;
  fuseTimer: number;
  initialTimer: number;
}

export type ConsumableType = 'GROWTH_ORB' | 'SPEED_BOOST' | 'SHIELD' | 'MEGA_APPLE';

export interface Consumable {
  id: string;
  type: ConsumableType;
  x: number;
  y: number;
  radius: number;
  color: string;
  points: number;
  growth: number;
}

export interface WallObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'BASE_WALL' | 'BRIDGE_RAIL' | 'TOWER' | 'RAMPART';
}

export interface MatchStatsCTF {
  winner: TeamColor;
  blueScore: number;
  redScore: number;
  durationSeconds: number;
  blueCaptures: number;
  redCaptures: number;
  playerKills: number;
  playerDeaths: number;
  teamSize: TeamSize;
}

export interface CTFKeybinds {
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  boost: string;
  bomb: string;
}

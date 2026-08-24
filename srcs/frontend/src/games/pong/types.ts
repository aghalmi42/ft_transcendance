export const MATCH_SIZES = ['PRACTICE', '1v1', 'ONLINE_1v1', '2v2', '3v3', '4v4', 'TOUCHDOWN', 'PACMAN_GOAL'] as const;
export const HERO_ROLES = ['SHOOTER', 'SLAYER', 'SUPPORT', 'TANK'] as const;
export const MAP_THEMES = ['CYBER', 'MAGMA', 'GLACIER', 'REACTOR', 'SANCTUARY', 'PACMAN_MAZE'] as const;
export const SELECTION_STEPS = ['MODE_SELECT', 'CONTROLS_SELECT', 'CHAMP_SELECT', 'MAP_SELECT', 'IN_GAME', 'ONLINE_MATCH', 'GAME_OVER'] as const;

export type MatchSize = typeof MATCH_SIZES[number];
export type HeroRole = typeof HERO_ROLES[number];
export type MapTheme = typeof MAP_THEMES[number];
export type SelectionStep = typeof SELECTION_STEPS[number];
export type ControlMode = 'KEYBOARD_MOUSE' | 'MOUSELESS';

export interface MapConfig {
  id: MapTheme;
  name: string;
  subtitle: string;
  icon: string;
  bgGradient: string;
  gridColor: string;
  ambientColor: string;
  hazardDesc: string;
  friction: number;
}

export interface SpellDefinition {
  id: string;
  key: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  cooldownMs: number;
  bannerText: string;
}

export interface HeroConfig {
  role: HeroRole;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  primaryColor: string;
  secondaryColor: string;
  paletteName?: string;
  badgeBg: string;

  borderGlow: string;
  cardGlow: string;
  attackTypeDesc: string;
  description: string;
  maxHp: number;
  initialShield: number;
  speed: number;
  paddleWidth: number;
  paddleHeight: number;
  canCrossBorderNormally?: boolean;
  spells: {
    a: SpellDefinition;
    z: SpellDefinition;
    e: SpellDefinition;
    r: SpellDefinition;
  };
}

export interface ChampionSkin {
  id: string;
  role: HeroRole;
  name: string;
  subtitle: string;
  rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE' | 'MYTHIQUE';
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  trailColor: string;
  icon: string;
  description: string;
  bgType: 'matrix' | 'nebula' | 'fire' | 'void' | 'frost' | 'celestial' | 'toxic' | 'inferno' | 'gold';
  borderGradient: string;
  bgGradient: string;
}

export type EffectTarget = 'PADDLE' | 'PROJECTILE' | 'AURA' | 'WEAPON' | 'ARENA' | 'BALL';
export type EffectKind = 'SKIN' | 'WEAPON' | 'TRAIL' | 'AURA' | 'GLOW' | 'IMPACT';

export interface ChampionVisualPreset {
  id: string;
  role: HeroRole;
  name: string;
  subtitle: string;
  rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE' | 'MYTHIQUE';
  icon: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  trailColor: string;
  bgType: 'matrix' | 'nebula' | 'fire' | 'void' | 'frost' | 'celestial' | 'toxic' | 'inferno' | 'gold';
  paddleSkinId: string;
  paddleSkinName: string;
  weaponId: string;
  weaponName: string;
  weaponIcon: string;
  weaponColor1: string;
  weaponColor2: string;
  weaponGlow: string;
  auraName: string;
  glowName: string;
  trailName: string;
}

export interface VisualEffectItem {
  id: string;
  name: string;
  characterRole?: HeroRole;
  target: EffectTarget;
  kind: EffectKind;
  rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE' | 'MYTHIQUE';
  stars: number;
  level: number;
  duplicates: number;
  copiesPerLevel?: { [lvl: number]: number };
  price: number;
  icon: string;
  description: string;
  primaryColor: string;
  secondaryColor?: string;
  glowColor: string;
  borderGradient: string;
  previewBg: string;
  isOwned?: boolean;
  isEquipped?: boolean;
}

export interface PaddleCustomEffect {
  id: string;
  name: string;
  effectType: 'TRAIL' | 'HIGHLIGHT' | 'SPELL' | 'BALL' | 'GOAL';
  rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE' | 'MYTHIQUE';
  stars: number;
  price: number;
  icon: string;
  description: string;
  primaryColor: string;
  glowColor: string;
  borderGradient: string;
  previewBg: string;
  isOwned?: boolean;
  isEquipped?: boolean;
}

export interface HistoryPoint {
  x: number;
  y: number;
  time: number;
}

export interface PlayerEntity {
  id: string;
  name: string;
  role: HeroRole;
  isHuman: boolean;
  isDummy?: boolean;
  isPacman?: boolean;
  pacmanRadius?: number;
  pacmanTargetRadius?: number;
  pacmanMouthAngle?: number;
  pacmanMouthOpening?: boolean;
  isFury?: boolean;
  pacmanSpitCooldown?: number;
  team: 'BLUE' | 'RED';
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  instantVx: number;
  instantVy: number;
  facingDx: number;
  facingDy: number;
  history: HistoryPoint[];
  dashBoostUntil: number;
  stealthUntil: number;
  poisonUntil: number;
  spectralUltUntil: number;
  tauntUntil: number;
  hardenedUntil: number;
  titanUltUntil: number;
  decayShieldAmount?: number;
  decayShieldUntil?: number;
  precisionUntil: number;
  extraProjectiles: number;
  cullingUntil: number;
  cullingShotsLeft: number;
  lastCullingShot: number;
  turnAroundAt?: number;
  hp: number;
  maxHp: number;
  shield: number;
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  speed: number;
  paddleWidth: number;
  paddleHeight: number;
  isGhost: boolean;
  respawnAt: number;
  deaths: number;
  kills: number;
  damageDealt: number;
  damageTanked: number;
  healingProvided: number;
  stunUntil: number;
  frozenUntil: number;
  speedUntil: number;
  immuneUntil: number;
  lastShootTime: number;
  lastSpellTime: number;
  color: string;
  customSkinColor?: string;
  customSecondaryColor?: string;
  customGlowColor?: string;
  customAuraColor?: string;
  customTrailColor?: string;
  customWeaponId?: string;
  customWeaponName?: string;
  customWeaponIcon?: string;
  customWeaponColor?: string;
  customSkinRarity?: string;
  customSkinStars?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  team: 'BLUE' | 'RED';
  damage: number;
  effect: 'NORMAL' | 'STUN' | 'FREEZE' | 'BURST' | 'SLOW';
  radius: number;
  isHoming?: boolean;
  shooterId?: string;
  volleyId?: string;
  homingTargetId?: string;
  width?: number;
  height?: number;
}

export interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  radius: number;
  isCircle?: boolean;
  width?: number;
  height?: number;
  color: string;
  life: number;
}

export interface WallEntity {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  width?: number;
  height?: number;
  color: string;
  team: 'BLUE' | 'RED' | 'NEUTRAL';
  life?: number;
  isReflective?: boolean;
}

export interface TrapEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  team: 'BLUE' | 'RED';
  type: 'MINE' | 'STUN' | 'HEAL';
  color: string;
  createdAt: number;
}

export interface PortalPair {
  id: string;
  entryX: number;
  entryY: number;
  exitX: number;
  exitY: number;
  team: 'BLUE' | 'RED';
  color: string;
  createdAt: number;
  expiresAt: number;
  cooldownUntil: number;
}

export interface GravityFieldZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  team: 'BLUE' | 'RED';
  createdAt: number;
  expiresAt: number;
}

export interface HealingZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  team: 'BLUE' | 'RED';
  createdAt: number;
  activeAt: number;
  expiresAt: number;
}

export interface BlackHoleZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  team: 'BLUE' | 'RED';
  pullStrength: number;
  casterId?: string;
  createdAt: number;
  expiresAt: number;
}

export interface GravityVortex {
  id: string;
  x: number;
  y: number;
  radius: number;
  team: 'BLUE' | 'RED';
  pullStrength: number;
  createdAt: number;
  expiresAt: number;
}

export interface HealingFog {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  team: 'BLUE' | 'RED';
  createdAt: number;
  expiresAt: number;
}

export interface OriannaUltimateZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  team: 'BLUE' | 'RED';
  createdAt: number;
  detonatesAt: number;
  damage: number;
}

export interface DamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
}

export interface GameOverPlayerStats {
  id: string;
  name: string;
  role: HeroRole;
  team: 'BLUE' | 'RED';
  isHuman: boolean;
  damageDealt: number;
  damageTanked: number;
  healingProvided: number;
  kills: number;
  deaths: number;
  color: string;
}

export interface RoundHistoryItem {
  round: number;
  winner: 'BLUE' | 'RED';
  reason: string;
  scoreBlue: number;
  scoreRed: number;
  deathsBlue: number;
  deathsRed: number;
}

export interface GameOverData {
  winner?: 'BLUE' | 'RED';
  winnerTeam?: 'BLUE' | 'RED';
  scoreBlue: number;
  scoreRed: number;
  roundsWonBlue?: number;
  roundsWonRed?: number;
  roundHistory?: RoundHistoryItem[];
  durationSeconds: number;
  matchDurationFormatted?: string;
  matchSize: MatchSize;
  mode?: MatchSize;
  selectedMap: MapTheme;
  mapTheme?: MapTheme;
  totalRounds?: number;
  players: GameOverPlayerStats[];
}

export default {};

import type { HeroRole } from '../pong/types';

export interface ChampionShipConfig {
  role: HeroRole;
  title: string;
  subtitle: string;
  icon: string;
  hullColor: string;
  engineGlow: string;
  speed: number;
  maxHp: number;
  maxShield: number;
  spells: {
    q: { name: string; icon: string; cooldown: number; desc: string };
    w: { name: string; icon: string; cooldown: number; desc: string };
    e: { name: string; icon: string; cooldown: number; desc: string };
    r: { name: string; icon: string; cooldown: number; desc: string };
  };
}

export const CHAMPION_SHIPS: Record<HeroRole, ChampionShipConfig> = {
  SHOOTER: {
    role: 'SHOOTER',
    title: "Tireur d'Élite",
    subtitle: 'Corvette Plasma & Magnet Aim',
    icon: '🎯',
    hullColor: '#38bdf8',
    engineGlow: '#0284c7',
    speed: 3.2,
    maxHp: 220,
    maxShield: 80,
    spells: {
      q: { name: 'Double Shot', icon: '🔫', cooldown: 2.2, desc: 'Tire 2x projectiles simultanés puissants' },
      w: { name: 'Magnet Aim (8s)', icon: '🎯', cooldown: 6.5, desc: 'Pendant 8s, tous vos lasers traquent magnétiquement la cible' },
      e: { name: 'Marksman Boost', icon: '⚡', cooldown: 5.0, desc: 'Augmente la cadence et le nombre de faisceaux' },
      r: { name: 'The Culling (Ultime)', icon: '🔥', cooldown: 12.0, desc: 'Barrage continu de lasers à cadence infernale traquant l\'ennemi' },
    },
  },
  SLAYER: {
    role: 'SLAYER',
    title: 'Pourfendeur Lame-Ombre',
    subtitle: 'Intercepteur Assassin & Backstab',
    icon: '🗡️',
    hullColor: '#f43f5e',
    engineGlow: '#be123c',
    speed: 3.8,
    maxHp: 190,
    maxShield: 70,
    spells: {
      q: { name: 'Téléport dans le Dos', icon: '🗡️', cooldown: 3.8, desc: 'Téléportation instantanée dans le dos de l\'ennemi + coup critique' },
      w: { name: 'Fumigène Furtif', icon: '👤', cooldown: 5.0, desc: 'Devient invisible et intouchable aux lasers pendant 3.5s' },
      e: { name: 'Sweep Éclair & Poison', icon: '🌪️', cooldown: 3.5, desc: 'Dash supersonique qui découpe l\'ennemi et le repousse de la case' },
      r: { name: 'Danse des Lames (Ultime)', icon: '🩸', cooldown: 12.0, desc: 'Traque spectrale avec invisibilité et frappe mortelle' },
    },
  },
  SUPPORT: {
    role: 'SUPPORT',
    title: 'Support Quantique',
    subtitle: 'Frégate Gardienne & Trou Noir',
    icon: '🔮',
    hullColor: '#34d399',
    engineGlow: '#059669',
    speed: 3.0,
    maxHp: 260,
    maxShield: 110,
    spells: {
      q: { name: 'Champ Gravitationnel', icon: '🌌', cooldown: 3.2, desc: 'Zone gravitationnelle ralentissant fortement l\'ennemi et ses lasers' },
      w: { name: 'Onde de Dispersion', icon: '💫', cooldown: 3.0, desc: 'Déflagration 360° repoussant violemment l\'ennemi hors de la zone' },
      e: { name: 'Sanctuaire de Soin', icon: '💖', cooldown: 4.5, desc: 'Dôme céleste régénérant le bouclier et les PV en continu' },
      r: { name: 'Trou Noir Cosmique (Ultime)', icon: '🕳️', cooldown: 12.0, desc: 'Aspiration gravitationnelle massive nettoyant la zone contestée' },
    },
  },
  TANK: {
    role: 'TANK',
    title: 'Colosse Titan',
    subtitle: 'Cuirassé Blindé & Provocation',
    icon: '🛡️',
    hullColor: '#fbbf24',
    engineGlow: '#d97706',
    speed: 2.5,
    maxHp: 380,
    maxShield: 180,
    spells: {
      q: { name: 'Provocation Magnétique', icon: '💢', cooldown: 3.8, desc: 'Attire violemment le vaisseau ennemi vers le Tank' },
      w: { name: 'Cri de Guerre', icon: '🎺', cooldown: 4.5, desc: 'Confère +120 de bouclier énergétique protecteur' },
      e: { name: 'Durcissement Titanesque', icon: '🛡️', cooldown: 5.5, desc: '+800 bouclier et hyper-armure immunisant aux knockbacks' },
      r: { name: 'Supernova Sismique (Ultime)', icon: '🌋', cooldown: 14.0, desc: 'Onde sismique dévastatrice couvrant toute la zone' },
    },
  },
};

export const ROLES_LIST: HeroRole[] = ['SHOOTER', 'SLAYER', 'SUPPORT', 'TANK'];

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 700;
export const RESPAWN_TIME_SECONDS = 1.2;
export const CAPTURE_RATE_PER_SECOND = 18;

import type { KeybindConfig } from './types';

export const KEYBIND_PRESETS: Record<'AZERTY' | 'QWERTY' | 'ARROWS', KeybindConfig> = {
  AZERTY: {
    preset: 'AZERTY',
    moveUp: 'z',
    moveDown: 's',
    moveLeft: 'q',
    moveRight: 'd',
    shoot: ' ',
    spell1: '1',
    spell2: '2',
    spell3: '3',
    spell4: '4',
  },
  QWERTY: {
    preset: 'QWERTY',
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    shoot: ' ',
    spell1: '1',
    spell2: '2',
    spell3: '3',
    spell4: '4',
  },
  ARROWS: {
    preset: 'ARROWS',
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    shoot: ' ',
    spell1: '1',
    spell2: '2',
    spell3: '3',
    spell4: '4',
  },
};

const STORAGE_KEY = 'transcendence_shootactoe_keybinds';

export function loadSavedKeybinds(): KeybindConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.moveUp && parsed.moveLeft) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load saved keybinds', err);
  }
  return KEYBIND_PRESETS.AZERTY;
}

export function saveKeybinds(cfg: KeybindConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.warn('Failed to save keybinds', err);
  }
}

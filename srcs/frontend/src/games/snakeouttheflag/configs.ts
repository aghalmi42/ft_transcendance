import type { WallObstacle, CTFKeybinds } from './types';

export const ARENA_WIDTH = 1400;
export const ARENA_HEIGHT = 780;

export const WIN_FLAG_CAPTURES = 3;
export const RESPAWN_DELAY_SECONDS = 1.5;
export const SNAKE_INITIAL_LENGTH = 12;
export const SNAKE_BASE_SPEED = 3.6;
export const SNAKE_SEGMENT_DISTANCE = 8;
export const SNAKE_RADIUS = 9;

export const BOMB_FUSE_TIME = 2.0;
export const BOMB_RADIUS = 10;
export const BOMB_EXPLOSION_RADIUS = 95;
export const BOMB_COOLDOWN = 2.8;

export const BLUE_BASE_POS = { x: 130, y: 390 };
export const RED_BASE_POS = { x: 1270, y: 390 };

export const BLUE_FLAG_HOME = { x: 130, y: 390 };
export const RED_FLAG_HOME = { x: 1270, y: 390 };

export const CASTLE_WALLS: WallObstacle[] = [

  { x: 260, y: 80, width: 24, height: 220, type: 'BASE_WALL' },
  { x: 260, y: 480, width: 24, height: 220, type: 'BASE_WALL' },
  { x: 100, y: 220, width: 160, height: 20, type: 'RAMPART' },
  { x: 100, y: 540, width: 160, height: 20, type: 'RAMPART' },

  { x: 1116, y: 80, width: 24, height: 220, type: 'BASE_WALL' },
  { x: 1116, y: 480, width: 24, height: 220, type: 'BASE_WALL' },
  { x: 1140, y: 220, width: 160, height: 20, type: 'RAMPART' },
  { x: 1140, y: 540, width: 160, height: 20, type: 'RAMPART' },

  { x: 500, y: 200, width: 30, height: 120, type: 'TOWER' },
  { x: 500, y: 460, width: 30, height: 120, type: 'TOWER' },
  { x: 870, y: 200, width: 30, height: 120, type: 'TOWER' },
  { x: 870, y: 460, width: 30, height: 120, type: 'TOWER' },

  { x: 670, y: 120, width: 60, height: 60, type: 'TOWER' },
  { x: 670, y: 600, width: 60, height: 60, type: 'TOWER' },
  { x: 685, y: 340, width: 30, height: 100, type: 'RAMPART' },
];

export const DEFAULT_KEYBINDS_CTF: Record<'AZERTY' | 'QWERTY' | 'ARROWS', CTFKeybinds> = {
  AZERTY: {
    moveUp: 'z',
    moveDown: 's',
    moveLeft: 'q',
    moveRight: 'd',
    boost: 'Shift',
    bomb: ' ',
  },
  QWERTY: {
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    boost: 'Shift',
    bomb: ' ',
  },
  ARROWS: {
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    boost: 'Shift',
    bomb: ' ',
  },
};

const STORAGE_KEY = 'transcendence_snake_ctf_keybinds';

export function loadSavedCTFKeybinds(): CTFKeybinds {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.moveUp && parsed.moveLeft) {
        return {
          ...DEFAULT_KEYBINDS_CTF.AZERTY,
          ...parsed,
          bomb: parsed.bomb || ' ',
        };
      }
    }
  } catch {}
  return DEFAULT_KEYBINDS_CTF.AZERTY;
}

export function saveCTFKeybinds(cfg: CTFKeybinds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

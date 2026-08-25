export type KeybindPreset = 'AZERTY' | 'QWERTY' | 'ARROWS' | 'CUSTOM';

export interface GlobalKeybinds {
  preset: KeybindPreset;
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  spell1: string;
  spell2: string;
  spell3: string;
  spell4: string;
  shootAction: string;
}

export const PRESET_CONFIGS: Record<KeybindPreset, GlobalKeybinds> = {
  AZERTY: {
    preset: 'AZERTY',
    moveUp: 'z',
    moveDown: 's',
    moveLeft: 'q',
    moveRight: 'd',
    spell1: 'a',
    spell2: 'e',
    spell3: 'f',
    spell4: 'r',
    shootAction: ' ',
  },
  QWERTY: {
    preset: 'QWERTY',
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    spell1: 'q',
    spell2: 'e',
    spell3: 'f',
    spell4: 'r',
    shootAction: ' ',
  },
  ARROWS: {
    preset: 'ARROWS',
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    spell1: '1',
    spell2: '2',
    spell3: '3',
    spell4: '4',
    shootAction: ' ',
  },
  CUSTOM: {
    preset: 'CUSTOM',
    moveUp: 'z',
    moveDown: 's',
    moveLeft: 'q',
    moveRight: 'd',
    spell1: 'a',
    spell2: 'e',
    spell3: 'f',
    spell4: 'r',
    shootAction: ' ',
  },
};

const STORAGE_KEY = 'ft_central_keybinds_v1';

class CentralKeybindsStore {
  private keybinds: GlobalKeybinds;
  private listeners: Array<(cfg: GlobalKeybinds) => void> = [];

  constructor() {
    this.keybinds = this.load();
  }

  public get(): GlobalKeybinds {
    return { ...this.keybinds };
  }

  public setPreset(preset: KeybindPreset) {
    if (preset !== 'CUSTOM') {
      this.keybinds = { ...PRESET_CONFIGS[preset] };
    } else {
      this.keybinds.preset = 'CUSTOM';
    }
    this.save();
  }

  public updateKey(action: keyof Omit<GlobalKeybinds, 'preset'>, newKey: string) {
    this.keybinds = {
      ...this.keybinds,
      preset: 'CUSTOM',
      [action]: newKey,
    };
    this.save();
  }

  public subscribe(cb: (cfg: GlobalKeybinds) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public isActionTriggered(
    e: KeyboardEvent,
    action: keyof Omit<GlobalKeybinds, 'preset'>
  ): boolean {
    const target = this.keybinds[action];
    return this.matchesKey(e, target);
  }

  public isKeyActiveInMap(
    pressedMap: Record<string, boolean>,
    action: keyof Omit<GlobalKeybinds, 'preset'>
  ): boolean {
    const target = this.keybinds[action]?.toLowerCase();
    if (!target) return false;

    const has = (k: string) => !!(pressedMap[k] || pressedMap[k.toLowerCase()] || pressedMap[k.toUpperCase()] || pressedMap[`Key${k.toUpperCase()}`]);

    if (has(target)) {
      return true;
    }

    if ((target === 'z' || target === 'w') && (has('keyz') || has('keyw') || has('z') || has('w'))) return true;
    if ((target === 'q' || target === 'a') && (has('keyq') || has('keya') || has('q') || has('a'))) return true;
    if (target === 's' && (has('keys') || has('s'))) return true;
    if (target === 'd' && (has('keyd') || has('d'))) return true;
    if (target === 'e' && (has('keye') || has('e'))) return true;
    if (target === 'f' && (has('keyf') || has('f'))) return true;
    if (target === 'r' && (has('keyr') || has('r'))) return true;
    if (target === ' ' && (has(' ') || has('space') || has('Space'))) return true;
    if (target === 'arrowup' && (has('arrowup') || has('ArrowUp'))) return true;
    if (target === 'arrowdown' && (has('arrowdown') || has('ArrowDown'))) return true;
    if (target === 'arrowleft' && (has('arrowleft') || has('ArrowLeft'))) return true;
    if (target === 'arrowright' && (has('arrowright') || has('ArrowRight'))) return true;
    if (['1', '2', '3', '4'].includes(target) && (has(target) || has(`digit${target}`) || has(`numpad${target}`))) return true;

    return false;
  }

  public matchesKey(e: KeyboardEvent, target: string): boolean {
    if (!target) return false;
    const k = e.key.toLowerCase();
    const t = target.toLowerCase();

    if (k === t) return true;
    if (e.key === target) return true;

    if (t === ' ' && (e.key === ' ' || e.code === 'Space')) return true;

    if (t === 'z' && (e.code === 'KeyZ' || e.code === 'KeyW' || k === 'z')) return true;
    if (t === 'w' && (e.code === 'KeyW' || e.code === 'KeyZ' || k === 'w')) return true;
    if (t === 'q' && (e.code === 'KeyQ' || e.code === 'KeyA' || k === 'q')) return true;
    if (t === 'a' && (e.code === 'KeyA' || e.code === 'KeyQ' || k === 'a')) return true;
    if (t === 's' && (e.code === 'KeyS' || k === 's')) return true;
    if (t === 'd' && (e.code === 'KeyD' || k === 'd')) return true;
    if (t === 'e' && (e.code === 'KeyE' || k === 'e')) return true;
    if (t === 'f' && (e.code === 'KeyF' || k === 'f')) return true;
    if (t === 'r' && (e.code === 'KeyR' || k === 'r')) return true;

    if (t === '1' && (k === '1' || k === '&' || e.code === 'Digit1' || e.code === 'Numpad1')) return true;
    if (t === '2' && (k === '2' || k === 'é' || e.code === 'Digit2' || e.code === 'Numpad2')) return true;
    if (t === '3' && (k === '3' || k === '"' || e.code === 'Digit3' || e.code === 'Numpad3')) return true;
    if (t === '4' && (k === '4' || k === "'" || e.code === 'Digit4' || e.code === 'Numpad4')) return true;

    return false;
  }

  public formatKeyLabel(key: string): string {
    if (!key) return 'NON DÉFINI';
    if (key === ' ') return 'ESPACE';
    if (key === 'ArrowUp') return '↑ HAUT';
    if (key === 'ArrowDown') return '↓ BAS';
    if (key === 'ArrowLeft') return '← GAUCHE';
    if (key === 'ArrowRight') return '→ DROITE';
    return key.toUpperCase();
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keybinds));
      this.listeners.forEach(cb => cb(this.get()));
    } catch {}
  }

  private load(): GlobalKeybinds {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...PRESET_CONFIGS.AZERTY, ...JSON.parse(data) };
      }
    } catch {}
    return { ...PRESET_CONFIGS.AZERTY };
  }
}

export const keybindsStore = new CentralKeybindsStore();

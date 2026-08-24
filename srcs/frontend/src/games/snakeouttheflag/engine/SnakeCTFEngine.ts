import type {
  TeamColor,
  TeamSize,
  SnakePlayer,
  SnakeSegment,
  FlagState,
  Consumable,
  ConsumableType,
  BombMine,
  MatchStatsCTF,
  CTFKeybinds,
} from '../types';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  WIN_FLAG_CAPTURES,
  RESPAWN_DELAY_SECONDS,
  SNAKE_INITIAL_LENGTH,
  SNAKE_BASE_SPEED,
  SNAKE_SEGMENT_DISTANCE,
  SNAKE_RADIUS,
  BOMB_FUSE_TIME,
  BOMB_RADIUS,
  BOMB_EXPLOSION_RADIUS,
  BOMB_COOLDOWN,
  BLUE_BASE_POS,
  RED_BASE_POS,
  BLUE_FLAG_HOME,
  RED_FLAG_HOME,
  CASTLE_WALLS,
} from '../configs';
import { snakeCTFSounds } from '../sounds';

export interface CTFParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface EngineStateCTF {
  blueSnakes: SnakePlayer[];
  redSnakes: SnakePlayer[];
  blueFlag: FlagState;
  redFlag: FlagState;
  consumables: Consumable[];
  bombs: BombMine[];
  particles: CTFParticle[];
  blueCaptures: number;
  redCaptures: number;
  startTime: number;
  matchEnded: boolean;
  winner: TeamColor | null;
  teamSize: TeamSize;
}

export class SnakeCTFEngine {
  public state: EngineStateCTF;
  public onNotice?: (text: string) => void;
  public onMatchEnd?: (stats: MatchStatsCTF) => void;

  constructor(teamSize: TeamSize) {
    const createSnake = (id: string, name: string, team: TeamColor, isAI: boolean, idx: number): SnakePlayer => {
      const base = team === 'BLUE' ? BLUE_BASE_POS : RED_BASE_POS;
      const spawnY = base.y + (idx - (teamSize - 1) / 2) * 50;
      const dir = team === 'BLUE' ? 'RIGHT' : 'LEFT';
      const segments: SnakeSegment[] = Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, s) => ({
        x: team === 'BLUE' ? base.x - s * SNAKE_SEGMENT_DISTANCE : base.x + s * SNAKE_SEGMENT_DISTANCE,
        y: spawnY,
      }));

      return {
        id, name, team, isAI, x: base.x, y: spawnY,
        vx: team === 'BLUE' ? SNAKE_BASE_SPEED : -SNAKE_BASE_SPEED, vy: 0,
        dir, nextDir: dir, segments, length: SNAKE_INITIAL_LENGTH, targetLength: SNAKE_INITIAL_LENGTH,
        speed: SNAKE_BASE_SPEED, baseSpeed: SNAKE_BASE_SPEED, boostDuration: 0, bombCooldown: 0,
        hasShield: false, isAlive: true, respawnTimer: 0, hasFlag: false, kills: 0, deaths: 0,
        flagsCaptured: 0, color: team === 'BLUE' ? '#06b6d4' : '#ef4444',
        accentColor: team === 'BLUE' ? '#38bdf8' : '#f87171',
      };
    };

    const blueSnakes = Array.from({ length: teamSize }, (_, i) => createSnake(`blue_${i}`, i === 0 ? 'Joueur (Spartan Snake)' : `Allié Escorte ${i}`, 'BLUE', i !== 0, i));
    const redSnakes = Array.from({ length: teamSize }, (_, i) => createSnake(`red_${i}`, `Ennemi Bot ${i + 1}`, 'RED', true, i));

    this.state = {
      blueSnakes, redSnakes,
      blueFlag: { team: 'BLUE', x: BLUE_FLAG_HOME.x, y: BLUE_FLAG_HOME.y, homeX: BLUE_FLAG_HOME.x, homeY: BLUE_FLAG_HOME.y, carrierId: null, isAtHome: true },
      redFlag: { team: 'RED', x: RED_FLAG_HOME.x, y: RED_FLAG_HOME.y, homeX: RED_FLAG_HOME.x, homeY: RED_FLAG_HOME.y, carrierId: null, isAtHome: true },
      consumables: [], bombs: [], particles: [], blueCaptures: 0, redCaptures: 0,
      startTime: Date.now(), matchEnded: false, winner: null, teamSize,
    };

    for (let i = 0; i < 18; i++) this.spawnRandomConsumable();
  }

  public spawnRandomConsumable() {
    const x = Math.floor(Math.random() * (ARENA_WIDTH - 240) + 120);
    const y = Math.floor(Math.random() * (ARENA_HEIGHT - 160) + 80);
    const rand = Math.random();
    let type: ConsumableType = 'GROWTH_ORB';
    let color = '#fbbf24';
    let growth = 1;
    let points = 10;

    if (rand < 0.60) { type = 'GROWTH_ORB'; color = '#22c55e'; growth = 3; }
    else if (rand < 0.85) { type = 'SPEED_BOOST'; color = '#eab308'; growth = 1; }
    else if (rand < 0.95) { type = 'SHIELD'; color = '#38bdf8'; growth = 2; }
    else { type = 'MEGA_APPLE'; color = '#a855f7'; growth = 8; points = 30; }

    this.state.consumables.push({
      id: `c-${Math.random()}`, type, x, y, radius: type === 'MEGA_APPLE' ? 11 : 7, color, points, growth,
    });
  }

  public spawnSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 1.5;
      this.state.particles.push({
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        size: Math.random() * 4 + 2, color, alpha: 1.0, decay: 0.02 + Math.random() * 0.03,
      });
    }
  }

  public plantBomb(snake: SnakePlayer) {
    if (snake.bombCooldown > 0 || !snake.isAlive) return;
    snake.bombCooldown = BOMB_COOLDOWN;
    this.state.bombs.push({
      id: `b-${Math.random()}`, ownerId: snake.id, team: snake.team,
      x: snake.x, y: snake.y, radius: BOMB_RADIUS, explosionRadius: BOMB_EXPLOSION_RADIUS,
      fuseTimer: BOMB_FUSE_TIME, initialTimer: BOMB_FUSE_TIME,
    });
    snakeCTFSounds.plantBomb();
    this.spawnSparks(snake.x, snake.y, '#f59e0b', 14);
  }

  public killSnake(snake: SnakePlayer, killerName?: string) {
    snake.isAlive = false;
    snake.respawnTimer = RESPAWN_DELAY_SECONDS;
    snake.deaths += 1;
    snake.speed = snake.baseSpeed;
    snake.boostDuration = 0;
    snake.hasShield = false;

    this.spawnSparks(snake.x, snake.y, snake.color, 45);
    snakeCTFSounds.deathExplosion();

    if (snake.hasFlag) {
      snake.hasFlag = false;
      const carriedFlag = snake.team === 'BLUE' ? this.state.redFlag : this.state.blueFlag;
      carriedFlag.carrierId = null;
      carriedFlag.x = Math.max(80, Math.min(ARENA_WIDTH - 80, snake.x));
      carriedFlag.y = Math.max(80, Math.min(ARENA_HEIGHT - 80, snake.y));
      carriedFlag.isAtHome = false;
      this.onNotice?.(`🚩 DRAPEAU ${carriedFlag.team} LÂCHÉ SUR LE TERRAIN !`);
    }
    if (killerName) this.onNotice?.(`💀 ${snake.name} a été détruit par ${killerName} !`);
  }

  public respawnSnake(snake: SnakePlayer, index: number) {
    snake.isAlive = true;
    snake.hasFlag = false;
    snake.targetLength = SNAKE_INITIAL_LENGTH;
    snake.length = SNAKE_INITIAL_LENGTH;
    snake.bombCooldown = 0;

    const base = snake.team === 'BLUE' ? BLUE_BASE_POS : RED_BASE_POS;
    snake.x = base.x;
    snake.y = base.y + (index - (this.state.teamSize - 1) / 2) * 50;
    snake.dir = snake.team === 'BLUE' ? 'RIGHT' : 'LEFT';
    snake.nextDir = snake.dir;
    snake.vx = snake.team === 'BLUE' ? snake.baseSpeed : -snake.baseSpeed;
    snake.vy = 0;
    snake.segments = Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, s) => ({
      x: snake.team === 'BLUE' ? snake.x - s * SNAKE_SEGMENT_DISTANCE : snake.x + s * SNAKE_SEGMENT_DISTANCE,
      y: snake.y,
    }));
    this.spawnSparks(snake.x, snake.y, snake.color, 25);
  }

  public update(dt: number, keys: Record<string, boolean>, keybinds: CTFKeybinds) {
    if (this.state.matchEnded) return;

    if (this.state.consumables.length < 24 && Math.random() < 0.08) this.spawnRandomConsumable();
    const allSnakes = [...this.state.blueSnakes, ...this.state.redSnakes];

    const p1 = this.state.blueSnakes[0];
    if (p1 && p1.isAlive) {
      const up = keybinds.moveUp.toLowerCase(), down = keybinds.moveDown.toLowerCase();
      const left = keybinds.moveLeft.toLowerCase(), right = keybinds.moveRight.toLowerCase();
      const bombKey = (keybinds.bomb || ' ').toLowerCase();

      if ((keys[up] || keys['arrowup'] || (up === 'z' && keys['keyw'])) && p1.dir !== 'DOWN') p1.nextDir = 'UP';
      else if ((keys[down] || keys['arrowdown']) && p1.dir !== 'UP') p1.nextDir = 'DOWN';
      else if ((keys[left] || keys['arrowleft'] || (left === 'q' && keys['keya'])) && p1.dir !== 'RIGHT') p1.nextDir = 'LEFT';
      else if ((keys[right] || keys['arrowright']) && p1.dir !== 'LEFT') p1.nextDir = 'RIGHT';

      if ((keys[bombKey] || keys[' '] || keys['space'] || (bombKey === ' ' && keys['space'])) && p1.bombCooldown <= 0) {
        this.plantBomb(p1);
      }
      if ((keys['shift'] || keys['shiftleft'] || keys['shiftright']) && p1.boostDuration <= 0) {
        p1.boostDuration = 2.5; p1.speed = p1.baseSpeed * 1.5;
        snakeCTFSounds.speedBoost();
      }
    }

    allSnakes.forEach((snake, idx) => {
      if (!snake.isAlive) {
        snake.respawnTimer -= dt;
        if (snake.respawnTimer <= 0) this.respawnSnake(snake, idx % this.state.teamSize);
        return;
      }

      if (snake.bombCooldown > 0) snake.bombCooldown -= dt;
      if (snake.boostDuration > 0) {
        snake.boostDuration -= dt;
        if (snake.boostDuration <= 0) snake.speed = snake.baseSpeed;
      }
      if (snake.isAI) this.updateAI(snake);

      snake.dir = snake.nextDir;
      const speeds = { UP: [0, -snake.speed], DOWN: [0, snake.speed], LEFT: [-snake.speed, 0], RIGHT: [snake.speed, 0] };
      [snake.vx, snake.vy] = speeds[snake.dir];

      snake.x += snake.vx;
      snake.y += snake.vy;
      snake.segments.unshift({ x: snake.x, y: snake.y });

      if (snake.length < snake.targetLength) snake.length += 0.15;
      while (snake.segments.length > Math.floor(snake.length * 3.5)) snake.segments.pop();

      if (snake.hasFlag) {
        const carriedFlag = snake.team === 'BLUE' ? this.state.redFlag : this.state.blueFlag;
        carriedFlag.x = snake.x; carriedFlag.y = snake.y;
      }
    });

    for (let b = this.state.bombs.length - 1; b >= 0; b--) {
      const bomb = this.state.bombs[b];
      bomb.fuseTimer -= dt;
      if (bomb.fuseTimer <= 0) {
        this.detonateBomb(bomb);
        this.state.bombs.splice(b, 1);
      }
    }

    allSnakes.forEach(snake => {
      if (!snake.isAlive) return;

      if (snake.x < SNAKE_RADIUS || snake.x > ARENA_WIDTH - SNAKE_RADIUS || snake.y < SNAKE_RADIUS || snake.y > ARENA_HEIGHT - SNAKE_RADIUS) {
        this.killSnake(snake, 'Frontière laser du château');
        return;
      }

      for (const w of CASTLE_WALLS) {
        if (snake.x >= w.x - SNAKE_RADIUS && snake.x <= w.x + w.width + SNAKE_RADIUS && snake.y >= w.y - SNAKE_RADIUS && snake.y <= w.y + w.height + SNAKE_RADIUS) {
          if (snake.hasShield) {
            snake.hasShield = false;
            this.spawnSparks(snake.x, snake.y, '#38bdf8', 20);
          } else {
            this.killSnake(snake, 'Mur de fortification');
            return;
          }
        }
      }

      for (let i = this.state.consumables.length - 1; i >= 0; i--) {
        const c = this.state.consumables[i];
        if (Math.hypot(snake.x - c.x, snake.y - c.y) < SNAKE_RADIUS + c.radius) {
          snake.targetLength += c.growth;
          snakeCTFSounds.eatOrb();
          this.spawnSparks(c.x, c.y, c.color, 12);
          if (c.type === 'SPEED_BOOST') { snake.boostDuration = 3.5; snake.speed = snake.baseSpeed * 1.55; snakeCTFSounds.speedBoost(); }
          else if (c.type === 'SHIELD') { snake.hasShield = true; }
          this.state.consumables.splice(i, 1);
        }
      }

      allSnakes.forEach(otherSnake => {
        if (!otherSnake.isAlive || (otherSnake.team === snake.team && otherSnake.id !== snake.id)) return;
        const startIdx = otherSnake.id === snake.id ? 14 : 3;
        for (let s = startIdx; s < otherSnake.segments.length; s += 2) {
          const seg = otherSnake.segments[s];
          if (Math.hypot(snake.x - seg.x, snake.y - seg.y) < SNAKE_RADIUS * 1.4) {
            if (snake.hasShield) {
              snake.hasShield = false;
              this.spawnSparks(snake.x, snake.y, '#38bdf8', 25);
            } else {
              otherSnake.kills += 1;
              this.killSnake(snake, `la queue de ${otherSnake.name}`);
              return;
            }
          }
        }
      });
    });

    allSnakes.forEach(snake => {
      if (!snake.isAlive) return;
      const enemyFlag = snake.team === 'BLUE' ? this.state.redFlag : this.state.blueFlag;
      const ownFlag = snake.team === 'BLUE' ? this.state.blueFlag : this.state.redFlag;
      const ownBase = snake.team === 'BLUE' ? BLUE_BASE_POS : RED_BASE_POS;

      if (!enemyFlag.carrierId && Math.hypot(snake.x - enemyFlag.x, snake.y - enemyFlag.y) < 32 && !snake.hasFlag) {
        enemyFlag.carrierId = snake.id;
        snake.hasFlag = true;
        enemyFlag.isAtHome = false;
        snakeCTFSounds.flagGrabbed();
        this.spawnSparks(snake.x, snake.y, enemyFlag.team === 'BLUE' ? '#38bdf8' : '#f87171', 30);
        this.onNotice?.(`🚩 ${snake.name} a volé le drapeau ${enemyFlag.team} !`);
      }

      if (!ownFlag.isAtHome && !ownFlag.carrierId && Math.hypot(snake.x - ownFlag.x, snake.y - ownFlag.y) < 32) {
        ownFlag.x = ownFlag.homeX; ownFlag.y = ownFlag.homeY; ownFlag.isAtHome = true;
        snakeCTFSounds.flagGrabbed();
        this.spawnSparks(ownFlag.x, ownFlag.y, snake.color, 25);
        this.onNotice?.(`🛡️ Drapeau ${snake.team} récupéré et retourné à la base !`);
      }

      if (snake.hasFlag && Math.hypot(snake.x - ownBase.x, snake.y - ownBase.y) < 55) {
        if (ownFlag.isAtHome) {
          snake.hasFlag = false;
          snake.flagsCaptured += 1;
          enemyFlag.carrierId = null;
          enemyFlag.x = enemyFlag.homeX; enemyFlag.y = enemyFlag.homeY; enemyFlag.isAtHome = true;

          if (snake.team === 'BLUE') this.state.blueCaptures += 1;
          else this.state.redCaptures += 1;

          snakeCTFSounds.flagCaptured();
          this.spawnSparks(snake.x, snake.y, '#f59e0b', 50);
          this.onNotice?.(`🏆 CAPTURE DE DRAPEAU RÉUSSIE PAR ${snake.name} !`);

          if (this.state.blueCaptures >= WIN_FLAG_CAPTURES || this.state.redCaptures >= WIN_FLAG_CAPTURES) {
            this.endMatch(snake.team);
          }
        }
      }
    });

    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
      if (p.alpha <= 0) this.state.particles.splice(i, 1);
    }
  }

  public detonateBomb(bomb: BombMine) {
    this.spawnSparks(bomb.x, bomb.y, '#f97316', 55);
    snakeCTFSounds.bombExplosion();
    const allSnakes = [...this.state.blueSnakes, ...this.state.redSnakes];

    allSnakes.forEach(s => {
      if (!s.isAlive) return;
      if (Math.hypot(s.x - bomb.x, s.y - bomb.y) < bomb.explosionRadius) {
        if (s.hasShield) {
          s.hasShield = false;
          this.spawnSparks(s.x, s.y, '#38bdf8', 25);
        } else {
          this.killSnake(s, 'une bombe plasma');
        }
      }
    });
  }

  public updateAI(snake: SnakePlayer) {
    const isBlue = snake.team === 'BLUE';
    const enemyFlag = isBlue ? this.state.redFlag : this.state.blueFlag;
    const ownBase = isBlue ? BLUE_BASE_POS : RED_BASE_POS;
    let targetX = enemyFlag.x;
    let targetY = enemyFlag.y;

    if (snake.hasFlag) { targetX = ownBase.x; targetY = ownBase.y; }

    const dx = targetX - snake.x;
    const dy = targetY - snake.y;
    const preferredDirs: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = [];

    if (Math.abs(dx) > Math.abs(dy)) {
      preferredDirs.push(dx > 0 ? 'RIGHT' : 'LEFT', dy > 0 ? 'DOWN' : 'UP');
    } else {
      preferredDirs.push(dy > 0 ? 'DOWN' : 'UP', dx > 0 ? 'RIGHT' : 'LEFT');
    }

    const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    const validDir = preferredDirs.find(d => d !== opposites[snake.dir] && !this.isCollisionAhead(snake, d));
    if (validDir) snake.nextDir = validDir;

    if (Math.random() < 0.015 && snake.bombCooldown <= 0) {
      const enemies = isBlue ? this.state.redSnakes : this.state.blueSnakes;
      const nearEnemy = enemies.some(e => e.isAlive && Math.hypot(e.x - snake.x, e.y - snake.y) < 140);
      if (nearEnemy) this.plantBomb(snake);
    }
  }

  public isCollisionAhead(snake: SnakePlayer, dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): boolean {
    let nextX = snake.x;
    let nextY = snake.y;
    const step = 25;
    if (dir === 'UP') nextY -= step;
    else if (dir === 'DOWN') nextY += step;
    else if (dir === 'LEFT') nextX -= step;
    else if (dir === 'RIGHT') nextX += step;

    if (nextX < 30 || nextX > ARENA_WIDTH - 30 || nextY < 30 || nextY > ARENA_HEIGHT - 30) return true;

    for (const w of CASTLE_WALLS) {
      if (nextX >= w.x - 10 && nextX <= w.x + w.width + 10 && nextY >= w.y - 10 && nextY <= w.y + w.height + 10) return true;
    }
    return false;
  }

  public endMatch(winner: TeamColor) {
    this.state.matchEnded = true;
    this.state.winner = winner;
    snakeCTFSounds.flagCaptured();
    const duration = Math.round((Date.now() - this.state.startTime) / 1000);
    this.onMatchEnd?.({
      winner,
      blueScore: this.state.blueCaptures,
      redScore: this.state.redCaptures,
      durationSeconds: duration,
      blueCaptures: this.state.blueCaptures,
      redCaptures: this.state.redCaptures,
      playerKills: this.state.blueSnakes[0]?.kills || 0,
      playerDeaths: this.state.blueSnakes[0]?.deaths || 0,
      teamSize: this.state.teamSize,
    });
  }
}

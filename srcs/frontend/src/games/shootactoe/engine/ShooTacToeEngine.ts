import type { HeroRole } from '../../pong/types';
import type { ShipState, Bullet, Particle, GridCell, TeamColor, TeamSize, WinLine, MatchStats, KeybindConfig } from '../types';
import { CHAMPION_SHIPS, ROLES_LIST, CANVAS_WIDTH, CANVAS_HEIGHT, RESPAWN_TIME_SECONDS, CAPTURE_RATE_PER_SECOND } from '../configs';
import { shootactoeSounds } from '../sounds';

function isActionPressed(keys: Record<string, boolean>, targetKey?: string): boolean {
  if (!targetKey) return false;
  const tk = targetKey.toLowerCase();
  if (keys[targetKey] || keys[tk] || keys[targetKey.toUpperCase()]) return true;
  if (targetKey === ' ' && (keys[' '] || keys['Space'])) return true;
  return ['1', '2', '3', '4'].some(d => tk === d && (keys[d] || keys[`Digit${d}`] || keys[`Numpad${d}`]));
}

export interface EngineState {
  blueTeam: ShipState[];
  redTeam: ShipState[];
  bullets: (Bullet & { isHoming?: boolean })[];
  particles: Particle[];
  grid: GridCell[];
  gridDim: number;
  winStreak: number;
  startTime: number;
  matchEnded: boolean;
  spellTimersP1: { q: number; w: number; e: number; r: number };
  magnetAimTimerP1: number;
  stealthTimerP1: number;
  gravityWells: { x: number; y: number; radius: number; life: number; team: TeamColor }[];
  healingZones: { x: number; y: number; radius: number; life: number; team: TeamColor }[];
}

export class ShooTacToeEngine {
  public state: EngineState;
  public onNotice?: (text: string) => void;
  public onMatchEnd?: (stats: MatchStats) => void;

  constructor(playerRole: HeroRole, teamSize: TeamSize) {
    const dim = 3 + teamSize;
    const createShip = (id: string, name: string, role: HeroRole, team: TeamColor, x: number, y: number, angle: number, isAI: boolean): ShipState => {
      const cfg = CHAMPION_SHIPS[role];
      return {
        id, name, role, roleTitle: cfg.title, team, symbol: team === 'BLUE' ? 'X' : 'O',
        x, y, vx: 0, vy: 0, angle, targetAngle: angle, radius: 16,
        hp: cfg.maxHp, maxHp: cfg.maxHp, shield: cfg.maxShield, maxShield: cfg.maxShield,
        isAlive: true, respawnTimer: 0, score: 0, kills: 0, deaths: 0,
        dashCooldown: 0, shootCooldown: 0, isAI, color: cfg.hullColor, accentColor: cfg.engineGlow,
      };
    };

    const blueShips: ShipState[] = Array.from({ length: teamSize }, (_, i) => {
      const role = i === 0 ? playerRole : ROLES_LIST[i % ROLES_LIST.length];
      const cfg = CHAMPION_SHIPS[role];
      return createShip(`blue_${i}`, i === 0 ? `Joueur (${cfg.title})` : `Allié Bot ${i} (${cfg.title})`, role, 'BLUE', 140, 200 + i * 110, 0, i !== 0);
    });

    const redShips: ShipState[] = Array.from({ length: teamSize }, (_, i) => {
      const role = ROLES_LIST[(i + 1) % ROLES_LIST.length];
      const cfg = CHAMPION_SHIPS[role];
      return createShip(`red_${i}`, `Ennemi Bot ${i + 1} (${cfg.title})`, role, 'RED', CANVAS_WIDTH - 140, 200 + i * 110, Math.PI, true);
    });

    const cellSize = Math.floor(540 / dim);
    const startX = CANVAS_WIDTH / 2 - (cellSize * dim) / 2;
    const startY = CANVAS_HEIGHT / 2 - (cellSize * dim) / 2;

    const initialGrid: GridCell[] = [];
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        initialGrid.push({
          index: r * dim + c, row: r, col: c,
          x: startX + c * cellSize + cellSize / 2,
          y: startY + r * cellSize + cellSize / 2,
          width: cellSize - 6, height: cellSize - 6,
          owner: null, captureProgress: 0, occupants: [], isContested: false, isLocked: false,
        });
      }
    }

    this.state = {
      blueTeam: blueShips, redTeam: redShips, bullets: [], particles: [],
      grid: initialGrid, gridDim: dim, winStreak: dim, startTime: Date.now(),
      matchEnded: false, spellTimersP1: { q: 0, w: 0, e: 0, r: 0 },
      magnetAimTimerP1: 0, stealthTimerP1: 0, gravityWells: [], healingZones: [],
    };
  }

  public spawnParticles(x: number, y: number, color: string, count: number, speed = 2.5) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * speed + 0.8;
      this.state.particles.push({
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        size: Math.random() * 3 + 2, color, alpha: 1.0, decay: 0.02 + Math.random() * 0.03,
      });
    }
  }

  private addBullet(shooterId: string, team: TeamColor, x: number, y: number, vx: number, vy: number, damage = 20, color = '#38bdf8', isHoming = false, radius = 5) {
    this.state.bullets.push({
      id: `b-${Math.random()}`, shooterId, team, x, y, vx, vy, radius, damage, life: 50, maxLife: 50, color, isHoming,
    });
  }

  public castSpellP1(spellKey: 'q' | 'w' | 'e' | 'r', playerRole: HeroRole, mousePos: { x: number; y: number }) {
    const p1 = this.state.blueTeam[0];
    const cfg = CHAMPION_SHIPS[playerRole];
    if (this.state.spellTimersP1[spellKey] > 0 || !p1.isAlive) return;

    this.state.spellTimersP1[spellKey] = cfg.spells[spellKey].cooldown;
    shootactoeSounds.shoot();

    const dirX = Math.cos(p1.angle);
    const dirY = Math.sin(p1.angle);

    if (playerRole === 'SHOOTER') {
      if (spellKey === 'q') {
        [-1, 1].forEach(sign => this.addBullet(p1.id, 'BLUE', p1.x + dirX * 20 - dirY * 12 * sign, p1.y + dirY * 20 + dirX * 12 * sign, dirX * 12, dirY * 12, 35, '#38bdf8', false, 6));
        this.spawnParticles(p1.x, p1.y, '#38bdf8', 15);
        this.onNotice?.('🔫 DOUBLE SHOT DÉCLENCHÉ !');
      } else if (spellKey === 'w') {
        this.state.magnetAimTimerP1 = 8.0;
        this.spawnParticles(p1.x, p1.y, '#0284c7', 20);
        this.onNotice?.('🎯 MAGNET AIM ACTIF (8s) : TIRS AUTOGUIDÉS !');
      } else if (spellKey === 'e') {
        for (let i = -1; i <= 2; i++) {
          const sp = p1.angle + (i - 0.5) * 0.15;
          this.addBullet(p1.id, 'BLUE', p1.x + Math.cos(sp) * 20, p1.y + Math.sin(sp) * 20, Math.cos(sp) * 11, Math.sin(sp) * 11, 25, '#67e8f9');
        }
        this.onNotice?.('⚡ MARKSMAN : RAFALE DE PRÉCISION !');
      } else if (spellKey === 'r') {
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            if (!p1.isAlive) return;
            const sp = p1.angle + (Math.random() - 0.5) * 0.4;
            this.addBullet(p1.id, 'BLUE', p1.x + Math.cos(sp) * 22, p1.y + Math.sin(sp) * 22, Math.cos(sp) * 13, Math.sin(sp) * 13, 30, '#38bdf8', true, 7);
          }, i * 75);
        }
        this.onNotice?.('🔥 THE CULLING DÉVERSÉ !');
      }
    } else if (playerRole === 'SLAYER') {
      if (spellKey === 'q') {
        const enemy = this.state.redTeam.find(e => e.isAlive);
        if (enemy) {
          p1.x = enemy.x + Math.cos(enemy.angle + Math.PI) * 50;
          p1.y = enemy.y + Math.sin(enemy.angle + Math.PI) * 50;
          p1.angle = enemy.angle;
          enemy.hp = Math.max(0, enemy.hp - 55);
          shootactoeSounds.hit();
          this.spawnParticles(enemy.x, enemy.y, '#f43f5e', 30);
          this.onNotice?.('🗡️ ASSAUT CRITIQUE DANS LE DOS (-55 PV) !');
        }
      } else if (spellKey === 'w') {
        this.state.stealthTimerP1 = 3.5;
        this.spawnParticles(p1.x, p1.y, '#9333ea', 20);
        this.onNotice?.('👤 MODE FURTIF INVISIBLE ACTIVÉ (3.5s) !');
      } else if (spellKey === 'e') {
        p1.vx += dirX * 8; p1.vy += dirY * 8;
        this.state.redTeam.forEach(e => {
          if (e.isAlive && Math.hypot(e.x - p1.x, e.y - p1.y) < 110) {
            e.vx += dirX * 10; e.vy += dirY * 10; e.hp = Math.max(0, e.hp - 35);
          }
        });
        this.spawnParticles(p1.x, p1.y, '#c026d3', 25);
        this.onNotice?.('🌪️ SWEEP ÉCLAIR & EXPULSION !');
      } else if (spellKey === 'r') {
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3;
          this.addBullet(p1.id, 'BLUE', p1.x, p1.y, Math.cos(ang) * 9, Math.sin(ang) * 9, 32, '#a855f7', true, 6);
        }
        this.onNotice?.('🩸 OMBRE SPECTRALE 360° !');
      }
    } else if (playerRole === 'SUPPORT') {
      if (spellKey === 'q') {
        this.state.healingZones.push({ x: p1.x, y: p1.y, radius: 100, life: 6.0, team: 'BLUE' });
        this.spawnParticles(p1.x, p1.y, '#10b981', 25);
        this.onNotice?.('🌿 SANCTUAIRE DE SOINS (6s) DÉPLOYÉ !');
      } else if (spellKey === 'w') {
        this.state.gravityWells.push({ x: mousePos.x, y: mousePos.y, radius: 130, life: 5.0, team: 'BLUE' });
        this.spawnParticles(mousePos.x, mousePos.y, '#6366f1', 30);
        this.onNotice?.('🌌 PUITS GRAVITATIONNEL CRÉÉ !');
      } else if (spellKey === 'e') {
        p1.shield = Math.min(p1.maxShield * 1.5, p1.shield + 60);
        this.spawnParticles(p1.x, p1.y, '#38bdf8', 20);
        this.onNotice?.('🛡️ SURCHARGE DE BOUCLIER (+60) !');
      } else if (spellKey === 'r') {
        this.state.blueTeam.forEach(ally => {
          if (ally.isAlive) {
            ally.hp = ally.maxHp; ally.shield = ally.maxShield;
            this.spawnParticles(ally.x, ally.y, '#10b981', 25);
          }
        });
        this.onNotice?.('🌟 AURORE RÉGÉNÉRATRICE GLOBALE !');
      }
    } else if (playerRole === 'TANK') {
      if (spellKey === 'q') {
        this.state.redTeam.forEach(e => {
          if (e.isAlive && Math.hypot(e.x - p1.x, e.y - p1.y) < 140) {
            const push = Math.atan2(e.y - p1.y, e.x - p1.x);
            e.vx += Math.cos(push) * 12; e.vy += Math.sin(push) * 12; e.hp = Math.max(0, e.hp - 40);
          }
        });
        this.spawnParticles(p1.x, p1.y, '#f97316', 35);
        this.onNotice?.('💥 ONDE DE CHOC SISMIQUE 360° !');
      } else if (spellKey === 'w') {
        p1.shield = p1.maxShield * 2;
        this.spawnParticles(p1.x, p1.y, '#ea580c', 25);
        this.onNotice?.('🧱 BASTION BLINDÉ ACTIF (BOUCLIER X2) !');
      } else if (spellKey === 'e') {
        p1.vx += dirX * 14; p1.vy += dirY * 14;
        this.spawnParticles(p1.x, p1.y, '#dc2626', 25);
        this.onNotice?.('🚀 CHARGE COLOSSALE TITAN !');
      } else if (spellKey === 'r') {
        this.state.redTeam.forEach(e => {
          if (e.isAlive) {
            const pull = Math.atan2(p1.y - e.y, p1.x - e.x);
            e.vx += Math.cos(pull) * 10; e.vy += Math.sin(pull) * 10; e.hp = Math.max(0, e.hp - 50);
          }
        });
        this.spawnParticles(p1.x, p1.y, '#dc2626', 40);
        this.onNotice?.('🌋 CATACLYSME SISMIQUE TOTAL !');
      }
    }
  }

  public update(dt: number, keys: Record<string, boolean>, mousePos: { x: number; y: number }, _playerRole?: any, _teamSize?: any, keybinds?: KeybindConfig) {
    if (this.state.matchEnded) return;

    Object.keys(this.state.spellTimersP1).forEach(k => {
      const key = k as 'q' | 'w' | 'e' | 'r';
      if (this.state.spellTimersP1[key] > 0) this.state.spellTimersP1[key] = Math.max(0, this.state.spellTimersP1[key] - dt);
    });
    if (this.state.magnetAimTimerP1 > 0) this.state.magnetAimTimerP1 = Math.max(0, this.state.magnetAimTimerP1 - dt);
    if (this.state.stealthTimerP1 > 0) this.state.stealthTimerP1 = Math.max(0, this.state.stealthTimerP1 - dt);

    const p1 = this.state.blueTeam[0];
    if (p1 && p1.isAlive) {
      p1.angle = Math.atan2(mousePos.y - p1.y, mousePos.x - p1.x);
      let ax = 0, ay = 0;
      if (isActionPressed(keys, keybinds?.moveUp || 'z')) ay -= 1;
      if (isActionPressed(keys, keybinds?.moveDown || 's')) ay += 1;
      if (isActionPressed(keys, keybinds?.moveLeft || 'q')) ax -= 1;
      if (isActionPressed(keys, keybinds?.moveRight || 'd')) ax += 1;
      if (ax !== 0 && ay !== 0) { ax *= 0.7071; ay *= 0.7071; }

      const cfg = CHAMPION_SHIPS[p1.role];
      p1.vx += ax * cfg.speed * 0.35;
      p1.vy += ay * cfg.speed * 0.35;

      if (isActionPressed(keys, ' ') && p1.dashCooldown <= 0 && (ax !== 0 || ay !== 0)) {
        p1.vx += ax * 12; p1.vy += ay * 12; p1.dashCooldown = 2.0;
        shootactoeSounds.cellCaptured();
        this.spawnParticles(p1.x, p1.y, '#38bdf8', 12);
      }

      if (keys['mousedown'] && p1.shootCooldown <= 0) {
        p1.shootCooldown = 0.22;
        const dirX = Math.cos(p1.angle);
        const dirY = Math.sin(p1.angle);
        this.addBullet(p1.id, 'BLUE', p1.x + dirX * 20, p1.y + dirY * 20, dirX * 11, dirY * 11, 20, '#38bdf8', this.state.magnetAimTimerP1 > 0);
        shootactoeSounds.shoot();
      }

      (['q', 'w', 'e', 'r'] as const).forEach(k => {
        const customKey = keybinds ? keybinds[`spell${k.toUpperCase()}` as keyof KeybindConfig] : k;
        if (isActionPressed(keys, customKey)) {
          this.castSpellP1(k, p1.role, mousePos);
        }
      });
    }

    const updateBots = (team: ShipState[], enemies: ShipState[], spawnX: number, isBlue: boolean) => {
      team.forEach((ship, idx) => {
        if (!ship.isAI) return;
        if (ship.isAlive) {
          const unowned = this.state.grid.filter(c => c.owner !== (isBlue ? 'BLUE' : 'RED'));
          const target = unowned.length > 0 ? unowned[idx % unowned.length] : this.state.grid[idx % this.state.grid.length];
          const dx = target.x - ship.x;
          const dy = target.y - ship.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 30) {
            ship.vx += (dx / dist) * 0.7;
            ship.vy += (dy / dist) * 0.7;
            const spd = Math.hypot(ship.vx, ship.vy);
            if (spd > 2.8) { ship.vx = (ship.vx / spd) * 2.8; ship.vy = (ship.vy / spd) * 2.8; }
          } else {
            ship.vx *= 0.88; ship.vy *= 0.88;
          }

          const nearest = enemies.find(e => e.isAlive);
          if (nearest) {
            ship.angle = Math.atan2(nearest.y - ship.y, nearest.x - ship.x);
            ship.shootCooldown -= dt;
            if (Math.hypot(nearest.x - ship.x, nearest.y - ship.y) < 400 && ship.shootCooldown <= 0) {
              ship.shootCooldown = 0.35;
              this.addBullet(ship.id, isBlue ? 'BLUE' : 'RED', ship.x + Math.cos(ship.angle) * 20, ship.y + Math.sin(ship.angle) * 20, Math.cos(ship.angle) * 9.5, Math.sin(ship.angle) * 9.5, 18, isBlue ? '#38bdf8' : '#f43f5e');
            }
          }
          ship.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, ship.x + ship.vx));
          ship.y = Math.max(30, Math.min(CANVAS_HEIGHT - 30, ship.y + ship.vy));
        } else {
          ship.respawnTimer -= dt;
          if (ship.respawnTimer <= 0) {
            ship.isAlive = true; ship.hp = ship.maxHp; ship.shield = ship.maxShield;
            ship.x = spawnX; ship.y = 200 + idx * 110; ship.vx = 0; ship.vy = 0;
            this.spawnParticles(ship.x, ship.y, isBlue ? '#38bdf8' : '#f43f5e', 20);
          }
        }
      });
    };

    updateBots(this.state.blueTeam, this.state.redTeam, 140, true);
    updateBots(this.state.redTeam, this.state.blueTeam, CANVAS_WIDTH - 140, false);

    const applyZoneForces = (zones: typeof this.state.gravityWells, isHeal: boolean) => {
      for (let i = zones.length - 1; i >= 0; i--) {
        const z = zones[i];
        z.life -= dt;
        const targets = isHeal ? (z.team === 'BLUE' ? this.state.blueTeam : this.state.redTeam) : (z.team === 'BLUE' ? this.state.redTeam : this.state.blueTeam);
        targets.forEach(s => {
          if (s.isAlive && Math.hypot(z.x - s.x, z.y - s.y) < z.radius) {
            if (isHeal) {
              s.hp = Math.min(s.maxHp, s.hp + 25 * dt);
              s.shield = Math.min(s.maxShield, s.shield + 35 * dt);
            } else {
              const pull = Math.atan2(z.y - s.y, z.x - s.x);
              s.vx += Math.cos(pull) * 0.9; s.vy += Math.sin(pull) * 0.9;
            }
          }
        });
        if (z.life <= 0) zones.splice(i, 1);
      }
    };

    applyZoneForces(this.state.gravityWells, false);
    applyZoneForces(this.state.healingZones, true);

    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const b = this.state.bullets[i];
      const targetTeam = b.team === 'BLUE' ? this.state.redTeam : this.state.blueTeam;
      const target = targetTeam.find(t => t.isAlive && Math.hypot(t.x - b.x, t.y - b.y) < t.radius + b.radius);

      if (b.isHoming) {
        const nearest = targetTeam.find(t => t.isAlive);
        if (nearest) {
          const ang = Math.atan2(nearest.y - b.y, nearest.x - b.x);
          b.vx += Math.cos(ang) * 0.6; b.vy += Math.sin(ang) * 0.6;
          const spd = Math.hypot(b.vx, b.vy);
          if (spd > 11) { b.vx = (b.vx / spd) * 11; b.vy = (b.vy / spd) * 11; }
        }
      }

      b.x += b.vx; b.y += b.vy; b.life -= 1;

      if (target) {
        const hitDmg = b.damage;
        if (target.shield > 0) {
          const rem = Math.max(0, target.shield - hitDmg);
          const spill = Math.max(0, hitDmg - target.shield);
          target.shield = rem;
          target.hp = Math.max(0, target.hp - spill);
        } else {
          target.hp = Math.max(0, target.hp - hitDmg);
        }
        shootactoeSounds.hit();
        this.spawnParticles(b.x, b.y, b.color, 8);

        if (target.hp <= 0 && target.isAlive) {
          target.isAlive = false;
          target.deaths += 1;
          target.respawnTimer = RESPAWN_TIME_SECONDS;
          const shooter = [...this.state.blueTeam, ...this.state.redTeam].find(s => s.id === b.shooterId);
          if (shooter) shooter.kills += 1;
          shootactoeSounds.shipDestroyed();
          this.spawnParticles(target.x, target.y, target.color, 25);
          this.onNotice?.(`💀 ${target.name} a été détruit !`);
        }
        this.state.bullets.splice(i, 1);
        continue;
      }

      if (b.life <= 0 || b.x < 0 || b.x > CANVAS_WIDTH || b.y < 0 || b.y > CANVAS_HEIGHT) {
        this.state.bullets.splice(i, 1);
      }
    }

    this.state.grid.forEach(cell => {
      if (cell.isLocked) return;
      const blueOccupants = this.state.blueTeam.filter(s => s.isAlive && Math.abs(s.x - cell.x) < cell.width / 2 && Math.abs(s.y - cell.y) < cell.height / 2);
      const redOccupants = this.state.redTeam.filter(s => s.isAlive && Math.abs(s.x - cell.x) < cell.width / 2 && Math.abs(s.y - cell.y) < cell.height / 2);

      cell.isContested = blueOccupants.length > 0 && redOccupants.length > 0;
      if (cell.isContested) return;

      if (blueOccupants.length > 0) {
        if (cell.owner !== 'BLUE') {
          cell.captureProgress += CAPTURE_RATE_PER_SECOND * blueOccupants.length * dt;
          if (cell.captureProgress >= 1.0) {
            cell.owner = 'BLUE'; cell.captureProgress = 1.0; cell.isLocked = true;
            shootactoeSounds.cellCaptured();
            this.spawnParticles(cell.x, cell.y, '#38bdf8', 25);
            this.onNotice?.(`🔵 Case [${cell.row + 1},${cell.col + 1}] verrouillée par l'Équipe Bleue !`);
            this.checkWinCondition();
          }
        }
      } else if (redOccupants.length > 0) {
        if (cell.owner !== 'RED') {
          cell.captureProgress += CAPTURE_RATE_PER_SECOND * redOccupants.length * dt;
          if (cell.captureProgress >= 1.0) {
            cell.owner = 'RED'; cell.captureProgress = 1.0; cell.isLocked = true;
            shootactoeSounds.cellCaptured();
            this.spawnParticles(cell.x, cell.y, '#f43f5e', 25);
            this.onNotice?.(`🔴 Case [${cell.row + 1},${cell.col + 1}] verrouillée par l'Équipe Rouge !`);
            this.checkWinCondition();
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

  public checkWinCondition() {
    const dim = this.state.gridDim;
    const streak = this.state.winStreak;
    const getCell = (r: number, c: number) => this.state.grid[r * dim + c];

    const lines: Array<{ team: TeamColor; cells: GridCell[] }> = [];

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c <= dim - streak; c++) {
        const seg = Array.from({ length: streak }, (_, i) => getCell(r, c + i));
        const first = seg[0].owner;
        if (first && seg.every(cell => cell.owner === first)) lines.push({ team: first, cells: seg });
      }
    }

    for (let c = 0; c < dim; c++) {
      for (let r = 0; r <= dim - streak; r++) {
        const seg = Array.from({ length: streak }, (_, i) => getCell(r + i, c));
        const first = seg[0].owner;
        if (first && seg.every(cell => cell.owner === first)) lines.push({ team: first, cells: seg });
      }
    }

    for (let r = 0; r <= dim - streak; r++) {
      for (let c = 0; c <= dim - streak; c++) {
        const diag1 = Array.from({ length: streak }, (_, i) => getCell(r + i, c + i));
        const first1 = diag1[0].owner;
        if (first1 && diag1.every(cell => cell.owner === first1)) lines.push({ team: first1, cells: diag1 });

        const diag2 = Array.from({ length: streak }, (_, i) => getCell(r + i, c + streak - 1 - i));
        const first2 = diag2[0].owner;
        if (first2 && diag2.every(cell => cell.owner === first2)) lines.push({ team: first2, cells: diag2 });
      }
    }

    if (lines.length > 0) {
      this.state.matchEnded = true;
      const winner = lines[0].team;
      const durationSec = Math.round((Date.now() - this.state.startTime) / 1000);
      shootactoeSounds.victory();
      this.onMatchEnd?.({
        winner,
        blueKills: this.state.blueTeam.reduce((acc, s) => acc + s.kills, 0),
        redKills: this.state.redTeam.reduce((acc, s) => acc + s.kills, 0),
        durationSeconds: durationSec,
        blueCellsHeld: this.state.grid.filter(c => c.owner === 'BLUE').length,
        redCellsHeld: this.state.grid.filter(c => c.owner === 'RED').length,
        teamSize: this.state.blueTeam.length as TeamSize,
        gridDim: dim,
        winLine: { indices: lines[0].cells.map(c => c.index), type: 'ROW', winner },
      });
    } else if (this.state.grid.every(c => c.isLocked)) {
      this.state.matchEnded = true;
      const blueCount = this.state.grid.filter(c => c.owner === 'BLUE').length;
      const redCount = this.state.grid.filter(c => c.owner === 'RED').length;
      const winner = blueCount >= redCount ? 'BLUE' : 'RED';
      this.onMatchEnd?.({
        winner,
        blueKills: this.state.blueTeam.reduce((acc, s) => acc + s.kills, 0),
        redKills: this.state.redTeam.reduce((acc, s) => acc + s.kills, 0),
        durationSeconds: Math.round((Date.now() - this.state.startTime) / 1000),
        blueCellsHeld: blueCount,
        redCellsHeld: redCount,
        teamSize: this.state.blueTeam.length as TeamSize,
        gridDim: dim,
        winLine: null,
      });
    }
  }
}

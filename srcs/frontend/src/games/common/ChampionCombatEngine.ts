import type { HeroRole } from '../pong/types';
import { HERO_CONFIGS } from '../pong/configs';
import { soundEffects } from '../../services/audio';

export interface ChampionCombatProjectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  shrinkAmount: number;
  color: string;
  isMagnet?: boolean;
  isLaser?: boolean;
  team: 'BLUE' | 'RED';
  life: number;
}

export interface ChampionCombatDamageText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface ChampionCombatShockwave {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
}

export interface ChampionCombatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export interface ChampionCombatBlackHole {
  id: string;
  x: number;
  y: number;
  radius: number;
  pullStrength: number;
  createdAt: number;
  expiresAt: number;
}

export interface ChampionCombatGravityField {
  id: string;
  x: number;
  y: number;
  radius: number;
  createdAt: number;
  expiresAt: number;
}

export interface ChampionEntityState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  instantVx: number;
  instantVy: number;
  facingDx: number;
  facingDy: number;
  width: number;
  height: number;
  role: HeroRole;
  team: 'BLUE' | 'RED';

  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  isGhost: boolean;

  cooldownTimers: { a: number; z: number; e: number; r: number };

  dashBoostUntil: number;
  stealthUntil: number;
  poisonUntil: number;
  spectralUltUntil: number;
  tauntUntil: number;
  hardenedUntil: number;
  titanUltUntil: number;
  decayShieldAmount: number;
  decayShieldUntil: number;
  precisionUntil: number;
  extraProjectiles: number;
  cullingUntil: number;
  cullingShotsLeft: number;
  lastCullingShot: number;

  stunUntil: number;
  frozenUntil: number;
  speedUntil: number;
  immuneUntil: number;
  slowTimer: number;
}

let nextId = 1;

export class ChampionCombatEngine {

  public static createChampionState(role: HeroRole, startX = 140, startY = 230, team: 'BLUE' | 'RED' = 'BLUE'): ChampionEntityState {
    const cfg = HERO_CONFIGS[role] || HERO_CONFIGS.SHOOTER;
    return {
      x: startX,
      y: startY,
      prevX: startX,
      prevY: startY,
      instantVx: 0,
      instantVy: 0,
      facingDx: 1,
      facingDy: 0,
      width: cfg.paddleWidth || 20,
      height: cfg.paddleHeight || 75,
      role,
      team,
      hp: cfg.maxHp || 100,
      maxHp: cfg.maxHp || 100,
      shield: cfg.initialShield || 0,
      maxShield: cfg.initialShield || 0,
      stamina: 100,
      maxStamina: 100,
      speed: cfg.speed || 8.0,
      isGhost: false,

      cooldownTimers: { a: 0, z: 0, e: 0, r: 0 },

      dashBoostUntil: 0,
      stealthUntil: 0,
      poisonUntil: 0,
      spectralUltUntil: 0,
      tauntUntil: 0,
      hardenedUntil: 0,
      titanUltUntil: 0,
      decayShieldAmount: 0,
      decayShieldUntil: 0,
      precisionUntil: 0,
      extraProjectiles: 0,
      cullingUntil: 0,
      cullingShotsLeft: 0,
      lastCullingShot: 0,

      stunUntil: 0,
      frozenUntil: 0,
      speedUntil: 0,
      immuneUntil: 0,
      slowTimer: 0,
    };
  }

  public static updateMovement(
    entity: ChampionEntityState,
    inputs: { up: boolean; down: boolean; left: boolean; right: boolean; sprint?: boolean },
    bounds: { width: number; height: number },
    dt: number = 1 / 60
  ) {
    const now = Date.now();

    if (now < entity.frozenUntil || now < entity.stunUntil) {
      entity.instantVx = 0;
      entity.instantVy = 0;
      return;
    }

    if (entity.slowTimer > 0) {
      entity.slowTimer = Math.max(0, entity.slowTimer - dt);
    }

    if (entity.decayShieldUntil > 0 && now >= entity.decayShieldUntil) {
      entity.shield = Math.max(0, entity.shield - entity.decayShieldAmount);
      entity.decayShieldAmount = 0;
      entity.decayShieldUntil = 0;
    }

    let moveX = 0;
    let moveY = 0;
    if (inputs.up) moveY -= 1;
    if (inputs.down) moveY += 1;
    if (inputs.left) moveX -= 1;
    if (inputs.right) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      entity.facingDx = moveX / len;
      entity.facingDy = moveY / len;
    }

    let currentSpeed = entity.speed;
    if (now < entity.speedUntil || now < entity.dashBoostUntil) currentSpeed *= 1.6;
    if (entity.slowTimer > 0) currentSpeed *= 0.5;

    if (inputs.sprint && entity.stamina > 10) {
      currentSpeed *= 1.35;
      entity.stamina = Math.max(0, entity.stamina - dt * 25);
    } else {
      entity.stamina = Math.min(entity.maxStamina, entity.stamina + dt * 15);
    }

    entity.instantVx = moveX * currentSpeed;
    entity.instantVy = moveY * currentSpeed;

    entity.prevX = entity.x;
    entity.prevY = entity.y;

    entity.x += entity.instantVx;
    entity.y += entity.instantVy;

    entity.x = Math.max(10, Math.min(bounds.width - entity.width - 10, entity.x));
    entity.y = Math.max(10, Math.min(bounds.height - entity.height - 10, entity.y));
  }

  public static castSpell(
    caster: ChampionEntityState,
    spellKey: 'a' | 'z' | 'e' | 'r',
    targetPos: { x: number; y: number },
    projectiles: ChampionCombatProjectile[],
    shockwaves: ChampionCombatShockwave[],
    particles: ChampionCombatParticle[],
    damageTexts: ChampionCombatDamageText[],
    blackHoles: ChampionCombatBlackHole[] = [],
    gravityFields: ChampionCombatGravityField[] = []
  ): { banner: string; sound: string } {
    const now = Date.now();
    const cfg = HERO_CONFIGS[caster.role] || HERO_CONFIGS.SHOOTER;
    const spell = cfg.spells[spellKey];

    if (now < caster.cooldownTimers[spellKey]) {
      const remainingSec = Math.ceil((caster.cooldownTimers[spellKey] - now) / 1000);
      soundEffects.playCooldownWarning();
      return { banner: `⏳ ${spell.name} (${remainingSec}s)...`, sound: 'warning' };
    }

    caster.cooldownTimers[spellKey] = now + spell.cooldownMs;

    const startX = caster.x + caster.width / 2;
    const startY = caster.y + caster.height / 2;
    const dir = caster.facingDx >= 0 ? 1 : -1;

    if (spell.id === 'SHOOTER_DOUBLE') {
      soundEffects.playLaser();
      const currentBullets = 1 + caster.extraProjectiles;
      const count = currentBullets * 2;
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 10;
        projectiles.push({
          id: nextId++,
          x: caster.x + caster.width + 10,
          y: startY + offset,
          vx: 16,
          vy: 0,
          radius: 6,
          damage: 40,
          shrinkAmount: 5,
          color: '#06b6d4',
          team: caster.team,
          life: 120,
        });
      }
      this.spawnParticles(particles, startX, startY, '#06b6d4', 15);
      return { banner: spell.bannerText, sound: 'laser' };
    } else if (spell.id === 'SHOOTER_PRECISION') {
      soundEffects.playLaser();
      caster.precisionUntil = now + 10000;
      this.spawnShockwave(shockwaves, startX, startY, '#3b82f6', 60);
      return { banner: spell.bannerText, sound: 'laser' };
    } else if (spell.id === 'SHOOTER_STACKS') {
      soundEffects.playPowerUp();
      if (caster.extraProjectiles < 4) {
        caster.extraProjectiles += 1;
        this.spawnParticles(particles, startX, startY, '#0284c7', 20);
        return { banner: `⚡ MARKSMAN +1 PROJ. (${1 + caster.extraProjectiles}/5) !`, sound: 'powerup' };
      }
      return { banner: '⚡ MARKSMAN DÉJÀ AU MAX (5/5) !', sound: 'powerup' };
    } else if (spell.id === 'SHOOTER_CULLING') {
      soundEffects.playUltiCast();
      const totalLasers = 24 * (1 + caster.extraProjectiles);
      caster.cullingUntil = now + 2800;
      caster.cullingShotsLeft = totalLasers;
      caster.lastCullingShot = 0;
      this.spawnShockwave(shockwaves, startX, startY, '#ec4899', 80);
      return { banner: spell.bannerText, sound: 'ulti' };
    }

    if (spell.id === 'SLAYER_BACKSTAB' || spell.id === 'SLAYER_SHADOW_STEP') {
      soundEffects.playLaser();
      caster.x = targetPos.x - dir * 45;
      caster.y = targetPos.y - caster.height / 2;
      this.spawnShockwave(shockwaves, targetPos.x, targetPos.y, '#f43f5e', 70);
      this.spawnParticles(particles, targetPos.x, targetPos.y, '#f43f5e', 25, 7);
      return { banner: spell.bannerText, sound: 'laser' };
    } else if (spell.id === 'SLAYER_STEALTH' || spell.id === 'SLAYER_SMOKE') {
      soundEffects.playFreezeCast();
      caster.stealthUntil = now + 3500;
      caster.speedUntil = now + 3500;
      this.spawnParticles(particles, startX, startY, '#9333ea', 25);
      return { banner: spell.bannerText, sound: 'freeze' };
    } else if (spell.id === 'SLAYER_DASH' || spell.id === 'SLAYER_POISON') {
      soundEffects.playFreezeCast();
      caster.poisonUntil = now + 4000;
      caster.dashBoostUntil = now + 1800;
      caster.x += dir * 180;
      this.spawnShockwave(shockwaves, caster.x, startY, '#10b981', 65);
      this.spawnParticles(particles, caster.x, startY, '#10b981', 25, 7);
      return { banner: spell.bannerText, sound: 'freeze' };
    } else if (spell.id === 'SLAYER_ULTI' || spell.id === 'SLAYER_LOTUS') {
      soundEffects.playUltiCast();
      caster.spectralUltUntil = now + 8000;
      caster.stealthUntil = now + 8000;
      caster.speedUntil = now + 8000;
      this.spawnShockwave(shockwaves, startX, startY, '#e11d48', 90);
      this.spawnParticles(particles, startX, startY, '#e11d48', 35, 8);
      return { banner: spell.bannerText, sound: 'ulti' };
    }

    if (spell.id === 'SUPP_GRAVITY_FIELD' || spell.id === 'SUPPORT_WARP') {
      soundEffects.playFreezeCast();
      gravityFields.push({
        id: `grav-${now}`,
        x: targetPos.x,
        y: targetPos.y,
        radius: 130,
        createdAt: now,
        expiresAt: now + 6000,
      });
      this.spawnShockwave(shockwaves, targetPos.x, targetPos.y, '#6366f1', 90);
      return { banner: spell.bannerText, sound: 'freeze' };
    } else if (spell.id === 'SUPP_DISPERSION' || spell.id === 'SUPPORT_KINETIC') {
      soundEffects.playLaser();
      this.spawnShockwave(shockwaves, startX, startY, '#a855f7', 180);
      this.spawnParticles(particles, startX, startY, '#a855f7', 35, 8);
      return { banner: spell.bannerText, sound: 'laser' };
    } else if (spell.id === 'SUPP_HEALING_ZONE' || spell.id === 'SUPPORT_SANCTUARY') {
      soundEffects.playPowerUp();
      this.spawnShockwave(shockwaves, startX, startY, '#10b981', 80);
      this.spawnParticles(particles, startX, startY, '#10b981', 25, 5);
      return { banner: spell.bannerText, sound: 'powerup' };
    } else if (spell.id === 'SUPP_BLACK_HOLE' || spell.id === 'SUPPORT_BLACK_HOLE') {
      soundEffects.playUltiCast();
      blackHoles.push({
        id: `bh-${now}`,
        x: targetPos.x,
        y: targetPos.y,
        radius: 260,
        pullStrength: 8.5,
        createdAt: now,
        expiresAt: now + 7000,
      });
      this.spawnShockwave(shockwaves, targetPos.x, targetPos.y, '#9333ea', 120);
      this.spawnParticles(particles, targetPos.x, targetPos.y, '#9333ea', 40, 9);
      return { banner: spell.bannerText, sound: 'ulti' };
    }

    if (spell.id === 'TANK_TAUNT') {
      soundEffects.playStunCast();
      const isTitan = now < caster.titanUltUntil;
      const tauntDuration = isTitan ? 4500 : 3000;
      const tauntRange = isTitan ? 700 : 450;
      caster.tauntUntil = now + tauntDuration;
      this.spawnShockwave(shockwaves, startX, startY, '#ef4444', tauntRange);
      this.spawnParticles(particles, startX, startY, '#ef4444', 35, 8);
      return { banner: spell.bannerText, sound: 'stun' };
    } else if (spell.id === 'TANK_WARCRY' || spell.id === 'TANK_WALL') {
      soundEffects.playPowerUp();
      const isTitan = now < caster.titanUltUntil;
      const shieldGain = isTitan ? 180 : 100;
      caster.shield += shieldGain;
      caster.decayShieldAmount = (caster.decayShieldAmount || 0) + shieldGain;
      caster.decayShieldUntil = now + 3000;
      this.spawnShockwave(shockwaves, startX, startY, '#eab308', 65);
      this.spawnParticles(particles, startX, startY, '#eab308', 20, 5);
      return { banner: spell.bannerText, sound: 'powerup' };
    } else if (spell.id === 'TANK_HARDEN') {
      soundEffects.playWallCast();
      const isTitan = now < caster.titanUltUntil;
      const shieldGain = isTitan ? 1800 : 1000;
      caster.hardenedUntil = now + 3000;
      caster.shield += shieldGain;
      caster.decayShieldAmount = (caster.decayShieldAmount || 0) + shieldGain;
      caster.decayShieldUntil = now + 3000;
      this.spawnShockwave(shockwaves, startX, startY, '#3b82f6', 70);
      this.spawnParticles(particles, startX, startY, '#3b82f6', 30, 7);
      return { banner: spell.bannerText, sound: 'wall' };
    } else if (spell.id === 'TANK_TITAN' || spell.id === 'TANK_SUPERNOVA') {
      soundEffects.playUltiCast();
      caster.titanUltUntil = now + 8000;
      caster.shield += 150;
      this.spawnShockwave(shockwaves, startX, startY, '#8b5cf6', 150);
      this.spawnParticles(particles, startX, startY, '#8b5cf6', 45, 10);
      return { banner: spell.bannerText, sound: 'ulti' };
    }

    return { banner: spell.bannerText || '✨ Sort Activé !', sound: 'click' };
  }

  public static updateContinuousSpells(
    caster: ChampionEntityState,
    targetPos: { x: number; y: number },
    projectiles: ChampionCombatProjectile[],
    particles: ChampionCombatParticle[],
    blackHoles: ChampionCombatBlackHole[] = []
  ) {
    const now = Date.now();

    if (caster.cullingShotsLeft > 0 && now < caster.cullingUntil) {
      if (now - caster.lastCullingShot >= 45) {
        caster.lastCullingShot = now;
        caster.cullingShotsLeft--;

        const spread = (Math.random() - 0.5) * 2.5;
        const startY = caster.y + caster.height / 2 + (Math.random() - 0.5) * 20;

        projectiles.push({
          id: nextId++,
          x: caster.x + caster.width + 10,
          y: startY,
          vx: 24,
          vy: spread,
          radius: 5,
          damage: 18,
          shrinkAmount: 2,
          color: '#ec4899',
          isLaser: true,
          team: caster.team,
          life: 90,
        });

        this.spawnParticles(particles, caster.x + caster.width + 10, startY, '#ec4899', 2, 2);
      }
    }

    for (let i = blackHoles.length - 1; i >= 0; i--) {
      if (now >= blackHoles[i].expiresAt) {
        blackHoles.splice(i, 1);
      }
    }
  }

  public static executeBasicAttack(
    caster: ChampionEntityState,
    targetPos: { x: number; y: number },
    projectiles: ChampionCombatProjectile[]
  ) {
    const now = Date.now();
    const cfg = HERO_CONFIGS[caster.role] || HERO_CONFIGS.SHOOTER;
    soundEffects.playLaser();

    const startX = caster.x + caster.width + 10;
    const startY = caster.y + caster.height / 2;
    const isMagnet = now < caster.precisionUntil;
    const currentBullets = 1 + caster.extraProjectiles;

    for (let i = 0; i < currentBullets; i++) {
      const spread = (i - (currentBullets - 1) / 2) * 1.5;
      projectiles.push({
        id: nextId++,
        x: startX,
        y: startY + (i - (currentBullets - 1) / 2) * 8,
        vx: 16,
        vy: spread,
        radius: 7,
        damage: 45,
        shrinkAmount: 6,
        color: cfg.color || '#06b6d4',
        isMagnet,
        team: caster.team,
        life: 110,
      });
    }
  }

  public static spawnParticles(
    particles: ChampionCombatParticle[],
    x: number,
    y: number,
    color: string,
    count = 15,
    size = 3
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 5 + 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size,
        life: 1.0,
      });
    }
  }

  public static spawnShockwave(
    shockwaves: ChampionCombatShockwave[],
    x: number,
    y: number,
    color: string,
    maxRadius = 70
  ) {
    shockwaves.push({
      id: nextId++,
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      life: 1.0,
    });
  }
}

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  MatchSize,
  HeroRole,
  MapTheme,
  ChampionSkin,
  PlayerEntity,
  Projectile,
  SlashEffect,
  WallEntity,
  TrapEntity,
  PortalPair,
  GravityVortex,
  GravityFieldZone,
  HealingZone,
  BlackHoleZone,
  HealingFog,
  OriannaUltimateZone,
  DamageText,
  Particle,
  Shockwave,
  GameOverData,
  RoundHistoryItem
} from '../types';
import { HERO_CONFIGS, MAP_CONFIGS } from '../configs';
import { soundEffects } from '../../../services/audio';
import { cosmeticsStore } from '../../../services/cosmeticsStore';
import { drawUnifiedPaddle, getHeroEquippedLoadout } from '../renderers/PaddleRenderer';
import type { PaddleVisualLoadout } from '../renderers/PaddleRenderer';

interface PongArenaViewProps {
  matchSize: MatchSize;
  selectedRole: HeroRole;
  selectedMap: MapTheme;
  selectedSkin?: ChampionSkin;
  playerName?: string;
  controlMode?: 'KEYBOARD_MOUSE' | 'MOUSELESS';
  onFinishMatch?: (data: GameOverData) => void;
  onGameOver?: (data: GameOverData) => void;
  onBackToModeSelect?: () => void;
  onQuit?: () => void;
}

export const PongArenaView: React.FC<PongArenaViewProps> = ({
  matchSize,
  selectedRole,
  selectedMap,
  selectedSkin,
  playerName = 'Vous',
  controlMode: initialControlMode = 'KEYBOARD_MOUSE',
  onFinishMatch,
  onGameOver,
  onBackToModeSelect,
  onQuit,
}) => {
  const handleGameOverCallback = onGameOver || onFinishMatch || (() => {});
  const handleQuitCallback = onQuit || onBackToModeSelect || (() => {});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [infiniteCd, setInfiniteCd] = useState(false);
  const [infiniteStamina, setInfiniteStamina] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);

  const [selectedSpellKey, setSelectedSpellKey] = useState<string | null>(null);
  const [scoreBlue, setScoreBlue] = useState(0);
  const [scoreRed, setScoreRed] = useState(0);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({ a: 0, z: 0, e: 0, r: 0 });
  const [playerStamina, setPlayerStamina] = useState(100);
  const [controlMode, setControlMode] = useState<'KEYBOARD_MOUSE' | 'MOUSELESS'>(initialControlMode);

  const [currentRound, setCurrentRound] = useState(1);
  const [roundsWonBlue, setRoundsWonBlue] = useState(0);
  const [roundsWonRed, setRoundsWonRed] = useState(0);
  const [roundScoreBlue, setRoundScoreBlue] = useState(0);
  const [roundScoreRed, setRoundScoreRed] = useState(0);
  const [roundDeathsBlue, setRoundDeathsBlue] = useState(0);
  const [roundDeathsRed, setRoundDeathsRed] = useState(0);
  const [matchElapsedSeconds, setMatchElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!stateRef.current.isGameOver) {
        const elapsed = Math.max(0, Math.floor((Date.now() - stateRef.current.matchStartTime) / 1000));
        setMatchElapsedSeconds(elapsed);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const stateRef = useRef({
    scoreBlue: 0,
    scoreRed: 0,
    currentRound: 1,
    roundsWonBlue: 0,
    roundsWonRed: 0,
    roundScoreBlue: 0,
    roundScoreRed: 0,
    roundDeathsBlue: 0,
    roundDeathsRed: 0,
    roundHistory: [] as RoundHistoryItem[],
    roundTransitionUntil: 0,
    matchStartTime: Date.now(),
    isGameOver: false,
    arenaW: 1000,
    arenaH: 600,
    matchSize,
    selectedMap,
    infiniteCd: false,
    infiniteStamina: false,
    godMode: false,
    controlMode: 'KEYBOARD_MOUSE' as 'KEYBOARD_MOUSE' | 'MOUSELESS',
    mousePos: { x: 500, y: 300 },
    totalDamageDealt: 0,
    ball: { x: 500, y: 300, vx: 5.5, vy: 2.5, radius: 27, isSmash: false, carrierId: null as string | null },
    keys: { up: false, down: false, left: false, right: false, space: false, shift: false },
    selectedRole,
    selectedSpellKey: null as string | null,
    cooldowns: { a: 0, z: 0, e: 0, r: 0 } as Record<string, number>,
    players: [] as PlayerEntity[],
    portals: [] as PortalPair[],
    vortices: [] as GravityVortex[],
    gravityFields: [] as GravityFieldZone[],
    healingZones: [] as HealingZone[],
    blackHoles: [] as BlackHoleZone[],
    healingFogs: [] as HealingFog[],
    oriannaUlts: [] as OriannaUltimateZone[],
    projectiles: [] as Projectile[],
    slashEffects: [] as SlashEffect[],
    walls: [] as WallEntity[],
    traps: [] as TrapEntity[],
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],
    damageTexts: [] as DamageText[],
    pellets: [] as Array<{ id: number; x: number; y: number }>,
    activeBanner: null as { text: string; color: string; life: number } | null,
    shakeScreenUntil: 0,
    lockedTargetId: null as string | null,
    lockedTargetIndex: 0,
    activeVolleys: new Map<string, { totalFired: number; resolvedCount: number; hitCount: number; shooterId: string }>(),
  });

  useEffect(() => {
    stateRef.current.infiniteCd = infiniteCd;
    stateRef.current.infiniteStamina = infiniteStamina;
    stateRef.current.godMode = godMode;
    stateRef.current.controlMode = controlMode;
  }, [infiniteCd, infiniteStamina, godMode, controlMode]);

  const spawnParticles = (x: number, y: number, color: string, count = 16, speed = 5) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 3.5 + 2,
        life: 1.0,
      });
    }
  };

  const spawnShockwave = (x: number, y: number, color: string, maxRadius = 55) => {
    stateRef.current.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      life: 1.0,
    });
  };

  const initMatch = useCallback((mode: MatchSize, map: MapTheme, userRole: HeroRole) => {
    const s = stateRef.current;
    s.matchSize = mode;
    s.selectedMap = map;
    s.selectedRole = userRole;

    const isTouchdown = mode === 'TOUCHDOWN';
    s.arenaW = isTouchdown ? 2400 : 1000;
    s.arenaH = isTouchdown ? 1400 : 600;

    const userStartX = isTouchdown ? 350 : 60;
    const userStartY = isTouchdown ? 650 : 260;

    const newPlayers: PlayerEntity[] = [];
    const cfg = HERO_CONFIGS[userRole];

    const inv = cosmeticsStore.getInventory();
    const equippedSkin = inv.find(it => it.characterRole === userRole && it.kind === 'SKIN' && it.isEquipped);
    const equippedWeapon = inv.find(it => it.characterRole === userRole && it.kind === 'WEAPON' && it.isEquipped);
    const equippedGlow = inv.find(it => it.characterRole === userRole && it.kind === 'GLOW' && it.isEquipped);
    const equippedAura = inv.find(it => it.characterRole === userRole && it.kind === 'AURA' && it.isEquipped);
    const equippedTrail = inv.find(it => it.characterRole === userRole && it.kind === 'TRAIL' && it.isEquipped);

    newPlayers.push({
      id: 'blue-0',
      name: playerName,
      role: userRole,
      isHuman: true,
      team: 'BLUE',
      x: userStartX,
      y: userStartY,
      z: 0,
      prevX: userStartX,
      prevY: userStartY,
      instantVx: 0,
      instantVy: 0,
      facingDx: 1,
      facingDy: 0,
      history: [],
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
      turnAroundAt: 0,
      hp: cfg.maxHp,
      maxHp: cfg.maxHp,
      shield: cfg.initialShield,
      stamina: 100,
      maxStamina: 100,
      isSprinting: false,
      speed: cfg.speed,
      paddleWidth: cfg.paddleWidth,
      paddleHeight: cfg.paddleHeight,
      isGhost: false,
      respawnAt: 0,
      deaths: 0,
      kills: 0,
      damageDealt: 0,
      damageTanked: 0,
      healingProvided: 0,
      stunUntil: 0,
      frozenUntil: 0,
      speedUntil: 0,
      immuneUntil: 0,
      lastShootTime: 0,
      lastSpellTime: 0,
      color: equippedSkin?.primaryColor || (selectedSkin ? selectedSkin.primaryColor : cfg.color),
      customSkinColor: equippedSkin?.primaryColor || (selectedSkin ? selectedSkin.primaryColor : undefined),
      customSecondaryColor: equippedSkin?.secondaryColor || (selectedSkin ? (selectedSkin.secondaryColor || selectedSkin.primaryColor) : equippedSkin?.primaryColor),
      customGlowColor: equippedGlow?.glowColor,
      customAuraColor: equippedAura?.glowColor,
      customTrailColor: equippedTrail?.glowColor,
      customWeaponId: equippedWeapon?.id,
      customWeaponName: equippedWeapon?.name,
      customWeaponIcon: equippedWeapon?.icon,
      customWeaponColor: equippedWeapon?.primaryColor,
      customSkinRarity: equippedSkin?.rarity || (selectedSkin ? selectedSkin.rarity : undefined),
      customSkinStars: equippedSkin?.stars || (selectedSkin ? 6 : 3),
    });

    if (mode === 'PRACTICE') {
      newPlayers.push({
        id: 'red-dummy',
        name: '🎯 Mannequin Fixe (Cible)',
        role: 'TANK',
        isHuman: false,
        isDummy: true,
        team: 'RED',
        x: 800,
        y: 250,
        z: 0,
        prevX: 800,
        prevY: 250,
        instantVx: 0,
        instantVy: 0,
        facingDx: -1,
        facingDy: 0,
        history: [],
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
        turnAroundAt: 0,
        hp: 9999,
        maxHp: 9999,
        shield: 0,
        stamina: 100,
        maxStamina: 100,
        isSprinting: false,
        speed: 0,
        paddleWidth: 24,
        paddleHeight: 100,
        isGhost: false,
        respawnAt: 0,
        deaths: 0,
        kills: 0,
        damageDealt: 0,
        damageTanked: 0,
        healingProvided: 0,
        stunUntil: 0,
        frozenUntil: 0,
        speedUntil: 0,
        immuneUntil: 0,
        lastShootTime: 0,
        lastSpellTime: 0,
        color: '#eab308',
      });
    } else if (mode === 'PACMAN_GOAL') {
      const pacmanConfigs = [
        { name: '🟡 Pacman Glouton', color: '#facc15', startX: 750, startY: 180, speed: 4.0, radius: 12 },
        { name: '🟠 Pacman Vorace', color: '#fb923c', startX: 820, startY: 380, speed: 4.3, radius: 14 },
      ];

      pacmanConfigs.forEach((pCfg, idx) => {
        newPlayers.push({
          id: `red-pacman-${idx}`,
          name: pCfg.name,
          role: 'TANK',
          isHuman: false,
          isPacman: true,
          team: 'RED',
          x: pCfg.startX,
          y: pCfg.startY,
          z: 0,
          prevX: pCfg.startX,
          prevY: pCfg.startY,
          instantVx: 0,
          instantVy: 0,
          facingDx: -1,
          facingDy: 0,
          history: [],
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
          hp: 600,
          maxHp: 600,
          shield: 0,
          stamina: 100,
          maxStamina: 100,
          isSprinting: false,
          speed: pCfg.speed,
          paddleWidth: pCfg.radius * 2,
          paddleHeight: pCfg.radius * 2,
          pacmanRadius: pCfg.radius,
          pacmanTargetRadius: pCfg.radius,
          pacmanMouthAngle: 0.25,
          pacmanMouthOpening: true,
          pacmanSpitCooldown: 120 + idx * 30,
          isFury: false,
          isGhost: false,
          respawnAt: 0,
          deaths: 0,
          kills: 0,
          damageDealt: 0,
          damageTanked: 0,
          healingProvided: 0,
          stunUntil: 0,
          frozenUntil: 0,
          speedUntil: 0,
          immuneUntil: 0,
          lastShootTime: 0,
          lastSpellTime: 0,
          color: pCfg.color,
        });
      });

      const items = [];
      for (let i = 0; i < 35; i++) {
        items.push({
          id: i + 1,
          x: Math.floor(Math.random() * (s.arenaW - 350)) + 120,
          y: Math.floor(Math.random() * (s.arenaH - 120)) + 60,
        });
      }
      s.pellets = items;
    } else {
      const countMap: Record<string, number> = { '1v1': 1, '2v2': 2, '3v3': 3, '4v4': 4, 'TOUCHDOWN': 3 };
      const playersPerTeam = countMap[mode] || 1;

      const allRoles: HeroRole[] = ['SHOOTER', 'SLAYER', 'SUPPORT', 'TANK'];
      const bluePool = allRoles.filter(r => r !== userRole);
      const redPool: HeroRole[] = ['TANK', 'SLAYER', 'SUPPORT', 'SHOOTER'];

      const ySlots = isTouchdown
        ? [650, 350, 950]
        : playersPerTeam === 1 ? [270] : playersPerTeam === 2 ? [160, 380] : playersPerTeam === 3 ? [120, 270, 420] : [80, 200, 320, 450];
      const blueXSlots = isTouchdown ? [350, 450, 450] : [40, 150, 260, 370];
      const redXSlots = isTouchdown ? [2050, 1950, 1950] : [940, 830, 720, 610];

      for (let i = 1; i < playersPerTeam; i++) {
        const role = bluePool[(i - 1) % bluePool.length];
        const rCfg = HERO_CONFIGS[role];
        newPlayers.push({
          id: `blue-${i}`,
          name: `Allié ${rCfg.title.split(' ')[0]}`,
          role,
          isHuman: false,
          team: 'BLUE',
          x: blueXSlots[i],
          y: ySlots[i],
          z: 0,
          prevX: blueXSlots[i],
          prevY: ySlots[i],
          instantVx: 0,
          instantVy: 0,
          facingDx: 1,
          facingDy: 0,
          history: [],
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
          turnAroundAt: 0,
          hp: rCfg.maxHp,
          maxHp: rCfg.maxHp,
          shield: rCfg.initialShield,
          stamina: 100,
          maxStamina: 100,
          isSprinting: false,
          speed: rCfg.speed,
          paddleWidth: rCfg.paddleWidth,
          paddleHeight: rCfg.paddleHeight,
          isGhost: false,
          respawnAt: 0,
          deaths: 0,
          kills: 0,
          damageDealt: 0,
          damageTanked: 0,
          healingProvided: 0,
          stunUntil: 0,
          frozenUntil: 0,
          speedUntil: 0,
          immuneUntil: 0,
          lastShootTime: 0,
          lastSpellTime: 0,
          color: rCfg.color,
        });
      }

      for (let i = 0; i < playersPerTeam; i++) {
        const role = redPool[i % redPool.length];
        const rCfg = HERO_CONFIGS[role];
        newPlayers.push({
          id: `red-${i}`,
          name: `Ennemi ${rCfg.title.split(' ')[0]}`,
          role,
          isHuman: false,
          team: 'RED',
          x: redXSlots[i],
          y: ySlots[i],
          z: 0,
          prevX: redXSlots[i],
          prevY: ySlots[i],
          instantVx: 0,
          instantVy: 0,
          facingDx: -1,
          facingDy: 0,
          history: [],
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
          turnAroundAt: 0,
          hp: rCfg.maxHp,
          maxHp: rCfg.maxHp,
          shield: rCfg.initialShield,
          stamina: 100,
          maxStamina: 100,
          isSprinting: false,
          speed: rCfg.speed,
          paddleWidth: rCfg.paddleWidth,
          paddleHeight: rCfg.paddleHeight,
          isGhost: false,
          respawnAt: 0,
          deaths: 0,
          kills: 0,
          damageDealt: 0,
          damageTanked: 0,
          healingProvided: 0,
          stunUntil: 0,
          frozenUntil: 0,
          speedUntil: 0,
          immuneUntil: 0,
          lastShootTime: 0,
          lastSpellTime: 0,
          color: '#f43f5e',
        });
      }
    }

    s.players = newPlayers;
    s.scoreBlue = 0;
    s.scoreRed = 0;
    setScoreBlue(0);
    setScoreRed(0);
    s.matchStartTime = Date.now();
    s.isGameOver = false;

    if (isTouchdown) {
      s.walls = [

        { id: 'mid-n', x: 1200 - 40, y: 240, width: 80, height: 180, color: '#38bdf8', team: 'NEUTRAL' },

        { id: 'mid-s', x: 1200 - 40, y: 980, width: 80, height: 180, color: '#38bdf8', team: 'NEUTRAL' },

        { id: 'blue-b1', x: 780, y: 380, width: 60, height: 160, color: '#06b6d4', team: 'BLUE' },
        { id: 'blue-b2', x: 780, y: 860, width: 60, height: 160, color: '#06b6d4', team: 'BLUE' },

        { id: 'red-b1', x: 1560, y: 380, width: 60, height: 160, color: '#f43f5e', team: 'RED' },
        { id: 'red-b2', x: 1560, y: 860, width: 60, height: 160, color: '#f43f5e', team: 'RED' },

        { id: 'blue-top-wall', x: 0, y: 0, width: 100, height: 560, color: '#1e293b', team: 'BLUE' },
        { id: 'blue-bot-wall', x: 0, y: 840, width: 100, height: 560, color: '#1e293b', team: 'BLUE' },

        { id: 'red-top-wall', x: 2300, y: 0, width: 100, height: 560, color: '#1e293b', team: 'RED' },
        { id: 'red-bot-wall', x: 2300, y: 840, width: 100, height: 560, color: '#1e293b', team: 'RED' },
      ];
      s.ball = { x: 1200, y: 700, vx: 0, vy: 0, radius: 30, isSmash: false, carrierId: null };
    } else {
      s.walls = [];
      s.ball = { x: 500, y: 300, vx: 5.5, vy: 2.5, radius: 27, isSmash: false, carrierId: null };
    }
    s.portals = [];
    s.vortices = [];
    s.gravityFields = [];
    s.healingZones = [];
    s.blackHoles = [];
    s.healingFogs = [];
    s.oriannaUlts = [];
    s.projectiles = [];
    s.slashEffects = [];
    s.traps = [];
  }, [playerName]);

  const handleFinishMatchManually = () => {
    const s = stateRef.current;
    if (s.isGameOver) return;
    s.isGameOver = true;
    const durationSec = Math.max(1, Math.floor((Date.now() - s.matchStartTime) / 1000));
    const winner = s.roundsWonBlue >= s.roundsWonRed ? 'BLUE' : 'RED';
    const finalData: GameOverData = {
      winner,
      scoreBlue: s.scoreBlue,
      scoreRed: s.scoreRed,
      roundsWonBlue: s.roundsWonBlue,
      roundsWonRed: s.roundsWonRed,
      roundHistory: s.roundHistory.length > 0 ? s.roundHistory : [
        {
          round: 1,
          winner,
          reason: 'MATCH TERMINÉ',
          scoreBlue: s.roundScoreBlue || s.scoreBlue,
          scoreRed: s.roundScoreRed || s.scoreRed,
          deathsBlue: s.roundDeathsBlue,
          deathsRed: s.roundDeathsRed
        }
      ],
      durationSeconds: durationSec,
      matchSize: s.matchSize,
      selectedMap: s.selectedMap,
      players: s.players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        team: p.team,
        isHuman: p.isHuman,
        damageDealt: Math.round(p.damageDealt || 0),
        damageTanked: Math.round(p.damageTanked || 0),
        healingProvided: Math.round(p.healingProvided || 0),
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        color: p.color
      }))
    };
    soundEffects.playVictory();
    if (onGameOver) onGameOver(finalData);
    else if (onFinishMatch) onFinishMatch(finalData);
    else if (handleGameOverCallback) handleGameOverCallback(finalData);
  };

  const finishRoundMatch = (winner: 'BLUE' | 'RED', reason: string) => {
    const s = stateRef.current;
    if (s.isGameOver || s.matchSize === 'PRACTICE') return;
    handleFinishMatchManually();
  };

  const handlePlayerDeath = (target: PlayerEntity, attacker?: PlayerEntity) => {
    const s = stateRef.current;
    if (target.isGhost) return;

    if (target.isPacman) {
      soundEffects.playVictory();
      finishRoundMatch('BLUE', 'PACMAN ANÉANTI !');
      return;
    }

    target.isGhost = true;
    target.deaths = (target.deaths || 0) + 1;
    if (attacker) attacker.kills = (attacker.kills || 0) + 1;

    const matchElapsedSec = Math.max(0, Math.floor((Date.now() - s.matchStartTime) / 1000));
    const progress = Math.min(1.0, matchElapsedSec / 180);
    const respawnDurationMs = Math.round(6000 + progress * 4000);
    const respawnSec = Math.ceil(respawnDurationMs / 1000);
    target.respawnAt = Date.now() + respawnDurationMs;

    soundEffects.playDefeat();
    spawnShockwave(target.x + target.paddleWidth / 2, target.y + target.paddleHeight / 2, '#ef4444', 90);
    spawnParticles(target.x + target.paddleWidth / 2, target.y + target.paddleHeight / 2, '#ef4444', 25, 6);

    if (target.team === 'BLUE') {
      s.roundDeathsBlue++;
      setRoundDeathsBlue(s.roundDeathsBlue);
      s.damageTexts.push({
        x: target.x,
        y: target.y - 30,
        text: `💀 MORT BLEUE (${s.roundDeathsBlue}) • Respawn ${respawnSec}s !`,
        color: '#ef4444',
        life: 2.0
      });
    } else {
      s.roundDeathsRed++;
      setRoundDeathsRed(s.roundDeathsRed);
      s.damageTexts.push({
        x: target.x,
        y: target.y - 30,
        text: `💀 MORT ROUGE (${s.roundDeathsRed}) • Respawn ${respawnSec}s !`,
        color: '#ef4444',
        life: 2.0
      });
    }
  };

  const armSpell = useCallback((key: string) => {
    const s = stateRef.current;
    const now = Date.now();
    const human = s.players[0];

    if (human && human.isGhost) {
      soundEffects.playCooldownWarning();
      return;
    }

    const cfg = HERO_CONFIGS[s.selectedRole];
    const spell = cfg.spells[key as 'a' | 'z' | 'e' | 'r'];
    if (!spell) return;

    if (!s.infiniteCd && now < s.cooldowns[key]) {
      const rem = ((s.cooldowns[key] - now) / 1000).toFixed(1);
      soundEffects.playCooldownWarning();
      s.damageTexts.push({
        x: s.players[0]?.x || 50,
        y: (s.players[0]?.y || 100) - 15,
        text: `⏳ ${spell.name} (${rem}s)...`,
        color: '#f59e0b',
        life: 1.0
      });
      return;
    }

    const next = s.selectedSpellKey === key ? null : key;
    s.selectedSpellKey = next;
    setSelectedSpellKey(next);
    soundEffects.playClick();

    if (next && s.keys.space && human) {
      executeShoot(human);
    }
  }, []);

  const executeShoot = useCallback((caster: PlayerEntity) => {
    const s = stateRef.current;
    const now = Date.now();

    if (caster.isGhost) return;
    if (now < caster.stunUntil || now < caster.frozenUntil) return;

    const isBlue = caster.team === 'BLUE';
    const dir = isBlue ? 1 : -1;
    const armedSpell = caster.isHuman ? s.selectedSpellKey : null;

    const pCenterX = caster.x + caster.paddleWidth / 2;
    const pCenterY = caster.y + caster.paddleHeight / 2;
    let targetAngle = isBlue ? 0 : Math.PI;

    if (caster.isHuman && s.controlMode === 'KEYBOARD_MOUSE' && s.mousePos) {
      targetAngle = Math.atan2(s.mousePos.y - pCenterY, s.mousePos.x - pCenterX);
    } else {

      let targetEnemy: PlayerEntity | undefined;
      if (s.lockedTargetId) {
        targetEnemy = s.players.find(other => other.id === s.lockedTargetId && other.team !== caster.team && !other.isGhost && now > other.stealthUntil);
      }
      if (!targetEnemy) {
        const livingEnemies = s.players.filter(other => other.team !== caster.team && !other.isGhost && now > other.stealthUntil);
        if (livingEnemies.length > 0) {
          targetEnemy = livingEnemies.reduce((prev, curr) => {
            const distCurr = Math.hypot((curr.x + curr.paddleWidth / 2) - pCenterX, (curr.y + curr.paddleHeight / 2) - pCenterY);
            const distPrev = Math.hypot((prev.x + prev.paddleWidth / 2) - pCenterX, (prev.y + prev.paddleHeight / 2) - pCenterY);
            return distCurr < distPrev ? curr : prev;
          });
        }
      }

      if (targetEnemy) {
        const targetCenterX = targetEnemy.x + targetEnemy.paddleWidth / 2;
        const targetCenterY = targetEnemy.y + targetEnemy.paddleHeight / 2;
        const rawAngle = Math.atan2(targetCenterY - pCenterY, targetCenterX - pCenterX);

        const isAngleFacing = (isBlue && Math.cos(rawAngle) > 0) || (!isBlue && Math.cos(rawAngle) < 0);
        if (isAngleFacing) {
          targetAngle = rawAngle;
        } else {
          targetAngle = isBlue ? 0 : Math.PI;
        }
      } else {
        targetAngle = isBlue ? 0 : Math.PI;
      }
    }

    if (armedSpell) {
      const cfg = HERO_CONFIGS[caster.role];
      const spell = cfg.spells[armedSpell as 'a' | 'z' | 'e' | 'r'];

      if (spell) {
        if (!s.infiniteCd && now < s.cooldowns[armedSpell]) {
          soundEffects.playCooldownWarning();
          return;
        }

        if (!s.infiniteCd) {
          s.cooldowns[armedSpell] = now + spell.cooldownMs;
          setCooldowns({ ...s.cooldowns });
        }

        s.activeBanner = { text: spell.bannerText, color: spell.color, life: 1.0 };
        spawnShockwave(caster.x + dir * 25, caster.y + caster.paddleHeight / 2, spell.color, 65);

        if (spell.id === 'SHOOTER_DOUBLE') {
          soundEffects.playLaser();
          const isPrecision = now < caster.precisionUntil;
          const currentBullets = 1 + (caster.extraProjectiles || 0);
          const totalShots = 2 * currentBullets;
          const volleyId = `vol-${now}-${Math.random()}`;
          s.activeVolleys.set(volleyId, { totalFired: totalShots, resolvedCount: 0, hitCount: 0, shooterId: caster.id });

          for (let i = 0; i < totalShots; i++) {
            setTimeout(() => {
              const spreadAngle = (i - (totalShots - 1) / 2) * 0.06 + (Math.random() - 0.5) * 0.02;
              const angle = targetAngle + spreadAngle;
              const spd = 22;
              s.projectiles.push({
                x: caster.x + Math.cos(targetAngle) * 25,
                y: caster.y + caster.paddleHeight / 2 + Math.sin(targetAngle) * 25 + (Math.random() - 0.5) * 6,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: isPrecision ? '#06b6d4' : '#f97316',
                team: caster.team,
                damage: 22,
                effect: 'BURST',
                radius: 6,
                isHoming: isPrecision,
                homingTargetId: s.lockedTargetId,
                shooterId: caster.id,
                volleyId
              });
            }, Math.floor(i / currentBullets) * 60);
          }
          s.damageTexts.push({ x: caster.x, y: caster.y - 12, text: `🔫 DOUBLE SHOT (2x : ${totalShots} tirs)!`, color: '#f97316', life: 1.3 });
        } else if (spell.id === 'SHOOTER_PRECISION') {
          soundEffects.playPowerUp();
          const duration = 10000;
          caster.precisionUntil = now + duration;

          const livingEnemies = s.players.filter(other => other.team !== caster.team && !other.isGhost && now > other.stealthUntil);
          if (!s.lockedTargetId && livingEnemies.length > 0) {
            const nearestEnemy = livingEnemies.reduce((prev, curr) => {
              const distCurr = Math.hypot((curr.x + curr.paddleWidth / 2) - (caster.x + caster.paddleWidth / 2), (curr.y + curr.paddleHeight / 2) - (caster.y + caster.paddleHeight / 2));
              const distPrev = Math.hypot((prev.x + prev.paddleWidth / 2) - (caster.x + caster.paddleWidth / 2), (prev.y + prev.paddleHeight / 2) - (caster.y + caster.paddleHeight / 2));
              return distCurr < distPrev ? curr : prev;
            });
            s.lockedTargetId = nearestEnemy.id;
          }

          const currentBullets = 1 + (caster.extraProjectiles || 0);
          const volleyId = `vol-${now}-${Math.random()}`;
          s.activeVolleys.set(volleyId, { totalFired: currentBullets, resolvedCount: 0, hitCount: 0, shooterId: caster.id });

          for (let i = 0; i < currentBullets; i++) {
            const spreadAngle = (i - (currentBullets - 1) / 2) * 0.08;
            const angle = targetAngle + spreadAngle;
            const spd = 20;
            s.projectiles.push({
              x: caster.x + Math.cos(targetAngle) * 25,
              y: caster.y + caster.paddleHeight / 2 + (i - (currentBullets - 1) / 2) * 8,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: '#06b6d4',
              team: caster.team,
              damage: 20,
              effect: 'BURST',
              radius: 6,
              isHoming: true,
              homingTargetId: s.lockedTargetId,
              shooterId: caster.id,
              volleyId
            });
          }

          spawnShockwave(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#06b6d4', 70);
          spawnParticles(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#06b6d4', 25, 6);
          s.damageTexts.push({ x: caster.x, y: caster.y - 15, text: `🎯 MAGNET AIM ACTIF (10.0s) [TAB POUR CIBLE]!`, color: '#06b6d4', life: 1.6 });
        } else if (spell.id === 'SHOOTER_STACKS') {
          soundEffects.playPowerUp();
          const currentExtra = caster.extraProjectiles || 0;
          if (currentExtra < 4) {
            caster.extraProjectiles = currentExtra + 1;
            const totalProj = 1 + caster.extraProjectiles;
            spawnShockwave(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#eab308', 55);
            spawnParticles(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#eab308', 20, 5);
            s.damageTexts.push({
              x: caster.x,
              y: caster.y - 15,
              text: `⚡ MARKSMAN +1 PROJ. (${totalProj}/5) !`,
              color: '#eab308',
              life: 1.5
            });
          } else {
            s.damageTexts.push({
              x: caster.x,
              y: caster.y - 15,
              text: '⚡ MARKSMAN DÉJÀ AU MAX (5/5) !',
              color: '#eab308',
              life: 1.2
            });
          }
        } else if (spell.id === 'SHOOTER_CULLING') {
          soundEffects.playUltiCast();
          const currentBullets = 1 + (caster.extraProjectiles || 0);
          const totalLasers = 24 * currentBullets;
          caster.cullingUntil = now + 2800;
          caster.cullingShotsLeft = totalLasers;
          caster.lastCullingShot = 0;
          s.shakeScreenUntil = now + 350;
          spawnShockwave(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#ec4899', 80);
          s.damageTexts.push({ x: caster.x, y: caster.y - 18, text: `🔥 THE CULLING (${totalLasers} lasers)!`, color: '#ec4899', life: 1.6 });
        }

        else if (spell.id === 'SLAYER_BACKSTAB') {
          const maxRange = 500;
          const enemiesInRange = s.players.filter(p =>
            p.team !== caster.team &&
            !p.isGhost &&
            Math.hypot(p.x - caster.x, p.y - caster.y) <= maxRange
          );

          if (enemiesInRange.length === 0) {
            soundEffects.playCooldownWarning();
            s.damageTexts.push({
              x: caster.x,
              y: caster.y - 15,
              text: '⚠️ AUCUN ENNEMI À PORTÉE (Max 500u)!',
              color: '#f43f5e',
              life: 1.2
            });
            if (!s.infiniteCd) {
              s.cooldowns[armedSpell] = 0;
              setCooldowns({ ...s.cooldowns });
            }
            s.activeBanner = null;
            s.selectedSpellKey = null;
            setSelectedSpellKey(null);
            return;
          }

          const target = enemiesInRange.reduce((prev, curr) =>
            Math.hypot(curr.x - caster.x, curr.y - caster.y) < Math.hypot(prev.x - caster.x, prev.y - caster.y) ? curr : prev
          );
          caster.x = target.x + (target.facingDx > 0 ? -35 : 35);
          caster.y = target.y;
          target.hp = Math.max(0, target.hp - 55);
          s.totalDamageDealt += 55;
          setTotalDamageDealt(s.totalDamageDealt);
          s.shakeScreenUntil = now + 200;
          spawnShockwave(target.x, target.y, '#f43f5e', 55);
          spawnParticles(target.x, target.y, '#f43f5e', 25, 7);
          s.damageTexts.push({ x: target.x, y: target.y - 15, text: '🗡️ ASSAUT CRITIQUE DOS -55 HP!', color: '#f43f5e', life: 1.4 });
          soundEffects.playLaser();
          if (target.hp <= 0) {
            handlePlayerDeath(target, caster);
          }
        } else if (spell.id === 'SLAYER_STEALTH') {
          soundEffects.playFreezeCast();
          caster.stealthUntil = now + 3500;
          caster.speedUntil = now + 3500;
          spawnParticles(caster.x, caster.y + 20, '#9333ea', 20);
        } else if (spell.id === 'SLAYER_DASH') {
          soundEffects.playFreezeCast();
          caster.poisonUntil = now + 4000;
          caster.dashBoostUntil = now + 1800;

          let moveX = 0;
          let moveY = 0;
          if (caster.isHuman) {
            if (s.keys.left) moveX -= 1;
            if (s.keys.right) moveX += 1;
            if (s.keys.up) moveY -= 1;
            if (s.keys.down) moveY += 1;
          } else {
            moveX = caster.facingDx;
            moveY = caster.facingDy;
          }

          if (moveX === 0 && moveY === 0) {
            moveX = caster.facingDx || dir;
            moveY = caster.facingDy || 0;
          }

          const moveLen = Math.hypot(moveX, moveY) || 1;
          const normX = moveX / moveLen;
          const normY = moveY / moveLen;
          const sweepDist = 180;
          const sweepAngle = Math.atan2(normY, normX);

          const startX = caster.x;
          const startY = caster.y;
          const targetX = Math.max(25, Math.min(s.arenaW - 40, caster.x + normX * sweepDist));
          const targetY = Math.max(20, Math.min(s.arenaH - caster.paddleHeight - 20, caster.y + normY * sweepDist));

          const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
            const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            if (l2 === 0) return Math.hypot(px - x1, py - y1);
            let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
            t = Math.max(0, Math.min(1, t));
            return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
          };

          s.players.filter(p => p.team !== caster.team && !p.isGhost).forEach(target => {
            const targetCenterX = target.x + target.paddleWidth / 2;
            const targetCenterY = target.y + target.paddleHeight / 2;
            const dist = distToSegment(targetCenterX, targetCenterY, startX, startY, targetX, targetY);

            if (dist <= 48) {
              const dmg = 45;
              target.hp = Math.max(0, target.hp - dmg);
              target.stunUntil = now + 1000;
              s.totalDamageDealt += dmg;
              setTotalDamageDealt(s.totalDamageDealt);
              if (!target.isDummy) {
                target.x = Math.max(20, Math.min(s.arenaW - 40, target.x + normX * 60));
                target.y = Math.max(15, Math.min(s.arenaH - target.paddleHeight - 15, target.y + normY * 60));
              }
              spawnShockwave(target.x, target.y, '#10b981', 50);
              spawnParticles(target.x, target.y, '#10b981', 20, 6);
              s.damageTexts.push({ x: target.x, y: target.y - 12, text: `🗡️ SWEEP BALAYAGE -${dmg} PV!`, color: '#10b981', life: 1.3 });
              if (target.hp <= 0) {
                handlePlayerDeath(target, caster);
              }
            }
          });

          if (s.matchSize !== 'TOUCHDOWN') {
            const distBall = distToSegment(s.ball.x, s.ball.y, startX, startY, targetX, targetY);
            if (distBall <= s.ball.radius + 40) {
              s.ball.isSmash = true;
              s.ball.vx = normX * 24.0;
              s.ball.vy = normY * 24.0;
              spawnShockwave(s.ball.x, s.ball.y, '#10b981', 75);
              spawnParticles(s.ball.x, s.ball.y, '#10b981', 25, 9);
              s.damageTexts.push({ x: s.ball.x, y: s.ball.y - 15, text: '🌪️ SWEEP DIRECTIONNEL BALLE (24.0)!', color: '#10b981', life: 1.4 });
              soundEffects.playLaser();
            }
          }

          caster.x = targetX;
          caster.y = targetY;

          s.slashEffects.push({
            x: (startX + targetX) / 2,
            y: (startY + targetY) / 2,
            angle: sweepAngle,
            radius: 0,
            isCircle: false,
            width: sweepDist + caster.paddleWidth,
            height: caster.paddleHeight + 20,
            color: '#10b981',
            life: 1.0
          });

          s.shakeScreenUntil = now + 160;
          spawnShockwave(caster.x, caster.y + 20, '#10b981', 55);
          spawnParticles(caster.x, caster.y + 20, '#10b981', 25, 7);
        } else if (spell.id === 'SLAYER_ULTI') {
          soundEffects.playUltiCast();
          caster.spectralUltUntil = now + 8000;
          caster.stealthUntil = now + 8000;
          caster.speedUntil = now + 8000;
          s.shakeScreenUntil = now + 350;
          spawnShockwave(caster.x, caster.y, '#e11d48', 85);
          spawnParticles(caster.x, caster.y, '#e11d48', 30, 8);
        }

        else if (spell.id === 'SUPP_GRAVITY_FIELD') {
          soundEffects.playFreezeCast();
          const targetX = Math.max(70, Math.min(s.arenaW - 70, caster.x + dir * 220));
          const targetY = caster.y + caster.paddleHeight / 2;
          s.gravityFields.push({
            id: `grav-${now}-${Math.random()}`,
            x: targetX,
            y: targetY,
            radius: 130,
            team: caster.team,
            createdAt: now,
            expiresAt: now + 6000
          });
          spawnShockwave(targetX, targetY, '#6366f1', 90);
          spawnParticles(targetX, targetY, '#6366f1', 25, 6);
          s.damageTexts.push({ x: targetX, y: targetY - 15, text: '🌌 CHAMP GRAVITATIONNEL (6s)!', color: '#6366f1', life: 1.4 });
        } else if (spell.id === 'SUPP_DISPERSION') {
          soundEffects.playLaser();
          const repulseRadius = 180;
          const pCenterX = caster.x + caster.paddleWidth / 2;
          const pCenterY = caster.y + caster.paddleHeight / 2;

          spawnShockwave(pCenterX, pCenterY, '#a855f7', repulseRadius);
          spawnParticles(pCenterX, pCenterY, '#a855f7', 35, 9);
          s.shakeScreenUntil = now + 180;

          s.players.filter(p => p.team !== caster.team && !p.isGhost).forEach(enemy => {
            const enemyCenterX = enemy.x + enemy.paddleWidth / 2;
            const enemyCenterY = enemy.y + enemy.paddleHeight / 2;
            const dist = Math.hypot(enemyCenterX - pCenterX, enemyCenterY - pCenterY);
            if (dist <= repulseRadius) {
              const pushAngle = Math.atan2(enemyCenterY - pCenterY, enemyCenterX - pCenterX);
              const pushDist = 130;
              if (!enemy.isDummy) {
                enemy.x = Math.max(20, Math.min(s.arenaW - 40, enemy.x + Math.cos(pushAngle) * pushDist));
                enemy.y = Math.max(15, Math.min(s.arenaH - 70, enemy.y + Math.sin(pushAngle) * pushDist));
              }
              const dmg = 25;
              caster.damageDealt = (caster.damageDealt || 0) + dmg;
              enemy.damageTanked = (enemy.damageTanked || 0) + dmg;
              enemy.hp = Math.max(0, enemy.hp - dmg);
              if (enemy.hp <= 0 && !enemy.isGhost && !enemy.isDummy) {
                caster.kills = (caster.kills || 0) + 1;
              }
              s.totalDamageDealt += dmg;
              setTotalDamageDealt(s.totalDamageDealt);
              spawnShockwave(enemy.x, enemy.y, '#a855f7', 45);
              s.damageTexts.push({ x: enemy.x, y: enemy.y - 12, text: `💫 DISPERSION -${dmg} PV!`, color: '#a855f7', life: 1.3 });
            }
          });

          if (s.matchSize !== 'TOUCHDOWN') {
            const distBall = Math.hypot(s.ball.x - pCenterX, s.ball.y - pCenterY);
            if (distBall <= repulseRadius + s.ball.radius) {
              const pushAngle = Math.atan2(s.ball.y - pCenterY, s.ball.x - pCenterX);
              s.ball.isSmash = true;
              s.ball.vx = Math.cos(pushAngle) * 22.0;
              s.ball.vy = Math.sin(pushAngle) * 22.0;
              spawnShockwave(s.ball.x, s.ball.y, '#a855f7', 70);
              s.damageTexts.push({ x: s.ball.x, y: s.ball.y - 15, text: '💫 EXPULSION DISPERSION 360°!', color: '#a855f7', life: 1.4 });
            }
          }

          for (let pIdx = s.projectiles.length - 1; pIdx >= 0; pIdx--) {
            const proj = s.projectiles[pIdx];
            if (proj.team !== caster.team) {
              const dProj = Math.hypot(proj.x - pCenterX, proj.y - pCenterY);
              if (dProj <= repulseRadius) {
                s.projectiles.splice(pIdx, 1);
                spawnParticles(proj.x, proj.y, '#a855f7', 6, 3);
              }
            }
          }
        } else if (spell.id === 'SUPP_HEALING_ZONE') {
          soundEffects.playPowerUp();
          const targetX = Math.max(80, Math.min(s.arenaW - 80, caster.x + dir * 200));
          const targetY = caster.y + caster.paddleHeight / 2;
          s.healingZones.push({
            id: `heal-zone-${now}-${Math.random()}`,
            x: targetX,
            y: targetY,
            radius: 145,
            team: caster.team,
            createdAt: now,
            activeAt: now + 1000,
            expiresAt: now + 7000
          });
          spawnShockwave(targetX, targetY, '#10b981', 60);
          spawnParticles(targetX, targetY, '#10b981', 20, 5);
          s.damageTexts.push({ x: targetX, y: targetY - 15, text: '💖 SANCTUAIRE DE SOIN EN CHARGE (1.0s)...', color: '#10b981', life: 1.4 });
        } else if (spell.id === 'SUPP_BLACK_HOLE') {
          soundEffects.playUltiCast();
          const targetX = Math.max(120, Math.min(s.arenaW - 120, caster.x + dir * 350));
          const targetY = caster.y + caster.paddleHeight / 2;
          s.blackHoles.push({
            id: `bh-${now}-${Math.random()}`,
            x: targetX,
            y: targetY,
            radius: 260,
            team: caster.team,
            pullStrength: 8.5,
            casterId: caster.id,
            createdAt: now,
            expiresAt: now + 7000
          });
          s.shakeScreenUntil = now + 400;
          spawnShockwave(targetX, targetY, '#9333ea', 120);
          spawnParticles(targetX, targetY, '#9333ea', 40, 9);
          s.damageTexts.push({ x: targetX, y: targetY - 20, text: '🕳️ TROU NOIR SINGULARITÉ (ATTRACTION TOTALE) !', color: '#9333ea', life: 1.8 });
        }

        else if (spell.id === 'TANK_TAUNT') {
          soundEffects.playStunCast();
          const isTitan = now < caster.titanUltUntil;
          const tauntDuration = isTitan ? 4500 : 3000;
          const tauntRange = isTitan ? 700 : 450;
          caster.tauntUntil = now + tauntDuration;

          spawnShockwave(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#ef4444', tauntRange);
          spawnParticles(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#ef4444', 35, 8);
          s.damageTexts.push({ x: caster.x, y: caster.y - 15, text: '💢 PROVOCATION ACTIVE !', color: '#ef4444', life: 1.4 });
        } else if (spell.id === 'TANK_WARCRY') {
          soundEffects.playPowerUp();
          const isTitan = now < caster.titanUltUntil;
          const shieldGain = isTitan ? 180 : 100;
          s.shakeScreenUntil = now + 150;

          s.players.filter(p => p.team === caster.team && !p.isGhost).forEach(ally => {
            ally.shield += shieldGain;
            ally.decayShieldAmount = (ally.decayShieldAmount || 0) + shieldGain;
            ally.decayShieldUntil = now + 3000;
            caster.healingProvided = (caster.healingProvided || 0) + shieldGain;
            spawnShockwave(ally.x + ally.paddleWidth / 2, ally.y + ally.paddleHeight / 2, '#eab308', 55);
            spawnParticles(ally.x + ally.paddleWidth / 2, ally.y + 20, '#eab308', 18, 5);
            s.damageTexts.push({ x: ally.x, y: ally.y - 12, text: `🎺 +${shieldGain} 🛡️ (3s)`, color: '#eab308', life: 1.3 });
          });
        } else if (spell.id === 'TANK_HARDEN') {
          soundEffects.playWallCast();
          const isTitan = now < caster.titanUltUntil;
          const shieldGain = isTitan ? 1800 : 1000;

          caster.hardenedUntil = now + 3000;
          caster.shield += shieldGain;
          caster.decayShieldAmount = (caster.decayShieldAmount || 0) + shieldGain;
          caster.decayShieldUntil = now + 3000;
          caster.healingProvided = (caster.healingProvided || 0) + shieldGain;

          spawnShockwave(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#3b82f6', 65);
          spawnParticles(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#3b82f6', 30, 7);
          s.damageTexts.push({ x: caster.x, y: caster.y - 15, text: `🛡️ DURCISSEMENT (+${shieldGain} 🛡️)!`, color: '#3b82f6', life: 1.5 });
        } else if (spell.id === 'TANK_TITAN') {
          soundEffects.playUltiCast();
          caster.titanUltUntil = now + 8000;
          caster.shield += 150;
          s.shakeScreenUntil = now + 400;

          spawnShockwave(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#8b5cf6', 140);
          spawnParticles(caster.x + caster.paddleWidth / 2, caster.y + caster.paddleHeight / 2, '#8b5cf6', 45, 10);
          s.damageTexts.push({ x: caster.x, y: caster.y - 18, text: '🗿 EXTENSION TITANIQUE (8s)!', color: '#8b5cf6', life: 1.8 });
        }

        s.selectedSpellKey = null;
        setSelectedSpellKey(null);
        return;
      }
    }

    if (caster.role === 'SHOOTER') {
      if (now - caster.lastShootTime < 180) return;
      caster.lastShootTime = now;

      const isPrecision = now < caster.precisionUntil;
      const bulletCount = 1 + (caster.extraProjectiles || 0);
      const volleyId = `vol-${now}-${Math.random()}`;
      s.activeVolleys.set(volleyId, { totalFired: bulletCount, resolvedCount: 0, hitCount: 0, shooterId: caster.id });

      soundEffects.playLaser();
      s.shakeScreenUntil = now + 35;
      spawnParticles(caster.x + Math.cos(targetAngle) * 18, caster.y + caster.paddleHeight / 2, isPrecision ? '#06b6d4' : (isBlue ? '#38bdf8' : '#f43f5e'), 3, 3);

      for (let i = 0; i < bulletCount; i++) {
        const spreadAngle = (i - (bulletCount - 1) / 2) * 0.07;
        const angle = targetAngle + spreadAngle;
        const spd = 16;
        s.projectiles.push({
          x: caster.x + Math.cos(targetAngle) * 20,
          y: caster.y + caster.paddleHeight / 2 + (i - (bulletCount - 1) / 2) * 6,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color: isPrecision ? '#06b6d4' : (isBlue ? '#38bdf8' : '#f43f5e'),
          team: caster.team,
          damage: 16,
          effect: 'NORMAL',
          radius: 5,
          isHoming: isPrecision,
          homingTargetId: s.lockedTargetId,
          shooterId: caster.id,
          volleyId
        });
      }
      return;
    }

    if (caster.role === 'SLAYER') {
      if (now - caster.lastShootTime < 240) return;
      caster.lastShootTime = now;

      soundEffects.playLaser();
      const slashCenterX = caster.x + caster.paddleWidth / 2;
      const slashCenterY = caster.y + caster.paddleHeight / 2;
      const radius = 75;

      s.slashEffects.push({
        x: slashCenterX,
        y: slashCenterY,
        angle: 0,
        radius,
        isCircle: true,
        color: now < caster.spectralUltUntil ? '#e11d48' : '#f43f5e',
        life: 1.0
      });

      const enemies = s.players.filter(p => p.team !== caster.team && !p.isGhost);
      enemies.forEach(target => {
        const targetCenterX = target.x + target.paddleWidth / 2;
        const targetCenterY = target.y + target.paddleHeight / 2;
        const dist = Math.hypot(targetCenterX - slashCenterX, targetCenterY - slashCenterY);

        if (dist <= radius) {
          const dxToTarget = targetCenterX - slashCenterX;
          const dyToTarget = targetCenterY - slashCenterY;
          const dotFacing = (dxToTarget * target.facingDx + dyToTarget * target.facingDy);
          const isBackstab = dotFacing > 0;
          const isUlt = now < caster.spectralUltUntil;

          let dmg = isUlt ? (isBackstab ? 95 : 60) : (isBackstab ? 60 : 35);
          if (now < caster.poisonUntil) dmg += 20;

          caster.damageDealt = (caster.damageDealt || 0) + dmg;
          target.damageTanked = (target.damageTanked || 0) + dmg;
          s.totalDamageDealt += dmg;
          setTotalDamageDealt(s.totalDamageDealt);

          if (target.shield > 0) {
            target.shield = Math.max(0, target.shield - dmg);
            s.damageTexts.push({ x: target.x, y: target.y - 10, text: `🗡️ ENTAILLE -${dmg} 🛡️`, color: '#38bdf8', life: 1 });
          } else {
            target.hp = Math.max(0, target.hp - dmg);
            if (target.hp <= 0 && !target.isGhost && !target.isDummy) {
              caster.kills = (caster.kills || 0) + 1;
            }
            s.damageTexts.push({
              x: target.x,
              y: target.y - 12,
              text: isBackstab ? `💀 BACKSTAB CRITIQUE -${dmg} PV!` : `🗡️ TOURBILLON -${dmg} PV!`,
              color: isBackstab ? '#e11d48' : '#f43f5e',
              life: 1.3
            });
            if (target.hp <= 0) {
              handlePlayerDeath(target, caster);
            }
          }

          if (!target.isDummy) {
            const pushAngle = Math.atan2(targetCenterY - slashCenterY, targetCenterX - slashCenterX);
            target.x = Math.max(20, Math.min(s.arenaW - 40, target.x + Math.cos(pushAngle) * 25));
            target.y = Math.max(15, Math.min(s.arenaH - 70, target.y + Math.sin(pushAngle) * 25));
          }

          s.shakeScreenUntil = now + 90;
          spawnParticles(target.x, target.y, '#e11d48', 18, 6);
        }
      });

      if (s.matchSize !== 'TOUCHDOWN') {
        const distBallToSlash = Math.hypot(s.ball.x - slashCenterY, s.ball.y - slashCenterY);
        if (distBallToSlash <= radius + s.ball.radius + 10) {
          const pushAngle = Math.atan2(s.ball.y - slashCenterY, s.ball.x - slashCenterX);
          s.ball.isSmash = true;
          s.ball.vx = Math.cos(pushAngle) * 22.0;
          s.ball.vy = Math.sin(pushAngle) * 22.0;
          spawnShockwave(s.ball.x, s.ball.y, '#f43f5e', 60);
          spawnParticles(s.ball.x, s.ball.y, '#f43f5e', 20, 8);
          s.damageTexts.push({ x: s.ball.x, y: s.ball.y - 12, text: '🗡️ SMASH TOURBILLON 360°!', color: '#f43f5e', life: 1.3 });
          soundEffects.playLaser();
        }
      }
      return;
    }

    if (caster.role === 'TANK') {
      if (now - caster.lastShootTime < 650) return;
      caster.lastShootTime = now;

      const isTitan = now < caster.titanUltUntil;
      soundEffects.playLaser();
      s.shakeScreenUntil = now + (isTitan ? 220 : 150);

      const hitBoxW = isTitan ? 150 : 90;
      const hitBoxH = caster.paddleHeight + (isTitan ? 50 : 30);
      const hitBoxX = dir > 0 ? caster.x : caster.x - hitBoxW;
      const hitBoxY = caster.y - (isTitan ? 25 : 15);

      s.slashEffects.push({
        x: dir > 0 ? caster.x + caster.paddleWidth : caster.x - hitBoxW,
        y: hitBoxY,
        angle: 0,
        radius: 0,
        isCircle: false,
        width: hitBoxW,
        height: hitBoxH,
        color: isTitan ? '#8b5cf6' : '#3b82f6',
        life: 1.0
      });

      const enemies = s.players.filter(p => p.team !== caster.team && !p.isGhost);
      enemies.forEach(target => {
        if (
          target.x + target.paddleWidth >= hitBoxX && target.x <= hitBoxX + hitBoxW &&
          target.y + target.paddleHeight >= hitBoxY && target.y <= hitBoxY + hitBoxH
        ) {
          const dmg = isTitan ? 105 : 75;
          caster.damageDealt = (caster.damageDealt || 0) + dmg;
          target.damageTanked = (target.damageTanked || 0) + dmg;
          target.hp = Math.max(0, target.hp - dmg);
          if (target.hp <= 0 && !target.isGhost && !target.isDummy) {
            caster.kills = (caster.kills || 0) + 1;
          }
          s.totalDamageDealt += dmg;
          setTotalDamageDealt(s.totalDamageDealt);

          if (!target.isDummy) {
            target.x = Math.max(20, Math.min(s.arenaW - 40, target.x + dir * (isTitan ? 80 : 50)));
          }
          spawnShockwave(target.x, target.y, '#3b82f6', 60);
          spawnParticles(target.x, target.y, '#3b82f6', 20, 6);
          s.damageTexts.push({ x: target.x, y: target.y - 15, text: `🛡️ FRAPPE FRONTALE -${dmg} PV!`, color: '#3b82f6', life: 1.4 });
          if (target.hp <= 0) {
            handlePlayerDeath(target, caster);
          }
        }
      });

      if (s.matchSize !== 'TOUCHDOWN') {
        if (
          s.ball.x + s.ball.radius >= hitBoxX && s.ball.x - s.ball.radius <= hitBoxX + hitBoxW &&
          s.ball.y + s.ball.radius >= hitBoxY && s.ball.y - s.ball.radius <= hitBoxY + hitBoxH
        ) {
          s.ball.isSmash = true;
          s.ball.vx = dir * (isTitan ? 23.0 : 19.5);
          s.ball.vy = (Math.random() - 0.5) * 8;
          spawnShockwave(s.ball.x, s.ball.y, '#3b82f6', 80);
          spawnParticles(s.ball.x, s.ball.y, '#3b82f6', 25, 9);
          s.damageTexts.push({ x: s.ball.x, y: s.ball.y - 15, text: `🛡️ SMASH BOUCLIER (${isTitan ? 23.0 : 19.5})!`, color: '#3b82f6', life: 1.4 });
          soundEffects.playLaser();
        }
      }
      return;
    }

    if (caster.role === 'SUPPORT') {
      if (now - caster.lastShootTime < 280) return;
      caster.lastShootTime = now;

      soundEffects.playPowerUp();
      const waveX = caster.x + dir * 25;
      const waveY = caster.y + caster.paddleHeight / 2;
      const waveRadius = 80;

      spawnShockwave(waveX, waveY, '#10b981', waveRadius);
      spawnParticles(waveX, waveY, '#10b981', 16, 5);

      s.players.filter(p => p.team === caster.team && !p.isGhost).forEach(ally => {
        const ax = ally.x + ally.paddleWidth / 2;
        const ay = ally.y + ally.paddleHeight / 2;
        if (Math.hypot(ax - waveX, ay - waveY) <= waveRadius + 30) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 35);
          ally.shield = Math.min(130, ally.shield + 20);
          caster.healingProvided = (caster.healingProvided || 0) + 55;
          spawnParticles(ally.x + ally.paddleWidth / 2, ally.y + 15, '#10b981', 8, 3);
          s.damageTexts.push({ x: ally.x, y: ally.y - 10, text: '+35 HP & +20 🛡️', color: '#10b981', life: 1.1 });
        }
      });

      s.players.filter(p => p.team !== caster.team && !p.isGhost).forEach(enemy => {
        const ex = enemy.x + enemy.paddleWidth / 2;
        const ey = enemy.y + enemy.paddleHeight / 2;
        if (Math.hypot(ex - waveX, ey - waveY) <= waveRadius + 30) {
          enemy.stunUntil = now + 900;
          const dmg = 15;
          caster.damageDealt = (caster.damageDealt || 0) + dmg;
          enemy.damageTanked = (enemy.damageTanked || 0) + dmg;
          enemy.hp = Math.max(0, enemy.hp - dmg);
          s.totalDamageDealt += dmg;
          setTotalDamageDealt(s.totalDamageDealt);
          s.damageTexts.push({ x: enemy.x, y: enemy.y - 10, text: `🐌 RALENTI -${dmg} PV!`, color: '#8b5cf6', life: 1.1 });
        }
      });

      if (Math.hypot(s.ball.x - waveX, s.ball.y - waveY) <= waveRadius + s.ball.radius) {
        s.ball.vx *= 0.65;
        s.ball.vy *= 0.65;
        spawnShockwave(s.ball.x, s.ball.y, '#10b981', 45);
        s.damageTexts.push({ x: s.ball.x, y: s.ball.y - 10, text: '💖 BALLE RALENTIE & GUIDÉE', color: '#10b981', life: 1.1 });
      }
      return;
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 600 / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    const s = stateRef.current;

    let worldX = canvasX;
    let worldY = canvasY;
    if (s.matchSize === 'TOUCHDOWN') {
      const human = s.players[0];
      const focusCenterX = human ? human.x + human.paddleWidth / 2 : 1200;
      const focusCenterY = human ? human.y + human.paddleHeight / 2 : 700;
      const camX = Math.max(0, Math.min(s.arenaW - 1000, focusCenterX - 500));
      const camY = Math.max(0, Math.min(s.arenaH - 600, focusCenterY - 300));
      worldX += camX;
      worldY += camY;
    }
    s.mousePos = { x: worldX, y: worldY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const human = s.players[0];
    if (!human || human.isGhost) return;

    if (e.button === 0) {

      s.keys.space = true;
      executeShoot(human);
    } else if (e.button === 2) {

      e.preventDefault();
      armSpell('z');
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      stateRef.current.keys.space = false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const k = e.key.toLowerCase();

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
        e.preventDefault();
      }

      if (k === 'arrowup' || k === 'z' || k === 'w') s.keys.up = true;
      if (k === 'arrowdown' || k === 's') s.keys.down = true;
      if (k === 'arrowleft' || k === 'q') s.keys.left = true;
      if (k === 'arrowright' || k === 'd') s.keys.right = true;
      if (e.key === ' ' || k === ' ') {
        s.keys.space = true;
        const human = s.players[0];
        if (human) executeShoot(human);
      }
      if (e.key === 'Shift' || k === 'shift') s.keys.shift = true;

      if (k === 'tab') {
        e.preventDefault();
        const human = s.players[0];
        if (human) {
          const enemies = s.players.filter(pl => pl.team !== human.team && !pl.isGhost);
          if (enemies.length > 0) {
            s.lockedTargetIndex = ((s.lockedTargetIndex || 0) + 1) % enemies.length;
            s.lockedTargetId = enemies[s.lockedTargetIndex].id;
            soundEffects.playClick();
            const target = enemies[s.lockedTargetIndex];
            spawnShockwave(target.x + target.paddleWidth / 2, target.y + target.paddleHeight / 2, '#06b6d4', 45);
            s.damageTexts.push({
              x: target.x,
              y: target.y - 22,
              text: `🎯 CIBLE VERROUILLÉE [TAB] : ${target.name}`,
              color: '#06b6d4',
              life: 1.4
            });
          }
        }
      }

      if (s.controlMode === 'KEYBOARD_MOUSE') {
        if (k === 'a') armSpell('a');
        else if (k === 'e') armSpell('e');
        else if (k === 'r') armSpell('r');
        else if (k === '1') armSpell('a');
        else if (k === '2') armSpell('e');
        else if (k === '3') armSpell('z');
        else if (k === '4') armSpell('r');
      } else {

        if (['a', 'z', 'e', 'r'].includes(k)) {
          armSpell(k);
        } else if (k === '1') armSpell('a');
        else if (k === '2') armSpell('z');
        else if (k === '3') armSpell('e');
        else if (k === '4') armSpell('r');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'z' || k === 'w') s.keys.up = false;
      if (k === 'arrowdown' || k === 's') s.keys.down = false;
      if (k === 'arrowleft' || k === 'q') s.keys.left = false;
      if (k === 'arrowright' || k === 'd') s.keys.right = false;
      if (e.key === ' ' || k === ' ') s.keys.space = false;
      if (e.key === 'Shift' || k === 'shift') s.keys.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [armSpell, executeShoot]);

  useEffect(() => {
    initMatch(matchSize, selectedMap, selectedRole);

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 1000 * dpr;
    canvas.height = 600 * dpr;

    const applyDamageToPlayer = (target: PlayerEntity, amount: number, attacker?: PlayerEntity, textOverride?: string) => {
      const s = stateRef.current;
      const now = Date.now();
      if (target.isGhost || now < target.immuneUntil) return;

      if (attacker) attacker.damageDealt = (attacker.damageDealt || 0) + amount;
      target.damageTanked = (target.damageTanked || 0) + amount;
      s.totalDamageDealt += amount;
      setTotalDamageDealt(s.totalDamageDealt);

      if (target.shield > 0) {
        if (target.shield >= amount) {
          target.shield -= amount;
          s.damageTexts.push({ x: target.x, y: target.y - 10, text: textOverride || `-${amount} 🛡️`, color: '#38bdf8', life: 1 });
          return;
        } else {
          const rem = amount - target.shield;
          target.shield = 0;
          amount = rem;
        }
      }

      target.hp = Math.max(0, target.hp - amount);
      s.damageTexts.push({ x: target.x, y: target.y - 10, text: textOverride || `-${amount} HP`, color: '#f43f5e', life: 1.1 });

      if (target.hp <= 0 && !target.isGhost) {
        target.isGhost = true;
        target.deaths = (target.deaths || 0) + 1;
        if (attacker) attacker.kills = (attacker.kills || 0) + 1;

        const matchElapsedSec = Math.max(0, Math.floor((Date.now() - s.matchStartTime) / 1000));
        const progress = Math.min(1.0, matchElapsedSec / 180);
        const respawnDurationMs = Math.round(6000 + progress * 4000);
        const respawnSec = Math.ceil(respawnDurationMs / 1000);
        target.respawnAt = Date.now() + respawnDurationMs;

        soundEffects.playDefeat();
        spawnShockwave(target.x + target.paddleWidth / 2, target.y + target.paddleHeight / 2, '#ef4444', 90);
        spawnParticles(target.x + target.paddleWidth / 2, target.y + target.paddleHeight / 2, '#ef4444', 25, 6);

        if (target.team === 'BLUE') {
          s.roundDeathsBlue++;
          setRoundDeathsBlue(s.roundDeathsBlue);
          s.damageTexts.push({
            x: target.x,
            y: target.y - 30,
            text: `💀 MORT BLEUE (${s.roundDeathsBlue}) • Respawn ${respawnSec}s !`,
            color: '#ef4444',
            life: 2.0
          });
        } else {
          s.roundDeathsRed++;
          setRoundDeathsRed(s.roundDeathsRed);
          s.damageTexts.push({
            x: target.x,
            y: target.y - 30,
            text: `💀 MORT ROUGE (${s.roundDeathsRed}) • Respawn ${respawnSec}s !`,
            color: '#ef4444',
            life: 2.0
          });
        }
      }
    };

    const triggerGameOver = (winner: 'BLUE' | 'RED') => {
      const s = stateRef.current;
      if (s.isGameOver) return;
      s.isGameOver = true;
      const durationSec = Math.max(1, Math.floor((Date.now() - s.matchStartTime) / 1000));
      const finalData: GameOverData = {
        winner,
        scoreBlue: s.scoreBlue,
        scoreRed: s.scoreRed,
        roundsWonBlue: s.roundsWonBlue,
        roundsWonRed: s.roundsWonRed,
        roundHistory: s.roundHistory.length > 0 ? s.roundHistory : [
          {
            round: 1,
            winner,
            reason: 'SCORE OBJECTIF ATTEINT (5 BUTS)',
            scoreBlue: s.roundScoreBlue || s.scoreBlue,
            scoreRed: s.roundScoreRed || s.scoreRed,
            deathsBlue: s.roundDeathsBlue,
            deathsRed: s.roundDeathsRed
          }
        ],
        durationSeconds: durationSec,
        matchSize: s.matchSize,
        selectedMap: s.selectedMap,
        players: s.players.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          team: p.team,
          isHuman: p.isHuman,
          damageDealt: Math.round(p.damageDealt || 0),
          damageTanked: Math.round(p.damageTanked || 0),
          healingProvided: Math.round(p.healingProvided || 0),
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          color: p.color
        }))
      };
      if (winner === (s.players[0]?.team || 'BLUE')) {
        soundEffects.playVictory();
      } else {
        soundEffects.playDefeat();
      }
      handleGameOverCallback(finalData);
    };

    const finishRound = (winner: 'BLUE' | 'RED', reason: string) => {
      const s = stateRef.current;
      if (s.isGameOver || s.matchSize === 'PRACTICE') return;
      triggerGameOver(winner);
    };

    const render = () => {
      const s = stateRef.current;
      const now = Date.now();
      const mapCfg = MAP_CONFIGS[s.selectedMap];
      const isTouchdown = s.matchSize === 'TOUCHDOWN';

      let camX = 0;
      let camY = 0;
      if (isTouchdown) {
        const human = s.players[0];
        const focusCenterX = human && !human.isGhost ? human.x + human.paddleWidth / 2 : 1200;
        const focusCenterY = human && !human.isGhost ? human.y + human.paddleHeight / 2 : 700;
        camX = Math.max(0, Math.min(s.arenaW - 1000, focusCenterX - 500));
        camY = Math.max(0, Math.min(s.arenaH - 600, focusCenterY - 300));
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      if (now < s.shakeScreenUntil) {
        const mag = 4;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      ctx.save();
      ctx.translate(-camX, -camY);

      ctx.fillStyle = mapCfg.bgGradient;
      ctx.fillRect(0, 0, s.arenaW, s.arenaH);

      ctx.strokeStyle = mapCfg.gridColor;
      ctx.lineWidth = 1;
      const gridStep = isTouchdown ? 100 : 50;
      for (let x = 0; x < s.arenaW; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, s.arenaH);
        ctx.stroke();
      }
      for (let y = 0; y < s.arenaH; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s.arenaW, y);
        ctx.stroke();
      }

      ctx.strokeStyle = mapCfg.ambientColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(s.arenaW / 2, 0);
      ctx.lineTo(s.arenaW / 2, s.arenaH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = mapCfg.ambientColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.arenaW / 2, s.arenaH / 2, isTouchdown ? 160 : 80, 0, Math.PI * 2);
      ctx.stroke();

      if (isTouchdown) {

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        const yardSteps = [200, 400, 600, 800, 1000, 1400, 1600, 1800, 2000, 2200];
        const yardLabels = [10, 20, 30, 40, 50, 50, 40, 30, 20, 10];
        yardSteps.forEach((yardX, idx) => {
          ctx.beginPath();
          ctx.moveTo(yardX, 0);
          ctx.lineTo(yardX, s.arenaH);
          ctx.stroke();
          ctx.font = '900 15px JetBrains Mono';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.textAlign = 'center';
          ctx.fillText(`${yardLabels[idx]} YD`, yardX, 45);
          ctx.fillText(`${yardLabels[idx]} YD`, yardX, s.arenaH - 35);
        });

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(0, 560, 100, 280);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 560, 100, 280);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= 100; gx += 20) {
          ctx.beginPath(); ctx.moveTo(gx, 560); ctx.lineTo(gx, 840); ctx.stroke();
        }
        for (let gy = 560; gy <= 840; gy += 20) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(100, gy); ctx.stroke();
        }

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(100, 560, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(100, 840, 8, 0, Math.PI * 2); ctx.fill();

        ctx.font = '900 14px JetBrains Mono';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('🏈 CAGE BLEUE (EMBUT)', 50, 545);

        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.fillRect(2300, 560, 100, 280);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.strokeRect(2300, 560, 100, 280);

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 1;
        for (let gx = 2300; gx <= 2400; gx += 20) {
          ctx.beginPath(); ctx.moveTo(gx, 560); ctx.lineTo(gx, 840); ctx.stroke();
        }
        for (let gy = 560; gy <= 840; gy += 20) {
          ctx.beginPath(); ctx.moveTo(2300, gy); ctx.lineTo(2400, gy); ctx.stroke();
        }

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(2300, 560, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2300, 840, 8, 0, Math.PI * 2); ctx.fill();

        ctx.font = '900 14px JetBrains Mono';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText('🏈 CAGE ROUGE (EMBUT)', 2350, 545);

        for (const w of s.walls) {
          ctx.save();
          ctx.fillStyle = w.color === '#38bdf8' ? 'rgba(56, 189, 248, 0.25)' : w.color === '#06b6d4' ? 'rgba(6, 182, 212, 0.25)' : w.color === '#f43f5e' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(30, 41, 59, 0.9)';
          ctx.fillRect(w.x, w.y, w.width, w.height);
          ctx.strokeStyle = w.color;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(w.x, w.y, w.width, w.height);

          if (w.id.startsWith('mid-')) {
            const pulse = (Math.sin(now / 200) + 1) / 2;
            ctx.fillStyle = '#38bdf8';
            ctx.globalAlpha = 0.2 + pulse * 0.3;
            ctx.fillRect(w.x + 15, w.y + 15, w.width - 30, w.height - 30);
          }
          ctx.restore();
        }
        ctx.textAlign = 'left';
      }

      if (s.matchSize === 'PACMAN_GOAL') {

        s.pellets.forEach((pellet) => {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(pellet.x, pellet.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.fillRect(920, 180, 60, 240);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        ctx.strokeRect(920, 180, 60, 240);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 1;
        for (let gx = 920; gx <= 980; gx += 15) {
          ctx.beginPath(); ctx.moveTo(gx, 180); ctx.lineTo(gx, 420); ctx.stroke();
        }
        for (let gy = 180; gy <= 420; gy += 15) {
          ctx.beginPath(); ctx.moveTo(920, gy); ctx.lineTo(980, gy); ctx.stroke();
        }

        ctx.fillStyle = '#10b981';
        ctx.font = '900 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('⚽ CAGE DE BUT (-150 PV)', 950, 165);
        ctx.textAlign = 'left';
      }

      for (const p of s.players) {
        const pCfg = HERO_CONFIGS[p.role];

        if (p.role === 'TANK' && now < p.tauntUntil) {
          const isTitan = now < p.titanUltUntil;
          const tauntRange = isTitan ? 950 : 650;
          const tauntStrength = isTitan ? 6.5 : 4.5;
          const tankCenterX = p.x + p.paddleWidth / 2;
          const tankCenterY = p.y + p.paddleHeight / 2;

          s.players.filter(other => other.team !== p.team && !other.isGhost && !other.isDummy).forEach(enemy => {
            const enemyCenterX = enemy.x + enemy.paddleWidth / 2;
            const enemyCenterY = enemy.y + enemy.paddleHeight / 2;
            const dist = Math.hypot(tankCenterX - enemyCenterX, tankCenterY - enemyCenterY);
            if (dist < tauntRange && dist > 15) {
              const pullAngle = Math.atan2(tankCenterY - enemyCenterY, tankCenterX - enemyCenterX);
              enemy.x += Math.cos(pullAngle) * tauntStrength;
              enemy.y += Math.sin(pullAngle) * tauntStrength;
            }
          });

          const distBall = Math.hypot(tankCenterX - s.ball.x, tankCenterY - s.ball.y);
          if (distBall < tauntRange && distBall > 20) {
            const pullAngle = Math.atan2(tankCenterY - s.ball.y, tankCenterX - s.ball.x);
            s.ball.vx += Math.cos(pullAngle) * 0.75;
            s.ball.vy += Math.sin(pullAngle) * 0.75;
          }

          s.projectiles.filter(proj => proj.team !== p.team).forEach(proj => {
            const distProj = Math.hypot(tankCenterX - proj.x, tankCenterY - proj.y);
            if (distProj < tauntRange && distProj > 15) {
              const pullAngle = Math.atan2(tankCenterY - proj.y, tankCenterX - proj.x);
              proj.vx += Math.cos(pullAngle) * 1.6;
              proj.vy += Math.sin(pullAngle) * 1.6;
            }
          });

          if (Math.random() < 0.25) {
            spawnParticles(tankCenterX + (Math.random() - 0.5) * 60, tankCenterY + (Math.random() - 0.5) * 60, '#ef4444', 2, 3);
          }
        }

        if (p.role === 'SHOOTER' && now < p.cullingUntil && p.cullingShotsLeft > 0) {
          if (now - p.lastCullingShot >= 45) {
            p.lastCullingShot = now;
            p.cullingShotsLeft--;
            const isPrecision = now < p.precisionUntil;
            const dir = p.team === 'BLUE' ? 1 : -1;
            const bulletCount = 1 + (p.extraProjectiles || 0);

            for (let b = 0; b < bulletCount; b++) {
              const spreadAngle = (b - (bulletCount - 1) / 2) * 0.08 + (Math.random() - 0.5) * 0.06;
              const angle = (dir > 0 ? 0 : Math.PI) + spreadAngle;
              const spd = 23;
              s.projectiles.push({
                x: p.x + dir * 25,
                y: p.y + p.paddleHeight / 2 + (b - (bulletCount - 1) / 2) * 6 + (Math.random() - 0.5) * 12,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: isPrecision ? '#06b6d4' : '#ec4899',
                team: p.team,
                damage: 10,
                effect: 'BURST',
                radius: 4.5,
                isHoming: isPrecision,
                homingTargetId: s.lockedTargetId,
                shooterId: p.id
              });
            }
            soundEffects.playLaser();
          }
        }

        if (p.decayShieldUntil && now > p.decayShieldUntil && p.decayShieldAmount) {
          p.shield = Math.max(0, p.shield - p.decayShieldAmount);
          p.decayShieldAmount = 0;
          p.decayShieldUntil = 0;
        }

        if (p.isGhost) {
          if (now >= p.respawnAt) {
            p.isGhost = false;
            p.hp = p.isPacman ? 300 : p.maxHp;
            if (p.isPacman) {
              p.pacmanRadius = 12;
              p.pacmanTargetRadius = 12;
              p.paddleWidth = 24;
              p.paddleHeight = 24;
              p.x = 750 + (Math.random() - 0.5) * 80;
              p.y = 150 + Math.random() * 300;
            }
            p.shield = p.isPacman ? 0 : pCfg.initialShield;
            p.immuneUntil = now + 2000;
            soundEffects.playPowerUp();
            spawnShockwave(p.x, p.y + p.paddleHeight / 2, p.isPacman ? '#facc15' : '#38bdf8', 65);
            spawnParticles(p.x, p.y + p.paddleHeight / 2, p.isPacman ? '#facc15' : '#38bdf8', 25, 6);
            s.damageTexts.push({ x: p.x, y: p.y - 15, text: p.isPacman ? `🟡 ${p.name} RÉAPPARITION (10s) !` : '✨ RÉAPPARITION !', color: p.isPacman ? '#facc15' : '#38bdf8', life: 1.5 });
          }
        } else if (p.hp <= 0 && !p.isDummy) {
          p.isGhost = true;
          p.deaths++;
          const respawnDurationMs = p.isPacman ? 10000 : Math.round(6000 + Math.min(1.0, Math.max(0, Math.floor((Date.now() - s.matchStartTime) / 1000)) / 180) * 4000);
          const respawnSec = Math.ceil(respawnDurationMs / 1000);
          p.respawnAt = now + respawnDurationMs;
          soundEffects.playDefeat();
          spawnShockwave(p.x, p.y + p.paddleHeight / 2, '#f43f5e', 80);
          spawnParticles(p.x, p.y + p.paddleHeight / 2, '#f43f5e', 35, 7);
          s.damageTexts.push({ x: p.x, y: p.y - 15, text: `💀 ÉLIMINÉ ! (${respawnSec}s)`, color: '#f43f5e', life: 1.8 });
        }

        p.prevX = p.x;
        p.prevY = p.y;

        const isTitan = p.role === 'TANK' && now < p.titanUltUntil;
        p.paddleWidth = isTitan ? Math.round(pCfg.paddleWidth * 1.8) : pCfg.paddleWidth;
        p.paddleHeight = isTitan ? Math.round(pCfg.paddleHeight * 1.8) : pCfg.paddleHeight;

        let currentSpeed = p.speed * (mapCfg.friction || 0.98);
        if (now < p.speedUntil) currentSpeed *= 1.45;
        if (now < p.dashBoostUntil) currentSpeed *= 1.85;
        if (now < p.hardenedUntil) currentSpeed *= 0.45;

        const isCarrier = s.matchSize === 'TOUCHDOWN' && s.ball.carrierId === p.id;
        if (isCarrier) {

          currentSpeed *= 0.5;
        }

        if (p.isHuman) {
          const isShiftPressed = s.keys.shift;
          const hasStamina = s.infiniteStamina || p.stamina > 5;
          p.isSprinting = isShiftPressed && hasStamina;

          if (p.isSprinting) {
            currentSpeed *= 1.6;
            if (!s.infiniteStamina) p.stamina = Math.max(0, p.stamina - 0.7);
          } else if (isCarrier) {

            p.stamina = Math.max(0, p.stamina - 0.35);
          } else {
            p.stamina = Math.min(p.maxStamina, p.stamina + 0.35);
          }
          setPlayerStamina(p.stamina);

          if (now >= p.stunUntil && now >= p.frozenUntil) {
            if (s.keys.up) p.y -= currentSpeed;
            if (s.keys.down) p.y += currentSpeed;
            if (s.keys.left) p.x -= currentSpeed;
            if (s.keys.right) p.x += currentSpeed;

            if (s.keys.space) {
              executeShoot(p);
            }
          }

          p.facingDx = 1;
          p.facingDy = 0;
        } else if (!p.isDummy) {

          p.stamina = 100;
          if (now >= p.stunUntil && now >= p.frozenUntil) {
            if (s.matchSize === 'PACMAN_GOAL' && p.isPacman) {

              p.pacmanRadius = p.pacmanRadius || 12;
              p.pacmanTargetRadius = p.pacmanTargetRadius || 12;
              p.pacmanRadius += (p.pacmanTargetRadius - p.pacmanRadius) * 0.08;
              p.paddleWidth = p.pacmanRadius * 2;
              p.paddleHeight = p.pacmanRadius * 2;

              const isFury = p.pacmanRadius >= 40 && p.hp >= 300;
              p.isFury = isFury;

              let targetX = 750;
              let targetY = 270;
              const human = s.players.find(pl => pl.isHuman && !pl.isGhost);

              if (isFury && human) {
                targetX = human.x;
                targetY = human.y;
              } else if (s.ball.x > s.arenaW * 0.4 && s.ball.vx > 0) {
                targetX = s.ball.x;
                targetY = s.ball.y;
              } else if (s.pellets.length > 0) {
                let closestDist = Infinity;
                let closest = s.pellets[0];
                s.pellets.forEach(pellet => {
                  const d = Math.hypot(pellet.x - (p.x + p.paddleWidth / 2), pellet.y - (p.y + p.paddleHeight / 2));
                  if (d < closestDist) {
                    closestDist = d;
                    closest = pellet;
                  }
                });
                targetX = closest.x;
                targetY = closest.y;
              }

              const pacCenterX = p.x + p.paddleWidth / 2;
              const pacCenterY = p.y + p.paddleHeight / 2;
              const dx = targetX - pacCenterX;
              const dy = targetY - pacCenterY;
              const dist = Math.hypot(dx, dy) || 1;

              p.facingDx = dx >= 0 ? 1 : -1;
              p.x += (dx / dist) * (isFury ? currentSpeed * 1.3 : currentSpeed);
              p.y += (dy / dist) * (isFury ? currentSpeed * 1.3 : currentSpeed);

              const remainingPellets = [];
              for (const pellet of s.pellets) {
                const dPellet = Math.hypot(pellet.x - pacCenterX, pellet.y - pacCenterY);
                if (dPellet < p.pacmanRadius + 8) {
                  p.hp = Math.min(p.maxHp, p.hp + 6);
                  if (p.hp >= 300) {
                    p.pacmanTargetRadius = Math.min(50, p.pacmanTargetRadius + 0.35);
                  } else {
                    const ratio = Math.max(0, p.hp / 300);
                    p.pacmanTargetRadius = Math.max(7, 7 + ratio * 18);
                  }
                  soundEffects.playPacmanChomp();
                  spawnParticles(pellet.x, pellet.y, '#facc15', 5, 2);
                } else {
                  remainingPellets.push(pellet);
                }
              }
              s.pellets = remainingPellets;
              if (s.pellets.length < 5) {
                for (let i = 0; i < 25; i++) {
                  s.pellets.push({
                    id: Math.random(),
                    x: Math.floor(Math.random() * (s.arenaW - 350)) + 120,
                    y: Math.floor(Math.random() * (s.arenaH - 120)) + 60,
                  });
                }
              }

              for (const other of s.players) {
                if (other.id !== p.id && other.isPacman && !other.isGhost && now > other.immuneUntil) {
                  const otherCenterX = other.x + other.paddleWidth / 2;
                  const otherCenterY = other.y + other.paddleHeight / 2;
                  const dPacs = Math.hypot(pacCenterX - otherCenterX, pacCenterY - otherCenterY);
                  const r1 = p.pacmanRadius || 12;
                  const r2 = other.pacmanRadius || 12;

                  if (dPacs < r1 + r2) {
                    if (p.hp > other.hp || (p.hp === other.hp && r1 >= r2)) {
                      other.isGhost = true;
                      other.deaths = (other.deaths || 0) + 1;
                      other.respawnAt = now + 10000;
                      soundEffects.playPacmanEatGhost();

                      spawnShockwave(otherCenterX, otherCenterY, '#ef4444', 90);
                      spawnParticles(otherCenterX, otherCenterY, '#ef4444', 35, 7);

                      p.hp = Math.min(p.maxHp, p.hp + 100);
                      if (p.hp >= 300) {
                        p.pacmanTargetRadius = Math.min(60, (p.pacmanTargetRadius || 12) + 4.0);
                      }
                      p.kills = (p.kills || 0) + 1;

                      s.damageTexts.push({
                        x: p.x,
                        y: p.y - 20,
                        text: `😈 ${p.name} A DÉVORÉ ${other.name} (+100 PV) ! Respawn 10s`,
                        color: '#ef4444',
                        life: 2.2
                      });
                    }
                  }
                }
              }

              if (human && !human.isGhost && now > human.immuneUntil) {
                const dHuman = Math.hypot((human.x + human.paddleWidth / 2) - pacCenterX, (human.y + human.paddleHeight / 2) - pacCenterY);
                if (dHuman < p.pacmanRadius + human.paddleWidth / 2 + 4) {
                  if (human.shield <= 0) {
                    human.hp = 0;
                    soundEffects.playPacmanDeath();
                    finishRoundMatch('RED', 'PACMAN A DÉVORÉ LE JOUEUR !');
                  } else {
                    p.x += 80;
                    soundEffects.playShield();
                    spawnShockwave(human.x, human.y, '#38bdf8', 120);
                  }
                }
              }
            } else if (s.matchSize === 'TOUCHDOWN') {

              if (isCarrier) {

                const targetX = p.team === 'BLUE' ? 2350 : 50;
                const diffX = targetX - p.x;
                p.x += Math.sign(diffX) * Math.min(Math.abs(diffX), currentSpeed);

                const targetY = 700 + Math.sin((now + parseInt(p.id.split('-')[1] || '0') * 1000) / 450) * 120;
                const diffY = targetY - p.y;
                p.y += Math.sign(diffY) * Math.min(Math.abs(diffY), currentSpeed * 0.85);
              } else if (!s.ball.carrierId) {

                const diffX = s.ball.x - (p.x + p.paddleWidth / 2);
                const diffY = (s.ball.y - p.paddleHeight / 2) - p.y;
                p.x += Math.sign(diffX) * Math.min(Math.abs(diffX), currentSpeed * 0.95);
                p.y += Math.sign(diffY) * Math.min(Math.abs(diffY), currentSpeed * 0.95);
              } else {
                const currentCarrier = s.players.find(pl => pl.id === s.ball.carrierId);
                if (currentCarrier && currentCarrier.team !== p.team) {

                  const diffX = currentCarrier.x - p.x;
                  const diffY = currentCarrier.y - p.y;
                  p.x += Math.sign(diffX) * Math.min(Math.abs(diffX), currentSpeed);
                  p.y += Math.sign(diffY) * Math.min(Math.abs(diffY), currentSpeed);
                } else {

                  const escortX = p.team === 'BLUE' ? (currentCarrier ? currentCarrier.x + 120 : 1200) : (currentCarrier ? currentCarrier.x - 120 : 1200);
                  const diffX = escortX - p.x;
                  p.x += Math.sign(diffX) * Math.min(Math.abs(diffX), currentSpeed * 0.7);
                }
              }

              p.facingDx = p.team === 'BLUE' ? 1 : -1;
              p.facingDy = 0;

              if (Math.random() < 0.04 && now - p.lastShootTime > 1200) {
                executeShoot(p);
              }
            } else {

              const targetY = s.ball.y - p.paddleHeight / 2;
              const diffY = targetY - p.y;
              if (Math.abs(diffY) > 8) {
                p.y += Math.sign(diffY) * Math.min(Math.abs(diffY), currentSpeed * 0.9);
              }

              const homeX = p.team === 'BLUE' ? 60 + parseInt(p.id.split('-')[1] || '0') * 100 : 940 - parseInt(p.id.split('-')[1] || '0') * 100;
              const diffX = homeX - p.x;
              if (Math.abs(diffX) > 6) {
                p.x += Math.sign(diffX) * Math.min(Math.abs(diffX), currentSpeed * 0.6);
              }

              p.facingDx = p.team === 'BLUE' ? 1 : -1;
              p.facingDy = 0;

              if (Math.random() < 0.04 && now - p.lastShootTime > 1200) {
                executeShoot(p);
              }
            }
          }
        }

        for (const wall of s.walls) {
          if (
            p.x + p.paddleWidth > wall.x &&
            p.x < wall.x + wall.width &&
            p.y + p.paddleHeight > wall.y &&
            p.y < wall.y + wall.height
          ) {
            p.x = p.prevX;
            p.y = p.prevY;
            break;
          }
        }

        p.y = Math.max(10, Math.min(s.arenaH - p.paddleHeight - 10, p.y));
        if (s.matchSize === 'TOUCHDOWN' || p.isHuman || p.role === 'SLAYER' || p.role === 'SUPPORT') {
          p.x = Math.max(15, Math.min(s.arenaW - p.paddleWidth - 15, p.x));
        } else if (p.team === 'BLUE') {
          p.x = Math.max(15, Math.min(s.arenaW / 2 - p.paddleWidth - 10, p.x));
        } else {
          p.x = Math.max(s.arenaW / 2 + 10, Math.min(s.arenaW - p.paddleWidth - 15, p.x));
        }

        const isStealthed = now < p.stealthUntil;

        if (isStealthed && !p.isHuman) {
          continue;
        }

        if (p.isPacman) {

          ctx.save();
          const rad = p.pacmanRadius || 12;
          ctx.translate(p.x + p.paddleWidth / 2, p.y + p.paddleHeight / 2);

          const barW = Math.max(48, rad * 1.8);
          const barH = 5;
          const barX = -barW / 2;
          const barY = -rad - 18;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(barX, barY, barW, barH);
          const hpRatio = Math.max(0, p.hp / p.maxHp);
          ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
          ctx.fillRect(barX, barY, barW * hpRatio, barH);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(barX, barY, barW, barH);

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(p.hp)} PV (${p.hp < 300 ? 'CRITIQUE' : 'NORMAL'})`, 0, barY - 3);

          if (p.pacmanMouthOpening) {
            p.pacmanMouthAngle = (p.pacmanMouthAngle || 0.25) + 0.035;
            if (p.pacmanMouthAngle >= 0.38) p.pacmanMouthOpening = false;
          } else {
            p.pacmanMouthAngle = (p.pacmanMouthAngle || 0.25) - 0.035;
            if (p.pacmanMouthAngle <= 0.06) p.pacmanMouthOpening = true;
          }

          const pacmanDir = p.facingDx >= 0 ? 0 : Math.PI;
          const mouthAngle = p.pacmanMouthAngle || 0.25;
          const bodyColor = p.isFury ? '#ef4444' : now < p.frozenUntil ? '#38bdf8' : p.hp < 300 ? '#f97316' : '#facc15';
          ctx.shadowColor = p.isFury ? 'rgba(239, 68, 68, 0.9)' : 'rgba(250, 204, 21, 0.7)';
          ctx.shadowBlur = p.isFury ? 25 : 15;
          ctx.fillStyle = bodyColor;

          const startAngle = pacmanDir + mouthAngle * Math.PI;
          const endAngle = pacmanDir + (2 - mouthAngle) * Math.PI;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, rad, startAngle, endAngle, false);
          ctx.closePath();
          ctx.fill();

          const eyeOffsetX = Math.cos(pacmanDir - Math.PI / 3) * (rad * 0.55);
          const eyeOffsetY = Math.sin(pacmanDir - Math.PI / 3) * (rad * 0.55);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eyeOffsetX, eyeOffsetY, Math.max(2, rad * 0.16), 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          continue;
        }

        if (p.isGhost) {
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, p.y, p.paddleWidth, p.paddleHeight);
          ctx.font = 'bold 16px sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('👻', p.x - 2, p.y + p.paddleHeight / 2 + 6);
          ctx.globalAlpha = 1.0;
        } else {

          if (isStealthed && p.isHuman) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = '#9333ea';
            ctx.fillRect(p.x, p.y, p.paddleWidth, p.paddleHeight);

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(p.x - 2, p.y - 2, p.paddleWidth + 4, p.paddleHeight + 4);

            if (Math.random() < 0.3) {
              spawnParticles(p.x + Math.random() * p.paddleWidth, p.y + Math.random() * p.paddleHeight, '#c084fc', 2, 2);
            }

            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillStyle = '#e9d5ff';
            ctx.textAlign = 'center';
            ctx.fillText('🥷 INVISIBLE', p.x + p.paddleWidth / 2, p.y - 14);
            ctx.restore();
          } else {
            const facingDir = p.team === 'BLUE' ? 1 : -1;
            const coreX = p.x + p.paddleWidth / 2;
            const coreY = p.y + p.paddleHeight / 2;

            const trailCol = p.customTrailColor || p.color;
            if (p.isSprinting || Math.abs(p.instantVy) > 1.2 || Math.abs(p.instantVx) > 1.2) {
              spawnParticles(
                p.x + (facingDir === 1 ? -2 : p.paddleWidth + 2),
                p.y + Math.random() * p.paddleHeight,
                trailCol,
                2,
                p.isSprinting ? 3.5 : 2
              );
            }

            let aimAngle = facingDir === 1 ? 0 : Math.PI;
            if (p.role === 'SHOOTER') {
              if (p.isHuman && s.controlMode === 'KEYBOARD_MOUSE' && s.mousePos) {
                aimAngle = Math.atan2(s.mousePos.y - coreY, s.mousePos.x - coreX);
              } else {
                let targetEnemy: PlayerEntity | undefined;
                if (s.lockedTargetId) {
                  targetEnemy = s.players.find(other => other.id === s.lockedTargetId && other.team !== p.team && !other.isGhost && now > other.stealthUntil);
                }
                if (!targetEnemy) {
                  const livingEnemies = s.players.filter(other => other.team !== p.team && !other.isGhost && now > other.stealthUntil);
                  if (livingEnemies.length > 0) {
                    targetEnemy = livingEnemies.reduce((prev, curr) => {
                      const distCurr = Math.hypot((curr.x + curr.paddleWidth / 2) - coreX, (curr.y + curr.paddleHeight / 2) - coreY);
                      const distPrev = Math.hypot((prev.x + prev.paddleWidth / 2) - coreX, (prev.y + prev.paddleHeight / 2) - coreY);
                      return distCurr < distPrev ? curr : prev;
                    });
                  }
                }
                if (targetEnemy) {
                  const rawAngle = Math.atan2((targetEnemy.y + targetEnemy.paddleHeight / 2) - coreY, (targetEnemy.x + targetEnemy.paddleWidth / 2) - coreX);
                  const isAngleFacing = (facingDir === 1 && Math.cos(rawAngle) > 0) || (facingDir === -1 && Math.cos(rawAngle) < 0);
                  if (isAngleFacing) aimAngle = rawAngle;
                }
              }
            }

            const pLoadout: PaddleVisualLoadout = {
              role: p.role,
              skinPrimary: p.customSkinColor || p.color,
              skinSecondary: p.customSecondaryColor || p.customSkinColor || (p.team === 'BLUE' ? '#38bdf8' : '#fb7185'),
              skinRarity: p.customSkinRarity,
              skinStars: p.customSkinStars,
              glowColor: p.customGlowColor || p.color,

              auraColor: p.customAuraColor,
              trailColor: p.customTrailColor || p.color,
              weaponPrimary: p.customWeaponColor || (p.team === 'BLUE' ? '#38bdf8' : '#f43f5e'),
              weaponSecondary: p.customSecondaryColor || p.customWeaponColor || (p.team === 'BLUE' ? '#38bdf8' : '#f43f5e'),
              weaponGlow: p.customGlowColor || p.color,
              glowScale: 1.0,
              auraScale: p.customAuraColor ? 1.0 : 0,
              trailScale: 1.0,
            };

            drawUnifiedPaddle(ctx, {
              x: p.x,
              y: p.y,
              width: p.paddleWidth,
              height: p.paddleHeight,
              loadout: pLoadout,
              facingDir: facingDir as (1 | -1),
              time: now / 250,
              aimAngle,
              showAura: true,
              showWeapon: true,
            });
          }

          const barW = Math.max(30, p.paddleWidth + 10);
          const barX = p.x + p.paddleWidth / 2 - barW / 2;
          const barY = p.y - 12;

          ctx.save();
          if (isStealthed && p.isHuman) {
            ctx.globalAlpha = 0.45;
          }

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(barX, barY, barW, 5);

          const hpPct = Math.max(0, p.hp / p.maxHp);
          ctx.fillStyle = p.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
          ctx.fillRect(barX, barY, barW * hpPct, 5);

          if (p.shield > 0) {
            ctx.fillStyle = '#eab308';
            ctx.fillRect(barX, barY - 3, Math.min(barW, (p.shield / 100) * barW), 2.5);
          }
          ctx.restore();
        }
      }

      for (let i = s.gravityFields.length - 1; i >= 0; i--) {
        const gf = s.gravityFields[i];
        if (now >= gf.expiresAt) {
          s.gravityFields.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(gf.x, gf.y, gf.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#6366f1';
        ctx.globalAlpha = 0.12 + Math.sin(now / 180) * 0.05;
        ctx.fill();

        const innerR = (now / 35) % gf.radius;
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(gf.x, gf.y, innerR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        s.players.filter(p => p.team !== gf.team && !p.isGhost).forEach(enemy => {
          const dist = Math.hypot(enemy.x + enemy.paddleWidth / 2 - gf.x, enemy.y + enemy.paddleHeight / 2 - gf.y);
          if (dist <= gf.radius) {
            enemy.speedUntil = 0;
            enemy.y += (Math.random() - 0.5) * 0.5;
          }
        });

        const distBall = Math.hypot(s.ball.x - gf.x, s.ball.y - gf.y);
        if (distBall <= gf.radius + s.ball.radius) {
          s.ball.vx *= 0.94;
          s.ball.vy *= 0.94;
        }

        s.projectiles.forEach(p => {
          if (p.team !== gf.team) {
            const distP = Math.hypot(p.x - gf.x, p.y - gf.y);
            if (distP <= gf.radius) {
              p.vx *= 0.88;
              p.vy *= 0.88;
            }
          }
        });
      }

      const isBlackHoleActive = s.blackHoles.length > 0;
      for (let i = s.healingZones.length - 1; i >= 0; i--) {
        const hz = s.healingZones[i];
        if (now >= hz.expiresAt) {
          s.healingZones.splice(i, 1);
          continue;
        }

        if (now < hz.activeAt) {

          const progress = 1 - (hz.activeAt - now) / 1000;
          ctx.save();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(hz.x, hz.y, hz.radius * progress, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'center';
          ctx.fillText(`⏳ CHARGE ${(progress * 100).toFixed(0)}%`, hz.x, hz.y);
          ctx.restore();
        } else {

          ctx.save();
          ctx.strokeStyle = isBlackHoleActive ? '#ec4899' : '#10b981';
          ctx.lineWidth = isBlackHoleActive ? 4 : 2.5;
          ctx.beginPath();
          ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = isBlackHoleActive ? '#ec4899' : '#10b981';
          ctx.globalAlpha = isBlackHoleActive ? 0.28 : 0.16;
          ctx.fill();

          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.fillText(isBlackHoleActive ? '⚡ 2X SOINS DOUBLÉS 💖' : '💖 SANCTUAIRE', hz.x, hz.y);
          ctx.restore();

          const healMultiplier = isBlackHoleActive ? 2.0 : 1.0;
          const healPerFrame = 0.38 * healMultiplier;

          s.players.filter(p => p.team === hz.team && !p.isGhost).forEach(ally => {
            const dist = Math.hypot(ally.x + ally.paddleWidth / 2 - hz.x, ally.y + ally.paddleHeight / 2 - hz.y);
            if (dist <= hz.radius) {
              ally.hp = Math.min(ally.maxHp, ally.hp + healPerFrame);
              ally.shield = Math.min(130, ally.shield + healPerFrame * 0.5);
              ally.stunUntil = 0;
              ally.frozenUntil = 0;
              const suppPlayer = s.players.find(pl => pl.role === 'SUPPORT' && pl.team === hz.team);
              if (suppPlayer) {
                suppPlayer.healingProvided = (suppPlayer.healingProvided || 0) + healPerFrame;
              }
            }
          });
        }
      }

      for (let i = s.blackHoles.length - 1; i >= 0; i--) {
        const bh = s.blackHoles[i];
        if (now >= bh.expiresAt) {
          s.blackHoles.splice(i, 1);
          continue;
        }

        ctx.save();
        const rot = now / 150;
        ctx.translate(bh.x, bh.y);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let b = 0; b < 3; b++) {
          ctx.strokeStyle = b === 0 ? '#9333ea' : b === 1 ? '#c084fc' : '#ec4899';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, bh.radius * (0.35 + b * 0.25), rot * (b % 2 === 0 ? 1 : -1), rot * (b % 2 === 0 ? 1 : -1) + Math.PI * 1.5);
          ctx.stroke();
        }

        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();

        ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#ec4899';
        ctx.textAlign = 'center';
        ctx.fillText('🕳️ TROU NOIR (RÉANIMATION)', 0, -bh.radius - 8);
        ctx.restore();

        s.players.forEach(p => {
          const px = p.x + p.paddleWidth / 2;
          const py = p.y + p.paddleHeight / 2;
          const dist = Math.hypot(px - bh.x, py - bh.y);

          if (p.team === bh.team && p.isGhost && dist <= bh.radius + 60) {
            p.isGhost = false;
            p.hp = p.maxHp;
            p.shield = 100;
            p.respawnAt = 0;
            p.immuneUntil = now + 2500;
            p.x = bh.x - p.paddleWidth / 2;
            p.y = bh.y - p.paddleHeight / 2;
            spawnShockwave(bh.x, bh.y, '#10b981', 120);
            spawnParticles(bh.x, bh.y, '#10b981', 30, 8);
            soundEffects.playVictory();
            s.damageTexts.push({
              x: bh.x,
              y: bh.y - 30,
              text: `✨ ${p.name.toUpperCase()} RÉANIMÉ PAR LE TROU NOIR !`,
              color: '#10b981',
              life: 2.2
            });
            const suppCaster = s.players.find(pl => pl.role === 'SUPPORT' && pl.team === bh.team);
            if (suppCaster) {
              suppCaster.healingProvided = (suppCaster.healingProvided || 0) + p.maxHp + 100;
            }
          }

          if (p.id !== bh.casterId && !p.isGhost && dist <= bh.radius && dist > 12) {
            const pullAngle = Math.atan2(bh.y - py, bh.x - px);
            const pullSpd = bh.pullStrength * (p.team === bh.team ? 0.42 : 0.52);
            if (!p.isDummy) {
              p.x += Math.cos(pullAngle) * pullSpd;
              p.y += Math.sin(pullAngle) * pullSpd;
            }
          }
        });

        const distBall = Math.hypot(s.ball.x - bh.x, s.ball.y - bh.y);
        if (distBall <= bh.radius && distBall > 10) {
          const pullAngle = Math.atan2(bh.y - s.ball.y, bh.x - s.ball.x);
          s.ball.vx += Math.cos(pullAngle) * (bh.pullStrength * 0.22);
          s.ball.vy += Math.sin(pullAngle) * (bh.pullStrength * 0.22);
        }

        s.projectiles.forEach(p => {
          const distP = Math.hypot(p.x - bh.x, p.y - bh.y);
          if (distP <= bh.radius && distP > 5) {
            const pullAngle = Math.atan2(bh.y - p.y, bh.x - p.x);
            p.vx += Math.cos(pullAngle) * 1.8;
            p.vy += Math.sin(pullAngle) * 1.8;
          }
        });
      }

      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const p = s.projectiles[i];

        if (p.isHoming) {
          let targetEnemy = s.players.find(pl => pl.id === p.homingTargetId && !pl.isGhost && pl.team !== p.team);
          if (!targetEnemy) {
            const enemies = s.players.filter(pl => pl.team !== p.team && !pl.isGhost && now > pl.stealthUntil);
            if (enemies.length > 0) {
              targetEnemy = enemies.reduce((prev, curr) =>
                Math.hypot(curr.x - p.x, curr.y - p.y) < Math.hypot(prev.x - p.x, prev.y - p.y) ? curr : prev
              );
            }
          }

          if (targetEnemy) {
            const targetAngle = Math.atan2(
              targetEnemy.y + targetEnemy.paddleHeight / 2 - p.y,
              targetEnemy.x + targetEnemy.paddleWidth / 2 - p.x
            );
            const curAngle = Math.atan2(p.vy, p.vx);
            const turnRate = 0.14;
            const newAngle = curAngle + Math.sin(targetAngle - curAngle) * turnRate;
            const spd = Math.hypot(p.vx, p.vy);
            p.vx = Math.cos(newAngle) * spd;
            p.vy = Math.sin(newAngle) * spd;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();

        if (Math.random() < 0.25) {
          spawnParticles(p.x - p.vx * 0.5, p.y - p.vy * 0.5, p.color, 1, 1.2);
        }

        const enemies = s.players.filter(pl => pl.team !== p.team && !pl.isGhost && now > pl.stealthUntil);
        let hit = false;

        for (const enemy of enemies) {
          if (
            p.x >= enemy.x - 8 && p.x <= enemy.x + enemy.paddleWidth + 8 &&
            p.y >= enemy.y && p.y <= enemy.y + enemy.paddleHeight
          ) {
            const shooter = s.players.find(pl => pl.id === p.shooterId);

            if (p.volleyId) {
              const vol = s.activeVolleys.get(p.volleyId);
              if (vol) {
                vol.hitCount++;
                vol.resolvedCount++;
                if (vol.resolvedCount >= vol.totalFired) {
                  s.activeVolleys.delete(p.volleyId);
                }
              }
            }

            applyDamageToPlayer(enemy, p.damage, shooter);
            s.shakeScreenUntil = now + 60;
            s.projectiles.splice(i, 1);
            hit = true;
            break;
          }
        }

        if (!hit) {
          for (const wall of s.walls) {
            if (
              p.x >= wall.x && p.x <= wall.x + wall.width &&
              p.y >= wall.y && p.y <= wall.y + wall.height
            ) {
              spawnParticles(p.x, p.y, '#94a3b8', 6, 3);
              s.projectiles.splice(i, 1);
              hit = true;
              break;
            }
          }
        }

        if (!hit && (p.x < 0 || p.x > s.arenaW || p.y < 0 || p.y > s.arenaH)) {
          if (p.volleyId) {
            const vol = s.activeVolleys.get(p.volleyId);
            if (vol) {
              vol.resolvedCount++;
              if (vol.resolvedCount >= vol.totalFired) {
                if (vol.hitCount === 0) {
                  const shooter = s.players.find(pl => pl.id === vol.shooterId);
                  if (shooter && shooter.role === 'SHOOTER' && (shooter.extraProjectiles || 0) > 0) {
                    shooter.extraProjectiles = 0;
                    s.damageTexts.push({
                      x: shooter.x,
                      y: shooter.y - 18,
                      text: '❌ SALVE ENTIÈRE MANQUÉE : RETOUR À 1 PROJ.',
                      color: '#f43f5e',
                      life: 1.6
                    });
                  }
                }
                s.activeVolleys.delete(p.volleyId);
              }
            }
          }
          s.projectiles.splice(i, 1);
        }
      }

      for (let i = s.slashEffects.length - 1; i >= 0; i--) {
        const sl = s.slashEffects[i];
        sl.life -= 0.08;
        if (sl.life <= 0) {
          s.slashEffects.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = sl.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = sl.life;

        if (sl.isCircle) {
          ctx.beginPath();
          ctx.arc(sl.x, sl.y, sl.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (sl.width && sl.height) {
          ctx.strokeRect(sl.x, sl.y, sl.width, sl.height);
        }
      }
      ctx.globalAlpha = 1.0;

      if (s.matchSize === 'TOUCHDOWN') {
        if (!s.ball.carrierId) {

          s.ball.vx *= 0.985;
          s.ball.vy *= 0.985;
          s.ball.x += s.ball.vx;
          s.ball.y += s.ball.vy;

          if (s.ball.y - s.ball.radius < 0) {
            s.ball.y = s.ball.radius + 1;
            s.ball.vy = Math.abs(s.ball.vy);
            soundEffects.playHit();
          } else if (s.ball.y + s.ball.radius > s.arenaH) {
            s.ball.y = s.arenaH - s.ball.radius - 1;
            s.ball.vy = -Math.abs(s.ball.vy);
            soundEffects.playHit();
          }
          if (s.ball.x < 15) { s.ball.x = 16; s.ball.vx = Math.abs(s.ball.vx); }
          if (s.ball.x > s.arenaW - 15) { s.ball.x = s.arenaW - 16; s.ball.vx = -Math.abs(s.ball.vx); }

          for (const p of s.players) {
            if (p.isGhost) continue;
            const pCenterX = p.x + p.paddleWidth / 2;
            const pCenterY = p.y + p.paddleHeight / 2;
            const dist = Math.hypot(pCenterX - s.ball.x, pCenterY - s.ball.y);
            if (dist <= p.paddleWidth / 2 + s.ball.radius + 14) {
              s.ball.carrierId = p.id;
              soundEffects.playPowerUp();
              spawnParticles(p.x, p.y + 20, p.team === 'BLUE' ? '#38bdf8' : '#f43f5e', 20, 5);
              s.damageTexts.push({
                x: p.x,
                y: p.y - 20,
                text: `🏈 ${p.name.toUpperCase()} S'EMPARE DE LA BALLE !`,
                color: p.team === 'BLUE' ? '#38bdf8' : '#f43f5e',
                life: 1.6
              });
              break;
            }
          }
        } else {

          const carrier = s.players.find(p => p.id === s.ball.carrierId);
          if (!carrier || carrier.isGhost || carrier.hp <= 0 || now < carrier.stunUntil || now < carrier.frozenUntil) {

            s.ball.carrierId = null;
            s.ball.vx = carrier ? carrier.facingDx * 3.5 : (Math.random() - 0.5) * 4;
            s.ball.vy = (Math.random() - 0.5) * 4;
            soundEffects.playWallHit();
            if (carrier) {
              s.damageTexts.push({
                x: carrier.x,
                y: carrier.y - 20,
                text: '🏈 BALLE ÉCHAPPÉE (FUMBLE) !',
                color: '#ef4444',
                life: 1.5
              });
            }
          } else {

            s.ball.x = carrier.x + carrier.facingDx * (carrier.paddleWidth + 14);
            s.ball.y = carrier.y + carrier.paddleHeight / 2;
            s.ball.vx = 0;
            s.ball.vy = 0;

            const carrierCenterY = carrier.y + carrier.paddleHeight / 2;
            const isInGoalY = carrierCenterY >= 560 && carrierCenterY <= 840;

            if (carrier.team === 'BLUE' && carrier.x >= 2300 && isInGoalY) {

              s.scoreBlue++;
              s.roundScoreBlue++;
              setScoreBlue(s.scoreBlue);
              setRoundScoreBlue(s.roundScoreBlue);
              s.ball.carrierId = null;

              spawnShockwave(2350, carrierCenterY, '#38bdf8', 160);
              spawnParticles(2350, carrierCenterY, '#38bdf8', 55, 10);
              soundEffects.playVictory();
              s.activeBanner = { text: '🏈 TOUCHDOWN ÉCLATANT DES BLEUS DANS LA CAGE ROUGE (+1 POINT) !', color: '#38bdf8', life: 2.6 };

              if (s.roundScoreBlue >= 5) {
                finishRoundMatch('BLUE', `5 TOUCHDOWNS (${s.roundScoreBlue} - ${s.roundScoreRed})`);
              } else {
                s.ball.x = 1200;
                s.ball.y = 700;
                s.ball.vx = 0;
                s.ball.vy = 0;
              }
            } else if (carrier.team === 'RED' && carrier.x <= 100 && isInGoalY) {

              s.scoreRed++;
              s.roundScoreRed++;
              setScoreRed(s.scoreRed);
              setRoundScoreRed(s.roundScoreRed);
              s.ball.carrierId = null;

              spawnShockwave(50, carrierCenterY, '#f43f5e', 160);
              spawnParticles(50, carrierCenterY, '#f43f5e', 55, 10);
              soundEffects.playVictory();
              s.activeBanner = { text: '🏈 TOUCHDOWN MEURTRIER DES ROUGES DANS LA CAGE BLEUE (+1 POINT) !', color: '#f43f5e', life: 2.6 };

              if (s.roundScoreRed >= 5) {
                finishRoundMatch('RED', `5 TOUCHDOWNS (${s.roundScoreRed} - ${s.roundScoreBlue})`);
              } else {
                s.ball.x = 1200;
                s.ball.y = 700;
                s.ball.vx = 0;
                s.ball.vy = 0;
              }
            }
          }
        }
      } else {

        if (isNaN(s.ball.x) || isNaN(s.ball.y) || !isFinite(s.ball.x) || !isFinite(s.ball.y)) {
          s.ball.x = 500;
          s.ball.y = 300;
          s.ball.vx = 5.5;
          s.ball.vy = (Math.random() - 0.5) * 4;
          s.ball.isSmash = false;
        }

        if (Math.abs(s.ball.vx) < 2.5) {
          s.ball.vx = s.ball.vx >= 0 ? 3.5 : -3.5;
        }
        s.ball.vx = Math.max(-25, Math.min(25, s.ball.vx));
        s.ball.vy = Math.max(-18, Math.min(18, s.ball.vy));

        s.ball.x += s.ball.vx;
        s.ball.y += s.ball.vy;

        if (s.ball.y - s.ball.radius < 0) {
          s.ball.y = s.ball.radius + 1;
          s.ball.vy = Math.abs(s.ball.vy);
          soundEffects.playHit();
        } else if (s.ball.y + s.ball.radius > s.arenaH) {
          s.ball.y = s.arenaH - s.ball.radius - 1;
          s.ball.vy = -Math.abs(s.ball.vy);
          soundEffects.playHit();
        }

        for (const p of s.players) {
          if (p.isGhost) continue;
          if (
            s.ball.x + s.ball.radius >= p.x &&
            s.ball.x - s.ball.radius <= p.x + p.paddleWidth &&
            s.ball.y + s.ball.radius >= p.y &&
            s.ball.y - s.ball.radius <= p.y + p.paddleHeight
          ) {
            const isBlue = p.team === 'BLUE';
            if (isBlue) {
              s.ball.x = p.x + p.paddleWidth + s.ball.radius + 1;
              s.ball.vx = Math.abs(s.ball.vx) + 0.4;
            } else {
              s.ball.x = p.x - s.ball.radius - 1;
              s.ball.vx = -(Math.abs(s.ball.vx) + 0.4);
            }

            const impact = (s.ball.y - (p.y + p.paddleHeight / 2)) / (p.paddleHeight / 2);
            s.ball.vy = Math.max(-14, Math.min(14, impact * 7.5));
            soundEffects.playHit();
            spawnParticles(s.ball.x, s.ball.y, p.color, 8, 4);
            break;
          }
        }

        if (s.matchSize === 'PACMAN_GOAL') {
          const pacman = s.players.find(p => p.isPacman && !p.isGhost);
          if (pacman) {
            const pacCenterX = pacman.x + pacman.paddleWidth / 2;
            const pacCenterY = pacman.y + pacman.paddleHeight / 2;
            const dBallPac = Math.hypot(s.ball.x - pacCenterX, s.ball.y - pacCenterY);
            if (dBallPac < (pacman.pacmanRadius || 12) + s.ball.radius + 4) {
              soundEffects.playPacmanEatGhost();
              pacman.hp = Math.min(pacman.maxHp, pacman.hp + 50);
              if (pacman.hp >= 300) {
                pacman.pacmanTargetRadius = Math.min(50, (pacman.pacmanTargetRadius || 12) + 3.5);
              } else {
                const ratio = Math.max(0, pacman.hp / 300);
                pacman.pacmanTargetRadius = Math.max(7, 7 + ratio * 18);
              }
              s.shakeScreenUntil = now + 200;
              spawnParticles(s.ball.x, s.ball.y, '#ef4444', 20, 4);
              s.damageTexts.push({ x: pacman.x, y: pacman.y - 20, text: '🍽️ BALLE GOBÉE (+50 PV) !', color: '#ef4444', life: 1.5 });
              s.ball.x = 500; s.ball.y = 300; s.ball.vx = -6.5; s.ball.vy = (Math.random() - 0.5) * 4;
            }

            if (s.ball.x >= 920 && s.ball.y >= 180 && s.ball.y <= 420) {
              s.scoreBlue++;
              setScoreBlue(s.scoreBlue);
              soundEffects.playScore();
              spawnShockwave(950, s.ball.y, '#10b981', 180);
              spawnParticles(950, s.ball.y, '#10b981', 35, 7);

              pacman.hp = Math.max(0, pacman.hp - 150);
              if (pacman.hp < 300) {
                const ratio = Math.max(0, pacman.hp / 300);
                pacman.pacmanTargetRadius = Math.max(7, 7 + ratio * 18);
              }
              s.damageTexts.push({ x: pacman.x, y: pacman.y - 25, text: '⚽ BUT DANS LA CAGE ! -150 PV', color: '#10b981', life: 1.8 });

              if (s.scoreBlue >= 3 || pacman.hp <= 0 || (pacman.pacmanRadius || 12) <= 7) {
                finishRoundMatch('BLUE', 'VICTOIRE PAR BUTS / ANÉANTISSEMENT !');
              }

              s.ball.x = 500; s.ball.y = 300; s.ball.vx = -6.5; s.ball.vy = (Math.random() - 0.5) * 4;
            }
          }
        }
      }

      if (s.matchSize === 'TOUCHDOWN') {
        ctx.save();
        ctx.translate(s.ball.x, s.ball.y);
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, s.ball.radius * 1.15, s.ball.radius * 0.75, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(-5, -4);
        ctx.lineTo(-5, 4);
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.moveTo(5, -4);
        ctx.lineTo(5, 4);
        ctx.stroke();
        ctx.restore();

        if (s.ball.carrierId) {
          const carrier = s.players.find(p => p.id === s.ball.carrierId);
          if (carrier) {
            ctx.strokeStyle = carrier.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
            ctx.lineWidth = 3;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(carrier.x + carrier.paddleWidth / 2, carrier.y + carrier.paddleHeight / 2, 45, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = '900 11px JetBrains Mono';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText('🏈 PORTEUR (RALENTI)', carrier.x + carrier.paddleWidth / 2, carrier.y - 12);
            ctx.textAlign = 'left';
          }
        }
      } else {
        ctx.fillStyle = s.ball.isSmash ? '#f43f5e' : '#fbbf24';
        ctx.shadowColor = s.ball.isSmash ? '#f43f5e' : '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(s.ball.x, s.ball.y, s.ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.radius += 4;
        sw.life -= 0.05;
        if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
          s.shockwaves.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = sw.life;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.035;
        if (pt.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }

      const human = s.players[0];
      if (human && !human.isGhost && s.selectedSpellKey) {
        const spellKey = s.selectedSpellKey.toLowerCase() as 'a' | 'z' | 'e' | 'r';
        const spell = HERO_CONFIGS[human.role]?.spells[spellKey];
        if (spell) {
          const pCenterX = human.x + human.paddleWidth / 2;
          const pCenterY = human.y + human.paddleHeight / 2;
          const isBlue = human.team === 'BLUE';
          const dir = isBlue ? 1 : -1;
          const pulse = (Math.sin(now / 120) + 1) / 2;

          const livingEnemies = s.players.filter(other => other.team !== human.team && !other.isGhost && now > other.stealthUntil);
          let targetAngle = isBlue ? 0 : Math.PI;
          let nearestEnemy: PlayerEntity | null = null;

          if (livingEnemies.length > 0) {
            nearestEnemy = livingEnemies.reduce((prev, curr) => {
              const distCurr = Math.hypot((curr.x + curr.paddleWidth / 2) - pCenterX, (curr.y + curr.paddleHeight / 2) - pCenterY);
              const distPrev = Math.hypot((prev.x + prev.paddleWidth / 2) - pCenterX, (prev.y + prev.paddleHeight / 2) - pCenterY);
              return distCurr < distPrev ? curr : prev;
            });

            const targetCenterX = nearestEnemy.x + nearestEnemy.paddleWidth / 2;
            const targetCenterY = nearestEnemy.y + nearestEnemy.paddleHeight / 2;
            const rawAngle = Math.atan2(targetCenterY - pCenterY, targetCenterX - pCenterX);
            const isAngleFacing = (isBlue && Math.cos(rawAngle) > 0) || (!isBlue && Math.cos(rawAngle) < 0);
            if (isAngleFacing) {
              targetAngle = rawAngle;
            }
          }

          if (spell.id === 'SHOOTER_DOUBLE') {
            const range = 800;
            const endX = pCenterX + Math.cos(targetAngle) * range;
            const endY = pCenterY + Math.sin(targetAngle) * range;

            ctx.save();
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.globalAlpha = 0.6 + pulse * 0.4;
            ctx.beginPath();
            ctx.moveTo(pCenterX, pCenterY - 4);
            ctx.lineTo(endX, endY - 4);
            ctx.moveTo(pCenterX, pCenterY + 4);
            ctx.lineTo(endX, endY + 4);
            ctx.stroke();

            const targetX = nearestEnemy ? nearestEnemy.x + nearestEnemy.paddleWidth / 2 : endX;
            const targetY = nearestEnemy ? nearestEnemy.y + nearestEnemy.paddleHeight / 2 : endY;
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 18 + pulse * 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (spell.id === 'SHOOTER_PRECISION') {
            ctx.save();
            if (nearestEnemy) {
              const enemyX = nearestEnemy.x + nearestEnemy.paddleWidth / 2;
              const enemyY = nearestEnemy.y + nearestEnemy.paddleHeight / 2;
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 3;
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(enemyX, enemyY, 26 + pulse * 6, 0, Math.PI * 2);
              ctx.stroke();

              ctx.setLineDash([6, 6]);
              ctx.beginPath();
              ctx.moveTo(pCenterX, pCenterY);
              ctx.quadraticCurveTo((pCenterX + enemyX) / 2, pCenterY - 80, enemyX, enemyY);
              ctx.stroke();
            }
            ctx.restore();
          } else if (spell.id === 'SHOOTER_STACKS') {
            ctx.save();
            const totalBullets = Math.min(5, (human.extraProjectiles || 0) + 1);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, 35 + pulse * 5, 0, Math.PI * 2);
            ctx.stroke();

            for (let i = 0; i < totalBullets; i++) {
              const orbAngle = (now / 400) + (i * Math.PI * 2) / totalBullets;
              const orbX = pCenterX + Math.cos(orbAngle) * 35;
              const orbY = pCenterY + Math.sin(orbAngle) * 35;
              ctx.fillStyle = '#eab308';
              ctx.beginPath();
              ctx.arc(orbX, orbY, 4.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          } else if (spell.id === 'SHOOTER_CULLING') {
            ctx.save();
            const coneDist = 850;
            const coneWidth = 120;
            ctx.fillStyle = '#ec4899';
            ctx.globalAlpha = 0.12 + pulse * 0.08;
            ctx.beginPath();
            ctx.moveTo(pCenterX, pCenterY);
            ctx.lineTo(pCenterX + dir * coneDist, pCenterY - coneWidth);
            ctx.lineTo(pCenterX + dir * coneDist, pCenterY + coneWidth);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6 + pulse * 0.4;
            ctx.setLineDash([10, 8]);
            ctx.stroke();
            ctx.restore();
          }

          else if (spell.id === 'SLAYER_BACKSTAB') {
            ctx.save();
            const maxRange = 500;
            const inRange = nearestEnemy && Math.hypot((nearestEnemy.x + nearestEnemy.paddleWidth / 2) - pCenterX, (nearestEnemy.y + nearestEnemy.paddleHeight / 2) - pCenterY) <= maxRange;

            ctx.strokeStyle = inRange ? '#f43f5e' : '#64748b';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, maxRange, 0, Math.PI * 2);
            ctx.stroke();

            if (inRange && nearestEnemy) {
              const targetBehindX = nearestEnemy.x + (nearestEnemy.facingDx > 0 ? -35 : 35);
              const targetBehindY = nearestEnemy.y;

              ctx.strokeStyle = '#f43f5e';
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(pCenterX, pCenterY);
              ctx.lineTo(targetBehindX, targetBehindY + nearestEnemy.paddleHeight / 2);
              ctx.stroke();

              ctx.fillStyle = '#f43f5e';
              ctx.globalAlpha = 0.4 + pulse * 0.3;
              ctx.fillRect(targetBehindX, targetBehindY, human.paddleWidth, human.paddleHeight);
              ctx.font = 'bold 12px sans-serif';
              ctx.fillStyle = '#f43f5e';
              ctx.fillText('💀 BACKSTAB (-55 PV)', targetBehindX - 40, targetBehindY - 8);
            } else {
              ctx.font = 'bold 12px sans-serif';
              ctx.fillStyle = '#f43f5e';
              ctx.fillText('⚠️ HORS DE PORTÉE (Max 500u)', pCenterX - 65, pCenterY - human.paddleHeight / 2 - 15);
            }
            ctx.restore();
          } else if (spell.id === 'SLAYER_STEALTH') {
            ctx.save();
            ctx.strokeStyle = '#9333ea';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, 40 + pulse * 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (spell.id === 'SLAYER_DASH') {
            ctx.save();
            let moveX = 0; let moveY = 0;
            if (s.keys.left) moveX -= 1;
            if (s.keys.right) moveX += 1;
            if (s.keys.up) moveY -= 1;
            if (s.keys.down) moveY += 1;
            if (moveX === 0 && moveY === 0) { moveX = dir; moveY = 0; }
            const moveLen = Math.hypot(moveX, moveY) || 1;
            const normX = moveX / moveLen;
            const normY = moveY / moveLen;
            const sweepDist = 180;
            const endX = pCenterX + normX * sweepDist;
            const endY = pCenterY + normY * sweepDist;

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(pCenterX, pCenterY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.globalAlpha = 0.2 + pulse * 0.15;
            ctx.beginPath();
            ctx.arc(endX, endY, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (spell.id === 'SLAYER_ULTI') {
            ctx.save();
            ctx.strokeStyle = '#e11d48';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, 50 + pulse * 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          else if (spell.id === 'SUPP_GRAVITY_FIELD') {
            ctx.save();
            const targetX = Math.max(70, Math.min(s.arenaW - 70, human.x + dir * 220));
            const targetY = pCenterY;

            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 130, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#6366f1';
            ctx.globalAlpha = 0.15 + pulse * 0.1;
            ctx.fill();

            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillStyle = '#818cf8';
            ctx.textAlign = 'center';
            ctx.fillText('🌌 ZONE DE RALENTISSEMENT GÉNÉRAL (130u)', targetX, targetY - 140);
            ctx.restore();
          } else if (spell.id === 'SUPP_DISPERSION') {
            ctx.save();
            const repulseRadius = 180;
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, repulseRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#a855f7';
            ctx.globalAlpha = 0.12 + pulse * 0.1;
            ctx.fill();

            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillStyle = '#c084fc';
            ctx.textAlign = 'center';
            ctx.fillText('💫 ONDE DE DISPERSION 360° (REPOUSSE ENNEMIS & BALLE)', pCenterX, pCenterY - repulseRadius - 10);
            ctx.restore();
          } else if (spell.id === 'SUPP_HEALING_ZONE') {
            ctx.save();
            const targetX = Math.max(80, Math.min(s.arenaW - 80, human.x + dir * 200));
            const targetY = pCenterY;

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 145, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.globalAlpha = 0.18 + pulse * 0.12;
            ctx.fill();

            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillStyle = '#34d399';
            ctx.textAlign = 'center';
            ctx.fillText('💖 SANCTUAIRE DE SOIN (1.0s CAST • 145u RAYON)', targetX, targetY - 155);
            ctx.restore();
          } else if (spell.id === 'SUPP_BLACK_HOLE') {
            ctx.save();
            const targetX = Math.max(120, Math.min(s.arenaW - 120, human.x + dir * 350));
            const targetY = pCenterY;

            ctx.strokeStyle = '#9333ea';
            ctx.lineWidth = 3.5;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 240, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#9333ea';
            ctx.globalAlpha = 0.18 + pulse * 0.12;
            ctx.fill();

            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 32, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillStyle = '#ec4899';
            ctx.textAlign = 'center';
            ctx.fillText('🕳️ TROU NOIR (ASPIRATION + 2X SOINS + RÉANIMATION FANTÔMES)', targetX, targetY - 250);
            ctx.restore();
          }

          else if (spell.id === 'TANK_TAUNT') {
            ctx.save();
            const isTitan = now < human.titanUltUntil;
            const tauntRange = isTitan ? 700 : 450;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, tauntRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.globalAlpha = 0.08 + pulse * 0.06;
            ctx.fill();
            ctx.restore();
          } else if (spell.id === 'TANK_WARCRY') {
            ctx.save();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(pCenterX, pCenterY, 260 + pulse * 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (spell.id === 'TANK_HARDEN') {
            ctx.save();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.strokeRect(human.x - 8, human.y - 8, human.paddleWidth + 16, human.paddleHeight + 16);
            ctx.restore();
          } else if (spell.id === 'TANK_TITAN') {
            ctx.save();
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 6]);
            const titanW = Math.round(human.paddleWidth * 1.8);
            const titanH = Math.round(human.paddleHeight * 1.8);
            ctx.strokeRect(pCenterX - titanW / 2, pCenterY - titanH / 2, titanW, titanH);
            ctx.restore();
          }

          ctx.save();
          ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = spell.color;
          ctx.shadowColor = spell.color;
          ctx.shadowBlur = 8;
          ctx.fillText(`✨ SÉLECTIONNÉ : [${spell.key}] ${spell.name} • Appuyez sur [ESPACE] pour Lancer`, pCenterX - 110, human.y - 25);
          ctx.restore();
        }
      }

      if (human && human.role === 'SHOOTER' && now < human.precisionUntil) {
        let lockedEnemy = s.players.find(pl => pl.id === s.lockedTargetId && !pl.isGhost && pl.team !== human.team);
        if (!lockedEnemy) {
          const enemies = s.players.filter(pl => pl.team !== human.team && !pl.isGhost);
          if (enemies.length > 0) {
            lockedEnemy = enemies[0];
            s.lockedTargetId = lockedEnemy.id;
          }
        }

        if (lockedEnemy) {
          const pulse = (Math.sin(now / 100) + 1) / 2;
          const eCenterX = lockedEnemy.x + lockedEnemy.paddleWidth / 2;
          const eCenterY = lockedEnemy.y + lockedEnemy.paddleHeight / 2;

          ctx.save();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;

          const bracketSize = 22 + pulse * 4;
          ctx.beginPath();
          ctx.moveTo(eCenterX - bracketSize, eCenterY);
          ctx.lineTo(eCenterX, eCenterY - bracketSize);
          ctx.lineTo(eCenterX + bracketSize, eCenterY);
          ctx.lineTo(eCenterX, eCenterY + bracketSize);
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(eCenterX - bracketSize - 6, eCenterY);
          ctx.lineTo(eCenterX - bracketSize + 4, eCenterY);
          ctx.moveTo(eCenterX + bracketSize - 4, eCenterY);
          ctx.lineTo(eCenterX + bracketSize + 6, eCenterY);
          ctx.stroke();

          ctx.setLineDash([6, 6]);
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.4 + pulse * 0.3;
          ctx.beginPath();
          ctx.moveTo(human.x + human.paddleWidth / 2, human.y + human.paddleHeight / 2);
          ctx.lineTo(eCenterX, eCenterY);
          ctx.stroke();

          ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillStyle = '#22d3ee';
          ctx.textAlign = 'center';
          ctx.globalAlpha = 1.0;
          const remainingSec = ((human.precisionUntil - now) / 1000).toFixed(1);
          ctx.fillText(`🎯 CIBLE VERROUILLÉE : ${lockedEnemy.name} [TAB] (${remainingSec}s)`, eCenterX, lockedEnemy.y - 14);
          ctx.restore();
        }
      }

      if (s.controlMode === 'KEYBOARD_MOUSE' && human && !human.isGhost && s.mousePos) {
        const pCenterX = human.x + human.paddleWidth / 2;
        const pCenterY = human.y + human.paddleHeight / 2;

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pCenterX, pCenterY);
        ctx.lineTo(s.mousePos.x, s.mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.mousePos.x, s.mousePos.y, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(s.mousePos.x, s.mousePos.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(s.mousePos.x - 15, s.mousePos.y);
        ctx.lineTo(s.mousePos.x - 5, s.mousePos.y);
        ctx.moveTo(s.mousePos.x + 5, s.mousePos.y);
        ctx.lineTo(s.mousePos.x + 15, s.mousePos.y);
        ctx.moveTo(s.mousePos.x, s.mousePos.y - 15);
        ctx.lineTo(s.mousePos.x, s.mousePos.y - 5);
        ctx.moveTo(s.mousePos.x, s.mousePos.y + 5);
        ctx.lineTo(s.mousePos.x, s.mousePos.y + 15);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = s.damageTexts.length - 1; i >= 0; i--) {
        const dt = s.damageTexts[i];
        dt.y -= 0.8;
        dt.life -= 0.025;
        if (dt.life <= 0) {
          s.damageTexts.splice(i, 1);
          continue;
        }
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.fillStyle = dt.color;
        ctx.globalAlpha = dt.life;
        ctx.fillText(dt.text, dt.x, dt.y);
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();

      if (s.matchSize === 'TOUCHDOWN') {
        const miniW = 185;
        const miniH = 108;
        const miniX = 1000 - miniW - 16;
        const miniY = 16;
        const scaleX = miniW / s.arenaW;
        const scaleY = miniH / s.arenaH;

        ctx.save();

        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.fillRect(miniX, miniY, miniW, miniH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(miniX, miniY, miniW, miniH);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fillRect(miniX, miniY + 560 * scaleY, 100 * scaleX, 280 * scaleY);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.fillRect(miniX + 2300 * scaleX, miniY + 560 * scaleY, 100 * scaleX, 280 * scaleY);

        ctx.fillStyle = '#64748b';
        s.walls.forEach(w => {
          ctx.fillRect(miniX + w.x * scaleX, miniY + w.y * scaleY, Math.max(2, w.width * scaleX), Math.max(2, w.height * scaleY));
        });

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(miniX + camX * scaleX, miniY + camY * scaleY, 1000 * scaleX, 600 * scaleY);

        s.players.forEach(p => {
          if (p.isGhost) return;
          const px = miniX + (p.x + p.paddleWidth / 2) * scaleX;
          const py = miniY + (p.y + p.paddleHeight / 2) * scaleY;
          ctx.fillStyle = p.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
          ctx.beginPath();
          ctx.arc(px, py, p.isHuman ? 4 : 2.8, 0, Math.PI * 2);
          ctx.fill();

          if (p.isHuman) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(miniX + s.ball.x * scaleX, miniY + s.ball.y * scaleY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '900 9px JetBrains Mono';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('📡 RADAR STADE (2400x1400)', miniX + 6, miniY + 12);
        ctx.restore();
      }

      if (s.activeBanner) {
        s.activeBanner.life -= 0.025;
        if (s.activeBanner.life <= 0) {
          s.activeBanner = null;
        } else {
          ctx.font = 'bold 18px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = s.activeBanner.color;
          ctx.globalAlpha = s.activeBanner.life;
          ctx.fillText(s.activeBanner.text, 500, 50);
          ctx.globalAlpha = 1.0;
          ctx.textAlign = 'left';
        }
      }

      const WIN_GOALS = s.matchSize === 'PRACTICE' ? 9999 : 5;

      const triggerGameOver = (winner: 'BLUE' | 'RED') => {
        if (s.isGameOver) return;
        s.isGameOver = true;
        const durationSec = Math.max(1, Math.floor((Date.now() - s.matchStartTime) / 1000));
        const finalData: GameOverData = {
          winner,
          scoreBlue: s.scoreBlue,
          scoreRed: s.scoreRed,
          durationSeconds: durationSec,
          matchSize: s.matchSize,
          selectedMap: s.selectedMap,
          players: s.players.map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            team: p.team,
            isHuman: p.isHuman,
            damageDealt: Math.round(p.damageDealt || 0),
            damageTanked: Math.round(p.damageTanked || 0),
            healingProvided: Math.round(p.healingProvided || 0),
            kills: p.kills || 0,
            deaths: p.deaths || 0,
            color: p.color
          }))
        };
        if (winner === (s.players[0]?.team || 'BLUE')) {
          soundEffects.playVictory();
        } else {
          soundEffects.playDefeat();
        }
        handleGameOverCallback(finalData);
      };

      if (s.matchSize !== 'TOUCHDOWN') {
        if (s.ball.x < -s.ball.radius - 5) {
          s.scoreRed++;
          s.roundScoreRed++;
          setScoreRed(s.scoreRed);
          setRoundScoreRed(s.roundScoreRed);
          s.ball.x = 500; s.ball.y = 300; s.ball.vx = 5.5; s.ball.vy = (Math.random() - 0.5) * 5;
          s.ball.isSmash = false;
          soundEffects.playScore();

          if (s.matchSize !== 'PRACTICE' && s.scoreRed >= 5) {
            triggerGameOver('RED');
          }
        }
        if (s.ball.x > s.arenaW + s.ball.radius + 5) {
          s.scoreBlue++;
          s.roundScoreBlue++;
          setScoreBlue(s.scoreBlue);
          setRoundScoreBlue(s.roundScoreBlue);
          s.ball.x = 500; s.ball.y = 300; s.ball.vx = -5.5; s.ball.vy = (Math.random() - 0.5) * 5;
          s.ball.isSmash = false;
          soundEffects.playScore();

          if (s.matchSize !== 'PRACTICE' && s.scoreBlue >= 5) {
            triggerGameOver('BLUE');
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [initMatch, matchSize, selectedMap, selectedRole, handleGameOverCallback]);

  const now = Date.now();
  const currentHero = HERO_CONFIGS[selectedRole];
  const humanPlayer = stateRef.current.players[0];
  const currentMapCfg = MAP_CONFIGS[selectedMap];
  const isPractice = matchSize === 'PRACTICE';
  const isSpectralActive = humanPlayer && humanPlayer.role === 'SLAYER' && now < humanPlayer.spectralUltUntil;

  return (
    <div className="space-y-5 max-w-6xl mx-auto w-full text-left font-sans animate-fade-in">
      {}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              handleQuitCallback();
              soundEffects.playClick();
            }}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
          >
            <span>⬅️</span>
            <span>Menu</span>
          </button>

          <button
            onClick={handleFinishMatchManually}
            className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-xs font-mono font-bold text-rose-300 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-rose-900/30 hover:scale-105"
            title="Terminer la partie et afficher le tableau des scores & statistiques"
          >
            <span>🏁</span>
            <span>Finir le Match</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono shadow-inner">
            <span className="font-black text-amber-400">
              {matchSize === 'PACMAN_GOAL' ? '🟡 PACMAN GOAL (3 BUTS OU ANÉANTISSEMENT)' : isPractice ? '🎯 ENTRAÎNEMENT (ILLIMITÉ)' : '🏆 PREMIER À 5 BUTS'}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-300 font-bold">{matchSize.toUpperCase()}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span>{currentMapCfg.icon}</span>
              <span>{currentMapCfg.name}</span>
            </span>
          </div>

          <button
            onClick={() => {
              const next = controlMode === 'KEYBOARD_MOUSE' ? 'MOUSELESS' : 'KEYBOARD_MOUSE';
              setControlMode(next);
              stateRef.current.controlMode = next;
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 hover:scale-105 ${
              controlMode === 'KEYBOARD_MOUSE'
                ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Basculer entre Mode Clavier + Souris (ZQSD + Clics) et Mode 100% Clavier (Mouseless)"
          >
            <span>{controlMode === 'KEYBOARD_MOUSE' ? '🖱️ Clavier + Souris' : '⌨️ Mouseless'}</span>
          </button>
        </div>

        {}
        {!isPractice && (
          <div className="flex items-center gap-5 bg-slate-950 px-5 py-2 rounded-2xl border border-slate-800 shadow-inner">
            {}
            <div className="flex items-center gap-3 text-right">
              <div className="flex gap-1.5">
                {[...Array(roundsWonBlue)].map((_, i) => (
                  <span key={i} className="w-3 h-3 rounded-full bg-blue-400 shadow-md shadow-blue-400/50" title="Manche Gagnée" />
                ))}
                {[...Array(Math.max(0, 2 - roundsWonBlue))].map((_, i) => (
                  <span key={i} className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                ))}
              </div>
              <div>
                <span className="text-xs font-mono font-black text-blue-400 block">
                  {matchSize === 'PACMAN_GOAL' ? `BUTS : ${roundScoreBlue}/3` : `BLEUS : ${roundScoreBlue}/5 ${matchSize === 'TOUCHDOWN' ? 'Touchdowns' : 'Buts'}`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  {matchSize === 'PACMAN_GOAL' ? '🎯 Cage de But Néon' : `💀 ${roundDeathsBlue} Morts`}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 shadow-inner">
                ⏱️ {Math.floor(matchElapsedSeconds / 60).toString().padStart(2, '0')}:{(matchElapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase mt-0.5">VS</span>
            </div>

            {}
            <div className="flex items-center gap-3 text-left">
              <div>
                <span className="text-xs font-mono font-black text-rose-400 block">
                  ROUGES : {roundScoreRed}/5 {matchSize === 'TOUCHDOWN' ? 'Touchdowns' : 'Buts'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  💀 {roundDeathsRed} Morts
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(roundsWonRed)].map((_, i) => (
                  <span key={i} className="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" title="Manche Gagnée" />
                ))}
                {[...Array(Math.max(0, 2 - roundsWonRed))].map((_, i) => (
                  <span key={i} className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                ))}
              </div>
            </div>
          </div>
        )}

        {}
        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 min-w-[160px] shadow-inner">
          <span className="text-[10px] font-mono text-cyan-400 font-bold">⚡ ENDURANCE</span>
          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                infiniteStamina ? 'bg-amber-400 w-full' : playerStamina > 25 ? 'bg-cyan-400' : 'bg-rose-500'
              }`}
              style={{ width: `${infiniteStamina ? 100 : playerStamina}%` }}
            />
          </div>
        </div>
      </div>

      {}
      {isPractice && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono font-black text-amber-400 uppercase mr-1">🛠️ BAC À SABLE :</span>

            <button
              onClick={() => { setInfiniteCd(!infiniteCd); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                infiniteCd ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              ⏳ 0s Cooldowns: {infiniteCd ? 'ACTIF' : 'OFF'}
            </button>

            <button
              onClick={() => { setInfiniteStamina(!infiniteStamina); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                infiniteStamina ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              ⚡ Sprint Illimité: {infiniteStamina ? 'ACTIF' : 'OFF'}
            </button>

            <button
              onClick={() => { setGodMode(!godMode); soundEffects.playClick(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                godMode ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              🛡️ Invincible: {godMode ? 'ACTIF' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => { stateRef.current.ball = { x: 500, y: 300, vx: 5.5, vy: 2.5, radius: 27, isSmash: false, carrierId: null }; soundEffects.playClick(); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all cursor-pointer"
            >
              🎾 Centrer Balle
            </button>

            <button
              onClick={() => { stateRef.current.totalDamageDealt = 0; setTotalDamageDealt(0); soundEffects.playClick(); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-all cursor-pointer"
            >
              🔄 Reset Dégâts
            </button>
          </div>
        </div>
      )}

      {}
      <div className="w-full bg-slate-950/90 border-2 border-violet-500/40 rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {humanPlayer?.isGhost && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-slate-950/95 border-2 border-rose-500 text-rose-300 font-mono font-black text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2.5 animate-pulse z-30 pointer-events-none">
            <span className="text-lg">💀</span>
            <span>VOUS ÊTES K.O. • RÉAPPARITION DANS {Math.max(1, Math.ceil(((humanPlayer.respawnAt || 0) - Date.now()) / 1000))}s...</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          className="bg-slate-950 rounded-2xl w-full max-w-[1000px] h-auto aspect-[5/3] border border-slate-800 shadow-2xl cursor-crosshair select-none block"
        />
      </div>

      {}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-5 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 border ${isSpectralActive ? 'border-rose-500 animate-pulse shadow-lg shadow-rose-500/40' : selectedSpellKey ? 'border-amber-400 animate-pulse shadow-lg shadow-amber-500/30' : 'border-violet-500/40'} flex items-center justify-center text-2xl sm:text-3xl shrink-0`}>
            {humanPlayer?.isGhost ? '👻' : isSpectralActive ? '🩸' : selectedSpellKey ? currentHero.spells[selectedSpellKey as 'a' | 'z' | 'e' | 'r'].icon : currentHero.icon}
          </div>
          <div className="text-left min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block font-bold uppercase tracking-wide truncate">
              {humanPlayer?.isGhost
                ? '⚠️ ÉTAT : MODE FANTÔME (INTANGIBLE)'
                : isSpectralActive
                ? '🩸 ULTIME ACTIF : MODE SPECTRAL (8s) - NE TOUCHE PAS LA BALLE'
                : `Classe : ${currentHero.title}`}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-300 block truncate">
              {humanPlayer?.isGhost
                ? 'Vous pouvez vous déplacer librement en explorant l arène (Réapparition automatique)'
                : selectedSpellKey
                ? currentHero.spells[selectedSpellKey as 'a' | 'z' | 'e' | 'r'].name
                : currentHero.attackTypeDesc}
            </span>
            <span className="text-[11px] sm:text-xs font-mono text-violet-400 block mt-1 leading-relaxed">
              {controlMode === 'KEYBOARD_MOUSE'
                ? '[SHIFT] Sprint • [Z][Q][S][D] Déplacement • [A][E][Clic Droit][R] Sorts • [Clic Gauche / ESPACE] Tir'
                : '[SHIFT] Sprint • [Flèches / ZQSD] Déplacement • [A][Z][E][R] Sorts & Ultime • [ESPACE] Tir'}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center shrink-0">
          {(['a', 'z', 'e', 'r'] as const).map(k => {
            const sp = currentHero.spells[k];
            const isArmed = selectedSpellKey === k;
            const cdUntil = stateRef.current.cooldowns[k] || 0;
            const isOnCooldown = !infiniteCd && now < cdUntil;
            const isGhost = humanPlayer?.isGhost;
            const remainingSec = isOnCooldown ? ((cdUntil - now) / 1000).toFixed(1) : null;
            const keyBadge = controlMode === 'KEYBOARD_MOUSE'
              ? (k === 'a' ? 'A' : k === 'e' ? 'E' : k === 'z' ? 'RMB' : 'R')
              : k.toUpperCase();

            return (
              <button
                key={k}
                disabled={isGhost}
                onClick={() => armSpell(k)}
                title={`${sp.name} (${sp.desc}) - CD: ${sp.cooldownMs / 1000}s`}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                  isGhost
                    ? 'bg-slate-950 border-slate-800 opacity-40 cursor-not-allowed'
                    : isOnCooldown
                    ? 'bg-slate-950 border-slate-800 opacity-60'
                    : isArmed
                    ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/40 scale-105 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-violet-500/60 hover:scale-105 shadow-md'
                }`}
              >
                {isOnCooldown && !isGhost && (
                  <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-10 backdrop-blur-xs">
                    <span className="text-xs font-black font-mono text-amber-400">{remainingSec}s</span>
                  </div>
                )}
                <span className="text-xl sm:text-2xl">{isGhost ? '👻' : sp.icon}</span>
                <span className={`text-[10px] font-mono font-black ${isArmed ? 'text-amber-300' : 'text-slate-400'}`}>
                  [{keyBadge}]
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PongArenaView;

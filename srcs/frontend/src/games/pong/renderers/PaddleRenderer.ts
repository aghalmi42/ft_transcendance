import type { HeroRole } from '../types';
import { cosmeticsStore, type StoredInventoryItem } from '../../../services/cosmeticsStore';

export interface PaddleVisualLoadout {
  role: HeroRole;
  skinPrimary: string;
  skinSecondary: string;
  skinRarity?: string;
  skinStars?: number;
  glowColor: string;
  auraColor?: string;
  trailColor?: string;
  weaponPrimary: string;
  weaponSecondary?: string;
  weaponGlow: string;
  weaponRarity?: string;
  weaponStars?: number;
  glowScale: number;
  auraScale: number;
  trailScale: number;
}

export const DEFAULT_ROLE_COLORS: Record<HeroRole, { primary: string; secondary: string; glow: string }> = {
  SHOOTER: { primary: '#06b6d4', secondary: '#38bdf8', glow: '#22d3ee' },
  SLAYER: { primary: '#09090b', secondary: '#18181b', glow: '#6b21a8' },
  SUPPORT: { primary: '#10b981', secondary: '#34d399', glow: '#059669' },
  TANK: { primary: '#f59e0b', secondary: '#fbbf24', glow: '#d97706' },
};

export function getHeroEquippedLoadout(role: HeroRole, customInv?: StoredInventoryItem[]): PaddleVisualLoadout {
  const items = customInv || cosmeticsStore.getInventory();
  const roleItems = items.filter(it => it.characterRole === role);

  const skin = roleItems.find(it => it.kind === 'SKIN' && it.isEquipped);
  const weapon = roleItems.find(it => it.kind === 'WEAPON' && it.isEquipped);
  const glow = roleItems.find(it => it.kind === 'GLOW' && it.isEquipped);
  const aura = roleItems.find(it => it.kind === 'AURA' && it.isEquipped);
  const trail = roleItems.find(it => it.kind === 'TRAIL' && it.isEquipped);

  const def = DEFAULT_ROLE_COLORS[role] || DEFAULT_ROLE_COLORS.SHOOTER;
  const defaultWeaponPrimary = role === 'SLAYER' ? '#dc2626' : role === 'TANK' ? '#f97316' : def.primary;
  const defaultWeaponSecondary = role === 'SLAYER' ? '#991b1b' : role === 'TANK' ? '#ef4444' : def.secondary;

  return {
    role,
    skinPrimary: skin?.primaryColor || def.primary,
    skinSecondary: skin?.secondaryColor || skin?.primaryColor || def.secondary,
    skinRarity: skin?.rarity,
    skinStars: skin?.stars,
    glowColor: glow?.glowColor || def.glow,
    auraColor: aura?.glowColor,
    trailColor: trail?.glowColor || def.glow,
    weaponPrimary: weapon?.primaryColor || defaultWeaponPrimary,
    weaponSecondary: weapon?.secondaryColor || weapon?.primaryColor || defaultWeaponSecondary,
    weaponGlow: weapon?.glowColor || def.glow,
    weaponRarity: weapon?.rarity,
    weaponStars: weapon?.stars,
    glowScale: glow ? (glow.level || 1) * 0.2 : 0.85,
    auraScale: aura ? (aura.level || 1) * 0.2 : 0,
    trailScale: trail ? (trail.level || 1) * 0.2 : 0.8,
  };
}

export function drawUnifiedPaddle(
  ctx: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    loadout: PaddleVisualLoadout;
    facingDir?: 1 | -1;
    time?: number;
    aimAngle?: number;
    showAura?: boolean;
    showWeapon?: boolean;
  }
) {
  const { x, y, width, height, loadout, facingDir = 1, time = 0, aimAngle, showAura = true, showWeapon = true } = options;
  const coreX = x + width / 2;
  const coreY = y + height / 2;
  const pulse = (Math.sin(time * 4) + 1) / 2;

  ctx.save();

  if (showAura && loadout.auraColor && loadout.auraScale > 0) {
    ctx.save();
    ctx.strokeStyle = loadout.auraColor;
    ctx.shadowColor = loadout.auraColor;
    ctx.shadowBlur = (20 + pulse * 8) * loadout.auraScale;
    ctx.lineWidth = 2 * loadout.auraScale;
    const ringRadius = height * 0.54 + Math.sin(time * 3) * 3;
    ctx.beginPath();
    ctx.arc(coreX, coreY, ringRadius, time * 2, time * 2 + Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  }

  ctx.shadowColor = loadout.glowColor;
  ctx.shadowBlur = (16 + pulse * 6) * loadout.glowScale;

  const bodyGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  bodyGrad.addColorStop(0, loadout.skinPrimary);
  bodyGrad.addColorStop(0.5, loadout.skinSecondary);
  bodyGrad.addColorStop(1, loadout.skinPrimary);
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();

  ctx.strokeStyle = loadout.role === 'SLAYER' ? '#4c1d95' : '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  if (showWeapon) {
    const isSlayer = loadout.role === 'SLAYER';
    const wepCol1 = isSlayer ? (loadout.weaponPrimary || '#dc2626') : loadout.weaponPrimary;
    const wepCol2 = isSlayer ? (loadout.weaponSecondary || '#991b1b') : (loadout.weaponSecondary || loadout.weaponPrimary);
    const wepGlow = isSlayer ? (loadout.weaponGlow || '#6b21a8') : loadout.weaponGlow;

    ctx.save();
    ctx.shadowColor = wepGlow;
    ctx.shadowBlur = 16;

    if (loadout.role === 'SHOOTER') {
      const barrelX = facingDir === 1 ? x + width : x - 12;
      const calcAngle = aimAngle !== undefined ? aimAngle : facingDir === 1 ? 0 : Math.PI;
      ctx.fillStyle = wepCol1;
      ctx.fillRect(barrelX, coreY - 14, 12, 5);
      ctx.fillRect(barrelX, coreY + 9, 12, 5);

      ctx.strokeStyle = wepGlow;
      ctx.lineWidth = 2.0;
      const beamLen = 42 + pulse * 14;
      const cosA = Math.cos(calcAngle);
      const sinA = Math.sin(calcAngle);

      ctx.beginPath();
      ctx.moveTo(barrelX + (facingDir === 1 ? 12 : 0), coreY - 11.5);
      ctx.lineTo(barrelX + (facingDir === 1 ? 12 : 0) + cosA * beamLen, coreY - 11.5 + sinA * beamLen);
      ctx.moveTo(barrelX + (facingDir === 1 ? 12 : 0), coreY + 11.5);
      ctx.lineTo(barrelX + (facingDir === 1 ? 12 : 0) + cosA * beamLen, coreY + 11.5 + sinA * beamLen);
      ctx.stroke();
    } else if (loadout.role === 'SLAYER') {
      const daggerEdgeX = facingDir === 1 ? x + width : x;
      ctx.fillStyle = wepCol1;
      ctx.beginPath();
      ctx.moveTo(daggerEdgeX, coreY - height * 0.35);
      ctx.lineTo(daggerEdgeX + facingDir * 22, coreY - height * 0.48);
      ctx.lineTo(daggerEdgeX, coreY - height * 0.12);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(daggerEdgeX, coreY + height * 0.12);
      ctx.lineTo(daggerEdgeX + facingDir * 22, coreY + height * 0.48);
      ctx.lineTo(daggerEdgeX, coreY + height * 0.35);
      ctx.closePath();
      ctx.fill();
    } else if (loadout.role === 'SUPPORT') {
      const staffX = facingDir === 1 ? x + width + 10 : x - 10;
      const orbY = y - 14 + Math.sin(time * 4) * 4;
      ctx.strokeStyle = wepCol1;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(staffX, y + height * 0.85);
      ctx.lineTo(staffX, y - 12);
      ctx.stroke();

      ctx.fillStyle = wepCol2;
      ctx.beginPath();
      ctx.arc(staffX, orbY, 8.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (loadout.role === 'TANK') {
      const swordOriginX = facingDir === 1 ? x + width : x;
      const bladeTipX = swordOriginX + facingDir * 46;
      const bladeBaseX = facingDir === 1 ? swordOriginX + 8 : swordOriginX - 8;
      ctx.fillStyle = wepCol1;
      ctx.beginPath();
      ctx.moveTo(bladeBaseX, coreY - 14);
      ctx.lineTo(bladeTipX, coreY);
      ctx.lineTo(bladeBaseX, coreY + 14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

import type {
  PlayerEntity,
  Projectile,
  GravityFieldZone,
  HealingZone,
  BlackHoleZone,
  WallEntity,
  DamageText,
  Particle,
  Shockwave,
  MapTheme,
} from '../types';
import type { BallPhysicsState } from './PongPhysicsEngine';
import { drawUnifiedPaddle } from '../renderers/PaddleRenderer';
import type { PaddleVisualLoadout } from '../renderers/PaddleRenderer';

export class PongRenderer {
  public static renderArena(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    map: MapTheme,
    players: PlayerEntity[],
    ball: BallPhysicsState,
    projectiles: Projectile[],
    gravityZones: GravityFieldZone[],
    healingZones: HealingZone[],
    blackHoles: BlackHoleZone[],
    walls: WallEntity[],
    particles: Particle[],
    shockwaves: Shockwave[],
    damageTexts: DamageText[],
    activeSpellPreview?: { key: string; color: string; range: number; radius: number },
    humanPlayer?: PlayerEntity,
    mousePos?: { x: number; y: number },
  ) {

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    gravityZones.forEach((g) => {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    healingZones.forEach((h) => {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    blackHoles.forEach((bh) => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.strokeStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    walls.forEach((w) => {
      ctx.fillStyle = w.color;
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h);
      ctx.shadowBlur = 0;
    });

    players.forEach((p) => {
      if (p.isGhost) {

        ctx.save();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.roundRect(p.x - p.paddleWidth / 2, p.y - p.paddleHeight / 2, p.paddleWidth, p.paddleHeight, 6);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        const now = Date.now();
        const timeLeftSec = Math.max(1, Math.ceil(((p.respawnAt || 0) - now) / 1000));
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 8;
        ctx.fillText(`💀 ${timeLeftSec}s`, p.x, p.y - p.paddleHeight / 2 - 8);

        ctx.restore();
        return;
      }

      const pW = p.paddleWidth;
      const pH = p.paddleHeight;
      const facing = p.team === 'BLUE' ? 1 : -1;

      const pLoadout: PaddleVisualLoadout = {
        role: p.role,
        skinPrimary: p.customSkinColor || p.color,
        skinSecondary: p.customSecondaryColor || p.customSkinColor || (p.team === 'BLUE' ? '#38bdf8' : '#fb7185'),
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
        x: p.x - pW / 2,
        y: p.y - pH / 2,
        width: pW,
        height: pH,
        loadout: pLoadout,
        facingDir: facing as (1 | -1),
        time: Date.now() / 250,
        showAura: true,
        showWeapon: true,
      });

      const barW = 40;
      const barH = 5;
      const hpPct = Math.max(0, p.hp / p.maxHp);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(p.x - barW / 2, p.y - p.paddleHeight / 2 - 12, barW, barH);
      ctx.fillStyle = p.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
      ctx.fillRect(p.x - barW / 2, p.y - p.paddleHeight / 2 - 12, barW * hpPct, barH);
    });

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = ball.lastHitterTeam === 'BLUE' ? '#38bdf8' : '#f43f5e';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    projectiles.forEach((proj) => {
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if (activeSpellPreview && humanPlayer && mousePos) {
      ctx.save();
      ctx.strokeStyle = activeSpellPreview.color;
      ctx.fillStyle = `${activeSpellPreview.color}22`;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;

      if (activeSpellPreview.range > 0) {
        ctx.beginPath();
        ctx.arc(humanPlayer.x, humanPlayer.y, activeSpellPreview.range, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (activeSpellPreview.radius > 0) {
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, activeSpellPreview.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    damageTexts.forEach((d) => {
      ctx.fillStyle = d.color;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(d.text, d.x, d.y);
    });
  }
}

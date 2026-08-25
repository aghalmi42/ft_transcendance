import type { EngineState } from './ShooTacToeEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../configs';
import { cosmeticsStore } from '../../../services/cosmeticsStore';
import type { HeroRole } from '../../pong/types';

export class ShooTacToeRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    state: EngineState,
    winningLineState: number[] | null
  ) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    state.gravityWells.forEach((gw) => {
      ctx.save();
      const grad = ctx.createRadialGradient(gw.x, gw.y, 5, gw.x, gw.y, gw.radius);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, gw.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();
    });

    state.healingZones.forEach((hz) => {
      ctx.save();
      const grad = ctx.createRadialGradient(hz.x, hz.y, 5, hz.x, hz.y, hz.radius);
      grad.addColorStop(0, 'rgba(52, 211, 153, 0.35)');
      grad.addColorStop(0.8, 'rgba(52, 211, 153, 0.08)');
      grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    });

    state.grid.forEach((cell) => {
      const isWinCell = winningLineState && winningLineState.includes(cell.index);

      ctx.save();
      if (cell.captureProgress > 0) {
        ctx.fillStyle = `rgba(6, 182, 212, ${cell.captureProgress / 300})`;
      } else if (cell.captureProgress < 0) {
        ctx.fillStyle = `rgba(244, 63, 94, ${Math.abs(cell.captureProgress) / 300})`;
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      }

      if (isWinCell) ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';

      ctx.fillRect(cell.x - cell.width / 2, cell.y - cell.height / 2, cell.width, cell.height);

      ctx.strokeStyle = isWinCell
        ? '#eab308'
        : cell.owner === 'BLUE'
        ? '#06b6d4'
        : cell.owner === 'RED'
        ? '#f43f5e'
        : 'rgba(51, 65, 85, 0.7)';
      ctx.lineWidth = isWinCell ? 3.5 : cell.owner ? 2.5 : 1;
      ctx.strokeRect(cell.x - cell.width / 2, cell.y - cell.height / 2, cell.width, cell.height);

      if (cell.owner) {
        const fontSize = Math.floor(cell.width * 0.48);
        ctx.font = `900 ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = cell.owner === 'BLUE' ? '#38bdf8' : '#fb7185';
        ctx.shadowColor = cell.owner === 'BLUE' ? '#0284c7' : '#e11d48';
        ctx.shadowBlur = 15;
        ctx.fillText(cell.owner === 'BLUE' ? 'X' : 'O', cell.x, cell.y);
        ctx.shadowBlur = 0;
      } else if (cell.captureProgress !== 0) {
        const fontSize = Math.max(10, Math.floor(cell.width * 0.2));
        ctx.font = `700 ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = cell.captureProgress > 0 ? '#38bdf8' : '#fb7185';
        ctx.fillText(`${Math.round(Math.abs(cell.captureProgress))}%`, cell.x, cell.y);
      }

      ctx.restore();
    });

    state.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    state.bullets.forEach((b) => {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const allShips = [...state.blueTeam, ...state.redTeam];

    allShips.forEach((ship) => {
      if (!ship.isAlive) {
        ctx.save();
        ctx.font = '700 12px monospace';
        ctx.fillStyle = ship.color;
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ RESPAWN: ${ship.respawnTimer.toFixed(1)}s`, ship.x, ship.y);
        ctx.restore();
        return;
      }

      const role: HeroRole = ship.role || 'SHOOTER';
      const isPlayer = ship.id === 'blue_0';

      let hullColor = ship.color;
      let glowColor = ship.accentColor;
      let secondaryColor = '#ffffff';
      let hasCustomAura = false;
      let customAuraColor = glowColor;

      if (isPlayer) {
        const inventory = cosmeticsStore.getInventory();
        const equippedSkin = inventory.find(it => it.characterRole === role && it.kind === 'SKIN' && it.isEquipped);
        const equippedAura = inventory.find(it => it.characterRole === role && it.kind === 'AURA' && it.isEquipped);

        if (equippedSkin) {
          if (equippedSkin.primaryColor) hullColor = equippedSkin.primaryColor;
          if (equippedSkin.glowColor) glowColor = equippedSkin.glowColor;
          if (equippedSkin.secondaryColor) secondaryColor = equippedSkin.secondaryColor;
        }

        if (equippedAura) {
          hasCustomAura = true;
          if (equippedAura.glowColor) customAuraColor = equippedAura.glowColor;
        }
      }

      ctx.save();
      ctx.translate(ship.x, ship.y);

      if (hasCustomAura) {
        ctx.save();
        ctx.strokeStyle = customAuraColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = customAuraColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, ship.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.rotate(ship.angle);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14;

      if (role === 'SHOOTER') {

        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-14, -14);
        ctx.lineTo(-6, -4);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-6, 4);
        ctx.lineTo(-14, 14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = secondaryColor;
        ctx.fillRect(-8, -15, 12, 2.5);
        ctx.fillRect(-8, 12.5, 12, 2.5);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(3, 0, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (role === 'SLAYER') {

        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(8, -16);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-16, 0);
        ctx.lineTo(-10, 8);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, -16);
        ctx.lineTo(24, 0);
        ctx.lineTo(8, 16);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (role === 'SUPPORT') {

        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.arc(0, 0, 16, -Math.PI * 0.7, Math.PI * 0.7, false);
        ctx.lineTo(-4, 6);
        ctx.arc(0, 0, 8, Math.PI * 0.5, -Math.PI * 0.5, true);
        ctx.lineTo(-4, -6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-12, -18, 4, 36);
      } else {

        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.moveTo(20, -6);
        ctx.lineTo(20, 6);
        ctx.lineTo(10, 15);
        ctx.lineTo(-14, 15);
        ctx.lineTo(-18, 8);
        ctx.lineTo(-18, -8);
        ctx.lineTo(-14, -15);
        ctx.lineTo(10, -15);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, -10, 16, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, -3, 6, 6);
      }

      if (ship.shield > 0) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, ship.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      ctx.save();
      const barWidth = 36;
      const barHeight = 4;
      const barX = ship.x - barWidth / 2;
      const barY = ship.y - 28;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const hpPercent = Math.max(0, ship.hp / ship.maxHp);
      ctx.fillStyle = ship.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

      if (ship.shield > 0) {
        const shieldPercent = Math.min(1, ship.shield / ship.maxShield);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(barX, barY - 3, barWidth * shieldPercent, 2);
      }

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(ship.roleTitle || ship.name, ship.x, barY - 5);

      ctx.restore();
    });
  }
}

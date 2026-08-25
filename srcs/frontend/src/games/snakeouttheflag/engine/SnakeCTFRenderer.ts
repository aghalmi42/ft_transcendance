import type { EngineStateCTF } from './SnakeCTFEngine';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  BLUE_BASE_POS,
  RED_BASE_POS,
  CASTLE_WALLS,
  SNAKE_RADIUS,
} from '../configs';

export class SnakeCTFRenderer {
  public static render(ctx: CanvasRenderingContext2D, state: EngineStateCTF) {
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < ARENA_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ARENA_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < ARENA_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ARENA_WIDTH, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.beginPath();
    ctx.arc(BLUE_BASE_POS.x, BLUE_BASE_POS.y, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.beginPath();
    ctx.arc(RED_BASE_POS.x, RED_BASE_POS.y, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    CASTLE_WALLS.forEach((w) => {
      ctx.save();
      ctx.fillStyle = w.type === 'TOWER' ? '#1e293b' : '#0f172a';
      ctx.fillRect(w.x, w.y, w.width, w.height);

      ctx.strokeStyle = w.type === 'TOWER' ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, w.width, w.height);
      ctx.restore();
    });

    state.consumables.forEach((c) => {
      ctx.save();
      ctx.fillStyle = c.color;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol = c.type === 'SPEED_BOOST' ? '⚡' : c.type === 'SHIELD' ? '🛡️' : c.type === 'MEGA_APPLE' ? '★' : '+';
      ctx.fillText(symbol, c.x, c.y);

      ctx.restore();
    });

    state.bombs.forEach((bomb) => {
      ctx.save();
      const flashFreq = bomb.fuseTimer < 0.8 ? 15 : 8;
      const isFlashing = Math.sin(Date.now() / (1000 / flashFreq)) > 0;
      const bombColor = isFlashing ? '#ef4444' : '#f59e0b';

      ctx.strokeStyle = bomb.team === 'BLUE' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(bomb.x, bomb.y, bomb.explosionRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isFlashing ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath();
      ctx.arc(bomb.x, bomb.y, bomb.radius + 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bombColor;
      ctx.shadowColor = bombColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(bomb.x, bomb.y, bomb.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`💣 ${bomb.fuseTimer.toFixed(1)}s`, bomb.x, bomb.y - 18);

      ctx.restore();
    });

    state.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const allSnakes = [...state.blueSnakes, ...state.redSnakes];
    allSnakes.forEach((snake) => {
      if (!snake.isAlive) {
        ctx.save();
        const base = snake.team === 'BLUE' ? BLUE_BASE_POS : RED_BASE_POS;
        ctx.font = '700 11px monospace';
        ctx.fillStyle = snake.color;
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ RESPAWN: ${snake.respawnTimer.toFixed(1)}s`, base.x, base.y + 70);
        ctx.restore();
        return;
      }

      for (let i = snake.segments.length - 1; i >= 0; i -= 2) {
        const seg = snake.segments[i];
        const progress = 1 - i / snake.segments.length;
        const segRadius = Math.max(3, SNAKE_RADIUS * (0.6 + progress * 0.4));

        ctx.save();
        ctx.fillStyle = snake.color;
        ctx.globalAlpha = 0.5 + progress * 0.5;
        ctx.shadowColor = snake.accentColor;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.arc(seg.x, seg.y, segRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = snake.accentColor;
      ctx.shadowColor = snake.accentColor;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(snake.x, snake.y, SNAKE_RADIUS + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      let eyeX1 = snake.x, eyeY1 = snake.y, eyeX2 = snake.x, eyeY2 = snake.y;
      if (snake.dir === 'RIGHT') {
        eyeX1 = snake.x + 4; eyeY1 = snake.y - 4;
        eyeX2 = snake.x + 4; eyeY2 = snake.y + 4;
      } else if (snake.dir === 'LEFT') {
        eyeX1 = snake.x - 4; eyeY1 = snake.y - 4;
        eyeX2 = snake.x - 4; eyeY2 = snake.y + 4;
      } else if (snake.dir === 'UP') {
        eyeX1 = snake.x - 4; eyeY1 = snake.y - 4;
        eyeX2 = snake.x + 4; eyeY2 = snake.y - 4;
      } else if (snake.dir === 'DOWN') {
        eyeX1 = snake.x - 4; eyeY1 = snake.y + 4;
        eyeX2 = snake.x + 4; eyeY2 = snake.y + 4;
      }

      ctx.beginPath();
      ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
      ctx.fill();

      if (snake.hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(snake.x, snake.y, SNAKE_RADIUS + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.font = '700 10px monospace';
      ctx.fillStyle = snake.team === 'BLUE' ? '#38bdf8' : '#fb7185';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(`${snake.name} (${Math.floor(snake.length)})`, snake.x, snake.y - 16);

      ctx.restore();
    });

    [state.blueFlag, state.redFlag].forEach((flag) => {
      ctx.save();
      const flagColor = flag.team === 'BLUE' ? '#38bdf8' : '#f43f5e';

      if (flag.isAtHome) {
        ctx.strokeStyle = flagColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(flag.homeX, flag.homeY, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(flag.x - 2, flag.y - 22, 4, 24);

      ctx.fillStyle = flagColor;
      ctx.shadowColor = flagColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(flag.x + 2, flag.y - 22);
      ctx.lineTo(flag.x + 20, flag.y - 14);
      ctx.lineTo(flag.x + 2, flag.y - 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }
}

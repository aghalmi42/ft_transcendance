import type {
  PlayerEntity,
  Projectile,
  GravityFieldZone,
  HealingZone,
  BlackHoleZone,
  WallEntity,
  TrapEntity,
  MapTheme,
} from '../types';

export interface BallPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  color: string;
  spin: number;
  lastHitterTeam: 'BLUE' | 'RED';
}

export class PongPhysicsEngine {
  public static updateBall(
    ball: BallPhysicsState,
    map: MapTheme,
    gravityZones: GravityFieldZone[],
    healingZones: HealingZone[],
    blackHoles: BlackHoleZone[],
    walls: WallEntity[],
    traps: TrapEntity[],
    width = 960,
    height = 540,
    deltaRatio = 1,
  ): { goalScored: boolean; scoringTeam?: 'BLUE' | 'RED'; speedTrail: boolean } {
    let speedFactor = 1.0;

    gravityZones.forEach((g) => {
      const dist = Math.hypot(ball.x - g.x, ball.y - g.y);
      if (dist < g.radius) {
        speedFactor *= 0.35;
      }
    });

    blackHoles.forEach((bh) => {
      const dx = bh.x - ball.x;
      const dy = bh.y - ball.y;
      const dist = Math.hypot(dx, dy);
      if (dist < bh.radius && dist > 10) {
        const pull = (1 - dist / bh.radius) * bh.pullStrength * 0.15;
        ball.vx += (dx / dist) * pull;
        ball.vy += (dy / dist) * pull;
      }
    });

    ball.x += ball.vx * speedFactor * deltaRatio;
    ball.y += ball.vy * speedFactor * deltaRatio;

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y + ball.radius > height) {
      ball.y = height - ball.radius;
      ball.vy = -Math.abs(ball.vy);
    }

    walls.forEach((w) => {
      if (
        ball.x + ball.radius > w.x - w.w / 2 &&
        ball.x - ball.radius < w.x + w.w / 2 &&
        ball.y + ball.radius > w.y - w.h / 2 &&
        ball.y - ball.radius < w.y + w.h / 2
      ) {
        ball.vx = -ball.vx;
        w.life -= 1;
      }
    });

    if (ball.x < 0) {
      return { goalScored: true, scoringTeam: 'RED', speedTrail: ball.speed > 11 };
    } else if (ball.x > width) {
      return { goalScored: true, scoringTeam: 'BLUE', speedTrail: ball.speed > 11 };
    }

    return { goalScored: false, speedTrail: ball.speed > 11 };
  }

  public static handlePaddleBallCollision(
    ball: BallPhysicsState,
    player: PlayerEntity,
  ): boolean {
    if (player.isGhost) return false;

    const halfW = player.paddleWidth / 2;
    const halfH = player.paddleHeight / 2;

    if (
      ball.x + ball.radius >= player.x - halfW &&
      ball.x - ball.radius <= player.x + halfW &&
      ball.y + ball.radius >= player.y - halfH &&
      ball.y - ball.radius <= player.y + halfH
    ) {
      const hitOffset = (ball.y - player.y) / halfH;
      const maxAngle = Math.PI / 3;
      const angle = hitOffset * maxAngle;

      const direction = player.team === 'BLUE' ? 1 : -1;
      ball.speed = Math.min(18, ball.speed * 1.04);
      ball.vx = direction * Math.abs(Math.cos(angle) * ball.speed);
      ball.vy = Math.sin(angle) * ball.speed;
      ball.lastHitterTeam = player.team;

      if (player.team === 'BLUE') {
        ball.x = player.x + halfW + ball.radius + 1;
      } else {
        ball.x = player.x - halfW - ball.radius - 1;
      }

      return true;
    }

    return false;
  }
}

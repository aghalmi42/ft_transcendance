import type { PlayerEntity } from '../types';
import type { BallPhysicsState } from './PongPhysicsEngine';

export class PongAIController {
  public static updateBot(
    bot: PlayerEntity,
    ball: BallPhysicsState,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    deltaSeconds = 1 / 60,
  ) {
    if (bot.isGhost) return;

    let errorMargin = 45;
    let reactionSpeedRatio = 0.65;
    let spellTriggerChance = 0.01;

    if (difficulty === 'MEDIUM') {
      errorMargin = 22;
      reactionSpeedRatio = 0.85;
      spellTriggerChance = 0.025;
    } else if (difficulty === 'HARD') {
      errorMargin = 6;
      reactionSpeedRatio = 1.0;
      spellTriggerChance = 0.045;
    }

    const targetY = ball.y + (Math.sin(Date.now() * 0.003 + parseInt(bot.id, 16) || 0) * errorMargin);
    const diffY = targetY - bot.y;

    if (Math.abs(diffY) > 8) {
      const step = Math.sign(diffY) * bot.speed * reactionSpeedRatio;
      bot.y += step;
    }

    const defaultX = bot.team === 'BLUE' ? 120 : 840;
    const diffX = defaultX - bot.x;
    if (Math.abs(diffX) > 4) {
      bot.x += Math.sign(diffX) * (bot.speed * 0.5);
    }
  }
}

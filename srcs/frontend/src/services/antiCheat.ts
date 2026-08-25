export interface PlayerInputPacket {
  seq: number;
  timestamp: number;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  spellKey?: 'a' | 'z' | 'e' | 'r' | 'space';
  targetX?: number;
  targetY?: number;
}

export interface AuthoritativePlayerState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  shield: number;
  stamina: number;
  speed: number;
  lastSpellTimes: Record<string, number>;
  isGhost: boolean;
  respawnAt: number;
  cheatViolations: number;
}

export interface AuthoritativeBallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  lastHitById?: string;
}

export interface ServerStateSnapshot {
  snapshotId: number;
  serverTimestamp: number;
  lastAckSeq: Record<string, number>;
  players: Record<string, AuthoritativePlayerState>;
  ball: AuthoritativeBallState;
  scores: { blue: number; red: number };
}

export interface AntiCheatConfig {
  maxSpeedToleranceRatio: number;
  maxLatencyCompensationMs: number;
  maxViolationsBeforeKick: number;
  arenaWidth: number;
  arenaHeight: number;
}

export const DEFAULT_ANTI_CHEAT_CONFIG: AntiCheatConfig = {
  maxSpeedToleranceRatio: 1.15,
  maxLatencyCompensationMs: 250,
  maxViolationsBeforeKick: 5,
  arenaWidth: 960,
  arenaHeight: 540,
};

export class ServerValidationEngine {
  private config: AntiCheatConfig;
  private currentSnapshotId: number = 0;
  private serverClock: number = Date.now();

  constructor(config: Partial<AntiCheatConfig> = {}) {
    this.config = { ...DEFAULT_ANTI_CHEAT_CONFIG, ...config };
  }

  public validateAndApplyMovement(
    player: AuthoritativePlayerState,
    input: PlayerInputPacket,
    deltaSeconds: number
  ): { valid: boolean; violationType?: string } {
    if (player.isGhost) {
      return { valid: true };
    }

    const prevX = player.x;
    const prevY = player.y;

    let dx = 0;
    let dy = 0;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const invLen = 1 / Math.SQRT2;
      dx *= invLen;
      dy *= invLen;
    }

    const baseSpeed = player.speed;
    const currentSpeed = input.sprint && player.stamina > 10 ? baseSpeed * 1.45 : baseSpeed;
    const expectedDist = currentSpeed * deltaSeconds;

    const targetX = prevX + dx * expectedDist;
    const targetY = prevY + dy * expectedDist;

    const actualDist = Math.hypot(targetX - prevX, targetY - prevY);
    const maxAllowedDist = expectedDist * this.config.maxSpeedToleranceRatio + 0.5;

    if (actualDist > maxAllowedDist) {
      player.cheatViolations += 1;
      console.warn(`[AntiCheat Alert] Speed violation detected for Player ${player.id}. Attempted: ${actualDist.toFixed(2)}, Max: ${maxAllowedDist.toFixed(2)}`);

      const angle = Math.atan2(targetY - prevY, targetX - prevX);
      player.x = prevX + Math.cos(angle) * maxAllowedDist;
      player.y = prevY + Math.sin(angle) * maxAllowedDist;
      return { valid: false, violationType: 'SPEED_HACK_DETECTED' };
    }

    const clampedX = Math.max(20, Math.min(this.config.arenaWidth - 20, targetX));
    const clampedY = Math.max(20, Math.min(this.config.arenaHeight - 20, targetY));

    player.x = clampedX;
    player.y = clampedY;
    player.vx = (clampedX - prevX) / Math.max(0.001, deltaSeconds);
    player.vy = (clampedY - prevY) / Math.max(0.001, deltaSeconds);

    if (input.sprint && (dx !== 0 || dy !== 0)) {
      player.stamina = Math.max(0, player.stamina - 20 * deltaSeconds);
    } else {
      player.stamina = Math.min(100, player.stamina + 15 * deltaSeconds);
    }

    return { valid: true };
  }

  public validateSpellCast(
    player: AuthoritativePlayerState,
    spellKey: string,
    spellCooldownMs: number,
    serverNow: number = Date.now()
  ): boolean {
    const lastCast = player.lastSpellTimes[spellKey] || 0;
    const timeSinceLast = serverNow - lastCast;

    if (timeSinceLast + 50 < spellCooldownMs) {
      player.cheatViolations += 1;
      console.warn(`[AntiCheat Alert] Cooldown violation for Player ${player.id} on spell [${spellKey.toUpperCase()}]. Elapsed: ${timeSinceLast}ms < Cooldown: ${spellCooldownMs}ms`);
      return false;
    }

    player.lastSpellTimes[spellKey] = serverNow;
    return true;
  }

  public updateBallPhysics(
    ball: AuthoritativeBallState,
    deltaSeconds: number,
    scores: { blue: number; red: number }
  ): { goalScored: boolean; scoringTeam?: 'BLUE' | 'RED' } {
    ball.x += ball.vx * deltaSeconds * 60;
    ball.y += ball.vy * deltaSeconds * 60;

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y + ball.radius > this.config.arenaHeight) {
      ball.y = this.config.arenaHeight - ball.radius;
      ball.vy = -Math.abs(ball.vy);
    }

    if (ball.x < 0) {
      scores.red += 1;
      this.resetBall(ball, 'RED');
      return { goalScored: true, scoringTeam: 'RED' };
    } else if (ball.x > this.config.arenaWidth) {
      scores.blue += 1;
      this.resetBall(ball, 'BLUE');
      return { goalScored: true, scoringTeam: 'BLUE' };
    }

    return { goalScored: false };
  }

  private resetBall(ball: AuthoritativeBallState, serveTowards: 'BLUE' | 'RED') {
    ball.x = this.config.arenaWidth / 2;
    ball.y = this.config.arenaHeight / 2;
    const angle = (Math.random() * 0.6 - 0.3) + (serveTowards === 'BLUE' ? Math.PI : 0);
    const speed = 7;
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.speed = speed;
  }

  public createSnapshot(
    players: Record<string, AuthoritativePlayerState>,
    ball: AuthoritativeBallState,
    scores: { blue: number; red: number },
    lastAckSeq: Record<string, number>
  ): ServerStateSnapshot {
    this.currentSnapshotId += 1;
    return {
      snapshotId: this.currentSnapshotId,
      serverTimestamp: Date.now(),
      lastAckSeq: { ...lastAckSeq },
      players: JSON.parse(JSON.stringify(players)),
      ball: { ...ball },
      scores: { ...scores },
    };
  }
}

export class ClientPredictionEngine {
  private localSeq: number = 0;
  private pendingInputs: PlayerInputPacket[] = [];
  private playerId: string;

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  public recordLocalInput(input: Omit<PlayerInputPacket, 'seq' | 'timestamp'>): PlayerInputPacket {
    this.localSeq += 1;
    const packet: PlayerInputPacket = {
      ...input,
      seq: this.localSeq,
      timestamp: Date.now(),
    };
    this.pendingInputs.push(packet);
    return packet;
  }

  public reconcile(
    snapshot: ServerStateSnapshot,
    localPlayer: { x: number; y: number; speed: number; stamina: number },
    deltaSeconds: number = 1 / 60
  ): { errorDistance: number; corrected: boolean } {
    const authPlayer = snapshot.players[this.playerId];
    if (!authPlayer) return { errorDistance: 0, corrected: false };

    const lastAck = snapshot.lastAckSeq[this.playerId] || 0;

    this.pendingInputs = this.pendingInputs.filter((inp) => inp.seq > lastAck);

    let simX = authPlayer.x;
    let simY = authPlayer.y;

    for (const pending of this.pendingInputs) {
      let dx = 0;
      let dy = 0;
      if (pending.up) dy -= 1;
      if (pending.down) dy += 1;
      if (pending.left) dx -= 1;
      if (pending.right) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
      }

      const spd = pending.sprint ? localPlayer.speed * 1.45 : localPlayer.speed;
      simX += dx * spd * deltaSeconds;
      simY += dy * spd * deltaSeconds;
    }

    const errorDistance = Math.hypot(localPlayer.x - simX, localPlayer.y - simY);

    if (errorDistance > 4.0) {
      localPlayer.x = simX;
      localPlayer.y = simY;
      return { errorDistance, corrected: true };
    }

    return { errorDistance, corrected: false };
  }

  public getPendingInputsCount(): number {
    return this.pendingInputs.length;
  }
}

export const serverValidation = new ServerValidationEngine();
export default serverValidation;

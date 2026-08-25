import { audioClient } from '../../services/audio';

export const PONG_SOUND_ASSETS = {
  paddleHit: '/sounds/paddle_hit.mp3',
  wallHit: '/sounds/wall_hit.mp3',
  score: '/sounds/score.mp3',
  dash: '/sounds/dash.mp3',
  shield: '/sounds/shield.mp3',
  teleport: '/sounds/teleport.mp3',
  heal: '/sounds/heal.mp3',
  laser: '/sounds/laser.mp3',
  powerup: '/sounds/powerup.mp3',
  cooldown: '/sounds/cooldown.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
} as const;

export const SOUND_ASSETS = PONG_SOUND_ASSETS;
export type PongSoundKey = keyof typeof PONG_SOUND_ASSETS;

export function playPongSound(key: PongSoundKey, volume = 0.45): void {
  const src = PONG_SOUND_ASSETS[key];
  if (src) {
    audioClient.playSound(src, volume);
  }
}

// -----------------------------------------------------------------------------
// PURE MP3 ALIAS (ft_transcendence)
// -----------------------------------------------------------------------------
// Points directly to the static MP3 audio service - zero procedural synthesis code
// -----------------------------------------------------------------------------

import { soundEffects } from './audio';

export const strudel = {
  paddleHit: () => soundEffects.playPaddleHit(),
  wallHit: () => soundEffects.playWallHit(),
  score: () => soundEffects.playScore(),
  victory: () => soundEffects.playVictory(),
  defeat: () => soundEffects.playDefeat(),
  click: () => soundEffects.playClick(),
  notification: () => soundEffects.playNotification(),
  laser: () => soundEffects.playLaser(),
  powerUp: () => soundEffects.playPowerUp(),
  cooldownWarning: () => soundEffects.playCooldownWarning(),
  startGenerativeBgm: () => soundEffects.toggleMusic(),
  stopBgm: () => soundEffects.toggleMusic(),
  setMuted: (muted: boolean) => soundEffects.setSoundEnabled(!muted),
  isSoundMuted: () => !soundEffects.isSoundEnabled(),
};

export default strudel;

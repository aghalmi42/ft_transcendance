import { soundEffects } from '../../services/audio';

export const shootactoeSounds = {
  shoot: () => soundEffects.playLaser(),
  hit: () => soundEffects.playHit(),
  cellCaptured: () => soundEffects.playPowerUp(),
  cellLost: () => soundEffects.playHit(),
  shipDestroyed: () => soundEffects.playDefeat(),
  victory: () => soundEffects.playVictory(),
  defeat: () => soundEffects.playDefeat(),
  click: () => soundEffects.playClick(),
};

export default shootactoeSounds;

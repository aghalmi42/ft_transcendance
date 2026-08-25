export interface TrackInfo {
  id: number;
  title: string;
  src: string;
  bpm: number;
}

export const TRACKS: TrackInfo[] = [
  { id: 1, title: 'Cyber Arcade 8-Bit', src: '/sounds/music_track1.mp3', bpm: 135 },
  { id: 2, title: 'Midnight Pong Chill', src: '/sounds/music_track2.mp3', bpm: 110 },
  { id: 3, title: 'Neon Tournament Arena', src: '/sounds/music_track3.mp3', bpm: 145 },
  { id: 4, title: 'Retro Synthwave Voyage', src: '/sounds/music_track4.mp3', bpm: 120 },
  { id: 5, title: '8-Bit Battle Boss', src: '/sounds/music_track5.mp3', bpm: 150 },
];

export const SOUND_ASSETS = {

  paddleHit: '/sounds/paddle_hit.mp3',
  wallHit: '/sounds/wall_hit.mp3',
  score: '/sounds/score.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  click: '/sounds/click.mp3',
  notification: '/sounds/notification.mp3',
  laser: '/sounds/laser.mp3',
  powerup: '/sounds/powerup.mp3',
  cooldown: '/sounds/cooldown.mp3',
  stun: '/sounds/laser.mp3',
  wall: '/sounds/wall_hit.mp3',
  ulti: '/sounds/powerup.mp3',

  dash: '/sounds/dash.mp3',
  shield: '/sounds/shield.mp3',
  teleport: '/sounds/teleport.mp3',
  heal: '/sounds/heal.mp3',
  explosion: '/sounds/explosion.mp3',

  brickBreak: '/sounds/brick_break.mp3',
  combo: '/sounds/combo.mp3',
  pacmanChomp: '/sounds/pacman_chomp.mp3',
  pacmanEatGhost: '/sounds/pacman_eatghost.mp3',
  pacmanDeath: '/sounds/pacman_death.mp3',
  invaderKilled: '/sounds/invader_killed.mp3',
  invaderShoot: '/sounds/invader_shoot.mp3',
  snakeEat: '/sounds/snake_eat.mp3',
  snakeDie: '/sounds/snake_die.mp3',
  lightcycleCrash: '/sounds/lightcycle_crash.mp3',
  cardFlip: '/sounds/card_flip.mp3',
  quizCorrect: '/sounds/quiz_correct.mp3',
  quizWrong: '/sounds/quiz_wrong.mp3',
  timerTick: '/sounds/timer_tick.mp3',

  messageSend: '/sounds/message_send.mp3',
  messageReceive: '/sounds/message_receive.mp3',
  matchFound: '/sounds/match_found.mp3',
  levelUp: '/sounds/level_up.mp3',
  countdown: '/sounds/countdown.mp3',
} as const;

export type SoundKey = keyof typeof SOUND_ASSETS;

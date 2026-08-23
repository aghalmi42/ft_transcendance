// -----------------------------------------------------------------------------
// AUDIO ASSET & PROCEDURAL SYNTHESIS ENGINE (ft_transcendence)
// -----------------------------------------------------------------------------
// Features:
// 1. Seamless static audio asset playback (/sounds/*.mp3 & /sounds/*.wav)
// 2. High-fidelity Web Audio API procedural fallback (zero 404s, zero lag)
// 3. Built-in export & download capabilities for all sound effects and songs
// -----------------------------------------------------------------------------

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
  // Core Gameplay
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

  // Expanded Champion & Combat
  dash: '/sounds/dash.mp3',
  shield: '/sounds/shield.mp3',
  teleport: '/sounds/teleport.mp3',
  heal: '/sounds/heal.mp3',
  explosion: '/sounds/explosion.mp3',

  // Arcade Mini-Games
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

  // UI & Social
  messageSend: '/sounds/message_send.mp3',
  messageReceive: '/sounds/message_receive.mp3',
  matchFound: '/sounds/match_found.mp3',
  levelUp: '/sounds/level_up.mp3',
  countdown: '/sounds/countdown.mp3',
};

export type SoundKey = keyof typeof SOUND_ASSETS;

// --- Web Audio Helper: Lazy AudioContext Initializer ---
class WebAudioSynth {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playPaddleHit(volume = 0.45) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);
    gain.gain.setValueAtTime(volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWallHit(volume = 0.35) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
    gain.gain.setValueAtTime(volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playScore(volume = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.1 },
      { freq: 659.25, time: 0.1, dur: 0.1 },
      { freq: 783.99, time: 0.2, dur: 0.3 }
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(volume * 0.5, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  public playVictory(volume = 0.6) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, time: 0.00, dur: 0.15 },
      { freq: 659.25, time: 0.15, dur: 0.15 },
      { freq: 783.99, time: 0.30, dur: 0.15 },
      { freq: 1046.5, time: 0.45, dur: 0.85 }
    ];
    melody.forEach((m) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(m.freq, now + m.time);
      gain.gain.setValueAtTime(volume * 0.4, now + m.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + m.time + m.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + m.time);
      osc.stop(now + m.time + m.dur);
    });
  }

  public playDefeat(volume = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 311.13, time: 0.00, dur: 0.22 },
      { freq: 293.66, time: 0.22, dur: 0.22 },
      { freq: 277.18, time: 0.44, dur: 0.22 },
      { freq: 261.63, time: 0.66, dur: 0.34 }
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      osc.frequency.exponentialRampToValueAtTime(n.freq * 0.9, now + n.time + n.dur);
      gain.gain.setValueAtTime(volume * 0.4, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  public playClick(volume = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.035);
    gain.gain.setValueAtTime(volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playNotification(volume = 0.4) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bells = [
      { freq: 659.25, time: 0.0, dur: 0.15 },
      { freq: 987.77, time: 0.12, dur: 0.33 }
    ];
    bells.forEach((b) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(b.freq, now + b.time);
      gain.gain.setValueAtTime(volume * 0.5, now + b.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + b.time + b.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + b.time);
      osc.stop(now + b.time + b.dur);
    });
  }

  public playLaser(volume = 0.35) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1900, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    gain.gain.setValueAtTime(volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playPowerUp(volume = 0.4) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [261.63, 329.63, 392.00, 493.88, 587.33, 783.99];
    const stepDur = 0.07;
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + idx * stepDur);
      gain.gain.setValueAtTime(volume * 0.4, now + idx * stepDur);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * stepDur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * stepDur);
      osc.stop(now + (idx + 1) * stepDur);
    });
  }

  public playCooldownWarning(volume = 0.35) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0.0, 0.11].forEach((startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now + startTime);
      gain.gain.setValueAtTime(volume * 0.5, now + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startTime);
      osc.stop(now + startTime + 0.07);
    });
  }

  public playDash(volume = 0.4) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
    gain.gain.setValueAtTime(volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playExplosion(volume = 0.6) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    gain.gain.setValueAtTime(volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

// -----------------------------------------------------------------------------
// SOUND MANAGER CLASS
// -----------------------------------------------------------------------------

class SoundManager {
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private currentTrackIdx: number = 0;
  private bgmAudio: HTMLAudioElement | null = null;
  private synth: WebAudioSynth = new WebAudioSynth();
  private sfxVolume: number = 0.5;
  private musicVolume: number = 0.3;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isTransitioning: boolean = false;
  private crossfadeInterval: any = null;
  private transitionListeners: Set<(isTransitioning: boolean) => void> = new Set();

  public playSound(src: string, defaultVolume = 0.45, fallbackFn?: () => void) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    const effectiveVolume = defaultVolume * (this.sfxVolume / 0.5);

    // Prioritize procedural WebAudio synthesizer for zero-latency, zero-404, zero WebMediaPlayer allocation
    if (fallbackFn) {
      try {
        fallbackFn();
        return;
      } catch {}
    }

    try {
      let audio = this.audioCache.get(src);
      if (!audio) {
        if (this.audioCache.size >= 8) {
          // Keep pool small to stay well below browser limits
          const firstKey = this.audioCache.keys().next().value;
          if (firstKey) {
            const oldAudio = this.audioCache.get(firstKey);
            oldAudio?.pause();
            this.audioCache.delete(firstKey);
          }
        }
        audio = new Audio(src);
        this.audioCache.set(src, audio);
      }

      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, effectiveVolume));
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (fallbackFn) fallbackFn();
        });
      }
    } catch {
      if (fallbackFn) fallbackFn();
    }
  }

  // --- CONTROLS ---
  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio && !this.isTransitioning) {
      this.bgmAudio.volume = this.musicVolume;
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public isCrossfading(): boolean {
    return this.isTransitioning;
  }

  public onTransitionChange(listener: (isTransitioning: boolean) => void) {
    this.transitionListeners.add(listener);
    return () => {
      this.transitionListeners.delete(listener);
    };
  }

  private notifyTransition(status: boolean) {
    this.isTransitioning = status;
    this.transitionListeners.forEach((fn) => {
      try {
        fn(status);
      } catch {}
    });
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.fadePlayBgm(600);
    } else {
      this.fadeStopBgm(500);
    }
    return this.musicEnabled;
  }

  public isMusicPlaying(): boolean {
    return this.musicEnabled;
  }

  public getCurrentTrack(): TrackInfo {
    return TRACKS[this.currentTrackIdx] || TRACKS[0];
  }

  public nextTrack(): TrackInfo {
    const nextIdx = (this.currentTrackIdx + 1) % TRACKS.length;
    return this.selectTrack(nextIdx);
  }

  public selectTrack(index: number): TrackInfo {
    if (index >= 0 && index < TRACKS.length) {
      const oldIdx = this.currentTrackIdx;
      this.currentTrackIdx = index;
      if (this.musicEnabled) {
        if (oldIdx !== index && this.bgmAudio) {
          this.crossfadeToTrack(index, 800);
        } else {
          this.fadePlayBgm(600);
        }
      }
    }
    return this.getCurrentTrack();
  }

  // Smooth Crossfade Transition between outgoing and incoming tracks
  private crossfadeToTrack(targetIdx: number, durationMs = 800) {
    if (typeof window === 'undefined') return;
    if (this.crossfadeInterval) {
      clearInterval(this.crossfadeInterval);
      this.crossfadeInterval = null;
    }

    const oldAudio = this.bgmAudio;
    const newTrack = TRACKS[targetIdx] || TRACKS[0];
    const newAudio = new Audio(newTrack.src);
    newAudio.loop = true;
    newAudio.volume = 0;

    const playPromise = newAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    this.notifyTransition(true);

    const steps = 20;
    const stepDuration = durationMs / steps;
    let step = 0;
    const startOldVolume = oldAudio ? oldAudio.volume : this.musicVolume;
    const targetNewVolume = this.musicVolume;

    this.crossfadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;

      // Cosine / smooth interpolation curve
      const fadeOutFactor = Math.cos((progress * Math.PI) / 2);
      const fadeInFactor = Math.sin((progress * Math.PI) / 2);

      if (oldAudio) {
        oldAudio.volume = Math.max(0, Math.min(1, startOldVolume * fadeOutFactor));
      }
      newAudio.volume = Math.max(0, Math.min(1, targetNewVolume * fadeInFactor));

      if (step >= steps) {
        clearInterval(this.crossfadeInterval);
        this.crossfadeInterval = null;

        if (oldAudio) {
          oldAudio.pause();
          oldAudio.currentTime = 0;
        }

        newAudio.volume = targetNewVolume;
        this.bgmAudio = newAudio;
        this.notifyTransition(false);
      }
    }, stepDuration);
  }

  // Smooth Fade In when starting music
  private fadePlayBgm(durationMs = 600) {
    if (typeof window === 'undefined') return;
    if (this.crossfadeInterval) {
      clearInterval(this.crossfadeInterval);
      this.crossfadeInterval = null;
    }

    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }

    const track = this.getCurrentTrack();
    this.bgmAudio = new Audio(track.src);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0;

    const promise = this.bgmAudio.play();
    if (promise !== undefined) {
      promise.catch(() => {});
    }

    this.notifyTransition(true);

    const steps = 15;
    const stepDuration = durationMs / steps;
    let step = 0;
    const targetVolume = this.musicVolume;

    this.crossfadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      const factor = Math.sin((progress * Math.PI) / 2);

      if (this.bgmAudio) {
        this.bgmAudio.volume = Math.max(0, Math.min(1, targetVolume * factor));
      }

      if (step >= steps) {
        clearInterval(this.crossfadeInterval);
        this.crossfadeInterval = null;
        if (this.bgmAudio) this.bgmAudio.volume = targetVolume;
        this.notifyTransition(false);
      }
    }, stepDuration);
  }

  // Smooth Fade Out when stopping music
  private fadeStopBgm(durationMs = 500) {
    if (!this.bgmAudio) {
      this.notifyTransition(false);
      return;
    }

    if (this.crossfadeInterval) {
      clearInterval(this.crossfadeInterval);
      this.crossfadeInterval = null;
    }

    const audioToStop = this.bgmAudio;
    const startVolume = audioToStop.volume;
    this.notifyTransition(true);

    const steps = 12;
    const stepDuration = durationMs / steps;
    let step = 0;

    this.crossfadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      const factor = Math.cos((progress * Math.PI) / 2);

      audioToStop.volume = Math.max(0, Math.min(1, startVolume * factor));

      if (step >= steps) {
        clearInterval(this.crossfadeInterval);
        this.crossfadeInterval = null;
        audioToStop.pause();
        audioToStop.currentTime = 0;
        if (this.bgmAudio === audioToStop) {
          this.bgmAudio = null;
        }
        this.notifyTransition(false);
      }
    }, stepDuration);
  }


  // --- CORE GAME SOUNDS ---
  public playHit() {
    this.playPaddleHit();
  }

  public playPaddleHit() {
    this.playSound(SOUND_ASSETS.paddleHit, 0.45, () => this.synth.playPaddleHit(0.45));
  }

  public playWallHit() {
    this.playSound(SOUND_ASSETS.wallHit, 0.35, () => this.synth.playWallHit(0.35));
  }

  public playScore() {
    this.playSound(SOUND_ASSETS.score, 0.5, () => this.synth.playScore(0.5));
  }

  public playVictory() {
    this.playSound(SOUND_ASSETS.victory, 0.6, () => this.synth.playVictory(0.6));
  }

  public playDefeat() {
    this.playSound(SOUND_ASSETS.defeat, 0.5, () => this.synth.playDefeat(0.5));
  }

  public playClick() {
    this.playSound(SOUND_ASSETS.click, 0.25, () => this.synth.playClick(0.25));
  }

  public playNotification() {
    this.playSound(SOUND_ASSETS.notification, 0.4, () => this.synth.playNotification(0.4));
  }

  public playLaser() {
    this.playSound(SOUND_ASSETS.laser, 0.35, () => this.synth.playLaser(0.35));
  }

  public playPowerUp() {
    this.playSound(SOUND_ASSETS.powerup, 0.4, () => this.synth.playPowerUp(0.4));
  }

  public playCooldownWarning() {
    this.playSound(SOUND_ASSETS.cooldown, 0.35, () => this.synth.playCooldownWarning(0.35));
  }

  public playFreezeCast() {
    this.playLaser();
  }

  public playStunCast() {
    this.playLaser();
  }

  public playWallCast() {
    this.playWallHit();
  }

  public playUltiCast() {
    this.playPowerUp();
  }

  // --- CHAMPION & COMBAT ABILITIES ---
  public playDash() {
    this.playSound(SOUND_ASSETS.dash, 0.4, () => this.synth.playDash(0.4));
  }

  public playShield() {
    this.playSound(SOUND_ASSETS.shield, 0.45);
  }

  public playSpell() {
    this.playPowerUp();
  }

  public playLaserShoot() {
    this.playLaser();
  }

  public playGoal() {
    this.playScore();
  }


  public playTeleport() {
    this.playSound(SOUND_ASSETS.teleport, 0.45);
  }

  public playHeal() {
    this.playSound(SOUND_ASSETS.heal, 0.4);
  }

  public playExplosion() {
    this.playSound(SOUND_ASSETS.explosion, 0.6, () => this.synth.playExplosion(0.6));
  }

  // --- ARCADE SOUNDS ---
  public playBrickBreak() {
    this.playSound(SOUND_ASSETS.brickBreak, 0.45);
  }

  public playCombo() {
    this.playSound(SOUND_ASSETS.combo, 0.45);
  }

  public playPacmanChomp() {
    this.playSound(SOUND_ASSETS.pacmanChomp, 0.35);
  }

  public playPacmanEatGhost() {
    this.playSound(SOUND_ASSETS.pacmanEatGhost, 0.5);
  }

  public playPacmanDeath() {
    this.playSound(SOUND_ASSETS.pacmanDeath, 0.5);
  }

  public playInvaderKilled() {
    this.playSound(SOUND_ASSETS.invaderKilled, 0.45);
  }

  public playInvaderShoot() {
    this.playSound(SOUND_ASSETS.invaderShoot, 0.35);
  }

  public playSnakeEat() {
    this.playSound(SOUND_ASSETS.snakeEat, 0.4);
  }

  public playSnakeDie() {
    this.playSound(SOUND_ASSETS.snakeDie, 0.5);
  }

  public playLightcycleCrash() {
    this.playSound(SOUND_ASSETS.lightcycleCrash, 0.55);
  }

  public playCardFlip() {
    this.playSound(SOUND_ASSETS.cardFlip, 0.3);
  }

  public playQuizCorrect() {
    this.playSound(SOUND_ASSETS.quizCorrect, 0.45);
  }

  public playQuizWrong() {
    this.playSound(SOUND_ASSETS.quizWrong, 0.45);
  }

  public playTimerTick() {
    this.playSound(SOUND_ASSETS.timerTick, 0.25);
  }

  // --- UI & SOCIAL ---
  public playMessageSend() {
    this.playSound(SOUND_ASSETS.messageSend, 0.3);
  }

  public playMessageReceive() {
    this.playSound(SOUND_ASSETS.messageReceive, 0.4);
  }

  public playMatchFound() {
    this.playSound(SOUND_ASSETS.matchFound, 0.6);
  }

  public playLevelUp() {
    this.playSound(SOUND_ASSETS.levelUp, 0.55);
  }

  public playCountdown() {
    this.playSound(SOUND_ASSETS.countdown, 0.4);
  }

  public playGameStart() {
    this.playPowerUp();
  }

  // --- EXPORT & DOWNLOAD UTILITIES ---
  public downloadAudioFile(url: string, filename?: string) {
    if (typeof window === 'undefined') return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || url.split('/').pop() || 'audio.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public downloadAllSounds() {
    if (typeof window === 'undefined') return;
    const allUrls = [
      ...Object.entries(SOUND_ASSETS).map(([key, src]) => ({ name: `${key}.mp3`, src })),
      ...TRACKS.map((t) => ({ name: `${t.src.split('/').pop()}`, src: t.src })),
    ];

    allUrls.forEach((item, index) => {
      setTimeout(() => {
        this.downloadAudioFile(item.src, item.name);
      }, index * 150);
    });
  }
}

export const soundEffects = new SoundManager();
export const audioService = soundEffects;
export const audioClient = soundEffects;
export default soundEffects;


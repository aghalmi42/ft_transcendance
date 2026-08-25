import { TRACKS, SOUND_ASSETS, type TrackInfo, type SoundKey } from '../config/soundAssets';
export { TRACKS, SOUND_ASSETS };
export type { TrackInfo, SoundKey };

class WebAudioSynth {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(type: OscillatorType, freqStart: number, freqEnd: number, dur: number, vol = 0.5, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + dur);
    }
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  private sequence(type: OscillatorType, notes: Array<[freq: number, time: number, dur: number]>, vol = 0.5) {
    notes.forEach(([f, t, d]) => this.tone(type, f, f, d, vol, t));
  }

  public playPaddleHit(v = 0.45) { this.tone('square', 520, 240, 0.12, v * 0.7); }
  public playWallHit(v = 0.35) { this.tone('square', 240, 110, 0.09, v * 0.6); }
  public playScore(v = 0.5) { this.sequence('square', [[523.25, 0, 0.1], [659.25, 0.1, 0.1], [783.99, 0.2, 0.3]], v * 0.5); }
  public playVictory(v = 0.6) { this.sequence('sawtooth', [[523.25, 0, 0.15], [659.25, 0.15, 0.15], [783.99, 0.3, 0.15], [1046.5, 0.45, 0.85]], v * 0.4); }
  public playDefeat(v = 0.5) { this.sequence('sawtooth', [[311.13, 0, 0.22], [293.66, 0.22, 0.22], [277.18, 0.44, 0.22], [261.63, 0.66, 0.34]], v * 0.4); }
  public playClick(v = 0.25) { this.tone('sine', 1200, 400, 0.035, v * 0.5); }
  public playNotification(v = 0.4) { this.sequence('sine', [[659.25, 0, 0.15], [880, 0.12, 0.35]], v * 0.6); }
  public playPowerUp(v = 0.5) { this.tone('sine', 330, 990, 0.25, v * 0.5); }
  public playLaser(v = 0.4) { this.tone('sawtooth', 880, 110, 0.15, v * 0.6); }
  public playShield(v = 0.45) { this.tone('sine', 160, 480, 0.3, v * 0.7); }
  public playTeleport(v = 0.45) { this.tone('sawtooth', 300, 1200, 0.18, v * 0.5); }
  public playHeal(v = 0.4) { this.sequence('sine', [[440, 0, 0.1], [554.37, 0.08, 0.1], [659.25, 0.16, 0.25]], v * 0.5); }
  public playDash(v = 0.4) { this.tone('triangle', 380, 80, 0.12, v * 0.8); }
  public playCooldown(v = 0.3) { this.tone('sine', 180, 120, 0.08, v * 0.6); }
  public playFreezeCast(v = 0.4) { this.tone('sine', 600, 150, 0.35, v * 0.5); }
  public playUltiCast(v = 0.6) { this.sequence('sawtooth', [[220, 0, 0.15], [330, 0.15, 0.15], [440, 0.3, 0.15], [880, 0.45, 0.6]], v * 0.5); }
  public playSmash(v = 0.5) { this.tone('square', 400, 80, 0.18, v * 0.8); }
  public playTrap(v = 0.4) { this.tone('sawtooth', 200, 60, 0.2, v * 0.7); }
}

class SoundManager {
  private synth = new WebAudioSynth();
  private bgMusic: HTMLAudioElement | null = null;
  private currentTrack: TrackInfo | null = null;
  private isMutedState = false;
  private musicVolume = 0.3;
  private sfxVolume = 0.7;
  private isAudioUnlocked = false;
  private audioPool: Map<string, HTMLAudioElement[]> = new Map();
  private listeners: Array<() => void> = [];

  constructor() {
    this.restoreSettings();
  }

  private restoreSettings() {
    if (typeof window === 'undefined') return;
    try {
      const muted = localStorage.getItem('pong_audio_muted');
      if (muted !== null) this.isMutedState = muted === 'true';
      const mVol = localStorage.getItem('pong_music_vol');
      if (mVol !== null) this.musicVolume = parseFloat(mVol);
      const sVol = localStorage.getItem('pong_sfx_vol');
      if (sVol !== null) this.sfxVolume = parseFloat(sVol);
    } catch {}
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public unlockAudio() {
    if (this.isAudioUnlocked) return;
    this.isAudioUnlocked = true;
    this.synth.playClick(0.01);
  }

  public playSound(src: string, vol = 0.5) {
    if (this.isMutedState) return;
    try {
      this.unlockAudio();
      let pool = this.audioPool.get(src);
      if (!pool) {
        pool = [];
        this.audioPool.set(src, pool);
      }
      let audio = pool.find(a => a.paused || a.ended);
      if (!audio) {
        if (pool.length < 6) {
          audio = new Audio(src);
          pool.push(audio);
        } else {
          audio = pool[0];
        }
      }
      audio.volume = Math.min(1, Math.max(0, vol * this.sfxVolume));
      audio.currentTime = 0;
      audio.play().catch(() => this.fallbackSynth(src, vol));
    } catch {
      this.fallbackSynth(src, vol);
    }
  }

  private fallbackSynth(src: string, vol: number) {
    if (src.includes('paddle') || src.includes('bounce')) this.synth.playPaddleHit(vol);
    else if (src.includes('score') || src.includes('goal')) this.synth.playScore(vol);
    else if (src.includes('victory') || src.includes('win')) this.synth.playVictory(vol);
    else if (src.includes('defeat') || src.includes('lose') || src.includes('die')) this.synth.playDefeat(vol);
    else if (src.includes('laser') || src.includes('shoot')) this.synth.playLaser(vol);
    else if (src.includes('powerup') || src.includes('level_up')) this.synth.playPowerUp(vol);
    else this.synth.playClick(vol);
  }

  public playMusic(track: TrackInfo) {
    if (this.currentTrack?.id === track.id && this.bgMusic && !this.bgMusic.paused) return;
    this.stopMusic();
    this.currentTrack = track;
    try {
      this.bgMusic = new Audio(track.src);
      this.bgMusic.loop = true;
      this.bgMusic.volume = this.isMutedState ? 0 : this.musicVolume;
      this.bgMusic.play().catch(() => {});
    } catch {}
    this.notify();
  }

  public stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
      this.bgMusic = null;
    }
    this.notify();
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying()) {
      this.stopMusic();
    } else {
      this.playMusic(this.currentTrack || TRACKS[0]);
    }
    return this.isMusicPlaying();
  }

  public nextTrack(): TrackInfo {
    const curIdx = TRACKS.findIndex(t => t.id === this.currentTrack?.id);
    const nextIdx = (curIdx + 1) % TRACKS.length;
    const next = TRACKS[nextIdx];
    this.playMusic(next);
    return next;
  }

  public selectTrack(target: number | TrackInfo): TrackInfo {
    const track = typeof target === 'number' ? TRACKS[target % TRACKS.length] : target;
    this.playMusic(track);
    return track;
  }

  public isMusicPlaying(): boolean {
    return !!this.bgMusic && !this.bgMusic.paused;
  }

  public isCrossfading(): boolean {
    return false;
  }

  public onTransitionChange(_cb: (c: boolean) => void): () => void {
    return () => {};
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (this.bgMusic) this.bgMusic.volume = this.isMutedState ? 0 : this.musicVolume;
    try { localStorage.setItem('pong_audio_muted', String(this.isMutedState)); } catch {}
    this.notify();
    return this.isMutedState;
  }

  public isMuted() { return this.isMutedState; }
  public isSoundEnabled() { return !this.isMutedState; }
  public setSoundEnabled(enabled: boolean) {
    if (this.isMutedState === enabled) this.toggleMute();
  }
  public getMusicVolume() { return this.musicVolume; }
  public getSfxVolume() { return this.sfxVolume; }
  public getCurrentTrack() { return this.currentTrack || TRACKS[0]; }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.min(1, Math.max(0, vol));
    if (this.bgMusic && !this.isMutedState) this.bgMusic.volume = this.musicVolume;
    try { localStorage.setItem('pong_music_vol', String(this.musicVolume)); } catch {}
    this.notify();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.min(1, Math.max(0, vol));
    try { localStorage.setItem('pong_sfx_vol', String(this.sfxVolume)); } catch {}
    this.notify();
  }

  public playPaddleHit() { this.synth.playPaddleHit(); }
  public playWallHit() { this.synth.playWallHit(); }
  public playScore() { this.synth.playScore(); }
  public playVictory() { this.synth.playVictory(); }
  public playDefeat() { this.synth.playDefeat(); }
  public playPowerUp() { this.synth.playPowerUp(); }
  public playLaser() { this.synth.playLaser(); }
  public playShield() { this.synth.playShield(); }
  public playTeleport() { this.synth.playTeleport(); }
  public playHeal() { this.synth.playHeal(); }
  public playDash() { this.synth.playDash(); }
  public playClick() { this.synth.playClick(); }
  public playCooldown() { this.synth.playCooldown(); }
  public playFreezeCast() { this.synth.playFreezeCast(); }
  public playUltiCast() { this.synth.playUltiCast(); }
  public playSmash() { this.synth.playSmash(); }
  public playTrap() { this.synth.playTrap(); }

  public playBounce() { this.playSound(SOUND_ASSETS.paddleHit, 0.45); }
  public playHit() { this.playPaddleHit(); }
  public playLaserShoot() { this.playLaser(); }
  public playCooldownWarning() { this.playCooldown(); }
  public playStunCast() { this.playFreezeCast(); }
  public playWallCast() { this.playShield(); }
  public playExplosion() { this.playSmash(); }
  public playBrickBreak() { this.playWallHit(); }
  public playCombo() { this.playSound(SOUND_ASSETS.combo, 0.45); }
  public playPacmanChomp() { this.playSound(SOUND_ASSETS.pacmanChomp, 0.35); }
  public playPacmanEatGhost() { this.playSound(SOUND_ASSETS.pacmanEatGhost, 0.5); }
  public playPacmanDeath() { this.playSound(SOUND_ASSETS.pacmanDeath, 0.5); }
  public playInvaderKilled() { this.playSound(SOUND_ASSETS.invaderKilled, 0.45); }
  public playInvaderShoot() { this.playSound(SOUND_ASSETS.invaderShoot, 0.35); }
  public playSnakeEat() { this.playSound(SOUND_ASSETS.snakeEat, 0.4); }
  public playSnakeDie() { this.playSound(SOUND_ASSETS.snakeDie, 0.5); }
  public playLightcycleCrash() { this.playSound(SOUND_ASSETS.lightcycleCrash, 0.55); }
  public playCardFlip() { this.playSound(SOUND_ASSETS.cardFlip, 0.3); }
  public playQuizCorrect() { this.playSound(SOUND_ASSETS.quizCorrect, 0.45); }
  public playQuizWrong() { this.playSound(SOUND_ASSETS.quizWrong, 0.45); }
  public playTimerTick() { this.playSound(SOUND_ASSETS.timerTick, 0.25); }
  public playMessageSend() { this.playSound(SOUND_ASSETS.messageSend, 0.3); }
  public playMessageReceive() { this.playSound(SOUND_ASSETS.messageReceive, 0.4); }
  public playMatchFound() { this.playSound(SOUND_ASSETS.matchFound, 0.6); }
  public playLevelUp() { this.playSound(SOUND_ASSETS.levelUp, 0.55); }
  public playCountdown() { this.playSound(SOUND_ASSETS.countdown, 0.4); }
  public playGameStart() { this.playPowerUp(); }
  public playNotification() { this.playSound(SOUND_ASSETS.notification, 0.4); }

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
      ...TRACKS.map(t => ({ name: `${t.src.split('/').pop()}`, src: t.src })),
    ];
    allUrls.forEach((item, index) => {
      setTimeout(() => this.downloadAudioFile(item.src, item.name), index * 150);
    });
  }
}

export const soundEffects = new SoundManager();
export const audioService = soundEffects;
export const audioClient = soundEffects;
export default soundEffects;

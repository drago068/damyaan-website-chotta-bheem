class SoundEngine {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private listeners: ((playing: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      this.audio = new Audio('/audio.mpeg');
      this.audio.loop = true;
      this.audio.volume = 0.85;
      this.audio.preload = 'auto';
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio initialization error:', e);
    }
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const active = this.getIsPlaying();
    this.listeners.forEach((cb) => cb(active));
  }

  /**
   * Restart audio from the very beginning (used on Enter Again / Scene 07 CTA)
   */
  public restartFromBeginning() {
    this.initAudio();
    if (this.audio) {
      this.audio.currentTime = 0;
      this.isMuted = false;
      this.audio.muted = false;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.notify();
          })
          .catch((err) => {
            console.log('Audio play after restart caught:', err);
          });
      }
    }
  }

  /**
   * Start playback upon entering the lair or user interaction
   */
  public play() {
    this.initAudio();
    if (this.audio && !this.isMuted) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.notify();
          })
          .catch(() => {
            // Autoplay waiting for user gesture
          });
      }
    }
  }

  /**
   * Toggle between muted / unmuted
   */
  public toggle(): boolean {
    this.initAudio();
    if (!this.audio) return false;

    if (this.isMuted || this.audio.paused) {
      this.isMuted = false;
      this.audio.muted = false;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.notify();
          })
          .catch(() => {});
      }
      return true;
    } else {
      this.isMuted = true;
      this.audio.muted = true;
      this.audio.pause();
      this.notify();
      return false;
    }
  }

  public getIsPlaying(): boolean {
    if (!this.audio) return false;
    return !this.isMuted && !this.audio.paused;
  }
}

export const soundEngine = new SoundEngine();

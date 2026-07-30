// Web Audio API Sound Engine for Gift unwrapping sound effects & background ambient music

class GiftAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgGainNode: GainNode | null = null;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private isPlayingMusic: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playUnwrapSound() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Ascending magical sparkle chime sequence (C5, E5, G5, B5, C6, E6, G6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      const noteVol = this.isMuted ? 0 : 0.15;
      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(noteVol, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.7);
    });
  }

  public startBackgroundMusic() {
    this.initContext();
    if (!this.ctx || this.isPlayingMusic) return;

    this.isPlayingMusic = true;
    const now = this.ctx.currentTime;

    this.bgGainNode = this.ctx.createGain();
    this.bgGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.08, now);
    this.bgGainNode.connect(this.ctx.destination);

    // Warm ambient pad chord progressions (Cmaj7 -> Am7 -> Fmaj7 -> G)
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0], // G
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.ctx || !this.isPlayingMusic || !this.bgGainNode) return;
      const chordTime = this.ctx.currentTime;
      const currentChord = chords[chordIndex];

      currentChord.forEach((freq) => {
        if (!this.ctx || !this.bgGainNode) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);

        // Soft envelope
        noteGain.gain.setValueAtTime(0.001, chordTime);
        noteGain.gain.linearRampToValueAtTime(0.025, chordTime + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.001, chordTime + 4.2);

        osc.connect(noteGain);
        noteGain.connect(this.bgGainNode);

        osc.start(chordTime);
        osc.stop(chordTime + 4.3);
      });

      chordIndex = (chordIndex + 1) % chords.length;
    };

    playNextChord();
    this.musicInterval = setInterval(playNextChord, 4200);
  }

  public stopBackgroundMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgGainNode && this.ctx) {
      this.bgGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isPlaying(): boolean {
    return this.isPlayingMusic;
  }
}

export const audioEngine = new GiftAudioEngine();

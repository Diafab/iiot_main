class AlarmSoundManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazy audio context setup on first user gesture or alarm trigger
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stop();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playAlarm(type: "TECHNICIAN_CALL" | "POWER_OUTAGE" | string) {
    if (this.muted || this.isPlaying) return;

    this.initAudioContext();
    if (!this.audioCtx) return;

    this.isPlaying = true;

    // Trigger intermittent industrial warning siren
    const playBeep = () => {
      if (!this.audioCtx || this.muted) return;

      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type === "POWER_OUTAGE" ? "sawtooth" : "square";
        
        // Frequencies for power outage vs technician call
        const freq1 = type === "POWER_OUTAGE" ? 440 : 880;
        const freq2 = type === "POWER_OUTAGE" ? 330 : 660;

        osc.frequency.setValueAtTime(freq1, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq2, this.audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.35);
      } catch (err) {
        console.error("Audio synth error:", err);
      }
    };

    playBeep();
    this.intervalId = window.setInterval(playBeep, 800);
  }

  public stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
  }
}

export const alarmSoundManager = new AlarmSoundManager();

/**
 * High-performance Web Audio API Synthesizer & Haptics Engine for Timing Orbit.
 * Completely zero-dependency, works offline, zero latency.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Pentatonic scale frequencies for escalating combo melody
const MELODY_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
  1046.50, // C6
  1174.66, // D6
  1318.51, // E6
];

class SoundSynthController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private isInitialized = false;

  public soundEnabled = true;
  public melodyEnabled = true;
  public droneEnabled = true;
  public hapticsEnabled = true;

  constructor() {
    // Lazy initialize on first user interaction
  }

  public init() {
    if (this.isInitialized && this.ctx && this.ctx.state !== 'suspended') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isInitialized = true;
    } catch {
      // AudioContext not supported
    }
  }

  public triggerHaptic(type: 'safe' | 'bullseye' | 'fever' | 'miss' | 'level') {
    if (!this.hapticsEnabled) return;
    // Native impact/notification generators on iOS (UIFeedbackGenerator under the hood);
    // falls back to the Web Vibration API automatically when running in a plain browser.
    try {
      switch (type) {
        case 'safe':
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
          break;
        case 'bullseye':
          Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
          break;
        case 'fever':
          Haptics.notification({ type: NotificationType.Success }).catch(() => {});
          break;
        case 'miss':
          Haptics.notification({ type: NotificationType.Error }).catch(() => {});
          break;
        case 'level':
          Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
          break;
      }
    } catch {
      // Haptics not supported on this platform
    }
  }

  public playSafeHit() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
    this.triggerHaptic('safe');
  }

  public playBullseyeHit(comboCount: number, isFever = false) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const scaleIndex = Math.min(Math.max(0, comboCount - 1), MELODY_SCALE.length - 1);
    const baseFreq = MELODY_SCALE[scaleIndex];

    // Primary bell tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isFever ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);

    // Harmonic overtone
    const harmOsc = this.ctx.createOscillator();
    const harmGain = this.ctx.createGain();
    harmOsc.type = 'sine';
    harmOsc.frequency.setValueAtTime(baseFreq * 2, t);

    const decay = isFever ? 0.35 : 0.22;

    gain.gain.setValueAtTime(isFever ? 0.35 : 0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

    harmGain.gain.setValueAtTime(0.18, t);
    harmGain.gain.exponentialRampToValueAtTime(0.001, t + (decay * 0.7));

    osc.connect(gain);
    harmOsc.connect(harmGain);

    gain.connect(this.masterGain);
    harmGain.connect(this.masterGain);

    osc.start(t);
    harmOsc.start(t);
    osc.stop(t + decay + 0.02);
    harmOsc.stop(t + decay + 0.02);

    this.triggerHaptic('bullseye');
  }

  public playMissSound() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.32);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    // Filter to give deep hollow impact
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.34);
    this.triggerHaptic('miss');
  }

  public playFeverActivation() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 major arpeggio
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.05;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, noteTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });

    this.triggerHaptic('fever');
  }

  public playDirectionReversalAlert() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.12);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playLevelUpChime() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const noteT = t + i * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteT);
      gain.gain.setValueAtTime(0.25, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(noteT);
      osc.stop(noteT + 0.26);
    });
    this.triggerHaptic('level');
  }

  public playSplashIntro() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      // Ambient atmospheric swelling chord (F#m9 / C#m precision harmonic)
      const rootFreqs = [130.81, 196.00, 261.63, 392.00, 523.25];
      rootFreqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 1.8);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 + idx * 250, t);
        filter.frequency.exponentialRampToValueAtTime(1800, t + 1.2);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.06, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + 2.3);
      });

      // Shimmering chime sweep
      const chimeNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      chimeNotes.forEach((f, i) => {
        const noteT = t + 0.35 + i * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteT);

        gain.gain.setValueAtTime(0.12, noteT);
        gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(noteT);
        osc.stop(noteT + 0.45);
      });

      this.triggerHaptic('bullseye');
    } catch {
      // AudioContext handling
    }
  }

  public playOrbEarn() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.09);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public startAmbientDrone() {
    if (!this.droneEnabled || this.droneOsc) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneFilter = this.ctx.createBiquadFilter();

      this.droneOsc.type = 'triangle';
      this.droneOsc.frequency.setValueAtTime(65.41, t); // C2 low root

      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(160, t);

      this.droneGain.gain.setValueAtTime(0.001, t);
      this.droneGain.gain.linearRampToValueAtTime(0.08, t + 1.5);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc.start(t);
    } catch {
      // Drone startup error ignored
    }
  }

  public updateAmbientDrone(combo: number, isFever: boolean) {
    if (!this.droneFilter || !this.droneGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    const targetFreq = isFever ? 450 : Math.min(160 + combo * 25, 360);
    const targetGain = isFever ? 0.14 : 0.08;
    this.droneFilter.frequency.setTargetAtTime(targetFreq, t, 0.2);
    this.droneGain.gain.setTargetAtTime(targetGain, t, 0.2);
  }

  public stopAmbientDrone() {
    if (!this.droneOsc || !this.ctx || !this.droneGain) return;
    try {
      const t = this.ctx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
      this.droneOsc.stop(t + 0.55);
      this.droneOsc = null;
      this.droneGain = null;
      this.droneFilter = null;
    } catch {
      this.droneOsc = null;
    }
  }
}

export const soundSynth = new SoundSynthController();

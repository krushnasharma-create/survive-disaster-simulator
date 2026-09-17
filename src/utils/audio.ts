// src/utils/audio.ts
// Zero-dependency procedural Web Audio API sound generator for SURVIVE.
// Complies strictly with browser autoplay policies: only triggers on genuine user interaction.
// Provides subtle, restrained audio feedback for emergency simulation immersion.

import type { DisasterType } from '../data/types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isAudioEnabled = true;

/**
 * Lazily initialize and resume AudioContext on first user interaction.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
      compressor.knee.setValueAtTime(12, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(8, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime); // Restrained master volume

      masterGain.connect(compressor);
      compressor.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  } catch {
    return null;
  }
}

export function setAudioEnabled(enabled: boolean) {
  isAudioEnabled = enabled;
  if (!enabled && masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  } else if (enabled && masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  }
}

export function isSoundEnabled(): boolean {
  return isAudioEnabled;
}

/**
 * Subtle UI Button Hover sound: ultra-short high-frequency click (15ms).
 */
export function playHover() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain || ctx.state !== 'running') return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch {}
}

/**
 * Button Click / Select: Crisp mechanical latch.
 */
export function playSelect() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain || ctx.state !== 'running') return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {}
}

/**
 * Screen Transition Whoosh: Sub-bass filtered sweep (180ms).
 */
export function playTransition() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain || ctx.state !== 'running') return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {}
}

/**
 * Timed Decision Warning Tick (1s interval):
 * - <= 5s: 880Hz electronic warning pulse
 * - <= 3s: double urgency pulse
 * - 0s: low alert buzz
 */
export function playTimerTick(remaining: number) {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain || ctx.state !== 'running') return;

  try {
    const now = ctx.currentTime;
    if (remaining === 0) {
      // Timeout Buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
      return;
    }

    if (remaining <= 3) {
      // High Urgency Dual Beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1050, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);

      // Second pulse
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1250, now + 0.06);

      gain2.gain.setValueAtTime(0.07, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.1);
    } else if (remaining <= 5) {
      // Single Warning Ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {}
}

/**
 * Choice Action Lock Impact (disaster-specific flavor when player commits).
 */
export function playDisasterChoiceImpact(disaster: DisasterType) {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain || ctx.state !== 'running') return;

  try {
    const now = ctx.currentTime;

    if (disaster === 'earthquake') {
      // Low seismic thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (disaster === 'fire') {
      // Hot air whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      // Flood fluid wave sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {}
}

/**
 * Consequence Reveal Impact Chime:
 * - isCorrect: Gentle harmonic major confirmation (520Hz -> 650Hz)
 * - !isCorrect: Serious low warning dissonance (220Hz + 195Hz)
 */
export function playConsequenceReveal(isCorrect: boolean) {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain || ctx.state !== 'running') return;

  try {
    const now = ctx.currentTime;

    if (isCorrect) {
      // Reassuring harmonic major third
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.45);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.45);
    } else {
      // Serious dissonant impact chord
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(196, now); // G3
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(185, now); // F#3 (minor second clash)

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.4);
      osc2.start(now);
      osc2.stop(now + 0.4);
    }
  } catch {}
}

/**
 * Clean up / silence any active nodes immediately.
 */
export function stopAllAudio() {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    }
  } catch {}
}

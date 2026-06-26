"use client";

// Procedural sound effects using the Web Audio API.
// No external assets needed — all sounds are synthesized.
// v0.5.0: zone-based ambient music with crossfade, PannerNode for 3D SFX,
// boss music crossfade, and volume control sliders.

type SoundName =
  | "attack"
  | "hit"
  | "crit"
  | "enemyDeath"
  | "playerHurt"
  | "levelUp"
  | "pickup"
  | "questComplete"
  | "buy"
  | "sell"
  | "error"
  | "select"
  | "open"
  | "close"
  | "cast"
  | "explosion"
  | "chest"
  | "drink"
  | "equip";

/** Musical zone identifier for ambient music crossfading. */
export type MusicZone = "village" | "forest" | "frostpeak" | "boss";

/** Chord definitions per zone. Each zone has a unique progression + tempo. */
const ZONE_MUSIC: Record<MusicZone, { chords: number[][]; stepDur: number; bassMult: number }> = {
  village: {
    // Strings + flute medieval — Am F C G (60 BPM feel)
    chords: [
      [220, 262, 330], // Am
      [175, 220, 262], // F
      [262, 330, 392], // C
      [196, 247, 294], // G
    ],
    stepDur: 0.25,
    bassMult: 1,
  },
  forest: {
    // Flûte de pan + cloches — Dm Am C G (65 BPM feel, higher register)
    chords: [
      [294, 349, 440], // Dm
      [220, 262, 330], // Am
      [262, 330, 392], // C
      [196, 247, 294], // G
    ],
    stepDur: 0.23,
    bassMult: 0.9,
  },
  frostpeak: {
    // Corde grave + cristal — Em Am Dm A (55 BPM feel, lower register)
    chords: [
      [165, 196, 247], // Em
      [220, 262, 330], // Am
      [147, 175, 220], // Dm
      [220, 277, 330], // A
    ],
    stepDur: 0.27,
    bassMult: 1.2,
  },
  boss: {
    // Percussion martiale + choeur — Cm Eb Bb F (75 BPM feel, intense)
    chords: [
      [131, 156, 196], // Cm
      [156, 185, 233], // Eb
      [117, 147, 175], // Bb
      [175, 220, 262], // F
    ],
    stepDur: 0.2,
    bassMult: 1.4,
  },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bossGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Music state
  private musicTimer: number | null = null;
  private musicStep = 0;
  private currentZone: MusicZone = "village";
  private targetZone: MusicZone = "village";
  private crossfadeProgress = 1; // 0..1, 1 = fully on target
  private crossfadeDuration = 4; // seconds

  // Boss music state
  private bossActive = false;
  private bossCrossfade = 0; // 0 = off, 1 = fully boss

  // Volume levels (0..1)
  masterVolume = 0.7;
  sfxVolume = 0.6;
  musicVolume = 0.18;

  muted = false;
  musicEnabled = true;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      // Boss music channel — separate gain for crossfade
      this.bossGain = this.ctx.createGain();
      this.bossGain.gain.value = 0;
      this.bossGain.connect(this.masterGain);

      // Pre-generate reusable noise buffer (0.5s of white noise)
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } catch {
      // audio not supported
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // --- Volume control (for Options.tsx sliders) ---

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
    if (this.bossGain) this.bossGain.gain.value = this.musicVolume * this.bossCrossfade;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.masterGain) {
      this.masterGain.gain.value = m ? 0 : this.masterVolume;
    }
  }

  setMusicEnabled(e: boolean) {
    this.musicEnabled = e;
    if (e) this.startMusic();
    else this.stopMusic();
  }

  // --- Zone music ---

  /** Set the current music zone. Crossfades over 4 seconds. */
  setZone(zone: MusicZone) {
    if (zone === this.targetZone && this.crossfadeProgress >= 1) return;
    this.targetZone = zone;
    this.crossfadeProgress = 0;
    // If we were playing boss music, fade it out
    if (this.bossActive && zone !== "boss") {
      this.bossActive = false;
    }
  }

  /** Trigger boss music crossfade. When isBoss=true, ambient fades down 80%
   *  and boss channel fades up over 4s. When isBoss=false, reverses over 6s. */
  setBossMusic(isBoss: boolean) {
    if (isBoss === this.bossActive) return;
    this.bossActive = isBoss;
    // The crossfade is driven by the music tick loop
  }

  // --- SFX with optional 3D positioning ---

  play(name: SoundName, position?: [number, number, number]) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;

    // Create a PannerNode if position is provided
    let output: GainNode | AudioNode = this.sfxGain;
    let panner: PannerNode | null = null;
    if (position && this.ctx) {
      panner = this.ctx.createPanner();
      panner.panningModel = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance = 1;
      panner.maxDistance = 50;
      panner.rolloffFactor = 1.5;
      panner.setPosition(position[0], position[1], position[2]);
      panner.connect(this.sfxGain);
      output = panner;
    }

    switch (name) {
      case "attack": this.swordSwing(t, output); break;
      case "hit": this.thud(t, 200, 0.12, output); break;
      case "crit": this.crit(t, output); break;
      case "enemyDeath": this.death(t, output); break;
      case "playerHurt": this.hurt(t, output); break;
      case "levelUp": this.levelUp(t, output); break;
      case "pickup": this.blip(t, 880, 0.08, "square", output); break;
      case "questComplete": this.fanfare(t, output); break;
      case "buy": this.blip(t, 660, 0.06, "square", output); this.blip(t + 0.06, 880, 0.06, "square", output); break;
      case "sell": this.blip(t, 880, 0.06, "square", output); this.blip(t + 0.06, 660, 0.06, "square", output); break;
      case "error": this.blip(t, 150, 0.15, "sawtooth", output); break;
      case "select": this.blip(t, 440, 0.04, "sine", output); break;
      case "open": this.whoosh(t, 800, 1600, output); break;
      case "close": this.whoosh(t, 1600, 800, output); break;
      case "cast": this.cast(t, output); break;
      case "explosion": this.explosion(t, output); break;
      case "chest": this.chest(t, output); break;
      case "drink": this.drink(t, output); break;
      case "equip": this.blip(t, 523, 0.05, "triangle", output); this.blip(t + 0.05, 784, 0.08, "triangle", output); break;
    }

    // Disconnect panner after sound finishes (cleanup)
    if (panner) {
      setTimeout(() => {
        try { panner!.disconnect(); } catch { /* already disconnected */ }
      }, 1000);
    }
  }

  private swordSwing(t: number, output: AudioNode) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);
    filter.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    noise.connect(filter);
    filter.connect(g);
    g.connect(output);
    noise.start(t);
    noise.stop(t + 0.15);
  }

  private thud(t: number, freq: number, dur: number, output: AudioNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(output);
    osc.start(t);
    osc.stop(t + dur);
  }

  private crit(t: number, output: AudioNode) {
    this.thud(t, 300, 0.1, output);
    this.blip(t, 1200, 0.08, "square", output);
    this.blip(t + 0.04, 1600, 0.06, "square", output);
  }

  private death(t: number, output: AudioNode) {
    if (!this.ctx || !this.noiseBuffer) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g);
    g.connect(output);
    osc.start(t);
    osc.stop(t + 0.4);
    // noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.2, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.connect(ng);
    ng.connect(output);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  private hurt(t: number, output: AudioNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g);
    g.connect(output);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private levelUp(t: number, output: AudioNode) {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => {
      this.blip(t + i * 0.08, f, 0.15, "triangle", output);
    });
    this.blip(t + 0.4, 1568, 0.3, "sine", output);
  }

  private fanfare(t: number, output: AudioNode) {
    const notes = [523, 523, 523, 659, 784];
    notes.forEach((f, i) => {
      this.blip(t + i * 0.1, f, 0.12, "square", output);
    });
    this.blip(t + 0.5, 1047, 0.3, "triangle", output);
  }

  private blip(t: number, freq: number, dur: number, type: OscillatorType = "square", output: AudioNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(output);
    osc.start(t);
    osc.stop(t + dur);
  }

  private whoosh(t: number, from: number, to: number, output: AudioNode) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + 0.2);
    filter.Q.value = 1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    noise.connect(filter);
    filter.connect(g);
    g.connect(output);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  private cast(t: number, output: AudioNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g);
    g.connect(output);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  private explosion(t: number, output: AudioNode) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    noise.connect(filter);
    filter.connect(g);
    g.connect(output);
    noise.start(t);
    noise.stop(t + 0.5);
    this.thud(t, 80, 0.4, output);
  }

  private chest(t: number, output: AudioNode) {
    this.thud(t, 150, 0.1, output);
    this.blip(t + 0.15, 880, 0.1, "square", output);
    this.blip(t + 0.25, 1100, 0.1, "square", output);
    this.blip(t + 0.35, 1320, 0.15, "triangle", output);
  }

  private drink(t: number, output: AudioNode) {
    for (let i = 0; i < 3; i++) {
      this.blip(t + i * 0.05, 400 + i * 100, 0.04, "sine", output);
    }
  }

  // --- Ambient music with zone crossfade ---

  startMusic() {
    this.init();
    if (!this.ctx || !this.musicGain || this.musicTimer !== null) return;
    const arpeggio = [0, 1, 2, 1, 0, 1, 2, 1];
    this.musicStep = 0;

    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.muted || !this.musicEnabled) return;
      const t = this.ctx.currentTime;

      // Zone crossfade logic
      if (this.crossfadeProgress < 1) {
        this.crossfadeProgress = Math.min(1, this.crossfadeProgress + (1 / (this.crossfadeDuration * 4)));
        if (this.crossfadeProgress >= 1) {
          this.currentZone = this.targetZone;
        }
      }

      // Boss crossfade logic
      const bossTarget = this.bossActive ? 1 : 0;
      const bossSpeed = this.bossActive ? 0.05 : 0.033; // 4s fade in, 6s fade out
      if (Math.abs(this.bossCrossfade - bossTarget) > 0.01) {
        this.bossCrossfade += (bossTarget - this.bossCrossfade) * bossSpeed;
      } else {
        this.bossCrossfade = bossTarget;
      }

      // Update gain nodes for crossfade
      const ambientVol = this.musicVolume * (1 - this.bossCrossfade * 0.8);
      if (this.musicGain) this.musicGain.gain.value = ambientVol;
      if (this.bossGain) this.bossGain.gain.value = this.musicVolume * this.bossCrossfade;

      // Play ambient note (from current or target zone during crossfade)
      const zone = this.crossfadeProgress < 0.5 ? this.currentZone : this.targetZone;
      const zDef = ZONE_MUSIC[zone];
      const chordIdx = Math.floor(this.musicStep / arpeggio.length) % zDef.chords.length;
      const noteIdx = arpeggio[this.musicStep % arpeggio.length];
      const freq = zDef.chords[chordIdx][noteIdx];

      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + zDef.stepDur * 0.9);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(t);
      osc.stop(t + zDef.stepDur);

      // Bass note on chord change
      if (this.musicStep % arpeggio.length === 0) {
        const bass = zDef.chords[chordIdx][0] / 2 * zDef.bassMult;
        const bosc = this.ctx.createOscillator();
        bosc.type = "sine";
        bosc.frequency.value = bass;
        const bg = this.ctx.createGain();
        bg.gain.setValueAtTime(0, t);
        bg.gain.linearRampToValueAtTime(0.15, t + 0.05);
        bg.gain.exponentialRampToValueAtTime(0.001, t + zDef.stepDur * arpeggio.length);
        bosc.connect(bg);
        bg.connect(this.musicGain!);
        bosc.start(t);
        bosc.stop(t + zDef.stepDur * arpeggio.length);
      }

      this.musicStep++;
    }, 250); // base tick rate
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audio = new AudioEngine();

// Hook for components to play sounds
export function playSound(name: SoundName, position?: [number, number, number]) {
  audio.resume();
  audio.play(name, position);
}

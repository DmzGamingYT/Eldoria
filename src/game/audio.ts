"use client";

// Procedural sound effects using the Web Audio API.
// No external assets needed — all sounds are synthesized.
// Includes a simple ambient music loop with arpeggiated chords.

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

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  muted = false;
  musicEnabled = true;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.18;
      this.musicGain.connect(this.masterGain);
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

  setMuted(m: boolean) {
    this.muted = m;
    if (this.masterGain) {
      this.masterGain.gain.value = m ? 0 : 0.7;
    }
  }

  setMusicEnabled(e: boolean) {
    this.musicEnabled = e;
    if (e) this.startMusic();
    else this.stopMusic();
  }

  // --- SFX ---
  play(name: SoundName) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case "attack": this.swordSwing(t); break;
      case "hit": this.thud(t, 200, 0.12); break;
      case "crit": this.crit(t); break;
      case "enemyDeath": this.death(t); break;
      case "playerHurt": this.hurt(t); break;
      case "levelUp": this.levelUp(t); break;
      case "pickup": this.blip(t, 880, 0.08, "square"); break;
      case "questComplete": this.fanfare(t); break;
      case "buy": this.blip(t, 660, 0.06, "square"); this.blip(t + 0.06, 880, 0.06, "square"); break;
      case "sell": this.blip(t, 880, 0.06, "square"); this.blip(t + 0.06, 660, 0.06, "square"); break;
      case "error": this.blip(t, 150, 0.15, "sawtooth"); break;
      case "select": this.blip(t, 440, 0.04, "sine"); break;
      case "open": this.whoosh(t, 800, 1600); break;
      case "close": this.whoosh(t, 1600, 800); break;
      case "cast": this.cast(t); break;
      case "explosion": this.explosion(t); break;
      case "chest": this.chest(t); break;
      case "drink": this.drink(t); break;
      case "equip": this.blip(t, 523, 0.05, "triangle"); this.blip(t + 0.05, 784, 0.08, "triangle"); break;
    }
  }

  private swordSwing(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    noise.buffer = buf;
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
    g.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.15);
  }

  private thud(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private crit(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    this.thud(t, 300, 0.1);
    this.blip(t, 1200, 0.08, "square");
    this.blip(t + 0.04, 1600, 0.06, "square");
  }

  private death(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
    // noise burst
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.2, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.connect(ng);
    ng.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  private hurt(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private levelUp(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => {
      this.blip(t + i * 0.08, f, 0.15, "triangle");
    });
    // shimmer
    this.blip(t + 0.4, 1568, 0.3, "sine");
  }

  private fanfare(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const notes = [523, 523, 523, 659, 784];
    notes.forEach((f, i) => {
      this.blip(t + i * 0.1, f, 0.12, "square");
    });
    this.blip(t + 0.5, 1047, 0.3, "triangle");
  }

  private blip(t: number, freq: number, dur: number, type: OscillatorType = "square") {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private whoosh(t: number, from: number, to: number) {
    if (!this.ctx || !this.sfxGain) return;
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    noise.buffer = buf;
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
    g.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  private cast(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  private explosion(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.5);
    // low boom
    this.thud(t, 80, 0.4);
  }

  private chest(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    this.thud(t, 150, 0.1);
    this.blip(t + 0.15, 880, 0.1, "square");
    this.blip(t + 0.25, 1100, 0.1, "square");
    this.blip(t + 0.35, 1320, 0.15, "triangle");
  }

  private drink(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    for (let i = 0; i < 3; i++) {
      this.blip(t + i * 0.05, 400 + i * 100, 0.04, "sine");
    }
  }

  // --- Ambient music ---
  startMusic() {
    this.init();
    if (!this.ctx || !this.musicGain || this.musicTimer !== null) return;
    // Fantasy chord progression (Am - F - C - G)
    const chords = [
      [220, 262, 330], // Am
      [175, 220, 262], // F
      [262, 330, 392], // C
      [196, 247, 294], // G
    ];
    const arpeggio = [0, 1, 2, 1, 0, 1, 2, 1];
    const stepDur = 0.25;
    this.musicStep = 0;
    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.muted || !this.musicEnabled) return;
      const t = this.ctx.currentTime;
      const chordIdx = Math.floor(this.musicStep / arpeggio.length) % chords.length;
      const noteIdx = arpeggio[this.musicStep % arpeggio.length];
      const freq = chords[chordIdx][noteIdx];
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + stepDur * 0.9);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + stepDur);
      // bass note on chord change
      if (this.musicStep % arpeggio.length === 0) {
        const bass = chords[chordIdx][0] / 2;
        const bosc = this.ctx.createOscillator();
        bosc.type = "sine";
        bosc.frequency.value = bass;
        const bg = this.ctx.createGain();
        bg.gain.setValueAtTime(0, t);
        bg.gain.linearRampToValueAtTime(0.15, t + 0.05);
        bg.gain.exponentialRampToValueAtTime(0.001, t + stepDur * arpeggio.length);
        bosc.connect(bg);
        bg.connect(this.musicGain);
        bosc.start(t);
        bosc.stop(t + stepDur * arpeggio.length);
      }
      this.musicStep++;
    }, stepDur * 1000);
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
export function playSound(name: SoundName) {
  audio.resume();
  audio.play(name);
}

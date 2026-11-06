// Motor de audio 100% procedural: música original de aventura y efectos infantiles.
// No usa archivos de audio ni melodías de terceros.

const BARS = [
  { chord: ['D3', 'F3', 'A3'], bass: ['D2', 'D2', 'A2', 'D2', 'F2', 'E2'], lead: ['A3', 'D4', 'E4', 'F4', 'E4', 'D4'] },
  { chord: ['Bb2', 'D3', 'F3'], bass: ['Bb1', 'Bb1', 'F2', 'Bb1', 'D2', 'C2'], lead: ['A3', 'F4', 'E4', 'D4', 'C#4', 'A3'] },
  { chord: ['G2', 'Bb2', 'D3'], bass: ['G1', 'G1', 'D2', 'G1', 'Bb1', 'A1'], lead: ['D4', 'F4', 'G4', 'A4', 'G4', 'F4'] },
  { chord: ['A2', 'C#3', 'E3'], bass: ['A1', 'A1', 'E2', 'A1', 'C#2', 'E2'], lead: ['E4', 'D4', 'C#4', 'D4', null, null] },
  { chord: ['D3', 'F3', 'A3'], bass: ['D2', 'D2', 'A2', 'D2', 'F2', 'E2'], lead: ['A4', 'G4', 'F4', 'E4', 'D4', 'F4'] },
  { chord: ['A2', 'C#3', 'E3'], bass: ['A1', 'A1', 'E2', 'A1', 'C#2', 'A1'], lead: ['E4', 'C#4', 'A3', null, null, null] },
  { chord: ['Bb2', 'D3', 'F3'], bass: ['Bb1', 'Bb1', 'F2', 'Bb1', 'A1', 'G1'], lead: ['D4', 'F4', 'A4', 'G4', 'F4', 'E4'] },
  { chord: ['D3', 'F3', 'A3'], bass: ['D2', 'D2', 'A2', 'D2', 'D2', null], lead: ['D4', null, null, null, null, null] },
];

const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const freq = (name) => {
  const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(name);
  if (!m) return 440;
  const semi = NOTE[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  return 440 * Math.pow(2, (semi - 69) / 12);
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.musicPlaying = false;
    this.bar = 0;
    this.barDur = 1.8;
    this.nextBarTime = 0;
    this.timer = null;
    this.step = 0;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.75;
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.master.connect(this.compressor).connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.22;
    this.musicBus.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(this.master);

    this.reverb = this.ctx.createConvolver();
    const len = Math.floor(this.ctx.sampleRate * 1.9);
    const ir = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
    }
    this.reverb.buffer = ir;
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.32;
    this.reverb.connect(this.reverbGain).connect(this.master);
  }

  async unlock() {
    try {
      this.init();
    } catch (e) {
      return;
    }
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch (e) { /* silencio */ }
    }
    if (this.musicEnabled && !this.musicPlaying) this.startMusic();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.75 : 0;
    if (on) this.unlock();
  }

  startMusic() {
    if (!this.ctx || !this.musicEnabled || this.musicPlaying) return;
    this.musicPlaying = true;
    this.bar = 0;
    this.nextBarTime = this.ctx.currentTime + 0.15;
    this.timer = window.setInterval(() => this._schedule(), 60);
    this._schedule();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  setMusic(on) {
    this.musicEnabled = on;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  _schedule() {
    if (!this.ctx || !this.musicPlaying) return;
    while (this.nextBarTime < this.ctx.currentTime + 0.5) {
      this._playBar(this.bar, this.nextBarTime);
      this.nextBarTime += this.barDur;
      this.bar = (this.bar + 1) % BARS.length;
    }
  }

  _playBar(index, time) {
    const bar = BARS[index];
    const ctx = this.ctx;
    const eighth = this.barDur / 6;

    // Cuerdas: acorde sostenido
    bar.chord.forEach((n, i) => this._strings(freq(n), time + i * 0.02, this.barDur * 0.98, 0.05));

    // Bajo: ostinato de aventura
    bar.bass.forEach((n, i) => {
      if (!n) return;
      this._pluck(freq(n), time + i * eighth, 0.32, 0.14, 'triangle');
    });

    // Melodía: cuerno suave
    bar.lead.forEach((n, i) => {
      if (!n) return;
      this._horn(freq(n), time + i * eighth, 0.4, 0.055);
    });

    // Percusión
    this._drum(time, 0.16, 108);
    this._drum(time + 3 * eighth, 0.11, 96);
    if (index === 3 || index === 7) this._drum(time + 3.5 * eighth, 0.1, 84);
    for (let i = 0; i < 6; i++) this._shaker(time + i * eighth + 0.02, 0.018);

    // Campanilla cada 4 compases
    if (index % 4 === 0) {
      this._bell(freq(bar.chord[2]) * 2, time + 2.5 * eighth, 0.16);
    }
  }

  _osc(type, f, t, dur, gain, filterFreq, attack = 0.01, dest = this.musicBus) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(filterFreq, t);
    filt.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filt).connect(g);
    g.connect(dest);
    g.connect(this.reverb);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    return { osc, g, filt };
  }

  _strings(f, t, dur, gain) {
    if (!this.ctx) return;
    const o = this._osc('sawtooth', f, t, dur, gain, 820, 0.28);
    if (!o) return;
    o.osc.detune.value = -5;
    this._osc('sawtooth', f * 1.004, t, dur, gain * 0.55, 760, 0.34);
  }

  _horn(f, t, dur, gain) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, t);
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.2;
    const vibGain = ctx.createGain();
    vibGain.gain.setValueAtTime(0, t);
    vibGain.gain.linearRampToValueAtTime(f * 0.006, t + 0.22);
    vib.connect(vibGain).connect(osc.frequency);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(900, t);
    filt.frequency.linearRampToValueAtTime(1700, t + 0.12);
    filt.frequency.exponentialRampToValueAtTime(820, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.045);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filt).connect(g);
    g.connect(this.musicBus);
    g.connect(this.reverb);
    osc.start(t); vib.start(t);
    osc.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
    this._osc('triangle', f / 2, t, dur, gain * 0.5, 700, 0.05);
  }

  _pluck(f, t, dur, gain, type = 'triangle') {
    this._osc(type, f, t, dur, gain, 1100, 0.008);
  }

  _drum(t, gain, startF) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(g).connect(this.musicBus);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  _noise(dur) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * Math.max(dur, 0.02));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  _shaker(t, gain) {
    if (!this.ctx) return;
    const src = this._noise(0.07);
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 6800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    src.connect(filt).connect(g).connect(this.musicBus);
    src.start(t);
  }

  _bell(f, t, gain) {
    this._osc('sine', f, t, 0.7, gain, 4000, 0.005, this.musicBus);
    this._osc('sine', f * 2.02, t, 0.45, gain * 0.4, 5000, 0.005, this.musicBus);
  }

  _sfx(notes, opts = {}) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.001;
    notes.forEach((n, i) => {
      const t = t0 + (n.at ?? i * 0.06);
      const osc = ctx.createOscillator();
      osc.type = n.type || 'sine';
      osc.frequency.setValueAtTime(n.f, t);
      if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t + (n.dur || 0.14));
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(n.gain ?? 0.14, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (n.dur || 0.22));
      const filt = ctx.createBiquadFilter();
      filt.type = n.filter || 'lowpass';
      filt.frequency.value = n.filterFreq || 5200;
      osc.connect(filt).connect(g);
      g.connect(this.sfxBus);
      g.connect(this.reverb);
      osc.start(t);
      osc.stop(t + (n.dur || 0.22) + 0.05);
    });
    if (opts.noise) this._sfxNoise(t0, opts.noise);
  }

  _sfxNoise(t, { dur = 0.25, gain = 0.12, from = 400, to = 3200, type = 'bandpass' } = {}) {
    const ctx = this.ctx;
    const src = this._noise(dur);
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(from, t);
    filt.frequency.exponentialRampToValueAtTime(to, t + dur);
    filt.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g);
    g.connect(this.sfxBus);
    src.start(t);
  }

  tap() {
    this._sfx([
      { f: 660, to: 880, dur: 0.09, type: 'sine', gain: 0.1 },
      { f: 1320, to: 1560, dur: 0.07, type: 'triangle', gain: 0.035, at: 0.02 },
    ]);
  }

  hover() {
    this._sfx([{ f: 1180, to: 1320, dur: 0.05, gain: 0.022, type: 'sine' }]);
  }

  pop() {
    this._sfx([
      { f: 420, to: 900, dur: 0.13, gain: 0.13, type: 'triangle' },
      { f: 1600, dur: 0.1, gain: 0.05, at: 0.04, type: 'sine' },
    ]);
  }

  whoosh() {
    this._sfx([], { noise: { dur: 0.45, gain: 0.09, from: 300, to: 2400 } });
  }

  chime() {
    this._sfx([
      { f: 660, dur: 0.5, gain: 0.07, type: 'sine', at: 0 },
      { f: 880, dur: 0.5, gain: 0.06, type: 'sine', at: 0.07 },
      { f: 1320, dur: 0.6, gain: 0.045, type: 'sine', at: 0.14 },
    ]);
  }

  coin() {
    this._sfx([
      { f: 988, dur: 0.1, gain: 0.08, type: 'square' },
      { f: 1319, dur: 0.25, gain: 0.06, type: 'square', at: 0.08 },
    ]);
  }

  rise() {
    this._sfx([{ f: 180, to: 720, dur: 0.6, gain: 0.07, type: 'sawtooth', filterFreq: 1200 }]);
  }

  stamp() {
    this._sfx([
      { f: 140, to: 40, dur: 0.5, gain: 0.4, type: 'sine' },
      { f: 620, to: 180, dur: 0.14, gain: 0.12, type: 'square' },
    ], { noise: { dur: 0.22, gain: 0.2, from: 1800, to: 300, type: 'lowpass' } });
  }

  success() {
    [523, 659, 784, 1047].forEach((f, i) => {
      this._sfx([{ f, dur: 0.45, gain: 0.06, at: i * 0.085, type: 'triangle' }]);
    });
  }

  medal() {
    this._sfx([
      { f: 1047, dur: 0.7, gain: 0.07, type: 'sine' },
      { f: 1319, dur: 0.9, gain: 0.05, type: 'sine', at: 0.1 },
      { f: 1568, dur: 1.1, gain: 0.035, type: 'sine', at: 0.2 },
    ]);
  }

  sparkle() {
    [1568, 1976, 2349].forEach((f, i) => {
      this._sfx([{ f, dur: 0.25, gain: 0.03, at: i * 0.05, type: 'sine' }]);
    });
  }

  voteTone(v) {
    if (v === 'y') this._sfx([{ f: 523, dur: 0.28, gain: 0.08, type: 'triangle' }, { f: 784, dur: 0.3, gain: 0.05, at: 0.06 }]);
    else if (v === 'n') this._sfx([{ f: 330, dur: 0.3, gain: 0.08, type: 'triangle' }, { f: 247, dur: 0.35, gain: 0.05, at: 0.07 }]);
    else this._sfx([{ f: 440, dur: 0.3, gain: 0.05, type: 'sine' }, { f: 440, dur: 0.3, gain: 0.035, at: 0.09 }]);
  }
}

export const audio = new AudioEngine();

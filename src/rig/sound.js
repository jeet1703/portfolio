// All sound is synthesised with Web Audio; no audio files.
import { rig } from './bus';

const S = { ctx: null, enabled: true, master: null, noise: null, zip: null, hum: null };
try { if (localStorage.getItem('pj-sound') === 'off') S.enabled = false; } catch { /* storage blocked */ }

S.init = function () {
  if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return true; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  const c = this.ctx = new AC();
  this.master = c.createGain(); this.master.gain.value = this.enabled ? 0.7 : 0; this.master.connect(c.destination);
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  this.noise = b;

  // continuous "cable unspooling" layer, gain follows scroll speed
  const n = c.createBufferSource(); n.buffer = b; n.loop = true;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.4;
  const g = c.createGain(); g.gain.value = 0;
  n.connect(f).connect(g).connect(this.master); n.start();
  this.zip = { g, f };

  if (rig.powered) this.humStart(true);
  return true;
};

S.burst = function ({ dur = .03, type = 'highpass', freq = 2000, q = .7, gain = .2, when = 0, sweep = null }) {
  if (!this.ctx) return; const c = this.ctx, t = c.currentTime + when;
  const s = c.createBufferSource(); s.buffer = this.noise;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  s.connect(f).connect(g).connect(this.master); s.start(t, Math.random() * 1.5); s.stop(t + dur + .02);
};
S.tone = function ({ freq = 440, type = 'sine', dur = .1, gain = .1, when = 0, to = null, attack = .004 }) {
  if (!this.ctx) return; const c = this.ctx, t = c.currentTime + when;
  const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + .02);
};
S.key = function (kind) { // mechanical key: bottom-out clack + spring ping + release
  const p = kind === 'mod' ? .75 : kind === 'hot' ? .9 : 1, r = .9 + Math.random() * .2;
  this.burst({ dur: .014, type: 'highpass', freq: 4200 * r, gain: .28 });
  this.burst({ dur: .04, type: 'bandpass', freq: 1700 * p * r, q: 3, gain: .22 });
  this.tone({ freq: 330 * p * r, type: 'triangle', dur: .05, gain: .07, to: 200 * p });
  this.burst({ dur: .02, type: 'bandpass', freq: 2600 * r, q: 4, gain: .08, when: .07 });
};
S.click = function () { this.burst({ dur: .009, type: 'highpass', freq: 5200, gain: .32 }); this.tone({ freq: 2300, type: 'square', dur: .012, gain: .02 }); this.burst({ dur: .012, type: 'highpass', freq: 4000, gain: .1, when: .06 }); };
S.thunk = function () { this.tone({ freq: 140, type: 'sine', dur: .22, gain: .55, to: 42 }); this.burst({ dur: .07, type: 'lowpass', freq: 1100, gain: .35 }); this.burst({ dur: .015, type: 'highpass', freq: 3000, gain: .2 }); };
S.beep = function (when = 0) { this.tone({ freq: 1000, type: 'square', dur: .16, gain: .045, when }); };
S.tick = function () { this.tone({ freq: 1700 + Math.random() * 200, type: 'square', dur: .025, gain: .022 }); };
S.whoosh = function (dir) { this.burst({ dur: .22, type: 'bandpass', freq: dir > 0 ? 500 : 1800, sweep: dir > 0 ? 2200 : 420, q: 1.1, gain: .12 }); };
S.zap = function () { this.burst({ dur: .14, type: 'bandpass', freq: 3200, sweep: 500, q: 2.5, gain: .22 }); this.tone({ freq: 110, type: 'square', dur: .09, gain: .05 }); this.tone({ freq: 880, dur: .18, gain: .05, when: .06, to: 1320 }); };
S.connect = function () { this.thunk(); this.tone({ freq: 660, dur: .18, gain: .08, when: .12 }); this.tone({ freq: 990, dur: .32, gain: .08, when: .24 }); };

// called every frame with how many px of cable were (un)spooled
S.spool = function (v) {
  if (!this.zip) return; const t = this.ctx.currentTime; v = Math.abs(v);
  this.zip.g.gain.setTargetAtTime(Math.min(.11, v * .006), t, .06);
  this.zip.f.frequency.setTargetAtTime(700 + Math.min(2600, v * 55), t, .06);
};

S.humStart = function (quiet) {
  if (!this.ctx || this.hum) return; const c = this.ctx, t = c.currentTime;
  const out = c.createGain(); out.gain.setValueAtTime(.0001, t); out.gain.exponentialRampToValueAtTime(.35, t + .8); out.connect(this.master); // fan/hum kept quiet
  const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 100;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240;
  const g1 = c.createGain(); g1.gain.value = .016; o1.connect(lp).connect(g1).connect(out);
  const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 50; const g2 = c.createGain(); g2.gain.value = .022; o2.connect(g2).connect(out);
  const n = c.createBufferSource(); n.buffer = this.noise; n.loop = true;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .7; bp.frequency.setValueAtTime(quiet ? 520 : 160, t); bp.frequency.exponentialRampToValueAtTime(520, t + 1.6);
  const g3 = c.createGain(); g3.gain.setValueAtTime(quiet ? .008 : .0001, t); g3.gain.exponentialRampToValueAtTime(.028, t + 1.4); g3.gain.exponentialRampToValueAtTime(.008, t + 4.5);
  n.connect(bp).connect(g3).connect(out);
  o1.start(); o2.start(); n.start();
  this.hum = { out, bp, nodes: [o1, o2, n] };
};
S.humStop = function () {
  if (!this.hum) return; const c = this.ctx, t = c.currentTime, h = this.hum; this.hum = null;
  h.bp.frequency.setTargetAtTime(90, t, .35); h.out.gain.setTargetAtTime(.0001, t, .3);
  h.nodes.forEach(nd => { try { nd.stop(t + 1.6); } catch { /* already stopped */ } });
};
S.setEnabled = function (on) {
  this.enabled = on;
  try { localStorage.setItem('pj-sound', on ? 'on' : 'off'); } catch { /* storage blocked */ }
  if (on) this.init();
  if (this.master) this.master.gain.setTargetAtTime(on ? .7 : 0, this.ctx.currentTime, .05);
};

export default S;

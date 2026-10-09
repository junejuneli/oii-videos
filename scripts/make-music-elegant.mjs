// Synthesizes a calm, elegant bed (92 BPM, D major: Dmaj7 - Bm7 - Gmaj7 - A6):
// FM electric piano, soft string pad, round sub bass, a light brushed groove
// and glassy bells, all through a small stereo hall reverb. Suits product
// walkthroughs that will get a voice-over later.
// Usage: node scripts/make-music-elegant.mjs public/sfx/music.wav 52
import { writeFileSync } from "node:fs";

const out = process.argv[2] ?? "public/sfx/music.wav";
const seconds = Number(process.argv[3] ?? 52);
const SR = 44100;
const BPM = 92;
const beat = 60 / BPM;
const bar = beat * 4;
const N = Math.floor(seconds * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const add = (i, v, pan = 0, send = 0) => {
  if (i < 0 || i >= N) return;
  const l = v * (1 - pan) * 0.5 + v * 0.5;
  const r = v * (1 + pan) * 0.5 + v * 0.5;
  L[i] += l * 0.7;
  R[i] += r * 0.7;
  sendL[i] += l * send;
  sendR[i] += r * send;
};

const VOICINGS = [
  [57, 61, 62, 66], // Dmaj7
  [57, 59, 62, 66], // Bm7
  [55, 59, 62, 66], // Gmaj7
  [57, 61, 64, 66], // A6
];
const ROOTS = [38, 35, 43, 45];
const MELODY = [
  [78, 76, 74],
  [74, 73, 71],
  [74, 78, 79],
  [76, 73, 76],
];

// FM electric piano note.
const epiano = (t0, note, vel, len = 2.4, pan = 0) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < len * SR; j++) {
    const t = j / SR;
    const idx = 1.4 * Math.exp(-t * 3.5) + 0.25;
    const mod = Math.sin(2 * Math.PI * f * t) * idx;
    const body = Math.sin(2 * Math.PI * f * t + mod);
    const tine = Math.sin(2 * Math.PI * f * 4.0 * t) * 0.22 * Math.exp(-t * 7);
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 1.1) * Math.min(1, (len - t) / 0.3);
    const trem = 1 + 0.06 * Math.sin(2 * Math.PI * 4.5 * t);
    add(s0 + j, (body + tine) * env * trem * vel * 0.11, pan, 0.35);
  }
};

// Soft string pad held over a bar.
const pad = (t0, notes, len) => {
  const s0 = Math.floor(t0 * SR);
  notes.forEach((note, n) => {
    const f = midi(note);
    const lp = [0, 0];
    const phases = [0, 0, 0];
    const det = [0.996, 1, 1.004];
    for (let j = 0; j < len * SR; j++) {
      const t = j / SR;
      let raw = 0;
      for (let d = 0; d < 3; d++) {
        phases[d] += (f * det[d]) / SR;
        raw += 2 * (phases[d] - Math.floor(phases[d] + 0.5));
      }
      raw /= 3;
      lp[0] += 0.1 * (raw - lp[0]);
      lp[1] += 0.1 * (lp[0] - lp[1]);
      const env = Math.min(1, t / 1.2) * Math.min(1, (len - t) / 1.0);
      add(s0 + j, lp[1] * env * 0.04, n % 2 ? 0.5 : -0.5, 0.5);
    }
  });
};

const bass = (t0, note, len) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < len * SR; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.02) * Math.exp(-t * 0.8) * Math.min(1, (len - t) / 0.15);
    const v = Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(4 * Math.PI * f * t);
    add(s0 + j, v * env * 0.1, 0, 0.02);
  }
};

const kick = (t0) => {
  const s0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < 0.32 * SR; j++) {
    const t = j / SR;
    ph += (48 + 70 * Math.exp(-t * 28)) / SR;
    add(s0 + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) * 0.14, 0, 0.02);
  }
};

// Brushed snare / rim on 2 and 4: band-limited noise with a soft click.
const brush = (t0) => {
  const s0 = Math.floor(t0 * SR);
  let lp = 0;
  let hp = 0;
  for (let j = 0; j < 0.22 * SR; j++) {
    const t = j / SR;
    const n = rnd() * 2 - 1;
    lp += 0.22 * (n - lp);
    hp += 0.05 * (lp - hp);
    add(s0 + j, (lp - hp) * Math.min(1, t / 0.006) * Math.exp(-t * 16) * 0.04, 0.1, 0.3);
  }
};

const shaker = (t0, vel) => {
  const s0 = Math.floor(t0 * SR);
  let lp = 0;
  let lp2 = 0;
  for (let j = 0; j < 0.07 * SR; j++) {
    const t = j / SR;
    const n = rnd() * 2 - 1;
    lp += 0.45 * (n - lp); // soft top end
    lp2 += 0.08 * (lp - lp2); // remove the low rumble
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 45);
    add(s0 + j, (lp - lp2) * env * 0.012 * vel, 0.4, 0.15);
  }
};

const bell = (t0, note, vel) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < 2.2 * SR; j++) {
    const t = j / SR;
    const v =
      Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 4);
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 2.2);
    add(s0 + j, v * env * vel * 0.065, -0.3, 0.7);
  }
};

const bars = Math.ceil(seconds / bar);
for (let b = 0; b < bars; b++) {
  const t0 = b * bar;
  const c = b % 4;
  const v = VOICINGS[c];
  const intro = b < 2;
  const outro = b >= bars - 3;

  pad(t0, v, bar + 0.6);
  // Rolled chord on 1, top notes on 2&, lower pair on 4.
  v.forEach((n, k) => epiano(t0 + k * 0.028, n, 0.75 + rnd() * 0.15, 2.6, (k - 1.5) * 0.25));
  if (!intro) {
    [v[2], v[3]].forEach((n, k) => epiano(t0 + beat * 1.5 + k * 0.02, n, 0.5, 1.6, 0.3));
    [v[0], v[1]].forEach((n, k) => epiano(t0 + beat * 3 + k * 0.02, n, 0.45, 1.4, -0.3));
    bass(t0, ROOTS[c], beat * 2.6);
    bass(t0 + beat * 2.5, ROOTS[c], beat * 1.4);
  }
  if (!intro && !outro) {
    kick(t0);
    kick(t0 + beat * 2.5);
    brush(t0 + beat);
    brush(t0 + beat * 3);
    for (let k = 0; k < 4; k++) shaker(t0 + (k + 0.5) * beat + 0.02, 1);
  }
  if (b >= 2) MELODY[c].forEach((n, k) => bell(t0 + beat * (0.5 + k), n, 0.8 - k * 0.12));
}

// Small stereo hall: 4 damped combs + 2 allpasses per side.
const reverb = (input, offset) => {
  const outBuf = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0, lp: 0 }));
  const aps = [556, 441].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0 }));
  for (let n = 0; n < N; n++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.75 + c.lp * 0.25;
      c.buf[c.i] = input[n] * 0.12 + c.lp * 0.84;
      c.i = (c.i + 1) % c.d;
      acc += y;
    }
    for (const a of aps) {
      const y = a.buf[a.i];
      a.buf[a.i] = acc + y * 0.5;
      a.i = (a.i + 1) % a.d;
      acc = y - acc * 0.5;
    }
    outBuf[n] = acc;
  }
  return outBuf;
};
const wetL = reverb(sendL, 0);
const wetR = reverb(sendR, 23);

let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 1.2) * Math.min(1, (seconds - t) / 3);
  L[i] = Math.tanh((L[i] + wetL[i] * 0.9) * 1.1) * g;
  R[i] = Math.tanh((R[i] + wetR[i] * 0.9) * 1.1) * g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(out, buf);
console.log(`wrote ${out} (${seconds}s, ${BPM} BPM)`);

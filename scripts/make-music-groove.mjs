// Synthesizes an upbeat but polished chill-house bed (118 BPM, D major:
// Dmaj7 - Bm7 - Gmaj7 - A6). Four-on-the-floor kick with sidechain pumping,
// claps on 2 and 4, crisp 16th hats, off-beat bass, FM electric-piano stabs,
// a soft pad, a pluck arp and bells, through a small stereo hall reverb.
// Usage: node scripts/make-music-groove.mjs public/sfx/music.wav 52
import { writeFileSync } from "node:fs";

const out = process.argv[2] ?? "public/sfx/music.wav";
const seconds = Number(process.argv[3] ?? 52);
const SR = 44100;
const BPM = 118;
const beat = 60 / BPM;
const bar = beat * 4;
const N = Math.floor(seconds * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N);
const sendR = new Float32Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 23;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

// Sections by bar.
const bars = Math.ceil(seconds / bar);
const section = (b) => {
  if (b < 2) return "intro";
  if (b < 10) return "verse";
  if (b < 12) return "break";
  if (b < bars - 2) return "drop";
  return "outro";
};
const hasKick = (b) => ["verse", "drop"].includes(section(b));

// Sidechain: duck melodic layers right after every kick.
const duck = (t) => {
  const b = Math.floor(t / bar);
  if (!hasKick(b)) return 1;
  const inBeat = t % beat;
  return 1 - 0.55 * Math.exp(-inBeat * 14);
};

const add = (i, v, pan = 0, send = 0, sc = false) => {
  if (i < 0 || i >= N) return;
  const g = sc ? duck(i / SR) : 1;
  const l = v * g * (1 - pan * 0.6);
  const r = v * g * (1 + pan * 0.6);
  L[i] += l;
  R[i] += r;
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
  [78, 76, 74, 76],
  [74, 73, 71, 73],
  [74, 78, 79, 78],
  [76, 73, 76, 81],
];

const epiano = (t0, note, vel, len = 1.2, pan = 0) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < len * SR; j++) {
    const t = j / SR;
    const idx = 1.5 * Math.exp(-t * 5) + 0.3;
    const body = Math.sin(2 * Math.PI * f * t + Math.sin(2 * Math.PI * f * t) * idx);
    const tine = Math.sin(2 * Math.PI * f * 4 * t) * 0.38 * Math.exp(-t * 8);
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 2.2) * Math.min(1, (len - t) / 0.1);
    add(s0 + j, (body + tine) * env * vel * 0.13, pan, 0.3, true);
  }
};

const pad = (t0, notes, len) => {
  const s0 = Math.floor(t0 * SR);
  notes.forEach((note, n) => {
    const f = midi(note);
    const lp = [0, 0];
    const ph = [0, 0, 0];
    const det = [0.995, 1, 1.005];
    for (let j = 0; j < len * SR; j++) {
      const t = j / SR;
      let raw = 0;
      for (let d = 0; d < 3; d++) {
        ph[d] += (f * det[d]) / SR;
        raw += 2 * (ph[d] - Math.floor(ph[d] + 0.5));
      }
      lp[0] += 0.09 * (raw / 3 - lp[0]);
      lp[1] += 0.09 * (lp[0] - lp[1]);
      const env = Math.min(1, t / 0.6) * Math.min(1, (len - t) / 0.5);
      add(s0 + j, lp[1] * env * 0.035, n % 2 ? 0.6 : -0.6, 0.4, true);
    }
  });
};

const bassNote = (t0, note, len) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  let ph = 0;
  let lp = 0;
  for (let j = 0; j < len * SR; j++) {
    const t = j / SR;
    ph += f / SR;
    const saw = 2 * (ph - Math.floor(ph + 0.5));
    lp += 0.04 * (saw - lp);
    const v = Math.sin(2 * Math.PI * ph) * 0.8 + lp * 0.6;
    const env = Math.min(1, t / 0.008) * Math.min(1, (len - t) / 0.03);
    add(s0 + j, v * env * 0.085, 0, 0, true);
  }
};

const kick = (t0) => {
  const s0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < 0.38 * SR; j++) {
    const t = j / SR;
    ph += (46 + 110 * Math.exp(-t * 35)) / SR;
    const body = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 7);
    const click = t < 0.004 ? (rnd() * 2 - 1) * 0.3 * (1 - t / 0.004) : 0;
    add(s0 + j, (body + click) * 0.3, 0, 0.01);
  }
};

const clap = (t0) => {
  const s0 = Math.floor(t0 * SR);
  let lp = 0;
  let hp = 0;
  for (let j = 0; j < 0.25 * SR; j++) {
    const t = j / SR;
    const n = rnd() * 2 - 1;
    lp += 0.6 * (n - lp);
    hp += 0.12 * (lp - hp);
    // Three quick bursts then a short tail.
    const bursts = [0, 0.009, 0.018].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 120) : 0), 0);
    const env = bursts * 0.5 + Math.exp(-t * 14) * 0.6;
    add(s0 + j, (lp - hp) * env * 0.24, 0.05, 0.35);
  }
};

const hat = (t0, vel, open = false) => {
  const s0 = Math.floor(t0 * SR);
  let prev = 0;
  let lp = 0;
  const len = open ? 0.12 : 0.045;
  for (let j = 0; j < len * SR; j++) {
    const t = j / SR;
    const n = rnd() * 2 - 1;
    const hp = n - prev;
    prev = n;
    lp += 0.55 * (hp - lp); // tame the very top
    const env = Math.exp(-t * (open ? 28 : 90)) * (open ? 0.4 : 1);
    add(s0 + j, lp * env * vel * 0.2, open ? -0.35 : 0.3, 0.05);
  }
};

const pluck = (t0, note, vel) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  let ph = 0;
  let lp = 0;
  for (let j = 0; j < 0.3 * SR; j++) {
    const t = j / SR;
    ph += f / SR;
    const sq = ph % 1 < 0.5 ? 1 : -1;
    lp += (0.1 + 0.5 * Math.exp(-t * 20)) * (sq - lp);
    add(s0 + j, lp * Math.exp(-t * 12) * vel * 0.075, (rnd() - 0.5) * 0.8, 0.3, true);
  }
};

const bell = (t0, note, vel) => {
  const f = midi(note);
  const s0 = Math.floor(t0 * SR);
  for (let j = 0; j < 1.6 * SR; j++) {
    const t = j / SR;
    const v = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 5);
    add(s0 + j, v * Math.min(1, t / 0.003) * Math.exp(-t * 2.8) * vel * 0.07, -0.3, 0.6);
  }
};

const riser = (t0, len) => {
  const s0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < len * SR; j++) {
    const p = j / (len * SR);
    lp += (0.02 + 0.4 * p * p) * (rnd() * 2 - 1 - lp);
    add(s0 + j, lp * p * p * 0.12, 0, 0.3);
  }
};

for (let b = 0; b < bars; b++) {
  const t0 = b * bar;
  const c = b % 4;
  const v = VOICINGS[c];
  const sec = section(b);

  pad(t0, v, bar + 0.3);

  // Piano stabs: 1, 2&, 4 (whole chord rolled on 1 in intro/break/outro).
  if (sec === "intro" || sec === "break" || sec === "outro") {
    v.forEach((n, k) => epiano(t0 + k * 0.025, n, 0.8, bar, (k - 1.5) * 0.3));
  } else {
    v.forEach((n, k) => epiano(t0 + k * 0.012, n, 0.75, 0.5, (k - 1.5) * 0.3));
    v.forEach((n, k) => epiano(t0 + beat * 1.5 + k * 0.012, n, 0.55, 0.35, (k - 1.5) * 0.3));
    v.forEach((n, k) => epiano(t0 + beat * 3 + k * 0.012, n, 0.6, 0.45, (k - 1.5) * 0.3));
  }

  if (hasKick(b)) {
    for (let k = 0; k < 4; k++) {
      kick(t0 + k * beat);
      bassNote(t0 + (k + 0.5) * beat, ROOTS[c] + (k === 3 && c === 3 ? 2 : 0), beat * 0.42);
    }
    clap(t0 + beat);
    clap(t0 + beat * 3);
  }
  // Hats: 16ths from the verse on, open hat on every off-beat in the drop.
  if (sec !== "outro") {
    for (let k = 0; k < 16; k++) {
      const onEighth = k % 2 === 0;
      if (sec === "intro" && !onEighth) continue;
      hat(t0 + (k * beat) / 4, onEighth ? 0.9 : 0.5 + rnd() * 0.2);
    }
  }
  if (sec === "drop") for (let k = 0; k < 4; k++) hat(t0 + (k + 0.5) * beat, 0.6, true);

  // Pluck arp drives the drop.
  if (sec === "drop") {
    const arp = [v[0], v[2], v[3], v[1] + 12, v[3], v[2], v[0] + 12, v[3]];
    for (let k = 0; k < 16; k++) pluck(t0 + (k * beat) / 4, arp[k % 8] + 12, k % 4 === 0 ? 1 : 0.7);
  }
  if (sec !== "intro") MELODY[c].forEach((n, k) => bell(t0 + beat * k + beat * 0.5, n, 0.8 - k * 0.1));
  if (sec === "break" && b === 11) riser(t0, bar);
}

const reverb = (input, offset) => {
  const outBuf = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0, lp: 0 }));
  const aps = [556, 441].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0 }));
  for (let n = 0; n < N; n++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.7 + c.lp * 0.3;
      c.buf[c.i] = input[n] * 0.12 + c.lp * 0.8;
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
  const g = Math.min(1, t / 0.4) * Math.min(1, (seconds - t) / 2.5);
  L[i] = Math.tanh((L[i] + wetL[i] * 0.8) * 1.15) * g;
  R[i] = Math.tanh((R[i] + wetR[i] * 0.8) * 1.15) * g;
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
console.log(`wrote ${out} (${seconds}s, ${BPM} BPM, ${bars} bars)`);

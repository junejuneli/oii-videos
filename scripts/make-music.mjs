// Synthesizes an upbeat 128 BPM electronic bed (Am - F - C - G) as a WAV.
// Usage: node scripts/make-music.mjs public/sfx/music.wav 64
import { writeFileSync } from "node:fs";

const out = process.argv[2] ?? "public/sfx/music.wav";
const seconds = Number(process.argv[3] ?? 64);
const SR = 44100;
const BPM = 128;
const beat = 60 / BPM;
const bar = beat * 4;
const N = Math.floor(seconds * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
// Am, F, C, G voiced around A3.
const CHORDS = [
  [57, 60, 64, 69],
  [53, 57, 60, 65],
  [55, 60, 64, 67],
  [55, 59, 62, 67],
];
const ROOTS = [45, 41, 48, 43];

let seed = 7;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));

// Sections (in bars): 0-1 intro (no kick), 2-5 groove, 6-7 lift, then loop groove.
const sectionAt = (b) => (b < 2 ? "intro" : (b % 8) >= 6 ? "lift" : "groove");

// Sidechain envelope: ducks everything melodic on each kick.
const duck = (t) => {
  const p = (t % beat) / beat;
  return 0.35 + 0.65 * Math.min(1, p * 3.2);
};

const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - Math.max(0, pan));
  R[i] += v * (1 + Math.min(0, pan));
};

const totalBars = Math.ceil(seconds / bar);
for (let b = 0; b < totalBars; b++) {
  const sec = sectionAt(b);
  const t0 = b * bar;
  const chord = CHORDS[b % 4];
  const root = ROOTS[b % 4];

  // Kick: four on the floor.
  if (sec !== "intro") {
    for (let k = 0; k < 4; k++) {
      const s0 = Math.floor((t0 + k * beat) * SR);
      let ph = 0;
      for (let j = 0; j < SR * 0.35; j++) {
        const t = j / SR;
        const f = 45 + 110 * Math.exp(-t * 32);
        ph += f / SR;
        add(s0 + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 7.5) * 0.95);
      }
    }
  }

  // Clap on 2 and 4.
  if (sec !== "intro") {
    for (const k of [1, 3]) {
      const s0 = Math.floor((t0 + k * beat) * SR);
      let lp = 0;
      for (let j = 0; j < SR * 0.22; j++) {
        const t = j / SR;
        const n = noise();
        lp += 0.35 * (n - lp);
        const env = Math.exp(-t * 18) * (t < 0.012 ? 0.6 + 0.4 * Math.sin(t * 900) : 1);
        add(s0 + j, (n - lp) * env * 0.32, 0.1);
      }
    }
  }

  // Hats: closed on every 16th, open on off-beats.
  for (let k = 0; k < 16; k++) {
    if (sec === "intro" && k % 2) continue;
    const s0 = Math.floor((t0 + (k * beat) / 4) * SR);
    const open = k % 4 === 2;
    const len = open ? 0.16 : 0.04;
    let prev = 0;
    const vel = open ? 0.12 : k % 2 ? 0.05 : 0.08;
    for (let j = 0; j < SR * len; j++) {
      const n = noise();
      const hp = n - prev;
      prev = n;
      add(s0 + j, hp * Math.exp((-j / SR) * (open ? 22 : 90)) * vel, -0.25);
    }
  }

  // Bass: off-beat 8ths on the root with a short pluck.
  if (sec !== "intro") {
    for (let k = 0; k < 8; k++) {
      if (k % 2 === 0) continue;
      const s0 = Math.floor((t0 + (k * beat) / 2) * SR);
      const f = midi(root - 12);
      let ph = 0;
      let lp = 0;
      for (let j = 0; j < SR * 0.2; j++) {
        const t = j / SR;
        ph += f / SR;
        const raw = saw(ph) * 0.6 + Math.sin(2 * Math.PI * ph) * 0.6;
        const cut = 0.05 + 0.25 * Math.exp(-t * 20);
        lp += cut * (raw - lp);
        add(s0 + j, lp * Math.exp(-t * 9) * 0.55);
      }
    }
  }

  // Chord pad: detuned saws, filtered, sidechained.
  {
    const s0 = Math.floor(t0 * SR);
    const len = Math.floor(bar * SR);
    const phs = chord.map(() => [0, 0.33, 0.66]);
    let lpL = 0;
    let lpR = 0;
    const open = sec === "intro" ? 0.03 : sec === "lift" ? 0.09 : 0.06;
    for (let j = 0; j < len; j++) {
      const t = t0 + j / SR;
      let vL = 0;
      let vR = 0;
      chord.forEach((m, ci) => {
        const f = midi(m);
        [-0.12, 0, 0.12].forEach((d, di) => {
          phs[ci][di] += (f * Math.pow(2, d / 12)) / SR;
          const v = saw(phs[ci][di]);
          if (di === 0) vL += v;
          else if (di === 2) vR += v;
          else {
            vL += v * 0.5;
            vR += v * 0.5;
          }
        });
      });
      lpL += open * (vL - lpL);
      lpR += open * (vR - lpR);
      const g = 0.035 * (sec === "intro" ? 1 : duck(t));
      if (s0 + j < N) {
        L[s0 + j] += lpL * g;
        R[s0 + j] += lpR * g;
      }
    }
  }

  // Pluck arpeggio in 16ths through the groove and lift.
  if (sec !== "intro") {
    for (let k = 0; k < 16; k++) {
      const note = chord[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12;
      const s0 = Math.floor((t0 + (k * beat) / 4) * SR);
      const f = midi(note);
      let ph = 0;
      let lp = 0;
      for (let j = 0; j < SR * 0.18; j++) {
        const t = j / SR;
        ph += f / SR;
        const raw = saw(ph) * 0.5 + (ph % 1 < 0.5 ? 0.35 : -0.35);
        lp += (0.08 + 0.4 * Math.exp(-t * 30)) * (raw - lp);
        const g = (sec === "lift" ? 0.075 : 0.055) * Math.exp(-t * 14) * duck(t0 + (k * beat) / 4 + t);
        add(s0 + j, lp * g, k % 2 ? 0.35 : -0.35);
      }
    }
  }

  // Riser into each lift.
  if ((b % 8) === 5) {
    const s0 = Math.floor(t0 * SR);
    let lp = 0;
    for (let j = 0; j < bar * SR; j++) {
      const p = j / (bar * SR);
      const n = noise();
      lp += (0.02 + 0.5 * p * p) * (n - lp);
      add(s0 + j, lp * p * p * 0.18);
    }
  }
}

// Fade in/out, soft clip, normalize.
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 0.6) * Math.min(1, (seconds - t) / 1.5);
  L[i] = Math.tanh(L[i] * 1.2) * g;
  R[i] = Math.tanh(R[i] * 1.2) * g;
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

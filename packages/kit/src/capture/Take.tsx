import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { clamp, easeInOut, FPS } from "../theme";
import { REC_H, REC_W } from "./rec";

/** Camera key: `t` is 0..1 through the shot; (x, y) in recording pixels. */
export type TakeKey = { t: number; x: number; y: number; s: number };

export type TakeShot = {
  id: string;
  start: number;
  end: number;
  rate?: number;
  /** Keys after the first; the first key is inherited from the previous shot. */
  cam: TakeKey[];
  /** Click moments, in recording seconds. */
  clicks?: number[];
  /** Frames this shot dissolves over the previous one. */
  xfade?: number;
  /** Start from this shot's own t=0 key instead of the previous shot's camera. */
  fresh?: boolean;
  overlay?: React.ReactNode;
};

type Placed = TakeShot & {
  from: number;
  dur: number;
  keys: { f: number; x: number; y: number; s: number }[];
};

export const buildTake = (src: string, shots: TakeShot[], defaultXfade = 4) => {
  const placed: Placed[] = [];
  let at = 0;
  let prev: TakeKey | null = null;
  shots.forEach((s, i) => {
    const dur = Math.round(((s.end - s.start) * FPS) / (s.rate ?? 1));
    const xf = i === 0 ? 0 : Math.min(s.xfade ?? defaultXfade, Math.floor(dur / 3));
    const from = at - xf;
    const inherit = prev && !s.fresh;
    const own = s.cam.filter((k) => !(inherit && k.t === 0));
    const keys = [...(inherit && prev ? [{ ...prev, t: 0 }] : []), ...own].map((k) => ({
      f: k.t * dur,
      x: k.x,
      y: k.y,
      s: k.s,
    }));
    placed.push({ ...s, xfade: xf, from, dur, keys });
    at = from + dur;
    const last = keys[keys.length - 1];
    prev = { t: 1, x: last.x, y: last.y, s: last.s };
  });
  const total = at;

  const shotById = (id: string) => {
    const p = placed.find((s) => s.id === id);
    if (!p) throw new Error(`no shot ${id}`);
    return p;
  };
  /** Global frame where recording second `t` of shot `id` is shown. */
  const frameOf = (id: string, t: number) => {
    const p = shotById(id);
    return Math.round(p.from + ((t - p.start) * FPS) / (p.rate ?? 1));
  };
  const span = (a: string, b = a) => {
    const pa = shotById(a);
    const pb = shotById(b);
    return { from: pa.from, durationInFrames: pb.from + pb.dur - pa.from };
  };
  const clicks = placed.flatMap((p) => (p.clicks ?? []).map((t) => frameOf(p.id, t)));

  const Take: React.FC = () => (
    <>
      {placed.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur} name={p.id} layout="none">
          <TakeClip src={src} shot={p} />
        </Sequence>
      ))}
    </>
  );

  return { Take, total, span, frameOf, clicks };
};

const TakeClip: React.FC<{ src: string; shot: Placed }> = ({ src, shot }) => {
  const frame = useCurrentFrame();
  const { keys } = shot;
  const opts = { ...clamp, easing: easeInOut };
  const pick = (sel: (k: (typeof keys)[number]) => number) =>
    keys.length === 1
      ? sel(keys[0])
      : interpolate(
          frame,
          keys.map((k) => k.f),
          keys.map(sel),
          opts,
        );
  const x = pick((k) => k.x);
  const y = pick((k) => k.y);
  const s = pick((k) => k.s);
  const opacity = shot.xfade ? interpolate(frame, [0, shot.xfade], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute",
          width: REC_W,
          height: REC_H,
          left: 960 - x * s,
          top: 540 - y * s,
          scale: String(s),
          transformOrigin: "0 0",
          backgroundColor: "#000",
        }}
      >
        <Video
          src={src}
          trimBefore={Math.round(shot.start * FPS)}
          playbackRate={shot.rate ?? 1}
          muted
          style={{ width: REC_W, height: REC_H }}
        />
        {shot.overlay}
      </div>
    </AbsoluteFill>
  );
};

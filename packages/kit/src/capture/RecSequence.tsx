import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { clamp, easeInOut, FPS } from "../theme";
import { REC_H, REC_W } from "./rec";

export type CamKey = { f: number; x: number; y: number; s: number };

const useCamera = (keys: CamKey[]) => {
  const frame = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const opts = { ...clamp, easing: easeInOut };
  const pick = (sel: (k: CamKey) => number) =>
    keys.length === 1 ? sel(keys[0]) : interpolate(frame, fs, keys.map(sel), opts);
  return { x: pick((k) => k.x), y: pick((k) => k.y), s: pick((k) => k.s) };
};

export type Clip = {
  src: string;
  start: number;
  end: number;
  rate?: number;
  cam: CamKey[];
  overlay?: React.ReactNode;
};

/**
 * One excerpt of a recording, framed by an animated camera that keeps rec
 * point (x, y) at the frame centre with scale s. Overlays are drawn in
 * recording pixel space so they line up with the UI underneath.
 */
const RecClip: React.FC<Clip> = ({ src, start, rate = 1, cam, overlay }) => {
  const { x, y, s } = useCamera(cam);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: REC_W,
          height: REC_H,
          left: 960 - x * s,
          top: 540 - y * s,
          scale: String(s),
          transformOrigin: "0 0",
        }}
      >
        <Video
          src={src}
          trimBefore={Math.round(start * FPS)}
          playbackRate={rate}
          muted
          style={{ width: REC_W, height: REC_H }}
        />
        {overlay}
      </div>
    </AbsoluteFill>
  );
};

export const clipFrames = (c: { start: number; end: number; rate?: number }) =>
  Math.round(((c.end - c.start) * FPS) / (c.rate ?? 1));

export const sequenceFrames = (clips: Clip[]) =>
  clips.reduce((n, c) => n + clipFrames(c), 0);

/** Plays excerpts back to back. */
export const RecSequence: React.FC<{ clips: Clip[] }> = ({ clips }) => {
  let at = 0;
  return (
    <>
      {clips.map((c, i) => {
        const dur = clipFrames(c);
        const from = at;
        at += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <RecClip {...c} />
          </Sequence>
        );
      })}
    </>
  );
};

// Emphasis on screen recordings, in recording pixels (3024×1544) like the rest of
// the capture overlays.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { REC_H, REC_W } from "../capture/rec";
import {
  clamp,
  enterStyle,
  Highlight,
  HOGI,
  HOGI_MOTION,
  hogiEase,
  type,
  useEnter,
  useHogiFonts,
} from "./base";

const rrect = ({
  x,
  y,
  w,
  h,
  r,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}) =>
  `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={REC_W}
    height={REC_H}
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
  >
    {children}
  </svg>
);

/**
 * Everything outside the target dims to 62% black (soft 10px edge) and a fine
 * green line traces the target. Fades in from `at`, out over the 5 frames before `until`.
 */
export const HogiSpotlight: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  at: number;
  until?: number;
}> = ({ x, y, w, h, r = 24, at, until = Infinity }) => {
  const frame = useCurrentFrame();
  const p =
    interpolate(frame, [at, at + HOGI_MOTION.reveal], [0, 1], {
      ...clamp,
      easing: hogiEase,
    }) *
    (Number.isFinite(until)
      ? interpolate(frame, [until - HOGI_MOTION.exit, until], [1, 0], clamp)
      : 1);
  if (p <= 0) return null;
  const id = `hogi-spot-${x}-${y}`;
  const d = rrect({ x, y, w, h, r });
  return (
    <Layer>
      <defs>
        <filter id={`${id}-f`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={REC_W}
          height={REC_H}
        >
          <rect x={0} y={0} width={REC_W} height={REC_H} fill="#fff" />
          <path d={d} fill="#000" filter={`url(#${id}-f)`} />
        </mask>
      </defs>
      <rect
        x={0}
        y={0}
        width={REC_W}
        height={REC_H}
        fill="#000"
        opacity={0.62 * p}
        mask={`url(#${id})`}
      />
      <path d={d} fill="none" stroke={HOGI.green} strokeWidth={4} opacity={p} />
    </Layer>
  );
};

/** Click: a pink ring, then a green ring 5 frames later (the pointer is already in the recording). */
export const HogiRipple: React.FC<{ x: number; y: number; at: number }> = ({
  x,
  y,
  at,
}) => {
  const t = useCurrentFrame() - at;
  if (t < 0 || t > 24) return null;
  const ring = (delay: number, color: string) => {
    const u = t - delay;
    if (u < 0 || u > 18) return null;
    return (
      <circle
        cx={x}
        cy={y}
        r={interpolate(u, [0, 18], [12, 70], { ...clamp, easing: hogiEase })}
        fill="none"
        stroke={color}
        strokeWidth={5}
        opacity={interpolate(u, [0, 3, 18], [0, 1, 0], clamp)}
      />
    );
  };
  return (
    <Layer>
      {ring(0, HOGI.pinkText)}
      {ring(5, HOGI.green)}
    </Layer>
  );
};

/** Bare poster type over a soft local shade, pinned near the UI it describes. */
export const HogiCallout: React.FC<{
  x: number;
  y: number;
  at: number;
  text: string;
  highlight?: string;
  size?: number;
}> = ({ x, y, at, text, highlight, size = 64 }) => {
  useHogiFonts();
  const frame = useCurrentFrame();
  const e = useEnter(at);
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, ...enterStyle(e) }}>
      <div
        style={{
          position: "absolute",
          inset: "-60px -90px",
          background:
            "radial-gradient(closest-side, rgba(0,0,0,0.6), rgba(0,0,0,0))",
        }}
      />
      <div
        style={{
          position: "relative",
          ...type(size, 600, 1.15),
          color: HOGI.white,
        }}
      >
        <Highlight text={text} highlight={highlight} />
      </div>
    </div>
  );
};

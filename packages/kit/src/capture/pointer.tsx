import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, PINK } from "../theme";
import { REC_H, REC_W } from "./rec";

export type CursorKey = { f: number; x: number; y: number; press?: boolean };

/**
 * A macOS-style pointer gliding between keyframes (recording coordinates).
 * `press` keys get a short squash and a ripple.
 */
export const Cursor: React.FC<{ keys: CursorKey[] }> = ({ keys }) => {
  const frame = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const opts = { ...clamp, easing: easeInOut };
  const x = keys.length === 1 ? keys[0].x : interpolate(frame, fs, keys.map((k) => k.x), opts);
  const y = keys.length === 1 ? keys[0].y : interpolate(frame, fs, keys.map((k) => k.y), opts);
  const presses = keys.filter((k) => k.press);
  const squash = presses.reduce(
    (acc, k) => acc * interpolate(frame, [k.f - 3, k.f, k.f + 5], [1, 0.82, 1], clamp),
    1,
  );
  return (
    <>
      {presses.map((k) => {
        const t = frame - k.f;
        if (t < 0 || t > 16) return null;
        const r = interpolate(t, [0, 16], [16, 70], { ...clamp, easing: easeOut });
        return (
          <div
            key={k.f}
            style={{
              position: "absolute",
              left: k.x - r,
              top: k.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `5px solid ${PINK}`,
              opacity: interpolate(t, [0, 3, 16], [0, 0.9, 0], clamp),
            }}
          />
        );
      })}
      <svg
        width={48}
        height={64}
        viewBox="0 0 22 30"
        style={{
          position: "absolute",
          left: x - 6,
          top: y - 4,
          scale: String(squash),
          transformOrigin: "4px 3px",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.55))",
        }}
      >
        <path
          d="M2 1.5 L2 23.5 L7.6 18.4 L11.3 27 L15 25.4 L11.4 17 L19 17 Z"
          fill="#fff"
          stroke="#111"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

/** Rubber-band selection rectangle drawn from (x0,y0) toward (x1,y1). */
export const Marquee: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  from: number;
  to: number;
}> = ({ x0, y0, x1, y1, from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 2) return null;
  const p = interpolate(frame, [from, to], [0, 1], { ...clamp, easing: easeInOut });
  const cx = x0 + (x1 - x0) * p;
  const cy = y0 + (y1 - y0) * p;
  return (
    <div
      style={{
        position: "absolute",
        left: Math.min(x0, cx),
        top: Math.min(y0, cy),
        width: Math.abs(cx - x0),
        height: Math.abs(cy - y0),
        border: `3px solid ${PINK}`,
        background: "rgba(240, 52, 155, 0.08)",
        borderRadius: 10,
      }}
    />
  );
};

/** Connection line being dragged out of a handle. */
export const DragLine: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  from: number;
  to: number;
  hideAt: number;
}> = ({ x0, y0, x1, y1, from, to, hideAt }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= hideAt) return null;
  const p = interpolate(frame, [from, to], [0, 1], { ...clamp, easing: easeInOut });
  const ex = x0 + (x1 - x0) * p;
  const ey = y0 + (y1 - y0) * p;
  const mx = (x0 + ex) / 2;
  return (
    <svg width={REC_W} height={REC_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path
        d={`M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${ey}, ${ex} ${ey}`}
        stroke="#fff"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        opacity={0.9}
      />
      <circle cx={ex} cy={ey} r={9} fill={PINK} />
    </svg>
  );
};

/**
 * Covers already-typed lines with the panel colour and uncovers them left to
 * right, so an instant paste reads as typing.
 */
export const TypeReveal: React.FC<{
  x: number;
  width: number;
  lines: { y: number; h: number; w: number }[];
  from: number;
  to: number;
  color: string;
}> = ({ x, width, lines, from, to, color }) => {
  const frame = useCurrentFrame();
  const total = lines.reduce((n, l) => n + l.w, 0);
  const shown = interpolate(frame, [from, to], [0, total], clamp);
  let before = 0;
  return (
    <>
      {lines.map((l, i) => {
        const visible = Math.max(0, Math.min(l.w, shown - before));
        before += l.w;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + visible,
              top: l.y,
              width: width - visible,
              height: l.h,
              background: color,
            }}
          />
        );
      })}
    </>
  );
};

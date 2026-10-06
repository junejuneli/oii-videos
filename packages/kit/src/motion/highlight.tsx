import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { REC_H, REC_W } from "../capture/rec";
import { clamp, easeOut, FONT_CN, PINK } from "../theme";

/** Hand-drawn emphasis ring drawn around a UI element, with an optional tag. */
export const HighlightRing: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  at: number;
  label?: string;
}> = ({ cx, cy, rx, ry, at, label }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  if (draw <= 0) return null;
  // A slightly open, overshooting loop reads as drawn by hand.
  const pts: string[] = [];
  const turns = 1.12;
  for (let i = 0; i <= 80; i++) {
    const a = -Math.PI * 0.9 + (i / 80) * Math.PI * 2 * turns;
    const wob = 1 + 0.04 * Math.sin(i * 0.5);
    pts.push(`${cx + Math.cos(a) * rx * wob},${cy + Math.sin(a) * ry * (wob + i / 800)}`);
  }
  const length = 2 * Math.PI * Math.max(rx, ry) * turns * 1.1;
  return (
    <>
      <svg
        width={REC_W}
        height={REC_H}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={PINK}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - draw)}
          style={{ filter: "drop-shadow(0 0 10px rgba(240,52,155,0.6))" }}
        />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: cx - rx - 20,
            top: cy - ry - 96,
            opacity: draw,
            translate: `0px ${interpolate(draw, [0, 1], [12, 0])}px`,
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 44,
            color: "#fff",
            background: PINK,
            borderRadius: 18,
            padding: "8px 22px",
            whiteSpace: "nowrap",
            boxShadow: "0 12px 30px rgba(240,52,155,0.45)",
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};

/**
 * Rounded-rectangle callout drawn clockwise from the top-left in a few
 * frames, then a bright streak keeps running around it (流光).
 */
export const GlowRect: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  at: number;
  drawFrames?: number;
  until?: number;
}> = ({ x, y, w, h, r = 18, at, drawFrames = 7, until = Infinity }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until) return null;
  const draw =
    drawFrames > 0 ? interpolate(frame, [at, at + drawFrames], [0, 1], { ...clamp, easing: easeOut }) : 1;
  const flow = ((frame - at) * 0.045) % 1;
  const fadeOut = Number.isFinite(until) ? interpolate(frame, [until - 5, until], [1, 0], clamp) : 1;
  // Path starts at the top-left corner and runs clockwise.
  const d = `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
  return (
    <svg
      width={REC_W}
      height={REC_H}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: fadeOut }}
    >
      <defs>
        <linearGradient id={`glow-${x}-${y}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF5DB1" />
          <stop offset="50%" stopColor="#F0349B" />
          <stop offset="100%" stopColor="#B44DFF" />
        </linearGradient>
      </defs>
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={`url(#glow-${x}-${y})`}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
        style={{ filter: "drop-shadow(0 0 10px rgba(240,52,155,0.85))" }}
      />
      {draw >= 1 ? (
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke="#fff"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray="0.14 0.86"
          strokeDashoffset={-flow}
          style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(240,52,155,0.9))" }}
        />
      ) : null}
    </svg>
  );
};

/** Click ripple only (the pointer itself is already in the recording). */
export const Ripple: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame() - at;
  if (frame < 0 || frame > 16) return null;
  const r = interpolate(frame, [0, 16], [14, 70], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `6px solid ${PINK}`,
        opacity: interpolate(frame, [0, 3, 16], [0, 1, 0], clamp),
      }}
    />
  );
};

/** A floating label pinned to a point of the UI, e.g. a cost callout. */
export const Callout: React.FC<{
  x: number;
  y: number;
  at: number;
  text: string;
  sub?: string;
  tone?: "pink" | "dark";
  align?: "left" | "right";
  until?: number;
}> = ({ x, y, at, text, sub, tone = "pink", align = "left", until = Infinity }) => {
  const frame = useCurrentFrame();
  const p =
    interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: easeOut }) *
    (Number.isFinite(until) ? interpolate(frame, [until - 6, until], [1, 0], clamp) : 1);
  if (p <= 0) return null;
  const pink = tone === "pink";
  return (
    <div
      style={{
        position: "absolute",
        left: align === "left" ? x : undefined,
        right: align === "right" ? REC_W - x : undefined,
        top: y,
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [14, 0])}px`,
        padding: "16px 26px",
        borderRadius: 22,
        background: pink ? PINK : "rgba(18,18,22,0.92)",
        border: pink ? "none" : "1.5px solid rgba(255,255,255,0.22)",
        boxShadow: pink ? "0 18px 50px rgba(240,52,155,0.45)" : "0 18px 50px rgba(0,0,0,0.5)",
        fontFamily: FONT_CN,
        color: "#fff",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 0.5 }}>{text}</div>
      {sub ? (
        <div style={{ fontSize: 26, fontWeight: 400, opacity: 0.8, marginTop: 4 }}>{sub}</div>
      ) : null}
    </div>
  );
};

/** Soft white flash used to cut on a click. Visual only. */
export const Flash: React.FC<{ at: number; len?: number }> = ({ at, len = 10 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + len], [0, 0.85, 0], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 55%, #fff 0%, rgba(240,52,155,0.9) 75%)`,
        opacity: o,
        mixBlendMode: "screen",
      }}
    />
  );
};

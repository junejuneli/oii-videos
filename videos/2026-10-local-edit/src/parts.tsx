import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut, FONT_CN, GRADIENT, INK, PINK } from "@oii/kit";
import { fit43, m, Rect, useLayout } from "./layout";

const pop = Easing.bezier(0.34, 1.7, 0.64, 1);

/** The 4:3 (or any) picture area. Children are positioned relative to it. */
export const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#000" }) => {
  const { stage } = useLayout();
  return (
    <div
      style={{
        position: "absolute",
        left: stage.x,
        top: stage.y,
        width: stage.w,
        height: stage.h,
        overflow: "hidden",
        background: bg,
        borderRadius: 0,
      }}
    >
      {children}
    </div>
  );
};

export const Pic: React.FC<{
  id: string;
  fit?: "cover" | "contain";
  /** Slow push-in: end scale and origin (0..1). */
  zoom?: { to: number; ox: number; oy: number };
  style?: React.CSSProperties;
}> = ({ id, fit = "cover", zoom, style }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = zoom ? interpolate(f, [0, durationInFrames], [1, zoom.to], { ...clamp, easing: easeOut }) : 1;
  const { stage } = useLayout();
  const wide = stage.w / stage.h > 1.5 && fit === "cover";
  return (
    <>
      {wide ? (
        <Img
          src={m(id)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.55)", scale: "1.15" }}
        />
      ) : null}
    <Img
      src={m(id)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: wide ? "contain" : fit,
        transformOrigin: zoom ? `${zoom.ox * 100}% ${zoom.oy * 100}%` : "50% 50%",
        scale: String(s),
        ...style,
      }}
    />
    </>
  );
};

/** Left-to-right reveal of `b` over `a` between frames [from, to]. */
export const Wipe: React.FC<{ a: string; b: string; from: number; to: number; fit?: "cover" | "contain" }> = ({
  a,
  b,
  from,
  to,
  fit = "cover",
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <Pic id={a} fit={fit} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
        <Pic id={b} fit={fit} />
      </div>
      {p > 0 && p < 1 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${p * 100}%`,
            width: 6,
            background: "#fff",
            boxShadow: "0 0 18px rgba(240,52,155,0.9)",
          }}
        />
      ) : null}
    </>
  );
};

/** Pink rounded rectangle (relative coords in 0..1 of the stage) with a flowing streak. */
export const GlowBox: React.FC<{ r: Rect; at: number; n?: number; dim?: boolean }> = ({ r, at, n, dim }) => {
  const f = useCurrentFrame() - at;
  const { stage } = useLayout();
  if (f < 0) return null;
  const p = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: easeOut });
  const ir = fit43(stage);
  const x = ir.x + r.x * ir.w;
  const y = ir.y + r.y * ir.h;
  const w = r.w * ir.w;
  const h = r.h * ir.h;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, opacity: p }}>
      {dim ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            background: "rgba(240,52,155,0.28)",
            borderRadius: 22,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: 22,
          border: "6px solid #F0349B",
          boxShadow: "0 0 24px rgba(240,52,155,0.85), inset 0 0 18px rgba(240,52,155,0.4)",
        }}
      />
      {n != null ? (
        <div
          style={{
            position: "absolute",
            left: x - 4,
            top: y - 40,
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#F0349B",
            color: "#fff",
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
      ) : null}
    </div>
  );
};

/** Prompt input mock: glass card, mode chip, typewriter text, send button. */
export const PromptBox: React.FC<{
  text: string;
  mode: string;
  from: number;
  to: number;
  working?: [number, number];
  sendAt?: number;
}> = ({ text, mode, from, to, working, sendAt }) => {
  const f = useCurrentFrame();
  const { prompt, portrait } = useLayout();
  const appear = interpolate(f, [from - 8, from], [0, 1], { ...clamp, easing: pop });
  if (appear <= 0) return null;
  const n = Math.floor(interpolate(f, [from, to], [0, text.length], clamp));
  const shown = text.slice(0, n);
  const isWorking = working && f >= working[0] && f < working[1];
  const sendP = sendAt != null ? interpolate(f, [sendAt, sendAt + 6], [0, 1], clamp) : 0;
  const fs = portrait ? 44 : 44;
  return (
    <div
      style={{
        position: "absolute",
        left: prompt.x,
        top: prompt.y,
        width: prompt.w,
        opacity: appear,
        translate: `0 ${(1 - appear) * 30}px`,
        scale: String(0.96 + appear * 0.04),
        padding: 3,
        borderRadius: 34,
        background: "linear-gradient(120deg,#FF5DB1,#B44DFF 60%,#6a7bff)",
        boxShadow: "0 22px 60px rgba(0,0,0,0.55), 0 0 40px rgba(240,52,155,0.35)",
        fontFamily: FONT_CN,
      }}
    >
      <div style={{ background: "rgba(16,16,20,0.96)", borderRadius: 31, padding: "20px 28px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div
            style={{
              background: GRADIENT,
              color: "#fff",
              fontWeight: 700,
              fontSize: 28,
              borderRadius: 999,
              padding: "4px 20px",
            }}
          >
            {mode}
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600, fontSize: 26 }}>说你想要的</div>
          <div style={{ flex: 1 }} />
          {isWorking ? <div style={{ color: "#FFE14D", fontWeight: 700, fontSize: 28 }}>生成中…</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
          <div
            style={{
              flex: 1,
              color: "#fff",
              fontSize: fs,
              fontWeight: 700,
              lineHeight: 1.3,
              minHeight: fs * 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {shown}
            <span style={{ opacity: f % 16 < 8 ? 1 : 0, color: PINK }}>|</span>
          </div>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 999,
              background: GRADIENT,
              color: "#fff",
              fontSize: 40,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: sendP > 0 ? `0 0 0 ${8 * sendP}px rgba(255,255,255,${0.5 * sendP}), 0 0 36px rgba(240,52,155,0.9)` : "none",
              scale: String(1 + 0.12 * sendP),
            }}
          >
            ↑
          </div>
        </div>
      </div>
    </div>
  );
};

/** Characters pop in one after another. */
export const PopText: React.FC<{ text: string; delay?: number; step?: number }> = ({ text, delay = 0, step = 2 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from(text).map((ch, i) => {
        const p = interpolate(f - delay - i * step, [0, 9], [0, 1], { ...clamp, easing: pop });
        return (
          <span
            key={i}
            style={{ display: "inline-block", opacity: p, translate: `0 ${(1 - p) * 40}px`, scale: String(0.6 + 0.4 * p), whiteSpace: "pre" }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
};

/** Product-style compare view: A | B with a draggable divider that sweeps. */
export const CompareView: React.FC<{ a: string; b: string; sweep?: [number, number]; labelA?: string; labelB?: string }> = ({
  a,
  b,
  sweep = [0.12, 0.88],
  labelA = "A",
  labelB = "B",
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(f, [8, durationInFrames - 10], sweep, { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Pic id={a} fit="contain" />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${p * 100}%)` }}>
        <Pic id={b} fit="contain" />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${p * 100}%`,
          width: 4,
          background: "#fff",
          boxShadow: "0 0 14px rgba(255,255,255,0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${p * 100}%`,
          width: 56,
          height: 56,
          marginLeft: -28,
          marginTop: -28,
          borderRadius: 999,
          background: "#fff",
          color: INK,
          fontSize: 30,
          fontWeight: 700,
          fontFamily: FONT_CN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⠿
      </div>
      <Tag text={labelA} left={`${Math.max(p * 100 - 6, 3)}%`} />
      <Tag text={labelB} left={`${Math.min(p * 100 + 3, 94)}%`} />
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 22,
          width: 56,
          height: 56,
          borderRadius: 999,
          background: "rgba(255,255,255,0.14)",
          color: "#fff",
          fontSize: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </div>
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string; left: string }> = ({ text, left }) => (
  <div
    style={{
      position: "absolute",
      top: 24,
      left,
      color: "#fff",
      fontFamily: FONT_CN,
      fontWeight: 700,
      fontSize: 30,
      textShadow: "0 2px 6px rgba(0,0,0,0.8)",
    }}
  >
    {text}
  </div>
);

/** Black chapter card. */
export const ChapterCard: React.FC<{ title: string; level: number }> = ({ title, level }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { portrait } = useLayout();
  const inP = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: pop });
  const out = interpolate(f, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        background: INK,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 26,
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: portrait ? 76 : 86,
          color: "#fff",
          scale: String(0.9 + inP * 0.1),
          opacity: inP,
          textAlign: "center",
          padding: "0 60px",
          lineHeight: 1.25,
        }}
      >
        <PopText text={title} />
      </div>
      <div style={{ fontFamily: FONT_CN, fontWeight: 700, fontSize: 48, color: "#FFE14D", opacity: inP }}>
        难度 {"★".repeat(level)}
      </div>
    </AbsoluteFill>
  );
};

/** Placeholder for the digital-human slot: caption card with the line. */
export const OCCard: React.FC<{ line: string; sub?: string }> = ({ line, sub }) => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const inP = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: pop });
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 30% 20%, #2a1630 0%, #0A0A0C 70%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: portrait ? 160 : 90,
          left: 80,
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 36,
          color: "#fff",
          background: GRADIENT,
          borderRadius: 999,
          padding: "8px 26px",
        }}
      >
        AI 抽卡君
      </div>
      <div
        style={{
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: portrait ? 104 : 118,
          color: "#FFE14D",
          WebkitTextStroke: `14px ${INK}`,
          paintOrder: "stroke fill",
          textShadow: `0 8px 0 ${INK}`,
          scale: String(0.85 + inP * 0.15),
          opacity: inP,
          textAlign: "center",
          padding: "0 50px",
          lineHeight: 1.2,
        }}
      >
        <PopText text={line} step={3} />
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: FONT_CN,
            fontWeight: 600,
            fontSize: 40,
            color: "rgba(255,255,255,0.85)",
            opacity: interpolate(f, [10, 20], [0, 1], clamp),
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Voice-over caption (TTS text): shown sentence by sentence across the shot. */
export const VoCaption: React.FC<{ text: string }> = ({ text }) => {
  const { capY, portrait } = useLayout();
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const parts = text.split(/(?<=[。！？])/).map((x) => x.trim()).filter(Boolean);
  const total = parts.reduce((n, p) => n + p.length, 0) || 1;
  let acc = 0;
  let prev = 0;
  let shown = parts[parts.length - 1] ?? text;
  let startPos = prev;
  const pos = f / Math.max(1, D - 6);
  for (const p of parts) {
    prev = acc;
    acc += p.length / total;
    if (pos <= acc) {
      shown = p;
      startPos = prev;
      break;
    }
  }
  const since = f - startPos * Math.max(1, D - 6);
  const capIn = interpolate(since, [0, 8], [0, 1], { ...clamp, easing: pop });
  const size = portrait ? (shown.length > 26 ? 44 : 50) : shown.length > 30 ? 36 : 40;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: capY - 60,
        display: "flex",
        justifyContent: "center",
        padding: "0 60px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.35,
          color: "#fff",
          textAlign: "center",
          background: "rgba(10,10,12,0.62)",
          borderRadius: 18,
          padding: "10px 24px",
          maxWidth: portrait ? 960 : 1500,
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          opacity: capIn,
          translate: `0 ${(1 - capIn) * 16}px`,
        }}
      >
        {shown}
      </div>
    </div>
  );
};

/** A small chip like 「想要 → 得到」. */
export const Chip: React.FC<{ text: string; x?: number | string; y?: number | string; bg?: string; color?: string; size?: number }> = ({
  text,
  x = 40,
  y = 40,
  bg = "#FFE14D",
  color = INK,
  size = 36,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: pop });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        scale: String(p),
        opacity: p,
        transformOrigin: "0 50%",
        fontFamily: FONT_CN,
        fontWeight: 700,
        fontSize: size,
        color,
        background: bg,
        border: `5px solid ${INK}`,
        borderRadius: 999,
        padding: `${size * 0.18}px ${size * 0.55}px`,
        boxShadow: `0 6px 0 ${INK}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** WeChat-like bubble (generic avatar; no real UI). */
export const Bubble: React.FC<{ text: string; side?: "l" | "r"; y?: number | string }> = ({ text, side = "l", y = 60 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: pop });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        [side === "l" ? "left" : "right"]: 40,
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexDirection: side === "l" ? "row" : "row-reverse",
        scale: String(p),
        opacity: p,
        transformOrigin: side === "l" ? "0 50%" : "100% 50%",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: "#6b6f7b",
          color: "#fff",
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        甲
      </div>
      <div
        style={{
          background: "#fff",
          color: INK,
          borderRadius: 18,
          padding: "14px 22px",
          fontFamily: FONT_CN,
          fontWeight: 600,
          fontSize: 36,
          maxWidth: 620,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Flowing-glow rounded ring around a UI element (px in the parent's space). */
export const FlowRing: React.FC<{ x: number; y: number; w: number; h: number; r?: number; stroke?: number }> = ({
  x,
  y,
  w,
  h,
  r = 14,
  stroke = 5,
}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const flow = (f * 0.03) % 1;
  const pad = stroke + 6;
  const d = `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
  return (
    <svg
      width={w + pad * 2}
      height={h + pad * 2}
      style={{ position: "absolute", left: x - pad, top: y - pad, overflow: "visible" }}
    >
      <g transform={`translate(${pad},${pad})`}>
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke="#F0349B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
          style={{ filter: "drop-shadow(0 0 10px rgba(240,52,155,0.9))" }}
        />
        {draw >= 1 ? (
          <path
            d={d}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={stroke + 1}
            strokeLinecap="round"
            strokeDasharray="0.16 0.84"
            strokeDashoffset={-flow}
            style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(240,52,155,0.9))" }}
          />
        ) : null}
      </g>
    </svg>
  );
};

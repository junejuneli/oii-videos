import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut, FONT_CN, FONT_MONO, PINK } from "../theme";

/**
 * Step label: an index, a short title, an optional note and a progress rail
 * so the viewer always knows where they are in the flow. Bottom-left by
 * default; `placement="top-left"` with `bold` gives a larger, brighter card
 * (pink index badge, glowing border) that slides down from the top.
 */
export const StepCaption: React.FC<{
  /** Titles of every step in the flow, in order. */
  steps: string[];
  /** 1-based index of the current step. */
  step: number;
  note?: string;
  placement?: "bottom-left" | "top-left";
  bold?: boolean;
}> = ({ steps, step, note, placement = "bottom-left", bold = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
  const top = placement === "top-left";
  const k = bold ? 0.8 : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: top ? 40 : 96,
        ...(top ? { top: 36 } : { bottom: 84 }),
        opacity: inP * out,
        translate: `0px ${interpolate(inP, [0, 1], [top ? -22 : 18, 0])}px`,
        padding: bold ? "16px 26px 16px 16px" : "26px 34px 24px",
        borderRadius: bold ? 22 : 30,
        background: bold
          ? "linear-gradient(160deg, rgba(34,20,30,0.92), rgba(12,12,16,0.92))"
          : "linear-gradient(160deg, rgba(28,28,34,0.86), rgba(12,12,16,0.86))",
        border: bold ? "1.5px solid rgba(240,52,155,0.55)" : "1px solid rgba(255,255,255,0.12)",
        boxShadow: bold
          ? "0 0 24px rgba(240,52,155,0.22), 0 18px 50px rgba(0,0,0,0.5)"
          : "0 30px 80px rgba(0,0,0,0.55)",
        backdropFilter: "blur(18px)",
        minWidth: bold ? 0 : 360,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: bold ? 14 : 18 }}>
        {bold ? (
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              background: PINK,
              borderRadius: 999,
              minWidth: 42,
              height: 42,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(240,52,155,0.4)",
            }}
          >
            {String(step).padStart(2, "0")}
          </span>
        ) : (
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 600, color: PINK, letterSpacing: 2 }}>
            {String(step).padStart(2, "0")}
          </span>
        )}
        <span
          style={{
            fontFamily: FONT_CN,
            fontSize: 56 * k,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 2,
            lineHeight: 1.05,
            textShadow: bold ? "0 2px 10px rgba(240,52,155,0.3)" : undefined,
          }}
        >
          {steps[step - 1]}
        </span>
      </div>
      {note ? (
        <div
          style={{
            fontFamily: FONT_CN,
            fontSize: bold ? 24 : 28,
            fontWeight: bold ? 500 : 400,
            color: bold ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.62)",
            marginTop: bold ? 8 : 10,
            marginLeft: bold ? 56 : 0,
            letterSpacing: 1,
          }}
        >
          {note}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: bold ? 6 : 8, marginTop: bold ? 12 : 18, marginLeft: bold ? 56 : 0 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: 52 * k,
              height: 4,
              borderRadius: 3,
              background:
                i < step - 1
                  ? "rgba(240,52,155,0.55)"
                  : i === step - 1
                    ? PINK
                    : "rgba(255,255,255,0.16)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Small brand pill, top-right, over the canvas recordings. */
export const BrandMark: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        right: 64,
        top: 52,
        opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        borderRadius: 999,
        background: "rgba(12,12,16,0.82)",
        border: "1px solid rgba(255,255,255,0.12)",
        fontFamily: FONT_CN,
        fontSize: 26,
        fontWeight: 600,
        color: "rgba(255,255,255,0.9)",
        letterSpacing: 1,
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 5, background: PINK }} />
      {label}
    </div>
  );
};

/** Pill shown while a stretch of waiting is fast-forwarded (speed not shown). */
export const SpeedPill: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [0, 6, durationInFrames - 6, durationInFrames], [0, 1, 1, 0], clamp);
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 70,
        translate: "-50% 0px",
        opacity: o,
        padding: "16px 30px 18px",
        borderRadius: 24,
        background: "rgba(12,12,16,0.86)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        minWidth: 420,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 28 }}>
        <span style={{ fontFamily: FONT_CN, fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>
          {label}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 30, fontWeight: 700, color: PINK }}>···</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", marginTop: 14 }}>
        <div style={{ width: `${p * 100}%`, height: 4, borderRadius: 2, background: PINK }} />
      </div>
    </div>
  );
};

/** Centered headline at the top of the frame, used over canvas footage. */
export const TopHeadline: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [0, 10, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: "50%",
        translate: `-50% ${interpolate(o, [0, 1], [-12, 0])}px`,
        opacity: o,
        padding: "16px 38px",
        borderRadius: 26,
        background: "rgba(12,12,16,0.82)",
        border: "1px solid rgba(255,255,255,0.12)",
        fontFamily: FONT_CN,
        fontSize: 46,
        fontWeight: 700,
        letterSpacing: 4,
        color: "#fff",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

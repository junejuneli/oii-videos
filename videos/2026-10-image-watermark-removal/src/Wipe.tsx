import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, FONT_CN, GRADIENT, INK } from "@oii/kit";

/**
 * Section transition: a pink slab sweeps in (the hard cut underneath hides at
 * frame WIPE_CUT), shows the section title and a screenshot of the entry with
 * the button outlined, then sweeps out to the right.
 */
export const WIPE_LEN = 78;
export const WIPE_CUT = 12;

const bounce = Easing.bezier(0.34, 1.5, 0.64, 1);

export const Wipe: React.FC<{
  title: string;
  sub: string;
  shot: { src: string; w: number; h: number; scale: number; hi: { x: number; y: number; w: number; h: number; r: number } };
}> = ({ title, sub, shot }) => {
  const frame = useCurrentFrame();
  const sweep = Easing.bezier(0.7, 0, 0.3, 1);
  const inP = interpolate(frame, [0, 9], [0, 1], { ...clamp, easing: sweep });
  const outP = interpolate(frame, [66, WIPE_LEN], [0, 1], { ...clamp, easing: sweep });
  const x = (inP - 1) * 2300 + outP * 2300;
  const show = interpolate(frame, [5, 10, 62, 68], [0, 1, 1, 0], clamp);
  const t = interpolate(frame, [6, 14], [0, 1], { ...clamp, easing: bounce });
  const card = interpolate(frame, [12, 22], [0, 1], { ...clamp, easing: bounce });
  const ring = interpolate(frame, [24, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pulse = 1 + Math.sin(Math.max(0, frame - 34) / 4) * 0.04 * (frame > 34 ? 1 : 0);
  const { hi, scale: k } = shot;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -200, top: -50, width: 2320, height: 1180, translate: `${x}px 0px`, background: GRADIENT, transform: "skewX(-14deg)", boxShadow: "0 0 80px rgba(0,0,0,0.5)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34, opacity: show }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, scale: String(0.7 + t * 0.3) }}>
          <div style={{ fontFamily: FONT_CN, fontWeight: 700, fontSize: 120, letterSpacing: 6, color: "#fff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `0 8px 0 ${INK}`, whiteSpace: "nowrap" }}>{title}</div>
        </div>
        <div
          style={{
            position: "relative",
            width: shot.w * k,
            height: shot.h * k,
            borderRadius: 22,
            overflow: "visible",
            scale: String(0.85 + card * 0.15),
            opacity: card,
          }}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", border: `4px solid ${INK}` }}>
            <Img src={staticFile(shot.src)} style={{ width: "100%", height: "100%" }} />
          </div>
          <div
            style={{
              position: "absolute",
              left: hi.x * k - 8,
              top: hi.y * k - 8,
              width: hi.w * k + 16,
              height: hi.h * k + 16,
              borderRadius: hi.r * k + 8,
              border: "6px solid #FFE14D",
              boxShadow: "0 0 0 4px rgba(10,10,12,0.8), 0 0 30px rgba(255,225,77,0.8)",
              opacity: ring,
              scale: String((1.4 - ring * 0.4) * pulse),
            }}
          />
        </div>
        <div style={{ fontFamily: FONT_CN, fontWeight: 700, fontSize: 52, color: INK, background: "#FFE14D", borderRadius: 24, padding: "8px 30px", opacity: card, border: `4px solid ${INK}` }}>{sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

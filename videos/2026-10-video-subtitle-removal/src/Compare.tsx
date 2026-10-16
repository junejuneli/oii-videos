import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { clamp, FONT_CN, INK, PINK } from "@oii/kit";

const W = 660;
const H = 886;

const Tag: React.FC<{ text: string; bg: string; color: string; side: "left" | "right"; opacity: number }> = ({
  text,
  bg,
  color,
  side,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      top: 18,
      [side]: 18,
      fontFamily: FONT_CN,
      fontWeight: 700,
      fontSize: 32,
      color,
      background: bg,
      borderRadius: 14,
      padding: "4px 16px",
      opacity,
      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    }}
  >
    {text}
  </div>
);

/**
 * Before / after wipe of the original and the cleaned image (made in the
 * edit, not recorded). The divider sweeps from the right edge (all
 * watermarked) to the left edge (all clean), then settles in the middle.
 * `focus` zooms toward the watermark (0..1 of the image) while sweeping.
 */
export const Compare: React.FC<{
  before: string;
  after: string;
  focus?: { x: number; y: number; scale: number };
  caption: string;
}> = ({ before, after, focus, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  // divider position: % of the width that still shows the original
  const d = durationInFrames;
  const pos = interpolate(frame, [0, 0.14 * d, 0.46 * d, 0.62 * d, 0.82 * d], [100, 100, 0, 0, 50], ease);
  const z = focus ? interpolate(frame, [0.1 * d, 0.32 * d, 0.66 * d, 0.84 * d], [1, focus.scale, focus.scale, 1], ease) : 1;
  const origin = focus ? `${focus.x * 100}% ${focus.y * 100}%` : "50% 50%";
  const img: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", scale: String(z), transformOrigin: origin };
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "#0A0A0C" }}>
        <Video src={staticFile(after)} muted objectFit="cover" style={{ width: "100%", height: "100%", filter: "blur(40px) brightness(0.35)", scale: "1.2" }} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: (1920 - W) / 2,
          top: 120,
          width: W,
          height: H,
          borderRadius: 28,
          overflow: "hidden",
          border: "6px solid #fff",
          boxShadow: "0 30px 90px rgba(0,0,0,0.6)",
          scale: String(interpolate(inP, [0, 1], [0.92, 1])),
          opacity: inP,
        }}
      >
        <Video src={staticFile(after)} muted objectFit="cover" style={img} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Video src={staticFile(before)} muted objectFit="cover" style={img} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            width: 4,
            marginLeft: -2,
            background: "#fff",
            boxShadow: "0 0 12px rgba(0,0,0,0.5)",
            opacity: pos > 0.5 && pos < 99.5 ? 1 : 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: -20,
              width: 44,
              height: 44,
              marginTop: -22,
              borderRadius: 22,
              background: "#fff",
              border: `3px solid ${INK}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 22,
              color: INK,
            }}
          >
            ⇆
          </div>
        </div>
        <Tag text="原视频" bg="rgba(10,10,12,0.75)" color="#fff" side="left" opacity={pos > 12 ? 1 : 0.3} />
        <Tag text="去字幕后" bg={PINK} color="#fff" side="right" opacity={pos < 88 ? 1 : 0.3} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1022,
          textAlign: "center",
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 34,
          color: "rgba(255,255,255,0.85)",
          opacity: inP,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

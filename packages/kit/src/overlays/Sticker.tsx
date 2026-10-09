import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT_CN, INK } from "../theme";

const pop = Easing.bezier(0.34, 1.7, 0.64, 1);

/**
 * Variety-show sticker in frame (1920x1080) coordinates: a thick-outlined
 * bubble that pops in, wobbles gently while it stays, and shrinks away over
 * the last frames of its sequence. House convention (see the oii-highlight
 * skill): pink bg + white text names a key operation ("👆 添加颜色标签入口"),
 * yellow / green bg marks a result ("✓ 已标记").
 */
export const Sticker: React.FC<{
  x: number;
  y: number;
  text: string;
  bg?: string;
  color?: string;
  rotate?: number;
  size?: number;
  delay?: number;
}> = ({ x, y, text, bg = "#FFE14D", color = INK, rotate = -6, size = 40, delay = 0 }) => {
  const frame = useCurrentFrame() - delay;
  const { durationInFrames } = useVideoConfig();
  if (frame < 0) return null;
  const inP = interpolate(frame, [0, 9], [0, 1], { ...clamp, easing: pop });
  const out = interpolate(frame, [durationInFrames - delay - 6, durationInFrames - delay], [1, 0], clamp);
  const wobble = Math.sin(frame / 5) * 2.5;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        rotate: `${rotate + wobble}deg`,
        scale: String(inP * out),
        transformOrigin: "50% 100%",
        fontFamily: FONT_CN,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 1,
        color,
        background: bg,
        border: `5px solid ${INK}`,
        borderRadius: 999,
        padding: `${size * 0.2}px ${size * 0.55}px`,
        boxShadow: `0 7px 0 ${INK}, 0 18px 36px rgba(0,0,0,0.4)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Big outlined meme caption, punched in at the top of the frame. */
export const MemeTitle: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity: out,
      }}
    >
      {lines.map((line, i) => {
        const p = interpolate(frame, [i * 12, i * 12 + 10], [0, 1], { ...clamp, easing: pop });
        return (
          <div
            key={line}
            style={{
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: i === 0 ? 76 : 88,
              letterSpacing: 4,
              color: i === 0 ? "#fff" : "#FFE14D",
              WebkitTextStroke: `14px ${INK}`,
              paintOrder: "stroke fill",
              textShadow: `0 9px 0 ${INK}, 0 20px 40px rgba(0,0,0,0.5)`,
              rotate: `${i === 0 ? -3 : 2}deg`,
              scale: String(p),
              opacity: p,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, FONT_CN, INK, PINK } from "@oii/kit";

const COMMENTS = [
  "求无水印原图",
  "博主出一下原图",
  "同求！！",
  "求无水印原图 谢谢",
  "原图呢 求发",
  "求原图 +1",
  "有无水印版的吗",
  "求无水印版 🙏",
  "求原图！",
  "蹲一个无水印",
];
// Where each comment sits (left, base top), and when it enters.
const SLOTS = [
  { x: 1000, y: 170, at: 2 },
  { x: 1250, y: 330, at: 7 },
  { x: 960, y: 480, at: 12 },
  { x: 1220, y: 640, at: 17 },
  { x: 1020, y: 800, at: 22 },
  { x: 110, y: 640, at: 27 },
  { x: 80, y: 820, at: 32 },
  { x: 1200, y: 230, at: 37 },
  { x: 300, y: 520, at: 42 },
  { x: 1240, y: 900, at: 47 },
];
const pop = Easing.bezier(0.34, 1.5, 0.64, 1);

const Bubble: React.FC<{ text: string; x: number; y: number; at: number; tint: number }> = ({
  text,
  x,
  y,
  at,
  tint,
}) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const p = interpolate(f, [0, 7], [0, 1], { ...clamp, easing: pop });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - f * 0.5,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 30px 14px 16px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
        scale: String(p),
        opacity: p,
        transformOrigin: "0 50%",
      }}
    >
      <div style={{ width: 54, height: 54, borderRadius: 27, background: `hsl(${tint} 15% 70%)`, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: FONT_CN, fontSize: 20, color: "#8a8a92", lineHeight: 1 }}>用户****{tint % 90}</div>
        <div style={{ fontFamily: FONT_CN, fontSize: 40, fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>{text}</div>
      </div>
    </div>
  );
};

const Card: React.FC<{ src: string; left: number; top: number; rotate: number; delay: number }> = ({
  src,
  left,
  top,
  rotate,
  delay,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 480,
        height: 641,
        rotate: `${rotate}deg`,
        borderRadius: 30,
        overflow: "hidden",
        border: "8px solid #fff",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        scale: String(interpolate(frame, [delay, delay + 12], [0.9, 1], { ...clamp, easing: pop })),
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

/**
 * Opening: the comment section floods with 「求无水印原图」 under the two
 * watermarked photos, then the pile is swept away by 「不用求了，自己擦」.
 */
export const Opening: React.FC<{ turnAt: number; length: number }> = ({ turnAt, length }) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [turnAt, turnAt + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const title = interpolate(frame, [turnAt + 4, turnAt + 14], [0, 1], { ...clamp, easing: pop });
  const out = interpolate(frame, [length - 10, length], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "#0A0A0C" }}>
        <Img src={staticFile("assets/lastB.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(16px) brightness(0.7)", scale: "1.15" }} />
      </AbsoluteFill>
      <Card src="raw/canvas/local-src.jpg" left={130} top={190} rotate={-5} delay={0} />
      <Card src="raw/canvas/many-src.jpg" left={560} top={240} rotate={4} delay={4} />

      <AbsoluteFill style={{ opacity: 1 - sweep, translate: `${sweep * 1500}px 0px` }}>
        {SLOTS.map((s, i) => (
          <Bubble key={i} text={COMMENTS[i % COMMENTS.length]} x={s.x} y={s.y} at={s.at} tint={(i * 57) % 360} />
        ))}
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 50,
          textAlign: "center",
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 60,
          letterSpacing: 4,
          color: "#fff",
          opacity: interpolate(frame, [0, 6, turnAt, turnAt + 8], [0, 1, 1, 0], clamp),
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        好图都被水印糊住了？
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 190,
            letterSpacing: 10,
            color: "#FFE14D",
            WebkitTextStroke: `20px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 12px 0 ${INK}, 0 28px 60px rgba(0,0,0,0.6)`,
            rotate: "-3deg",
            scale: String(interpolate(title, [0, 1], [0.5, 1])),
            opacity: title,
            whiteSpace: "nowrap",
          }}
        >
          不用求了，自己擦
        </div>
        <div
          style={{
            marginTop: 50,
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 50,
            color: "#fff",
            background: PINK,
            borderRadius: 24,
            padding: "10px 32px",
            opacity: interpolate(frame, [turnAt + 10, turnAt + 18], [0, 1], clamp),
          }}
        >
          两个小技巧，局部水印 / 满屏水印都能去
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

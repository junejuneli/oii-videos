import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, clamp, FONT_CN, INK, PINK } from "@oii/kit";

const CELLS = Array.from({ length: 9 }, (_, i) => staticFile(`assets/cases2/ghibli/${String(i + 1).padStart(2, "0")}.jpg`));
const ORIGINAL = staticFile("assets/cases/ghibli/original.jpg");
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);

const outlined = (fill: string, stroke = 16, depth = 12): React.CSSProperties => ({
  color: fill,
  WebkitTextStroke: `${stroke}px ${INK}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${depth}px 0 ${INK}, 0 ${depth + 14}px 40px rgba(0,0,0,0.55)`,
});

const CW = 280;
const CH = 157;
const GAP = 16;
const GX = 1000;
const GY = 290;
// small per-cell tilt so the pieces read as loose pictures, not a table
const TILT = [-3, 2, -2, 3, -1, 2, -2, 3, -3];

/**
 * Cover. Frame 0 is the finished cover: the Ghibli storyboard already split
 * into nine loose pictures, which take a bow one after another; the title then
 * punches out toward the viewer and the cards fly off, revealing the canvas.
 */
export const Cover: React.FC<{ exitAt: number }> = ({ exitAt }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exit = interpolate(frame, [exitAt, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.55, 0, 0.75, 0.2),
  });
  const bgOpacity = interpolate(exit, [0, 0.85], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: bgOpacity }}>
        <AbsoluteFill
          style={{
            scale: String(interpolate(frame, [0, durationInFrames], [1.12, 1.04])),
            filter: "brightness(0.42) saturate(1.2) blur(10px)",
          }}
        >
          <Img src={ORIGINAL} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 26% 50%, rgba(240,52,155,0.55), rgba(240,52,155,0) 70%), linear-gradient(90deg, rgba(10,10,12,0.72), rgba(10,10,12,0.05) 60%)",
          }}
        />
        <AbsoluteFill style={{ overflow: "hidden", opacity: 0.16 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: -400 + i * 520 + ((frame * 14) % 520),
                top: -200,
                width: 70,
                height: 1600,
                background: "#fff",
                rotate: "24deg",
              }}
            />
          ))}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Nine split pictures: each takes a bow in turn, all fly out on exit. */}
      {CELLS.map((src, i) => {
        const r = Math.floor(i / 3);
        const k = i % 3;
        const beat = 6 + i * 4;
        const bow = interpolate(frame, [beat, beat + 5, beat + 12], [0, 1, 0], {
          ...clamp,
          easing: Easing.inOut(Easing.quad),
        });
        const fly = interpolate(frame, [exitAt - 4 + i, durationInFrames - 2], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.cubic),
        });
        const dir = k - 1;
        return (
          <div
            key={src}
            style={{
              position: "absolute",
              left: GX + k * (CW + GAP),
              top: GY + r * (CH + GAP),
              width: CW,
              height: CH,
              rotate: `${TILT[i] * (1 - bow * 0.7) + fly * dir * 14}deg`,
              scale: String(1 + bow * 0.14 - fly * 0.2),
              translate: `${fly * (500 + dir * 500)}px ${fly * (r - 1) * 420}px`,
              opacity: 1 - fly,
              zIndex: bow > 0.05 ? 5 : 1,
              borderRadius: 20,
              overflow: "hidden",
              border: `7px solid ${bow > 0.05 ? "#FFE14D" : "#fff"}`,
              boxShadow: `0 ${18 + bow * 18}px ${44 + bow * 26}px rgba(0,0,0,0.55)`,
            }}
          >
            <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}

      {/* Title block, in place on frame 0; punches out on exit. */}
      <AbsoluteFill
        style={{
          scale: String(interpolate(exit, [0, 1], [1, 2.4])),
          opacity: interpolate(exit, [0, 0.7], [1, 0], clamp),
          transformOrigin: "30% 50%",
        }}
      >
        <div style={{ position: "absolute", left: 100, top: 168 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Img src={BRAND.logo} style={{ height: 58, filter: "drop-shadow(0 4px 0 #0A0A0C)" }} />
            <div
              style={{
                fontFamily: FONT_CN,
                fontWeight: 700,
                fontSize: 34,
                color: "#fff",
                background: PINK,
                borderRadius: 14,
                padding: "6px 16px",
                rotate: "-3deg",
              }}
            >
              宫格拆分
            </div>
          </div>

          <div
            style={{
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 190,
              lineHeight: 1.04,
              letterSpacing: 6,
              marginTop: 26,
              rotate: "-4deg",
              transformOrigin: "0 50%",
              scale: String(interpolate(frame, [0, 10, 18], [1, 1.04, 1], { ...clamp, easing: pop })),
            }}
          >
            <div style={outlined("#fff")}>宫格图</div>
            <div style={{ ...outlined("#FFE14D"), marginLeft: 40 }}>一键拆开</div>
          </div>

          <div
            style={{
              marginTop: 44,
              marginLeft: 20,
              display: "inline-block",
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 44,
              color: INK,
              background: "#fff",
              borderRadius: 22,
              padding: "12px 28px",
              border: `5px solid ${INK}`,
              boxShadow: `0 8px 0 ${INK}`,
              rotate: "2deg",
            }}
          >
            拆成独立节点，免费使用
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

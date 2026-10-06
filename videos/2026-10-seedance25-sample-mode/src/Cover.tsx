import React from "react";
import { Video } from "@remotion/media";
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

const CARDS = [1, 2, 3, 4].map((i) => staticFile(`assets/cover_s${i}.jpg`));
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);

// Thick-outlined, drop-shadowed display type in the style of video covers.
const outlined = (fill: string, stroke = 16, depth = 12): React.CSSProperties => ({
  color: fill,
  WebkitTextStroke: `${stroke}px ${INK}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${depth}px 0 ${INK}, 0 ${depth + 14}px 40px rgba(0,0,0,0.55)`,
});

const CARD_POS = [
  { x: 1040, y: 120, r: -7 },
  { x: 1400, y: 210, r: 6 },
  { x: 1020, y: 560, r: 5 },
  { x: 1380, y: 640, r: -6 },
];

/**
 * Marketing cover. Frame 0 is already the finished cover; the four sample
 * cards then take a bow one after another, and the title punches out toward
 * the viewer to reveal the canvas take underneath.
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
            filter: "brightness(0.5) saturate(1.25) blur(3px)",
          }}
        >
          <Video
            src={staticFile("assets/final_real.mp4")}
            trimBefore={60}
            muted
            style={{ width: "100%", height: "100%" }}
          />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 28% 50%, rgba(240,52,155,0.55), rgba(240,52,155,0) 70%), linear-gradient(90deg, rgba(10,10,12,0.75), rgba(10,10,12,0.1) 55%)",
          }}
        />
        <AbsoluteFill style={{ overflow: "hidden", opacity: 0.18 }}>
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

      {/* Sample cards: each pops forward in turn, then all fly out on exit. */}
      {CARDS.map((src, i) => {
        const pos = CARD_POS[i];
        const beat = 6 + i * 7;
        const bow = interpolate(frame, [beat, beat + 5, beat + 12], [0, 1, 0], {
          ...clamp,
          easing: Easing.inOut(Easing.quad),
        });
        const fly = interpolate(frame, [exitAt - 4 + i * 2, durationInFrames - 2], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.cubic),
        });
        return (
          <div
            key={src}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: 470,
              height: 264,
              rotate: `${pos.r * (1 - bow * 0.6) + fly * pos.r * 2}deg`,
              scale: String(1 + bow * 0.12 - fly * 0.15),
              translate: `${fly * 900}px ${fly * (i % 2 ? -260 : 220)}px`,
              opacity: 1 - fly,
              zIndex: bow > 0.05 ? 5 : 1,
              borderRadius: 26,
              overflow: "hidden",
              border: `8px solid ${bow > 0.05 ? "#FFE14D" : "#fff"}`,
              boxShadow: `0 ${24 + bow * 20}px ${60 + bow * 30}px rgba(0,0,0,0.55)`,
            }}
          >
            <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 10,
                fontFamily: FONT_CN,
                fontWeight: 700,
                fontSize: 30,
                color: INK,
                background: "#FFE14D",
                borderRadius: 14,
                padding: "2px 14px",
              }}
            >
              样片 {i + 1}
            </div>
          </div>
        );
      })}

      {/* Title block, already in place on frame 0; punches out on exit. */}
      <AbsoluteFill
        style={{
          scale: String(interpolate(exit, [0, 1], [1, 2.4])),
          opacity: interpolate(exit, [0, 0.7], [1, 0], clamp),
          transformOrigin: "30% 50%",
        }}
      >
        <div style={{ position: "absolute", left: 110, top: 150 }}>
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
              Seedance 2.5 新功能
            </div>
          </div>

          <div
            style={{
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 250,
              lineHeight: 1.02,
              letterSpacing: 6,
              marginTop: 26,
              rotate: "-4deg",
              transformOrigin: "0 50%",
              scale: String(interpolate(frame, [0, 10, 18], [1, 1.04, 1], { ...clamp, easing: pop })),
            }}
          >
            <div style={outlined("#fff")}>样片</div>
            <div style={{ ...outlined("#FFE14D"), marginLeft: 120 }}>模式</div>
          </div>

          <div
            style={{
              marginTop: 40,
              marginLeft: 30,
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
            快速低成本出多个样片，挑一条成片
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

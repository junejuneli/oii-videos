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
import { TAG } from "./tags";

const pop = Easing.bezier(0.34, 1.56, 0.64, 1);

// Thick-outlined, drop-shadowed display type in the style of video covers.
const outlined = (fill: string, stroke = 16, depth = 12): React.CSSProperties => ({
  color: fill,
  WebkitTextStroke: `${stroke}px ${INK}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${depth}px 0 ${INK}, 0 ${depth + 14}px 40px rgba(0,0,0,0.55)`,
});

// Canvas assets as they appear on the canvas, each with its colour tags.
const CARDS = [
  { src: "assets/card_pengHua.jpg", name: "捧花仰望", tags: [TAG.yellow, TAG.green], x: 1010, y: 110, r: -7 },
  { src: "assets/card_xiYang.jpg", name: "夕阳裙摆", tags: [TAG.green], x: 1370, y: 170, r: 6 },
  { src: "assets/card_huaShu.jpg", name: "花束拼贴", tags: [TAG.yellow], x: 1080, y: 560, r: 5 },
  { src: "assets/card_muChang.jpg", name: "牧场逆光", tags: [TAG.green], x: 1440, y: 600, r: -6 },
];

export const TagDots: React.FC<{ colors: string[]; size?: number }> = ({ colors, size = 26 }) => (
  <div style={{ display: "flex" }}>
    {colors.map((c, i) => (
      <div
        key={c}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: c,
          border: `3px solid ${INK}`,
          marginLeft: i ? -size * 0.35 : 0,
        }}
      />
    ))}
  </div>
);

/**
 * Marketing cover. Frame 0 is already the finished cover; the tagged asset
 * cards take a bow one after another, then the title punches out toward the
 * viewer to reveal the canvas take underneath.
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
      <AbsoluteFill style={{ opacity: bgOpacity, backgroundColor: INK }}>
        <AbsoluteFill
          style={{
            scale: String(interpolate(frame, [0, durationInFrames], [1.14, 1.06])),
            filter: "brightness(0.55) saturate(1.2) blur(4px)",
          }}
        >
          <Img src={staticFile("assets/overview_end.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 28% 50%, rgba(240,52,155,0.55), rgba(240,52,155,0) 70%), linear-gradient(90deg, rgba(10,10,12,0.8), rgba(10,10,12,0.15) 55%)",
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

      {CARDS.map((card, i) => {
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
            key={card.src}
            style={{
              position: "absolute",
              left: card.x,
              top: card.y,
              rotate: `${card.r * (1 - bow * 0.6) + fly * card.r * 2}deg`,
              scale: String(1 + bow * 0.12 - fly * 0.15),
              translate: `${fly * 900}px ${fly * (i % 2 ? -260 : 220)}px`,
              opacity: 1 - fly,
              zIndex: bow > 0.05 ? 5 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
                fontFamily: FONT_CN,
                fontWeight: 700,
                fontSize: 32,
                color: "#fff",
                textShadow: `0 3px 0 ${INK}`,
              }}
            >
              <TagDots colors={card.tags} />
              {card.name}
            </div>
            <div
              style={{
                width: 260,
                height: 350,
                borderRadius: 24,
                overflow: "hidden",
                border: `7px solid ${bow > 0.05 ? card.tags[card.tags.length - 1] : "#fff"}`,
                boxShadow: `0 ${24 + bow * 20}px ${60 + bow * 30}px rgba(0,0,0,0.55)`,
              }}
            >
              <Img src={staticFile(card.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        );
      })}

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
              画布新功能
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
            <div style={outlined("#fff")}>颜色</div>
            <div style={{ display: "flex", alignItems: "center", marginLeft: 120, gap: 30 }}>
              <span style={outlined("#FFE14D")}>标签</span>
              <TagDots colors={[TAG.yellow, TAG.red, TAG.blue, TAG.green]} size={58} />
            </div>
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
            素材再多，一眼就找到
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

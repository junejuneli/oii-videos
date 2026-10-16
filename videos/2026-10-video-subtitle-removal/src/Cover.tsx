import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, clamp, FONT_CN, INK, PINK } from "@oii/kit";

const pop = Easing.bezier(0.34, 1.56, 0.64, 1);

// Thick-outlined, drop-shadowed display type in the style of video covers.
const outlined = (fill: string, stroke = 16, depth = 12): React.CSSProperties => ({
  color: fill,
  WebkitTextStroke: `${stroke}px ${INK}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${depth}px 0 ${INK}, 0 ${depth + 14}px 40px rgba(0,0,0,0.55)`,
});


/**
 * Marketing cover (brand spec): blurred footage behind, Logo + feature tag,
 * big outlined title, one-line promise and four before/after cards on the
 * right. Frame 0 is already the finished cover; the cards bow in turn, then
 * the title punches out toward the viewer to reveal what is underneath.
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
          <Img src={staticFile("assets/sub-after.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

      {/* Two cards (with watermark / cleaned), each with a magnifier on the same spot. */}
      {(() => {
        const CW = 380;
        const CH = 507;
        const R = { x: 0.5, y: 0.835 }; // the spot both loupes point at
        const Z = 2.0;
        const L = 290; // loupe diameter
        const card = (i: number, src: string, label: string, bg: string, color: string) => {
          const fly = interpolate(frame, [exitAt - 4 + i * 2, durationInFrames - 2], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
          const bow = interpolate(frame, [4 + i * 6, 9 + i * 6, 16 + i * 6], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
          const rot = 0; // no tilt: rotation resamples the photo and softens it
          const mx = R.x * CW;
          const my = R.y * CH;
          const lx = mx - L / 2 - 40;
          const ly = CH + 40;
          return (
            <div
              key={src}
              style={{
                position: "absolute",
                left: i ? 1450 : 1010,
                top: i ? 70 : 40,
                width: CW,
                height: CH,
                rotate: `${rot + fly * rot * 2}deg`,
                scale: String(1 + bow * 0.05 - fly * 0.15),
                translate: `${fly * 900}px ${fly * (i ? -200 : 200)}px`,
                opacity: 1 - fly,
              }}
            >
              <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", border: "9px solid #fff", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
                <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 12, left: 12, fontFamily: FONT_CN, fontWeight: 700, fontSize: 32, color, background: bg, borderRadius: 14, padding: "4px 16px", border: `3px solid ${INK}` }}>{label}</div>
              </div>
              {/* marker on the spot + pointer line to the loupe */}
              <div style={{ position: "absolute", left: mx - 40, top: my - 40, width: 80, height: 80, borderRadius: 40, border: "5px solid #FFE14D", boxShadow: `0 0 0 3px ${INK}` }} />
              <svg width={CW} height={CH + L} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                <line x1={mx} y1={my + 40} x2={lx + L / 2} y2={ly} stroke="#FFE14D" strokeWidth={7} />
              </svg>
              <div
                style={{
                  position: "absolute",
                  left: lx,
                  top: ly,
                  width: L,
                  height: L,
                  borderRadius: L / 2,
                  overflow: "hidden",
                  border: "8px solid #FFE14D",
                  boxShadow: `0 0 0 4px ${INK}, 0 20px 50px rgba(0,0,0,0.6)`,
                  background: "#000",
                }}
              >
                <Img
                  src={staticFile(src)}
                  style={{ position: "absolute", width: CW * Z, height: CH * Z, left: L / 2 - 8 - mx * Z, top: L / 2 - 8 - my * Z, maxWidth: "none", objectFit: "cover", filter: "contrast(1.5) saturate(1.1)" }}
                />
              </div>
            </div>
          );
        };
        return (
          <>
            {card(0, "assets/sub-before.png", "带字幕", PINK, "#fff")}
            {card(1, "assets/sub-after.png", "去字幕后", "#7CF29A", INK)}
          </>
        );
      })()}

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
              去除字幕 · 自动 / 框选
            </div>
          </div>

          <div
            style={{
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 190,
              lineHeight: 1.02,
              letterSpacing: 6,
              marginTop: 26,
              rotate: "-4deg",
              transformOrigin: "0 50%",
              scale: String(interpolate(frame, [0, 8, 14], [1, 1.04, 1], { ...clamp, easing: pop })),
            }}
          >
            <div style={outlined("#fff")}>视频轻松</div>
            <div style={{ ...outlined("#FFE14D"), marginLeft: 120 }}>去字幕</div>
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
            自动识别、框一下，字幕退退退
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

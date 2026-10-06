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
import { clamp, FONT_CN, FONT_DISPLAY, GRADIENT, INK, LogoChip } from "@oii/kit";

const FINAL_REAL = staticFile("assets/final_real.mp4");

/**
 * The generated 1080p final: it grows out of the canvas viewer, plays in
 * full with its own sound; the end titles are laid over it separately.
 */
export const FinalPlay: React.FC<{
  /** Screen rect the film grows out of (the canvas node it was opened from). */
  from?: { x: number; y: number; w: number; h: number };
  /** Frames into the film to start at, to match what the canvas was showing. */
  startFrom?: number;
}> = ({ from, startFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const grow = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const r = from ?? { x: 58, y: 33, w: 1805, h: 1015 };
  const badge = interpolate(frame, [22, 38], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.4, 0.64, 1),
  });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          left: interpolate(grow, [0, 1], [r.x, 0]),
          top: interpolate(grow, [0, 1], [r.y, 0]),
          width: interpolate(grow, [0, 1], [r.w, 1920]),
          height: interpolate(grow, [0, 1], [r.h, 1080]),
          opacity: from ? 1 : grow,
          borderRadius: interpolate(grow, [0, 1], [22, 0]),
          overflow: "hidden",
          boxShadow: `0 30px 90px rgba(0,0,0,${0.6 * (1 - grow)})`,
        }}
      >
        <Video
          src={FINAL_REAL}
          trimBefore={startFrom}
          volume={(f) =>
            interpolate(f, [0, 8, durationInFrames - 14, durationInFrames], [0, 1, 1, 0], clamp)
          }
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 64,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: badge,
          scale: String(interpolate(badge, [0, 1], [0.9, 1])),
          transformOrigin: "0 50%",
        }}
      >
        <div
          style={{
            fontFamily: FONT_CN,
            fontWeight: 600,
            fontSize: 38,
            letterSpacing: 2,
            color: "#fff",
            background: GRADIENT,
            borderRadius: 16,
            padding: "12px 26px",
            boxShadow: "0 16px 50px rgba(240,52,155,0.45)",
          }}
        >
          Seedance 2.5 样片模式
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 2,
            color: "#fff",
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 16,
            padding: "12px 22px",
          }}
        >
          1080P 成片
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * End titles over the final's closing image: "OiiOii × Seedance 2.5"
 * top-right, and the slogan bottom-left on a compact variety-show plate
 * (spinning burst, sliding stripes, bouncing dots). Both blur in once; the
 * film stays the centre of the frame.
 */
export const EndOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  const bounce = Easing.bezier(0.34, 1.4, 0.64, 1);
  const top = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: bounce });
  const plate = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: bounce });
  const blurTop = interpolate(frame, [0, 12], [20, 0], clamp);
  const blurPlate = interpolate(frame, [6, 18], [20, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* Top-right brand line. */}
      <div
        style={{
          position: "absolute",
          right: 72,
          top: 60,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
          filter: `blur(${blurTop}px)`,
          translate: `${interpolate(top, [0, 1], [60, 0])}px 0px`,
        }}
      >
        <LogoChip height={34} />
        <div
          style={{
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 48,
            letterSpacing: 2,
            color: "#fff",
            WebkitTextStroke: `8px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 5px 0 ${INK}`,
            whiteSpace: "nowrap",
          }}
        >
          × Seedance 2.5
        </div>
      </div>

      {/* Bottom-left slogan on a compact animated plate. */}
      <div
        style={{
          position: "absolute",
          left: 70,
          bottom: 78,
          width: 1000,
          height: 150,
          filter: `blur(${blurPlate}px)`,
          opacity: interpolate(frame, [6, 12], [0, 1], clamp),
          translate: `${interpolate(plate, [0, 1], [-100, 0])}px ${interpolate(plate, [0, 1], [60, 0])}px`,
          scale: String(interpolate(plate, [0, 1], [0.82, 1])),
          transformOrigin: "0% 100%",
        }}
      >
        <svg
          width={240}
          height={240}
          viewBox="-120 -120 240 240"
          style={{ position: "absolute", left: -70, top: -95, rotate: `${frame * 2.4}deg` }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <path
              key={i}
              d="M0 0 L-18 -118 L18 -118 Z"
              fill={i % 2 ? "#FFE14D" : "#FF5DB1"}
              opacity={0.9}
              transform={`rotate(${30 * i})`}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            border: `5px solid ${INK}`,
            boxShadow: `0 10px 0 ${INK}, 0 24px 50px rgba(0,0,0,0.45)`,
            background: `repeating-linear-gradient(115deg, rgba(255,255,255,0.16) 0 22px, rgba(255,255,255,0) 22px 52px), linear-gradient(100deg, #FF4FAE 0%, #F0349B 45%, #9B4DFF 100%)`,
            backgroundPosition: `${frame * 3}px 0, 0 0`,
            rotate: "-2deg",
          }}
        />
        {[
          { x: 952, y: -16, c: "#FFE14D", s: 28 },
          { x: 990, y: 70, c: "#fff", s: 18 },
          { x: 870, y: 128, c: "#5CF2FF", s: 22 },
        ].map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y + Math.sin((frame + i * 9) / 5) * 8,
              width: d.s,
              height: d.s,
              borderRadius: "50%",
              background: d.c,
              border: `4px solid ${INK}`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            rotate: "-2deg",
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 84,
            letterSpacing: 4,
            color: "#FFE14D",
            WebkitTextStroke: `12px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 7px 0 ${INK}`,
            whiteSpace: "nowrap",
          }}
        >
          低成本出样，选择即成片
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Holds the final's closing image under the end title. */
export const FinalHold: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Img src={staticFile("assets/final_last.jpg")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);

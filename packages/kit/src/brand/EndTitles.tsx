import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT_CN, INK } from "../theme";
import { LogoChip } from "./index";

/**
 * End titles laid over a video's closing image: the OiiOii logo plus a short
 * line top-right, and the slogan bottom-left on a compact variety-show plate
 * (spinning burst, sliding stripes, bouncing dots). Both blur in once and the
 * whole layer fades out over the last 12 frames of its sequence.
 */
export const EndTitles: React.FC<{
  /** Text next to the logo, e.g. "× Seedance 2.5" or a feature name. */
  brand: string;
  slogan: string;
  /** Plate width; size it to the slogan so the plate only wraps the text. */
  plateWidth?: number;
}> = ({ brand, slogan, plateWidth = 1000 }) => {
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
          {brand}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          bottom: 78,
          width: plateWidth,
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
          { x: plateWidth - 48, y: -16, c: "#FFE14D", s: 28 },
          { x: plateWidth - 10, y: 70, c: "#fff", s: 18 },
          { x: plateWidth - 130, y: 128, c: "#5CF2FF", s: 22 },
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
            inset: 0,
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
          {slogan}
        </div>
      </div>
    </AbsoluteFill>
  );
};

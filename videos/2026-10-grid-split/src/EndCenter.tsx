import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT_CN, INK, LogoChip } from "@oii/kit";

/**
 * Closing titles: the canvas behind melts into a Gaussian blur while the big
 * slogan and the "OiiOii 颜色标签" line blur into focus at the centre.
 */
export const EndCenter: React.FC<{ title: string; brand: string }> = ({ title, brand }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const bounce = Easing.bezier(0.34, 1.4, 0.64, 1);
  const bg = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const t1 = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: bounce });
  const t2 = interpolate(frame, [14, 28], [0, 1], { ...clamp, easing: bounce });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backdropFilter: `blur(${bg * 18}px)`,
          WebkitBackdropFilter: `blur(${bg * 18}px)`,
          background: `rgba(10,10,12,${bg * 0.45})`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 46,
          opacity: out,
        }}
      >
        <div
          style={{
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 132,
            letterSpacing: 8,
            color: "#FFE14D",
            WebkitTextStroke: `16px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 10px 0 ${INK}, 0 24px 50px rgba(0,0,0,0.5)`,
            whiteSpace: "nowrap",
            opacity: interpolate(frame, [6, 12], [0, 1], clamp),
            filter: `blur(${interpolate(frame, [6, 18], [24, 0], clamp)}px)`,
            scale: String(interpolate(t1, [0, 1], [0.86, 1])),
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: interpolate(frame, [14, 20], [0, 1], clamp),
            filter: `blur(${interpolate(frame, [14, 26], [20, 0], clamp)}px)`,
            translate: `0px ${interpolate(t2, [0, 1], [30, 0])}px`,
          }}
        >
          <LogoChip height={44} />
          <div
            style={{
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: 4,
              color: "#fff",
              WebkitTextStroke: `10px ${INK}`,
              paintOrder: "stroke fill",
              textShadow: `0 6px 0 ${INK}`,
            }}
          >
            {brand}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

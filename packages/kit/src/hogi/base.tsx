// Shared language for the Hogi* components, taken from hogi-marketing-kit:
// poster type (Google Sans Flex at width 120, weights 550/600; MiSans for Chinese)
// with -0.01em tracking and no outlines, brand colours from src/brand.json, and
// the brand motion (16px rise + 600ms reveal, 900ms colour settle, 180ms exit).
import React, { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND } from "../brand";

export const HOGI = {
  black: "#000000",
  white: "#FFFFFF",
  green: "#D2FF5E",
  pink: "#FF1EB4",
  /** Pink for text on dark footage; the default emphasis colour. */
  pinkText: "#FF6CC2",
  toast: "rgba(44, 44, 46, 0.92)",
};

export const HOGI_FONT = '"Hogi Sans", "MiSans", sans-serif';
export const hogiEase = Easing.bezier(0.22, 1, 0.36, 1);

/** brand.json motion, in frames at 30fps. */
export const HOGI_MOTION = { reveal: 18, exit: 5, settle: 27, rise: 16 };

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

let fonts: Promise<void> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all(
    (
      [
        ["Hogi Sans", BRAND.fonts.sans550, "550"],
        ["Hogi Sans", BRAND.fonts.sans600, "600"],
        ["MiSans", BRAND.fonts.misans, "100 900"],
      ] as const
    ).map(async ([family, src, weight]) => {
      const face = new FontFace(family, `url(${src})`, { weight });
      await face.load();
      document.fonts.add(face);
    }),
  ).then(() => undefined));

/** Holds the render until the poster faces are loaded (brand/fonts). */
export const useHogiFonts = () => {
  const [handle] = useState(() => delayRender("Loading hogi fonts"));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle), cancelRender);
  }, [handle]);
};

export const type = (
  size: number,
  weight = 600,
  lineHeight = 1.2,
): React.CSSProperties => ({
  fontFamily: HOGI_FONT,
  fontSize: size,
  fontWeight: weight,
  lineHeight: `${Math.round(size * lineHeight)}px`,
  letterSpacing: "-0.01em",
  whiteSpace: "pre",
});

/** Rise + reveal from `delay`, and the brand exit at the end of the sequence. */
export const useEnter = (delay = 0, exit = HOGI_MOTION.exit) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame - delay, [0, HOGI_MOTION.reveal], [0, 1], {
    ...clamp,
    easing: hogiEase,
  });
  const out = interpolate(
    frame,
    [durationInFrames - exit, durationInFrames],
    [1, 0],
    clamp,
  );
  return { opacity: p * out, rise: (1 - p) * HOGI_MOTION.rise };
};

export const enterStyle = (e: {
  opacity: number;
  rise: number;
}): React.CSSProperties => ({
  opacity: e.opacity,
  translate: `0px ${e.rise}px`,
});

/** Accent → neutral colour settle over 900ms. */
export const useSettle = (from: string, to: string, delay = 0) => {
  const frame = useCurrentFrame();
  return interpolateColors(
    Math.max(0, frame - delay),
    [0, HOGI_MOTION.settle],
    [from, to],
  );
};

/** Text with one phrase recoloured, as the poster renderer highlights. */
export const Highlight: React.FC<{
  text: string;
  highlight?: string;
  color?: string;
}> = ({ text, highlight, color = HOGI.pinkText }) => {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const parts = text.split(highlight);
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 ? (
            <span style={{ color }}>{highlight}</span>
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
};

/** Black gradient from one edge, the posters' way of keeping text readable. */
export const Scrim: React.FC<{
  edge: "top" | "bottom";
  height: number;
  strength?: number;
  opacity?: number;
}> = ({ edge, height, strength = 0.5, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      ...(edge === "top" ? { top: 0 } : { bottom: 0 }),
      height,
      opacity,
      background:
        edge === "bottom"
          ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,${strength}) 80%, rgba(0,0,0,${strength}) 100%)`
          : `linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

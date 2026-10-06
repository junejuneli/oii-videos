import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { clamp } from "../theme";

/** Black layer fading in over [from, to), e.g. before the logo sting. */
export const FadeToBlack: React.FC<{ from: number; to: number }> = ({ from, to }) => (
  <Sequence from={from} durationInFrames={to - from} name="Fade out">
    <BlackLayer len={to - from} />
  </Sequence>
);

const BlackLayer: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#000", opacity: interpolate(frame, [0, len], [0, 1], clamp) }}
    />
  );
};

/** Fades its children out over `len` frames starting at local frame `from`. */
export const FadeOut: React.FC<{ from: number; len: number; children: React.ReactNode }> = ({
  from,
  len,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [from, from + len], [1, 0], clamp) }}>
      {children}
    </AbsoluteFill>
  );
};

/** Fades its children in over the first `len` frames. */
export const FadeIn: React.FC<{ len?: number; children: React.ReactNode }> = ({
  len = 8,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, len], [0, 1], clamp) }}>
      {children}
    </AbsoluteFill>
  );
};

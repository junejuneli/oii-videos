import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  FadeIn,
  FadeOut,
  FadeToBlack,
  FONT_CN,
  INK,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";

const BODY = 150; // the video itself; replace with your scenes
const FADE = 14;
export const MAIN_DURATION = BODY + TRAILER_FRAMES;

export const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    <Sequence durationInFrames={BODY} name="Body">
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 80,
        }}
      >
        __TITLE__
      </AbsoluteFill>
    </Sequence>

    <FadeToBlack from={BODY - FADE} to={BODY} />
    <Sequence from={BODY} durationInFrames={TRAILER_FRAMES} name="OiiOii logo">
      <FadeIn len={8}>
        <Trailer />
      </FadeIn>
    </Sequence>

    <Sequence durationInFrames={BODY} name="Watermark">
      <FadeOut from={BODY - FADE - 4} len={FADE}>
        <Watermark />
      </FadeOut>
    </Sequence>
  </AbsoluteFill>
);

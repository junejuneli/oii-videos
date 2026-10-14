import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  FadeIn,
  FadeOut,
  FadeToBlack,
  FPS,
  INK,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";
import { Layout, LayoutCtx, LANDSCAPE, PORTRAIT } from "./layout";
import { SHOTS, TOTAL_SECONDS } from "./scenes";
import { TitleFlowerLayer } from "./TitleLayer";
import { VoCaption } from "./parts";

const BODY = TOTAL_SECONDS * FPS;
const FADE = 14;
export const MAIN_DURATION = BODY + TRAILER_FRAMES;

const Body: React.FC = () => (
  <>
    {SHOTS.map((s) => (
      <Sequence key={s.id} from={Math.round(s.t * FPS)} durationInFrames={Math.round(s.d * FPS)} name={s.id}>
        <AbsoluteFill>{s.node}</AbsoluteFill>
      </Sequence>
    ))}
    {SHOTS.filter((s) => s.vo).map((s) => (
      <Sequence key={`vo-${s.id}`} from={Math.round(s.t * FPS)} durationInFrames={Math.round(s.d * FPS)} name={`VO ${s.id}`}>
        <VoCaption text={s.vo as string} />
      </Sequence>
    ))}
    <TitleFlowerLayer />
  </>
);

const make = (layout: Layout): React.FC => {
  const C: React.FC = () => (
    <LayoutCtx.Provider value={layout}>
      <AbsoluteFill style={{ backgroundColor: INK }}>
        <Sequence durationInFrames={BODY} name="Body">
          <Body />
        </Sequence>
        <FadeToBlack from={BODY - FADE} to={BODY} />
        <Sequence from={BODY} durationInFrames={TRAILER_FRAMES} name="OiiOii logo">
          <FadeIn len={8}>
            <Trailer />
          </FadeIn>
        </Sequence>
        <Sequence durationInFrames={BODY} name="Watermark">
          <FadeOut from={BODY - FADE - 4} len={FADE}>
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 1920,
                height: 1080,
                transform: `scale(${layout.portrait ? 0.56 : 1})`,
                transformOrigin: "100% 100%",
              }}
            >
              <Watermark />
            </div>
          </FadeOut>
        </Sequence>
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
  return C;
};

export const Landscape = make(LANDSCAPE);
export const Portrait = make(PORTRAIT);

import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import {
  BRAND,
  BrandMark,
  buildTake,
  Callout,
  clamp,
  FadeIn,
  FadeOut,
  FadeToBlack,
  FreezePatch,
  GlowRect,
  INK,
  PatchCursor,
  PINK,
  Ripple,
  SpeedPill,
  StepCaption,
  TakeShot,
  TopHeadline,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";
import { Cover } from "./Cover";
import { EndOverlay, FinalHold, FinalPlay } from "./Scenes";

const REC_C = staticFile("rec/recC.mp4");
const STEPS = ["选参考", "连线生成", "写提示词", "选择样片模式", "选中成片"];

// One continuous take (recC.mp4) of the real flow on the canvas: the pointer,
// its trail and the click ripples were drawn in the page while recording.
// Cuts only drop stretches where the frame does not change (checked with
// PSNR at every cut), each cut dissolves over a few frames, and the camera
// path is continuous from shot to shot. Times are seconds in recC;
// coordinates are recording pixels (2x the 1512x772 viewport).

const OP = 1.85; // operation speed-up

const SHOTS: TakeShot[] = [
  {
    id: "select",
    start: 1.0,
    end: 4.9,
    rate: OP,
    cam: [
      { t: 0, x: 1512, y: 772, s: 0.72 },
      { t: 1, x: 1250, y: 860, s: 0.82 },
    ],
    clicks: [2.97],
  },
  {
    id: "connect",
    start: 23.0,
    end: 26.0,
    rate: OP,
    cam: [{ t: 1, x: 1950, y: 950, s: 1.0 }],
    clicks: [24.11],
  },
  {
    // After clicking 视频 the camera heads one way only: down into the
    // prompt box, riding along with the canvas' own pan.
    id: "newNode",
    start: 36.3,
    end: 40.4,
    rate: OP,
    cam: [
      { t: 0.3, x: 1950, y: 960, s: 1.0 },
      { t: 0.6, x: 1640, y: 960, s: 0.9 },
      { t: 1, x: 1510, y: 1040, s: 1.0 },
    ],
    clicks: [37.2],
  },
  {
    id: "textClick",
    start: 62.2,
    end: 63.7,
    rate: OP,
    cam: [{ t: 1, x: 1500, y: 1070, s: 1.1 }],
    clicks: [63.04],
  },
  {
    id: "typing",
    start: 63.7,
    end: 64.6,
    rate: 0.75,
    xfade: 0,
    cam: [{ t: 1, x: 1500, y: 1090, s: 1.14 }],
  },
  {
    id: "params",
    start: 71.9,
    end: 73.4,
    rate: OP,
    cam: [
      { t: 0.45, x: 1800, y: 1200, s: 1.05 },
      { t: 1, x: 2150, y: 860, s: 0.97 },
    ],
    clicks: [72.64],
  },
  {
    // The 1080p detour (86.5-88.4) is cut: the popover is held on its
    // pre-click still and a stand-in pointer travels straight to the
    // sample-mode switch, handing over to the real pointer as it flips on.
    id: "toggle",
    start: 87.0,
    end: 91.0,
    rate: OP,
    cam: [
      { t: 0.35, x: 2280, y: 920, s: 1.08 },
      { t: 1, x: 2300, y: 1040, s: 1.08 },
    ],
    clicks: [88.5, 90.07],
    overlay: (
      <>
        <FreezePatch
          until={31}
          pieces={[
            { src: "patch/popover.png", x: 1760, y: 210, w: 920, h: 1058 },
            { src: "patch/bar.png", x: 1680, y: 1268, w: 640, h: 84 },
          ]}
        />
        <PatchCursor
          until={31}
          keys={[
            { f: 0, x: 1932, y: 1304 },
            { f: 23, x: 2572, y: 952 },
            { f: 24, x: 2572, y: 952, press: true },
          ]}
        />
        <GlowRect x={1806} y={914} w={828} h={76} r={22} at={31} />
      </>
    ),
  },
  {
    id: "generate",
    start: 103.0,
    end: 107.2,
    rate: OP,
    cam: [
      { t: 0.3, x: 2200, y: 1180, s: 1.15 },
      { t: 0.62, x: 2256, y: 1290, s: 1.45 },
      { t: 1, x: 1512, y: 560, s: 0.92 },
    ],
    clicks: [105.53],
  },
  {
    id: "waitSamples",
    start: 107.2,
    end: 210.4,
    rate: 150,
    xfade: 0,
    cam: [{ t: 1, x: 1512, y: 520, s: 1.02 }],
  },
  {
    id: "sampleReady",
    start: 210.4,
    end: 211.9,
    rate: 1.6,
    xfade: 0,
    cam: [{ t: 1, x: 1512, y: 560, s: 0.95 }],
  },
  {
    id: "panOut",
    start: 264.0,
    end: 266.9,
    rate: 1.5,
    cam: [
      { t: 0.15, x: 1512, y: 600, s: 0.82 },
      { t: 1, x: 1512, y: 772, s: 0.68 },
    ],
    overlay: <Callout x={1240} y={520} at={50} text="✓ 4 个样片已生成" />,
  },
  {
    id: "compareA",
    start: 309.6,
    end: 313.6,
    rate: 1.75,
    xfade: 8,
    cam: [
      { t: 0.3, x: 2030, y: 765, s: 1.12 },
      { t: 1, x: 2060, y: 765, s: 1.16 },
    ],
    clicks: [312.17],
  },
  {
    id: "compareB",
    start: 327.6,
    end: 332.4,
    rate: 1.9,
    xfade: 8,
    cam: [
      { t: 0.32, x: 1485, y: 765, s: 0.75 },
      { t: 1, x: 1485, y: 770, s: 0.78 },
    ],
    clicks: [328.59],
  },
  {
    id: "pick",
    start: 353.8,
    end: 358.7,
    rate: OP,
    cam: [
      { t: 0.27, x: 1900, y: 780, s: 0.86 },
      { t: 0.6, x: 1450, y: 720, s: 0.82 },
      { t: 1, x: 1300, y: 700, s: 0.8 },
    ],
    clicks: [355.18],
  },
  {
    id: "hoverFinal",
    start: 376.6,
    end: 378.8,
    rate: OP,
    cam: [{ t: 1, x: 1000, y: 560, s: 1.25 }],
    overlay: <GlowRect x={634} y={382} w={326} h={80} r={24} at={14} />,
  },
  {
    id: "finalClick",
    start: 424.2,
    end: 427.6,
    rate: OP,
    cam: [
      { t: 0.3, x: 1200, y: 560, s: 1.0 },
      { t: 1, x: 1600, y: 640, s: 0.76 },
    ],
    clicks: [424.69],
    overlay: <GlowRect x={634} y={382} w={326} h={80} r={24} at={0} drawFrames={0} until={12} />,
  },
  {
    id: "panFinal",
    start: 441.5,
    end: 443.9,
    rate: 1.6,
    cam: [{ t: 1, x: 1811, y: 772, s: 0.82 }],
  },
  {
    id: "waitFinal",
    start: 443.9,
    end: 504.4,
    rate: 40,
    xfade: 0,
    cam: [{ t: 1, x: 1811, y: 772, s: 0.9 }],
  },
  {
    id: "finalReady",
    start: 504.4,
    end: 506.6,
    rate: 1.5,
    xfade: 0,
    cam: [{ t: 1, x: 1760, y: 772, s: 0.84 }],
  },
  {
    // Push straight into the finished final ...
    id: "finalZoom",
    start: 506.6,
    end: 507.4,
    xfade: 0,
    cam: [{ t: 1, x: 1811, y: 794, s: 1.55 }],
  },
  {
    // ... and dissolve onto the same node, framed identically, where the
    // pointer goes up to its expand button (icons appear on hover).
    id: "toExpand",
    start: 607.0,
    end: 609.7,
    rate: OP,
    fresh: true,
    xfade: 10,
    cam: [
      { t: 0, x: 1511, y: 800, s: 1.35 },
      { t: 1, x: 1511, y: 775, s: 1.3 },
    ],
  },
  {
    // Hold on the click (the node has only just started its inline preview,
    // so it still matches the film's first frame); the film then grows out
    // of this node rect.
    id: "press",
    start: 609.7,
    end: 609.735,
    rate: 0.025,
    xfade: 0,
    cam: [{ t: 1, x: 1511, y: 775, s: 1.3 }],
    clicks: [609.703],
    overlay: <Ripple x={2076} y={504} at={3} />,
  },
];

const take = buildTake(REC_C, SHOTS);

const COVER = 66; // marketing cover, exits by punching into the canvas
const T0 = COVER - 18; // canvas take starts under the cover's exit
const FINAL = 296; // the whole 1080p final (from 0.2s, where the canvas preview had got to)
const OVERLAP = 18; // the final grows out of the node while the canvas still sits behind it
const END_IN = 40; // end title arrives this many frames before the final ends
const HOLD = 54; // closing image held under the end title
const FADE = 14; // fade to black before the logo sting
const TRAILER = TRAILER_FRAMES;

const F0 = T0 + take.total - OVERLAP; // final starts
const E0 = F0 + FINAL - END_IN; // end title starts over the last moments of the final
const H0 = F0 + FINAL; // closing image hold
const L0 = H0 + HOLD; // OiiOii logo sting
export const PROMO_DURATION = L0 + TRAILER;

export const Promo: React.FC = () => {
  const { Take, total, span, clicks } = take;
  const at = (id: string, from?: string) => {
    const s = span(id, from);
    return { from: T0 + s.from, durationInFrames: s.durationInFrames };
  };
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={T0} durationInFrames={total} name="Canvas take">
        <Take />
      </Sequence>

      <Sequence durationInFrames={COVER} name="Cover">
        <Cover exitAt={COVER - 18} />
      </Sequence>

      <Sequence from={at("select").from + 18} durationInFrames={at("select").durationInFrames - 18} name="01">
        <StepCaption steps={STEPS} step={1} />
      </Sequence>
      <Sequence {...at("connect", "newNode")} name="02">
        <StepCaption steps={STEPS} step={2} />
      </Sequence>
      <Sequence {...at("textClick", "typing")} name="03">
        <StepCaption steps={STEPS} step={3} />
      </Sequence>
      <Sequence {...at("params", "generate")} name="04">
        <StepCaption steps={STEPS} step={4} note="样片模式 · 数量 4" />
      </Sequence>
      <Sequence {...at("waitSamples")} name="Generating samples">
        <SpeedPill label="4 个样片生成中" />
      </Sequence>
      <Sequence {...at("compareA", "compareB")} name="Compare">
        <TopHeadline>
          多条样片演绎，<span style={{ color: PINK }}>同屏对比</span>
        </TopHeadline>
      </Sequence>
      <Sequence {...at("pick", "press")} name="05">
        <StepCaption steps={STEPS} step={5} note="一键生成 1080p 成片" />
      </Sequence>
      <Sequence {...at("waitFinal")} name="Generating final">
        <SpeedPill label="1080p 成片生成中" />
      </Sequence>

      <Sequence from={at("connect").from} durationInFrames={F0 - at("connect").from} name="Brand">
        <BrandMark label="Seedance 2.5 · 样片模式" />
      </Sequence>

      <Sequence from={F0} durationInFrames={FINAL} name="成片">
        <FinalPlay from={{ x: 163, y: 92, w: 1594, h: 897 }} startFrom={6} />
      </Sequence>
      <Sequence from={H0 - 12} durationInFrames={HOLD + 12} name="Hold">
        <FinalHold />
      </Sequence>
      <Sequence from={E0} durationInFrames={L0 - E0} name="落版">
        <EndOverlay />
      </Sequence>
      <FadeToBlack from={L0 - FADE} to={L0} />
      <Sequence from={L0} durationInFrames={TRAILER} name="OiiOii logo">
        <FadeIn len={8}>
          <Trailer />
        </FadeIn>
      </Sequence>

      <Sequence from={T0} durationInFrames={L0 - T0} name="Watermark">
        <FadeOut from={L0 - T0 - FADE - 4} len={FADE}>
          <Watermark />
        </FadeOut>
      </Sequence>

      {/* Music: quieter overall, ducked under the final, eased out into the logo sting. */}
      <Audio
        src={staticFile("sfx/music.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 8, F0 - 10, F0 + 12, H0 - 16, H0 + 4, L0 - 40, L0 + 4],
            [0, 0.36, 0.36, 0.1, 0.1, 0.28, 0.28, 0],
            clamp,
          )
        }
      />
      {clicks.map((c) => (
        <Sequence key={`c${c}`} from={T0 + c} durationInFrames={4} name="Click">
          <Audio src={BRAND.click} volume={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  BRAND,
  buildTake,
  clamp,
  easeOut,
  FadeIn,
  FadeOut,
  FadeToBlack,
  GlowRect,
  INK,
  MemeTitle,
  PINK,
  StepCaption,
  Sticker,
  TakeShot,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";
import { Cover } from "./Cover";
import { EndCenter } from "./EndCenter";
import { TAG } from "./tags";

// One continuous take of the colour-tag flow, built from two recordings of
// the same canvas: recA (single tag, batch tag) and recB (multi-colour on
// hover, highlight, locate, rename, download). The pointer, its trail,
// ripples and the marquee were drawn in the page while recording. Cuts only
// drop stretches where the frame does not change (the pointer waits in place
// while the real click is sent), and recA's cuts land just before / after the
// "保存失败" toasts so those never show. The two recordings are joined where
// they share a camera (the title close-up, then the overview). Times are
// seconds in each recording (see public/rec/*.marks.txt); coordinates are
// recording pixels (2x the 1512x772 viewport).

const REC = staticFile("rec/recA.mp4");
const REC_B = staticFile("rec/recB.mp4");
const OP = 2; // operation speed-up
const S = 0.7; // base camera scale: 1544 rec px fill the 1080 frame height
const HOME = { x: 1512, y: 772, s: S };

const STEPS = ["添加颜色标签", "框选批量标记", "点颜色，同类高亮", "点名字，直接定位", "重命名 · 批量下载"];

/** Canvas coordinates -> recording pixels for a known canvas viewport. */
const toRec = (cam: { cx: number; cy: number; z: number }) => (x: number, y: number, w: number, h: number) => ({
  x: (756 + (x - cam.cx) * cam.z) * 2,
  y: (386 + (y - cam.cy) * cam.z) * 2,
  w: w * cam.z * 2,
  h: h * cam.z * 2,
});

// Canvas rects (x, y, w, h) of the tagged nodes.
const P: [number, number, number, number] = [1750, -1149, 225, 300]; // 捧花仰望
const GREEN_B: [number, number, number, number][] = [
  [4210, -1125, 200, 300],
  [4436, -1125, 200, 300],
  [4654, -1125, 200, 300],
  [4929, -1125, 225, 300],
  [4081, -752, 200, 300],
  [4343, -752, 225, 300],
  [4629, -752, 225, 300],
  [4929, -752, 225, 300],
];

/** Soft pulsing outline around a highlighted node (the app's own is a hairline). */
const NodeGlow: React.FC<{ r: { x: number; y: number; w: number; h: number }; color: string; at: number }> = ({
  r,
  color,
  at,
}) => {
  const frame = useCurrentFrame() - at;
  if (frame < 0) return null;
  const inP = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const pulse = 0.75 + 0.25 * Math.sin(frame / 4);
  const pad = 8;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x - pad,
        top: r.y - pad,
        width: r.w + pad * 2,
        height: r.h + pad * 2,
        borderRadius: 14,
        border: `5px solid ${color}`,
        boxShadow: `0 0 ${26 * pulse}px ${color}, inset 0 0 ${16 * pulse}px ${color}88`,
        opacity: inP,
        scale: String(interpolate(inP, [0, 1], [1.08, 1])),
      }}
    />
  );
};

const SHIFTED = { cx: 4300, cy: -330, z: 0.265 };
const TOOLBAR = { x: 1540, y: 490, s: 1.12 };
const pRec = toRec(SHIFTED)(...P);

// Title colour dots in the 260% close-up (same framing in recA and recB).
const DOT_ONE = { x: 1132, y: 452, w: 112, h: 106, r: 48 };
const DOT_THREE = { x: 1124, y: 450, w: 216, h: 110, r: 50 };
// 捧花仰望 at 100% after the list click centres it.
const P_FOCUS = { x: 1263, y: 458, w: 477, h: 620, r: 28 };

/** House style for this video: a slightly heavier streak than the kit default. */
const Glow: React.FC<React.ComponentProps<typeof GlowRect>> = (p) => <GlowRect stroke={10} {...p} />;

const SHOTS: TakeShot[] = [
  // 痛点: start on the hero photo, pull out until the canvas looks endless.
  { id: "hold", start: 10.6, end: 11.6, cam: [{ t: 0, ...HOME }] },
  { id: "pull1", start: 11.6, end: 14.8, rate: 2, cam: [{ t: 1, ...HOME }] },
  { id: "pull2", start: 17.7, end: 19.6, rate: 1.7, cam: [{ t: 1, ...HOME }] },
  { id: "painHold", start: 19.6, end: 20.4, xfade: 0, cam: [{ t: 1, ...HOME }] },

  // 01 single tag on 捧花仰望 ...
  { id: "pushin", start: 43.25, end: 46.5, rate: 2.1, xfade: 6, cam: [{ t: 1, ...HOME }], clicks: [46.23] },
  { id: "select", start: 51.35, end: 51.85, xfade: 2, cam: [{ t: 1, ...HOME }] },
  {
    id: "toTag",
    start: 61.7,
    end: 62.9,
    rate: OP,
    cam: [{ t: 1, ...HOME }],
    clicks: [62.57],
    overlay: <Glow x={2458} y={478} w={68} h={60} r={18} at={2} />,
  },
  {
    id: "picker",
    start: 69.55,
    end: 70.0,
    xfade: 2,
    cam: [{ t: 1, ...HOME }],
    overlay: <Glow x={2458} y={478} w={68} h={60} r={18} at={0} drawFrames={0} until={12} />,
  },
  { id: "toGreen", start: 78.75, end: 79.8, rate: 1.6, cam: [{ t: 1, ...HOME }], clicks: [79.47] },
  { id: "green", start: 80.35, end: 81.5, xfade: 2, cam: [{ t: 1, ...HOME }] },
  { id: "closeup", start: 90.3, end: 91.95, rate: 2.4, cam: [{ t: 1, ...HOME }] },
  {
    id: "clean",
    start: 111.95,
    end: 113.8,
    xfade: 3,
    cam: [{ t: 1, ...HOME }],
    overlay: <Glow {...DOT_ONE} at={6} />,
  },

  // ... then hover its colour dot and stack more colours (recB, same framing).
  {
    id: "bHold",
    src: REC_B,
    start: 6.9,
    end: 7.6,
    xfade: 6,
    cam: [{ t: 1, ...HOME }],
    overlay: <Glow {...DOT_ONE} at={0} drawFrames={0} />,
  },
  {
    id: "toDot",
    src: REC_B,
    start: 7.6,
    end: 9.6,
    rate: 1.3,
    xfade: 0,
    cam: [{ t: 1, ...HOME }],
    overlay: <Glow {...DOT_ONE} at={0} drawFrames={0} />,
  },
  { id: "toYellow", src: REC_B, start: 20.8, end: 22.3, rate: 1, xfade: 3, cam: [{ t: 1, ...HOME }], clicks: [21.94] },
  { id: "toBlue", src: REC_B, start: 23.1, end: 25.2, rate: 1.1, xfade: 3, cam: [{ t: 1, ...HOME }], clicks: [24.19] },
  {
    id: "multiHold",
    src: REC_B,
    start: 25.2,
    end: 27.2,
    xfade: 0,
    cam: [{ t: 1, ...HOME }],
    overlay: (
      <>
        <Glow {...DOT_THREE} at={2} />
      </>
    ),
  },
  { id: "away", src: REC_B, start: 34.2, end: 35.3, rate: 1.2, xfade: 3, cam: [{ t: 1, ...HOME }] },

  // 02 marquee batch: green on the warm photos and MVs on the right; the
  // camera leans in on the selection toolbar where the tag is picked.
  { id: "pan", start: 191.0, end: 193.8, rate: 2.2, xfade: 8, cam: [{ t: 0, ...HOME }, { t: 1, ...HOME }] },
  { id: "sel2", start: 199.35, end: 199.8, xfade: 3, cam: [{ t: 1, ...HOME }] },
  {
    id: "toTag3",
    start: 209.3,
    end: 210.9,
    rate: 2,
    cam: [{ t: 0.55, ...TOOLBAR }, { t: 1, ...TOOLBAR }],
    clicks: [210.56],
    overlay: <Glow x={1620} y={104} w={66} h={64} r={18} at={10} until={26} />,
  },
  { id: "toGreen2", start: 217.9, end: 219.3, rate: 1.8, cam: [{ t: 1, ...TOOLBAR }], clicks: [218.87] },
  { id: "green2", start: 219.85, end: 220.2, cam: [{ t: 1, ...TOOLBAR }] },
  { id: "green2Hold", start: 222.85, end: 224.4, xfade: 3, cam: [{ t: 1, ...HOME }] },

  // 03 pull back to the overview (recA), continue in recB from the same
  // framing: colour bar -> every green node lights up.
  { id: "overview", start: 233.1, end: 235.5, rate: 2, xfade: 6, cam: [{ t: 1, ...HOME }] },
  { id: "toBar", src: REC_B, start: 38.7, end: 40.0, rate: 1.3, xfade: 8, cam: [{ t: 1, ...HOME }] },
  {
    id: "openGreen",
    src: REC_B,
    start: 49.9,
    end: 51.4,
    xfade: 3,
    cam: [{ t: 1, ...HOME }],
    clicks: [50.69],
    overlay: <Glow x={2268} y={20} w={192} h={102} r={51} at={0} until={40} />,
  },
  { id: "shift", src: REC_B, start: 51.9, end: 54.1, rate: 2, xfade: 2, cam: [{ t: 1, ...HOME }] },
  {
    id: "hlHold",
    src: REC_B,
    start: 54.1,
    end: 56.2,
    xfade: 0,
    cam: [{ t: 1, ...HOME }],
    overlay: (
      <>
        <NodeGlow r={pRec} color={TAG.green} at={0} />
        {GREEN_B.map((n, i) => (
          <NodeGlow key={i} r={toRec(SHIFTED)(...n)} color={TAG.green} at={2 + i * 2} />
        ))}
      </>
    ),
  },

  // 04 click names in the list: the canvas flies to each node by itself.
  {
    id: "item1",
    src: REC_B,
    start: 69.2,
    end: 70.6,
    rate: 2,
    xfade: 4,
    cam: [{ t: 1, ...HOME }],
    clicks: [70.5],
    overlay: <Glow x={1990} y={208} w={450} h={84} r={20} at={2} />,
  },
  { id: "fly1", src: REC_B, start: 70.6, end: 71.0, rate: 0.6, xfade: 0, cam: [{ t: 1, ...HOME }] },
  {
    id: "hold1",
    src: REC_B,
    start: 71.0,
    end: 72.8,
    xfade: 0,
    cam: [{ t: 1, ...HOME }],
    overlay: (
      <>
        <Glow {...P_FOCUS} at={0} />
      </>
    ),
  },
  {
    id: "item2",
    src: REC_B,
    start: 73.5,
    end: 74.95,
    rate: 2,
    xfade: 3,
    cam: [{ t: 1, ...HOME }],
    clicks: [74.81],
    overlay: <Glow x={1990} y={350} w={450} h={84} r={20} at={3} />,
  },
  { id: "fly2", src: REC_B, start: 74.95, end: 75.2, rate: 0.6, xfade: 0, cam: [{ t: 1, ...HOME }] },
  // Thumbnails pop in ~0.4s after landing; dissolve straight to the loaded frame.
  { id: "hold2", src: REC_B, start: 76.0, end: 76.9, xfade: 7, cam: [{ t: 1, ...HOME }] },
  {
    id: "item3",
    src: REC_B,
    start: 77.7,
    end: 79.0,
    rate: 2,
    xfade: 3,
    cam: [{ t: 1, ...HOME }],
    clicks: [78.76],
    overlay: <Glow x={1990} y={566} w={450} h={84} r={20} at={3} />,
  },
  { id: "fly3", src: REC_B, start: 79.0, end: 79.85, rate: 0.6, xfade: 0, cam: [{ t: 1, ...HOME }] },
  { id: "hold3", src: REC_B, start: 79.85, end: 80.8, xfade: 0, cam: [{ t: 1, ...HOME }] },

  // 05 rename to 定稿, download all.
  { id: "toPencil", src: REC_B, start: 92.6, end: 95.0, rate: 2.2, xfade: 4, cam: [{ t: 1, x: 1760, y: 700, s: 0.8 }], clicks: [93.79] },
  { id: "typing", src: REC_B, start: 95.0, end: 98.3, rate: 1.8, xfade: 0, cam: [{ t: 1, x: 1760, y: 700, s: 0.8 }] },
  { id: "renamed", src: REC_B, start: 98.3, end: 99.3, xfade: 0, cam: [{ t: 1, x: 1760, y: 700, s: 0.8 }] },
  { id: "download", src: REC_B, start: 103.4, end: 108.6, rate: 2.4, xfade: 4, cam: [{ t: 1, ...HOME }], clicks: [104.65] },
  { id: "done", src: REC_B, start: 108.6, end: 110.4, xfade: 0, cam: [{ t: 1, ...HOME }] },
  // Bed for the blurred end titles: straight on from the finished download.
  { id: "endBed", src: REC_B, start: 110.4, end: 113.3, xfade: 0, cam: [{ t: 1, ...HOME }] },
];

const PACE = 1.12; // speed-up for pointer moves only; result holds play at real speed
const take = buildTake(
  REC,
  SHOTS.map((s) => ({ ...s, rate: (s.rate ?? 1) > 1 ? (s.rate as number) * PACE : s.rate })),
);

const COVER = 54;
const T0 = COVER - 18;
const END_LEN = 84; // end titles over the closing overview
const FADE = 14;

const TAKE_END = T0 + take.total;
const E0 = TAKE_END - END_LEN;
const L0 = TAKE_END; // OiiOii logo sting
export const PROMO_DURATION = L0 + TRAILER_FRAMES;

export const Promo: React.FC = () => {
  const { Take, total, span, clicks } = take;
  const at = (id: string, to?: string) => {
    const s = span(id, to);
    return { from: T0 + s.from, durationInFrames: s.durationInFrames };
  };
  const step = (n: number, from: string, to: string, note?: string) => (
    <Sequence {...at(from, to)} name={`0${n}`}>
      <StepCaption steps={STEPS} step={n} note={note} placement="top-left" bold />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={T0} durationInFrames={total} name="Canvas take">
        <Take />
      </Sequence>

      <Sequence durationInFrames={COVER} name="Cover">
        <Cover exitAt={COVER - 18} />
      </Sequence>

      <Sequence from={at("pull1").from} durationInFrames={at("pull1", "painHold").durationInFrames} name="痛点">
        <MemeTitle lines={["我的图呢？", "我那么大一张图呢？"]} />
      </Sequence>

      {/* Pink callouts name the key operations; yellow/green stickers mark results. */}
      <Sequence from={at("toTag").from} durationInFrames={at("toTag", "picker").durationInFrames + 12} name="花字·入口">
        <Sticker x={1430} y={410} text="👆 添加颜色标签入口" bg={PINK} color="#fff" rotate={-4} />
      </Sequence>
      <Sequence from={at("green").from} durationInFrames={at("green", "clean").durationInFrames} name="贴纸·已标记">
        <Sticker x={690} y={236} text="✓ 已标记" bg="#57B85A" color="#fff" rotate={-5} delay={12} />
      </Sequence>
      <Sequence from={at("toBlue").from} durationInFrames={at("toBlue", "multiHold").durationInFrames} name="贴纸·多色">
        <Sticker x={1010} y={214} text="添加多个颜色标签" rotate={6} />
      </Sequence>
      <Sequence from={at("sel2").from} durationInFrames={at("sel2", "green2").durationInFrames} name="花字·批量">
        <Sticker x={1290} y={104} text="👈 批量添加颜色标签" bg={PINK} color="#fff" rotate={-4} />
      </Sequence>
      <Sequence {...at("green2Hold")} name="贴纸·批量">
        <Sticker x={1420} y={420} text="一次标记 8 个 ✓" bg="#57B85A" color="#fff" rotate={6} delay={2} />
      </Sequence>
      <Sequence from={at("toBar").from} durationInFrames={at("toBar", "openGreen").durationInFrames} name="花字·找素材">
        <Sticker x={800} y={110} text="👉 点颜色，找到同类素材" bg={PINK} color="#fff" rotate={-4} />
      </Sequence>
      <Sequence {...at("hlHold")} name="贴纸·全亮">
        <Sticker x={930} y={165} text="唰～全亮了 ✨" rotate={-5} delay={8} />
      </Sequence>
      <Sequence {...at("hold1")} name="贴纸·直达">
        <Sticker x={840} y={770} text="一键直达 ✨" bg={PINK} color="#fff" rotate={-4} delay={3} />
      </Sequence>
      <Sequence from={at("toPencil").from} durationInFrames={at("toPencil", "typing").durationInFrames} name="花字·重命名">
        <Sticker x={640} y={180} text="✏️ 颜色标签可重命名" bg={PINK} color="#fff" rotate={-4} />
      </Sequence>
      <Sequence {...at("renamed")} name="贴纸·定稿">
        <Sticker x={900} y={150} text="✓ 改名「定稿」" rotate={-6} delay={2} size={36} />
      </Sequence>
      <Sequence {...at("done")} name="贴纸·打包">
        <Sticker x={1060} y={650} text="📦 标记素材已打包 zip 下载" rotate={5} delay={4} />
      </Sequence>

      {step(1, "pushin", "away", "悬停圆点，还能叠加多个颜色")}
      {step(2, "pan", "green2Hold", "图片、视频一次标记")}
      {step(3, "overview", "hlHold")}
      {step(4, "item1", "hold3", "一点名字，镜头自动聚焦")}
      {step(5, "toPencil", "done")}

      <Sequence from={E0} durationInFrames={L0 - E0} name="落版">
        <EndCenter title="素材分好类，创作不迷路" brand="颜色标签" />
      </Sequence>
      <FadeToBlack from={L0 - FADE} to={L0} />
      <Sequence from={L0} durationInFrames={TRAILER_FRAMES} name="OiiOii logo">
        <FadeIn len={8}>
          <Trailer />
        </FadeIn>
      </Sequence>

      <Sequence from={T0} durationInFrames={L0 - T0} name="Watermark">
        <FadeOut from={L0 - T0 - FADE - 4} len={FADE}>
          <Watermark />
        </FadeOut>
      </Sequence>

      <Audio
        src={staticFile("sfx/music.wav")}
        volume={(f) => interpolate(f, [0, 8, L0 - 40, L0 + 4], [0, 0.26, 0.22, 0], clamp)}
      />
      {clicks.map((c) => (
        <Sequence key={`c${c}`} from={T0 + c} durationInFrames={4} name="Click">
          <Audio src={BRAND.click} volume={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

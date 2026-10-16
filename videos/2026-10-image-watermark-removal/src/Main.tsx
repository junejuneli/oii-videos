import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  BRAND,
  buildTake,
  clamp,
  FadeIn,
  FONT_CN,
  FadeOut,
  FadeToBlack,
  GlowRect,
  PINK,
  INK,
  StepCaption,
  Sticker,
  TakeShot,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";
import { Cover } from "./Cover";
import { Opening } from "./Opening";
import { Wipe, WIPE_CUT, WIPE_LEN } from "./Wipe";
import { Compare } from "./Compare";

// Recordings of canvas 7aa63481 (3024x1544 rec px = 2x a 1512x772 viewport).
// Times are seconds inside each file; see brief.md「重录」.
//  imgA  技巧 1：水印 1 → 移除物体 → 涂抹右下角 → 发送
//  imgB  技巧 2：右键水印 2 → 生图 → 输入提示词 → 发送
const A = staticFile("rec/imgA.mp4");
const B = staticFile("rec/imgB.mp4");

type Cam = { x: number; y: number; s: number };
const CAM_A: Cam = { x: 1512, y: 780, s: 1.0 }; // node + toolbar / 涂抹擦除 bars
const CAM_PAINT: Cam = { x: 1650, y: 950, s: 1.4 }; // pushed in on the corner watermark + send
const CAM_B1: Cam = { x: 1512, y: 820, s: 0.85 }; // node + context menu
const CAM_B2: Cam = { x: 1512, y: 800, s: 0.82 }; // original + new node + prompt panel
const CAM_B3: Cam = { x: 1500, y: 1090, s: 1.2 }; // pushed in on the prompt panel

/** rec px -> 1920x1080 frame px under a camera, to place stickers. */
const toFrame = (c: Cam, x: number, y: number) => ({ x: 960 + (x - c.x) * c.s, y: 540 + (y - c.y) * c.s });

const Glow: React.FC<React.ComponentProps<typeof GlowRect>> = (p) => <GlowRect stroke={9} {...p} />;

// Rec px rectangles.
const R_ERASER = { x: 2026, y: 268, w: 88, h: 88, r: 44 }; // 移除物体
const R_BRUSH = { x: 1092, y: 248, w: 840, h: 96, r: 48 };
const R_PAINT = { x: 1548, y: 1070, w: 270, h: 104, r: 18 };
const R_SEND_A = { x: 1788, y: 1204, w: 84, h: 84, r: 42 };
const R_MENU_GEN = { x: 1532, y: 674, w: 396, h: 52, r: 12 }; // 生图
const R_TEXT = { x: 852, y: 1108, w: 676, h: 66, r: 12 };
const R_SEND_B = { x: 2094, y: 1366, w: 84, h: 84, r: 42 };

/**
 * The recording stops while the result is still generating. Hold its last
 * frame and fade the actual generated image into the node, so the viewer sees
 * the result land in the canvas before the close comparison. Rec px.
 */
const ResultReveal: React.FC<{ still: string; src: string; rect: { x: number; y: number; w: number; h: number; r: number } }> = ({ still, src, rect }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [14, 34], [0, 1], clamp);
  return (
    <>
      <Img src={staticFile(still)} style={{ position: "absolute", left: 0, top: 0, width: 3024, height: 1544 }} />
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: rect.r, overflow: "hidden", clipPath: `inset(0 0 ${100 - p * 100}% 0)` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: rect.x, top: rect.y + rect.h * p - 6, width: rect.w, height: 12, background: "linear-gradient(90deg, rgba(240,52,155,0), #F0349B, rgba(240,52,155,0))", opacity: p > 0 && p < 1 ? 1 : 0, filter: "blur(2px)" }} />
    </>
  );
};
const R_RES_A = { x: 1961, y: 377, w: 590, h: 790, r: 22 };
const R_RES_B = { x: 1236, y: 146, w: 553, h: 743, r: 24 };

// Painting strokes in imgA (rec seconds, rec px), measured from the pink mask growth.
const BRUSH_KEYS: [number, number, number][] = [
  [24.85, 1576, 1096], [25.15, 1576, 1096], [25.8, 1788, 1096], [26.1, 1788, 1124],
  [26.75, 1576, 1124], [27.05, 1576, 1148], [27.95, 1788, 1148], [28.6, 1788, 1148],
];
/** Brush ring + 「涂抹中」 pill riding on the cursor while painting. `t0`/`rate` map shot frames to rec time. */
const BrushCursor: React.FC<{ t0: number; rate: number }> = ({ t0, rate }) => {
  const f = useCurrentFrame();
  const t = t0 + (f * rate) / 30 + 0.1;
  const ts = BRUSH_KEYS.map((k) => k[0]);
  const x = interpolate(t, ts, BRUSH_KEYS.map((k) => k[1]), clamp);
  const y = interpolate(t, ts, BRUSH_KEYS.map((k) => k[2]), clamp);
  const o = interpolate(t, [24.7, 24.9, 28.4, 28.7], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      <div style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 30, border: "5px solid #F0349B", background: "rgba(240,52,155,0.18)", boxShadow: "0 0 0 3px rgba(255,255,255,0.9)" }} />
      <div style={{ position: "absolute", left: x + 40, top: y - 96, fontFamily: FONT_CN, fontWeight: 700, fontSize: 34, color: "#fff", background: PINK, borderRadius: 999, padding: "6px 20px", border: `4px solid ${INK}`, whiteSpace: "nowrap" }}>🖌 涂抹中</div>
    </div>
  );
};

const PROMPT = "去除这个图片里的各种水印，但是保留原图不变";
/**
 * The prompt was pasted in one go; cover it with the panel colour and reveal
 * it character by character so it reads as typed. Rec px.
 */
const Typewriter: React.FC<{ from: number; len: number }> = ({ from, len }) => {
  const f = useCurrentFrame();
  if (f < from - 1) return null;
  const p = interpolate(f, [from, from + len], [0, 1], clamp);
  const n = Math.floor(p * PROMPT.length);
  const left = 865 + (641 * n) / PROMPT.length;
  return (
    <>
      <div style={{ position: "absolute", left, top: 1112, width: 1520 - left, height: 58, background: "#141414" }} />
      {p < 1 ? <div style={{ position: "absolute", left: left + 2, top: 1122, width: 3, height: 40, background: PINK }} /> : null}
    </>
  );
};

const SHOTS_A: TakeShot[] = [
  { id: "aIntro", src: A, start: 5.6, end: 9.6, rate: 1.8, fresh: true, cam: [{ t: 0, ...CAM_A }] },
  { id: "aSel", src: A, start: 9.6, end: 11.6, rate: 1.12, xfade: 0, clicks: [10.7], cam: [{ t: 1, ...CAM_A }] },
  { id: "aIdle", src: A, start: 11.6, end: 14.8, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_A }] },
  { id: "aToEraser", src: A, start: 14.8, end: 17.9, rate: 1.3, xfade: 0, cam: [{ t: 1, ...CAM_A }], overlay: <Glow {...R_ERASER} at={20} /> },
  { id: "aHold", src: A, start: 17.9, end: 20.1, rate: 8, xfade: 0, cam: [{ t: 1, ...CAM_A }], overlay: <Glow {...R_ERASER} at={0} drawFrames={0} /> },
  { id: "aClick", src: A, start: 20.1, end: 22.0, rate: 1.12, xfade: 0, clicks: [20.4], cam: [{ t: 1, ...CAM_A }], overlay: <><Glow {...R_ERASER} at={0} drawFrames={0} until={8} /><Glow {...R_BRUSH} at={14} /></> },
  { id: "aModeIdle", src: A, start: 22.0, end: 24.6, rate: 5, xfade: 0, cam: [{ t: 1, ...CAM_PAINT }], overlay: <Glow {...R_PAINT} at={4} /> },
  { id: "aPaint", src: A, start: 24.6, end: 29.3, rate: 1.12, xfade: 0, cam: [{ t: 1, ...CAM_PAINT }], overlay: <><Glow {...R_PAINT} at={0} drawFrames={0} until={70} /><BrushCursor t0={24.6} rate={1.12} /></> },
  { id: "aToSend", src: A, start: 29.3, end: 31.2, rate: 1.7, xfade: 0, cam: [{ t: 1, ...CAM_PAINT }], overlay: <Glow {...R_SEND_A} at={10} /> },
  { id: "aHold2", src: A, start: 31.2, end: 40.3, rate: 40, xfade: 0, cam: [{ t: 1, ...CAM_PAINT }], overlay: <Glow {...R_SEND_A} at={0} drawFrames={0} /> },
  { id: "aSend", src: A, start: 40.3, end: 42.4, rate: 1.4, xfade: 0, clicks: [40.5], cam: [{ t: 1, ...CAM_A }], overlay: <Glow {...R_SEND_A} at={0} drawFrames={0} until={8} /> },
  { id: "aGen", src: A, start: 42.4, end: 49.0, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_A }] },
  { id: "aDone", src: A, start: 49.0, end: 49.1, rate: 0.034, xfade: 0, cam: [{ t: 0.3, ...CAM_A }, { t: 1, x: 2256, y: 772, s: 1.3 }], overlay: <ResultReveal still="assets/lastA.png" src="raw/result/local-result.jpg" rect={R_RES_A} /> },
];

const SHOTS_B: TakeShot[] = [
  { id: "bIntro", src: B, start: 5.6, end: 9.2, rate: 1.8, fresh: true, cam: [{ t: 0, ...CAM_B1 }] },
  { id: "bHold", src: B, start: 9.2, end: 11.8, rate: 8, xfade: 0, cam: [{ t: 1, ...CAM_B1 }] },
  { id: "bRight", src: B, start: 11.8, end: 13.4, rate: 1.12, xfade: 0, clicks: [12.15], cam: [{ t: 1, ...CAM_B1 }] },
  { id: "bToItem", src: B, start: 13.4, end: 17.6, rate: 1.3, xfade: 0, cam: [{ t: 1, ...CAM_B1 }], overlay: <Glow {...R_MENU_GEN} at={18} /> },
  { id: "bHold2", src: B, start: 17.6, end: 22.1, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_B1 }], overlay: <Glow {...R_MENU_GEN} at={0} drawFrames={0} /> },
  { id: "bClick", src: B, start: 22.1, end: 24.4, rate: 1.12, xfade: 0, clicks: [22.4], cam: [{ t: 0.2, ...CAM_B2 }, { t: 1, ...CAM_B2 }], overlay: <Glow {...R_MENU_GEN} at={0} drawFrames={0} until={8} /> },
  { id: "bHold3", src: B, start: 24.4, end: 29.0, rate: 6, xfade: 0, cam: [{ t: 1, ...CAM_B2 }] },
  { id: "bToPrompt", src: B, start: 29.0, end: 31.6, rate: 1.3, xfade: 0, cam: [{ t: 1, ...CAM_B3 }] },
  { id: "bHold4", src: B, start: 31.6, end: 37.8, rate: 12, xfade: 0, cam: [{ t: 1, ...CAM_B3 }] },
  { id: "bType", src: B, start: 37.8, end: 41.2, rate: 1, xfade: 0, cam: [{ t: 1, ...CAM_B3 }], overlay: <><Typewriter from={4} len={54} /><Glow {...R_TEXT} at={48} /></> },
  { id: "bHold5", src: B, start: 41.2, end: 46.2, rate: 12, xfade: 0, cam: [{ t: 1, ...CAM_B3 }], overlay: <Glow {...R_TEXT} at={0} drawFrames={0} until={10} /> },
  { id: "bToSend", src: B, start: 46.2, end: 48.8, rate: 1.3, xfade: 0, cam: [{ t: 1, ...CAM_B3 }], overlay: <Glow {...R_SEND_B} at={12} /> },
  { id: "bHold6", src: B, start: 48.8, end: 52.1, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_B3 }], overlay: <Glow {...R_SEND_B} at={0} drawFrames={0} /> },
  { id: "bSend", src: B, start: 52.1, end: 54.4, rate: 1.12, xfade: 0, clicks: [52.3], cam: [{ t: 1, ...CAM_B2 }], overlay: <Glow {...R_SEND_B} at={0} drawFrames={0} until={8} /> },
  { id: "bGen", src: B, start: 54.4, end: 60.5, rate: 6, xfade: 0, cam: [{ t: 1, ...CAM_B2 }] },
  { id: "bDone", src: B, start: 60.5, end: 60.6, rate: 0.034, xfade: 0, cam: [{ t: 0.3, ...CAM_B2 }, { t: 1, x: 1512, y: 518, s: 1.3 }], overlay: <ResultReveal still="assets/lastB.png" src="raw/result/many-result.jpg" rect={R_RES_B} /> },
];

const PACE = 1.15;
const pace = (shots: TakeShot[]) => shots.map((s) => ({ ...s, rate: (s.rate ?? 1) > 1.25 ? (s.rate as number) * PACE : s.rate }));
const takeA = buildTake(A, pace(SHOTS_A));
const takeB = buildTake(B, pace(SHOTS_B));

const STEPS_A = ["选中图片", "移除物体", "涂抹水印", "发送"];
const STEPS_B = ["右键图片", "生图", "输入提示词", "发送"];

// Timeline (frames).
const COVER = 54;
const OPEN_FROM = COVER - 10;
const OPEN_LEN = 128;
const W1 = OPEN_FROM + OPEN_LEN - WIPE_CUT; // wipe into 技巧 1
const A0 = W1 + WIPE_CUT;
const CMP_LEN = 165;
const C1 = A0 + takeA.total - 6;
const W2 = C1 + CMP_LEN - WIPE_CUT;
const B0 = W2 + WIPE_CUT;
const C2 = B0 + takeB.total - 6;
const L0 = C2 + CMP_LEN;
const FADE = 14;
export const MAIN_DURATION = L0 + TRAILER_FRAMES;

export const Main: React.FC = () => {
  const at = (t: typeof takeA, base: number, a: string, b?: string) => {
    const s = t.span(a, b);
    return { from: base + s.from, durationInFrames: s.durationInFrames };
  };
  const step = (t: typeof takeA, base: number, steps: string[], n: number, a: string, b: string, note?: string) => (
    <Sequence {...at(t, base, a, b)} name={`步骤${n}·${steps[n - 1]}`}>
      <StepCaption steps={steps} step={n} note={note} placement="top-left" bold />
    </Sequence>
  );
  const stick = (t: typeof takeA, base: number, name: string, a: string, b: string, p: React.ComponentProps<typeof Sticker>) => (
    <Sequence {...at(t, base, a, b)} name={name}>
      <Sticker {...p} />
    </Sequence>
  );
  const eraser = toFrame(CAM_A, R_ERASER.x + R_ERASER.w / 2, R_ERASER.y + R_ERASER.h);
  const paint = toFrame(CAM_PAINT, R_PAINT.x, R_PAINT.y);
  const menu = toFrame(CAM_B1, R_MENU_GEN.x + R_MENU_GEN.w, R_MENU_GEN.y);
  const text = toFrame(CAM_B3, R_TEXT.x, R_TEXT.y);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={A0} durationInFrames={takeA.total} name="技巧1 录屏">
        <takeA.Take />
      </Sequence>
      <Sequence from={B0} durationInFrames={takeB.total} name="技巧2 录屏">
        <takeB.Take />
      </Sequence>

      <Sequence from={OPEN_FROM} durationInFrames={OPEN_LEN} name="开场·求原图">
        <Opening turnAt={74} length={OPEN_LEN} />
      </Sequence>
      <Sequence durationInFrames={COVER} name="封面">
        <Cover exitAt={COVER - 14} />
      </Sequence>

      {/* ── 技巧 1 · 局部水印 → 移除物体 ── */}
      {step(takeA, A0, STEPS_A, 1, "aIntro", "aIdle")}
      {step(takeA, A0, STEPS_A, 2, "aToEraser", "aClick", "工具栏里的「移除物体」")}
      {step(takeA, A0, STEPS_A, 3, "aModeIdle", "aToSend", "涂抹擦除，涂过水印")}
      {step(takeA, A0, STEPS_A, 4, "aHold2", "aDone")}
      {stick(takeA, A0, "花字·移除物体", "aToEraser", "aClick", { x: eraser.x - 150, y: eraser.y + 30, text: "👆 移除物体", bg: PINK, color: "#fff", rotate: -2, delay: 18 })}
      {stick(takeA, A0, "花字·涂水印", "aModeIdle", "aPaint", { x: paint.x - 420, y: paint.y - 40, text: "水印在哪，涂哪 👉", bg: PINK, color: "#fff", rotate: -2, delay: 4 })}

      <Sequence from={C1} durationInFrames={CMP_LEN} name="对比·局部">
        <Compare before="raw/canvas/local-src.jpg" after="raw/result/local-result.jpg" focus={{ x: 0.82, y: 0.93, scale: 2.8 }} caption="局部水印 · 移除物体" />
      </Sequence>
      <Sequence from={C1} durationInFrames={CMP_LEN} name="贴纸·水印没了1">
        <Sticker x={1340} y={820} text="✓ 水印没了" bg="#FFE14D" rotate={-4} delay={78} />
      </Sequence>

      {/* ── 技巧 2 · 满屏水印 → 生图 ── */}
      {step(takeB, B0, STEPS_B, 1, "bIntro", "bRight")}
      {step(takeB, B0, STEPS_B, 2, "bToItem", "bHold3")}
      {step(takeB, B0, STEPS_B, 3, "bToPrompt", "bHold5")}
      {step(takeB, B0, STEPS_B, 4, "bToSend", "bDone")}
      {stick(takeB, B0, "花字·生图", "bToItem", "bClick", { x: menu.x + 24, y: menu.y - 10, text: "👈 右键 → 生图", bg: PINK, color: "#fff", rotate: -2, delay: 18 })}
      {stick(takeB, B0, "花字·提示词", "bType", "bHold5", { x: text.x + 40, y: text.y - 120, text: "一句话：去掉水印，原图不变", bg: PINK, color: "#fff", rotate: -2, delay: 46 })}

      <Sequence from={C2} durationInFrames={CMP_LEN} name="对比·满屏">
        <Compare before="raw/canvas/many-src.jpg" after="raw/result/many-result.jpg" focus={{ x: 0.7, y: 0.74, scale: 2.4 }} caption="满屏水印 · 生图 + 一句提示词" />
      </Sequence>
      <Sequence from={C2} durationInFrames={CMP_LEN} name="贴纸·水印没了2">
        <Sticker x={1340} y={820} text="✓ 满屏水印也没了" bg="#7CF29A" rotate={-4} delay={78} />
      </Sequence>

      <Sequence from={W1} durationInFrames={WIPE_LEN} name="转场·技巧1">
        <Wipe title="技巧 1 · 局部水印" sub="选中图片 → 工具栏「移除物体」" shot={{ src: "assets/toolbar-A.png", w: 1710, h: 104, scale: 0.95, hi: { x: 1376, y: 6, w: 76, h: 92, r: 22 } }} />
      </Sequence>
      <Sequence from={W2} durationInFrames={WIPE_LEN} name="转场·技巧2">
        <Wipe title="技巧 2 · 满屏水印" sub="右键图片 →「生图」" shot={{ src: "assets/menu-B.png", w: 420, h: 540, scale: 0.9, hi: { x: 6, y: 76, w: 400, h: 50, r: 12 } }} />
      </Sequence>

      <FadeToBlack from={L0 - FADE} to={L0} />
      <Sequence from={L0} durationInFrames={TRAILER_FRAMES} name="OiiOii logo">
        <FadeIn len={8}>
          <Trailer />
        </FadeIn>
      </Sequence>

      <Audio src={staticFile("sfx/music.wav")} volume={(f) => interpolate(f, [0, 8, L0 - 40, L0 + 4], [0, 0.26, 0.22, 0], clamp)} />
      {takeA.clicks.map((c) => (
        <Sequence key={`a${c}`} from={A0 + c} durationInFrames={4} name="Click">
          <Audio src={BRAND.click} volume={0.3} />
        </Sequence>
      ))}
      {takeB.clicks.map((c) => (
        <Sequence key={`b${c}`} from={B0 + c} durationInFrames={4} name="Click">
          <Audio src={BRAND.click} volume={0.3} />
        </Sequence>
      ))}
      <Sequence from={OPEN_FROM} durationInFrames={L0 - OPEN_FROM} name="Watermark">
        <FadeOut from={L0 - OPEN_FROM - FADE - 4} len={FADE}>
          <Watermark />
        </FadeOut>
      </Sequence>
    </AbsoluteFill>
  );
};

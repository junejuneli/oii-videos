import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  BRAND,
  buildTake,
  clamp,
  FadeIn,
  FadeOut,
  FadeToBlack,
  FONT_CN,
  GlowRect,
  INK,
  PINK,
  StepCaption,
  Sticker,
  TakeShot,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";
import { Cover } from "./Cover";
import { Wipe, WIPE_CUT, WIPE_LEN } from "./Wipe";
import { Compare } from "./Compare";

// Recordings of canvas 7aa63481 (3024x1544 rec px = 2x a 1512x772 viewport).
// Times are seconds inside each file; see brief.md「录制」.
//  vidA  技巧 1：视频水印 → 去除字幕 → 自动 → 发送
//  vidB  技巧 2：视频水印 → 去除字幕 → 自动▾ → 框选 → 拖框 → 发送
const A = staticFile("rec/vidA.mp4");
const B = staticFile("rec/vidB.mp4");

type Cam = { x: number; y: number; s: number };
const CAM_V: Cam = { x: 1512, y: 745, s: 0.96 }; // toolbar + node + bottom bar
const CAM_MENU: Cam = { x: 1512, y: 980, s: 1.0 }; // node + bottom bar + dropdown
const CAM_BOX: Cam = { x: 1514, y: 1090, s: 1.55 }; // pushed in on the subtitle

const toFrame = (c: Cam, x: number, y: number) => ({ x: 960 + (x - c.x) * c.s, y: 540 + (y - c.y) * c.s });
const Glow: React.FC<React.ComponentProps<typeof GlowRect>> = (p) => <GlowRect stroke={9} {...p} />;

// Rec px rectangles.
const R_BTN = { x: 1712, y: 250, w: 178, h: 64, r: 16 }; // 去除字幕
const R_AUTO = { x: 1440, y: 1204, w: 174, h: 84, r: 42 }; // 自动 ▾
const R_SEND_A = { x: 1740, y: 1206, w: 80, h: 80, r: 40 };
const R_SEND_B = { x: 1804, y: 1206, w: 80, h: 80, r: 40 };
const R_KX = { x: 1376, y: 1392, w: 296, h: 62, r: 14 }; // 框选 item
const R_SUB = { x: 1264, y: 1024, w: 500, h: 80, r: 10 }; // the burnt-in subtitle
const R_RES_2 = { x: 1961, y: 375, w: 590, h: 794, r: 24 }; // 2nd node (自动 result)
const R_RES_3 = { x: 2705, y: 375, w: 590, h: 794, r: 24 }; // 3rd node (框选 result)

/**
 * The recordings stop while the results are still generating. Hold the last
 * frame and sweep the real generated video into its node, so the result is
 * seen landing in the canvas before the close comparison. Rec px.
 */
const ResultReveal: React.FC<{ still: string; items: { src: string; rect: typeof R_RES_2; at: number }[] }> = ({ still, items }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Img src={staticFile(still)} style={{ position: "absolute", left: 0, top: 0, width: 3024, height: 1544 }} />
      {items.map(({ src, rect, at }) => {
        const p = interpolate(f, [at, at + 20], [0, 1], clamp);
        return (
          <React.Fragment key={src}>
            <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: rect.r, overflow: "hidden", clipPath: `inset(0 0 ${100 - p * 100}% 0)` }}>
              <Video src={staticFile(src)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </div>
            <div style={{ position: "absolute", left: rect.x, top: rect.y + rect.h * p - 6, width: rect.w, height: 12, background: "linear-gradient(90deg, rgba(240,52,155,0), #F0349B, rgba(240,52,155,0))", opacity: p > 0 && p < 1 ? 1 : 0, filter: "blur(2px)" }} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** The drag that draws the selection box happened in one go; draw the growing marquee with the cursor. Rec px. */
const Marquee: React.FC<{ t0: number; rate: number; from: number; to: number; hold?: boolean }> = ({ t0, rate, from, to, hold }) => {
  const f = useCurrentFrame();
  const t = t0 + (f * rate) / 30;
  const p = hold ? 1 : interpolate(t, [from, to], [0, 1], clamp);
  if (!hold && t < from) return null;
  return (
    <>
      <div style={{ position: "absolute", left: R_SUB.x, top: R_SUB.y, width: R_SUB.w * p, height: R_SUB.h * p, border: "3px solid #F0349B", background: "rgba(240,52,155,0.35)", borderRadius: 4 }} />
      <div style={{ position: "absolute", left: R_SUB.x + R_SUB.w * p + 22, top: R_SUB.y + R_SUB.h * p - 120, fontFamily: FONT_CN, fontWeight: 700, fontSize: 30, color: "#fff", background: PINK, borderRadius: 999, padding: "4px 18px", border: `4px solid ${INK}`, whiteSpace: "nowrap" }}>⬚ 框选中</div>
    </>
  );
};

const SHOTS_A: TakeShot[] = [
  { id: "aIntro", src: A, start: 4.0, end: 9.6, rate: 1.8, fresh: true, cam: [{ t: 0, ...CAM_V }] },
  { id: "aSel", src: A, start: 9.6, end: 11.2, rate: 1.25, xfade: 0, clicks: [10.0], cam: [{ t: 1, ...CAM_V }] },
  { id: "aIdle", src: A, start: 11.2, end: 24.0, rate: 14, xfade: 0, cam: [{ t: 1, ...CAM_V }] },
  { id: "aToBtn", src: A, start: 24.0, end: 26.6, rate: 1.3, xfade: 0, cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_BTN} at={12} /> },
  { id: "aClick", src: A, start: 26.6, end: 28.4, rate: 1.25, xfade: 0, clicks: [26.8], cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_BTN} at={0} drawFrames={0} until={10} /> },
  { id: "aIdle2", src: A, start: 28.4, end: 37.8, rate: 12, xfade: 0, cam: [{ t: 1, ...CAM_V }] },
  { id: "aAuto", src: A, start: 37.8, end: 40.8, rate: 1.15, xfade: 0, cam: [{ t: 1, ...CAM_V }], overlay: <><Glow {...R_AUTO} at={4} /><Glow {...R_SUB} at={20} /></> },
  { id: "aToSend", src: A, start: 40.8, end: 45.6, rate: 2.2, xfade: 0, cam: [{ t: 1, ...CAM_V }], overlay: <><Glow {...R_AUTO} at={0} drawFrames={0} until={8} /><Glow {...R_SEND_A} at={30} /></> },
  { id: "aSend", src: A, start: 45.6, end: 47.0, rate: 1.25, xfade: 0, clicks: [46.1], cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_SEND_A} at={0} drawFrames={0} until={14} /> },
  { id: "aGen", src: A, start: 47.0, end: 59.4, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_V }] },
  {
    id: "aDone",
    src: A,
    start: 59.4,
    end: 59.5,
    rate: 0.04,
    xfade: 0,
    cam: [{ t: 0.3, ...CAM_V }, { t: 1, x: 2256, y: 772, s: 1.25 }],
    overlay: <ResultReveal still="assets/lastA.png" items={[{ src: "raw/result/auto-result.mp4", rect: R_RES_2, at: 14 }]} />,
  },
];

const SHOTS_B: TakeShot[] = [
  { id: "bSel", src: B, start: 69.0, end: 71.0, rate: 1.25, fresh: true, clicks: [69.9], cam: [{ t: 0, ...CAM_V }] },
  { id: "bIdle", src: B, start: 71.0, end: 75.5, rate: 8, xfade: 0, cam: [{ t: 1, ...CAM_V }] },
  { id: "bToBtn", src: B, start: 75.5, end: 77.2, rate: 1.3, xfade: 0, cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_BTN} at={4} /> },
  { id: "bClick", src: B, start: 77.2, end: 78.6, rate: 1.25, xfade: 0, clicks: [77.4], cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_BTN} at={0} drawFrames={0} until={10} /> },
  { id: "bIdle2", src: B, start: 78.6, end: 88.0, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_MENU }] },
  { id: "bToAuto", src: B, start: 88.0, end: 90.6, rate: 1.2, xfade: 0, clicks: [90.0], cam: [{ t: 1, ...CAM_MENU }], overlay: <Glow {...R_AUTO} at={6} /> },
  { id: "bMenu", src: B, start: 90.6, end: 103.6, rate: 9, xfade: 0, cam: [{ t: 1, ...CAM_MENU }], overlay: <><Glow {...R_AUTO} at={0} drawFrames={0} until={6} /><Glow {...R_KX} at={8} /></> },
  { id: "bPick", src: B, start: 103.6, end: 106.2, rate: 1.25, xfade: 0, clicks: [105.6], cam: [{ t: 1, ...CAM_MENU }], overlay: <Glow {...R_KX} at={0} drawFrames={0} until={56} /> },
  { id: "bIdle3", src: B, start: 106.2, end: 110.4, rate: 6, xfade: 0, cam: [{ t: 1, ...CAM_BOX }] },
  { id: "bDrag", src: B, start: 110.4, end: 112.6, rate: 1.15, xfade: 0, cam: [{ t: 1, ...CAM_BOX }], overlay: <><Glow {...R_SUB} at={0} until={30} /><Marquee t0={110.4} rate={1} from={111.45} to={112.2} /></> },
  { id: "bHoldBox", src: B, start: 112.6, end: 115.4, rate: 10, xfade: 0, cam: [{ t: 1, ...CAM_BOX }], overlay: <Marquee t0={112.6} rate={10} from={0} to={0} hold /> },
  { id: "bBoxed", src: B, start: 115.4, end: 117.0, rate: 1.15, xfade: 0, cam: [{ t: 1, ...CAM_BOX }] },
  { id: "bIdle4", src: B, start: 117.0, end: 126.0, rate: 12, xfade: 0, cam: [{ t: 1, ...CAM_V }] },
  { id: "bToSend", src: B, start: 126.0, end: 133.2, rate: 2.4, xfade: 0, cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_SEND_B} at={50} /> },
  { id: "bSend", src: B, start: 133.2, end: 134.6, rate: 1.25, xfade: 0, clicks: [133.5], cam: [{ t: 1, ...CAM_V }], overlay: <Glow {...R_SEND_B} at={0} drawFrames={0} until={12} /> },
  { id: "bGen", src: B, start: 134.6, end: 139.8, rate: 5, xfade: 0, cam: [{ t: 1, ...CAM_V }] },
  {
    id: "bDone",
    src: B,
    start: 139.8,
    end: 139.9,
    rate: 0.04,
    xfade: 0,
    cam: [{ t: 0.3, ...CAM_V }, { t: 1, x: 2860, y: 772, s: 1.05 }],
    overlay: (
      <ResultReveal
        still="assets/lastB.png"
        items={[
          { src: "raw/result/auto-result.mp4", rect: R_RES_2, at: 6 },
          { src: "raw/result/box-result.mp4", rect: R_RES_3, at: 22 },
        ]}
      />
    ),
  },
];

const PACE = 1.35;
const pace = (shots: TakeShot[]) => shots.map((s) => ({ ...s, rate: (s.rate ?? 1) > 1.25 ? (s.rate as number) * PACE : s.rate }));
const takeA = buildTake(A, pace(SHOTS_A));
const takeB = buildTake(B, pace(SHOTS_B));

const STEPS_A = ["选中视频", "去除字幕", "自动识别", "发送"];
const STEPS_B = ["去除字幕", "切到框选", "框住字幕", "发送"];

// Timeline (frames).
const COVER = 54;
const OPEN_FROM = COVER - 10;
const W1 = COVER - WIPE_CUT;
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
  const btn = toFrame(CAM_V, R_BTN.x + R_BTN.w / 2, R_BTN.y + R_BTN.h);
  const auto = toFrame(CAM_V, R_AUTO.x, R_AUTO.y);
  const kx = toFrame(CAM_MENU, R_KX.x + R_KX.w, R_KX.y);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={A0} durationInFrames={takeA.total} name="技巧1 录屏">
        <takeA.Take />
      </Sequence>
      <Sequence from={B0} durationInFrames={takeB.total} name="技巧2 录屏">
        <takeB.Take />
      </Sequence>

      <Sequence durationInFrames={COVER} name="封面">
        <Cover exitAt={COVER - 14} />
      </Sequence>

      {/* ── 技巧 1 · 自动识别 ── */}
      {step(takeA, A0, STEPS_A, 1, "aIntro", "aIdle")}
      {step(takeA, A0, STEPS_A, 2, "aToBtn", "aIdle2", "工具栏里的「去除字幕」")}
      {step(takeA, A0, STEPS_A, 3, "aAuto", "aToSend", "默认「自动」，字幕位置自动识别")}
      {step(takeA, A0, STEPS_A, 4, "aSend", "aDone")}
      {stick(takeA, A0, "花字·去除字幕A", "aToBtn", "aClick", { x: btn.x - 150, y: btn.y + 30, text: "👆 去除字幕", bg: PINK, color: "#fff", rotate: -2, delay: 14 })}
      {stick(takeA, A0, "花字·自动", "aAuto", "aToSend", { x: 1270, y: auto.y - 26, text: "👈 不用框，自动识别", bg: PINK, color: "#fff", rotate: -2, delay: 6 })}

      <Sequence from={C1} durationInFrames={CMP_LEN} name="对比·自动">
        <Compare before="raw/canvas/subtitle-src.mp4" after="raw/result/auto-result.mp4" focus={{ x: 0.5, y: 0.86, scale: 1.9 }} caption="自动识别 · 去除字幕" />
      </Sequence>
      <Sequence from={C1} durationInFrames={CMP_LEN} name="贴纸·字幕没了">
        <Sticker x={1340} y={820} text="✓ 字幕没了" bg="#FFE14D" rotate={-4} delay={78} />
      </Sequence>

      {/* ── 技巧 2 · 手动框选 ── */}
      {step(takeB, B0, STEPS_B, 1, "bSel", "bIdle2")}
      {step(takeB, B0, STEPS_B, 2, "bToAuto", "bPick", "「自动」下拉里选「框选」")}
      {step(takeB, B0, STEPS_B, 3, "bIdle3", "bBoxed", "按住拖一个框，盖住字幕")}
      {step(takeB, B0, STEPS_B, 4, "bIdle4", "bDone")}
      {stick(takeB, B0, "花字·框选", "bMenu", "bPick", { x: kx.x + 24, y: kx.y - 6, text: "👈 选「框选」", bg: PINK, color: "#fff", rotate: -2, delay: 10 })}
      {stick(takeB, B0, "花字·拖框", "bDrag", "bBoxed", { x: 300, y: 300, text: "字幕在哪，框哪", bg: PINK, color: "#fff", rotate: -2, delay: 4 })}

      <Sequence from={C2} durationInFrames={CMP_LEN} name="对比·框选">
        <Compare before="raw/canvas/subtitle-src.mp4" after="raw/result/box-result.mp4" focus={{ x: 0.5, y: 0.86, scale: 1.9 }} caption="手动框选 · 去除字幕" />
      </Sequence>
      <Sequence from={C2} durationInFrames={CMP_LEN} name="贴纸·框哪去哪">
        <Sticker x={1340} y={820} text="✓ 框哪，去哪" bg="#7CF29A" rotate={-4} delay={78} />
      </Sequence>

      <Sequence from={W1} durationInFrames={WIPE_LEN} name="转场·技巧1">
        <Wipe title="技巧 1 · 自动识别" sub="选中视频 → 工具栏「去除字幕」" shot={{ src: "assets/toolbar-V.png", w: 2024, h: 96, scale: 0.85, hi: { x: 1206, y: 8, w: 186, h: 80, r: 18 } }} />
      </Sequence>
      <Sequence from={W2} durationInFrames={WIPE_LEN} name="转场·技巧2">
        <Wipe title="技巧 2 · 手动框选" sub="自动没识别准？切到「框选」" shot={{ src: "assets/menu-V.png", w: 500, h: 300, scale: 1.4, hi: { x: 126, y: 212, w: 300, h: 62, r: 14 } }} />
      </Sequence>

      <FadeToBlack from={L0 - FADE} to={L0} />
      <Sequence from={L0} durationInFrames={TRAILER_FRAMES} name="OiiOii logo">
        <FadeIn len={8}>
          <Trailer />
        </FadeIn>
      </Sequence>

      <Audio src={staticFile("sfx/music.wav")} volume={(f) => interpolate(f, [0, 8, L0 - 40, L0 + 4], [0, 0.2, 0.17, 0], clamp)} />
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

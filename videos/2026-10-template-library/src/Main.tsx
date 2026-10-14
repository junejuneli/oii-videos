import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import {
  BRAND,
  buildTake,
  clamp,
  FadeIn,
  FadeOut,
  FadeToBlack,
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
import { CaseWall, WALL_LEN } from "./CaseWall";
import { EndCenter } from "./EndCenter";

// Recordings of canvas e26807c2 (3024x1544 rec px = 2x a 1512x772 viewport).
// Times are seconds in each recording; see brief.md「录制记录」.
//  recA  image template: 角色身份参考图表, reference swapped to the girl photo
//  recB  video template one-click: 3D动漫第一人称互动
//  recC  video template + AI 演员: 韩系女主咖啡杯转场变装 with 张沛 (ops only)
//  recC2 the 咖啡杯 result next to 张沛, pushed in and played
//  recD  我的模板 → 新建预设 → 创建预设
const A = staticFile("rec/recA.mp4");
const B = staticFile("rec/recB.mp4");
const C = staticFile("rec/recC.mp4");
const C2 = staticFile("rec/recC2.mp4");
const D = staticFile("rec/recD.mp4");

// Cameras: (x, y) is the rec px at frame centre, s the scale.
const FULL = { x: 1512, y: 772, s: 0.66 };
const NODEV = { x: 1500, y: 640, s: 0.78 }; // new node + its prompt panel
const FILLED = { x: 1512, y: 860, s: 0.7 }; // 16:9 node + filled panel (recA)
const SWAP = { x: 1100, y: 760, s: 0.8 }; // photo node, ref chip, editor (recA)
const VFILL = { x: 1150, y: 860, s: 0.74 }; // 9:16 node + filled panel (recB/C)
const VBAR = { x: 1150, y: 980, s: 0.82 }; // panned up: bottom bar of the panel

/** rec px -> 1920x1080 frame px under a camera, to place stickers. */
const toFrame = (c: { x: number; y: number; s: number }, x: number, y: number) => ({
  x: 960 + (x - c.x) * c.s,
  y: 540 + (y - c.y) * c.s,
});

const Glow: React.FC<React.ComponentProps<typeof GlowRect>> = (p) => <GlowRect stroke={9} {...p} />;

/**
 * Canvas-coloured block (pure black, feathered edge) over a node that does not
 * belong in the shot: recB is a pure video-template case, so the AI演员-张沛
 * image that sat next to it on the canvas is hidden. Rec px.
 */
const Mask: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: "#000",
      borderRadius: 24,
      boxShadow: "0 0 24px 18px #000",
    }}
  />
);
// 张沛 node (with its title) in recB, per camera state.
const M_B_NODE = { x: 466, y: 146, w: 410, h: 690 }; // new video node + panel
const M_B_BAR = { x: 466, y: 0, w: 410, h: 236 }; // panned up to the bottom bar
const M_B_WAIT = { x: 876, y: 246, w: 536, h: 990 }; // generating view (150%)
const M_B_PUSH = { x: 0, y: 0, w: 836, h: 1544 }; // pushed in (224%)

/** The generated video playing inside its node (the canvas only shows a poster). Rec px. */
const NodePlay: React.FC<{ src: string; x: number; y: number; w: number; h: number }> = ({ src, x, y, w, h }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 30, overflow: "hidden" }}>
    <Video src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);
// Inner rect of the 3D result node in recB once pushed in (white border excluded).
const R_B_PLAY = { x: 1136, y: 120, w: 768, h: 1360 };

// Rec px rectangles.
const R_PLUS = { x: 2906, y: 608, w: 64, h: 64, r: 32 };
const R_TPL = { x: 1920, y: 850, w: 116, h: 44, r: 14 }; // 「模板」 in a new node's panel
const R_TPL_D = { x: 2104, y: 834, w: 116, h: 44, r: 14 }; // same, recD layout
const R_SEARCH = { x: 1872, y: 82, w: 566, h: 80, r: 40 };
const R_CARD_A = { x: 892, y: 672, w: 400, h: 302, r: 22 }; // 角色身份参考图表
const R_CARD_B = { x: 1310, y: 350, w: 400, h: 534, r: 22 }; // 3D动漫第一人称互动
const R_CARD_C = { x: 474, y: 350, w: 400, h: 534, r: 22 }; // 韩系女主咖啡杯转场变装
const R_CHIP_A = { x: 846, y: 922, w: 100, h: 96, r: 18 };
const R_PHOTO = { x: 392, y: 224, w: 436, h: 588, r: 22 };
const R_4K = { x: 2500, y: 586, w: 230, h: 66, r: 14 };
const R_GEN_A = { x: 2220, y: 1110, w: 70, h: 70, r: 35 };
// Highlighted (adjustable) phrases in the 3D动漫第一人称互动 prompt, recB ~62s.
const R_VAR1 = { x: 1160, y: 1092, w: 196, h: 48, r: 14 }; // 角色1 图片1
const R_VAR2A = { x: 1726, y: 1140, w: 184, h: 48, r: 14 }; // 在画面左下…
const R_VAR2B = { x: 383, y: 1190, w: 494, h: 50, r: 14 }; // …角比出一个半心（C字形）的手势
const PROMPT_B = { x: 1146, y: 1028, s: 1.05 }; // close on the top of the filled prompt
const R_GEN_C = { x: 1850, y: 1110, w: 70, h: 70, r: 35 };
const R_MINE = { x: 696, y: 90, w: 156, h: 62, r: 14 };
const R_NEW = { x: 474, y: 246, w: 400, h: 302, r: 22 };
const R_CREATE = { x: 1292, y: 1372, w: 428, h: 96, r: 48 };
const R_MYCARD = { x: 892, y: 246, w: 400, h: 302, r: 22 };

const SHOTS: TakeShot[] = [
  // ── ① 图片模板 · 换成你的照片 (recA) ──────────────────────────────
  { id: "aAdd", src: A, start: 9.2, end: 12.9, rate: 2, fresh: true, clicks: [10.58, 12.31], cam: [{ t: 0, ...FULL }], overlay: <Glow {...R_PLUS} at={0} until={22} /> },
  { id: "aIdle", src: A, start: 12.9, end: 24.2, rate: 20, xfade: 0, cam: [{ t: 1, ...NODEV }] },
  { id: "aTpl", src: A, start: 24.2, end: 26.1, rate: 1.2, xfade: 0, clicks: [25.2], cam: [{ t: 1, ...NODEV }], overlay: <Glow {...R_TPL} at={0} until={30} /> },
  { id: "aLoad", src: A, start: 26.1, end: 27.3, rate: 1.4, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "aBrowse", src: A, start: 27.3, end: 46.8, rate: 7, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "aIdle2", src: A, start: 46.8, end: 65.6, rate: 20, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "aSearch", src: A, start: 65.6, end: 71.5, rate: 2, xfade: 0, clicks: [66.33], cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_SEARCH} at={0} /> },
  { id: "aRes", src: A, start: 71.5, end: 82.4, rate: 14, xfade: 0, cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_SEARCH} at={0} drawFrames={0} /> },
  { id: "aPick", src: A, start: 82.4, end: 84.6, xfade: 0, clicks: [83.23], cam: [{ t: 1, ...FULL }], overlay: <><Glow {...R_SEARCH} at={0} drawFrames={0} until={10} /><Glow {...R_CARD_A} at={0} until={30} /></> },
  { id: "aFilled", src: A, start: 84.6, end: 87.6, rate: 1.4, xfade: 0, cam: [{ t: 1, ...FILLED }] },
  { id: "aScroll", src: A, start: 87.6, end: 100.5, rate: 6, xfade: 0, cam: [{ t: 1, ...FILLED }] },
  { id: "aHover", src: A, start: 100.5, end: 112.6, rate: 14, xfade: 0, cam: [{ t: 1, ...SWAP }] },
  { id: "aDel", src: A, start: 112.6, end: 114.6, rate: 1.4, xfade: 0, clicks: [113.41], cam: [{ t: 1, ...SWAP }], overlay: <Glow {...R_CHIP_A} at={0} until={24} /> },
  { id: "aCopy", src: A, start: 114.6, end: 117.2, rate: 1.2, xfade: 0, clicks: [115.88], cam: [{ t: 1, ...SWAP }], overlay: <Glow {...R_PHOTO} at={8} /> },
  { id: "aIdle3", src: A, start: 117.2, end: 127.4, rate: 15, xfade: 0, cam: [{ t: 1, ...SWAP }] },
  { id: "aNode", src: A, start: 127.4, end: 129.2, rate: 2, xfade: 0, clicks: [128.1], cam: [{ t: 1, ...SWAP }] },
  { id: "aIdle4", src: A, start: 129.2, end: 137.9, rate: 15, xfade: 0, cam: [{ t: 1, ...SWAP }] },
  { id: "aPaste", src: A, start: 137.9, end: 141.5, rate: 1.2, xfade: 0, clicks: [138.7], cam: [{ t: 1, ...SWAP }], overlay: <Glow {...R_CHIP_A} at={24} /> },
  { id: "aIdle5", src: A, start: 141.5, end: 159.6, rate: 20, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "aSet", src: A, start: 159.6, end: 179.6, rate: 9, xfade: 0, clicks: [160.6, 177.4, 178.9], cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_4K} at={44} until={62} /> },
  { id: "aGen", src: A, start: 179.6, end: 190.2, rate: 5, xfade: 0, clicks: [189.5], cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_GEN_A} at={40} /> },
  { id: "aWait", src: A, start: 210, end: 251.3, rate: 30, xfade: 8, fresh: true, cam: [{ t: 0, ...FULL }] },
  { id: "aResult", src: A, start: 251.3, end: 254, rate: 1.2, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "aPush", src: A, start: 261.8, end: 264.8, rate: 1.2, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "aHold", src: A, start: 264.8, end: 265.1, rate: 0.2, xfade: 0, cam: [{ t: 1, x: 1512, y: 772, s: 0.7 }] },

  // ── ② 视频模板 · 一键同款 (recB) ─────────────────────────────────
  { id: "bTpl", src: B, start: 27.6, end: 29.4, rate: 1.2, xfade: 12, fresh: true, clicks: [28.6], cam: [{ t: 0, ...NODEV }], overlay: <><Mask {...M_B_NODE} /><Glow {...R_TPL} at={0} until={26} /></> },
  { id: "bLoad", src: B, start: 29.4, end: 30.6, rate: 1.4, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "bBrowse", src: B, start: 30.6, end: 37.6, rate: 5, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "bSearch", src: B, start: 37.6, end: 42.0, rate: 1.6, xfade: 0, cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_SEARCH} at={0} /> },
  { id: "bRes", src: B, start: 42.0, end: 55.8, rate: 14, xfade: 0, cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_SEARCH} at={0} drawFrames={0} /> },
  { id: "bHover", src: B, start: 55.8, end: 60.5, rate: 2.2, xfade: 0, cam: [{ t: 1, ...FULL }], overlay: <><Glow {...R_SEARCH} at={0} drawFrames={0} until={12} /><Glow {...R_CARD_B} at={0} /></> },
  { id: "bApply", src: B, start: 60.5, end: 62.6, rate: 1.2, xfade: 0, clicks: [60.7], cam: [{ t: 1, ...VFILL }], overlay: <Mask {...M_B_NODE} /> },
  // pause on the prompt: its highlighted phrases are the parts you can change
  {
    id: "bVars",
    src: B,
    start: 62.6,
    end: 63.8,
    rate: 0.4,
    xfade: 0,
    cam: [{ t: 0.25, ...PROMPT_B }, { t: 1, ...PROMPT_B }],
    overlay: <><Mask {...M_B_NODE} /><Glow {...R_VAR1} at={22} /><Glow {...R_VAR2A} at={30} /><Glow {...R_VAR2B} at={34} /></>,
  },
  { id: "bGen", src: B, start: 113.6, end: 115.8, rate: 1.3, xfade: 4, clicks: [115.3], cam: [{ t: 1, ...VBAR }], overlay: <Mask {...M_B_BAR} /> },
  { id: "bWait", src: B, start: 129, end: 157.5, rate: 25, xfade: 8, fresh: true, cam: [{ t: 0, ...FULL }], overlay: <Mask {...M_B_WAIT} /> },
  { id: "bResult", src: B, start: 157.5, end: 160.5, rate: 1.2, xfade: 0, cam: [{ t: 1, ...FULL }], overlay: <Mask {...M_B_WAIT} /> },
  { id: "bPush", src: B, start: 181.0, end: 191.6, xfade: 10, cam: [{ t: 1, x: 1700, y: 772, s: 0.7 }], overlay: <><Mask {...M_B_PUSH} /><Sequence from={10} layout="none"><NodePlay src="assets/wall/v2.mp4" {...R_B_PLAY} /></Sequence></> },

  // ── ③ 视频模板 × AI 演员 (recC + recC2)：选模板 → 生成 → 结果 ──────
  { id: "cPick", src: C, start: 39.6, end: 41.3, rate: 1.2, xfade: 12, fresh: true, cam: [{ t: 0, ...FULL }], overlay: <Glow {...R_CARD_C} at={6} /> },
  { id: "cApply", src: C, start: 41.3, end: 43.5, rate: 1.2, xfade: 0, clicks: [41.8], cam: [{ t: 1, ...VFILL }] },
  { id: "cGen", src: C, start: 123.6, end: 125.6, rate: 1.2, xfade: 8, clicks: [125.2], cam: [{ t: 1, ...VBAR }], overlay: <Glow {...R_GEN_C} at={12} /> },
  { id: "cWait", src: C, start: 129, end: 150, rate: 25, xfade: 8, fresh: true, cam: [{ t: 0, ...FULL }] },
  { id: "c2Done", src: C2, start: 13.0, end: 15.0, rate: 1.5, xfade: 14, fresh: true, cam: [{ t: 0, ...FULL }] },
  { id: "c2Push", src: C2, start: 15.0, end: 17.0, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "c2Hold", src: C2, start: 17.0, end: 36.2, rate: 25, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "c2Play", src: C2, start: 36.2, end: 49.5, rate: 1.5, xfade: 0, clicks: [36.5], cam: [{ t: 1, x: 1560, y: 772, s: 0.72 }] },

  // ── ④ 我的模板 (recD) ────────────────────────────────────────────
  { id: "dTpl", src: D, start: 29.6, end: 31.6, rate: 1.3, xfade: 12, fresh: true, clicks: [30.75], cam: [{ t: 0, ...FULL }], overlay: <Glow {...R_TPL_D} at={0} until={30} /> },
  { id: "dLoad", src: D, start: 31.6, end: 33.5, rate: 2, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "dMy", src: D, start: 33.5, end: 38.2, rate: 2.4, xfade: 0, clicks: [36.92], cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_MINE} at={12} until={52} /> },
  { id: "dIdle", src: D, start: 38.2, end: 49.3, rate: 20, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "dNew", src: D, start: 49.3, end: 51.4, rate: 1.4, xfade: 0, clicks: [50.23], cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_NEW} at={0} until={26} /> },
  { id: "dName", src: D, start: 51.4, end: 57.0, rate: 2.6, xfade: 0, clicks: [52.82], cam: [{ t: 1, ...FULL }] },
  { id: "dIdle2", src: D, start: 57.0, end: 67.8, rate: 20, xfade: 0, cam: [{ t: 1, ...FULL }] },
  { id: "dPrompt", src: D, start: 67.8, end: 76.5, rate: 4, xfade: 0, clicks: [68.67], cam: [{ t: 1, ...FULL }] },
  { id: "dCreate", src: D, start: 76.5, end: 80.5, rate: 1.5, xfade: 0, clicks: [78.71], cam: [{ t: 1, ...FULL }], overlay: <Glow {...R_CREATE} at={30} until={50} /> },
  { id: "dCard", src: D, start: 80.5, end: 84.0, xfade: 0, cam: [{ t: 1, x: 1300, y: 600, s: 0.8 }], overlay: <Glow {...R_MYCARD} at={8} /> },
];

const PACE = 1.1;
const take = buildTake(
  A,
  SHOTS.map((s) => ({ ...s, rate: (s.rate ?? 1) > 1 ? (s.rate as number) * PACE : s.rate })),
);

const SECTIONS = ["图片模板 · 换成你的照片", "视频模板 · 一键同款", "视频模板 × AI 演员", "我的模板 · 存下来随时用"];

const COVER = 66;
const T0 = COVER - 16;
const W0 = T0 + take.total;
const END_LEN = 66;
const E0 = W0 + WALL_LEN;
const L0 = E0 + END_LEN;
const FADE = 14;
export const MAIN_DURATION = L0 + TRAILER_FRAMES;

export const Main: React.FC = () => {
  const { Take, total, span } = take;
  const at = (a: string, b?: string) => {
    const s = span(a, b);
    return { from: T0 + s.from, durationInFrames: s.durationInFrames };
  };
  const section = (n: number, a: string, b: string, note?: string) => (
    <Sequence {...at(a, b)} name={`段落${n}`}>
      <StepCaption steps={SECTIONS} step={n} note={note} placement="top-left" bold />
    </Sequence>
  );
  const stick = (name: string, a: string, b: string, p: React.ComponentProps<typeof Sticker>) => (
    <Sequence {...at(a, b)} name={name}>
      <Sticker {...p} />
    </Sequence>
  );
  const tpl = toFrame(NODEV, R_TPL.x + R_TPL.w / 2, R_TPL.y);
    return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={T0} durationInFrames={total} name="Canvas take">
        <Take />
      </Sequence>

      <Sequence durationInFrames={COVER} name="Cover">
        <Cover exitAt={COVER - 16} />
      </Sequence>

      {section(1, "aAdd", "aHold")}
      {section(2, "bTpl", "bPush")}
      {section(3, "cPick", "c2Play")}
      {section(4, "dTpl", "dCard")}

      {stick("花字·模板入口", "aIdle", "aTpl", { x: tpl.x - 200, y: tpl.y - 120, text: "👇 输入框里的「模板」", bg: PINK, color: "#fff", rotate: 0, delay: 4 })}
      {stick("贴纸·463", "aBrowse", "aIdle2", { x: 560, y: 958, text: "400+ 社区热门模板 · 图片 / 视频都有", rotate: -2, delay: 6 })}
      {stick("花字·搜索A", "aSearch", "aRes", { x: 780, y: 58, text: "搜索模板 👉", bg: PINK, color: "#fff", rotate: 0, delay: 2 })}
      {stick("花字·搜索B", "bSearch", "bRes", { x: 780, y: 58, text: "搜索模板 👉", bg: PINK, color: "#fff", rotate: 0, delay: 2 })}
      {stick("贴纸·一键填好", "aFilled", "aScroll", { x: 700, y: 120, text: "✓ 提示词 + 参考图 + 比例，一键填好", rotate: -2, delay: 4 })}
      {stick("花字·换图", "aCopy", "aPaste", { x: 230, y: 680, text: "换成你的照片 👉", bg: PINK, color: "#fff", rotate: 0, delay: 2 })}
      {stick("贴纸·设定图", "aPush", "aHold", { x: 600, y: 930, text: "✓ 一整套角色设定图", bg: "#7CF29A", rotate: -3, delay: 10 })}
      {stick("贴纸·可调整", "bVars", "bVars", { x: 640, y: 860, text: "✏️ 高亮的内容都能改，换成你想要的", rotate: -2, delay: 30 })}
      {stick("花字·AI演员", "c2Push", "c2Play", { x: 300, y: 860, text: "AI 演员 · 张沛", bg: PINK, color: "#fff", rotate: -3, delay: 10 })}
      {stick("贴纸·6套造型", "c2Play", "c2Play", { x: 1110, y: 930, text: "✓ 6 套造型，脸始终是她", bg: "#7CF29A", rotate: -3, delay: 20 })}
      {stick("贴纸·我的模板", "dCard", "dCard", { x: 980, y: 760, text: "✓ 存进「我的模板」，下次一键用", rotate: -2, delay: 14 })}

      <Sequence from={W0} durationInFrames={WALL_LEN + END_LEN} name="案例墙">
        <CaseWall />
      </Sequence>
      <Sequence from={E0} durationInFrames={END_LEN} name="落版">
        <EndCenter title="热门效果，一键同款" brand="模板" />
      </Sequence>
      <FadeToBlack from={L0 - FADE} to={L0} />
      <Sequence from={L0} durationInFrames={TRAILER_FRAMES} name="OiiOii logo">
        <FadeIn len={8}>
          <Trailer />
        </FadeIn>
      </Sequence>
      <Audio
        src={staticFile("sfx/music.wav")}
        volume={(f) => interpolate(f, [0, 8, L0 - 40, L0 + 4], [0, 0.26, 0.22, 0], clamp)}
      />
      {take.clicks.map((c) => (
        <Sequence key={`c${c}`} from={T0 + c} durationInFrames={4} name="Click">
          <Audio src={BRAND.click} volume={0.3} />
        </Sequence>
      ))}
      <Sequence from={T0} durationInFrames={L0 - T0} name="Watermark">
        <FadeOut from={L0 - T0 - FADE - 4} len={FADE}>
          <Watermark />
        </FadeOut>
      </Sequence>
    </AbsoluteFill>
  );
};

import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
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
import { EndCenter } from "./EndCenter";
import { CASE_LEN, Case, CaseShowcase, ShowcaseBackdrop } from "./Showcase";

// One edit built from separate recordings of the same canvas (3024x1544 rec
// px = 2x a 1512x772 viewport). Times are seconds in each recording.
//  recG  tutorial: emoji sheet, 更多 -> 宫格拆分 -> 自定义宫格 6x4 -> 24 cells
// Showcase cases are not recorded on the canvas: the original sheet and its
// split cells are downloaded from the canvas (public/assets/cases) and composed.
const G = staticFile("rec/recK.mp4");

// recK: Ghibli storyboard (3x3), viewport 1512x772 css px at 110%, node centre
// at css (500, 400) = rec (1000, 800); 更多 at rec (1466, 382).
const MID = { x: 1512, y: 772, s: 0.7 };
// A touch closer on the toolbar entry, then down onto the menu and picker.
const ENTRY = { x: 1400, y: 700, s: 0.8 };
const MENU = { x: 1520, y: 800, s: 0.8 };
// After the split the product pans out to ~48%; the group sits around rec (1250, 790).
const WIDE = { x: 1250, y: 790, s: 0.74 };

/** rec px -> 1920x1080 frame px under a take camera, to place stickers exactly. */
const toFrame = (c: { x: number; y: number; s: number }, x: number, y: number) => ({
  x: 960 + (x - c.x) * c.s,
  y: 540 + (y - c.y) * c.s,
});


const STEPS = ["选中宫格图", "更多 → 宫格拆分", "自定义宫格，划出行列", "一键拆成独立节点"];
const Glow: React.FC<React.ComponentProps<typeof GlowRect>> = (p) => <GlowRect stroke={10} {...p} />;

// Rec px rectangles (recK): 更多 / 宫格拆分 item / 自定义宫格 item / the 3x3 cells.
const R_MORE = { x: 1384, y: 344, w: 188, h: 72, r: 20 };
const R_SUB = { x: 1390, y: 954, w: 372, h: 68, r: 20 };
const R_CUSTOM = { x: 1784, y: 1184, w: 364, h: 70, r: 20 };
const R_33 = { x: 2160, y: 968, w: 172, h: 172, r: 22 };

const SHOTS: TakeShot[] = [
  // ── 教程：吉卜力风海边分镜故事板 3×3 ───────────────────────────────────
  { id: "gSel", src: G, start: 3.5, end: 4.95, fresh: true, clicks: [4.75], cam: [{ t: 0, ...MID }, { t: 1, ...ENTRY }] },
  // pause: the node is selected, toolbar showing
  { id: "gSelHold", src: G, start: 4.95, end: 5.5, rate: 0.6, xfade: 0, cam: [{ t: 1, ...ENTRY }] },
  { id: "gGap", src: G, start: 5.5, end: 7.7, rate: 5, xfade: 0, cam: [{ t: 1, ...ENTRY }] },
  { id: "gMoreA", src: G, start: 7.7, end: 8.3, rate: 1.3, xfade: 0, cam: [{ t: 1, ...ENTRY }] },
  // pause: press 更多 (opens on the second press)
  {
    id: "gMore",
    src: G,
    start: 8.3,
    end: 9.2,
    rate: 0.6,
    xfade: 0,
    clicks: [8.5, 9.0],
    cam: [{ t: 1, ...ENTRY }],
    overlay: <Glow {...R_MORE} at={0} />,
  },
  { id: "gMenu", src: G, start: 9.2, end: 9.5, xfade: 0, cam: [{ t: 1, ...MENU }] },
  { id: "gIdle2", src: G, start: 9.5, end: 10.2, rate: 3, xfade: 0, cam: [{ t: 1, ...MENU }] },
  { id: "gSubA", src: G, start: 10.2, end: 10.85, rate: 1.3, xfade: 0, cam: [{ t: 1, ...MENU }] },
  // pause: press 宫格拆分
  {
    id: "gSub",
    src: G,
    start: 10.85,
    end: 11.45,
    rate: 0.6,
    xfade: 0,
    clicks: [11.1],
    cam: [{ t: 1, ...MENU }],
    overlay: <Glow {...R_SUB} at={0} />,
  },
  // pause: press 自定义宫格, the picker opens
  {
    id: "gCustom",
    src: G,
    start: 11.45,
    end: 12.3,
    rate: 0.7,
    xfade: 0,
    clicks: [11.8],
    cam: [{ t: 1, ...MENU }],
    overlay: <Glow {...R_CUSTOM} at={4} />,
  },
  { id: "gPickWait", src: G, start: 12.3, end: 17.6, rate: 10, xfade: 0, cam: [{ t: 1, ...MENU }] },
  { id: "gSweep", src: G, start: 17.6, end: 19.3, rate: 1.2, xfade: 0, cam: [{ t: 1, ...MENU }], overlay: <Glow {...R_33} at={48} /> },
  // pause: 3x3 is lit
  { id: "gHold", src: G, start: 19.3, end: 20.8, xfade: 0, cam: [{ t: 1, ...MENU }], overlay: <Glow {...R_33} at={0} /> },
  { id: "gIdle3", src: G, start: 20.8, end: 24.0, rate: 8, xfade: 0, cam: [{ t: 1, ...MENU }], overlay: <Glow {...R_33} at={0} /> },
  // pause: confirm
  {
    id: "gClick",
    src: G,
    start: 24.0,
    end: 24.9,
    rate: 0.7,
    xfade: 0,
    clicks: [24.4],
    cam: [{ t: 1, ...MENU }],
    overlay: <Glow {...R_33} at={0} until={18} />,
  },
  { id: "gLoad", src: G, start: 24.9, end: 28.3, rate: 2.4, xfade: 0, cam: [{ t: 1, ...WIDE }] },
  { id: "gGrow", src: G, start: 28.3, end: 40.2, rate: 3.4, xfade: 0, cam: [{ t: 1, ...WIDE }] },
  { id: "gDone", src: G, start: 40.2, end: 42.4, xfade: 0, cam: [{ t: 1, ...WIDE }] },
];

const PACE = 1.15;
const take = buildTake(
  G,
  SHOTS.map((s) => ({ ...s, rate: (s.rate ?? 1) > 1 ? (s.rate as number) * PACE : s.rate })),
);

// Showcase beats: original sheet -> split cells -> where it is used.
const CASES: Case[] = [
  { slug: "guofeng", ext: "jpg", cols: 3, rows: 3, aspect: 16 / 9, title: "短剧分镜", scene: "古风短剧：整场戏的镜头一次拆出" },
  { slug: "pixar", ext: "jpg", cols: 3, rows: 3, aspect: 16 / 9, title: "分镜故事板", scene: "影视 / 动画分镜：一张图定 9 个镜头" },
  { slug: "disney", ext: "jpg", cols: 3, rows: 3, aspect: 16 / 9, title: "旅行故事板", scene: "短片策划：按时间线逐镜头拆开" },
  { slug: "job", ext: "jpg", cols: 3, rows: 3, aspect: 9 / 16, title: "角色形象套图", scene: "IP 角色：9 个职业造型一次出齐" },
  { slug: "shop", ext: "jpg", cols: 2, rows: 2, aspect: 1.274, title: "电商套图", scene: "电商详情：模特 / 场景 / 细节 / 海报" },
  { slug: "items", ext: "png", cols: 5, rows: 3, aspect: 16 / 9, alpha: true, title: "游戏道具图标", scene: "游戏美术：道具一次出齐，直接用" },
  { slug: "fire", ext: "png", cols: 5, rows: 3, aspect: 16 / 9, alpha: true, title: "技能特效帧", scene: "游戏动效：逐帧素材透明底，直接用" },
];

const COVER = 48;
const T0 = COVER - 16;
const END_LEN = 60;
const FADE = 14;
const SH0 = T0 + take.total;
const E0 = SH0 + CASES.length * CASE_LEN;
const L0 = E0 + END_LEN;
export const MAIN_DURATION = L0 + TRAILER_FRAMES;

export const Main: React.FC = () => {
  const { Take, total, span } = take;
  const at = (a: string, b?: string) => {
    const s = span(a, b);
    return { from: T0 + s.from, durationInFrames: s.durationInFrames };
  };
  const step = (n: number, a: string, b: string, note?: string) => (
    <Sequence {...at(a, b)} name={`步骤${n}`}>
      <StepCaption steps={STEPS} step={n} note={note} placement="top-left" bold />
    </Sequence>
  );
  // Sticker anchors computed from rec px so they sit exactly on their target.
  const more = toFrame(ENTRY, R_MORE.x + R_MORE.w / 2, R_MORE.y); // top-centre of 更多
  const sub = toFrame(MENU, R_SUB.x, R_SUB.y + R_SUB.h); // bottom-left of 宫格拆分
  const pick = toFrame(MENU, R_33.x, R_33.y); // top-left of the 3x3 cells
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={T0} durationInFrames={total} name="Canvas take">
        <Take />
      </Sequence>

      <Sequence durationInFrames={COVER} name="Cover">
        <Cover exitAt={COVER - 16} />
      </Sequence>

      {/* 教程 */}
      {step(1, "gSel", "gGap")}
      {step(2, "gMoreA", "gCustom")}
      {step(3, "gPickWait", "gClick", "3 列 × 3 行，想拆几格自己定")}
      {step(4, "gLoad", "gDone")}
      <Sequence {...at("gMoreA", "gMore")} name="花字·更多">
        <Sticker x={more.x + 60 - 340} y={more.y - 112} text="点「更多」👇" bg={PINK} color="#fff" rotate={0} delay={4} />
      </Sequence>
      <Sequence {...at("gSubA", "gSub")} name="花字·宫格拆分">
        <Sticker x={sub.x - 220} y={sub.y + 14} text="👆 选「宫格拆分」" bg={PINK} color="#fff" rotate={0} delay={2} />
      </Sequence>
      <Sequence {...at("gHold", "gClick")} name="花字·自定义">
        <Sticker x={pick.x - 110} y={pick.y - 116} text="👇 想拆几格，自己定" bg={PINK} color="#fff" rotate={0} delay={2} />
      </Sequence>
      <Sequence from={at("gDone").from} durationInFrames={at("gDone").durationInFrames} name="贴纸·9张">
        <Sticker x={620} y={905} text="一键免费拆分成 9 张分镜图 ✨" rotate={-3} delay={4} />
      </Sequence>

      {/* 案例展示：原图 → 拆开后的图 + 应用场景 */}
      <Sequence from={SH0} durationInFrames={CASES.length * CASE_LEN} name="案例展示">
        <FadeIn len={10}>
          <ShowcaseBackdrop />
        </FadeIn>
        {CASES.map((c, i) => (
          <Sequence key={c.slug} from={i * CASE_LEN} durationInFrames={CASE_LEN} name={`案例·${c.title}`}>
            <CaseShowcase c={c} index={i} total={CASES.length} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={E0} durationInFrames={END_LEN} name="落版">
        <EndCenter title="宫格图，一键拆开" brand="宫格拆分" />
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

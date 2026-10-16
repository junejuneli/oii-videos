// Preview compositions for the gallery. Every component comes from @oii/kit; only
// the canvas behind them is a mock, drawn in recording pixels (3024×1544).
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  clamp,
  Cursor,
  DragLine,
  easeInOut,
  FadeIn,
  FadeOut,
  FadeToBlack,
  FONT_CN,
  HogiBrandMark,
  HogiCallout,
  HogiEndTitles,
  HogiLogoChip,
  HogiMemeTitle,
  HogiRipple,
  HogiSpeedPill,
  HogiSpotlight,
  HogiStepCaption,
  HogiSticker,
  HogiTopHeadline,
  HogiTypeReveal,
  Marquee,
  REC_H,
  REC_W,
  SweepTransition,
  Trailer,
  TRAILER_FRAMES,
  Watermark,
} from "@oii/kit";

/* ---------- mock canvas, in recording pixels (3024x1544) ---------- */

const CANVAS_BG = "#141418";
const NODE_BG = "#1E1E24";
const NODE_LINE = "rgba(255,255,255,0.10)";

const ART = [
  "radial-gradient(circle at 30% 35%, #FFD3E8 0 12%, transparent 13%), radial-gradient(circle at 70% 70%, #B44DFF 0 30%, transparent 31%), linear-gradient(160deg, #FF5DB1, #6A3BFF)",
  "radial-gradient(circle at 65% 40%, #FFE14D 0 14%, transparent 15%), radial-gradient(ellipse at 40% 90%, #1B7F79 0 40%, transparent 41%), linear-gradient(180deg, #7FD6FF, #2E5BFF)",
  "radial-gradient(circle at 35% 60%, #FFFFFF 0 9%, transparent 10%), radial-gradient(circle at 60% 30%, #FF8A3D 0 26%, transparent 27%), linear-gradient(200deg, #2B1240, #F0349B)",
  "radial-gradient(ellipse at 50% 80%, #0E3B2E 0 35%, transparent 36%), radial-gradient(circle at 75% 25%, #FFF4C2 0 12%, transparent 13%), linear-gradient(170deg, #9BE7C4, #2F8F6B)",
  "radial-gradient(circle at 45% 45%, #5CF2FF 0 18%, transparent 19%), linear-gradient(140deg, #13203F, #4A2B8F)",
];

const Art: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
  r?: number;
}> = ({ x, y, w, h, i, r = 20 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      background: ART[i % ART.length],
      boxShadow: "0 0 0 2px rgba(255,255,255,0.08)",
    }}
  />
);

const Label: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({
  x,
  y,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontFamily: FONT_CN,
      fontSize: 30,
      fontWeight: 600,
      color: "rgba(255,255,255,0.55)",
      letterSpacing: 1,
    }}
  >
    {children}
  </div>
);

export const TOOLBAR = { x: 1138, y: 36, w: 748, h: 104 };
export const toolButton = (i: number) => ({
  x: TOOLBAR.x + 16 + i * 92,
  y: TOOLBAR.y + 16,
  w: 72,
  h: 72,
});
export const NODE_A = { x: 460, y: 420, w: 560, h: 420 };
export const NODE_B = { x: 1340, y: 360, w: 680, h: 400 };
export const PROMPT = { x: 1340, y: 860, w: 680, h: 300 };
export const SAMPLES = { x: 2260, y: 300 };
export const sample = (i: number) => ({
  x: SAMPLES.x + (i % 2) * 324,
  y: SAMPLES.y + Math.floor(i / 2) * 214,
  w: 300,
  h: 190,
});

export const PROMPT_LINES = [
  "镜头缓缓推近，女孩回头微笑，",
  "风吹起发梢，暖色夕阳逆光，",
  "电影感，浅景深",
];

const MockCanvas: React.FC<{ promptText?: boolean }> = ({
  promptText = true,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: REC_W,
      height: REC_H,
      backgroundColor: CANVAS_BG,
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2.5px)",
      backgroundSize: "48px 48px",
    }}
  >
    {/* Toolbar */}
    <div
      style={{
        position: "absolute",
        left: TOOLBAR.x,
        top: TOOLBAR.y,
        width: TOOLBAR.w,
        height: TOOLBAR.h,
        borderRadius: 30,
        background: "#202027",
        boxShadow: `0 0 0 2px ${NODE_LINE}, 0 20px 40px rgba(0,0,0,0.4)`,
      }}
    />
    {Array.from({ length: 8 }).map((_, i) => {
      const b = toolButton(i);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            borderRadius: 18,
            background: i === 0 ? "rgba(255,255,255,0.10)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: i % 3 === 0 ? 8 : i % 3 === 1 ? 15 : 3,
              border: "4px solid rgba(255,255,255,0.7)",
              rotate: i % 3 === 2 ? "45deg" : "0deg",
            }}
          />
        </div>
      );
    })}

    {/* Edges */}
    <svg
      width={REC_W}
      height={REC_H}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <path
        d={`M ${NODE_A.x + NODE_A.w} 630 C 1180 630, 1180 560, ${NODE_B.x} 560`}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={4}
        fill="none"
      />
      <path
        d={`M ${NODE_B.x + NODE_B.w} 560 C 2140 560, 2140 502, ${SAMPLES.x} 502`}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={4}
        fill="none"
      />
      <circle cx={NODE_A.x + NODE_A.w} cy={630} r={10} fill="#fff" />
      <circle cx={NODE_B.x} cy={560} r={10} fill="#fff" />
    </svg>

    {/* Reference image */}
    <Label x={NODE_A.x} y={NODE_A.y - 52}>
      参考图
    </Label>
    <Art {...NODE_A} i={0} r={24} />

    {/* Video node */}
    <Label x={NODE_B.x} y={NODE_B.y - 52}>
      Seedance 2.5
    </Label>
    <div
      style={{
        position: "absolute",
        left: NODE_B.x,
        top: NODE_B.y,
        width: NODE_B.w,
        height: NODE_B.h,
        borderRadius: 24,
        background: NODE_BG,
        boxShadow: `0 0 0 2px ${NODE_LINE}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 16,
          borderRadius: 16,
          background: ART[2],
          opacity: 0.85,
        }}
      />
      <svg
        width={96}
        height={96}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: 292, top: 152 }}
      >
        <circle cx={12} cy={12} r={11} fill="rgba(0,0,0,0.45)" />
        <path d="M9.5 7.5 L17 12 L9.5 16.5 Z" fill="#fff" />
      </svg>
    </div>

    {/* Prompt box */}
    <Label x={PROMPT.x} y={PROMPT.y - 52}>
      提示词
    </Label>
    <div
      style={{
        position: "absolute",
        left: PROMPT.x,
        top: PROMPT.y,
        width: PROMPT.w,
        height: PROMPT.h,
        borderRadius: 24,
        background: NODE_BG,
        boxShadow: `0 0 0 2px ${NODE_LINE}`,
        padding: "34px 36px",
        boxSizing: "border-box",
        fontFamily: FONT_CN,
        fontSize: 36,
        lineHeight: "56px",
        color: "rgba(255,255,255,0.86)",
      }}
    >
      {promptText ? PROMPT_LINES.map((l) => <div key={l}>{l}</div>) : null}
    </div>

    {/* Samples */}
    <Label x={SAMPLES.x} y={SAMPLES.y - 52}>
      样片 ×4
    </Label>
    {[0, 1, 2, 3].map((i) => (
      <Art key={i} {...sample(i)} i={i + 1} r={16} />
    ))}

    {/* Zoom pill */}
    <div
      style={{
        position: "absolute",
        left: 48,
        bottom: 48,
        padding: "16px 28px",
        borderRadius: 999,
        background: "#202027",
        boxShadow: `0 0 0 2px ${NODE_LINE}`,
        fontFamily: FONT_CN,
        fontSize: 30,
        color: "rgba(255,255,255,0.6)",
      }}
    >
      − 100% +
    </div>
  </div>
);

/** The recording-pixel stage under a camera: rec point (cx, cy) at frame centre, scale s. */
const RecStage: React.FC<{
  cx?: number;
  cy?: number;
  s?: number;
  promptText?: boolean;
  children?: React.ReactNode;
}> = ({
  cx = REC_W / 2,
  cy = REC_H / 2,
  s = 1920 / REC_W,
  promptText,
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: CANVAS_BG, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        width: REC_W,
        height: REC_H,
        left: 960 - cx * s,
        top: 540 - cy * s,
        scale: String(s),
        transformOrigin: "0 0",
      }}
    >
      <MockCanvas promptText={promptText} />
      {children}
    </div>
  </AbsoluteFill>
);

const center = (r: { x: number; y: number; w: number; h: number }) => ({
  x: r.x + r.w / 2,
  y: r.y + r.h / 2,
});

/* ---------- previews ---------- */

const LogoChipPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ flexDirection: "row" }}>
      <div style={{ flex: 1, background: CANVAS_BG, position: "relative" }}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
            opacity: o,
          }}
        >
          <HogiLogoChip height={80} tone="white" />
        </AbsoluteFill>
      </div>
      <div
        style={{
          flex: 1,
          background: "linear-gradient(180deg, #ffffff, #e9e9ee)",
          position: "relative",
        }}
      >
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
            opacity: o,
          }}
        >
          <HogiLogoChip height={80} tone="black" />
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

const WatermarkPreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage />
    <Watermark />
  </AbsoluteFill>
);

const TrailerPreview: React.FC = () => <Trailer />;

const EndTitlesPreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage cx={center(NODE_B).x} cy={center(NODE_B).y} s={2.6} />
    <HogiEndTitles
      badge="Seedance 2.5"
      title={"低成本出样，\n选择即成片"}
      highlight="选择即成片"
    />
  </AbsoluteFill>
);

const STEPS_SAMPLE = [
  "选参考",
  "连线生成",
  "写提示词",
  "选择样片模式",
  "选中成片",
];
const STEP_LEN = 40;

const StepCaptionPreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage s={0.8} />
    {STEPS_SAMPLE.map((_, i) => (
      <Sequence
        key={i}
        from={i * STEP_LEN}
        durationInFrames={STEP_LEN}
        layout="none"
      >
        <HogiStepCaption steps={STEPS_SAMPLE} step={i + 1} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const BrandMarkPreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage s={0.8} />
    <HogiBrandMark label="Seedance 2.5 · 样片模式" />
  </AbsoluteFill>
);

const SpeedPillPreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage
      cx={center(NODE_B).x + 200}
      cy={center(NODE_B).y + 120}
      s={1.25}
    />
    <HogiSpeedPill label="4 个样片生成中" />
  </AbsoluteFill>
);

const TopHeadlinePreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage cx={SAMPLES.x + 312} cy={SAMPLES.y + 220} s={1.9} />
    <HogiTopHeadline text="多条样片演绎，同屏对比" highlight="同屏对比" />
  </AbsoluteFill>
);

const StickerPreview: React.FC = () => (
  <AbsoluteFill>
    <RecStage cx={center(NODE_A).x + 300} cy={center(NODE_A).y} s={1.5} />
    <HogiSticker x={150} y={170} text="添加颜色标签入口" highlight="颜色标签" />
    <HogiSticker x={1120} y={640} text="已标记" tone="result" delay={36} />
  </AbsoluteFill>
);

const MemeTitlePreview: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 100], [2.2, 0.7], {
    ...clamp,
    easing: easeInOut,
  });
  return (
    <AbsoluteFill>
      <RecStage cx={center(NODE_A).x} cy={center(NODE_A).y} s={s} />
      <HogiMemeTitle kicker="我的图呢？" title="我那么大一张图呢？" />
    </AbsoluteFill>
  );
};

/* Emphasis */
const btn = toolButton(5);
const SpotlightPreview: React.FC = () => (
  <RecStage cx={btn.x + 36} cy={btn.y + 160} s={2.4}>
    <HogiSpotlight
      x={btn.x - 20}
      y={btn.y - 20}
      w={btn.w + 40}
      h={btn.h + 40}
      r={30}
      at={8}
    />
  </RecStage>
);

const tap = toolButton(2);
const RipplePreview: React.FC = () => (
  <RecStage cx={tap.x + 36} cy={tap.y + 160} s={2.4}>
    {[8, 38, 68].map((at) => (
      <HogiRipple key={at} x={tap.x + 36} y={tap.y + 36} at={at} />
    ))}
  </RecStage>
);

const CalloutPreview: React.FC = () => (
  <RecStage cx={SAMPLES.x + 250} cy={SAMPLES.y + 260} s={1.5}>
    <HogiCallout
      x={SAMPLES.x - 80}
      y={SAMPLES.y + 450}
      at={8}
      text="低成本出样，选择即成片"
      highlight="选择即成片"
    />
  </RecStage>
);

/* Transitions */
// With the marketing kit's two demo clips in media/ (see README) this is its own
// sweep demo: 16 s, passes at 2.2 s and 12.6 s. Without them, two canvas views.
const clip = (src: string, muted: boolean) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <OffthreadVideo
      src={staticFile(src)}
      muted={muted}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </AbsoluteFill>
);
const SweepPreview: React.FC = () =>
  __SWEEP_CLIPS__ ? (
    <SweepTransition
      a={clip("media/sweep-a.mp4", true)}
      b={clip("media/sweep-b.mp4", false)}
    />
  ) : (
    <SweepTransition
      a={
        <AbsoluteFill style={{ filter: "grayscale(1) brightness(0.8)" }}>
          <RecStage cx={center(NODE_B).x} cy={center(NODE_B).y} s={1.6} />
        </AbsoluteFill>
      }
      b={<RecStage cx={SAMPLES.x + 312} cy={SAMPLES.y + 200} s={1.8} />}
    />
  );

const BODY = 75;
const FADE = 14;
const FadesPreview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={BODY} name="Body">
      <RecStage />
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

const a = center(NODE_A);
const s1 = sample(0);
const s4 = sample(3);
const CursorPreview: React.FC = () => (
  <RecStage cx={1830} cy={760} s={0.82}>
    <Marquee
      x0={s1.x - 40}
      y0={s1.y - 40}
      x1={s4.x + s4.w + 40}
      y1={s4.y + s4.h + 40}
      from={70}
      to={100}
    />
    <Cursor
      keys={[
        { f: 0, x: 900, y: 1200 },
        { f: 24, x: a.x, y: a.y },
        { f: 30, x: a.x, y: a.y, press: true },
        { f: 46, x: a.x, y: a.y },
        { f: 70, x: s1.x - 40, y: s1.y - 40 },
        { f: 100, x: s4.x + s4.w + 40, y: s4.y + s4.h + 40 },
        { f: 130, x: s4.x + s4.w + 40, y: s4.y + s4.h + 40 },
      ]}
    />
  </RecStage>
);

const DragLinePreview: React.FC = () => {
  const x0 = NODE_A.x + NODE_A.w;
  const y0 = 630;
  const x1 = PROMPT.x;
  const y1 = PROMPT.y + 140;
  return (
    <RecStage cx={1180} cy={860} s={1.5}>
      <DragLine x0={x0} y0={y0} x1={x1} y1={y1} from={14} to={50} hideAt={80} />
      <Cursor
        keys={[
          { f: 0, x: x0 - 140, y: y0 + 160 },
          { f: 12, x: x0, y: y0, press: true },
          { f: 14, x: x0, y: y0 },
          { f: 50, x: x1, y: y1 },
          { f: 90, x: x1, y: y1 },
        ]}
      />
    </RecStage>
  );
};

const TYPE_LINES = PROMPT_LINES.map((t, i) => ({
  y: PROMPT.y + 34 + 56 * i,
  h: 56,
  w: t.length * 36,
  chars: t.length,
}));
const TypeRevealPreview: React.FC = () => (
  <RecStage cx={center(PROMPT).x} cy={center(PROMPT).y} s={2}>
    <HogiTypeReveal
      x={PROMPT.x + 36}
      width={PROMPT.w - 60}
      lines={TYPE_LINES}
      text={PROMPT_LINES}
      color={NODE_BG}
      from={12}
      to={84}
    />
  </RecStage>
);

/* ---------- registry ---------- */

export type PreviewDef = {
  component: React.FC;
  duration: number;
  /** Frame shown before playback starts, so a paused card is not blank. */
  still: number;
  audio?: boolean;
};

export const PREVIEWS: Record<string, PreviewDef> = {
  logochip: { component: LogoChipPreview, duration: 60, still: 30 },
  watermark: { component: WatermarkPreview, duration: 190, still: 60 },
  trailer: {
    component: TrailerPreview,
    duration: TRAILER_FRAMES,
    still: 45,
    audio: true,
  },
  endtitles: { component: EndTitlesPreview, duration: 110, still: 45 },
  stepcaption: {
    component: StepCaptionPreview,
    duration: STEP_LEN * 5,
    still: STEP_LEN + 24,
  },
  sticker: { component: StickerPreview, duration: 120, still: 70 },
  memetitle: { component: MemeTitlePreview, duration: 110, still: 40 },
  speedpill: { component: SpeedPillPreview, duration: 90, still: 50 },
  topheadline: { component: TopHeadlinePreview, duration: 90, still: 45 },
  brandmark: { component: BrandMarkPreview, duration: 60, still: 30 },
  spotlight: { component: SpotlightPreview, duration: 90, still: 40 },
  ripple: { component: RipplePreview, duration: 90, still: 16 },
  callout: { component: CalloutPreview, duration: 100, still: 50 },
  fades: {
    component: FadesPreview,
    duration: BODY + TRAILER_FRAMES,
    still: 68,
    audio: true,
  },
  sweep: { component: SweepPreview, duration: 480, still: 84, audio: true },
  cursor: { component: CursorPreview, duration: 130, still: 88 },
  dragline: { component: DragLinePreview, duration: 90, still: 40 },
  typereveal: { component: TypeRevealPreview, duration: 120, still: 48 },
};

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { clamp, easeOut, FONT_CN, INK, MemeTitle, Sticker } from "@oii/kit";
import { fit43, useLayout } from "./layout";
import { Cue, PLANS } from "./recs";
import {
  Bubble,
  Chip,
  FlowRing,
  ChapterCard,
  CompareView,
  GlowBox,
  OCCard,
  Pic,
  PromptBox,
  Stage,
  Wipe,
} from "./parts";
import { EndCenter } from "./EndCenter";

/* ------------------------------------------------------------------ */
/* Reusable shot kinds                                                 */
/* ------------------------------------------------------------------ */

type R = { x: number; y: number; w: number; h: number };

/** Simulated edit run: operate on base, type the prompt, submit, then focus the new image. */
const Typed: React.FC<{
  base: string;
  result: string;
  mode: string;
  rect?: R;
  boxes?: (R & { n: number })[];
  text: string;
  op?: string;
  chip?: string;
  sticker?: string;
  fit?: "cover" | "contain";
}> = ({ base, result, mode, rect, boxes, text, op, chip, sticker, fit = "cover" }) => {
  const { durationInFrames: D } = useVideoConfig();
  const { stage } = useLayout();
  const f = useCurrentFrame();
  const t0 = Math.round(D * 0.1);
  const t1 = Math.round(D * 0.3);
  const t2 = Math.round(D * 0.58);
  const w0 = Math.round(D * 0.64);
  const w1 = Math.round(D * 0.76);
  const r1 = Math.round(D * 0.86);
  const showEdit = f < w0;
  const pushIn = interpolate(f, [w1, D], [1, 1.1], { ...clamp, easing: easeOut });
  const resultMode = f >= w1;
  return (
    <>
      <Stage>
        <div style={{ position: "absolute", inset: 0, scale: String(resultMode ? pushIn : 1) }}>
          {resultMode ? <Pic id={result} fit={fit} /> : <Pic id={base} fit={fit} />}
          {showEdit && rect ? <GlowBox r={rect} at={t0} dim /> : null}
          {showEdit ? boxes?.map((b) => <GlowBox key={b.n} r={b} at={t0 + b.n * 6} n={b.n} />) : null}
        </div>
        {resultMode ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(240,52,155,0.55)",
              opacity: interpolate(f, [w1, w1 + 6], [0.9, 0], clamp),
            }}
          />
        ) : null}
      </Stage>
      <PromptBox text={text} mode={mode} from={t1} to={t2} working={[w0, w1]} sendAt={t2 + 4} />
      {op && f < t1 ? <Chip text={op} x={stage.x + 36} y={stage.y + 36} bg="#F0349B" color="#fff" /> : null}
      {f >= t1 && f < w0 ? <Chip text="说一句话，想要什么直接说" x={stage.x + 36} y={stage.y + 36} bg="#FFE14D" /> : null}
      {chip && resultMode ? <Chip text={chip} x={stage.x + 36} y={stage.y + 36} bg="#F0349B" color="#fff" /> : null}
      {sticker ? (
        <Sticker x={stage.x + stage.w - 560} y={stage.y + 40} text={sticker} bg="#9BE564" delay={r1} size={40} />
      ) : null}
    </>
  );
};

/** Three before/after pairs in sequence (small tricks). */
const Triplet: React.FC<{ pairs: [string, string, string?][] }> = ({ pairs }) => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const per = D / pairs.length;
  const i = Math.min(pairs.length - 1, Math.floor(f / per));
  const local = f - i * per;
  return (
    <Stage>
      <Sequence2 key={i}>
        <Wipe a={pairs[i][0]} b={pairs[i][1]} from={Math.round(per * 0.2)} to={Math.round(per * 0.6)} />
      </Sequence2>
      <Chip text={pairs[i][2] ?? "想要 → 得到"} x={36} y={36} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: "rgba(255,255,255,0.2)" }}>
        <div style={{ width: `${((i + local / per) / pairs.length) * 100}%`, height: "100%", background: "#F0349B" }} />
      </div>
    </Stage>
  );
};

/** Keeps local frame numbering when the wrapped content switches (`key`). */
const Sequence2: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

/** Rapid 0.1s flip: used by preview montage and the 12-frame flipbook. */
const Flip: React.FC<{ ids: string[]; per: number; box?: boolean }> = ({ ids, per, box = true }) => {
  const f = useCurrentFrame();
  const i = Math.floor(f / per) % ids.length;
  return (
    <Stage>
      <Pic id={ids[i]} />
      {box ? <GlowBox r={{ x: 0.3, y: 0.44, w: 0.42, h: 0.5 }} at={0} /> : null}
    </Stage>
  );
};

const EXPR = ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12"];

const Hint: React.FC<{ text: string }> = ({ text }) => {
  const { stage } = useLayout();
  return <Chip text={text} x={stage.x + 36} y={stage.y + 36} bg="#FFE14D" />;
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

const MontageItem: React.FC<{ a: string; b: string; label: string; stage?: boolean }> = ({ a, b, label }) => {
  const { stage } = useLayout();
  return (
    <>
      <Stage>
        <Wipe a={a} b={b} from={4} to={20} />
      </Stage>
      <Sticker x={stage.x + 60} y={stage.y + stage.h - 190} text={label} bg="#FFE14D" size={54} rotate={-4} />
    </>
  );
};

const Hand: React.FC = () => {
  const { stage } = useLayout();
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const ir = fit43(stage);
  const z = interpolate(f, [0, D * 0.8], [1, 1.9], { ...clamp, easing: easeOut });
  const flash = f > 6;
  return (
    <>
      <Stage bg="#0A0A0C">
        <div
          style={{
            position: "absolute",
            left: ir.x,
            top: ir.y,
            width: ir.w,
            height: ir.h,
            scale: String(z),
            transformOrigin: "62.5% 66%",
          }}
        >
          <Pic id="A01" fit="contain" />
          {flash ? (
            <div
              style={{
                position: "absolute",
                left: "56%",
                top: "53%",
                width: "13%",
                height: "28%",
                border: "7px solid #ff3b3b",
                borderRadius: "46%",
                boxShadow: "0 0 24px rgba(255,59,59,0.8)",
              }}
            />
          ) : null}
        </div>
      </Stage>
      <Chip text="99 分 → 手有毛病" x={stage.x + 36} y={stage.y + 36} />
    </>
  );
};

const DrawCard: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const { stage } = useLayout();
  const t1 = Math.round(D * 0.38);
  const t2 = Math.round(D * 0.72);
  const pw = Math.min(stage.w * 0.4, (stage.h * 0.58 * 4) / 3);
  const ph = (pw * 3) / 4;
  const panel = (id: string, left: number, label: string, tone: string, at: number) => {
    const p = interpolate(f, [at, at + 10], [0, 1], clamp);
    return (
      <div
        style={{
          position: "absolute",
          left,
          top: stage.h * 0.28,
          width: pw,
          height: ph,
          opacity: p,
          scale: String(0.94 + p * 0.06),
          borderRadius: 18,
          overflow: "hidden",
          border: `6px solid ${tone}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
        }}
      >
        <Pic id={id} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "14px 20px",
            background: tone,
            color: "#fff",
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 40,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </div>
    );
  };
  const gap = (stage.w - pw * 2) / 3;
  const arrow = interpolate(f, [t1 - 4, t1 + 6], [0, 1], clamp);
  return (
    <>
      <Stage bg="#0A0A0C">
        {panel("A01", gap, "第 1 张：手不对", "#d93a3a", 0)}
        <div
          style={{
            position: "absolute",
            left: gap + pw,
            width: gap,
            top: stage.h * 0.28 + ph / 2 - 30,
            textAlign: "center",
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: 44,
            whiteSpace: "nowrap",
            color: "#FFE14D",
            opacity: arrow,
          }}
        >
          重抽 →
        </div>
        {panel("A02x", gap * 2 + pw, "第 2 张：手好了，镜头和脸变了", "#e08a1e", t1)}
      </Stage>
      {f >= t2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: stage.h * 0.28 }}>
          <MemeTitle lines={["AI 生图，就像一盒巧克力", "下一张手有几根手指，谁知道"]} />
        </div>
      ) : null}
      <Chip text="示意" x={stage.x + 36} y={stage.y + stage.h - 90} bg="#ddd" size={28} />
    </>
  );
};

const Tools: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const names = ["涂抹", "框选", "引用", "对比"];
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #2a1630 0%, #0A0A0C 70%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: portrait ? "column" : "row",
        gap: 40,
      }}
    >
      {names.map((n, i) => {
        const p = interpolate(f, [i * 8, i * 8 + 10], [0, 1], clamp);
        return (
          <div
            key={n}
            style={{
              fontFamily: FONT_CN,
              fontWeight: 700,
              fontSize: 64,
              color: INK,
              background: "#FFE14D",
              border: `6px solid ${INK}`,
              borderRadius: 28,
              boxShadow: `0 8px 0 ${INK}`,
              padding: "26px 40px",
              opacity: p,
              scale: String(0.8 + p * 0.2),
            }}
          >
            {n}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CoverRound: React.FC<{ a: string; b: string; bubble: string; round: number }> = ({ a, b, bubble, round }) => {
  const { stage } = useLayout();
  const { durationInFrames: D } = useVideoConfig();
  return (
    <>
      <Stage bg="#0A0A0C">
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: stage.h * 0.75, marginLeft: -(stage.h * 0.75) / 2 }}>
          <Wipe a={a} b={b} from={Math.round(D * 0.35)} to={Math.round(D * 0.7)} fit="contain" />
        </div>
      </Stage>
      <Bubble text={bubble} side="l" y={stage.y + 70} />
      <Chip text={`第 ${round} 轮`} x={stage.x + stage.w - 220} y={stage.y + 36} bg="#F0349B" color="#fff" />
    </>
  );
};

const Film: React.FC = () => {
  const { stage } = useLayout();
  const ids = ["A12", "A13", "A14", "A15", "A16", "A17"];
  return (
    <>
      <Stage bg="#0A0A0C">
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 8, padding: 20, alignItems: "center" }}>
          {ids.map((id, i) => (
            <div key={id} style={{ flex: 1, height: "88%", position: "relative", borderRadius: 12, overflow: "hidden" }}>
              <Pic id={id} fit="cover" />
              <div style={{ position: "absolute", left: 8, bottom: 8, color: "#fff", fontFamily: FONT_CN, fontWeight: 700, fontSize: 28 }}>
                {i === 0 ? "第一版" : `第 ${i} 轮`}
              </div>
            </div>
          ))}
        </div>
      </Stage>
      <Bubble text="我觉得……还是第一版好。" side="r" y={stage.y + stage.h * 0.62} />
    </>
  );
};

/** Real screen recording: camera focuses on the operation, flowing rings mark clicks, typewriter prompt. */
const VW = 1512;
const VH = 772;
const RecShot: React.FC<{ clip: string; seconds: number; plan?: string; chip?: string }> = ({ clip, seconds, plan, chip }) => {
  const { durationInFrames: D, fps } = useVideoConfig();
  const f = useCurrentFrame();
  const { stage } = useLayout();
  const rate = Math.max(0.5, seconds / (D / fps));
  const t = (f / fps) * rate; // seconds inside the clip
  const k = Math.min(stage.w / VW, stage.h / VH);
  const ox = (stage.w - VW * k) / 2;
  const oy = (stage.h - VH * k) / 2;
  const P = plan ? PLANS[plan] : undefined;
  // camera
  let cx = VW / 2, cy = VH / 2, z = 1;
  if (P && P.cam.length) {
    const cam = P.cam;
    if (t <= cam[0][0]) [, cx, cy, z] = cam[0];
    else if (t >= cam[cam.length - 1][0]) [, cx, cy, z] = cam[cam.length - 1];
    else {
      for (let i = 0; i < cam.length - 1; i++) {
        const [t0, x0, y0, z0] = cam[i];
        const [t1, x1, y1, z1] = cam[i + 1];
        if (t >= t0 && t <= t1) {
          const span = Math.max(0.0001, t1 - t0);
          const p = Math.min(1, (t - t0) / Math.min(span, 1.2));
          const e = p * p * (3 - 2 * p);
          cx = x0 + (x1 - x0) * e;
          cy = y0 + (y1 - y0) * e;
          z = z0 + (z1 - z0) * e;
          break;
        }
      }
    }
  }
  const px = cx * k + ox;
  const py = cy * k + oy;
  const tx = stage.w / 2 - px * z;
  const ty = stage.h / 2 - py * z;
  const active = (c: Cue) => t >= c.a && t < c.b;
  const masks = (P?.cues ?? []).filter((c) => c.mask && active(c));
  const typed = P?.type;
  return (
    <>
      <Stage>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: stage.w,
            height: stage.h,
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty}px) scale(${z})`,
          }}
        >
          <div style={{ position: "absolute", left: ox, top: oy, width: VW * k, height: VH * k }}>
            <Video
              src={staticFile(`rec/clips/${clip}.mp4`)}
              muted
              playbackRate={rate}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            {typed && t >= typed.a && t < typed.b + 0.6 ? (
              <div
                style={{
                  position: "absolute",
                  left: typed.rect[0] * k,
                  top: typed.rect[1] * k,
                  width: typed.rect[2] * k,
                  height: typed.rect[3] * k,
                  background: "#131316",
                  color: "#fff",
                  fontFamily: FONT_CN,
                  fontWeight: 700,
                  fontSize: 22 * k,
                  padding: `${6 * k}px ${10 * k}px`,
                  lineHeight: 1.35,
                }}
              >
                {typed.text.slice(
                  0,
                  Math.floor(interpolate(t, [typed.a, typed.b], [0, typed.text.length], clamp))
                )}
                <span style={{ color: "#F0349B" }}>|</span>
              </div>
            ) : null}
            {masks.map((c, i) =>
              c.rect ? (
                <div key={`m${i}`} style={{ position: "absolute", left: c.rect[0] * k, top: c.rect[1] * k, width: c.rect[2] * k, height: c.rect[3] * k, background: "#0A0A0C" }} />
              ) : null
            )}
            {P?.cues.filter((c) => active(c) && !c.mask).map((c, i) =>
              c.rect ? (
                <Sequence2 key={`${c.label}-${i}`}>
                  <FlowRing x={c.rect[0] * k} y={c.rect[1] * k} w={c.rect[2] * k} h={c.rect[3] * k} stroke={4 / Math.max(1, z * 0.7)} />
                </Sequence2>
              ) : null
            )}
          </div>
        </div>
      </Stage>
      {P?.cues.filter((c) => active(c) && !c.mask).map((c, i) =>
        c.label ? (
          <Chip
            key={`${c.label}-${i}`}
            text={c.label}
            x={stage.x + 36}
            y={stage.y + 36}
            bg={c.sticker ? "#9BE564" : "#F0349B"}
            color={c.sticker ? INK : "#fff"}
            size={42}
          />
        ) : null
      )}
      {chip ? <Chip text={chip} x={stage.x + 36} y={stage.y + stage.h - 100} bg="#F0349B" color="#fff" /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Timeline (seconds). Mirrors storyboard.md                           */
/* ------------------------------------------------------------------ */

export type Shot = { id: string; t: number; d: number; vo?: string; node: React.ReactNode };

const FACE: R = { x: 0.36, y: 0.1, w: 0.26, h: 0.34 };

const RAW: Shot[] = [
  // P · preview montage (0–8s)
  { id: "P1", t: 0, d: 1, node: <MontageItem a="A05a" b="A05b" label="换成酒红" /> },
  { id: "P2", t: 1, d: 1, node: <MontageItem a="A03" b="A04" label="路人，没了" /> },
  { id: "P3", t: 2, d: 1, node: <MontageItem a="A01" b="A02" label="手指，正常了" /> },
  { id: "P4", t: 3, d: 1, node: <MontageItem a="A18" b="A20" label="戴顶帽子" /> },
  { id: "P5", t: 4, d: 1, node: <MontageItem a="A14" b="A15" label="太沉了，换白的" /> },
  { id: "P6", t: 5, d: 1, node: <MontageItem a="A15" b="A16" label="要点质感" /> },
  { id: "P7", t: 6, d: 2, vo: "一张图，哪儿不对，涂哪儿。", node: <Flip ids={EXPR} per={3} /> },
  // OC1
  {
    id: "OC1",
    t: 8,
    d: 10,
    vo: "我是 AI 抽卡君，专门替你们抽卡抽到手软的那个。今天，不抽卡。这期我把 AI 局部编辑的 5 个步骤、4 个工具，全部整理好了。提示词和原图，都在置顶评论的文档里。先点个收藏，我们开始。",
    node: <OCCard line="今天，不抽卡" sub="5 步 · 4 个工具（涂抹 / 框选 / 引用 / 对比）· 提示词文档见置顶评论" />,
  },
  // H
  { id: "H1", t: 18, d: 5, vo: "这张图，99 分。就这只手，多了几根手指。", node: <Hand /> },
  {
    id: "H2",
    t: 23,
    d: 8,
    vo: "重抽一张，手好了，可镜头和脸都变了。AI 生图像一盒巧克力，下一张手有几根，谁知道。你说改手指，它说：已为您重开人生。",
    node: <DrawCard />,
  },
  {
    id: "H3",
    t: 31,
    d: 5,
    vo: "今天不抽了：涂一下，说一句。",
    node: (
      <Typed
        base="A01"
        result="A02"
        mode="涂抹"
        rect={{ x: 0.58, y: 0.5, w: 0.16, h: 0.2 }}
        text="擦除杯子右侧多出来的手指，补成毛衣和背景"
        op="① 涂在多出来的手指上"
        chip="想要 → 得到"
      />
    ),
  },
  // OC2
  { id: "OC2", t: 36, d: 4, vo: "先从最简单的开始：你涂哪儿，它改哪儿。", node: <OCCard line="先从最简单的开始" /> },
  // Step 1
  { id: "S1-0", t: 40, d: 2, node: <ChapterCard title="Step 1 · 涂抹：涂哪改哪" level={1} /> },
  { id: "S1-rec", t: 42, d: 26, vo: "选中图，点局部编辑。默认就是涂抹。涂上卫衣，说一句：奶油黄。想要，得到。", node: <RecShot clip="G01" seconds={25.5} plan="G01" /> },
  {
    id: "S1-3",
    t: 55,
    d: 6,
    vo: "想要顶帽子，直接说。",
    node: (
      <Typed
        base="A18"
        result="A20"
        mode="涂抹"
        rect={{ x: 0.34, y: 0.02, w: 0.32, h: 0.18 }}
        text="给她戴上一顶米白色的针织贝雷帽"
        op="① 涂在想戴帽子的地方"
        chip="想要 → 得到"
      />
    ),
  },
  {
    id: "S1-4",
    t: 61,
    d: 5,
    vo: "碍眼的东西，涂掉。",
    node: (
      <Typed
        base="A18"
        result="A21"
        mode="涂抹"
        rect={{ x: 0.86, y: 0.6, w: 0.14, h: 0.3 }}
        text="把涂抹的白色纸袋去掉，补成干净的墙面"
        op="① 涂在碍眼的东西上"
        chip="想要 → 得到"
      />
    ),
  },
  {
    id: "S1-5",
    t: 66,
    d: 6,
    vo: "路人、手指、衣服颜色，都是涂一下。涂紧一点，别蹭到旁边。",
    node: (
      <Triplet
        pairs={[
          ["A03", "A04", "去路人"],
          ["A01", "A02", "去多余手指"],
          ["A05a", "A05b", "换颜色 · 涂紧一点"],
        ]}
      />
    ),
  },
  // OC3
  { id: "OC3", t: 72, d: 4, vo: "好，上点难度。一次要改好几处，怎么办？", node: <OCCard line="上点难度" /> },
  // Step 2
  { id: "S2-0", t: 76, d: 2, node: <ChapterCard title="Step 2 · 框选：一处一句" level={2} /> },
  { id: "S2-1", t: 78, d: 56, vo: "改脸这种一小块，用框选。框起来，编号，一处一句。", node: <RecShot clip="G02" seconds={113.6} plan="G02" /> },
  {
    id: "S2-3",
    t: 92,
    d: 12,
    vo: "电商图，老板要三个细节：腰带，扣子，领口。一个框一句话，按编号写。",
    node: (
      <Triplet
        pairs={[
          ["A08", "A09", "1: 腰带 → 焦糖棕"],
          ["A08", "A10", "2: 纽扣 → 金色"],
          ["A08", "A11", "3: 领口 → 毛领"],
        ]}
      />
    ),
  },
  // OC4
  { id: "OC4", t: 104, d: 4, vo: "再难一点：有时候，你自己都说不清想要什么。", node: <OCCard line="说不清？" /> },
  // Step 3
  { id: "S3-0", t: 108, d: 2, node: <ChapterCard title="Step 3 · 引用：说不清就给它看" level={2} /> },
  {
    id: "S3-1",
    t: 110,
    d: 4,
    vo: "想要这个包，但不知道怎么形容？",
    node: (
      <>
        <Stage>
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Pic id="A03" />
            </div>
            <div style={{ position: "relative", flex: 1 }}>
              <Pic id="A06" />
            </div>
          </div>
        </Stage>
        <Hint text="想要：这个包" />
      </>
    ),
  },
  { id: "S3-2", t: 114, d: 103, vo: "点引用，框住它，AI 自动识别。识别不准？上面的标签还能自己换。选好，涂到她身上。不用形容，给它看就行。", node: <RecShot clip="G04" seconds={102.7} plan="G04" /> },
  // OC5
  { id: "OC5", t: 123, d: 4, vo: "然后，甲方来了。", node: <OCCard line="甲方来了" /> },
  // Step 4
  { id: "S4-0", t: 127, d: 2, node: <ChapterCard title="Step 4 · 多轮：不够再来一轮" level={3} /> },
  { id: "S4-1", t: 129, d: 5, vo: "标题，能再大一点吗？", node: <CoverRound a="A12" b="A13" bubble="这个标题，能再大一点吗？" round={1} /> },
  { id: "S4-2", t: 134, d: 4, vo: "期号改一下。", node: <CoverRound a="A13" b="A14" bubble="期号改一下" round={2} /> },
  { id: "S4-3", t: 138, d: 3, vo: "颜色太沉，换白的。", node: <CoverRound a="A14" b="A15" bubble="颜色太沉了" round={3} /> },
  { id: "S4-4", t: 141, d: 3, vo: "要点质感，手表金的。", node: <CoverRound a="A15" b="A16" bubble="要点质感" round={4} /> },
  { id: "S4-5", t: 144, d: 3, vo: "太花了，小字去掉。", node: <CoverRound a="A16" b="A17" bubble="太花了，精简一点" round={5} /> },
  { id: "S4-6", t: 147, d: 8, vo: "五版改完，甲方说：还是第一版好。没事，每一轮都是新图，第一版还在，拉一下就能对比。", node: <Film /> },
  // OC6
  { id: "OC6", t: 155, d: 4, vo: "最后一个，也是最离谱的。看好了，别眨眼。", node: <OCCard line="别眨眼" /> },
  // Step 5
  { id: "S5-0", t: 159, d: 2, node: <ChapterCard title="Step 5 · 同一张图，改十二次" level={3} /> },
  {
    id: "S5-1",
    t: 161,
    d: 6,
    vo: "回到她。这次，只改脸，改十二次。",
    node: (
      <Typed
        base="A18"
        result="A22"
        mode="框选"
        boxes={[{ ...FACE, n: 1 }]}
        text="1: 表情改为…（大笑 / 吐舌 / 眨眼 / 打哈欠…）"
        op="① 框住脸（编号 1）"
        chip="同一张图 · 只改脸"
      />
    ),
  },
  { id: "S5-2", t: 167, d: 8, vo: "看花。看背景。", node: <Flip ids={["A18", ...EXPR, "A18"]} per={6} /> },
  {
    id: "S5-3",
    t: 175,
    d: 8,
    vo: "想看清？选两张，点对比。花，一朵没动。",
    node: (
      <>
        <Stage>
          <CompareView a="A18" b="E05" />
        </Stage>
        <Hint text="✓ 花没变" />
      </>
    ),
  },
  {
    id: "S5-4",
    t: 183,
    d: 4,
    vo: "然后，帽子，衣服，纸袋——想要什么，直接说。",
    node: (
      <Triplet
        pairs={[
          ["A18", "A20", "涂哪改哪"],
          ["A18", "A19", "想要什么，直接说"],
          ["A18", "A21", "想要 → 得到"],
        ]}
      />
    ),
  },
  // OC7
  { id: "OC7-1", t: 187, d: 3, vo: "涂抹，框选，引用，对比。", node: <Tools /> },
  {
    id: "OC7-2",
    t: 190,
    d: 9,
    vo: "说到底，AI 不缺手艺，缺的是你说清楚想要什么。今天这几个，都是涂一下、说一句。你最想改哪一处？评论区交作业。想要，就得到。我是 AI 抽卡君，下期继续不抽卡。",
    node: <OCCard line="说清楚想要什么" sub="评论区交作业 · 提示词文档见置顶评论" />,
  },
  // End
  {
    id: "E1",
    t: 199,
    d: 11,
    node: (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a1630 0%, #0A0A0C 70%)" }}>
        <EndCenter title="涂哪改哪，想要什么直接说" brand="局部编辑" />
      </AbsoluteFill>
    ),
  },
];

/** Re-flow start times so edited shot lengths never overlap. */
export const SHOTS: Shot[] = (() => {
  let t = 0;
  return RAW.map((x) => {
    const r = { ...x, t };
    t += x.d;
    return r;
  });
})();
export const TOTAL_SECONDS = Math.ceil(RAW.reduce((n, x) => n + x.d, 0));

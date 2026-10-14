import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, FONT_CN, INK, PINK } from "@oii/kit";

export type Case = {
  /** folder under public/assets/cases2, holds the split cells 01.ext … NN.ext */
  slug: string;
  ext: "jpg" | "png";
  cols: number;
  rows: number;
  /** sheet aspect (w / h), e.g. 16/9 or 9/16 */
  aspect: number;
  /** cells have a transparent background */
  alpha?: boolean;
  /** what the original is, e.g. 「分镜故事板」 */
  title: string;
  /** one line on where it is used */
  scene: string;
};

export const CASE_LEN = 96;

const BOX_W = 1248;
const BOX_H = 702;
const TOP = 244;
const GAP = 18;
const OUTER = 26;
const INNER = 18;

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);

const CHECKER =
  "conic-gradient(#d9dbe1 25%, #f4f5f8 0 50%, #d9dbe1 0 75%, #f4f5f8 0) 0 0 / 28px 28px";

/**
 * One showcase beat: the original sheet appears whole (its real split cells
 * tiled edge to edge), then the cells part and settle as independent
 * pictures, with a caption for where such a sheet gets used. Transparent
 * cells reveal a checkerboard as they part.
 */
export const CaseShowcase: React.FC<{ c: Case; index: number; total: number }> = ({
  c,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const n = c.cols * c.rows;
  const W = Math.min(BOX_W, BOX_H * c.aspect);
  const H = W / c.aspect;
  const inP = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(frame, [CASE_LEN - 6, CASE_LEN], [1, 0], clamp);
  const split = interpolate(frame, [22, 46], [0, 1], { ...clamp, easing: ease });
  const gap = GAP * split;
  const cw = (W - gap * (c.cols - 1)) / c.cols;
  const ch = (H - gap * (c.rows - 1)) / c.rows;

  return (
    <AbsoluteFill style={{ opacity: outP }}>
      {/* title + scene */}
      <div
        style={{
          position: "absolute",
          left: 108,
          top: 36,
          opacity: inP,
          translate: `${(1 - inP) * -40}px 0`,
          fontFamily: FONT_CN,
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              fontSize: 78,
              color: "#fff",
              letterSpacing: 2,
              textShadow: "0 6px 0 rgba(0,0,0,0.5)",
            }}
          >
            {c.title}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#fff",
              background: PINK,
              borderRadius: 14,
              padding: "4px 16px",
              rotate: "-3deg",
            }}
          >
            {c.cols} × {c.rows} 宫格
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 42,
            color: "#FFE14D",
            textShadow: "0 4px 0 rgba(0,0,0,0.5)",
          }}
        >
          {c.scene}
        </div>
      </div>

      {/* the sheet, then its parts */}
      <div
        style={{
          position: "absolute",
          left: 960 - W / 2,
          top: TOP + (BOX_H - H) / 2,
          width: W,
          height: H,
          opacity: inP,
          translate: `${(1 - inP) * 90}px 0`,
          scale: String(interpolate(inP, [0, 1], [0.96, 1])),
        }}
      >
        {Array.from({ length: n }).map((_, i) => {
          const r = Math.floor(i / c.cols);
          const k = i % c.cols;
          const rad = INNER * split;
          const tl = r === 0 && k === 0 ? OUTER : rad;
          const tr = r === 0 && k === c.cols - 1 ? OUTER : rad;
          const bl = r === c.rows - 1 && k === 0 ? OUTER : rad;
          const br = r === c.rows - 1 && k === c.cols - 1 ? OUTER : rad;
          const beat = 28 + (r + k) * 2;
          const bump = interpolate(frame, [beat, beat + 6, beat + 14], [0, 1, 0], {
            ...clamp,
            easing: pop,
          });
          const src = staticFile(
            `assets/cases2/${c.slug}/${String(i + 1).padStart(2, "0")}.${c.ext}`,
          );
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: k * (cw + gap),
                top: r * (ch + gap),
                width: cw,
                height: ch,
                overflow: "hidden",
                borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
                scale: String(1 + 0.05 * bump),
                zIndex: bump > 0.02 ? 2 : 1,
                boxShadow: `0 ${10 + 24 * split}px ${30 + 20 * split}px rgba(0,0,0,${0.35 * split})`,
                background: c.alpha ? "#fff" : "#222",
              }}
            >
              {c.alpha ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: CHECKER,
                    opacity: split,
                  }}
                />
              ) : null}
              <Img
                src={src}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* state chip: 原图 → 拆开后 */}
      <div
        style={{
          position: "absolute",
          left: 960 + BOX_W / 2 - 400,
          top: TOP + BOX_H + 18,
          width: 400,
          height: 64,
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 38,
          opacity: inP,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            color: "#fff",
            background: "rgba(255,255,255,0.16)",
            borderRadius: 18,
            padding: "6px 22px",
            opacity: 1 - split,
          }}
        >
          原图
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            color: INK,
            background: "#FFE14D",
            borderRadius: 18,
            padding: "6px 22px",
            opacity: split,
            scale: String(interpolate(split, [0, 1], [0.8, 1])),
            transformOrigin: "100% 50%",
            whiteSpace: "nowrap",
          }}
        >
          拆开后 · {n} 张独立图片{c.alpha ? " · 透明底" : ""}
        </div>
      </div>

      {/* progress dots */}
      <div
        style={{
          position: "absolute",
          left: 108,
          top: TOP + BOX_H + 34,
          display: "flex",
          gap: 12,
          opacity: inP,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 36 : 14,
              height: 14,
              borderRadius: 7,
              background: i === index ? PINK : "rgba(255,255,255,0.28)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Dark backdrop shared by all showcase beats. */
export const ShowcaseBackdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(240,52,155,0.22), rgba(240,52,155,0) 70%), #0A0A0C",
    }}
  />
);

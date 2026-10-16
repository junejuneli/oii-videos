import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND } from "../brand";
import {
  clamp,
  enterStyle,
  Highlight,
  HOGI,
  Scrim,
  type,
  useEnter,
  useHogiFonts,
  useSettle,
} from "./base";

const WORDMARK_RATIO = 143.238 / 48;

/** The marketing-kit wordmark as supplied: white on dark footage, black on light. */
export const HogiLogoChip: React.FC<{
  height?: number;
  tone?: "white" | "black";
}> = ({ height = 48, tone = "white" }) => (
  <Img
    src={tone === "white" ? BRAND.wordmarkWhite : BRAND.wordmarkBlack}
    style={{ height, width: height * WORDMARK_RATIO, display: "block" }}
  />
);

/** Poster release badge: wordmark | label (logo 48 → 2×36 divider at 20% → 46px/600, 24px gaps). */
export const HogiBadge: React.FC<{ label: string; logo?: number }> = ({
  label,
  logo = 48,
}) => {
  useHogiFonts();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: logo * 0.5 }}>
      <HogiLogoChip height={logo} />
      <div
        style={{
          width: 2,
          height: logo * 0.75,
          background: "rgba(255,255,255,0.2)",
        }}
      />
      <div
        style={{
          ...type(logo * 0.96, 600, 1.26),
          letterSpacing: "-0.02em",
          color: HOGI.white,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Line: React.FC<{
  delay: number;
  exit?: number;
  children: React.ReactNode;
}> = ({ delay, exit, children }) => (
  <div style={enterStyle(useEnter(delay, exit))}>{children}</div>
);

/** Closing titles: badge top-left, poster headline bottom-left (one line per `\n`), 12-frame fade out. */
export const HogiEndTitles: React.FC<{
  badge: string;
  title: string;
  highlight?: string;
}> = ({ badge, title, highlight }) => {
  useHogiFonts();
  const e = useEnter(0, 12);
  return (
    <AbsoluteFill>
      <Scrim edge="bottom" height={620} strength={0.62} opacity={e.opacity} />
      <Scrim edge="top" height={260} strength={0.4} opacity={e.opacity} />
      <div
        style={{ position: "absolute", left: 96, top: 72, ...enterStyle(e) }}
      >
        <HogiBadge label={badge} logo={56} />
      </div>
      <div style={{ position: "absolute", left: 96, bottom: 110 }}>
        {title.split("\n").map((line, i) => (
          <Line key={i} delay={6 + i * 6} exit={12}>
            <div style={{ ...type(128, 550, 1.1), color: HOGI.white }}>
              <Highlight text={line} highlight={highlight} />
            </div>
          </Line>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Step label top-left: pink index, step title settling pink → white, progress rail. */
export const HogiStepCaption: React.FC<{ steps: string[]; step: number }> = ({
  steps,
  step,
}) => {
  useHogiFonts();
  const a = useEnter(0);
  const b = useEnter(3);
  const c = useEnter(6);
  const color = useSettle(HOGI.pinkText, HOGI.white, 3);
  return (
    <AbsoluteFill>
      <Scrim edge="top" height={380} strength={0.55} opacity={a.opacity} />
      <div style={{ position: "absolute", left: 96, top: 72 }}>
        <div
          style={{ ...type(28, 600), color: HOGI.pinkText, ...enterStyle(a) }}
        >
          {pad2(step)} / {pad2(steps.length)}
        </div>
        <div
          style={{
            ...type(72, 600, 1.15),
            color,
            marginTop: 10,
            ...enterStyle(b),
          }}
        >
          {steps[step - 1]}
        </div>
        <div
          style={{ display: "flex", gap: 8, marginTop: 22, ...enterStyle(c) }}
        >
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: 56,
                height: 4,
                borderRadius: 2,
                background:
                  i < step - 1
                    ? "rgba(255,255,255,0.6)"
                    : i === step - 1
                      ? HOGI.pinkText
                      : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Label in frame pixels (1920×1080). `op` names an operation (studio toast, pink
 * highlight); `result` marks an outcome (brand green, like the primary button).
 */
export const HogiSticker: React.FC<{
  x: number;
  y: number;
  text: string;
  highlight?: string;
  tone?: "op" | "result";
  size?: number;
  delay?: number;
}> = ({ x, y, text, highlight, tone = "op", size = 40, delay = 0 }) => {
  useHogiFonts();
  const frame = useCurrentFrame();
  const e = useEnter(delay);
  if (frame < delay) return null;
  const op = tone === "op";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        ...enterStyle(e),
        ...type(size, 600),
        padding: `${Math.round(size * 0.42)}px ${Math.round(size * 0.66)}px`,
        borderRadius: Math.round(size * 0.4),
        color: op ? HOGI.white : HOGI.black,
        background: op ? HOGI.toast : HOGI.green,
        border: op ? "1.5px solid rgba(255,255,255,0.19)" : "none",
        backdropFilter: op ? "blur(12px)" : undefined,
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }}
    >
      {op ? <Highlight text={text} highlight={highlight} /> : text}
    </div>
  );
};

/** Hook line: a white kicker over a large pink poster headline, bottom-left. */
export const HogiMemeTitle: React.FC<{ kicker: string; title: string }> = ({
  kicker,
  title,
}) => {
  useHogiFonts();
  const e = useEnter(0);
  return (
    <AbsoluteFill>
      <Scrim edge="bottom" height={560} strength={0.6} opacity={e.opacity} />
      <div style={{ position: "absolute", left: 96, bottom: 100 }}>
        <Line delay={0}>
          <div style={{ ...type(64, 600, 1.25), color: HOGI.white }}>
            {kicker}
          </div>
        </Line>
        <Line delay={8}>
          <div
            style={{
              ...type(128, 550, 1.1),
              color: HOGI.pinkText,
              marginTop: 8,
            }}
          >
            {title}
          </div>
        </Line>
      </div>
    </AbsoluteFill>
  );
};

/** “xx 生成中” toast with a pink progress line for a fast-forwarded wait (speed not shown). */
export const HogiSpeedPill: React.FC<{ label: string }> = ({ label }) => {
  useHogiFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const e = useEnter(0);
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 72,
        translate: `-50% ${e.rise}px`,
        opacity: e.opacity,
        padding: "20px 30px 22px",
        borderRadius: 18,
        background: HOGI.toast,
        border: "1.5px solid rgba(255,255,255,0.19)",
        backdropFilter: "blur(12px)",
        minWidth: 420,
      }}
    >
      <div style={{ ...type(36, 600), color: HOGI.white }}>{label}</div>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.15)",
          marginTop: 16,
        }}
      >
        <div
          style={{
            width: `${p * 100}%`,
            height: 3,
            borderRadius: 2,
            background: HOGI.pinkText,
          }}
        />
      </div>
    </div>
  );
};

/** Centred top headline with a pink highlighted phrase. */
export const HogiTopHeadline: React.FC<{
  text: string;
  highlight?: string;
}> = ({ text, highlight }) => {
  useHogiFonts();
  const e = useEnter(0);
  return (
    <AbsoluteFill>
      <Scrim edge="top" height={340} strength={0.55} opacity={e.opacity} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 84,
          textAlign: "center",
          ...type(80, 550, 1.1),
          color: HOGI.white,
          ...enterStyle(e),
        }}
      >
        <Highlight text={text} highlight={highlight} />
      </div>
    </AbsoluteFill>
  );
};

/** Poster badge top-left naming the feature. */
export const HogiBrandMark: React.FC<{ label: string }> = ({ label }) => {
  const e = useEnter(0);
  return (
    <AbsoluteFill>
      <Scrim edge="top" height={240} strength={0.45} opacity={e.opacity} />
      <div
        style={{ position: "absolute", left: 96, top: 64, ...enterStyle(e) }}
      >
        <HogiBadge label={label} logo={48} />
      </div>
    </AbsoluteFill>
  );
};

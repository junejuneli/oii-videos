import React from "react";
import { useCurrentFrame } from "remotion";
import { HOGI } from "./base";

/** One line of already-typed text in the recording: top, height, text width and character count. */
export type TypeLine = { y: number; h: number; w: number; chars: number };

const PAUSE = /[，。、！？；：,.!?;:]/;

/**
 * Typing over text that is already in the recording (recording pixels). Each line is
 * covered with the panel colour and uncovered one character at a time with a caret at
 * the edge; key intervals vary and punctuation gets a breath, so it reads as someone
 * typing. The caret blinks before `from` and after the last character.
 * Characters are `w / chars` wide: exact for Chinese, approximate for mixed lines.
 * Pass `text` (one string per line) so pauses land on the punctuation.
 */
export const HogiTypeReveal: React.FC<{
  x: number;
  width: number;
  lines: TypeLine[];
  text?: string[];
  from: number;
  to: number;
  color: string;
  caret?: string;
}> = ({ x, width, lines, text, from, to, color, caret = HOGI.white }) => {
  const frame = useCurrentFrame();
  const total = lines.reduce((n, l) => n + l.chars, 0);
  const chars = (text ?? []).join("");
  // Deterministic per-key jitter (0.55–1.45) plus a pause after punctuation.
  const weights = Array.from({ length: total }, (_, i) => {
    const r = (((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1) + 1) % 1;
    return 0.55 + r * 0.9 + (PAUSE.test(chars[i] ?? "") ? 3 : 0);
  });
  const sum = weights.reduce((n, w) => n + w, 0);
  let acc = 0;
  const shown = weights.filter(
    (w) => frame >= from + ((acc += w) / sum) * (to - from),
  ).length;
  const caretOn =
    (frame >= from && shown < total) || Math.floor(frame / 15) % 2 === 0;

  let before = 0;
  let caretAt: { x: number; y: number; h: number } | undefined;
  const covers: React.ReactNode[] = [];
  lines.forEach((l, i) => {
    const cw = l.w / l.chars;
    const visible = Math.max(0, Math.min(l.chars, shown - before));
    covers.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x + visible * cw,
          top: l.y,
          width: width - visible * cw,
          height: l.h,
          background: color,
        }}
      />,
    );
    before += l.chars;
  });
  // The caret sits at the end of what is shown, on the line still being typed.
  before = 0;
  for (const [i, l] of lines.entries()) {
    if (shown - before < l.chars || i === lines.length - 1) {
      const visible = Math.max(0, Math.min(l.chars, shown - before));
      caretAt = {
        x: x + visible * (l.w / l.chars),
        y: l.y + l.h * 0.14,
        h: l.h * 0.72,
      };
      break;
    }
    before += l.chars;
  }
  return (
    <>
      {covers}
      {caretAt && caretOn ? (
        <div
          style={{
            position: "absolute",
            left: caretAt.x + 2,
            top: caretAt.y,
            width: 4,
            height: caretAt.h,
            borderRadius: 2,
            background: caret,
          }}
        />
      ) : null}
    </>
  );
};

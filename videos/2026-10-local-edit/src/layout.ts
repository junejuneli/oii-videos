import React from "react";
import { staticFile } from "remotion";

export type Rect = { x: number; y: number; w: number; h: number };

export type Layout = {
  portrait: boolean;
  W: number;
  H: number;
  /** Where the 4:3 picture stage sits inside the frame. */
  stage: Rect;
  /** Prompt (typewriter) box. */
  prompt: { x: number; y: number; w: number };
  /** Voice-over caption baseline (centre y). */
  capY: number;
  /** Headline / chip row y. */
  topY: number;
};

/** Where a 4:3 picture sits inside a stage (contain). */
export const fit43 = (st: Rect): Rect => {
  const w = Math.min(st.w, (st.h * 4) / 3);
  const h = (w * 3) / 4;
  return { x: (st.w - w) / 2, y: (st.h - h) / 2, w, h };
};

export const LANDSCAPE: Layout = {
  portrait: false,
  W: 1920,
  H: 1080,
  stage: { x: 0, y: 0, w: 1920, h: 1080 },
  prompt: { x: 260, y: 790, w: 1400 },
  capY: 1005,
  topY: 40,
};

export const PORTRAIT: Layout = {
  portrait: true,
  W: 1080,
  H: 1920,
  stage: { x: 0, y: 170, w: 1080, h: 810 },
  prompt: { x: 60, y: 1030, w: 960 },
  capY: 1330,
  topY: 70,
};

export const LayoutCtx = React.createContext<Layout>(LANDSCAPE);
export const useLayout = () => React.useContext(LayoutCtx);

const PNG = new Set(["A02", "A04", "E04", "E06", "E07", "E10"]);
/** Media by id (see public/media/manifest.json). */
export const m = (id: string): string => staticFile(`media/${id}.${PNG.has(id) ? "png" : "jpg"}`);

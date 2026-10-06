import { Easing } from "remotion";

export const FPS = 30;

export const PINK = "#F0349B";
export const PINK_SOFT = "rgba(240, 52, 155, 0.35)";
export const INK = "#0A0A0C";

// Rounded system fonts: SF Pro Rounded for Latin and digits, Yuanti SC (圆体) for Chinese.
export const FONT_CN =
  'ui-rounded, "SF Pro Rounded", "Yuanti SC", "PingFang SC", sans-serif';
export const FONT_DISPLAY =
  'ui-rounded, "SF Pro Rounded", "Yuanti SC", "PingFang SC", sans-serif';
export const FONT_MONO = 'ui-rounded, "SF Pro Rounded", "Yuanti SC", sans-serif';

export const GRADIENT = "linear-gradient(100deg, #FF5DB1 0%, #F0349B 45%, #B44DFF 100%)";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const sec = (s: number) => Math.round(s * FPS);

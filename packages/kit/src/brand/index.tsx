import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { INK } from "../theme";

// Files from the repo-level brand/ folder, synced into each video's
// public/brand/ by scripts/sync-brand.mjs before dev and render.
export const BRAND = {
  logo: staticFile("brand/logo/oiioii-logo.svg"),
  trailer: staticFile("brand/endcard/trailer.mp4"),
  click: staticFile("brand/sfx/click.wav"),
  watermarkFrame: (i: number) =>
    staticFile(`brand/watermark/frames/${String(i).padStart(3, "0")}.png`),
};

/** Frames in the OiiOii logo sting (brand/endcard/trailer.mp4). */
export const TRAILER_FRAMES = 63;

const WM_FRAMES = 190; // 6.33s at 30fps, from video-watermark-6_4s.apng

/**
 * OiiOii brand watermark, placed like the product's video export does for
 * 16:9: 7/60 of the frame width, 60% opacity, 20px from the bottom-right.
 */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Img
      src={BRAND.watermarkFrame((frame % WM_FRAMES) + 1)}
      style={{ position: "absolute", right: 20, bottom: 20, width: 224, height: 126, opacity: 0.6 }}
    />
  );
};

/** OiiOii logo sting (square source), centred on black with its own sound. */
export const Trailer: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
    <Video src={BRAND.trailer} style={{ width: 1080, height: 1080 }} />
  </AbsoluteFill>
);

/** The pink logo on a white, ink-outlined pill so it reads on any footage. */
export const LogoChip: React.FC<{ height?: number }> = ({ height = 34 }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 999,
      padding: `${Math.round(height * 0.3)}px ${Math.round(height * 0.65)}px`,
      border: `4px solid ${INK}`,
      boxShadow: `0 6px 0 ${INK}`,
      display: "flex",
    }}
  >
    <Img src={BRAND.logo} style={{ height }} />
  </div>
);

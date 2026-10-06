import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { Cursor, CursorKey } from "./pointer";

/**
 * Still crops of the recording laid over the live footage (recording pixel
 * space) until local frame `until`. Used to hide a step that was cut out
 * while the rest of the frame keeps playing.
 */
export const FreezePatch: React.FC<{
  until: number;
  pieces: { src: string; x: number; y: number; w: number; h: number }[];
}> = ({ until, pieces }) => {
  const frame = useCurrentFrame();
  if (frame >= until) return null;
  return (
    <>
      {pieces.map((p) => (
        <Img
          key={p.src}
          src={staticFile(p.src)}
          style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h }}
        />
      ))}
    </>
  );
};

/** Stand-in pointer for a patched stretch; disappears when the real one takes over. */
export const PatchCursor: React.FC<{ keys: CursorKey[]; until: number }> = ({ keys, until }) => {
  const frame = useCurrentFrame();
  if (frame >= until) return null;
  return <Cursor keys={keys} />;
};

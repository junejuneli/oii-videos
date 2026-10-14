import React from "react";
import { Sequence } from "remotion";
import { FONT_CN, INK } from "@oii/kit";
import { useLayout } from "./layout";

/** Headline flower text shown over the 0–8s preview montage. */
export const TitleFlowerLayer: React.FC = () => {
  const { topY, portrait } = useLayout();
  return (
    <Sequence from={0} durationInFrames={8 * 30} name="Title flower">
      <div style={{ position: "absolute", left: 0, right: 0, top: topY + (portrait ? 20 : 20), display: "flex", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: FONT_CN,
            fontWeight: 700,
            fontSize: portrait ? 66 : 76,
            letterSpacing: 4,
            color: "#fff",
            WebkitTextStroke: `14px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 8px 0 ${INK}`,
            whiteSpace: "nowrap",
          }}
        >
          AI 图，哪儿不对涂哪儿
        </div>
      </div>
    </Sequence>
  );
};

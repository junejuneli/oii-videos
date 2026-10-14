import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, FONT_CN, INK, PINK } from "@oii/kit";

export const WALL_LEN = 270;

type Tile = { src: string; video?: boolean; title: string; tag: string };

// 4 images + 6 videos (user's pick). Canvas results first, then two of the
// most-used video templates from the library (their own showcase videos).
const IMAGES: Tile[] = [
  { src: "assets/wall/img1.jpg", title: "角色身份参考图表", tag: "换成你的照片" },
  { src: "assets/wall/img2.jpg", title: "失败9连拍", tag: "热点" },
  { src: "assets/wall/img3.jpg", title: "港片慢门街头抓拍", tag: "Vlog" },
  { src: "assets/wall/img4.jpg", title: "赛博朋克忍者女刺客角色表", tag: "角色资产" },
];
const VIDEOS: Tile[] = [
  { src: "assets/wall/v1.mp4", video: true, title: "咖啡杯转场变装", tag: "AI 演员" },
  { src: "assets/wall/v2.mp4", video: true, title: "3D动漫第一人称互动", tag: "一键同款" },
  { src: "assets/wall/v3.mp4", video: true, title: "萌宠发布会", tag: "热点" },
  { src: "assets/wall/v4.mp4", video: true, title: "K-POP 字体动效片头", tag: "片头" },
  { src: "assets/wall/v5.mp4", video: true, title: "城市跑酷·生物装甲变身", tag: "角色表演" },
  { src: "assets/wall/v6.mp4", video: true, title: "乐事薯片包装变形动画", tag: "产品广告" },
];

const pop = Easing.bezier(0.34, 1.56, 0.64, 1);

const Card: React.FC<{ t: Tile; x: number; y: number; w: number; h: number; at: number }> = ({ t, x, y, w, h, at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: pop });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 24,
        overflow: "hidden",
        scale: String(0.8 + 0.2 * p),
        opacity: Math.min(1, p * 1.6),
        border: "4px solid rgba(255,255,255,0.9)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
        background: "#111",
      }}
    >
      {t.video ? (
        <Video src={staticFile(t.src)} muted loop style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Img src={staticFile(t.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "40px 14px 12px",
          background: "linear-gradient(0deg, rgba(0,0,0,0.82), rgba(0,0,0,0))",
          fontFamily: FONT_CN,
          fontWeight: 700,
          color: "#fff",
          fontSize: 26,
          lineHeight: 1.2,
        }}
      >
        {t.title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 10,
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 20,
          color: t.video ? "#fff" : INK,
          background: t.video ? PINK : "#FFE14D",
          borderRadius: 10,
          padding: "3px 10px",
        }}
      >
        {t.video ? "视频" : "图片"} · {t.tag}
      </div>
    </div>
  );
};

/** Case wall: four image results over six video results, popping in one by one.
 * It stays up under the closing titles, which blur it. */
export const CaseWall: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 12], [0, 1], clamp);
  const IW = 404;
  const IH = 250;
  const VW = 272;
  const VH = 440;
  const G = 22;
  const ix = 960 - (4 * IW + 3 * G) / 2;
  const vx = 960 - (6 * VW + 5 * G) / 2;
  return (
    <AbsoluteFill style={{ opacity: inP }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(240,52,155,0.22), rgba(240,52,155,0) 70%), #0A0A0C",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 46,
          textAlign: "center",
          fontFamily: FONT_CN,
          fontWeight: 700,
          fontSize: 72,
          letterSpacing: 4,
          color: "#fff",
          WebkitTextStroke: `12px ${INK}`,
          paintOrder: "stroke fill",
          textShadow: `0 8px 0 ${INK}`,
        }}
      >
        挑一个模板，<span style={{ color: "#FFE14D" }}>直接出片</span>
      </div>
      {IMAGES.map((t, i) => (
        <Card key={t.src} t={t} x={ix + i * (IW + G)} y={170} w={IW} h={IH} at={8 + i * 4} />
      ))}
      {VIDEOS.map((t, i) => (
        <Card key={t.src} t={t} x={vx + i * (VW + G)} y={170 + IH + 26} w={VW} h={VH} at={26 + i * 4} />
      ))}
    </AbsoluteFill>
  );
};

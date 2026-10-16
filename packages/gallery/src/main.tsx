// Mounts a Remotion Player into every [data-preview] slot. Grid players loop
// muted while on screen; the focused card gets controls and sound, matching
// the hogi studio's video gallery. The page script calls
// window.oiiPreview.setFocus(id | null) to switch between the two.
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { FPS } from "@oii/kit";
import { PREVIEWS } from "./previews";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Fallback = () => (
  <p className="video-error">预览暂时无法播放，请重新加载页面。</p>
);

const Live: React.FC<{ id: string; host: HTMLElement; focused: boolean }> = ({
  id,
  host,
  focused,
}) => {
  const def = PREVIEWS[id];
  const ref = useRef<PlayerRef>(null);
  useEffect(() => {
    if (reduced && !focused) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const p = ref.current;
        if (!p) return;
        if (e.isIntersecting) p.play();
        else p.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [host, focused]);
  return (
    <Player
      ref={ref}
      component={def.component}
      durationInFrames={def.duration}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={FPS}
      initialFrame={focused ? 0 : def.still}
      loop
      controls={focused}
      clickToPlay={focused}
      initiallyMuted={!focused}
      showVolumeControls={focused && !!def.audio}
      errorFallback={Fallback}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

const roots = new Map<string, { root: Root; host: HTMLElement }>();
const draw = (id: string, focused: boolean) => {
  const r = roots.get(id);
  if (r)
    r.root.render(
      <Live
        key={focused ? "focus" : "grid"}
        id={id}
        host={r.host}
        focused={focused}
      />,
    );
};

let current: string | null = null;
window.oiiPreview = {
  setFocus(id: string | null) {
    if (current) draw(current, false);
    current = id && roots.has(id) ? id : null;
    if (current) draw(current, true);
  },
};

document.querySelectorAll<HTMLElement>("[data-preview]").forEach((host) => {
  const id = host.dataset.preview!;
  if (!PREVIEWS[id]) return;
  host.classList.add("is-live");
  roots.set(id, { root: createRoot(host), host });
  draw(id, false);
});
window.dispatchEvent(new Event("oii-preview-ready"));

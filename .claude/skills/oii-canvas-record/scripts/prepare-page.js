// Run in the canvas tab before recording: hides automation chrome and side
// panels, and exposes the React Flow store as window.__rfStore so the camera
// can be placed exactly: __rfStore.getState().panZoom.setViewport({x, y, zoom}, {duration: 600})
(() => {
  document.getElementById("rec-style")?.remove();
  const s = document.createElement("style");
  s.id = "rec-style";
  s.textContent =
    '#claude-agent-glow-border,#claude-phantom-cursor{display:none!important} [class*="_new-canvas-mini-chat-host-container_"],[class*="_panel_zdair_"]{opacity:0!important;pointer-events:none!important}';
  document.head.appendChild(s);
  const el = document.querySelector(".react-flow__pane");
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
  let f = el[key];
  for (let i = 0; i < 80 && f; i++) {
    const v = f.memoizedProps?.value;
    if (v && typeof v.getState === "function" && v.getState().panZoom) {
      window.__rfStore = v;
      break;
    }
    f = f.return;
  }
  document.title = "REC-TAB " + document.title.replace(/^REC-TAB /, "");
  return {
    visible: document.visibilityState,
    viewport: [innerWidth, innerHeight],
    store: !!window.__rfStore,
  };
})();

// In-page demo pointer for screen recordings. Paste into the canvas tab
// (Claude-in-Chrome javascript tool) after prepare-page.js.
// The real OS cursor is not captured (ffmpeg -capture_cursor 0); this one
// draws a smooth eased path, a fading pink trail, press ripples, a marquee
// and a connection line, all in viewport CSS pixels.
//   await __demo.move(x, y, ms)    glide to a point
//   await __demo.press()           squash + ripple (does NOT click; click
//                                  the real element separately at the same spot)
//   await __demo.marquee(x, y, ms) rubber-band selection from current point
//   await __demo.drag(x, y, ms)    connection line from current point
//   __demo.hideMarquee(), __demo.hideLine()
//   __demo.rect(selector)          element box, for aiming
//   __demo.marks                   [name, Date.now(), x, y] log to line up
//                                  edit points with the recording later
(() => {
document.getElementById('demo-root')?.remove();
const root = document.createElement('div'); root.id='demo-root';
root.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483646';
root.innerHTML = `
<canvas id="demo-trail" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
<div id="demo-marq" style="position:absolute;display:none;border:2px solid #F0349B;background:rgba(240,52,155,0.10);border-radius:8px"></div>
<svg id="demo-line" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><path id="demo-path" d="" stroke="#F0349B" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle id="demo-dot" r="5" fill="#F0349B" cx="-50" cy="-50"/></svg>
<div id="demo-cursor" style="position:absolute;left:0;top:0;width:24px;height:32px;transform-origin:3px 2px;will-change:transform">
<svg width="24" height="32" viewBox="0 0 22 30" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))"><path d="M2 1.5 L2 23.5 L7.6 18.4 L11.3 27 L15 25.4 L11.4 17 L19 17 Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg></div>`;
document.body.appendChild(root);
const cv = root.querySelector('#demo-trail'); const dpr = devicePixelRatio; cv.width = innerWidth*dpr; cv.height = innerHeight*dpr; const ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
const cur = root.querySelector('#demo-cursor');
const D = window.__demo = { x: innerWidth+40, y: innerHeight*0.6, scale: 1, trail: [], marks: window.__marks || [] };
const place = () => { cur.style.transform = `translate(${D.x-3}px, ${D.y-2}px) scale(${D.scale})`; };
place();
const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const loop = () => { const now = performance.now(); D.trail = D.trail.filter(p => now - p.t < 450); ctx.clearRect(0,0,innerWidth,innerHeight); for (let i=1;i<D.trail.length;i++){ const a=D.trail[i-1], b=D.trail[i]; const age=(now-b.t)/450; ctx.strokeStyle=`rgba(240,52,155,${0.55*(1-age)})`; ctx.lineWidth=4*(1-age)+1; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } requestAnimationFrame(loop); };
requestAnimationFrame(loop);
const tween = (ms, fn) => new Promise(res => { const t0 = performance.now(); const step = () => { const p = Math.min(1, (performance.now()-t0)/ms); fn(ease(p), p); if (p<1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
D.mark = (n, x, y) => { D.marks.push([n, Date.now(), x, y]); window.__marks = D.marks; return n; };
D.move = async (x, y, ms=700, onStep) => { const x0=D.x, y0=D.y; D.mark('move:'+Math.round(x)+','+Math.round(y), x, y); await tween(ms, (e)=>{ D.x = x0+(x-x0)*e; D.y = y0+(y-y0)*e; D.trail.push({x:D.x,y:D.y,t:performance.now()}); place(); onStep && onStep(e); }); };
D.press = async () => { D.mark('press', D.x, D.y); const r = document.createElement('div'); r.style.cssText=`position:absolute;left:${D.x-14}px;top:${D.y-14}px;width:28px;height:28px;border-radius:50%;border:3px solid #F0349B;opacity:.95;transition:all .45s cubic-bezier(.16,1,.3,1)`; root.appendChild(r); requestAnimationFrame(()=>{ r.style.transform='scale(2.6)'; r.style.opacity='0'; }); setTimeout(()=>r.remove(), 600); await tween(110, e=>{ D.scale = 1-0.18*e; place(); }); await tween(160, e=>{ D.scale = 0.82+0.18*e; place(); }); };
D.marquee = async (x1, y1, ms=900) => { const m = root.querySelector('#demo-marq'); const x0=D.x, y0=D.y; m.style.display='block'; await D.move(x1, y1, ms, () => { m.style.left=Math.min(x0,D.x)+'px'; m.style.top=Math.min(y0,D.y)+'px'; m.style.width=Math.abs(D.x-x0)+'px'; m.style.height=Math.abs(D.y-y0)+'px'; }); };
D.hideMarquee = () => { root.querySelector('#demo-marq').style.display='none'; };
D.drag = async (x1, y1, ms=800) => { const p = root.querySelector('#demo-path'), dot = root.querySelector('#demo-dot'); const x0=D.x, y0=D.y; await D.move(x1, y1, ms, () => { const mx=(x0+D.x)/2; p.setAttribute('d', `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${D.y}, ${D.x} ${D.y}`); dot.setAttribute('cx', D.x); dot.setAttribute('cy', D.y); }); };
D.hideLine = () => { root.querySelector('#demo-path').setAttribute('d',''); const dot=root.querySelector('#demo-dot'); dot.setAttribute('cx',-50); dot.setAttribute('cy',-50); };
D.flash = async () => { const f=document.createElement('div'); f.style.cssText='position:absolute;left:0;top:0;width:140px;height:140px;background:#00ff00'; root.appendChild(f); D.mark('sync'); await new Promise(r=>setTimeout(r,350)); f.remove(); };
D.rect = sel => { const r=document.querySelector(sel).getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2}; };
return 'demo ready';
})()
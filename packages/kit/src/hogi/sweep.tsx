// The hogi-marketing-kit video sweep (skill/hogi-video-sweep) as a Remotion transition.
// The light band is the sweep editor's fragment shader, unchanged, drawn with
// mix-blend-mode: screen (the shader's own `1 - (1 - color) * (1 - tone * alpha)`).
// The reveal mask follows sweep.py's composite() per pixel, bend included.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";

/** skill/hogi-video-sweep/assets/sweep-defaults.json; mirrored as --oii-sweep-* in docs/hogi-design-system/tokens.css */
export const SWEEP_DEFAULTS = {
  count: 2,
  /** Seconds per pass. */
  duration: 1.2,
  /** Minimum seconds before the first pass and after the last. */
  hold: 2.2,
  direction: "right" as "right" | "left" | "down" | "up" | "alternate",
  angle: 24,
  width: 0.22,
  softness: 0.72,
  feather: 0.168,
  intensity: 0.64,
  glow: 0.6,
  colorA: "#FF6CC2",
  colorB: "#D2FF5E",
  easing: "smooth" as "smooth" | "linear",
  shape: "ripple" as "straight" | "arc" | "wave" | "ripple",
  curvature: 0.01,
  waves: 3,
};
export type SweepSettings = typeof SWEEP_DEFAULTS;

type Dir = readonly [number, number];

const sweepVector = (s: SweepSettings, pass: number): Dir => {
  let d: string = s.direction;
  if (d === "alternate") d = pass % 2 ? "left" : "right";
  const angle = (s.angle * Math.PI) / 180;
  let x = Math.cos(angle);
  let y = Math.sin(angle);
  if (d === "down" || d === "up") [x, y] = [y, x];
  if (d === "left" || d === "up") [x, y] = [-x, -y];
  return [x, y];
};

/** Pass start times in seconds, spaced over `total` seconds as the sweep editor does. */
export const sweepStarts = (s: SweepSettings, total: number) =>
  s.count === 1
    ? [(total - s.duration) / 2]
    : Array.from(
        { length: s.count },
        (_, i) =>
          s.hold + (i * (total - 2 * s.hold - s.duration)) / (s.count - 1),
      );

const sweepState = (s: SweepSettings, total: number, t: number) => {
  const starts = sweepStarts(s, total);
  for (let i = 0; i < starts.length; i++) {
    if (t < starts[i]) return { source: i % 2, progress: -1, pass: i };
    if (t < starts[i] + s.duration) {
      let p = (t - starts[i]) / s.duration;
      if (s.easing === "smooth") p = p * p * (3 - 2 * p);
      return { source: i % 2, progress: p, pass: i };
    }
  }
  return { source: s.count % 2, progress: -1, pass: s.count };
};

const VERT =
  "attribute vec2 position;varying vec2 uv;void main(){uv=vec2((position.x+1.0)*0.5,(1.0-position.y)*0.5);gl_Position=vec4(position,0.0,1.0);}";
const FRAG = `precision highp float;varying vec2 uv;uniform vec2 dir;
uniform float style,progress,bandWidth,softness,feather,intensity,glow,shape,curvature,waves;uniform vec3 colorA,colorB;
void main(){if(progress<0.){gl_FragColor=vec4(0.,0.,0.,1.);return;}
float q=dot(uv-.5,dir)/(abs(dir.x)+abs(dir.y))+.5;float r=dot(uv-.5,vec2(-dir.y,dir.x))/(abs(dir.x)+abs(dir.y))*2.;
float amount=shape<.5?0.:curvature;float frequency=shape>2.5?waves:1.;float bend=amount*(shape>1.5?sin(3.141592653589793*r*frequency):1.-r*r);
float pad=max(bandWidth,feather)*1.6+abs(amount);float edge=-pad+(1.+2.*pad)*progress;float delta=q-edge-bend;
float distance=abs(delta)/(bandWidth*.5);float band=1.-smoothstep(1.-softness,1.,distance);float halo=exp(-pow(delta/(bandWidth*.55),2.)*2.)*glow*.45;
if(style>.5&&style<1.5)band=band*.38+exp(-pow(delta/(bandWidth*.055),2.))*.75;
float alpha=clamp((band+halo)*intensity,0.,1.);vec3 tone=mix(colorA,colorB,smoothstep(0.,1.,delta/bandWidth+.5));if(style>1.5)tone=vec3(1.);
gl_FragColor=vec4(tone*alpha,1.);}`;

const SHAPES = ["straight", "arc", "wave", "ripple"];
const hex3 = (h: string) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const SweepLight: React.FC<{
  s: SweepSettings & { style: number };
  progress: number;
  dir: Dir;
}> = ({ s, progress, dir }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const gl = useRef<{ ctx: WebGLRenderingContext; prog: WebGLProgram } | null>(
    null,
  );
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!gl.current) {
      const ctx = canvas.getContext("webgl", {
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });
      const prog = ctx?.createProgram();
      if (!ctx || !prog) return;
      for (const [kind, src] of [
        [ctx.VERTEX_SHADER, VERT],
        [ctx.FRAGMENT_SHADER, FRAG],
      ] as const) {
        const shader = ctx.createShader(kind);
        if (!shader) return;
        ctx.shaderSource(shader, src);
        ctx.compileShader(shader);
        ctx.attachShader(prog, shader);
      }
      ctx.linkProgram(prog);
      ctx.useProgram(prog);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
      ctx.bufferData(
        ctx.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        ctx.STATIC_DRAW,
      );
      const loc = ctx.getAttribLocation(prog, "position");
      ctx.enableVertexAttribArray(loc);
      ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
      gl.current = { ctx, prog };
    }
    const { ctx, prog } = gl.current;
    const u = (k: string) => ctx.getUniformLocation(prog, k);
    ctx.viewport(0, 0, canvas.width, canvas.height);
    ctx.uniform2f(u("dir"), dir[0], dir[1]);
    const values: Record<string, number> = {
      progress,
      bandWidth: s.width,
      softness: s.softness,
      feather: s.feather,
      intensity: s.intensity,
      glow: s.glow,
      style: s.style,
      shape: SHAPES.indexOf(s.shape),
      curvature: s.curvature,
      waves: s.waves,
    };
    for (const [k, v] of Object.entries(values)) ctx.uniform1f(u(k), v);
    ctx.uniform3fv(u("colorA"), hex3(s.colorA));
    ctx.uniform3fv(u("colorB"), hex3(s.colorB));
    ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
  });
  return (
    <canvas
      ref={ref}
      width={960}
      height={540}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// The feather is 17% of the frame wide, so a 480×270 mask upscales without visible error.
const MASK_W = 480;
const MASK_H = 270;
let maskCanvas: HTMLCanvasElement | null = null;

/** mask = 1 − smoothstep((delta + f/2) / f) for the incoming scene, as in sweep.py. */
const revealMask = (
  s: SweepSettings,
  progress: number,
  dir: Dir,
): React.CSSProperties => {
  maskCanvas ??= Object.assign(document.createElement("canvas"), {
    width: MASK_W,
    height: MASK_H,
  });
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return {};
  const img = ctx.createImageData(MASK_W, MASK_H);
  const [dx, dy] = dir;
  const S = Math.abs(dx) + Math.abs(dy);
  const amount = s.shape === "straight" ? 0 : s.curvature;
  const frequency = s.shape === "ripple" ? s.waves : 1;
  const pad = Math.max(s.width, s.feather) * 1.6 + Math.abs(amount);
  const edge = -pad + (1 + 2 * pad) * progress;
  for (let j = 0; j < MASK_H; j++) {
    const y = (j + 0.5) / MASK_H - 0.5;
    for (let i = 0; i < MASK_W; i++) {
      const x = (i + 0.5) / MASK_W - 0.5;
      const q = (x * dx + y * dy) / S + 0.5;
      const r = ((x * -dy + y * dx) / S) * 2;
      const bend =
        amount *
        (s.shape === "wave" || s.shape === "ripple"
          ? Math.sin(Math.PI * r * frequency)
          : 1 - r * r);
      const v = Math.min(
        1,
        Math.max(0, (q - edge - bend + s.feather / 2) / s.feather),
      );
      const k = (j * MASK_W + i) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255;
      img.data[k + 3] = Math.round((1 - v * v * (3 - 2 * v)) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = `url(${maskCanvas.toDataURL()})`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
};

/**
 * A light band crosses the frame and reveals the other scene behind it. Passes
 * alternate A → B → A …, spaced over the sequence as the sweep editor spaces them
 * (`hold` seconds before the first and after the last). Odd counts end on B.
 * `style`: gradient (default), neon or white, as in the editor's presets.
 */
export const SweepTransition: React.FC<{
  a: React.ReactNode;
  b: React.ReactNode;
  settings?: Partial<SweepSettings> & { style?: "gradient" | "neon" | "white" };
  /** The sweep skill keeps the Oii wordmark top-right above the sweep: 12.5% wide, 2.5% inset. */
  logo?: boolean;
}> = ({ a, b, settings, logo = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const { style = "gradient", ...rest } = settings ?? {};
  const s = { ...SWEEP_DEFAULTS, ...rest };
  const st = sweepState(s, durationInFrames / fps, frame / fps);
  const dir = sweepVector(s, st.pass);
  const [current, next] = st.source === 0 ? [a, b] : [b, a];
  const passing = st.progress >= 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{current}</AbsoluteFill>
      {passing ? (
        <AbsoluteFill style={revealMask(s, st.progress, dir)}>
          {next}
        </AbsoluteFill>
      ) : null}
      {passing ? (
        <SweepLight
          s={{ ...s, style: ["gradient", "neon", "white"].indexOf(style) }}
          progress={st.progress}
          dir={dir}
        />
      ) : null}
      {logo ? (
        <Img
          src={BRAND.sweepLogo}
          style={{
            position: "absolute",
            right: "2.5%",
            top: `${(2.5 * width) / height}%`,
            width: "12.5%",
            height: "auto",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

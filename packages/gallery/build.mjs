// Builds the component gallery into dist/: bundles src/main.tsx, copies index.html
// and the repo's brand/ folder (BRAND.* resolves there), plus the optional sweep
// demo clips from media/. `--serve` then serves dist/ on http://localhost:4173.
import { build } from "esbuild";
import { cpSync, createReadStream, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const here = import.meta.dirname;
const root = resolve(here, "../..");
const dist = join(here, "dist");
const clips = ["sweep-a.mp4", "sweep-b.mp4"].every((f) => existsSync(join(here, "media", f)));

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
await build({
  entryPoints: [join(here, "src/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  outfile: join(dist, "app.js"),
  define: { "process.env.NODE_ENV": '"production"', __SWEEP_CLIPS__: String(clips) },
  legalComments: "none",
  logLevel: "warning",
});
cpSync(join(here, "index.html"), join(dist, "index.html"));
cpSync(join(root, "brand"), join(dist, "brand"), { recursive: true, filter: (src) => !src.endsWith("README.md") });
if (clips) cpSync(join(here, "media"), join(dist, "media"), { recursive: true });
console.log(`gallery: built dist/ (sweep demo clips: ${clips ? "yes" : "no, using canvas views"})`);

if (process.argv.includes("--serve")) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".mp4": "video/mp4",
    ".woff2": "font/woff2",
    ".wav": "audio/wav",
  };
  createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(dist, path || "index.html");
    if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    const size = statSync(file).size;
    const headers = { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Accept-Ranges": "bytes" };
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? "");
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Number(range[2]) : size - 1;
      res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
      createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { ...headers, "Content-Length": size });
      createReadStream(file).pipe(res);
    }
  }).listen(4173, () => console.log("gallery: http://localhost:4173"));
}

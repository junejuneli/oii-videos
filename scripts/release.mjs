// Renders a composition and produces the two deliverables in out/:
//   <name>-<version>.mp4        master: h264 crf 18, loudness -16 LUFS
//   <name>-<version>-share.mp4  share: crf 23, faststart, for chat/upload
// Usage (from a video directory): node ../../scripts/release.mjs <CompositionId> <version>
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, statSync } from "node:fs";

const [comp, version] = process.argv.slice(2);
if (!comp || !version) {
  console.error("usage: pnpm release <version>   (e.g. pnpm release v10)");
  process.exit(1);
}
const name = JSON.parse(readFileSync("package.json", "utf8")).name;
const raw = "out/.raw.mp4";
const master = `out/${name}-${version}.mp4`;
const share = `out/${name}-${version}-share.mp4`;
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });

run("npx", ["remotion", "render", comp, raw, "--codec=h264", "--crf=18", "--log=error"]);
run("ffmpeg", ["-v", "error", "-y", "-i", raw, "-c:v", "copy",
  "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", master]);
run("ffmpeg", ["-v", "error", "-y", "-i", master, "-c:v", "libx264", "-crf", "23", "-preset", "slow",
  "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", share]);
rmSync(raw);

const mb = (f) => (statSync(f).size / 1e6).toFixed(1) + "MB";
console.log(`\n${master}  ${mb(master)}\n${share}  ${mb(share)}`);

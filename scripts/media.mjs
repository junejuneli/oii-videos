// Heavy media (recordings, source clips, renders' inputs) is never pushed.
// Each video keeps a media.lock.json listing what should be on disk, so a
// missing or replaced file is noticed instead of silently breaking a render.
//
//   node scripts/media.mjs lock [video-dir]   record the current files
//   node scripts/media.mjs check              verify every video, and flag
//                                             any tracked file over 20MB
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const videosDir = join(root, "videos");
const [cmd, only] = process.argv.slice(2);

const sha256 = (file) =>
  new Promise((ok, fail) => {
    const h = createHash("sha256");
    createReadStream(file).on("data", (d) => h.update(d)).on("end", () => ok(h.digest("hex"))).on("error", fail);
  });

// Files git ignores under a video's public/ (minus the synced brand copy).
const ignoredMedia = (dir) =>
  execFileSync("git", ["ls-files", "-z", "--others", "--ignored", "--exclude-standard", "public"], { cwd: dir, encoding: "utf8" })
    .split("\0")
    .filter((f) => f && !f.startsWith("public/brand/") && !f.endsWith(".DS_Store"));

const videos = () =>
  readdirSync(videosDir)
    .map((d) => join(videosDir, d))
    .filter((d) => existsSync(join(d, "package.json")));

if (cmd === "lock") {
  const targets = only ? [resolve(only)] : videos();
  for (const dir of targets) {
    const files = {};
    for (const f of ignoredMedia(dir).sort()) {
      files[f] = { bytes: statSync(join(dir, f)).size, sha256: await sha256(join(dir, f)) };
    }
    writeFileSync(join(dir, "media.lock.json"), JSON.stringify({ files }, null, 2) + "\n");
    console.log(`${relative(root, dir)}: ${Object.keys(files).length} files locked`);
  }
} else if (cmd === "check") {
  let bad = 0;
  for (const dir of videos()) {
    const lockFile = join(dir, "media.lock.json");
    if (!existsSync(lockFile)) {
      console.log(`? ${relative(root, dir)}: no media.lock.json (run pnpm media:lock)`);
      continue;
    }
    const { files } = JSON.parse(readFileSync(lockFile, "utf8"));
    for (const [f, want] of Object.entries(files)) {
      const p = join(dir, f);
      if (!existsSync(p)) {
        console.log(`✗ missing  ${relative(root, p)}`);
        bad++;
      } else if (statSync(p).size !== want.bytes || (await sha256(p)) !== want.sha256) {
        console.log(`✗ changed  ${relative(root, p)}`);
        bad++;
      }
    }
    const unlocked = ignoredMedia(dir).filter((f) => !files[f]);
    for (const f of unlocked) console.log(`+ unlocked ${relative(root, join(dir, f))}`);
  }
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
  for (const f of tracked) {
    const p = join(root, f);
    if (existsSync(p) && statSync(p).size > 20e6) {
      console.log(`✗ too big to push: ${f} (${(statSync(p).size / 1e6).toFixed(0)}MB)`);
      bad++;
    }
  }
  console.log(bad ? `\n${bad} problem(s)` : "media ok");
  process.exit(bad ? 1 : 0);
} else {
  console.error("usage: node scripts/media.mjs lock [video-dir] | check");
  process.exit(1);
}

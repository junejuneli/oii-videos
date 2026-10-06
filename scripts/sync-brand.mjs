// Copies the repo-level brand/ folder into the current video's public/brand/
// so staticFile("brand/...") works in Studio and in renders. Run from a
// video directory (the package scripts do this as predev / prerender).
import { cpSync, existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const target = join(process.cwd(), "public", "brand");
if (!existsSync(join(process.cwd(), "src"))) {
  console.error("sync-brand: run this from a video directory");
  process.exit(1);
}
rmSync(target, { recursive: true, force: true });
cpSync(join(root, "brand"), target, {
  recursive: true,
  filter: (src) => !src.endsWith("README.md"),
});

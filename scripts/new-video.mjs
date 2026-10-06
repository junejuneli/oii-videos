// Creates videos/<YYYY-MM>-<slug>/ from templates/video.
// Usage: pnpm new <slug> ["一句话标题"]
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [slug, title = slug] = process.argv.slice(2);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('usage: pnpm new <slug-in-kebab-case> ["标题"]');
  process.exit(1);
}
const root = resolve(import.meta.dirname, "..");
const month = new Date().toISOString().slice(0, 7);
const dir = join(root, "videos", `${month}-${slug}`);
if (existsSync(dir)) {
  console.error(`${dir} already exists`);
  process.exit(1);
}
const comp = slug.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
cpSync(join(root, "templates", "video"), dir, { recursive: true });

const fill = (p) => {
  for (const name of readdirSync(p)) {
    const f = join(p, name);
    if (statSync(f).isDirectory()) fill(f);
    else if (/\.(json|md|ts|tsx)$/.test(name))
      writeFileSync(
        f,
        readFileSync(f, "utf8")
          .replaceAll("__SLUG__", slug)
          .replaceAll("__COMP__", comp)
          .replaceAll("__TITLE__", title)
          .replaceAll("__DATE__", new Date().toISOString().slice(0, 10)),
      );
  }
};
fill(dir);
console.log(`created videos/${month}-${slug}\nnext: pnpm install && pnpm --filter ${slug} dev`);

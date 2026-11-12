// Copies only the public site into dist/ for Cloudflare Pages.
// Personal study files (NOTES.md, MISSION.md, learning-records/) stay in the
// repo but are not published. Run: node scripts/build.mjs
import { cpSync, rmSync, mkdirSync } from "node:fs";

const PUBLIC = ["index.html", "_headers", "RESOURCES.md", "lessons", "reference", "assets", "code"];
const SKIP = ["assets/originals"];

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const path of PUBLIC) {
  cpSync(path, `dist/${path}`, {
    recursive: true,
    filter: (src) => !SKIP.some((s) => src.replaceAll("\\", "/").startsWith(s)),
  });
}
console.log("Built dist/:", PUBLIC.join(", "));

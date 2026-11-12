// node run.ts            lint the sample repo in ./repo with your rule
// node run.ts solution   same, using ./solution/lint.ts
//
// The output is written for an agent: one line per finding, the word ERROR and
// the reason on the same line, a one-line total, nothing else.

import { readdirSync, readFileSync } from "node:fs";
import type { Finding, SourceFile } from "./types.ts";

const target = process.argv[2] === "solution" ? "./solution/lint.ts" : "./lint.ts";
const { lint } = (await import(target)) as { lint: (files: SourceFile[]) => Finding[] };

const root = new URL("./repo/", import.meta.url);
const files: SourceFile[] = (readdirSync(new URL("src/", root), { recursive: true }) as string[])
  .map((name) => `src/${name.replaceAll("\\", "/")}`)
  .filter((path) => path.endsWith(".ts"))
  .sort()
  .map((path) => ({ path, source: readFileSync(new URL(path, root), "utf8") }));

const findings = lint(files);
for (const found of findings) console.log(`ERROR ${found.file}:${found.line} ${found.message}`);
console.log(`${findings.length} ${findings.length === 1 ? "error" : "errors"} in ${files.length} files.`);
process.exitCode = findings.length ? 1 : 0;

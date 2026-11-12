// node check.ts            grades ./lint.ts
// node check.ts solution   grades ./solution/lint.ts

import process from "node:process";
import type { Finding, SourceFile } from "./types.ts";

const target = process.argv[2] === "solution" ? "./solution/lint.ts" : "./lint.ts";
const { explain, lint } = (await import(target)) as {
  explain: (from: string, to: string, importedPath: string) => string;
  lint: (files: SourceFile[]) => Finding[];
};

let failed = 0;

function check(name: string, body: () => string | void) {
  try {
    const problem = body();
    if (problem) throw new Error(problem);
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${(error as Error).message}`);
  }
}

const file = (path: string, ...lines: string[]): SourceFile => ({ path, source: lines.join("\n") });

const types = file("src/types/invoice.ts", "export type Invoice = { id: string };");
const repo = file("src/repo/invoices.ts", 'import type { Invoice } from "../types/invoice.ts";', "export const all: Invoice[] = [];");
const service = file(
  "src/service/refunds.ts",
  'import Stripe from "stripe";',
  'import { all } from "../repo/invoices.ts";',
  'import { months } from "./dates.ts";',
  "export const prorate = () => all.length + months;",
);
const dates = file("src/service/dates.ts", "export const months = 6;");
const route = file("src/http/refund-route.ts", 'import { prorate } from "../service/refunds.ts";', "prorate();");
const script = file("scripts/seed.ts", 'import { prorate } from "../src/service/refunds.ts";', "prorate();");

const driftedRepo = file(
  "src/repo/invoices.ts",
  'import type { Invoice } from "../types/invoice.ts";',
  "",
  'import { prorate } from "../service/refunds.ts";',
  "export const all: Invoice[] = [];",
);
const driftedTypes = file(
  "src/types/invoice.ts",
  'import { all } from "../repo/invoices.ts";',
  'import { session } from "../http/session.ts";',
  "export type Invoice = { id: string };",
);

console.log(`\nGrading ${target}\n`);

check("1 · a clean repo gets no findings", () => {
  const findings = lint([types, repo, service, dates, route, script]);
  if (!Array.isArray(findings)) return "lint must return an array";
  if (findings.length) {
    const first = findings[0];
    return `flagged ${first.file}:${first.line}, which is allowed. Leftward, same-layer, package and out-of-layer imports are all fine.`;
  }
});

check("2 · a backward import is found, with its file and line", () => {
  const findings = lint([types, driftedRepo, service, dates, route]);
  if (findings.length !== 1) return `expected 1 finding, got ${findings.length}. src/repo/invoices.ts line 3 imports from service.`;
  const [found] = findings;
  if (found.file !== "src/repo/invoices.ts") return `finding.file was "${found.file}"; it should be the file that holds the import`;
  if (found.line !== 3) return `finding.line was ${found.line}; the import is on line 3`;
});

check("3 · every backward import is reported, not only the first", () => {
  const findings = lint([driftedTypes, driftedRepo, service, dates, route]);
  if (findings.length !== 3) return `expected 3 findings (two in types, one in repo), got ${findings.length}`;
  const lines = findings.filter((f) => f.file === "src/types/invoice.ts").map((f) => f.line).sort();
  if (lines.join() !== "1,2") return `the two findings in src/types/invoice.ts should be on lines 1 and 2, got ${lines.join() || "none"}`;
});

check("4 · the message tells the agent what to do and where to read", () => {
  const message = explain("repo", "service", "src/service/refunds.ts");
  if (typeof message !== "string" || !message) return "explain() returned no message";
  if (!/\brepo\b/.test(message) || !/\bservice\b/.test(message)) return `the message does not name both layers (repo, service): "${message}"`;
  if (!message.includes("docs/architecture.md")) return "the message does not point to docs/architecture.md, so the agent has nowhere to read the rule";
  const other = explain("types", "http", "src/http/session.ts");
  if (!/\btypes\b/.test(other) || !/\bhttp\b/.test(other)) return "explain() ignores its arguments: types -> http gave a message without those layer names";
  const [found] = lint([types, driftedRepo, service, dates, route]);
  if (found.message !== message) return "lint() does not use explain() for its message";
});

check("5 · the message fits in an agent's context", () => {
  const message = explain("repo", "service", "src/service/refunds.ts");
  if (message.includes("\n")) return "the message spans several lines; keep the reason on one line so a search finds it whole";
  if (message.length > 300) return `the message is ${message.length} characters; 300 at most`;
  if (message.length < 60) return `"${message}" is too short to carry a fix; say what to do instead`;
});

console.log(failed === 0 ? "\nAll five pass. Now run:  node run.ts\n" : `\n${failed} failing. Fix lint.ts and run this again.\n`);
process.exitCode = failed === 0 ? 0 : 1;

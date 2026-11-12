// Reference answer. Write your own first.

import { LAYERS, importsOf, layerOf } from "../helpers.ts";
import type { Finding, SourceFile } from "../types.ts";

export function explain(from: string, to: string, importedPath: string): string {
  return (
    `${from} may not import from ${to} (${importedPath}). ` +
    `Layers only look left: ${LAYERS.join(" -> ")}. ` +
    `Either move this logic up into src/${to}/, or have ${to} pass the value in as an argument. ` +
    `See docs/architecture.md.`
  );
}

export function lint(files: SourceFile[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const from = layerOf(file.path);
    if (from === null) continue;
    for (const found of importsOf(file)) {
      const to = layerOf(found.path);
      if (to === null) continue;
      if (LAYERS.indexOf(to) > LAYERS.indexOf(from)) {
        findings.push({ file: file.path, line: found.line, message: explain(from, to, found.path) });
      }
    }
  }
  return findings;
}

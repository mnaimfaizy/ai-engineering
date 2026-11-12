// Given to you. Read it; you do not need to change it.

import { posix } from "node:path";
import type { Import, SourceFile } from "./types.ts";

// The order is the rule. A file may import from its own layer or from a layer
// to its LEFT. It may never import from a layer to its right.
export const LAYERS = ["types", "repo", "service", "http"];

// "src/service/refunds.ts" -> "service".  Anything outside src/<layer>/ -> null.
export function layerOf(path: string): string | null {
  const match = /^src\/([^/]+)\//.exec(path);
  return match && LAYERS.includes(match[1]) ? match[1] : null;
}

// Every relative import in the file, with its line number (first line is 1).
// Package imports such as "stripe" are skipped: they are not part of the layering.
export function importsOf(file: SourceFile): Import[] {
  const found: Import[] = [];
  file.source.split("\n").forEach((text, index) => {
    const match = /^\s*import\b[^"']*["'](\.{1,2}\/[^"']+)["']/.exec(text);
    if (match) found.push({ line: index + 1, path: posix.join(posix.dirname(file.path), match[1]) });
  });
  return found;
}

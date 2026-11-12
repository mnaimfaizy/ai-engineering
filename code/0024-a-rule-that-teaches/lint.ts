// YOUR FILE. Write the two TODOs, then run:  node check.ts
//
// You are turning one sentence of repo/docs/architecture.md into a check that runs
// on every file, every time, and tells the agent how to fix what it finds.

import { LAYERS, importsOf, layerOf } from "./helpers.ts";
import type { Finding, SourceFile } from "./types.ts";

// TODO 1 · TEACH
// The message an agent reads when the rule fires. It lands in the agent's context,
// so write it as an instruction, not as an error code. It must:
//   - name both layers (`from` is the file's layer, `to` is the layer it imported)
//   - say what to do instead
//   - point to docs/architecture.md
//   - fit on one line, 300 characters at most
export function explain(from: string, to: string, importedPath: string): string {
  throw new Error("lint.ts: TODO 1 (explain) is not written yet");
}

// TODO 2 · FIND
// Return one finding for every import that points to a layer on the RIGHT of the
// file's own layer in LAYERS. Same-layer and leftward imports are fine.
// Skip files and imports that are in no layer (layerOf returns null).
// Each finding is { file, line, message }, with the message from explain().
export function lint(files: SourceFile[]): Finding[] {
  throw new Error("lint.ts: TODO 2 (lint) is not written yet");
}

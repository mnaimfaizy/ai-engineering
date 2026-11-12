export type SourceFile = { path: string; source: string };

// One relative import found in a file. `path` is already resolved from the repo root.
export type Import = { line: number; path: string };

export type Finding = { file: string; line: number; message: string };

// YOUR FILE. Write the three TODOs, then run:  node check.ts
//
// You are building the thing that replaces a human reading the diff.
// It never opens a build's source. It only watches what the build does to the world.

import type { Build, Refund, Scenario, Twin } from "./types.ts";

// TODO 1 · TWIN
// A stand-in for Stripe. refunds.create must:
//   - record { id, invoice, amount } in `ledger`
//   - return { id }, where the id starts with "re_" and is different for every refund
// No network. No money moves.
export function createStripeTwin(): Twin {
  throw new Error("harness.ts: TODO 1 (twin) is not written yet");
}

// TODO 2 · JUDGE
// Decide pass or fail from the ledger alone.
//   scenario.expect === null   -> pass only if no refund was made
//   scenario.expect is a refund -> pass only if exactly one refund was made,
//                                  for that invoice and that amount
// `reply` is what the build told the customer. Decide what it is worth as evidence.
export function judge(scenario: Scenario, reply: string, ledger: Refund[]): boolean {
  throw new Error("harness.ts: TODO 2 (judge) is not written yet");
}

// TODO 3 · SCORE
// Run every scenario against the build and return the fraction that pass, from 0 to 1.
// Each scenario is a separate world.
export async function score(build: Build, scenarios: Scenario[]): Promise<number> {
  throw new Error("harness.ts: TODO 3 (score) is not written yet");
}

// node board.ts            the scenario board, using your harness
// node board.ts solution   same, using ./solution/harness.ts

import { build as honest } from "./builds/honest.ts";
import { build as overfit } from "./builds/overfit.ts";
import { build as talker } from "./builds/talker.ts";
import { scenarios } from "./holdout/scenarios.ts";

const target = process.argv[2] === "solution" ? "./solution/harness.ts" : "./harness.ts";
const { createStripeTwin, judge, score } = await import(target);

const builds = { honest, talker, overfit };

console.log("\nSCENARIO BOARD (holdout, judged on the twin's ledger)\n");
console.log(`  ${"scenario".padEnd(28)} ${Object.keys(builds).map((n) => n.padEnd(8)).join(" ")}`);
for (const scenario of scenarios) {
  const cells: string[] = [];
  for (const build of Object.values(builds)) {
    const twin = createStripeTwin();
    const reply = await build(scenario.request, twin);
    cells.push((judge(scenario, reply, twin.ledger) ? "pass" : "FAIL").padEnd(8));
  }
  console.log(`  ${scenario.name.padEnd(28)} ${cells.join(" ")}`);
}

const scores: string[] = [];
for (const build of Object.values(builds)) {
  scores.push(`${Math.round((await score(build, scenarios)) * scenarios.length)} of ${scenarios.length}`.padEnd(8));
}
console.log(`\n  ${"SCORE".padEnd(28)} ${scores.join(" ")}\n`);

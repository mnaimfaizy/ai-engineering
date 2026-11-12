// node check.ts            grades ./harness.ts
// node check.ts solution   grades ./solution/harness.ts
//
// This grades YOUR CHECK. A check is good when it tells three builds apart.

import { build as honest } from "./builds/honest.ts";
import { build as overfit } from "./builds/overfit.ts";
import { build as talker } from "./builds/talker.ts";
import { scenarios } from "./holdout/scenarios.ts";

const target = process.argv[2] === "solution" ? "./solution/harness.ts" : "./harness.ts";
const { createStripeTwin, judge, score } = await import(target);

let failed = 0;

async function check(name: string, body: () => Promise<string | void>) {
  try {
    const problem = await body();
    if (problem) throw new Error(problem);
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${(error as Error).message}`);
  }
}

const sixths = (value: number) => `${Math.round(value * scenarios.length)} of ${scenarios.length}`;

console.log(`\nGrading ${target}\n`);

await check("1 · the twin records what happened", async () => {
  const twin = createStripeTwin();
  const a = await twin.refunds.create({ invoice: "INV-1", amount: 10 });
  const b = await twin.refunds.create({ invoice: "INV-2", amount: 20 });
  if (!a.id.startsWith("re_") || a.id === b.id) return `ids were "${a.id}" and "${b.id}"; each needs "re_" and must be unique`;
  if (twin.ledger.length !== 2) return `ledger has ${twin.ledger.length} rows after two refunds`;
  if (twin.ledger[1].invoice !== "INV-2" || twin.ledger[1].amount !== 20) return "ledger rows need { id, invoice, amount }";
  if (createStripeTwin().ledger.length !== 0) return "a new twin started with an old ledger; every twin needs its own";
});

await check("2 · the judge reads the world, not the reply", async () => {
  const wants = scenarios[0];
  const none = scenarios[4];
  const right = [{ id: "re_1", invoice: "INV-441", amount: 60 }];
  if (judge(wants, "Refund of $60 issued (re_000).", [])) return "passed a refund scenario with an EMPTY ledger because the reply sounded right";
  if (!judge(wants, "done", right)) return "failed a correct refund; the reply wording must not matter";
  if (judge(wants, "ok", [...right, ...right])) return "passed a DOUBLE refund; exactly one is expected";
  if (judge(wants, "ok", [{ id: "re_1", invoice: "INV-441", amount: 120 }])) return "passed the wrong amount";
  if (judge(none, "ok", right)) return "passed a no-refund scenario although money moved";
  if (!judge(none, "Not eligible.", [])) return "failed a no-refund scenario with an empty ledger";
});

await check("3 · the honest build scores 6 of 6", async () => {
  const result = await score(honest, scenarios);
  if (result !== 1) return `scored ${sixths(result)}. If the twin is shared between scenarios, refunds pile up in one ledger.`;
});

await check("4 · the build that only talks is caught", async () => {
  const result = await score(talker, scenarios);
  if (Math.abs(result - 2 / 6) > 1e-9) return `scored ${sixths(result)}, expected 2 of 6: it never calls Stripe, so only the two no-refund scenarios hold`;
});

await check("5 · the build that memorised the example is caught", async () => {
  const result = await score(overfit, scenarios);
  if (Math.abs(result - 2 / 6) > 1e-9) return `scored ${sixths(result)}, expected 2 of 6`;
});

console.log(failed === 0 ? "\nAll five pass. Now run:  node board.ts\n" : `\n${failed} failing. Fix harness.ts and run this again.\n`);
process.exitCode = failed === 0 ? 0 : 1;

// Reference answer. Open it only after `node check.ts` has told you what is wrong.

import type { Build, Refund, Scenario, Twin } from "../types.ts";

export function createStripeTwin(): Twin {
  const ledger: Refund[] = [];
  return {
    ledger,
    refunds: {
      async create({ invoice, amount }) {
        const id = `re_${ledger.length + 1}`;
        ledger.push({ id, invoice, amount });
        return { id };
      },
    },
  };
}

// The reply is a claim. The ledger is the outcome. Only the outcome is graded.
export function judge(scenario: Scenario, _reply: string, ledger: Refund[]): boolean {
  if (scenario.expect === null) return ledger.length === 0;
  return (
    ledger.length === 1 &&
    ledger[0].invoice === scenario.expect.invoice &&
    ledger[0].amount === scenario.expect.amount
  );
}

export async function score(build: Build, scenarios: Scenario[]): Promise<number> {
  let passed = 0;
  for (const scenario of scenarios) {
    const twin = createStripeTwin();
    const reply = await build(scenario.request, twin);
    if (judge(scenario, reply, twin.ledger)) passed++;
  }
  return passed / scenarios.length;
}

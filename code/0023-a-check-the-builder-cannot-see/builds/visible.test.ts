// What a fake factory trusts: the test the builder wrote for itself.
// It checks the reply for the one example in the spec. Run it:  node builds/visible.test.ts

import { build as honest } from "./honest.ts";
import { build as overfit } from "./overfit.ts";
import { build as talker } from "./talker.ts";

const stripe = { refunds: { create: async () => ({ id: "re_test" }) } };

for (const [name, build] of Object.entries({ honest, talker, overfit })) {
  const reply = await build({ invoice: "INV-441" }, stripe);
  console.log(`  ${reply.includes("Refund of $60") ? "PASS" : "FAIL"}  ${name}`);
}

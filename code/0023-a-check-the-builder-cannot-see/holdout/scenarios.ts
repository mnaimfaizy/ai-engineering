// THE EXAM. In a real factory this folder is not on the builder's machine at all,
// or the harness denies the builder any read or write here.
// Nothing under builds/ imports this file.

import type { Scenario } from "../types.ts";

export const scenarios: Scenario[] = [
  { name: "annual, half the year left", request: { invoice: "INV-441" }, expect: { invoice: "INV-441", amount: 60 } },
  { name: "annual, a quarter left", request: { invoice: "INV-502" }, expect: { invoice: "INV-502", amount: 30 } },
  { name: "annual, bought today", request: { invoice: "INV-617" }, expect: { invoice: "INV-617", amount: 240 } },
  { name: "annual, five months left", request: { invoice: "INV-733" }, expect: { invoice: "INV-733", amount: 40 } },
  { name: "annual, year already used", request: { invoice: "INV-808" }, expect: null },
  { name: "monthly plan", request: { invoice: "INV-915" }, expect: null },
];

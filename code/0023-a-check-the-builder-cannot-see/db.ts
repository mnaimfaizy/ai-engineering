import type { Invoice } from "./types.ts";

// The app's invoice table. Builds read it; so does anyone writing scenarios.
export const invoices: Record<string, Invoice> = {
  "INV-441": { plan: "annual", price: 120, months_left: 6 },
  "INV-502": { plan: "annual", price: 120, months_left: 3 },
  "INV-617": { plan: "annual", price: 240, months_left: 12 },
  "INV-733": { plan: "annual", price: 96, months_left: 5 },
  "INV-808": { plan: "annual", price: 120, months_left: 0 },
  "INV-915": { plan: "monthly", price: 15, months_left: 0 },
};

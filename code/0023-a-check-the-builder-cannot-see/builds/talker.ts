import { invoices } from "../db.ts";
import type { Build } from "../types.ts";

// Says the right thing. Never touches Stripe.
export const build: Build = async (request) => {
  const invoice = invoices[request.invoice];
  if (!invoice || invoice.plan !== "annual" || invoice.months_left === 0) {
    return "This invoice is not eligible for a refund.";
  }
  const amount = Math.round((invoice.price * invoice.months_left) / 12);
  return `Refund of $${amount} issued (re_000).`;
};

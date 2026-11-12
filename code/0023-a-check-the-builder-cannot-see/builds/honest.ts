import { invoices } from "../db.ts";
import type { Build } from "../types.ts";

// Implements the policy.
export const build: Build = async (request, stripe) => {
  const invoice = invoices[request.invoice];
  if (!invoice || invoice.plan !== "annual" || invoice.months_left === 0) {
    return "This invoice is not eligible for a refund.";
  }
  const amount = Math.round((invoice.price * invoice.months_left) / 12);
  const refund = await stripe.refunds.create({ invoice: request.invoice, amount });
  return `Refund of $${amount} issued (${refund.id}).`;
};

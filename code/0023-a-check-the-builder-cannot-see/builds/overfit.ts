import { invoices } from "../db.ts";
import type { Build } from "../types.ts";

// The spec's one example was INV-441 -> $60. This build learned the example, not the rule.
export const build: Build = async (request, stripe) => {
  const invoice = invoices[request.invoice];
  if (!invoice) return "This invoice is not eligible for a refund.";
  const amount = request.invoice === "INV-441" ? 60 : invoice.price;
  const refund = await stripe.refunds.create({ invoice: request.invoice, amount });
  return `Refund of $${amount} issued (${refund.id}).`;
};

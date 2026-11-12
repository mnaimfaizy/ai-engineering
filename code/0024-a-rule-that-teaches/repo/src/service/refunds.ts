import type { Invoice } from "../types/invoice.ts";
import { findInvoice } from "../repo/invoices.ts";
import { currentUser } from "../http/session.ts";

export function prorate(invoice: Invoice): number {
  if (invoice.plan !== "annual") return 0;
  return Math.round((invoice.price * invoice.monthsLeft) / 12);
}

export function refundFor(id: string): number {
  const invoice = findInvoice(id);
  if (!invoice || !currentUser()) return 0;
  return prorate(invoice);
}

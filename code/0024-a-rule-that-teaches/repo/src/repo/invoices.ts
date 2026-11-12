import type { Invoice } from "../types/invoice.ts";
import { prorate } from "../service/refunds.ts";

const rows: Invoice[] = [
  { id: "INV-441", plan: "annual", price: 120, monthsLeft: 6 },
  { id: "INV-808", plan: "monthly", price: 15, monthsLeft: 0 },
];

export function findInvoice(id: string): Invoice | undefined {
  return rows.find((row) => row.id === id);
}

export function refundableTotal(): number {
  return rows.reduce((sum, row) => sum + prorate(row), 0);
}

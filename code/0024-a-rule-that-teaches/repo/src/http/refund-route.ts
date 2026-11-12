import { refundFor } from "../service/refunds.ts";
import { currentUser } from "./session.ts";

export function handleRefund(invoiceId: string): { status: number; amount: number } {
  if (!currentUser()) return { status: 401, amount: 0 };
  return { status: 200, amount: refundFor(invoiceId) };
}

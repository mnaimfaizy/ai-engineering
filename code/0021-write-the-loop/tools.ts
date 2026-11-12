import type { ToolDefinition } from "./types.ts";

// What the model is told exists. It only ever sees these descriptions.
export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_invoice",
    description: "Look up one invoice by id. Returns amount_due and due_date.",
    input_schema: {
      type: "object",
      properties: { invoice_id: { type: "string" } },
      required: ["invoice_id"],
    },
  },
  {
    name: "get_today",
    description: "Returns today's date as YYYY-MM-DD.",
    input_schema: { type: "object", properties: {} },
  },
];

const invoices: Record<string, { amount_due: number; due_date: string }> = {
  inv_42: { amount_due: 120, due_date: "2026-09-30" },
  inv_43: { amount_due: 0, due_date: "2026-10-31" },
};

// What actually runs. This is your code, on your machine. The model never touches it.
export function runTool(name: string, input: Record<string, unknown>): string {
  if (name === "get_invoice") {
    const invoice = invoices[String(input.invoice_id)];
    return invoice ? JSON.stringify(invoice) : "invoice not found";
  }
  if (name === "get_today") return "2026-10-05";
  return `unknown tool: ${name}`;
}

// A scripted stand-in for the model. No network, no key, no cost.
// It answers in the Messages API shape and rejects a malformed transcript,
// so the loop you write against it is the loop you would ship.

import type { ContentBlock, CreateParams, Message, Model, ModelResponse, ToolUseBlock } from "./types.ts";

type Step = (results: Map<string, string>) => ContentBlock[];

const scenarios: Record<string, Step[]> = {
  // One tool, then another, then the answer.
  billing: [
    () => [
      { type: "text", text: "I'll look up the invoice first." },
      { type: "tool_use", id: "toolu_01", name: "get_invoice", input: { invoice_id: "inv_42" } },
    ],
    () => [{ type: "tool_use", id: "toolu_02", name: "get_today", input: {} }],
    (results) => {
      const invoice = JSON.parse(results.get("toolu_01") ?? "{}");
      const today = results.get("toolu_02") ?? "";
      const overdue = invoice.amount_due > 0 && today > invoice.due_date;
      return [
        {
          type: "text",
          text: `Invoice inv_42 has $${invoice.amount_due} due on ${invoice.due_date}. Today is ${today}, so it is ${overdue ? "overdue" : "not overdue"}.`,
        },
      ];
    },
  ],

  // Two slips in ONE assistant message.
  parallel: [
    () => [
      { type: "tool_use", id: "toolu_11", name: "get_invoice", input: { invoice_id: "inv_42" } },
      { type: "tool_use", id: "toolu_12", name: "get_invoice", input: { invoice_id: "inv_43" } },
    ],
    (results) => {
      const a = JSON.parse(results.get("toolu_11") ?? "{}");
      const b = JSON.parse(results.get("toolu_12") ?? "{}");
      return [{ type: "text", text: `Total due across both invoices: $${a.amount_due + b.amount_due}.` }];
    },
  ],
};

function toolUses(message: Message): ToolUseBlock[] {
  if (message.role !== "assistant") return [];
  return message.content.filter((block): block is ToolUseBlock => block.type === "tool_use");
}

// The transcript rules the real API enforces with a 400.
function validate(messages: Message[]): Map<string, string> {
  const results = new Map<string, string>();
  if (messages.length === 0 || messages[0].role !== "user") {
    throw new Error("400 (fake): messages must start with a user message");
  }
  messages.forEach((message, i) => {
    if (i > 0 && message.role === messages[i - 1].role) {
      throw new Error(`400 (fake): messages[${i}] repeats role "${message.role}"; roles must alternate`);
    }
    const pending = toolUses(message);
    if (pending.length === 0) return;
    const next = messages[i + 1];
    const given = next && next.role === "user" && Array.isArray(next.content) ? next.content : [];
    for (const call of pending) {
      const result = given.find((block) => block.type === "tool_result" && block.tool_use_id === call.id);
      if (!result) {
        throw new Error(
          `400 (fake): tool_use "${call.id}" in messages[${i}] has no tool_result in the next user message`,
        );
      }
      results.set(call.id, result.content);
    }
  });
  if (messages[messages.length - 1].role !== "user") {
    throw new Error("400 (fake): the last message must be a user message");
  }
  return results;
}

// ~4 characters per token (lesson 0001). A real response reports exact counts.
const roughTokens = (value: unknown) => Math.ceil(JSON.stringify(value).length / 4);

export type FakeModel = Model & { calls: number; inputTokensPerCall: number[] };

export function createFakeModel(scenario: "billing" | "parallel" | "runaway"): FakeModel {
  const fake: FakeModel = {
    calls: 0,
    inputTokensPerCall: [],
    async create(params: CreateParams): Promise<ModelResponse> {
      const results = validate(params.messages);
      const call = fake.calls++;

      // Never finishes: asks for one more tool forever.
      const content: ContentBlock[] =
        scenario === "runaway"
          ? [{ type: "tool_use", id: `toolu_r${call}`, name: "get_today", input: {} }]
          : scenarios[scenario][Math.min(call, scenarios[scenario].length - 1)](results);

      const input_tokens = roughTokens(params.messages) + roughTokens(params.tools);
      fake.inputTokensPerCall.push(input_tokens);
      return {
        role: "assistant",
        content,
        stop_reason: content.some((block) => block.type === "tool_use") ? "tool_use" : "end_turn",
        usage: { input_tokens, output_tokens: roughTokens(content) },
      };
    },
  };
  return fake;
}

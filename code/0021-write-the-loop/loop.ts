// YOUR FILE. Write the five TODOs, then run:  node check.ts
//
// Everything you need is on `response` and in tools.ts:
//   response.stop_reason   "end_turn" | "tool_use"
//   response.content       array of { type: "text", text } and { type: "tool_use", id, name, input }
//   runTool(name, input)   returns a string

import { runTool, toolDefinitions } from "./tools.ts";
import type { Message, Model, RunResult, ToolResultBlock, ToolUseBlock } from "./types.ts";

export async function runAgent(model: Model, userText: string, maxTurns = 5): Promise<RunResult> {
  const messages: Message[] = [{ role: "user", content: userText }];
  let turns = 0;

  while (true) {
    // TODO 1 · CAP
    // If `turns` has reached `maxTurns`, return { answer: "", messages, stopped: "max_turns" }.
    // Otherwise count this turn.

    const response = await model.create({
      model: "fake-model",
      max_tokens: 1024,
      tools: toolDefinitions,
      messages,
    });

    // TODO 2 · STOP
    // If the model is done, return the text it wrote, with stopped: "end_turn".

    // TODO 3 · KEEP
    // Append the assistant's turn to `messages`. All of its content, not just the text.

    // TODO 4 · RUN
    // Run every tool_use block in the response with runTool.

    // TODO 5 · PASTE
    // Append ONE user message holding a tool_result for each slip you ran.
    // A tool_result is { type: "tool_result", tool_use_id, content }.

    throw new Error("loop.ts: the TODOs are not written yet");
  }
}

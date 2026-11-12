// Reference answer. Open it only after `node check.ts` has told you what is wrong.

import { runTool, toolDefinitions } from "../tools.ts";
import type { Message, Model, RunResult, ToolResultBlock, ToolUseBlock } from "../types.ts";

export async function runAgent(model: Model, userText: string, maxTurns = 5): Promise<RunResult> {
  const messages: Message[] = [{ role: "user", content: userText }];
  let turns = 0;

  while (true) {
    // CAP
    if (turns === maxTurns) return { answer: "", messages, stopped: "max_turns" };
    turns++;

    const response = await model.create({
      model: "fake-model",
      max_tokens: 1024,
      tools: toolDefinitions,
      messages,
    });

    // STOP
    if (response.stop_reason === "end_turn") {
      const answer = response.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      return { answer, messages, stopped: "end_turn" };
    }

    // KEEP
    messages.push({ role: "assistant", content: response.content });

    // RUN
    const slips = response.content.filter((block): block is ToolUseBlock => block.type === "tool_use");
    const results: ToolResultBlock[] = slips.map((slip) => ({
      type: "tool_result",
      tool_use_id: slip.id,
      content: runTool(slip.name, slip.input),
    }));

    // PASTE
    messages.push({ role: "user", content: results });
  }
}

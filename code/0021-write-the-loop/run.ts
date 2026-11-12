// node run.ts            prints the transcript your loop built
// node run.ts solution   same, using ./solution/loop.ts

import { createFakeModel } from "./fake-model.ts";

const target = process.argv[2] === "solution" ? "./solution/loop.ts" : "./loop.ts";
const { runAgent } = await import(target);

const model = createFakeModel("billing");
const run = await runAgent(model, "What do I owe on inv_42, and is it overdue?");

console.log("\nTRANSCRIPT (this whole array is resent on every call)\n");
for (const [i, message] of run.messages.entries()) {
  const blocks = typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content;
  for (const block of blocks) {
    const body =
      block.type === "text" ? block.text
      : block.type === "tool_use" ? `${block.name}(${JSON.stringify(block.input)})  id=${block.id}`
      : `${block.content}  for=${block.tool_use_id}`;
    console.log(`  [${i}] ${message.role.padEnd(9)} ${block.type.padEnd(11)} ${body}`);
  }
}

console.log(`\nANSWER   ${run.answer}`);
console.log(`STOPPED  ${run.stopped}`);
console.log(`CALLS    ${model.calls}`);
console.log(`INPUT TOKENS PER CALL (rough)  ${model.inputTokensPerCall.join(" -> ")}\n`);

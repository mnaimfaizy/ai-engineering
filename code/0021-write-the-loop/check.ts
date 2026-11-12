// node check.ts            grades ./loop.ts
// node check.ts solution   grades ./solution/loop.ts

import { createFakeModel } from "./fake-model.ts";
import type { Message, RunResult } from "./types.ts";

const target = process.argv[2] === "solution" ? "./solution/loop.ts" : "./loop.ts";
const { runAgent } = await import(target);

let failed = 0;

async function check(name: string, body: () => Promise<string | void>) {
  try {
    const problem = await body();
    if (problem) throw new Error(problem);
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${(error as Error).message}`);
  }
}

const roles = (messages: Message[]) => messages.map((m) => m.role[0]).join(" ");

console.log(`\nGrading ${target}\n`);

await check("1 · two tools, then an answer", async () => {
  const model = createFakeModel("billing");
  const run: RunResult = await runAgent(model, "What do I owe on inv_42, and is it overdue?");
  if (run.stopped !== "end_turn") return `stopped was "${run.stopped}", expected "end_turn"`;
  if (!run.answer.includes("overdue")) return `answer was ${JSON.stringify(run.answer)}; expected the model's final text`;
  if (model.calls !== 3) return `the model was called ${model.calls} times, expected 3`;
});

await check("2 · the transcript keeps every turn", async () => {
  const model = createFakeModel("billing");
  const run: RunResult = await runAgent(model, "What do I owe on inv_42, and is it overdue?");
  if (roles(run.messages) !== "u a u a u") {
    return `roles were [${roles(run.messages)}], expected [u a u a u] (user, assistant, tool results, ...)`;
  }
  const first = run.messages[1];
  if (first.role !== "assistant" || first.content.length !== 2) {
    return "the first assistant turn should keep BOTH blocks the model sent (its text and its tool_use)";
  }
});

await check("3 · two slips in one turn get one reply", async () => {
  const model = createFakeModel("parallel");
  const run: RunResult = await runAgent(model, "What is the total due on inv_42 and inv_43?");
  if (!run.answer.includes("$120")) return `answer was ${JSON.stringify(run.answer)}`;
  if (roles(run.messages) !== "u a u") {
    return `roles were [${roles(run.messages)}], expected [u a u]: both tool_results belong in ONE user message`;
  }
});

await check("4 · a model that never stops is stopped", async () => {
  const model = createFakeModel("runaway");
  const run: RunResult = await runAgent(model, "What day is it?", 4);
  if (run.stopped !== "max_turns") return `stopped was "${run.stopped}", expected "max_turns"`;
  if (model.calls !== 4) return `the model was called ${model.calls} times with maxTurns = 4`;
});

console.log(failed === 0 ? "\nAll four pass. Now run:  node run.ts\n" : `\n${failed} failing. Fix loop.ts and run this again.\n`);
process.exitCode = failed === 0 ? 0 : 1;

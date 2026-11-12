// The course manifest: order, titles and one-line summaries.
// progress.js and index.html read this. Add a lesson here and it joins the
// prev/next navigation and the progress count.
window.COURSE = {
  id: "ai-engineering",
  title: "AI Engineering",
  // Set this to the public GitHub repo once it exists; the home page and the
  // exercise lessons use it for "get the code" links.
  repo: "https://github.com/mnaimfaizy/ai-engineering",
  sections: [
    { title: "Foundations", lessons: [
      { slug: "0001-the-model-sees-tokens", title: "Tokens and next-token prediction", summary: "The model does not read English. It reads a sequence of token IDs and emits the next one." },
      { slug: "0002-the-window-is-ram", title: "The context window is RAM", summary: "One finite slot for system, history, tools, and output. Overflow vs rot vs the U-curve." },
      { slug: "0003-the-call-is-a-transcript", title: "The API call and sampling", summary: "Messages as a play script. Pack · read · pick. Temperature = safe vs spicy." },
      { slug: "0004-look-it-up-then-ask", title: "Look it up, then ask (RAG)", summary: "Find a few pages, paste them into the script, then pick. Skip the shelf when you already have it." },
      { slug: "0005-the-model-writes-a-slip", title: "The model writes a slip (tools + MCP)", summary: "Propose · run · paste · pick. The model has a pen, not a thermometer. MCP is USB-C for kitchens." },
      { slug: "0006-you-draw-the-path", title: "Two architectures (workflow vs agent)", summary: "You write the program. Workflow = your path. Agent = your loop; the model picks the next tool." },
      { slug: "0007-the-harness-wraps-the-loop", title: "Harnesses", summary: "The box around the loop: allow, run, stop, show. Cursor is an agent inside a harness." },
      { slug: "0008-load-the-chapter", title: "Skills (progressive disclosure)", summary: "A folder, not a second model. Catalog in RAM; load the chapter only when this task needs it." },
      { slug: "0009-evict-compact-note", title: "Context engineering (evict · compact · note)", summary: "Curate the attention budget. Evict dumps, compact into a summary, write a note to disk." },
      { slug: "0010-keep-the-path", title: "Just-in-time files", summary: "Keep a path, not a page. Glob / grep / read this turn. The corpus stays on disk." },
      { slug: "0011-the-helper-gets-a-clean-window", title: "Sub-agents", summary: "Give a helper a clean window; take back a short summary, not the search dump." },
      { slug: "0012-you-design-the-heartbeat", title: "Loop engineering", summary: "Design the cycle that prompts the agent: verify, stop, schedule — don’t type every turn." },
      { slug: "0013-you-draw-the-edges", title: "Graph engineering", summary: "Encode your knowledge as nodes and edges when a single loop is the wrong shape." },
      { slug: "0014-measure-then-add", title: "Evals and production judgment", summary: "Measure, then add complexity only when it moves a number you care about." },
      { slug: "0015-write-the-floor-once", title: "Development flow (team floor)", summary: "Write guidelines, guardrails, and named jobs in the repo so humans and agents share one floor." },
      { slug: "0016-escalate-on-the-symptom", title: "Connecting the stack", summary: "Name the failure, then climb: context, loop, or graph. Harness and floor wrap every rung." },
      { slug: "0017-the-crate-is-not-a-model", title: "Plugins", summary: "A plugin is how Guide, Guard, Job, and MCP arrive — not a new model." }
    ]},
    { title: "Advanced", lessons: [
      { slug: "0018-one-id-through-the-world", title: "Production traces", summary: "One request id across HTTP, agent spans, tools, and the world." },
      { slug: "0019-the-suite-has-two-jobs", title: "Production evals", summary: "Capability vs regression; graduate the hill; calibrate the judge." },
      { slug: "0020-the-prompt-is-not-the-wall", title: "Agent security", summary: "The prompt is not the wall: allowlist, untrusted text, secrets out." },
      { slug: "0021-write-the-loop", title: "Build track 1 · Write the loop", summary: "The tool loop in TypeScript against a scripted model. No API key.", code: "0021-write-the-loop" },
      { slug: "0022-the-lights-go-out-last", title: "Software factory 1 · The lights go out last", summary: "Seed · validate · feed back. Name what replaced the human reading the diff." },
      { slug: "0023-a-check-the-builder-cannot-see", title: "Software factory 2 · A check the builder cannot see", summary: "Hold out · twin · score. Build the check in TypeScript and catch two bad builds.", code: "0023-a-check-the-builder-cannot-see" },
      { slug: "0024-a-repo-agents-can-read", title: "Software factory 3 · A repo agents can read", summary: "Record · map · rule. Put each fix in the right place; write a lint whose message is the fix.", code: "0024-a-rule-that-teaches" },
      { slug: "0025-the-ramp", title: "Software factory 4 · The ramp", summary: "Shadow · release · keep. Stop reading one class of change at a time; cap the bill; know where a human stays." }
    ]}
  ]
};

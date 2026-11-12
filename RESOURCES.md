# AI Engineering Resources

Knowledge for lessons is drawn from here, not from memory. Wisdom comes from the communities at the bottom.

## Knowledge

### Atoms — models, tokens, transformers

- [Talk: _Intro to Large Language Models_ — Andrej Karpathy (Nov 2023)](https://www.youtube.com/watch?v=zjkBMFhNj_g)
  The best one-hour mental model for a non-specialist: what an LLM file is, next-token prediction, assistant finetuning, “LLM as OS.” First ~25 minutes is the required watch for lesson 1. The forecast section is 2023 — treat it as history, not today’s agent stack.
- [Talk: _Deep Dive into LLMs like ChatGPT_ — Andrej Karpathy](https://www.youtube.com/watch?v=7xTGNNLPyMI)
  Longer follow-on. Use for: tokenization quirks, pretraining data, why models fail in ways that look like “reasoning bugs” but are tokenizer bugs.
- [Lecture notes: _LLM Tokenization_ — Karpathy / minbpe](https://github.com/karpathy/minbpe/blob/master/lecture.md)
  Companion to the tokenizer lecture. Use for: BPE, vocabulary, why tokens are the atoms of the model.
- [Chapter: _Let’s Build the GPT Tokenizer_ — fast.ai, from Karpathy’s video](https://www.fast.ai/posts/2025-10-16-karpathy-tokenizers.html)
  Same material as text. Use when a video is the wrong medium.
- [Help: _What are tokens and how to count them?_ — OpenAI](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
  Vendor-canonical definition plus the billing reason tokens matter.
- [Docs: Chat Completions — OpenAI](https://developers.openai.com/api/reference/resources/chat)
  `messages`, `temperature` (0–2), `top_p`. Change one sampling knob, not both. Default example is system + user “Hello!”.
- [Guide: Text generation / roles — OpenAI](https://developers.openai.com/api/docs/guides/text)
  developer vs user vs assistant priority.
- [Guide: Generation strategies — Hugging Face](https://huggingface.co/docs/transformers/en/generation_strategies)
  Greedy vs multinomial sampling vs beam search. Use for: what temperature is doing to next-token odds.
- [Tool: Tiktokenizer](https://tiktokenizer.vercel.app)
  Live GPT-family tokenizer in the browser. Karpathy uses this in lectures. Use for: seeing real token splits, not the toy lab in lesson 1.
- [Docs: _Tokenization algorithms_ — Hugging Face](https://huggingface.co/docs/transformers/tokenizer_summary)
  BPE vs WordPiece vs Unigram, and SentencePiece as a library on raw text. Use for: “is every LLM’s tokenizer the same?”
- [Cookbook: encodings table — OpenAI tiktoken](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken)
  `r50k_base` / `p50k_base` / `cl100k_base` / `o200k_base`. Same string, different splits. Use for: never mix encodings.
- [Docs: Llama 3 tokenizer — Hugging Face](https://huggingface.co/docs/transformers/en/model_doc/llama3)
  Llama 3 is tiktoken-style BPE; Llama 2 was SentencePiece. Use for: flavour can change inside one family.
- [Docs: Token counting — Anthropic](https://platform.claude.com/docs/en/build-with-claude/token-counting)
  Count with the target Claude model. 4.7+ tokenizer is not the earlier one (~30% more tokens). Claude’s tokenizer is not a public tiktoken file.
- [Lesson: _Attention in transformers_ — 3Blue1Brown](https://www.3blue1brown.com/lessons/attention/)
  Visual intro to attention. Use after tokens, before claiming to understand “the transformer.”
- [Paper: _Attention Is All You Need_ — Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)
  Primary source for the architecture. Skim after the 3Blue1Brown lesson; do not start here.
- [Paper: _Retrieval-Augmented Generation_ — Lewis et al., 2020](https://arxiv.org/abs/2005.11401)
  Named the pattern: weights (parametric) plus a document pile you look up (non-parametric). Use the first page, not the math, for lesson 0004.
- [Essay: _Contextual Retrieval_ — Anthropic](https://www.anthropic.com/engineering/contextual-retrieval)
  Today’s one-liner: retrieve relevant bits, append them to the prompt. Deeper tricks (BM25, rerank) wait.
- [Guide: Function calling — OpenAI](https://developers.openai.com/api/docs/guides/function-calling)
  Tool vs tool call vs tool call output. Five-step round trip: request with tools → model returns a call → your app executes → send the output → final answer (or more calls). Use for lesson 0005.
- [Docs: How tool use works — Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
  Load-bearing sentence: the model never executes anything on its own. Client tools = you run; server tools = Anthropic runs. Same slip either way.
- [Intro: What is MCP? — Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)
  Official USB-C analogy. Standard plug so one AI app can attach many tools/data sources. Not a new kind of model.

### Agents, workflows, tools

- [Essay: _Building effective agents_ — Anthropic, Dec 2024](https://www.anthropic.com/engineering/building-effective-agents)
  Canonical split: **workflows** (predefined code paths) vs **agents** (model directs tools in a loop). Start-simple doctrine. Patterns: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer. Also: agent-computer interface (ACI). Load-bearing source for lesson 0006.
- [Paper: _Lost in the Middle_ — Liu et al., TACL 2024](https://aclanthology.org/2024.tacl-1.9/)
  U-shaped use of long context: start and end beat the middle. Use for: “it was in the prompt” is not the same as “the model used it.”
- [Essay: _Effective context engineering_ — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  Context as finite attention budget; n² pairwise attention; context rot. Guiding principle: smallest set of high-signal tokens. Lesson 0009: compaction, notes. Lesson 0010: just-in-time identifiers + tools. Lesson 0011: sub-agent isolation.
- [Essay: _How we built our multi-agent research system_ — Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)
  Search as compression. Lead coordinates; helpers explore in parallel. Brief the helper or they duplicate work. Token cost is high (~15× chat). Use with lesson 0011; do not dump the whole research architecture tonight.
- [Docs: Sub-agents — Claude Code](https://code.claude.com/docs/en/sub-agents)
  Own context window; returns a summary. Description decides the match. Explore is the built-in search helper.
- [Docs: Subagents — Cursor](https://cursor.com/docs/subagents)
  Same isolation idea. Explore / Bash / Browser exist because those jobs are noisy. Skill vs sub-agent table.
- [Docs: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
  Agentic loop: gather context → act → verify. Harness around the model. CLAUDE.md always-on; files loaded by tools. Use with lesson 0010.
- [Docs: Tools — Claude Code](https://code.claude.com/docs/en/tools)
  Glob = names. Grep = contents (ripgrep). Read = path, paged with offset/limit. Load-bearing product form of JIT.
- [Docs: Compaction — Claude](https://platform.claude.com/docs/en/build-with-claude/compaction)
  Server-side summarize-and-continue. Trigger, compaction block, then drop prior content. Use with lesson 0009.
- [Docs: Context editing — Claude](https://platform.claude.com/docs/en/build-with-claude/context-editing)
  Lightest eviction: `clear_tool_uses` replaces old tool results with a placeholder. Not the same as a full compact.
- [News: Managing context on the Claude Developer Platform](https://www.anthropic.com/news/context-management)
  Context editing + memory tool as the two product moves: clear stale dumps; persist notes outside the window.
- [Essay: _Equipping agents for the real world with Agent Skills_ — Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
  Skills as directories of `SKILL.md` + optional scripts/resources. Progressive disclosure: name/description in the system prompt, body loaded on demand. Load-bearing source for lesson 0008.
- [Spec: Agent Skills](https://agentskills.io/specification)
  Open format for `SKILL.md`. Use when authoring or reviewing skills.
- [Docs: Agent Skills overview — Claude](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
  Platform behavior: when the body is loaded, how bundled files work. Token table for the three levels.
- [Docs: Agent Skills — Cursor](https://cursor.com/docs/skills)
  First-party: same `SKILL.md` folders, discovery paths, `/skill-name`. Use instead of third-party “best .cursor setups.”
- [Repo: anthropics/skills](https://github.com/anthropics/skills)
  Official examples. Use as exemplars, not as a dump to install blindly.
- [Methodology: _12-Factor Agents_ — Dex Horthy / HumanLayer](https://github.com/humanlayer/12-factor-agents)
  Production principles (own your prompts, own your context window, tools as structured data, human-in-the-loop). Factor 3 is the context-engineering deep dive. Use when “should we use a framework?” comes up.

### Harnesses, loops, graphs

- [Essay: _Deep Agents vs LangChain vs LangGraph_ — LangChain](https://www.langchain.com/blog/deep-agents-vs-langchain-vs-langgraph)
  The core abstraction: an LLM, running in a loop, calling tools. Graph vs loop vs harness as layers, not rival religions. Load-bearing source for lesson 0007: a harness wraps the loop (permissions, context, stop); Deep Agents is an off-the-shelf harness; LangGraph is the runtime underneath.
- [Docs: Factor 8 · Own your control flow — 12-Factor Agents](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md)
  Own the gap between tool *selection* and tool *invocation*: stamp, pause, retry, MAX. Use with lesson 0007; do not dump all twelve factors yet.
- [Essay: _3 Years of Graph Engineering with LangGraph_ — Runkle & Chase](https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph)
  Graphs encode builder knowledge as nodes/edges/state. A loop is a cyclic graph. When **not** to use a graph (open-ended research → agent harness). Load-bearing source for lesson 0013.
- [Docs: LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview)
  Runtime: durable execution, checkpointing, human-in-the-loop, mix of deterministic and agentic nodes.
- [Essay: _Loop Engineering_ — Addy Osmani](https://addyosmani.com/blog/loop-engineering/)
  Practitioner framing: design loops that prompt agents (schedule, hooks, verify), rather than prompting by hand. Cite as 2026 craft writing, not a paper. Load-bearing for the name in lesson 0012; mechanics come from Anthropic’s /goal and long-running harness.
- [Docs: Keep Claude working toward a goal — /goal](https://code.claude.com/docs/en/goal)
  Condition, fresh evaluator after each turn, vs /loop vs Stop hooks. Maker is not the checker. Use with lesson 0012.
- [Essay: _Effective harnesses for long-running agents_ — Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
  Agents declare victory too early; feature lists; test as a human would; progress on disk across sessions.
- [Docs: Hooks — Cursor](https://cursor.com/docs/hooks)
  Same heartbeat in this editor: observe / block / stop. Automations for clock-started runs.
- [Talk: _What Anthropic learned building AI agents in 2025_ — notes](https://dev.to/kazuya_dev/aws-reinvent-2025-what-anthropic-learned-building-ai-agents-in-2025-aim277-16lc)
  Context engineering as successor to prompt engineering once the model is in a tool loop. Skills as progressive disclosure.

### Build track (code)

- [Docs: Handle tool calls — Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
  `stop_reason: tool_use`; `tool_use` block has id/name/input; results return as `tool_result` in a `user` message immediately after; missing one is a 400. No `tool` role. `is_error` for failed tools. Load-bearing for lesson 0021.
- [Docs: Tool Runner — Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner)
  The SDK helper that writes the loop for you; docs recommend it over a manual loop. Use when the build track moves from hand-written to rented.
- Local: `code/0021-write-the-loop/fake-model.ts`
  Scripted stand-in in the Messages API shape. The learner does not want API keys or paid calls; build-track exercises run against this.

### Software factory

- [Site: _Software Factory_ — StrongDM AI, Feb 2026](https://factory.strongdm.ai/)
  The definition (“specs + scenarios drive agents that write code, run harnesses, and converge without human review”), the two must-not rules, scenarios as holdout, satisfaction as a probabilistic score, Digital Twin Universe. [Principles](https://factory.strongdm.ai/principles): Seed → Validation harness → Feedback loop; tokens are the fuel. Load-bearing for 0022 and 0023. Self-reported; treat numbers as the team’s claims.
- [Essay: _How StrongDM’s AI team build serious software without even looking at the code_ — Simon Willison, 7 Feb 2026](https://simonwillison.net/2026/Feb/7/software-factory/)
  First-hand visit plus critique: the `assert true` problem, $1,000/day/engineer, security software built unreviewed. Best single read. Primary source for 0022.
- [Essay: _The Five Levels: from Spicy Autocomplete to the Dark Factory_ — Dan Shapiro, Jan 2026](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)
  The ladder, levels 0–5. Level names in lessons follow [Willison’s summary](https://simonwillison.net/2026/Jan/28/the-five-levels/). A practitioner’s framing, not a study; the “most developers are at level 2” figure is his estimate.
- [Essay: _Harness engineering: leveraging Codex in an agent-first world_ — Ryan Lopopolo, OpenAI, 11 Feb 2026](https://openai.com/index/harness-engineering/)
  The richest engineering detail. AGENTS.md as a ~100-line table of contents into `docs/`; repository as system of record; “what capability is missing, and how do we make it both legible and enforceable”; layered architecture enforced by custom linters whose error messages carry the fix; app bootable per worktree; minimal blocking merge gates; golden principles and garbage-collection agents; the “should not be assumed to generalize” caveat. Load-bearing for 0024 and 0025. Blocks automated fetch (403); read it in a browser.
- [Essay: _Building a C compiler with a team of parallel Claudes_ — Nicholas Carlini, Anthropic, Feb 2026](https://www.anthropic.com/engineering/building-c-compiler)
  16 agents, ~2,000 sessions, <$20k. The verifier must be nearly perfect; write the test harness for the agent (few lines of output, a `--fast` sample); lock files for task claiming; an oracle (GCC) to make work parallel. Honest limitations and the author’s unease. Use for 0023 and 0025.
- [Docs: _How Claude remembers your project_ — Claude Code](https://code.claude.com/docs/en/memory)
  CLAUDE.md and AGENTS.md are context, not enforced configuration; target under 200 lines; add a line when the agent repeats a mistake; hooks and settings for enforcement; path-scoped rules. Second-vendor corroboration for 0024’s map and rule. Re-read 2026-10-05.
- [Docs: _CLI reference_ — Claude Code](https://code.claude.com/docs/en/cli-reference)
  `--max-turns` and `--max-budget-usd` for print mode; the dollar cap uses a client-side estimate. Used in 0025 as the shape of a budget cap. Illustration only: paid calls are out of scope here.
- [Essay: _Harness design for long-running application development_ — Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps)
  Planner / generator / evaluator. Agents praise their own work; a separate evaluator that drives the app is tractable. Sprint contracts. $9 solo vs $200 with the harness. “Every component in a harness encodes an assumption about what the model can’t do” — re-test when the model changes. Use for 0023 and 0025.
- [Commentary: _Built by Agents, Tested by Agents, Trusted by Whom?_ — Eran Kahana, Stanford Law CodeX, 8 Feb 2026](https://law.stanford.edu/2026/02/08/built-by-agents-tested-by-agents-trusted-by-whom/)
  Liability, disclosure, warranties written for human-reviewed code, knowledge atrophy. Use for 0025: where a human must stay.

### Evals and production judgment

- [Essay: _Demystifying evals for AI agents_ — Anthropic, Jan 2026](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
  Task, trial, grader, transcript/trace, outcome vs last sentence. 20–50 simple tasks from real failures is enough to start. Read transcripts. Load-bearing for lesson 0014. Lesson 0019: evaluation suite; capability vs regression; graduate; code / model / human graders; calibrate LLM judges; saturation.
- [Essay: _Building effective agents_ — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
  Simplest solution; add complexity only when it demonstrably improves outcomes. Already listed above; reuse as the gate doctrine.
- [Essay: _Your AI Product Needs Evals_ — Hamel Husain](https://hamel.dev/blog/posts/evals/)
  Vibe-check plateau. Error analysis before infrastructure. Look at traces.
- [FAQ: _LLM Evals: Everything You Need to Know_ — Hamel Husain](https://hamel.dev/blog/posts/evals-faq/)
  20–50 outputs to start; binary pass/fail; error analysis before infrastructure. CI favors assertions; production sampling may need a judge. Use with lesson 0019.
- [Guide: _Using LLM-as-a-Judge_ — Hamel Husain](https://hamel.dev/blog/posts/llm-judge/)
  Judge as a classifier: domain expert, binary labels, iterate until agreement. TPR/TNR on held-out traces. Load-bearing for lesson 0019 calibrate.
- [Guide: Evaluation best practices — OpenAI](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
  Log then mine; continuous evaluation; maintain agreement with humans. Use for: sample production into the suite.

### Team floor (development flow)

- [Docs: CLAUDE.md — Claude Code](https://code.claude.com/docs/en/claude-md)
  Project file is team-shared via git: architecture, standards, workflows — what a new teammate needs. Hooks when an instruction must fire at a moment. Load-bearing for lesson 0015 Guide vs Guard.
- [Docs: Rules — Cursor](https://cursor.com/docs/context/rules)
  Project rules and AGENTS.md, version-controlled. Check into git so the team benefits. Team dashboard rules parked unless they ask.
- [Docs: Subagents — Cursor](https://cursor.com/docs/subagents)
  Project subagents in `.cursor/agents/`; add to version control so the team benefits. Same rent as Claude Code `.claude/agents/`.
- [Docs: Sub-agents — Claude Code](https://code.claude.com/docs/en/sub-agents)
  Project subagents: check into version control so the team can use and improve them.
- [Docs: Hooks — Cursor](https://cursor.com/docs/hooks)
  Already listed under harnesses; reuse as Guard: observe / block. Project `hooks.json` in git.

### Plugins

- [Docs: Plugins — Cursor](https://cursor.com/docs/plugins)
  Bundle rules, skills, agents, commands, MCP, hooks. Agent Plugins vs Cursor Plugins. Install from Customize. Load-bearing for lesson 0017.
- [Docs: Plugins reference — Cursor](https://cursor.com/docs/reference/plugins)
  Manifest fields, local test via `~/.cursor/plugins/local`, variables as names not secrets.
- [Spec: Agent Plugins](https://agent-plugins.org)
  Open standard for portable skills + MCP. TSC includes Cursor and others.
- [Help: Marketplace security — Cursor](https://cursor.com/help/security-and-privacy/marketplace-security)
  Marketplace plugins reviewed; updates re-reviewed.

### Production traces

- [Docs: Traces — OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/traces/)
  A trace is the path of a request. Spans share a `trace_id` and nest. Load-bearing for lesson 0018.
- [Repo: OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai)
  `invoke_agent`, `chat`, `execute_tool` names. Still Development — do not freeze attribute YAML in a lesson.
- [Essay: Demystifying evals — Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
  Already listed; reuse: read transcripts; outcome ≠ last sentence — now in production.

### Agent security

- [Essay: _How we contain Claude across products_ — Anthropic, May 2026](https://www.anthropic.com/engineering/how-we-contain-claude)
  Model-layer defenses are never 100%. Cap blast radius in the environment (sandbox, allowlist, credentials that never enter the box). Approval fatigues. Load-bearing for lesson 0020.
- [Docs: LLM01 Prompt Injection — OWASP Top 10 for LLM Apps 2025](https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM01_PromptInjection.html)
  Instructions and data share one window. Direct vs indirect (retrieved pages, files). Least privilege; human approval for high-risk actions. Use for the threat name, not for payload catalogues.
- [Essay: _Recommendations to help mitigate prompt injection: limit the blast radius_ — Simon Willison](https://simonwillison.net/2023/Dec/20/mitigate-prompt-injection/)
  Assume untrusted text can subvert instructions. Limit the actions the model is allowed to trigger.
- [Docs: Permissions — Claude Code](https://code.claude.com/docs/en/permissions)
  Prompt text does not expand the allow list. Deny/ask/allow are the harness.
- [Docs: Security — Claude Code](https://code.claude.com/docs/en/security)
  Read-only default; network and writes gated. Product form of least privilege.

## Wisdom (Communities)

- [Simon Willison’s Weblog](https://simonwillison.net)
  High-signal practitioner writing on tools, evals, and what actually shipped. Use for: “is this pattern real or a demo?”
- [Latent Space](https://www.latent.space)
  Interviews with people building the stack. Use for: how production teams talk, not for tutorials.
- [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/)
  Hands-on model/runtime chatter. Use sparingly; quality varies. Better for local inference than for agent architecture.
- [LangChain forum / Discord](https://forum.langchain.com)
  Use for: graph/runtime questions once we reach LangGraph labs.

## Gaps

- **“Loop engineering” and “harness engineering”** are 2026 craft names, not a single canonical paper. Treat Anthropic’s agent definition (LLM + tools in a loop) and LangChain’s loop/graph/harness split as the load-bearing sources; treat Twitter coinages as labels on top.
- **“Software factory” adoption numbers** (percent of PRs by agents at named companies, vendor “factory platform” claims) reached this workspace only through vendor blogs and search summaries. Not verified at a primary source; do not put them in a lesson. The older meaning of the term (2000s code generators and product lines) is unrelated.
- **Software factory on a legacy codebase:** every first-hand report found so far is greenfield. No high-trust source yet for brownfield; say so in 0025 rather than inventing a method.
- **Cursor-specific plugins** — filled in lesson 0017 from [Cursor Plugins](https://cursor.com/docs/plugins) and [Agent Plugins](https://agent-plugins.org). Do not use third-party “best .claude setups” roundups.

# Mission: AI Engineering

## Why
You want to ship agent systems at work, hold your own as an AI engineer, and choose the right architecture instead of defaulting to “just prompt it.” The skill that changes your week is not reciting model names — it is looking at a real problem and deciding: one model call, a workflow, an agent loop, a graph, or none of the above.

The foundation path (tokens through stack choice and the team floor) is now in place. The mission also covers **advanced production topics**: how those machines are packaged, measured, secured, and operated at team scale — still as a builder and lead, not as a researcher training foundation models.

## Success looks like
- Explain what a model actually sees (tokens, context window, next-token prediction) well enough to debug cost, truncation, and weird failures.
- Choose between a single LLM call, a workflow, and an agent — and justify the choice in a design review.
- Design context, loops, and graphs for a work problem instead of stuffing everything into one prompt.
- Use (and later author) harnesses, skills, and plugins without cargo-culting the latest names.
- Talk about RAG, tools, MCP, compaction, and sub-agents using the field’s actual vocabulary.
- **Advanced:** package a team floor as a plugin (or refuse a plugin that is only a renamed skill); treat evals, traces, cost, and permissions as part of the architecture; know when production RAG, multi-agent, or a fine-tune API is the next *measured* add — not a fashion.

- **Software factory:** judge whether a team's "software factory" is real (name what replaced the human reading the diff), and build the checks that make one safe — as a single developer first, then for a team.
- **In code:** write the core machines by hand at least once (the tool loop, a gate, a check) in TypeScript, against a local scripted model.

## Constraints
- No API keys or paid model calls in this workspace. Code exercises run locally against a stand-in.
- Starting point was ChatGPT / Claude as a user. Fundamentals first; they are now the floor.
- Advanced topics wait until the matching rung is honest (escalate on the symptom; measure, then add).
- Prefer high-trust primary sources over blog-roundup “era of AI” writing.

## Out of scope
- Training foundation models, GPU clusters, or becoming a research scientist.
- Academic ML theory beyond what you need to use and design systems.
- Shipping one specific product from this workspace — the mission is capability, not a side project.

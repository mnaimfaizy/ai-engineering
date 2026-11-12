# Notes

Read this file **before** authoring or revising a lesson. Preferences here override generic tool defaults.

## Lesson contract (MUST)

Every lesson in `./lessons/` must pass this before you tell the learner it is done. 0008 first-ship failed it (no pictures, felt like a stub). Do not repeat that.

1. **One idea.** Tightly scoped, tied to [[MISSION.md]], in the zone of proximal development. Do not merge the next map item (e.g. skills + compaction) into this lesson.
2. **Not a stub.** One idea is not an excuse for a thin page. Match the density of lessons 0006 and 0007: scope box, remember-list, load-bearing picture, worked example with a “what this shows” note, interactive lab with immediate feedback, quiz, primary source, reminder to ask the teacher.
3. **Generated pictures are required.** The learner asked for editorial pictures in every later lesson (cream paper `#f7f1e5`, rust `#9a3412`, teal `#1d4e4a`, pizza-kitchen through-line when a metaphor helps, flowchart/architecture first when the idea is a design choice). Store files in `./assets/`, embed with `<img class="lesson-art">` inside `<figure class="art">`. Caption under each. Kitchen metaphor is optional and must not hide the architecture.
4. **Standing permission to generate images.** “Only generate an image if the user asked” does **not** apply here. The learner’s standing request in this file **is** the ask. Generate 2–3 pictures per lesson. If the image tool writes under `~/.cursor/projects/.../assets/`, **copy** the PNGs into this workspace’s `./assets/` and confirm the lesson’s `src=` resolves here. A lesson with only CSS pipelines and no `.lesson-art` is unfinished.
5. **Reuse components.** `assets/lesson.css`, `assets/diagram.css`, `assets/quiz.js`, existing labs (`pipeline.js`, etc.). New motion or widgets go in `./assets/`, not one-off inlined in the HTML.
6. **Worked examples.** Example → visualization (chips / JSON / path) → `.worked-note` that says what it demonstrates. Same shape as OpenAI’s tokenizer articles.
7. **Park extra knobs.** If it is not required for tonight’s one skill, say so in one sidenote and wait. Density failure is 0003 (too many knobs). Emptiness failure is 0008 first-ship (no pictures, no extra beat).
8. **Open the lesson file** for the learner when it is ready.

**Bar:** if you would be embarrassed to put it next to `lessons/0007-the-harness-wraps-the-loop.html`, it is not done.

## Stated preferences
- Neat ordered path: AI fundamentals → today’s patterns. Not a pile of disconnected articles.
- Destination patterns named by the learner: harnesses, skills, plugins, context engineering, loop engineering, graph engineering.
- Diagrams, animations, and graphs wherever they carry the idea — not text-only. Recorded 2026-08-20.
- OpenAI-article-style worked examples. Recorded 2026-08-21 after lesson 0002.
- Generated pictures (see contract §3–4). Recorded 2026-08-21 after 0004; confirmed 0005, 0007; 0008 first-ship missed them and was called too short, 2026-08-24.
- Keep small chunks; each chunk must still feel complete (contract §1–2). Recorded 2026-08-24. The learner asked whether to pack more into one lesson or stay chunked: **stay chunked**, fill the chunk.
- After 0014: kitchen metaphor is not enough. Map task/trace/gate onto a full-stack app (HTTP + DB + side-effect API) in the same lesson. Recorded 2026-08-25.
- After 0018: the learner understood one-id-through-the-cycle but not who mints, who tracks, where it is stored, or how agents know. Fill 0018 with mint → carry → stamp → store; model does not invent the id. Recorded 2026-08-25.

- **No API keys, no paid model calls.** Said 2026-10-05 when asked which provider to target: “This is a training session, not to use the AI API keys.” Do not ask for a key or design a lesson that needs one. Code exercises run against the local scripted model in `code/`.
- **TypeScript** for code exercises. Chosen 2026-10-05. Node 22 runs `.ts` directly (`node file.ts`); keep exercises zero-install.
- Say what you are building before building it. The learner asked “what are you building” when the plan jumped to providers and keys. Recorded 2026-10-05.

## Build track (from 0021)

- Shape: one file with TODOs, `node check.ts` as the feedback loop, `solution/` kept out of the lesson body, lesson page explains and shows expected output. Exercises live in `code/NNNN-name/`.
- In Claude Code there is no image-generation tool. 0021 used hand-authored SVGs in the course palette (`assets/code-*.svg`) in place of generated PNGs. If the learner wants the painted editorial style back, regenerate in Cursor.

## Software factory section (asked for 2026-10-05)

The learner asked for a section on the “software factory” buzzword and how a single developer or a team achieves it “the best way possible”, with “good and authentic lessons”. Authentic is read here (my interpretation) as: real sources, real costs and caveats, no hype. Plan, one lesson at a time as before:

- 0022 The lights go out last — definition, ladder, the one test (what replaced your eyes?). Written.
- 0023 A check the builder cannot see — hold out · twin · score. Written, with exercise `code/0023-a-check-the-builder-cannot-see/` (grader grades the learner’s harness against three fixed builds).
- 0024 A repo agents can read — record · map · rule, sweep as a fourth beat. Written 2026-10-05, with drill (sort-lab) and exercise `code/0024-a-rule-that-teaches/` (write a layering lint and its fix-it message; sample repo with AGENTS.md and docs in `repo/`).
- 0025 The ramp — shadow · release · keep; shadow log (my synthesis, anchored to 0019 and Anthropic’s evaluator tuning); who-looks grid; the bill and a cap; where a human stays. Written 2026-10-06. Drill only, no new code exercise. Section complete.

Reusable drill added: `assets/sort-lab.js` (case → bin → reason, data in a JSON script tag; optional `retry` hint).

Quoting: from 0024 on, paraphrase sources and link them; at most one short verbatim quote per lesson.

Node gotcha: a `.ts` entry file whose only imports are `import type` is loaded as CommonJS and top-level `await` fails. Give graders one value import (e.g. `node:process`).

## Starting point (2026-08-20)
- Used ChatGPT / Claude as a user. Has not built with LLM APIs.
- Mission mix: ship agents at work + career as AI engineer + architecture judgment (RAG vs agents vs graphs vs loops).

## Teaching constraints
- Zone of proximal development: the concept path 0001–0020 is the floor (0020 agent security reported landed 2026-10-05). Current lesson 0021: build track 1, write the tool loop by hand. No evidence yet that it was completed. 0022 called good 2026-10-05 (read; no drill result). 0023 and 0024 not reported on beyond “good work”; the learner asked for the next lesson each time. Current lesson 0025 (software factory 4, last of the section). Code exercises 0021, 0023 and 0024 all unattempted as of 2026-10-06; check `node check.ts` in each before assuming a floor. Do not add another code exercise until one of the three is done. Next: ask what they want after the section; candidates are finishing an open exercise together, build track 2, or a lesson they name. Earlier plan was build track 2 unless the learner asks for build track 2 (an allow gate between RUN and the tool, with a refused slip pasted back). Do not re-teach plugins, vibe-vs-eval, who mints the id, or two-boards as if new.
- Glossary terms are added only after demonstrated understanding — see teach skill.

## Past failure modes (do not repeat)
- **0003 too dense:** JSON receipts, wrapping-token algebra, top_p. Rewrite rule: picture then one example; park extra knobs until they ask.
- **0006 too friendly:** pizza hid that this is a build-time architecture choice (your path vs your loop), not a ChatGPT product named “agent workflow.” Rewrite rule: flowchart + two programs first; kitchen as optional example. Recorded 2026-08-22.
- **0008 first-ship too thin:** no `.lesson-art`, no extra beat on the catalog `description`. Rewrite rule: pictures + description match + appendix in the lab. Recorded 2026-08-24.

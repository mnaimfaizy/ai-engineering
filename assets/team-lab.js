(function () {
  const SCENES = {
    drift: {
      kind: "Drift — two floors",
      live: 0,
      stations: [
        { title: "Slack wiki", hint: "humans" },
        { title: "Chat paste", hint: "agents" },
        { title: "PR", hint: "surprise" },
        { title: "Lead", hint: "herds" }
      ],
      user: "Team lead: four developers, Cursor on every laptop. Align them on how we work with agents.",
      events: [
        { cls: "system", small: "humans", html: "Confluence: “Always run tests. Never push to main. Ask before migrations.” Updated last quarter." },
        { cls: "assistant", small: "agent · different text", html: "A developer’s personal prompt: “Ship fast, skip tests if the UI looks right.”" },
        { cls: "result", small: "PR", html: "<pre>git push origin main\n# hook? none. CI? skipped locally.\nmigration: DROP COLUMN unpaid</pre>" }
      ],
      cost: "You did not fail at people management. You wrote two floors. Anthropic: put in CLAUDE.md what a new teammate would need — then commit it.",
      note: "Click Guide. One briefing, in git, for humans and agents."
    },
    guide: {
      kind: "1 · Guide — the shared brief",
      live: 0,
      stations: [
        { title: "AGENTS.md", hint: "in git" },
        { title: "Human", hint: "onboarding" },
        { title: "Agent", hint: "every session" },
        { title: "Same", hint: "text" }
      ],
      user: "Same team. The lead commits AGENTS.md (or CLAUDE.md / .cursor/rules).",
      events: [
        { cls: "system", small: "repo · guide", html: "<pre># AGENTS.md\n- npm test before a PR\n- migrations need a human stamp\n- never push to main</pre>" },
        { cls: "user", small: "new hire", html: "Reads AGENTS.md on day one. Same file as the agent." },
        { cls: "assistant", small: "agent · session start", html: "Cursor/Claude already loaded it. Not a Slack paste, not a personal prompt." }
      ],
      cost: "Anthropic: project CLAUDE.md is team-shared via source control — architecture, standards, workflows; not personal taste. Cursor: check rules into git so the whole team benefits.",
      note: "A guide can be ignored. Click Guard for what cannot."
    },
    guard: {
      kind: "2 · Guard — the harness stamps",
      live: 1,
      stations: [
        { title: "Select", hint: "model writes" },
        { title: "Hook", hint: "block" },
        { title: "CI", hint: "tests" },
        { title: "Merge", hint: "human" }
      ],
      user: "Agent: “I’ll push this migration to main so we’re unblocked.”",
      events: [
        { cls: "tool", small: "slip", html: "<pre>git push origin main</pre>" },
        { cls: "system", small: "hook · block", html: "Cursor/Claude hook: deny. Agent message: push to main is blocked; open a PR." },
        { cls: "result", small: "still not merged", html: "CI must pass. CODEOWNERS + a human stamp on migrate. 12-factor: own the gap between selection and invocation — especially deploy." }
      ],
      cost: "Anthropic: if it must run at a fixed moment, a hook — not another sentence in CLAUDE.md. Guides advise. Guards execute.",
      note: "Click Job. Named helpers both a human and an agent can dispatch."
    },
    job: {
      kind: "3 · Job — shared helpers",
      live: 2,
      stations: [
        { title: "reviewer.md", hint: "in git" },
        { title: "Human", hint: "@reviewer" },
        { title: "Agent", hint: "dispatches" },
        { title: "Summary", hint: "back" }
      ],
      user: "PR is up. Same reviewer helper, two callers.",
      events: [
        { cls: "system", small: "repo · job", html: "<pre>.cursor/agents/reviewer.md\n# also .claude/agents/\nUse after a PR: tests, secrets, policy-before-Stripe.</pre>" },
        { cls: "user", small: "developer", html: "@reviewer on this diff. I still own merge." },
        { cls: "tool", small: "lead agent", html: "<pre>Agent({ type: \"reviewer\",\n  prompt: \"diff vs main; 8 lines.\" })</pre>" },
        { cls: "assistant", small: "return", html: "3 nits. No secrets. Policy node missing on refund path — same catch as lesson 0014." }
      ],
      cost: "Cursor: check `.cursor/agents/` into the repo so the team benefits. Claude Code: project sub-agents in `.claude/agents/` — same idea. Isolate · brief · return did not change (0011).",
      note: "Guide · Guard · Job. The product assistant (0014) is ops. This is how the team ships it."
    }
  };

  function bubble(cls, small, html) {
    const d = document.createElement("div");
    d.className = "bubble " + cls;
    d.innerHTML = "<small>" + small + "</small>" + html;
    return d;
  }

  function drawPath(root, stations) {
    const path = root.querySelector("[data-path]");
    if (!path) return;
    path.replaceChildren();
    stations.forEach(function (label, i) {
      if (i) {
        const arrow = document.createElement("div");
        arrow.className = "pipeline-arrow";
        arrow.innerHTML = '<i class="token-dot" aria-hidden="true"></i>';
        path.appendChild(arrow);
      }
      const step = document.createElement("div");
      step.className = "pipeline-step";
      step.innerHTML = "<strong>" + label.title + "</strong><span>" + label.hint + "</span>";
      path.appendChild(step);
    });
  }

  function live(root, index) {
    const steps = [...root.querySelectorAll(".pipeline-step")];
    steps.forEach(function (el, i) {
      el.classList.toggle("is-live", i === index);
    });
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-team-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-team-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-scene") === key ? "true" : "false");
    });
    drawPath(root, scene.stations);
    chat.replaceChildren();
    chat.appendChild(bubble("user", "user", scene.user));
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    live(root, scene.live || 0);
    if (note) note.textContent = "Playing…";

    let i = 0;
    function next() {
      if (i >= scene.events.length) {
        if (cost) cost.textContent = scene.cost;
        if (note) note.textContent = scene.note;
        return;
      }
      const ev = scene.events[i];
      chat.appendChild(bubble(ev.cls, ev.small, ev.html));
      i += 1;
      root._timer = window.setTimeout(next, 480);
    }
    root._timer = window.setTimeout(next, 360);
  }

  document.querySelectorAll("[data-team-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "drift");
  });
})();

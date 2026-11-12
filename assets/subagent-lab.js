(function () {
  const WINDOW = 40;
  const LEAD_COLORS = {
    system: "var(--accent-2)",
    dump: "var(--chip-3)",
    plan: "var(--chip-4)",
    summary: "var(--accent)",
    user: "var(--chip-1)"
  };
  const HELP_COLORS = {
    system: "var(--accent-2)",
    dump: "var(--chip-3)",
    user: "var(--chip-2)"
  };
  const SCENES = {
    solo: {
      kind: "Solo JIT",
      live: [],
      lead: { system: 4, dump: 28, user: 4 },
      help: {},
      user: "What was the stone doing last hour?",
      events: [
        {
          cls: "tool",
          small: "lead · grep",
          html: "<pre>Grep(\"temp_c\", path: \"oven/\")</pre>"
        },
        {
          cls: "result",
          small: "lead RAM · eight dumps",
          html: "<pre>oven/p1.log … 480 tokens\noven/p2.log … 480 tokens\n… p8.log …</pre>"
        },
        {
          cls: "assistant",
          small: "lead · rot",
          html: "I think 180? The probes are in the middle of my window now."
        }
      ],
      cost: "Lead 36 / 40. JIT still floods you if you do every read. That is why a helper exists.",
      note: "Same kitchen as lesson 0010. The lead walked the shelf. Anthropic: the detailed search context should stay isolated."
    },
    helper: {
      kind: "1 · Isolate",
      live: [0],
      lead: { system: 4, plan: 4, summary: 8, user: 4 },
      help: { system: 4, dump: 26, user: 2 },
      user: "What was the stone doing last hour?",
      events: [
        {
          cls: "tool",
          small: "lead · Agent slip",
          html: "<pre>Agent({ type: \"explore\",\n  prompt: \"Last eight oven probes. Return three lines.\" })</pre>"
        },
        {
          cls: "tool",
          small: "helper window · not yours",
          html: "<pre>Grep + Read × 8 → 6,100 tokens of logs</pre>"
        },
        {
          cls: "result",
          small: "lead · summary only",
          html: "<pre>Stone 180→188°C. Target 240. Do not re-probe 1–7.\n(+ metadata, ~420 tokens)</pre>"
        },
        {
          cls: "assistant",
          small: "lead · pick",
          html: "Preheat to 240. I never saw the eight dumps."
        }
      ],
      cost: "Lead 20 / 40. Helper spent 32 in its own bar. Claude Code’s picture: 6,100 read, ~420 back.",
      note: "Isolate: the helper’s RAM is a second window. Cursor’s Explore exists for the same reason — noisy search stays out of the parent."
    },
    vague: {
      kind: "2 · Vague brief",
      live: [1],
      lead: { system: 4, plan: 2, summary: 14, user: 4 },
      help: { system: 4, dump: 30, user: 2 },
      user: "What was the stone doing last hour?",
      events: [
        {
          cls: "tool",
          small: "lead · weak brief",
          html: "<pre>Agent({ prompt: \"Look into the oven.\" })</pre>"
        },
        {
          cls: "result",
          small: "helper · guessed the job",
          html: "<pre>Searched refunds/ too. Duplicated p1–p3.\nAlso a 2021 stone story. 14-line dump back.</pre>"
        },
        {
          cls: "assistant",
          small: "lead · worse than solo",
          html: "I have a long, muddy summary. Isolation without a brief is still rot — just delayed."
        }
      ],
      cost: "Lead 24 / 40, and the tokens are low-signal. Anthropic: vague briefs make helpers duplicate work or miss the task.",
      note: "The brief is the match — same job as a skill description (0008). Objective, format, bounds. Click Sharp brief."
    },
    sharp: {
      kind: "3 · Return",
      live: [1, 2],
      lead: { system: 4, plan: 6, summary: 6, user: 4 },
      help: { system: 4, dump: 22, user: 2 },
      user: "What was the stone doing last hour?",
      events: [
        {
          cls: "tool",
          small: "lead · sharp brief",
          html: "<pre>Objective: last eight probes.\nFormat: three lines (start, end, target).\nBounds: oven/ only. No refunds. No dumps.</pre>"
        },
        {
          cls: "result",
          small: "helper · distilled",
          html: "<pre>180°C → 188°C. Target 240.\nUnresolved: preheat. Files: oven/p8.log</pre>"
        },
        {
          cls: "assistant",
          small: "lead · pick",
          html: "Preheat, then walnut crumb. The helper kept the logs."
        }
      ],
      cost: "Lead 20 / 40. High-signal summary. Anthropic’s ballpark: helper may spend tens of thousands; you take 1–2k back.",
      note: "Return a note, not a transcript. A skill stays in your thread so you can steer each step. A sub-agent is when you do not want those steps in RAM."
    }
  };

  function bubble(cls, small, html) {
    const d = document.createElement("div");
    d.className = "bubble " + cls;
    d.innerHTML = "<small>" + small + "</small>" + html;
    return d;
  }

  function live(root, indexes) {
    const steps = [...root.querySelectorAll(".pipeline-step")];
    const set = new Set(indexes || []);
    steps.forEach((el, i) => el.classList.toggle("is-live", set.has(i)));
  }

  function paint(root, sel, layers, colors) {
    const used = Object.values(layers).reduce(function (a, b) { return a + b; }, 0);
    const box = root.querySelector(sel);
    if (!box) return used;
    const fill = box.querySelector("[data-meter-fill]");
    const label = box.querySelector("[data-meter-label]");
    if (fill) {
      fill.style.width = Math.min(100, (used / WINDOW) * 100) + "%";
      fill.classList.toggle("warn", used >= WINDOW * 0.7 && used <= WINDOW);
      fill.classList.toggle("fail", used > WINDOW);
    }
    if (label) {
      label.textContent = used === 0
        ? "idle — no helper this scene"
        : used + " / " + WINDOW + " slots";
    }
    box.querySelectorAll("[data-layer]").forEach(function (el) {
      const key = el.getAttribute("data-layer");
      const n = layers[key] || 0;
      el.style.flex = n <= 0 ? "0 0 0%" : ((n / WINDOW) * 100) + "%";
      el.style.background = colors[key] || "var(--ink-soft)";
      el.textContent = n > 0 ? el.getAttribute("data-name") : "";
    });
    return used;
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-sub-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-sub-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    chat.replaceChildren();
    chat.appendChild(bubble("user", "user", scene.user));
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    live(root, scene.live || []);
    paint(root, "[data-lead-box]", scene.lead, LEAD_COLORS);
    paint(root, "[data-help-box]", scene.help, HELP_COLORS);
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

  document.querySelectorAll("[data-sub-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "solo");
  });
})();

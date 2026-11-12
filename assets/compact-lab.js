(function () {
  const WINDOW = 40;
  const COLORS = {
    system: "var(--accent-2)",
    history: "var(--chip-4)",
    tools: "var(--chip-3)",
    summary: "var(--accent)",
    note: "var(--chip-2)",
    user: "var(--chip-1)"
  };
  const SCENES = {
    stuffed: {
      kind: "Uncompacted",
      live: [],
      layers: { system: 4, history: 8, tools: 26, user: 4 },
      user: "Stone still cold? Walnut crumb anyway.",
      events: [
        {
          cls: "tool",
          small: "history · ticket 1, still in RAM",
          html: "<pre>check_oven() → {\"temp_c\": 180, \"log\": \"…480 tokens of probe dump…\"}</pre>"
        },
        {
          cls: "tool",
          small: "history · ticket 7, still in RAM",
          html: "<pre>check_oven() → {\"temp_c\": 188, \"log\": \"…another 480 tokens…\"}</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · rot",
          html: "I think the stone was 180? Or 240? The dump from ticket 1 is in the middle of the window."
        }
      ],
      cost: "42 / 40 slots. Overflow — or it fits and still rot. Same failure lesson 0002 named.",
      note: "The agent loop filled RAM with tool dumps. Skills (0008) kept the SOPs off the prompt. They cannot evict last hour’s slips. That is tonight’s job."
    },
    evict: {
      kind: "1 · Evict",
      live: [0],
      layers: { system: 4, history: 8, tools: 6, user: 4 },
      user: "Stone still cold? Walnut crumb anyway.",
      events: [
        {
          cls: "system",
          small: "harness · context editing",
          html: "Oldest tool results replaced with a placeholder. The slips stay; the dumps leave."
        },
        {
          cls: "tool",
          small: "ticket 1 · evicted",
          html: "<pre>check_oven() → [cleared: old tool result]</pre>"
        },
        {
          cls: "result",
          small: "ticket 8 · still here",
          html: "<pre>check_oven() → {\"temp_c\": 188}</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Latest probe is 188°C. I no longer see the 480-token dumps from tickets 1–7."
        }
      ],
      cost: "22 / 40 slots. Anthropic’s lightest compaction: clear old tool results, keep the conversation.",
      note: "Evict = drop low-signal tokens. Once a dump has been read, the raw JSON rarely needs to stay. The harness does this, not the model."
    },
    compact: {
      kind: "2 · Compact",
      live: [1],
      layers: { system: 4, summary: 10, history: 4, user: 4 },
      user: "Stone still cold? Walnut crumb anyway.",
      events: [
        {
          cls: "system",
          small: "harness · compact",
          html: "Window near the cap. Summarize. Start the next call with the summary, not the raw log."
        },
        {
          cls: "result",
          small: "compaction block",
          html: "<pre>SUMMARY: Walnut crumb in progress. Stone was 180 then 188. Oven SOP already followed. Unresolved: stone still under 240. Last files: oven/SKILL.md, ticket-8.</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "From the summary: preheat to 240, then toast, fold, 90 seconds. I do not have ticket 1’s raw dump."
        }
      ],
      cost: "22 / 40 slots. Summary (10) + recent turns (4). Claude Code also keeps the last few files.",
      note: "Compact = high-fidelity distill, then a new window. Keep decisions and bugs; discard redundant dumps. Over-aggressive summaries lose facts whose importance shows up later."
    },
    note: {
      kind: "3 · Note",
      live: [2],
      layers: { system: 4, note: 8, user: 4 },
      user: "Morning. Where did we leave walnut crumb?",
      events: [
        {
          cls: "system",
          small: "new window · overnight reset",
          html: "The process died. Compaction in RAM died with it. NOTES.md is on disk."
        },
        {
          cls: "tool",
          small: "model · read slip",
          html: "<pre>read(\"NOTES.md\")</pre>"
        },
        {
          cls: "result",
          small: "harness · pasted the note",
          html: "<pre># Shift note\n- Walnut crumb: toast, fold, 90s.\n- Stone was 188°C; target 240.\n- Do not re-probe tickets 1–7.</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Stone to 240, then the walnut steps. I never saw last night’s 42-slot transcript."
        }
      ],
      cost: "16 / 40 slots. A new window plus one note. The transcript stayed on the shelf.",
      note: "Note-taking (agentic memory) writes outside the window and pulls back later. Compaction is a shorter RAM; a note is disk. You often want both: evict, then compact, and write a note before the reset."
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

  function paintStack(root, layers) {
    const used = Object.values(layers).reduce(function (a, b) { return a + b; }, 0);
    const fill = root.querySelector("[data-meter-fill]");
    const label = root.querySelector("[data-meter-label]");
    if (fill) {
      fill.style.width = Math.min(100, (used / WINDOW) * 100) + "%";
      fill.classList.toggle("warn", used >= WINDOW * 0.7 && used <= WINDOW);
      fill.classList.toggle("fail", used > WINDOW);
    }
    if (label) {
      label.textContent = used + " / " + WINDOW + " slots in the toy window"
        + (used > WINDOW ? " — overflow" : "");
    }
    root.querySelectorAll("[data-layer]").forEach(function (el) {
      const key = el.getAttribute("data-layer");
      const n = layers[key] || 0;
      el.style.flex = n <= 0 ? "0 0 0%" : ((n / WINDOW) * 100) + "%";
      el.style.background = COLORS[key];
      el.textContent = n > 0 ? el.getAttribute("data-name") : "";
    });
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-compact-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-compact-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    chat.replaceChildren();
    chat.appendChild(bubble("user", "user", scene.user));
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    live(root, scene.live || []);
    paintStack(root, scene.layers);
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

  document.querySelectorAll("[data-compact-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "stuffed");
  });
})();

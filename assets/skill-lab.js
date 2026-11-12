(function () {
  const WINDOW = 40;
  const COLORS = {
    system: "var(--accent-2)",
    catalog: "var(--chip-4)",
    stuffed: "var(--chip-3)",
    body: "var(--accent)",
    extra: "var(--chip-2)",
    user: "var(--chip-1)"
  };
  const SCENES = {
    stuff: {
      kind: "Stuffed prompt",
      live: [0],
      layers: { system: 4, catalog: 0, stuffed: 28, body: 0, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "system",
          small: "system · always in RAM",
          html: "<pre>Oven SOP (4p). Refund SOP (3p). Walnut crumb SOP (6p). Dough SOP (5p)…</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Toast walnuts, fold into the mix, 90 seconds. The answer was in there — so was everything else."
        }
      ],
      cost: "36 / 40 slots used before the question. Fits, barely. The walnut chapter was never the problem — the other three manuals were.",
      note: "This is a long system prompt. Anthropic’s move: do not pay that rent on every call. Put a table of contents in RAM; leave the chapters on disk."
    },
    catalog: {
      kind: "Level 1 · catalog",
      live: [0],
      layers: { system: 4, catalog: 6, stuffed: 0, body: 0, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "system",
          small: "system · name + description only",
          html: "<pre>walnut-crumb — toast walnuts, fold in. Use for the walnut special.\nrefunds — till SOP. Use when money leaves.\noven — temperatures. Use when baking.</pre>"
        },
        {
          cls: "tool",
          small: "model · writes a read slip",
          html: "<pre>read(\"walnut-crumb/SKILL.md\")</pre>"
        }
      ],
      cost: "14 / 40 slots. Three skills installed; you paid ~2 slots each for the catalog line.",
      note: "Level 1: at startup the harness pastes only name + description. The model still has no hands — loading the chapter is a tool call (lesson 0005). Click Load chapter to run that slip."
    },
    load: {
      kind: "Level 2 · chapter",
      live: [1, 2],
      layers: { system: 4, catalog: 6, stuffed: 0, body: 12, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "system",
          small: "catalog · still there",
          html: "<pre>walnut-crumb — …\nrefunds — …\noven — …</pre>"
        },
        {
          cls: "tool",
          small: "model · read slip",
          html: "<pre>read(\"walnut-crumb/SKILL.md\")</pre>"
        },
        {
          cls: "result",
          small: "harness · pasted the chapter",
          html: "<pre># Walnut crumb\n1. Toast walnuts.\n2. Fold into the mix.\n3. 90 seconds.\nSee oven/SKILL.md only if the stone is cold.</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Toast, fold, 90 seconds. Refunds and the full oven manual never entered RAM."
        }
      ],
      cost: "26 / 40 slots. Catalog (6) + one chapter (12). The other SKILL.md files stayed on disk.",
      note: "Level 2: the body of SKILL.md enters the window only after a match. Spec: ~100 tokens of metadata always. Click Appendix if the chapter points at another file."
    },
    extra: {
      kind: "Level 3 · appendix",
      live: [2],
      layers: { system: 4, catalog: 6, stuffed: 0, body: 12, extra: 8, user: 4 },
      user: "The stone is cold. Walnut crumb anyway.",
      events: [
        {
          cls: "tool",
          small: "already loaded · chapter",
          html: "<pre>…If the stone is cold, read oven/SKILL.md.</pre>"
        },
        {
          cls: "tool",
          small: "model · second read slip",
          html: "<pre>read(\"oven/SKILL.md\")</pre>"
        },
        {
          cls: "result",
          small: "harness · pasted the appendix",
          html: "<pre># Oven\nPreheat to 240°C.\nDo not guess the stone from last Tuesday.</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Stone first: 240°C, then toast, fold, 90 seconds. Refunds still never entered RAM."
        }
      ],
      cost: "34 / 40 slots. A second chapter, only because the first one pointed at it.",
      note: "Level 3: extra files load only when this chapter names them. A script in the folder can be run instead of read — then only the output enters RAM, not the source."
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
    if (label) label.textContent = used + " / " + WINDOW + " slots in the toy window";
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
    const chat = root.querySelector("[data-skill-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-skill-note]");
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

  document.querySelectorAll("[data-skill-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "stuff");
  });
})();

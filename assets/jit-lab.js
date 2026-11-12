(function () {
  const WINDOW = 40;
  const COLORS = {
    system: "var(--accent-2)",
    dump: "var(--chip-3)",
    rag: "var(--chip-4)",
    pointers: "var(--chip-2)",
    page: "var(--accent)",
    user: "var(--chip-1)"
  };
  const SCENES = {
    dump: {
      kind: "Stuffed disk",
      live: [],
      layers: { system: 4, dump: 28, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "system",
          small: "harness · dumped the shelf",
          html: "<pre>recipes/walnut.md (6p)\nrecipes/margherita.md (5p)\nrefunds/policy.md (7p)\noven/log.txt (10p)…</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · rot",
          html: "Toast walnuts… also something about refunds and Tuesday’s oven log. It was all in RAM."
        }
      ],
      cost: "36 / 40 slots. The walnut page was never the problem. The rest of the kitchen was.",
      note: "This is stuffing disk into RAM. Anthropic’s move: keep lightweight identifiers — paths, queries, links — and load a page only this turn."
    },
    rag: {
      kind: "RAG · you find, then call",
      live: [0],
      layers: { system: 4, rag: 12, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "system",
          small: "your code · find + paste (lesson 0004)",
          html: "You searched the shelf before the call. Two pages landed in the user bubble. The model never wrote a slip."
        },
        {
          cls: "user",
          small: "user · after paste",
          html: "<pre>Using only:\nwalnut.md — toast, fold, 90s.\nallergens.md — tree nuts.\nQuestion: how do we make walnut crumb?</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Toast, fold, 90 seconds. You chose the pages. The loop did not navigate."
        }
      ],
      cost: "20 / 40 slots. Fine when you already know which two pages. Stale if the index is wrong.",
      note: "RAG is pre-retrieve: your code finds, then one call. JIT is the same disk, but the agent writes glob / grep / read slips inside the loop."
    },
    pointers: {
      kind: "1 · Pointer",
      live: [0],
      layers: { system: 4, pointers: 6, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "system",
          small: "RAM · paths only",
          html: "<pre>recipes/\noven/\nrefunds/\nCLAUDE.md (always-on hybrid)</pre>"
        },
        {
          cls: "tool",
          small: "model · glob slip",
          html: "<pre>Glob(\"recipes/**\")</pre>"
        },
        {
          cls: "result",
          small: "harness · names, not pages",
          html: "<pre>recipes/walnut.md\nrecipes/margherita.md\nrecipes/dough.md</pre>"
        }
      ],
      cost: "14 / 40 slots. Folder names are already signal: recipes/ not refunds/.",
      note: "Level 1: a pointer is cheap. Anthropic: file paths, stored queries, links. Click Navigate if you still need a line inside a file. Click Load to read one page."
    },
    nav: {
      kind: "2 · Navigate",
      live: [1],
      layers: { system: 4, pointers: 6, rag: 4, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "tool",
          small: "already have · glob hits",
          html: "<pre>recipes/walnut.md\nrecipes/margherita.md\nrecipes/dough.md</pre>"
        },
        {
          cls: "tool",
          small: "model · grep slip",
          html: "<pre>Grep(\"walnut crumb\", path: \"recipes/\")</pre>"
        },
        {
          cls: "result",
          small: "harness · matching lines",
          html: "<pre>recipes/walnut.md:1: # Walnut crumb\nrecipes/walnut.md:4: Toast walnuts and fold.</pre>"
        }
      ],
      cost: "18 / 40 slots. Grep returned lines, not the whole folder. Claude Code: Glob is names; Grep is contents.",
      note: "Level 2: navigate. You still have not paid for margherita.md or oven/log.txt. Click Load to read the one hit."
    },
    load: {
      kind: "3 · Load",
      live: [2],
      layers: { system: 4, pointers: 6, page: 10, user: 4 },
      user: "Walnut crumb special — how do we make it?",
      events: [
        {
          cls: "tool",
          small: "model · read slip",
          html: "<pre>Read(\"recipes/walnut.md\")</pre>"
        },
        {
          cls: "result",
          small: "harness · pasted one page",
          html: "<pre># Walnut crumb\n1. Toast the walnuts.\n2. Fold into the mix.\n3. Ninety seconds on the stone.\nIf the stone is cold, Read oven/SKILL.md.</pre>"
        },
        {
          cls: "assistant",
          small: "assistant · pick",
          html: "Toast, fold, 90 seconds. Refunds and the oven log never entered RAM."
        }
      ],
      cost: "24 / 40 slots. One page. head/tail if the file is huge — Anthropic: do not load the full object.",
      note: "Level 3: load this turn. Still propose · run · paste (lesson 0005). A skill (0008) is a chapter you wrote. JIT is navigating a kitchen that already exists."
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
    const chat = root.querySelector("[data-jit-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-jit-note]");
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

  document.querySelectorAll("[data-jit-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "dump");
  });
})();

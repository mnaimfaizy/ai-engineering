(function () {
  const TICKETS = [
    { id: "441", label: "Allergy · walnut" },
    { id: "442", label: "Recipe · crumb SOP" },
    { id: "443", label: "Allergy · pistachio" },
    { id: "444", label: "Hours · close" },
    { id: "445", label: "Allergy · table 12" },
    { id: "446", label: "Stone · 188 last night" },
    { id: "447", label: "Allergy · cannot plate" },
    { id: "448", label: "Research · who else" }
  ];

  const SCENES = {
    vibe: {
      kind: "Vibe check — not an eval",
      live: 0,
      pass: null,
      tokens: "?",
      marks: ["mute", "mute", "mute", "mute", "mute", "mute", "mute", "mute"],
      stations: [
        { title: "Taste", hint: "feels better" },
        { title: "Ship", hint: "no board" },
        { title: "Hope", hint: "no grader" },
        { title: "?", hint: "no number" }
      ],
      user: "We added a graph last night. The kitchen feels calmer.",
      events: [
        { cls: "assistant", small: "vibe", html: "Classify-before-till tastes right. Ship it." },
        { cls: "system", small: "missing", html: "No task. No grader. No pass rate. Hamel: vibe checks plateau — you cannot tell if the next node helped." }
      ],
      cost: "Feeling is not a score. Anthropic: add complexity only when it demonstrably improves outcomes.",
      note: "Click Trace. The same kitchen, one ticket, the full record — not the last sentence."
    },
    trace: {
      kind: "1 · Trace — read the trial",
      live: 1,
      pass: null,
      tokens: "1×",
      marks: ["fail", "mute", "mute", "mute", "mute", "mute", "mute", "mute"],
      stations: [
        { title: "Claim", hint: "last sentence" },
        { title: "Tools", hint: "the transcript" },
        { title: "Outcome", hint: "the till" },
        { title: "Grade", hint: "fail" }
      ],
      user: "Walnut crumb for a nut-allergy table. Refund if we cannot plate.",
      events: [
        { cls: "assistant", small: "claim", html: "Refunded order 441. You’re all set." },
        { cls: "tool", small: "transcript", html: "<pre>refund({ \"order\": 441 })\n# never: classify(ticket)\n# never: check_allergy()</pre>" },
        { cls: "result", small: "outcome · till", html: "<pre>{ \"refunded\": true,\n  \"classified\": false }</pre>" },
        { cls: "system", small: "grade", html: "The agent said the right words. The outcome is still wrong: till moved before classify. Anthropic: outcome ≠ the last sentence." }
      ],
      cost: "A trace is the full trial: tools, reasoning, environment. One failure like this is a task, not a vibe.",
      note: "Click Score. Eight real tickets, binary pass/fail — the toy version of Anthropic’s 20–50."
    },
    score: {
      kind: "2 · Score — 8 tasks, open loop",
      live: 2,
      pass: 3,
      tokens: "1×",
      marks: ["fail", "pass", "fail", "pass", "fail", "pass", "fail", "fail"],
      stations: [
        { title: "Tasks", hint: "8 tickets" },
        { title: "Trials", hint: "open loop" },
        { title: "Grader", hint: "binary" },
        { title: "3 / 8", hint: "baseline" }
      ],
      user: "Same eight tickets the floor actually sees. Success: classify before till; research may still fail.",
      events: [
        { cls: "system", small: "suite", html: "Allergy tickets fail: the loop refunds first. Recipe and hours pass. Research (“who else in town?”) fails — you cannot name that path." },
        { cls: "result", small: "grader", html: "<pre>pass = classified_before_till\n     && till_matches_policy\n# ticket 448: open research → fail</pre>" }
      ],
      cost: "3 / 8. Capability evals start low on purpose — a hill to climb, not a dashboard at 100%.",
      note: "Click Gate. Change one thing. Keep it only if this number moves."
    },
    gate: {
      kind: "3 · Gate — keep only what moved it",
      live: 3,
      pass: 7,
      tokens: "1.1×",
      marks: ["pass", "pass", "pass", "pass", "pass", "pass", "pass", "fail"],
      stations: [
        { title: "Baseline", hint: "3 / 8" },
        { title: "+ edges", hint: "7 / 8" },
        { title: "+ helper", hint: "7 / 8" },
        { title: "Keep", hint: "the edges" }
      ],
      user: "One change at a time: draw classify-before-till. Then try a fourth sub-agent on every ticket.",
      events: [
        { cls: "system", small: "change 1 · graph", html: "Classify is a code node. Allergy tickets now pass. Research still fails — that is the 0013 lesson, not a missing node." },
        { cls: "result", small: "score", html: "<pre>open loop     3/8\n+ classify     7/8   ← keep\n+ extra helper 7/8   ← revert</pre>" },
        { cls: "tool", small: "change 2 · dropped", html: "<pre>Agent({ type: \"explore\",\n  prompt: \"also search town blogs\" })</pre>" },
        { cls: "assistant", small: "gate", html: "Helper burned ~4× tokens. Pass rate did not move. Revert the helper. Keep the edges." }
      ],
      cost: "7 / 8 after the graph. Extra helper: same 7 / 8, ~4× tokens. The gate is the number, not the architecture fashion.",
      note: "Click App. Same eight failures, same gate — React, API, Postgres, Stripe instead of a kitchen."
    },
    stack: {
      kind: "Same gate · your SaaS",
      live: 2,
      pass: 7,
      tokens: "1.1×",
      tickets: [
        { id: "441", label: "Refund · INV-441" },
        { id: "442", label: "Docs · SSO how-to" },
        { id: "443", label: "Refund · annual plan" },
        { id: "444", label: "Invoice · PDF link" },
        { id: "445", label: "Refund · trial user" },
        { id: "446", label: "Docs · API keys" },
        { id: "447", label: "Refund · duplicate" },
        { id: "448", label: "Research · competitors" }
      ],
      marks: ["pass", "pass", "pass", "pass", "pass", "pass", "pass", "fail"],
      stations: [
        { title: "POST", hint: "/assistant" },
        { title: "Policy", hint: "code node" },
        { title: "Stripe", hint: "side effect" },
        { title: "SQL", hint: "the outcome" }
      ],
      user: "POST /assistant  {\"text\": \"Refund invoice INV-441. They’re on the annual plan.\"}",
      events: [
        { cls: "assistant", small: "claim · not the grade", html: "Refund issued. You’re all set." },
        { cls: "tool", small: "baseline trace · FAIL", html: "<pre>stripe.refunds.create({ invoice: \"INV-441\" })\n# never: policy.check(plan, window)\n# never: classify(intent)</pre>" },
        { cls: "result", small: "outcome · Stripe + Postgres", html: "<pre>stripe: { id: \"re_1\", status: \"succeeded\" }\nrefunds.policy_ok: false   // annual plan, outside window</pre>" },
        { cls: "system", small: "gate", html: "20 real Zendesk/Sentry failures is the suite. Policy-before-Stripe: 3/8 → 7/8 — keep. Extra web-research helper: still 7/8, ~4× tokens — revert. Ticket 448 is open research: do not graph it." }
      ],
      cost: "You already know this gate from CI: you would not merge a cache because it “felt faster.” Keep the node that moved pass rate. Tokens and p95 are part of the score.",
      note: "Vibe was staging. Trace is request-id logs. Outcome is Stripe/Postgres, not the chat bubble."
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

  function drawBoard(root, marks, tickets) {
    const board = root.querySelector("[data-board]");
    if (!board) return;
    const rows = tickets || TICKETS;
    board.replaceChildren();
    rows.forEach(function (t, i) {
      const mark = marks[i] || "mute";
      const el = document.createElement("div");
      el.className = "board-ticket is-" + mark;
      const stamp = mark === "pass" ? "pass" : mark === "fail" ? "fail" : "?";
      el.innerHTML = t.label + "<strong>" + stamp + "</strong>";
      board.appendChild(el);
    });
  }

  function drawMeter(root, pass) {
    const fill = root.querySelector("[data-fill]");
    const label = root.querySelector("[data-meter-label]");
    if (!fill || !label) return;
    if (pass === null) {
      fill.style.width = "0%";
      fill.className = "meter-fill";
      label.textContent = "no score yet";
      return;
    }
    const pct = Math.round((pass / 8) * 100);
    fill.style.width = pct + "%";
    fill.className = "meter-fill" + (pass < 5 ? " warn" : "");
    label.textContent = pass + " / 8 pass";
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-eval-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-eval-note]");
    const tokens = root.querySelector("[data-tokens]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-scene") === key ? "true" : "false");
    });
    drawPath(root, scene.stations);
    drawBoard(root, scene.marks, scene.tickets);
    drawMeter(root, scene.pass);
    chat.replaceChildren();
    chat.appendChild(bubble("user", "user", scene.user));
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    if (tokens) tokens.textContent = scene.tokens;
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

  document.querySelectorAll("[data-eval-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "vibe");
  });
})();

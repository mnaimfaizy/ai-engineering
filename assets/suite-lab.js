(function () {
  const REG = [
    { id: "441", label: "INV-441 · policy" },
    { id: "ann", label: "Annual · refuse" },
    { id: "sso", label: "Docs · SSO" },
    { id: "dup", label: "Duplicate · none" }
  ];
  const CAP_HILL = [
    { id: "882", label: "INV-882 · tax" },
    { id: "901", label: "Chargeback" },
    { id: "910", label: "EUR invoice" },
    { id: "ton", label: "Tone · deny" }
  ];
  const CAP_AFTER = [
    { id: "901", label: "Chargeback" },
    { id: "910", label: "EUR invoice" },
    { id: "ton", label: "Tone · deny" }
  ];
  const REG_AFTER = REG.concat([{ id: "882", label: "INV-882 · tax" }]);

  const MIXED = [
    { id: "441", label: "INV-441" },
    { id: "ann", label: "Annual" },
    { id: "sso", label: "SSO docs" },
    { id: "dup", label: "Duplicate" },
    { id: "882", label: "INV-882" },
    { id: "901", label: "Chargeback" },
    { id: "910", label: "EUR" },
    { id: "ton", label: "Tone" }
  ];

  const SCENES = {
    mixed: {
      kind: "One board — not a suite",
      live: 0,
      split: false,
      tickets: MIXED,
      marks: ["pass", "pass", "pass", "pass", "fail", "fail", "fail", "fail"],
      cap: null,
      reg: null,
      stations: [
        { title: "One list", hint: "8 tickets" },
        { title: "Score", hint: "4 / 8" },
        { title: "Ship?", hint: "maybe" },
        { title: "Pager", hint: "INV-882" }
      ],
      user: "Lead: the 0014 suite is 4/8. Is that a fire, or a hill? One number cannot say.",
      events: [
        { cls: "result", small: "mixed", html: "<pre>INV-441 policy     PASS\nannual refuse      PASS\nSSO / duplicate    PASS\nINV-882 tax        FAIL\nchargeback / EUR   FAIL\ntone after deny    FAIL\n4/8 — but which fours?</pre>" },
        { cls: "system", small: "Anthropic", html: "A suite is a collection of tasks that share a goal. Capability asks what it can do. Regression asks whether it still does what it used to. Mixing them hides both answers." }
      ],
      cost: "4/8 on one board is not a production suite. You cannot tell a drop on last year’s refunds from a new tax case you never claimed to handle.",
      note: "Click Split. Two boards, two questions."
    },
    split: {
      kind: "1 · Split — hill vs floor",
      live: 1,
      split: true,
      cap: { tickets: CAP_HILL, marks: ["fail", "fail", "fail", "fail"] },
      reg: { tickets: REG, marks: ["pass", "pass", "pass", "pass"] },
      stations: [
        { title: "Capability", hint: "0 / 4 hill" },
        { title: "Regression", hint: "4 / 4 floor" },
        { title: "CI", hint: "floor only" },
        { title: "Nightly", hint: "the hill" }
      ],
      user: "Same eight tickets. Two questions.",
      events: [
        { cls: "system", small: "capability", html: "What can this agent do well? Start at a low pass rate. INV-882 remaining-months + tax is the hill. A 0/4 is a feature of the board, not a fire." },
        { cls: "system", small: "regression", html: "Does it still handle the tasks it used to? Near 100%. INV-441 policy-before-Stripe, annual refuse, SSO, no duplicate. A drop is a fire." }
      ],
      cost: "Anthropic: after launch, capability tasks with high pass rates graduate into a regression suite run continuously. Two boards, one POST /assistant.",
      note: "Click Sample. A 0018 production tree becomes a new hill ticket."
    },
    sample: {
      kind: "2 · Sample — a live tree",
      live: 0,
      split: true,
      cap: { tickets: CAP_HILL, marks: ["fail", "fail", "fail", "fail"] },
      reg: { tickets: REG, marks: ["pass", "pass", "pass", "pass"] },
      stations: [
        { title: "Pager", hint: "INV-882" },
        { title: "Open", hint: "trace id" },
        { title: "Task", hint: "pass rule" },
        { title: "Hill", hint: "new ticket" }
      ],
      user: "Pager: “Chat said remaining months credited. Stripe shows a full refund.” Open trace 7c21…",
      events: [
        { cls: "result", small: "0018 tree", html: "<pre>trace_id = 7c21…\nHTTP → invoke_agent → chat → execute_tool\nstripe.refunds.create  amount=full\nrefunds.policy_ok = true   # wrong amount\nGRADE vs pass rule: FAIL</pre>" },
        { cls: "system", small: "Hamel + OpenAI", html: "Error analysis is reading this tree. Log production so you can mine it. The pass rule is unambiguous: remaining months + tax, not a full refund. That object is now a capability task — not a vibe." }
      ],
      cost: "Hamel: production sampling feeds CI. When a live tree fails, add the representative case to the hill. The id from 0018 is how you find it.",
      note: "Click Graduate. When INV-882 stays green, it becomes the floor."
    },
    graduate: {
      kind: "3 · Graduate — hill becomes floor",
      live: 3,
      split: true,
      cap: { tickets: CAP_AFTER, marks: ["fail", "fail", "fail"] },
      reg: { tickets: REG_AFTER, marks: ["pass", "pass", "pass", "pass", "pass"] },
      stations: [
        { title: "Fix", hint: "prorate node" },
        { title: "Hill", hint: "INV-882 PASS" },
        { title: "Move", hint: "to CI" },
        { title: "Hill again", hint: "0 / 3" }
      ],
      user: "Three weeks of nightly: INV-882 pass. Chargeback / EUR / tone still fail.",
      events: [
        { cls: "tool", small: "gate from 0014", html: "<pre>+ prorate-before-stripe   INV-882 PASS\nchargeback / EUR / tone  still FAIL\nkeep the prorate node</pre>" },
        { cls: "result", small: "graduate", html: "<pre>regression  5/5  (INV-882 joined CI)\ncapability  0/3  (still a hill)\n# 100% on the old hill is saturation — no signal left there</pre>" }
      ],
      cost: "Anthropic: tasks that measured “can we do this at all?” then measure “can we still do this reliably?” Monitor saturation: a board at 100% is a floor, not a hill.",
      note: "Click Judge. Stripe gets a code grader. Tone does not — until you calibrate."
    },
    judge: {
      kind: "4 · Calibrate — code, then a judge",
      live: 0,
      split: true,
      cap: { tickets: CAP_AFTER, marks: ["fail", "fail", "fail"] },
      reg: { tickets: REG_AFTER, marks: ["pass", "pass", "pass", "pass", "pass"] },
      stations: [
        { title: "Code", hint: "SQL + Stripe" },
        { title: "Raw LLM", hint: "uncalibrated" },
        { title: "Labels", hint: "~50 traces" },
        { title: "TPR/TNR", hint: "held-out" }
      ],
      user: "Tone-after-deny has no Stripe row. Someone ships “GPT as judge.”",
      events: [
        { cls: "assistant", small: "uncalibrated", html: "Judge: PASS. The reply said “I’m sorry.”" },
        { cls: "result", small: "world", html: "<pre>promised a workaround that does not exist\nhuman SME: FAIL\n# Anthropic: model graders need calibration with humans</pre>" },
        { cls: "system", small: "Hamel", html: "An LLM-as-judge is a classifier. Label ~50 real traces, binary pass/fail. Measure TPR and TNR on a held-out set. CI prefers code assertions; production sampling may need a judge — only after that check." }
      ],
      cost: "Code grades INV-441 and INV-882 (refunds.policy_ok, stripe amount). Tone waits for labels. A dashboard with no TPR/TNR is 0014’s vibe check in a new coat.",
      note: "Split · sample · graduate · calibrate. Agent security waits."
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

  function fillBoard(el, tickets, marks) {
    if (!el) return;
    el.replaceChildren();
    tickets.forEach(function (t, i) {
      const mark = marks[i] || "mute";
      const card = document.createElement("div");
      card.className = "board-ticket is-" + mark;
      const stamp = mark === "pass" ? "pass" : mark === "fail" ? "fail" : "?";
      card.innerHTML = t.label + "<strong>" + stamp + "</strong>";
      el.appendChild(card);
    });
  }

  function scoreOf(marks) {
    const n = marks.length;
    const p = marks.filter(function (m) { return m === "pass"; }).length;
    return p + " / " + n;
  }

  function drawBoards(root, scene) {
    const pair = root.querySelector("[data-pair]");
    const single = root.querySelector("[data-board]");
    const capEl = root.querySelector("[data-cap-board]");
    const regEl = root.querySelector("[data-reg-board]");
    const capScore = root.querySelector("[data-cap-score]");
    const regScore = root.querySelector("[data-reg-score]");
    if (scene.split) {
      if (pair) pair.hidden = false;
      if (single) single.hidden = true;
      fillBoard(capEl, scene.cap.tickets, scene.cap.marks);
      fillBoard(regEl, scene.reg.tickets, scene.reg.marks);
      if (capScore) capScore.textContent = scoreOf(scene.cap.marks) + " pass";
      if (regScore) regScore.textContent = scoreOf(scene.reg.marks) + " pass";
    } else {
      if (pair) pair.hidden = true;
      if (single) {
        single.hidden = false;
        fillBoard(single, scene.tickets, scene.marks);
      }
    }
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-suite-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-suite-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-scene") === key ? "true" : "false");
    });
    drawPath(root, scene.stations);
    drawBoards(root, scene);
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

  document.querySelectorAll("[data-suite-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "mixed");
  });
})();

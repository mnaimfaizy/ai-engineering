(function () {
  const SCENES = {
    logs: {
      kind: "Unjoined logs — not a trace",
      live: 0,
      stations: [
        { title: "API log", hint: "req?" },
        { title: "LLM log", hint: "other id" },
        { title: "Stripe", hint: "no join" },
        { title: "?", hint: "vibe" }
      ],
      user: "Pager: “Refunded in chat, annual-plan ticket furious.” Three log lines, three ids.",
      events: [
        { cls: "result", small: "api", html: "<pre>POST /assistant  request_id=a1\n200  1.8s</pre>" },
        { cls: "assistant", small: "model log", html: "<pre>session=z9  “Refund issued. You’re all set.”</pre>" },
        { cls: "tool", small: "stripe", html: "<pre>re_1 succeeded  invoice=INV-441\n# no request_id</pre>" }
      ],
      cost: "OpenTelemetry: a trace is the path of a request. Three files with three ids are structured logs, not a path. You cannot see cause.",
      note: "Click Origin. Who mints the id — not the model."
    },
    origin: {
      kind: "0 · Origin — who mints it",
      live: 0,
      stations: [
        { title: "Browser", hint: "no id" },
        { title: "API", hint: "SDK mints" },
        { title: "Context", hint: "RAM bag" },
        { title: "You", hint: "stamp out" }
      ],
      user: "POST /assistant  {\"text\": \"Refund INV-441. Annual plan.\"}  // no traceparent header",
      events: [
        { cls: "system", small: "mint", html: "First hop with no incoming W3C <code>traceparent</code>: the OpenTelemetry SDK (HTTP middleware you turned on) generates a random 128-bit trace_id and starts the root span. If a gateway already sent traceparent, you extract that id instead of minting." },
        { cls: "system", small: "not the model", html: "The agent does not invent this. It does not “know” unless your harness reads Context. Auto-instrumented HTTP/DB clients inherit the bag. Stripe does not — your tool code copies the id into metadata." },
        { cls: "result", small: "where it lives", html: "<pre>during the request: Context in process RAM\nafter: spans exported to your backend\nalso: refunds.request_id, stripe.metadata  ← you write these</pre>" }
      ],
      cost: "OTel: context is the object that lets two units of work correlate. Propagate = inject on the way out, extract on the way in. A background thread with no bag starts a new (wrong) trace.",
      note: "Click Correlate. Same id on Stripe and SQL because you stamped it."
    },
    correlate: {
      kind: "1 · Correlate — one id",
      live: 0,
      stations: [
        { title: "HTTP", hint: "root" },
        { title: "Agent", hint: "same id" },
        { title: "Tool", hint: "same id" },
        { title: "SQL", hint: "same id" }
      ],
      user: "POST /assistant  {\"text\": \"Refund INV-441. Annual plan.\"}",
      events: [
        { cls: "system", small: "propagate", html: "Root span is the HTTP request. Child work carries the same trace_id (W3C traceparent). Stripe metadata.request_id = that id. Postgres refunds.request_id too." },
        { cls: "result", small: "joined", html: "<pre>trace_id = 5b8aa5a2…\nHTTP → invoke_agent → execute_tool\nstripe.metadata = 5b8aa5a2…\nrefunds.request_id = 5b8aa5a2…</pre>" }
      ],
      cost: "That is 0014’s transcript in the wild: one trial you can open. Anthropic still: outcome is the row, not the last sentence.",
      note: "Click Spans. Nest the units of work."
    },
    spans: {
      kind: "2 · Span — units of work",
      live: 1,
      stations: [
        { title: "HTTP", hint: "root" },
        { title: "invoke_agent", hint: "loop" },
        { title: "chat", hint: "model" },
        { title: "execute_tool", hint: "Stripe" }
      ],
      user: "Same request. Now the tree.",
      events: [
        { cls: "system", small: "OTel", html: "A span is a unit of work with a parent. GenAI names (still evolving): invoke_agent, chat, execute_tool. You do not need a vendor APM to have a tree." },
        { cls: "tool", small: "this ticket", html: "<pre>HTTP POST /assistant\n  invoke_agent billing\n    chat  (finish=tool_calls)\n    execute_tool stripe.refunds.create  ERROR\n  # policy_ok never true — hook denied</pre>" }
      ],
      cost: "Tokens and latency live on the chat span. The Guard is visible as a denied tool span. Park: dumping full prompts in prod by default — opt-in debug.",
      note: "Click Read. Open the tree, then grade Stripe."
    },
    read: {
      kind: "3 · Read — then grade",
      live: 2,
      stations: [
        { title: "Open", hint: "tree" },
        { title: "Claim", hint: "chat" },
        { title: "Tool", hint: "denied" },
        { title: "Grade", hint: "SQL" }
      ],
      user: "On-call: open trace 5b8aa5a2…",
      events: [
        { cls: "assistant", small: "claim", html: "Refund issued. You’re all set." },
        { cls: "tool", small: "span", html: "<pre>execute_tool stripe.refunds.create\nstatus=ERROR  hook: policy_ok=false</pre>" },
        { cls: "result", small: "outcome", html: "<pre>refunds.policy_ok = false\nstripe: no new refund id\nGRADE: FAIL  (said done; world did not)</pre>" },
        { cls: "system", small: "Hamel + 0014", html: "Error analysis is reading this tree. A production eval suite (next lesson) samples these traces. Tonight you only need to be able to open one." }
      ],
      cost: "Developer: put trace_id on every side effect. Lead: the on-call runbook is “open the id,” not “ask who felt it was fine.”",
      note: "Correlate · span · read. Next: two boards over these trees (0019). Agent security waits."
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
    const chat = root.querySelector("[data-trace-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-trace-note]");
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

  document.querySelectorAll("[data-trace-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "logs");
  });
})();

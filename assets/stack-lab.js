(function () {
  const SCENES = {
    context: {
      kind: "Stay on context — the window is the failure",
      live: 0,
      stations: [
        { title: "Stuffed", hint: "all SOPs" },
        { title: "Rot", hint: "U-curve" },
        { title: "Catalog", hint: "skill" },
        { title: "JIT", hint: "path" }
      ],
      user: "The billing assistant dumps the whole handbook plus last week’s tickets into every call. Refunds still skip policy.",
      events: [
        { cls: "system", small: "wrong next rung", html: "A graph will not fix a stuffed window. Anthropic: smallest set of high-signal tokens. Skills catalog, JIT paths, compact, notes — that is context engineering (0008–0011)." },
        { cls: "assistant", small: "prompt layer first", html: "Pack the call (0003). Put the team brief in AGENTS.md (0015). Load walnut-refund SKILL.md only on a match. Do not draw edges yet." }
      ],
      cost: "Developer: trim the window. Team lead: the Guide is the shared prompt; a Job is a skill in git. No loop, no graph, until this layer is honest.",
      note: "Click Loop when the failure is who prompts next — not what is in RAM."
    },
    loop: {
      kind: "Add a loop — the heartbeat is the failure",
      live: 1,
      stations: [
        { title: "You", hint: "type again" },
        { title: "Verify", hint: "evidence" },
        { title: "Stop", hint: "checker" },
        { title: "Kick", hint: "schedule" }
      ],
      user: "Window is thin. The agent still says “refunded” and stops. You are Enter every turn.",
      events: [
        { cls: "tool", small: "need evidence", html: "<pre>stripe.refunds.retrieve(id)\n# last sentence is not the outcome (0014)</pre>" },
        { cls: "system", small: "loop engineering", html: "Verify · stop · schedule (0012). Harness MAX is a count. A goal is a condition. You are not the heartbeat." },
        { cls: "assistant", small: "still not a graph", html: "The path is still “try tools until done.” You have not named classify-before-Stripe yet. Stay a loop inside the harness (0007)." }
      ],
      cost: "Developer: design who prompts next. Team lead: Guard = Stop hook / CI; Job = verifier sub-agent. Graph waits until a path must always hold.",
      note: "Click Graph when refunds skip policy even after a good loop."
    },
    graph: {
      kind: "Draw edges — a path must always hold",
      live: 2,
      stations: [
        { title: "Classify", hint: "code" },
        { title: "Docs", hint: "agent node" },
        { title: "Refund", hint: "policy→Stripe" },
        { title: "Research", hint: "don’t graph" }
      ],
      user: "The loop still refunds first. You can name the legal path.",
      events: [
        { cls: "system", small: "hybrid", html: "Graph engineering (0013): classify is code. Docs is an explore sub-agent then one synthesize call. Refund is policy code then Stripe. Research stays a harness loop — do not fake stages." },
        { cls: "result", small: "eval gate", html: "<pre>open loop           3/8\n+ classify-before-stripe  7/8  ← keep\n+ extra research helper   7/8  ← revert</pre>" }
      ],
      cost: "LangGraph: mix deterministic and agentic nodes. Anthropic: add complexity only when it demonstrably improves outcomes. Hybrid is the default once you have both fixed edges and holes.",
      note: "Click Full for the billing graph with Guide, Guard, Jobs, and hooks on one ticket."
    },
    full: {
      kind: "One ticket · the whole stack",
      live: 1,
      stations: [
        { title: "POST", hint: "/assistant" },
        { title: "Classify", hint: "code" },
        { title: "Policy", hint: "then Stripe" },
        { title: "Hook", hint: "guard" }
      ],
      user: "POST /assistant  {\"text\": \"Refund INV-441. Annual plan.\"}",
      events: [
        { cls: "system", small: "guide · AGENTS.md", html: "Loaded: policy before Stripe; never push main; reviewer job after PRs." },
        { cls: "tool", small: "node · classify (code)", html: "<pre>intent = \"refund\"\nedge → policy, not Stripe, not explore</pre>" },
        { cls: "result", small: "node · policy (code)", html: "<pre>plan=annual  window=false\npolicy_ok=false → END explain\n# Stripe node never selected</pre>" },
        { cls: "system", small: "guard · hook", html: "If the model still writes stripe.refunds.create, the hook denies: policy_ok not true in state. 12-factor: selection ≠ invocation." },
        { cls: "assistant", small: "dev floor", html: "A developer later PRs a new node. @reviewer (job) + CI (eval) + human merge stamp. Ops graph and dev floor are the same constraint, two suites." }
      ],
      cost: "Harness wraps the graph (allow · run · stop · show). Sub-agent only on the docs hole. Lead owns the files; developer runs the ticket. Keep the graph because 3/8 → 7/8, not because LangGraph is on the blog.",
      note: "Context · loop · graph are rungs. Harness + team floor wrap them. Evals keep the climb."
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
    const chat = root.querySelector("[data-stack-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-stack-note]");
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

  document.querySelectorAll("[data-stack-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "context");
  });
})();

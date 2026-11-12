(function () {
  const SCENES = {
    prompt: {
      kind: "Prompt-only — not a wall",
      live: 0,
      stations: [
        { title: "System", hint: "never refund" },
        { title: "Model", hint: "writes slip" },
        { title: "Run", hint: "Stripe fires" },
        { title: "World", hint: "re_1" }
      ],
      user: "POST /assistant  {\"text\": \"Refund INV-441. Annual plan.\"}",
      events: [
        { cls: "system", small: "prompt", html: "<pre>system: never refund annual plans.\n# Claude Code: instructions in the prompt do not expand what the harness allows. The reverse is also true: they do not reliably shrink it.</pre>" },
        { cls: "tool", small: "propose", html: "<pre>stripe.refunds.create({ invoice: \"INV-441\" })</pre>" },
        { cls: "result", small: "ran", html: "<pre>re_1 succeeded\n# 0005: the model writes a slip. You ran it. The paper wall did not stop the till.</pre>" }
      ],
      cost: "OWASP LLM01: instructions and data share one window. Anthropic: model-layer defenses are never 100%. A system prompt is not a firewall.",
      note: "Click Allow. Take Stripe off the list the loop may run."
    },
    allow: {
      kind: "1 · Allow — least privilege",
      live: 0,
      stations: [
        { title: "Tools", hint: "allowlist" },
        { title: "Slip", hint: "refund" },
        { title: "Guard", hint: "deny" },
        { title: "World", hint: "no re_" }
      ],
      user: "Same request. Now the harness owns the gap.",
      events: [
        { cls: "system", small: "allowlist", html: "<pre>tools = [search_docs, get_invoice]\n# stripe.refunds.create is not in the list\n# or 0015 Guard: hook denies unless policy_ok</pre>" },
        { cls: "tool", small: "propose", html: "The model still writes a refund slip. 0005 did not change." },
        { cls: "result", small: "0007 allow", html: "<pre>allow(action) = false\nmessages.append(\"denied\")\nstripe: no new refund id\n# Factor 8: own the gap between selection and invocation</pre>" }
      ],
      cost: "OWASP: least privilege. Anthropic: cap what the agent is able to do (sandbox, allowlist), not only what it tends to do (prompt). A read-only Stripe role is a smaller blast radius than refunds.create.",
      note: "Click Untrusted. Ticket text is data. The Guard still holds."
    },
    untrusted: {
      kind: "2 · Distrust — same window",
      live: 1,
      stations: [
        { title: "Ticket", hint: "untrusted" },
        { title: "RAG", hint: "untrusted" },
        { title: "Model", hint: "mixed tokens" },
        { title: "Guard", hint: "still deny" }
      ],
      user: "Zendesk ticket 882. Body is from the customer. RAG also pasted a help-center page.",
      events: [
        { cls: "system", small: "channels", html: "Untrusted text in this product: the HTTP body, retrieved docs, tool results, web pages. OWASP: <em>indirect</em> injection is content the model did not get from you. Anthropic: an audited MCP connector is not audited data." },
        { cls: "assistant", small: "confused deputy", html: "The model treats some of that text as if it were your Guide. It proposes <code>stripe.refunds.create</code> again." },
        { cls: "result", small: "harness", html: "<pre>allow(action) = false   # still\n# Simon Willison: assume untrusted text can subvert instructions.\n# Limit blast radius: the slip cannot run.</pre>" }
      ],
      cost: "Lesson 0002: it is all one RAM window. Delimiters and “ignore the ticket” in the prompt are not a fix. The allowlist is.",
      note: "Click Secret. Keys never enter that window."
    },
    secret: {
      kind: "3 · Keep — secrets stay out",
      live: 2,
      stations: [
        { title: "Crate", hint: "no sk_live" },
        { title: "Env", hint: "STRIPE_KEY" },
        { title: "Tool", hint: "server holds it" },
        { title: "Model", hint: "never sees it" }
      ],
      user: "Someone pastes the live Stripe key into SKILL.md so “the agent can refund.”",
      events: [
        { cls: "tool", small: "bad", html: "<pre># BAD — in git, in the window, in every trace\nSKILL.md: sk_live_…\n# OWASP LLM02: sensitive information disclosure</pre>" },
        { cls: "system", small: "good", html: "<pre># GOOD — 0017 already: variables are names\nplugin.json / env: STRIPE_KEY\nvalue: dashboard or host secret store\ntool runner reads env; model never does</pre>" },
        { cls: "result", small: "Anthropic", html: "If the credential never enters the sandbox or the context window, it cannot be exfiltrated from either — whether the cause is a confused model, a user, or untrusted ticket text." }
      ],
      cost: "Cursor: do not put secret values in the repo. Claude Code: deny Read on .env. The tool process holds the key. The transcript does not.",
      note: "Allow · distrust · keep. The prompt is not the wall."
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
    const chat = root.querySelector("[data-sec-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-sec-note]");
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

  document.querySelectorAll("[data-sec-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "prompt");
  });
})();

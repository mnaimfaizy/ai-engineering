(function () {
  const SCENES = {
    folder: {
      kind: "You already have the floor",
      live: 0,
      stations: [
        { title: "Guide", hint: "AGENTS.md" },
        { title: "Guard", hint: "hooks" },
        { title: "Job", hint: "skill" },
        { title: "MCP", hint: "plug" }
      ],
      user: "Team lead: four laptops, one billing repo. The floor is in git (0015).",
      events: [
        { cls: "system", small: "not a plugin yet", html: "Skills, hooks, reviewer.md, mcp.json already exist. Lesson 0008: a plugin store is how a folder *arrives*. Tonight is that crate." },
        { cls: "assistant", small: "copy-paste fails", html: "Slacking a zip of SKILL.md to each hire is two floors again. You need a bundle with a manifest." }
      ],
      cost: "A plugin is not a new intelligence. It is distribution for files you already named.",
      note: "Click Bundle. Manifest + the same folders."
    },
    bundle: {
      kind: "1 · Bundle — the crate",
      live: 0,
      stations: [
        { title: "manifest", hint: "plugin.json" },
        { title: "skills/", hint: "chapters" },
        { title: "mcp.json", hint: "tools" },
        { title: "hooks?", hint: "Cursor extra" }
      ],
      user: "Package the billing floor so another team can install it.",
      events: [
        { cls: "system", small: "Agent Plugin · portable", html: "<pre>my-plugin/\n  plugin.json     # $schema agent-plugins.org\n  skills/refund-policy/SKILL.md\n  mcp.json</pre>" },
        { cls: "system", small: "Cursor Plugin · extras", html: "<pre>my-plugin/\n  .cursor-plugin/plugin.json\n  rules/  skills/  agents/\n  hooks/hooks.json  mcp.json</pre>" },
        { cls: "assistant", small: "choose the box", html: "Portable skills+MCP → Agent Plugins. Need rules, agents, hooks, variables → Cursor Plugin. Cursor: spec-conformant Agent Plugins load without changes." }
      ],
      cost: "Same SOPs as 0008/0015. The new file is the manifest. Secrets stay out: variables declare names, not tokens.",
      note: "Click Arrive. Install is how the crate lands."
    },
    arrive: {
      kind: "2 · Arrive — install",
      live: 1,
      stations: [
        { title: "Customize", hint: "or git" },
        { title: "Scope", hint: "user/project" },
        { title: "Team", hint: "marketplace" },
        { title: "On disk", hint: "now load" }
      ],
      user: "A developer opens the billing repo on a new laptop.",
      events: [
        { cls: "system", small: "install", html: "Customize → Install → project or user. Team marketplace: Default Off / Default On / Required. Local test: ~/.cursor/plugins/local." },
        { cls: "result", small: "after", html: "Skills catalog in RAM. Hooks can block Stripe. MCP tools appear. The graph in the app did not change — only how the floor got onto this machine." }
      ],
      cost: "Developer: install at project scope for this repo. Lead: Required only for Guard you cannot let people opt out of.",
      note: "Click Trust. A crate from Slack is not a marketplace review."
    },
    trust: {
      kind: "3 · Trust — then still the floor",
      live: 2,
      stations: [
        { title: "Review", hint: "marketplace" },
        { title: "Install", hint: "git" },
        { title: "Guard", hint: "still on" },
        { title: "Eval", hint: "still on" }
      ],
      user: "Someone drops billing-plugin.zip in Slack. “Trust me.”",
      events: [
        { cls: "system", small: "Cursor", html: "Official marketplace plugins are open source and manually reviewed; updates are re-reviewed. A random zip is not that." },
        { cls: "tool", small: "still Guard", html: "<pre>on stripe.refunds.create:\n  deny unless policy_ok\n# installing a plugin does not retire the hook</pre>" },
        { cls: "assistant", small: "0014 + 0015", html: "You still measure. You still stamp merge. A plugin that only restates AGENTS.md without MCP or hooks is a renamed Guide — escalate on the symptom, don’t crate it." }
      ],
      cost: "Arrive ≠ trust ≠ replace the floor. Advanced starts here: distribution. Observability, prod evals, injection — later rungs.",
      note: "Bundle · arrive · trust. The machines inside did not change."
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
    const chat = root.querySelector("[data-plugin-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-plugin-note]");
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

  document.querySelectorAll("[data-plugin-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "folder");
  });
})();

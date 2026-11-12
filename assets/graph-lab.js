(function () {
  const SCENES = {
    hope: {
      kind: "Open loop — hope",
      live: 0,
      user: "Walnut crumb for a nut-allergy table, then refund if we cannot plate.",
      stations: [
        { title: "?", hint: "model picks" },
        { title: "?", hint: "model picks" },
        { title: "?", hint: "model picks" },
        { title: "Stop", hint: "or MAX" }
      ],
      events: [
        { cls: "tool", small: "model · first slip", html: "<pre>refund({ \"order\": 441 })</pre>" },
        { cls: "result", small: "till moved", html: "<pre>{ \"ok\": true, \"cents\": 2400 }</pre>" },
        { cls: "assistant", small: "too late", html: "Refunded. I never classified the allergy or checked the recipe." }
      ],
      cost: "The loop hoped. You needed classify-before-till. That path was in your head, not in the program.",
      note: "Lesson 0006’s agent: the model picks the next tool. Fine when the path is unknown. Tonight it skipped the edge you care about."
    },
    graph: {
      kind: "1 · Edges you drew",
      live: 0,
      user: "Walnut crumb for a nut-allergy table, then refund if we cannot plate.",
      stations: [
        { title: "Classify", hint: "code" },
        { title: "Allergy?", hint: "edge" },
        { title: "Refund", hint: "code + stamp" },
        { title: "END", hint: "no till skip" }
      ],
      events: [
        { cls: "system", small: "node · classify (code)", html: "Ticket tagged allergy. Edge: cannot plate walnut crumb → refund station. The model does not pick refund first." },
        { cls: "tool", small: "node · refund", html: "<pre>refund({ \"order\": 441 })</pre>" },
        { cls: "system", small: "harness · allow", html: "Stamp still required (lesson 0007). The graph only decided which node runs." },
        { cls: "assistant", small: "synthesize", html: "Cannot plate for nut allergy. Refund after your stamp." }
      ],
      cost: "You encoded the valid path. Classify always before till. LangGraph: edges are what happens next.",
      note: "A graph is a state machine: nodes do work, edges transition, state is the ticket. Click Mix to put an agent inside a node."
    },
    mix: {
      kind: "2 · Mix node types",
      live: 1,
      user: "How do we make walnut crumb? Stone was 188 last night.",
      stations: [
        { title: "Classify", hint: "code" },
        { title: "Explore", hint: "agent node" },
        { title: "Synthesize", hint: "one LLM call" },
        { title: "END", hint: "ticket out" }
      ],
      events: [
        { cls: "system", small: "node · code", html: "Class: recipe question. Edge → explore, not refund." },
        { cls: "tool", small: "node · agent (0011)", html: "<pre>Agent({ type: \"explore\",\n  prompt: \"walnut crumb SOP; three lines.\" })</pre>" },
        { cls: "result", small: "summary back", html: "<pre>Toast, fold, 90s. Stone target 240.</pre>" },
        { cls: "assistant", small: "node · single LLM call", html: "Toast, fold, 90 seconds after 240°C. The greps stayed in the helper’s window." }
      ],
      cost: "Three node kinds on one ticket: code, a whole agent, one LLM call. Runkle & Chase: that mix is the point.",
      note: "A node can be deterministic code, a single call, or a full agent loop. You chose where the model is allowed to wander."
    },
    research: {
      kind: "3 · Do not graph this",
      live: 2,
      user: "Who else in town does a walnut crumb, and should we copy them?",
      stations: [
        { title: "Plan?", hint: "unknown" },
        { title: "Search?", hint: "unknown" },
        { title: "Read?", hint: "unknown" },
        { title: "Harness", hint: "leave it a loop" }
      ],
      events: [
        { cls: "system", small: "open research", html: "You cannot pin the path: which blogs, how many, when to stop. Forcing classify → three searchers → synthesize is the wrong shape." },
        { cls: "assistant", small: "use a harness", html: "Agent loop + helpers + notes. LangGraph’s own deep-research move: they left the graph for a harness." }
      ],
      cost: "When the path cannot be named in advance, do not draw fake edges. That is a loop inside a harness (0006–0007, 0012).",
      note: "When not to graph: generic deep research. When to graph: you know classify-then-act, approval-before-till, inspect-then-patch."
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
    const chat = root.querySelector("[data-graph-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-graph-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
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

  document.querySelectorAll("[data-graph-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "hope");
  });
})();

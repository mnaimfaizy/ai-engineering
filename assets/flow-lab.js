(function () {
  const SCENES = {
    menu: {
      kind: "One call",
      user: "What’s on a Margherita?",
      stations: [{ title: "One call", hint: "pack · read · pick" }],
      events: [
        { cls: "assistant", small: "assistant · one call", html: "Tomato, mozzarella, basil." }
      ],
      cost: "1 LLM call. Your program: request in, text out. No loop.",
      note: "Architecture: a single API call (lesson 0003), maybe with a RAG paste first (lesson 0004). You are still writing the program — it is just short."
    },
    usual: {
      kind: "Workflow",
      user: "One Margherita, as usual.",
      stations: [
        { title: "Oven", hint: "check" },
        { title: "Dough", hint: "stretch" },
        { title: "Top", hint: "tomato · basil" },
        { title: "Bake", hint: "90 seconds" }
      ],
      events: [
        { cls: "tool", small: "station 1 · your path", html: "<pre>check_oven()</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"ready\": true }</pre>" },
        { cls: "tool", small: "station 2 · your path", html: "<pre>stretch_dough()</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"ok\": true }</pre>" },
        { cls: "tool", small: "station 3 · your path", html: "<pre>top({ \"tomato\": true, \"basil\": true })</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"ok\": true }</pre>" },
        { cls: "tool", small: "station 4 · your path", html: "<pre>bake({ \"seconds\": 90 })</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"done\": true }</pre>" },
        { cls: "assistant", small: "assistant · pick", html: "Margherita up." }
      ],
      cost: "4 steps, every run. Control flow is in your source. The model cannot skip bake or add a tool you did not schedule.",
      note: "Architecture: a workflow. You hardcoded the sequence. Each box can still be an LLM call or a tool — you decided the order before the user arrived."
    },
    walnuts: {
      kind: "Agent",
      user: "Use up tonight’s walnuts. I trust you.",
      stations: [
        { title: "?", hint: "unknown" },
        { title: "?", hint: "unknown" },
        { title: "?", hint: "unknown" },
        { title: "Stop", hint: "done or max" }
      ],
      events: [
        { cls: "tool", small: "model picks slip 1", html: "<pre>count_stock({ \"item\": \"walnut\" })</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"handfuls\": 3 }</pre>" },
        { cls: "tool", small: "model picks slip 2", html: "<pre>check_oven()</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"temp_c\": 240 }</pre>" },
        { cls: "tool", small: "model picks slip 3", html: "<pre>make_pizza({ \"name\": \"walnut crumb\" })</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"ok\": true }</pre>" },
        { cls: "assistant", small: "assistant · done", html: "Walnut crumb special is up. Three handfuls used." }
      ],
      cost: "3 tool rounds this time. Next run the model might choose a different sequence. You wrote the while-loop, not the inner steps.",
      note: "Architecture: an agent. Your program is a loop (call model → maybe run a tool → append result → call again) until the model returns text, or you hit a max. That loop is what you are ‘building an agent’ means."
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
    stations.forEach((label, i) => {
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
    steps.forEach((el, i) => el.classList.toggle("is-live", i === index));
  }

  function stationIndex(scene, eventIndex) {
    if (scene.kind === "One call") return 0;
    if (scene.kind === "Workflow") return Math.min(Math.floor(eventIndex / 2), scene.stations.length - 1);
    const slips = Math.floor(eventIndex / 2);
    return Math.min(slips, scene.stations.length - 1);
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-flow-chat]");
    const note = root.querySelector("[data-flow-note]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    drawPath(root, scene.stations);
    chat.replaceChildren();
    chat.appendChild(bubble("user", "user", scene.user));
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    if (note) note.textContent = "Playing the path…";
    live(root, 0);

    let i = 0;
    function next() {
      if (i >= scene.events.length) {
        if (cost) cost.textContent = scene.cost;
        if (note) note.textContent = scene.note;
        return;
      }
      const ev = scene.events[i];
      chat.appendChild(bubble(ev.cls, ev.small, ev.html));
      live(root, stationIndex(scene, i));
      i += 1;
      root._timer = window.setTimeout(next, 520);
    }
    root._timer = window.setTimeout(next, 420);
  }

  document.querySelectorAll("[data-flow-lab]").forEach((root) => {
    root.querySelectorAll("[data-order]").forEach((btn) => {
      btn.addEventListener("click", () => play(root, btn.getAttribute("data-order")));
    });
    play(root, "menu");
  });
})();

(function () {
  const SCENES = {
    oven: {
      user: "Is the oven hot enough for the walnut pizza?",
      slip: '{ "name": "check_oven", "arguments": {} }',
      result: '{ "ready": true, "temp_c": 240 }',
      answer: "Yes. The ticket says 240°C — load it.",
      noteWait: "The model stopped. It wrote a slip. Click Run the kitchen — that is your code, not the model.",
      noteDone: "Propose · run · paste · pick. The 240°C sat in RAM only after you cooked."
    },
    stock: {
      user: "How many walnut pizzas can we still sell?",
      slip: '{ "name": "count_stock", "arguments": { "item": "walnut_pizza" } }',
      result: '{ "walnut_pizza": 2 }',
      answer: "Two left. That number came from the till, not from last year’s cookbook.",
      noteWait: "A live count is not in the weights. The model can only ask. You (or MCP) must look.",
      noteDone: "Same loop as the oven. Different slip, different kitchen gadget."
    },
    math: {
      user: "What is 2 + 2?",
      slip: null,
      result: null,
      answer: "Four. No ticket — the script already knows.",
      noteWait: "",
      noteDone: "Skip the kitchen when the fact is already in the script. Same rule as skipping the shelf in lesson 0004."
    }
  };

  function bubble(cls, small, html) {
    const d = document.createElement("div");
    d.className = "bubble " + cls;
    d.innerHTML = "<small>" + small + "</small>" + html;
    return d;
  }

  function live(root, index) {
    const steps = [...root.querySelectorAll(".pipeline-step")];
    steps.forEach((el, i) => el.classList.toggle("is-live", i === index));
  }

  function clearChat(chat) {
    chat.replaceChildren();
  }

  function paint(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-tool-chat]");
    const note = root.querySelector("[data-tool-note]");
    const run = root.querySelector("[data-run]");
    if (!scene || !chat) return;

    root.dataset.scene = key;
    clearChat(chat);
    chat.appendChild(bubble("user", "user", scene.user));
    live(root, 0);

    if (!scene.slip) {
      if (run) run.disabled = true;
      live(root, 3);
      chat.appendChild(bubble("assistant", "assistant · pick", scene.answer));
      if (note) note.textContent = scene.noteDone;
      return;
    }

    chat.appendChild(bubble("tool", "assistant · writes a slip", "<pre>" + scene.slip + "</pre>"));
    live(root, 1);
    if (run) run.disabled = false;
    if (note) note.textContent = scene.noteWait;
  }

  function cook(root) {
    const key = root.dataset.scene;
    const scene = SCENES[key];
    const chat = root.querySelector("[data-tool-chat]");
    const note = root.querySelector("[data-tool-note]");
    const run = root.querySelector("[data-run]");
    if (!scene || !scene.slip || !chat) return;
    if (root.dataset.cooked === key) return;

    root.dataset.cooked = key;
    if (run) run.disabled = true;
    live(root, 2);
    chat.appendChild(bubble("result", "tool result · pasted into RAM", "<pre>" + scene.result + "</pre>"));
    window.setTimeout(() => {
      live(root, 3);
      chat.appendChild(bubble("assistant", "assistant · pick", scene.answer));
      if (note) note.textContent = scene.noteDone;
    }, 420);
  }

  document.querySelectorAll("[data-tool-lab]").forEach((root) => {
    root.querySelectorAll("[data-ask]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.dataset.cooked = "";
        paint(root, btn.getAttribute("data-ask"));
      });
    });
    const run = root.querySelector("[data-run]");
    if (run) run.addEventListener("click", () => cook(root));
    paint(root, "oven");
  });
})();

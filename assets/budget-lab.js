(function () {
  const WINDOW = 40;
  const ITEMS = {
    system: { label: "System", cost: 6, color: "var(--accent-2)" },
    turn: { label: "Chat turn", cost: 8, color: "var(--chip-4)" },
    tool: { label: "Tool dump", cost: 12, color: "var(--chip-0)" },
    junk: { label: "PDF dump", cost: 18, color: "var(--chip-3)" }
  };

  function paintBudget(root) {
    const used = Number(root.getAttribute("data-used") || "0");
    const pct = Math.min(100, (used / WINDOW) * 100);
    const fill = root.querySelector("[data-meter-fill]");
    const label = root.querySelector("[data-meter-label]");
    const stack = root.querySelector("[data-stack]");
    const note = root.querySelector("[data-budget-note]");
    if (fill) {
      fill.style.width = pct + "%";
      fill.classList.toggle("warn", used >= WINDOW * 0.7 && used <= WINDOW);
      fill.classList.toggle("fail", used > WINDOW);
    }
    if (label) {
      label.textContent = used > WINDOW
        ? used + " / " + WINDOW + " — overflow"
        : used + " / " + WINDOW + " slots";
    }
    if (stack) {
      stack.querySelectorAll("span").forEach((el) => {
        const key = el.getAttribute("data-layer");
        const n = Number(el.getAttribute("data-n") || "0");
        el.style.flex = (n <= 0 ? "0 0 0%" : (n / WINDOW * 100) + "%");
        el.textContent = n > 0 ? ITEMS[key].label : "";
      });
    }
    if (note) {
      if (used === 0) note.textContent = "Empty RAM. Add layers. This bar is a toy window of 40 slots — real windows are thousands of tokens, same shape.";
      else if (used > WINDOW) note.textContent = "Hard fail: APIs reject this (context_length_exceeded). Input plus reserved output must fit.";
      else if (used >= WINDOW * 0.7) note.textContent = "Still legal, but the attention budget is stretched. Anthropic calls this context rot: more tokens, weaker recall.";
      else note.textContent = "Fits. Every added token still spends the attention budget — cheap now, costly later in a long agent loop.";
    }
  }

  document.querySelectorAll("[data-budget-lab]").forEach((root) => {
    const layers = { system: 0, turn: 0, tool: 0, junk: 0 };
    root.setAttribute("data-used", "0");
    root.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-add");
        if (!ITEMS[key]) return;
        layers[key] += ITEMS[key].cost;
        const used = Object.values(layers).reduce((a, b) => a + b, 0);
        root.setAttribute("data-used", String(used));
        root.querySelectorAll("[data-layer]").forEach((el) => {
          el.setAttribute("data-n", String(layers[el.getAttribute("data-layer")] || 0));
          el.style.background = ITEMS[el.getAttribute("data-layer")].color;
        });
        paintBudget(root);
      });
    });
    const reset = root.querySelector("[data-reset]");
    if (reset) {
      reset.addEventListener("click", () => {
        Object.keys(layers).forEach((k) => { layers[k] = 0; });
        root.setAttribute("data-used", "0");
        root.querySelectorAll("[data-layer]").forEach((el) => el.setAttribute("data-n", "0"));
        paintBudget(root);
      });
    }
    paintBudget(root);
  });

  function uScore(t) {
    const x = 2 * t - 1;
    return 0.58 + 0.36 * (x * x);
  }

  function paintCurve(root) {
    const slider = root.querySelector("[data-pos]");
    const t = slider ? Number(slider.value) / 100 : 0;
    const score = uScore(t);
    const pin = root.querySelector("[data-pin]");
    const bar = root.querySelector("[data-recall]");
    const where = root.querySelector("[data-where]");
    if (pin) {
      pin.setAttribute("cx", String(40 + t * 320));
      pin.setAttribute("cy", String(150 - score * 110));
    }
    if (bar) bar.textContent = Math.round(score * 100) + "%";
    if (where) {
      where.textContent = t < 0.22 ? "start (primacy)" : t > 0.78 ? "end (recency)" : "middle (the dip)";
    }
  }

  document.querySelectorAll("[data-ucurve-lab]").forEach((root) => {
    const slider = root.querySelector("[data-pos]");
    if (!slider) return;
    slider.addEventListener("input", () => paintCurve(root));
    paintCurve(root);
  });
})();

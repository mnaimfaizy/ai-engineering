(function () {
  const LOGITS = [
    { t: " the", v: 4.2 },
    { t: " a", v: 2.0 },
    { t: " my", v: 1.1 },
    { t: " banana", v: 0.2 }
  ];

  function softmax(temp) {
    const t = Math.max(0.05, temp);
    const scaled = LOGITS.map((x) => x.v / t);
    const m = Math.max.apply(null, scaled);
    const exps = scaled.map((x) => Math.exp(x - m));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  function paint(root) {
    const slider = root.querySelector("[data-temp]");
    const temp = slider ? Number(slider.value) : 1;
    const probs = softmax(temp);
    const greedy = temp <= 0.06;
    let best = 0;
    probs.forEach((p, i) => { if (p > probs[best]) best = i; });
    root.querySelectorAll("[data-bar]").forEach((row, i) => {
      const fill = row.querySelector(".bar-fill");
      const pct = row.querySelector("[data-pct]");
      if (fill) fill.style.width = (probs[i] * 100).toFixed(1) + "%";
      if (pct) pct.textContent = Math.round(probs[i] * 100) + "%";
      row.classList.toggle("is-pick", i === best);
    });
    const label = root.querySelector("[data-temp-label]");
    const note = root.querySelector("[data-sample-note]");
    if (label) label.textContent = greedy ? "greedy (~0)" : temp.toFixed(1);
    if (note) {
      if (greedy) note.textContent = "Always pick the tallest bar. Same question → same next word. Safe, a bit bland.";
      else if (temp < 0.5) note.textContent = "Still almost always “the”. Good when you want a fact, not a poem.";
      else if (temp > 1.2) note.textContent = "The bars flatten. Even “banana” can win. Fun for stories. Risky for invoices.";
      else note.textContent = "Usually “the”, sometimes “a”. This is how chat apps feel by default.";
    }
  }

  document.querySelectorAll("[data-sample-lab]").forEach((root) => {
    const slider = root.querySelector("[data-temp]");
    if (!slider) return;
    slider.addEventListener("input", () => paint(root));
    paint(root);
  });
})();

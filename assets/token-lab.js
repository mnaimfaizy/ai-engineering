(function () {
  /**
   * Toy BPE for pedagogy only. Not tiktoken, not GPT-4, not Claude.
   * Longest-first merges so learners can see: case, spaces, and common
   * chunks become different atoms than "words."
   */
  const WIDE = [
    " the", " and", " for", " you", " that", " with", " this",
    "Hello", "hello", "World", "world", "token", "Token",
    "model", "agent", "graph", "loop",
    "ing", "ion", "ers", "est", "ed", "ly",
    "the", "and", "ing", "ent", "ion", "for",
    "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd",
    " to", " of", " in", " is", " it", " as",
    ", ", "! ", "  "
  ].sort((a, b) => b.length - a.length);

  const TIGHT = [
    "th", "he", "in", "er", "an"
  ].sort((a, b) => b.length - a.length);

  const FLAVOURS = { wide: WIDE, tight: TIGHT, default: WIDE };

  function tokenize(text, merges) {
    if (!text) return [];
    const table = merges || WIDE;
    let parts = Array.from(text);
    let changed = true;
    while (changed) {
      changed = false;
      outer: for (let i = 0; i < parts.length - 1; i++) {
        const pair = parts[i] + parts[i + 1];
        for (const m of table) {
          if (pair === m) {
            parts.splice(i, 2, pair);
            changed = true;
            break outer;
          }
        }
      }
    }
    return parts;
  }

  function renderChips(host, tokens) {
    host.replaceChildren();
    tokens.forEach((tok, i) => {
      const el = document.createElement("span");
      el.className = "chip" + (/^\s/.test(tok) ? " space" : "");
      el.style.background = `var(--chip-${i % 6})`;
      el.textContent = tok.replaceAll(" ", "·");
      el.title = `token ${i}: ${JSON.stringify(tok)}`;
      host.appendChild(el);
    });
  }

  function paintLab(root) {
    const input = root.querySelector("[data-token-input]");
    const chips = root.querySelector("[data-token-chips]");
    const count = root.querySelector("[data-token-count]");
    const chars = root.querySelector("[data-char-count]");
    if (!input || !chips) return;
    const flavour = root.getAttribute("data-flavour") || "default";
    const tokens = tokenize(input.value, FLAVOURS[flavour] || WIDE);
    renderChips(chips, tokens);
    if (count) count.textContent = String(tokens.length);
    if (chars) chars.textContent = String(input.value.length);
  }

  function paintFlavour(root) {
    const input = root.querySelector("[data-token-input]");
    if (!input) return;
    const text = input.value;
    root.querySelectorAll("[data-flavour-row]").forEach((row) => {
      const name = row.getAttribute("data-flavour-row");
      const chips = row.querySelector("[data-token-chips]");
      const count = row.querySelector("[data-token-count]");
      if (!chips) return;
      const tokens = tokenize(text, FLAVOURS[name] || WIDE);
      renderChips(chips, tokens);
      if (count) count.textContent = String(tokens.length);
    });
  }

  document.querySelectorAll("[data-token-lab]").forEach((root) => {
    const input = root.querySelector("[data-token-input]");
    if (!input) return;
    input.addEventListener("input", () => paintLab(root));
    paintLab(root);
  });

  document.querySelectorAll("[data-flavour-lab]").forEach((root) => {
    const input = root.querySelector("[data-token-input]");
    if (!input) return;
    input.addEventListener("input", () => paintFlavour(root));
    paintFlavour(root);
  });
})();

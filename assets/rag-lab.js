(function () {
  function words(s) {
    return (s || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  }

  function score(query, text) {
    const q = new Set(words(query).filter((w) => w.length > 2));
    if (!q.size) return 0;
    const t = new Set(words(text));
    let n = 0;
    q.forEach((w) => { if (t.has(w)) n += 1; });
    return n;
  }

  function paint(root) {
    const q = root.querySelector("[data-rag-q]");
    const query = q ? q.value : "";
    const cards = [...root.querySelectorAll("[data-card]")];
    const ranked = cards
      .map((el) => ({ el, s: score(query, el.textContent) }))
      .sort((a, b) => b.s - a.s);
    cards.forEach((el) => el.classList.remove("is-hit"));
    const hits = ranked.filter((x) => x.s > 0).slice(0, 2);
    hits.forEach((x) => x.el.classList.add("is-hit"));
    const paste = root.querySelector("[data-paste]");
    const note = root.querySelector("[data-rag-note]");
    if (paste) {
      paste.textContent = hits.length
        ? hits.map((x) => x.el.querySelector("p").textContent).join("\n\n")
        : "(nothing pasted — either no match, or you do not need the library)";
    }
    if (note) {
      if (!query.trim()) note.textContent = "Type a question. At most two cards light up and get pasted. This toy matches words, not meaning.";
      else if (!hits.length) note.textContent = "No overlap. In a real system you might still find a neighbour by meaning (embeddings). Or you skip retrieval.";
      else note.textContent = "Those two snippets would go into the user message. The other four stay on disk — they do not spend RAM.";
    }
  }

  document.querySelectorAll("[data-rag-lab]").forEach((root) => {
    const q = root.querySelector("[data-rag-q]");
    if (!q) return;
    q.addEventListener("input", () => paint(root));
    paint(root);
  });
})();

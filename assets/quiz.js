(function () {
  function mark(form, good) {
    const box = form.querySelector("[data-feedback]");
    if (!box) return;
    box.className = "feedback " + (good ? "good" : "bad");
    box.textContent = good
      ? (form.getAttribute("data-success") || "All correct.")
      : (form.getAttribute("data-retry") || "Not yet. Try again from memory.");
  }

  function answers(form) {
    const picked = {};
    form.querySelectorAll("input[type=radio]:checked").forEach((el) => {
      picked[el.name] = el.value;
    });
    return picked;
  }

  document.querySelectorAll("form[data-quiz]").forEach((form) => {
    // progress.js listens for these to save answers and mark the lesson done.
    form.addEventListener("change", () => {
      form.dispatchEvent(new CustomEvent("quiz:change", { bubbles: true, detail: { answers: answers(form) } }));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const keys = form.getAttribute("data-answers") || "";
      const expected = keys.split("").filter(Boolean);
      const names = [...new Set(
        [...form.querySelectorAll("input[type=radio]")].map((el) => el.name)
      )];
      const ok = names.length === expected.length && names.every((name, i) => {
        const picked = form.querySelector(`input[name="${name}"]:checked`);
        return picked && picked.value === expected[i];
      });
      mark(form, ok);
      form.dispatchEvent(new CustomEvent("quiz:checked", { bubbles: true, detail: { ok, answers: answers(form) } }));
    });
  });
})();

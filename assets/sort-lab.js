// Reusable sorting drill: read a case, pick a bin, get the reason at once.
//
// <div class="lab" data-sort-lab>
//   <script type="application/json" data-sort-data>
//     { "bins": ["A", "B"], "retry": "optional hint shown on a miss", "cases": [{ "text": "...", "bin": "A", "why": "..." }] }
//   </script>
// </div>
(function () {
  document.querySelectorAll("[data-sort-lab]").forEach((lab) => {
    const data = JSON.parse(lab.querySelector("[data-sort-data]").textContent);
    let index = 0;
    let firstTry = 0;
    let missed = false;

    const count = document.createElement("p");
    count.className = "kind";
    const card = document.createElement("div");
    card.className = "bubble system";
    card.style.maxWidth = "100%";
    const row = document.createElement("div");
    row.className = "btn-row";
    const feedback = document.createElement("p");
    feedback.className = "feedback";
    const next = document.createElement("div");
    next.className = "btn-row";
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    next.append(nextButton);
    lab.append(count, card, row, feedback, next);

    const buttons = data.bins.map((bin) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = bin;
      button.addEventListener("click", () => pick(bin, button));
      row.append(button);
      return button;
    });

    function show() {
      const item = data.cases[index];
      missed = false;
      count.textContent = `Case ${index + 1} of ${data.cases.length}`;
      card.textContent = item.text;
      feedback.textContent = "";
      feedback.className = "feedback";
      next.hidden = true;
      buttons.forEach((button) => {
        button.disabled = false;
        button.setAttribute("aria-pressed", "false");
      });
    }

    function pick(bin, button) {
      const item = data.cases[index];
      if (bin !== item.bin) {
        missed = true;
        button.disabled = true;
        feedback.className = "feedback bad";
        feedback.textContent = data.retry || "Not that one. Who, or what, stands between the agent and production here?";
        return;
      }
      if (!missed) firstTry++;
      button.setAttribute("aria-pressed", "true");
      buttons.forEach((other) => (other.disabled = true));
      feedback.className = "feedback good";
      feedback.textContent = item.why;
      const last = index === data.cases.length - 1;
      nextButton.textContent = last ? "Start again" : "Next case";
      next.hidden = false;
      if (last) {
        count.textContent = `Done. ${firstTry} of ${data.cases.length} right on the first try.`;
      }
    }

    nextButton.addEventListener("click", () => {
      index = (index + 1) % data.cases.length;
      if (index === 0) firstTry = 0;
      show();
    });

    show();
  });
})();

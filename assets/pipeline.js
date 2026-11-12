(function () {
  document.querySelectorAll("[data-pipeline]").forEach((root) => {
    const steps = [...root.querySelectorAll(".pipeline-step")];
    if (!steps.length) return;
    let i = 0;
    steps[0].classList.add("is-live");
    setInterval(() => {
      steps[i].classList.remove("is-live");
      i = (i + 1) % steps.length;
      steps[i].classList.add("is-live");
    }, 900);
  });
})();

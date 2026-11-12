// Course progress, saved in this browser only (localStorage).
//
// Lesson pages: restores quiz answers, marks a lesson done when its check
// passes (or by hand), and adds prev/next navigation from course-data.js.
// Home and map pages: any element with data-lesson="<slug>" gets a status.
(function () {
  const C = window.COURSE;
  if (!C) return;

  const KEY = `learn:${C.id}:progress:v1`;
  const lessons = C.sections.flatMap((s) => s.lessons);
  let canSave = true;

  function blank() {
    return { version: 1, lessons: {}, last: null };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (data && typeof data === "object" && data.lessons) return data;
    } catch (e) {
      canSave = false;
    }
    return blank();
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      canSave = false;
      return false;
    }
  }

  let state = load();

  function entry(slug) {
    return state.lessons[slug] || (state.lessons[slug] = {});
  }

  function status(slug) {
    const e = state.lessons[slug];
    if (!e) return "new";
    if (e.done) return "done";
    if (e.visited || (e.answers && Object.keys(e.answers).length)) return "started";
    return "new";
  }

  function doneCount() {
    return lessons.filter((l) => status(l.slug) === "done").length;
  }

  // First lesson that is not done, starting after the last one opened.
  function nextUp() {
    const firstOpen = lessons.find((l) => status(l.slug) !== "done");
    if (state.last && status(state.last) !== "done") return state.last;
    return firstOpen ? firstOpen.slug : null;
  }

  const LABEL = { done: "Done", started: "In progress", new: "Not started" };

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    if (text != null) node.textContent = text;
    return node;
  }

  function number(slug) {
    return slug.slice(0, 4);
  }

  // ----- Shared decoration (home, map, any page) -----

  function decorate() {
    document.querySelectorAll("[data-lesson]").forEach((node) => {
      const s = status(node.getAttribute("data-lesson"));
      node.classList.remove("is-done", "is-started", "is-new");
      node.classList.add("is-" + s);
      const badge = node.querySelector("[data-status]");
      if (badge) badge.textContent = LABEL[s];
    });

    const done = doneCount();
    const pct = Math.round((done / lessons.length) * 100);
    document.querySelectorAll("[data-progress-count]").forEach((n) => {
      n.textContent = `${done} of ${lessons.length} lessons done`;
    });
    document.querySelectorAll("[data-progress-bar]").forEach((n) => {
      n.style.setProperty("--pct", pct + "%");
      n.setAttribute("aria-valuenow", String(pct));
    });
    document.querySelectorAll("[data-continue]").forEach((a) => {
      const base = a.getAttribute("data-continue");
      const slug = nextUp();
      const started = Object.keys(state.lessons).length > 0;
      if (!slug) {
        a.textContent = "Course complete — start again from 0001";
        a.href = base + lessons[0].slug + ".html";
        return;
      }
      const lesson = lessons.find((l) => l.slug === slug);
      a.textContent = started
        ? `Continue: ${number(slug)} · ${lesson.title}`
        : "Start with lesson 0001";
      a.href = base + slug + ".html";
    });
    document.querySelectorAll("[data-storage-warning]").forEach((n) => {
      n.hidden = canSave;
    });
  }

  // ----- Home page tools: export / import / reset -----

  function wireTools() {
    const exp = document.querySelector("[data-progress-export]");
    if (exp) exp.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = el("a", { href: URL.createObjectURL(blob), download: `${C.id}-progress.json` });
      document.body.append(a);
      a.click();
      a.remove();
    });

    const imp = document.querySelector("[data-progress-import]");
    if (imp) imp.addEventListener("change", async () => {
      const file = imp.files && imp.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || typeof data !== "object" || !data.lessons) throw new Error("bad file");
        state = data;
        save(state);
        decorate();
        say("Progress loaded.");
      } catch (e) {
        say("That file is not a progress file from this course.");
      }
      imp.value = "";
    });

    const reset = document.querySelector("[data-progress-reset]");
    if (reset) reset.addEventListener("click", () => {
      if (!confirm("Clear all saved progress and quiz answers for this course in this browser?")) return;
      state = blank();
      save(state);
      decorate();
      say("Progress cleared.");
    });

    function say(text) {
      const out = document.querySelector("[data-progress-message]");
      if (out) out.textContent = text;
    }
  }

  // ----- Lesson page -----

  function lessonPage(slug) {
    const index = lessons.findIndex((l) => l.slug === slug);
    const lesson = lessons[index];
    const e = entry(slug);
    e.visited = e.visited || new Date().toISOString();
    state.last = slug;
    save(state);

    const form = document.querySelector("form[data-quiz]");

    // Restore answers and a passed result.
    if (form && e.answers) {
      Object.entries(e.answers).forEach(([name, value]) => {
        const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
        if (input) input.checked = true;
      });
      if (e.passed) {
        const box = form.querySelector("[data-feedback]");
        if (box) {
          box.className = "feedback good";
          box.textContent = form.getAttribute("data-success") || "All correct.";
        }
      }
    }

    document.addEventListener("quiz:change", (ev) => {
      entry(slug).answers = ev.detail.answers;
      save(state);
    });

    document.addEventListener("quiz:checked", (ev) => {
      const x = entry(slug);
      x.answers = ev.detail.answers;
      x.attempts = (x.attempts || 0) + 1;
      if (ev.detail.ok) {
        x.passed = true;
        x.done = true;
        x.doneAt = x.doneAt || new Date().toISOString();
      }
      save(state);
      render();
    });

    // Code exercise pointer near the top.
    if (lesson.code) {
      const lede = document.querySelector("article .lede");
      const box = el("div", { class: "callout course-code" });
      const p = el("p");
      p.append(el("strong", {}, "This lesson has a code exercise. "));
      if (C.repo) {
        p.append("Clone the course repository and work in ");
        p.append(el("code", {}, `code/${lesson.code}`));
        p.append(" (Node 22 or later, nothing to install): ");
        const pre = el("pre", {}, `git clone ${C.repo}.git\ncd ${C.repo.split("/").pop()}/code/${lesson.code}\nnode check.ts`);
        box.append(p, pre);
      } else {
        p.append("The files are in ");
        p.append(el("code", {}, `code/${lesson.code}`));
        p.append(" of this course’s repository. Clone it, then run the commands in the lab below from that folder (Node 22 or later, nothing to install).");
        box.append(p);
      }
      if (lede) lede.after(box);
    }

    // Bottom navigation.
    const nav = el("nav", { class: "course-nav", "aria-label": "Course navigation" });
    const article = document.querySelector("article");
    if (article) article.append(nav);

    function render() {
      nav.textContent = "";
      const x = entry(slug);

      const card = el("div", { class: "course-status is-" + status(slug) });
      const msg = el("p", { class: "course-state" });
      if (x.done) {
        msg.textContent = x.passed ? "Lesson done — you passed the check." : "Lesson marked as done.";
      } else if (form) {
        msg.textContent = "Pass the check above to complete this lesson, or mark it done yourself.";
      } else {
        msg.textContent = "Mark this lesson done when you are finished.";
      }
      const toggle = el("button", { type: "button" }, x.done ? "Mark as not done" : "Mark as done");
      toggle.addEventListener("click", () => {
        const y = entry(slug);
        y.done = !y.done;
        if (y.done) y.doneAt = new Date().toISOString();
        save(state);
        render();
      });
      card.append(msg, toggle);

      const pager = el("div", { class: "course-pager" });
      const prev = lessons[index - 1];
      const next = lessons[index + 1];
      if (prev) {
        const a = el("a", { class: "prev", href: prev.slug + ".html", rel: "prev" });
        a.append(el("span", {}, "← Previous"), el("strong", {}, `${number(prev.slug)} · ${prev.title}`));
        pager.append(a);
      } else {
        pager.append(el("span"));
      }
      if (next) {
        const a = el("a", { class: "next", href: next.slug + ".html", rel: "next" });
        a.append(el("span", {}, "Next →"), el("strong", {}, `${number(next.slug)} · ${next.title}`));
        pager.append(a);
      } else {
        const a = el("a", { class: "next", href: "../index.html" });
        a.append(el("span", {}, "Finished →"), el("strong", {}, "Back to the course home"));
        pager.append(a);
      }

      const meta = el("p", { class: "course-meta" });
      meta.append(`Lesson ${index + 1} of ${lessons.length} · ${doneCount()} done · `);
      meta.append(el("a", { href: "../index.html" }, "All lessons"));
      if (!canSave) meta.append(" · Progress can’t be saved in this browser.");

      nav.append(card, pager, meta);
      decorate();
    }

    render();
  }

  const page = location.pathname.split("/").pop().replace(/\.html$/, "");
  if (lessons.some((l) => l.slug === page)) lessonPage(page);
  decorate();
  wireTools();

  window.CourseProgress = { status, doneCount, nextUp };
})();

(function () {
  const SCENES = {
    manual: {
      kind: "You are the heartbeat",
      live: [],
      user: "Is the stone hot enough for walnut crumb?",
      events: [
        { cls: "assistant", small: "maker · one turn", html: "I preheated. I think we’re good." },
        { cls: "user", small: "you · type again", html: "Did you actually probe it?" },
        { cls: "assistant", small: "maker · next turn", html: "188°C. Still short of 240. I’ll wait." },
        { cls: "user", small: "you · type again", html: "Check again when it hits 240, then plate." }
      ],
      cost: "3 of your prompts. You are the schedule, the verifier, and the stop rule.",
      note: "This is two years of chat: you type, you read, you type. Loop engineering is designing who does those three jobs so you can walk away."
    },
    verify: {
      kind: "1 · Verify",
      live: [0],
      user: "Walnut crumb when the stone is ready.",
      events: [
        { cls: "assistant", small: "maker · claims done", html: "Plated. Feature complete." },
        { cls: "tool", small: "loop · verify", html: "<pre>probe_stone() → {\"temp_c\": 188}</pre>" },
        { cls: "result", small: "evidence in the transcript", html: "188 ≠ 240. The claim is not the proof." },
        { cls: "assistant", small: "maker · continues", html: "Still heating. I will not mark passing yet." }
      ],
      cost: "Verify is a check that leaves evidence. Anthropic: Claude marks features done without end-to-end tests unless you make testing the loop.",
      note: "A good condition is something the transcript can show: a probe, a test exit, git status. Feelings do not count."
    },
    goal: {
      kind: "2 · Stop (checker)",
      live: [1],
      user: "/goal stone is 240°C AND walnut crumb is plated",
      events: [
        { cls: "system", small: "loop · /goal", html: "After each turn a small fast model reads the transcript. It does not run the probe itself." },
        { cls: "result", small: "checker · not yet", html: "<pre>verdict: not met\nreason: last probe is 188; nothing plated.</pre>" },
        { cls: "assistant", small: "maker · another turn", html: "Waiting on 240, then plate." },
        { cls: "tool", small: "maker · proof", html: "<pre>probe_stone() → {\"temp_c\": 240}\nplate(\"walnut crumb\")</pre>" },
        { cls: "result", small: "checker · met", html: "<pre>verdict: met\nreason: 240 in transcript; plated.</pre>" }
      ],
      cost: "You did not type the second turn. The checker — not the maker — cleared the goal. Claude Code: /goal is a Stop hook with a fresh model.",
      note: "Harness MAX (lesson 0007) is a count. A goal is a condition. Osmani: the one who cooked is too nice grading its own homework."
    },
    sched: {
      kind: "3 · Schedule",
      live: [2],
      user: "(you are not here — 06:00 cron)",
      events: [
        { cls: "system", small: "schedule · clock", html: "Cursor Automations / Claude scheduled tasks: the next turn starts because the clock fired, not because you pressed Enter." },
        { cls: "tool", small: "loop · triage skill", html: "<pre>read(\"NOTES.md\") → leftover: stone was 188 last night.</pre>" },
        { cls: "assistant", small: "maker · unattended", html: "Preheat to 240, then walnut crumb. I will write the shift note when plated." },
        { cls: "result", small: "state on disk", html: "NOTES.md updated. You read the inbox later — you did not prompt this." }
      ],
      cost: "/loop and cron are time. /goal is condition. Stop hooks are your script. Same shape in Cursor and Claude Code.",
      note: "Schedule is the heartbeat. State still lives on disk (lesson 0009). You still confirm it worked — the loop does not delete the engineer."
    }
  };

  function bubble(cls, small, html) {
    const d = document.createElement("div");
    d.className = "bubble " + cls;
    d.innerHTML = "<small>" + small + "</small>" + html;
    return d;
  }

  function live(root, indexes) {
    const steps = [...root.querySelectorAll(".pipeline-step")];
    const set = new Set(indexes || []);
    steps.forEach((el, i) => el.classList.toggle("is-live", set.has(i)));
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-loop-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-loop-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    chat.replaceChildren();
    if (scene.user.indexOf("you are not here") === -1) {
      chat.appendChild(bubble("user", "user", scene.user));
    } else {
      chat.appendChild(bubble("system", "schedule", scene.user));
    }
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    live(root, scene.live || []);
    if (note) note.textContent = "Playing…";

    let i = 0;
    function next() {
      if (i >= scene.events.length) {
        if (cost) cost.textContent = scene.cost;
        if (note) note.textContent = scene.note;
        return;
      }
      const ev = scene.events[i];
      chat.appendChild(bubble(ev.cls, ev.small, ev.html));
      i += 1;
      root._timer = window.setTimeout(next, 480);
    }
    root._timer = window.setTimeout(next, 360);
  }

  document.querySelectorAll("[data-loop-lab]").forEach(function (root) {
    root.querySelectorAll("[data-scene]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        play(root, btn.getAttribute("data-scene"));
      });
    });
    play(root, "manual");
  });
})();

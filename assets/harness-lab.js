(function () {
  const SCENES = {
    naked: {
      kind: "Naked loop",
      live: [1],
      user: "Refund order 441.",
      events: [
        { cls: "tool", small: "model · writes a slip", html: "<pre>refund({ \"order\": 441 })</pre>" },
        { cls: "result", small: "run · no questions asked", html: "<pre>{ \"ok\": true, \"cents\": 2400 }</pre>" },
        { cls: "assistant", small: "assistant · done", html: "Refunded. $24.00 is on its way." }
      ],
      cost: "1 tool ran. The harness did nothing — there was no harness.",
      note: "This is the while-loop from lesson 0006 with the four jobs stripped out. The model chose refund; your code ran it. In production that is how money leaves the till by accident."
    },
    allow: {
      kind: "Allow",
      live: [0],
      user: "Refund order 441.",
      wait: true,
      eventsBefore: [
        { cls: "tool", small: "model · writes a slip", html: "<pre>refund({ \"order\": 441 })</pre>" },
        { cls: "system", small: "harness · allow", html: "High-stakes tool. Stamp required before run." }
      ],
      approve: [
        { cls: "result", small: "harness · stamped ALLOW, then run", html: "<pre>{ \"ok\": true, \"cents\": 2400 }</pre>" },
        { cls: "assistant", small: "assistant · done", html: "Refunded after your stamp. $24.00 is on its way." }
      ],
      deny: [
        { cls: "result", small: "harness · stamped DENY", html: "<pre>{ \"error\": \"denied_by_harness\" }</pre>" },
        { cls: "assistant", small: "assistant · pick", html: "I cannot refund without a stamp. Say if you want to try again." }
      ],
      costApprove: "Slip written. Harness paused. You stamped. Then run.",
      costDeny: "Slip written. Harness paused. You denied. Tool never ran.",
      noteWait: "This is the gap 12-factor agents insists you own: between tool selection and tool invocation. Approve or deny — that click is the harness.",
      noteApprove: "Allow is not the model being careful. It is your code (or a human) between the slip and the till.",
      noteDeny: "Denied is still a paste. The loop continues with a fact: the till did not move."
    },
    retry: {
      kind: "Run",
      live: [1],
      user: "Is the oven hot enough?",
      events: [
        { cls: "tool", small: "model · slip 1", html: "<pre>check_oven()</pre>" },
        { cls: "result", small: "harness · run failed, paste the error", html: "<pre>{ \"error\": \"timeout\" }</pre>" },
        { cls: "tool", small: "model · slip 2, same tool", html: "<pre>check_oven()</pre>" },
        { cls: "result", small: "harness · retry succeeded", html: "<pre>{ \"temp_c\": 240 }</pre>" },
        { cls: "assistant", small: "assistant · pick", html: "Yes. The second ticket says 240°C." }
      ],
      cost: "2 runs, 1 success. The model did not crash. The harness pasted the timeout and looped.",
      note: "A failed tool is not the end of the program. Compact the error, paste it, call again. Anthropic: the loop needs ground truth from the environment at each step — including failures."
    },
    stop: {
      kind: "Stop",
      live: [2],
      user: "Keep checking the kitchen until I say stop.",
      events: [
        { cls: "tool", small: "model · slip 1", html: "<pre>check_oven()</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"temp_c\": 240 }</pre>" },
        { cls: "tool", small: "model · slip 2", html: "<pre>count_stock({ \"item\": \"walnut\" })</pre>" },
        { cls: "result", small: "kitchen", html: "<pre>{ \"handfuls\": 3 }</pre>" },
        { cls: "tool", small: "model · slip 3", html: "<pre>check_oven()</pre>" },
        { cls: "system", small: "harness · stop", html: "MAX = 3. Loop halted. The model did not choose this." }
      ],
      cost: "3 steps, then your stop rule. Without MAX this request never ends.",
      note: "Anthropic: include stopping conditions (a maximum number of iterations is the usual one). Stop is the harness. The model will happily emit another slip."
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

  function playList(root, events, done) {
    const chat = root.querySelector("[data-harness-chat]");
    let i = 0;
    function next() {
      if (i >= events.length) {
        if (done) done();
        return;
      }
      const ev = events[i];
      chat.appendChild(bubble(ev.cls, ev.small, ev.html));
      i += 1;
      root._timer = window.setTimeout(next, 480);
    }
    root._timer = window.setTimeout(next, 360);
  }

  function setStamp(root, on) {
    const row = root.querySelector("[data-stamp-row]");
    if (!row) return;
    row.hidden = !on;
    row.querySelectorAll("button").forEach((btn) => {
      btn.disabled = !on;
    });
  }

  function finish(root, cost, note) {
    const costEl = root.querySelector("[data-cost]");
    const noteEl = root.querySelector("[data-harness-note]");
    if (costEl) costEl.textContent = cost;
    if (noteEl) noteEl.textContent = note;
  }

  function play(root, key) {
    const scene = SCENES[key];
    const chat = root.querySelector("[data-harness-chat]");
    const kind = root.querySelector("[data-kind]");
    const cost = root.querySelector("[data-cost]");
    const note = root.querySelector("[data-harness-note]");
    if (!scene || !chat) return;

    if (root._timer) window.clearTimeout(root._timer);
    root.dataset.scene = key;
    root.dataset.waiting = "";
    chat.replaceChildren();
    chat.appendChild(bubble("user", "user", scene.user));
    if (kind) kind.textContent = scene.kind;
    if (cost) cost.textContent = "";
    live(root, scene.live || []);
    setStamp(root, false);

    if (scene.wait) {
      if (note) note.textContent = "Playing…";
      playList(root, scene.eventsBefore, () => {
        root.dataset.waiting = "1";
        setStamp(root, true);
        if (note) note.textContent = scene.noteWait;
      });
      return;
    }

    if (note) note.textContent = "Playing the loop…";
    playList(root, scene.events, () => finish(root, scene.cost, scene.note));
  }

  function stamp(root, allowed) {
    if (root.dataset.waiting !== "1") return;
    const scene = SCENES[root.dataset.scene];
    if (!scene || !scene.wait) return;
    root.dataset.waiting = "";
    setStamp(root, false);
    live(root, allowed ? [0, 1] : [0]);
    const events = allowed ? scene.approve : scene.deny;
    playList(root, events, () => {
      finish(
        root,
        allowed ? scene.costApprove : scene.costDeny,
        allowed ? scene.noteApprove : scene.noteDeny
      );
    });
  }

  document.querySelectorAll("[data-harness-lab]").forEach((root) => {
    root.querySelectorAll("[data-scene]").forEach((btn) => {
      btn.addEventListener("click", () => play(root, btn.getAttribute("data-scene")));
    });
    const yes = root.querySelector("[data-stamp='yes']");
    const no = root.querySelector("[data-stamp='no']");
    if (yes) yes.addEventListener("click", () => stamp(root, true));
    if (no) no.addEventListener("click", () => stamp(root, false));
    play(root, "naked");
  });
})();

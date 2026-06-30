// AfriversalAI — Facilitator answer review (client side).
//
// Sends a learner's free-text answer to the `tutor-review` Edge Function and renders
// warm facilitator feedback under the answer. Learner-facing copy NEVER mentions AI.
// Safe no-op until the function is deployed (shows a gentle "compare with the example"
// note instead, and never blocks the lesson).
(function () {
  function endpoint() {
    if (typeof SUPABASE_URL === "undefined" || !SUPABASE_URL) return null;
    return SUPABASE_URL.replace(/\/$/, "") + "/functions/v1/tutor-review";
  }

  async function authHeaders() {
    var h = { "Content-Type": "application/json" };
    if (typeof SUPABASE_ANON_KEY !== "undefined" && SUPABASE_ANON_KEY) h["apikey"] = SUPABASE_ANON_KEY;
    var bearer = null;
    try {
      if (typeof getSession === "function") {
        var s = await getSession();
        if (s && s.access_token) bearer = s.access_token;
      }
    } catch (e) {}
    if (!bearer && typeof SUPABASE_ANON_KEY !== "undefined" && SUPABASE_ANON_KEY) bearer = SUPABASE_ANON_KEY;
    if (bearer) h["Authorization"] = "Bearer " + bearer;
    return h;
  }

  // Low-level call. Returns { ok, verdict, message } or { ok:false, reason }.
  window.afTutorReview = async function (payload) {
    var url = endpoint();
    if (!url) return { ok: false, reason: "not_configured" };
    try {
      var res = await fetch(url, { method: "POST", headers: await authHeaders(), body: JSON.stringify(payload) });
      if (res.status === 404) return { ok: false, reason: "not_configured" };
      var j = {};
      try { j = await res.json(); } catch (e) {}
      if (!res.ok) return { ok: false, reason: j.reason || "error", status: res.status };
      return j;
    } catch (e) {
      return { ok: false, reason: "error", error: String(e) };
    }
  };

  // Find (or create) the feedback note that sits just after `anchor`.
  function noteFor(anchor) {
    var n = anchor.nextElementSibling;
    if (n && n.classList && n.classList.contains("fac-note")) return n;
    var box = document.createElement("div");
    box.className = "fac-note";
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
    return box;
  }
  function render(box, state, message) {
    box.className = "fac-note fac-note--" + state;
    box.style.display = "block";
    var icon = state === "loading" ? "⏳" : "🎓";
    box.innerHTML =
      '<div class="fac-note__head">' + icon + ' Facilitator</div>' +
      '<div class="fac-note__body">' + (message || "") + "</div>";
  }
  function offlineApply(box) {
    render(box, "info", "Your answer is saved. Compare it with the strong-response example above and sharpen anything that feels thin.");
  }
  function offlineReflect(box) {
    render(box, "info", "Thanks for reflecting — your notes are saved. Hold onto them as the concept unfolds next.");
  }

  // Apply step: one textarea. ctx = { module, step }.
  window.afFacCheck = async function (btn, textareaId, ctx) {
    ctx = ctx || {};
    var ta = document.getElementById(textareaId);
    if (!ta) return;
    var answer = (ta.value || "").trim();
    var box = noteFor(btn.closest(".fac-check") || btn);
    if (answer.length < 15) {
      render(box, "needs_work", "Add a little more first — a sentence or two — then I'll take a look.");
      return;
    }
    var screen = ta.closest(".phase-screen") || ta.closest(".phase") || document;
    var qEl = screen.querySelector(".funda-apply-step__name");
    var exEl = screen.querySelector("p[style*='italic']");
    var old = btn.textContent;
    btn.disabled = true; btn.textContent = "Reading your answer…";
    render(box, "loading", "Reading your answer…");
    var r = await afTutorReview({
      module: ctx.module || "", section: "apply", step: ctx.step || "",
      question: qEl ? qEl.textContent.trim() : "",
      modelAnswer: exEl ? exEl.textContent.trim() : "",
      answer: answer,
    });
    btn.disabled = false; btn.textContent = old;
    if (r && r.ok) render(box, r.verdict || "partly", r.message);
    else offlineApply(box);
  };

  // Reflect: all reflect-q fields in the current phase. ctx = { module }.
  window.afFacCheckReflect = async function (btn, ctx) {
    ctx = ctx || {};
    var phase = btn.closest(".phase") || document;
    var blocks = Array.prototype.slice.call(phase.querySelectorAll(".reflect-q"));
    var parts = [], questions = [];
    blocks.forEach(function (q) {
      var lab = q.querySelector("label");
      var fld = q.querySelector(".reflect-q__field");
      if (fld && fld.value.trim()) {
        parts.push((lab ? lab.textContent.trim() : "") + "\nAnswer: " + fld.value.trim());
        questions.push(lab ? lab.textContent.trim() : "");
      }
    });
    var box = noteFor(btn.closest(".fac-check") || btn);
    if (!parts.length) {
      render(box, "needs_work", "Jot down a few thoughts first — there are no wrong answers here — then I'll respond.");
      return;
    }
    var old = btn.textContent;
    btn.disabled = true; btn.textContent = "Reading your reflections…";
    render(box, "loading", "Reading your reflections…");
    var r = await afTutorReview({
      module: ctx.module || "", section: "reflect", step: "Reflections",
      question: questions.join(" | "), answer: parts.join("\n\n"),
    });
    btn.disabled = false; btn.textContent = old;
    if (r && r.ok) render(box, "on_track", r.message);
    else offlineReflect(box);
  };
})();

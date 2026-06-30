// AfriversalAI — shared module navigation engine.
// Defines showPhase, showScreen, updateTracker for all course modules.
// Per-module behaviour is wired via window.MODULE_CONFIG (set in each module's inline script).
// All config hooks are read lazily at call time — no load-order dependency.
//
// Supported config keys:
//   restorePhaseHeader  {boolean}  — restore .phase__header display on showPhase
//   onPhaseEnter(n)     {function} — called after tracker update, before scroll
//   onScreenChange(phaseNum, screenId, phase)  {function} — called after screen swap, before scroll
//   afterTrackerUpdate(activePhaseNum)         {function} — called at end of updateTracker

// Scroll so the active lesson content lands just below the sticky nav + progress
// tracker — not the top of the page (which now sits under the module banner image).
function _afScrollToContent() {
  var nav = document.querySelector('.nav')
  var sticky = document.querySelector('.progress-sticky-wrap')
  var navH = nav ? nav.offsetHeight : 0
  var stickyH = sticky ? sticky.offsetHeight : 0
  var anchor = document.querySelector('.phase.is-active') || sticky
  if (!anchor) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
  var y = anchor.getBoundingClientRect().top + window.pageYOffset - navH - stickyH - 16
  window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' })
}

function showPhase(n) {
  var cfg = window.MODULE_CONFIG || {}
  document.querySelectorAll('.phase').forEach(function(p) { p.classList.remove('is-active') })
  var phase = document.getElementById('phase-' + n)
  if (!phase) return
  phase.classList.add('is-active')
  if (cfg.restorePhaseHeader) {
    var header = phase.querySelector('.phase__header')
    if (header) header.style.display = ''
  }
  var screens = phase.querySelectorAll('.phase-screen')
  screens.forEach(function(s) { s.classList.remove('is-active') })
  if (screens.length > 0) screens[0].classList.add('is-active')
  updateTracker(n)
  if (cfg.onPhaseEnter) cfg.onPhaseEnter(n)
  _afScrollToContent()
}

function showScreen(phaseNum, screenId) {
  var phase = document.getElementById('phase-' + phaseNum)
  if (!phase) return
  phase.querySelectorAll('.phase-screen').forEach(function(s) { s.classList.remove('is-active') })
  var target = document.getElementById('ps-' + phaseNum + '-' + screenId)
  if (target) target.classList.add('is-active')
  if ((window.MODULE_CONFIG || {}).onScreenChange) {
    window.MODULE_CONFIG.onScreenChange(phaseNum, screenId, phase)
  }
  _afScrollToContent()
}

function updateTracker(activePhaseNum) {
  ;[0, 1, 2, 3].forEach(function(i) {
    var step = document.getElementById('prog-' + i)
    if (!step) return
    step.classList.remove('is-active')
    if (i < activePhaseNum) {
      if (!step.classList.contains('is-done')) step.classList.add('is-done')
    } else if (i === activePhaseNum) {
      step.classList.add('is-active')
    }
  })
  if ((window.MODULE_CONFIG || {}).afterTrackerUpdate) {
    window.MODULE_CONFIG.afterTrackerUpdate(activePhaseNum)
  }
}

function goBack(toPhase) { showPhase(toPhase); }

// === Quiz option shuffle (runs on load) ===
function shuffleQuizOptions() {
  document.querySelectorAll('.quiz-opts').forEach(function(opts) {
    var labels = Array.from(opts.querySelectorAll('label.quiz-opt'));
    for (var i = labels.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = labels[i]; labels[i] = labels[j]; labels[j] = tmp;
    }
    labels.forEach(function(label) { opts.appendChild(label); });
  });
}
document.addEventListener('DOMContentLoaded', shuffleQuizOptions);

// Click a completed or active progress step to jump to that phase
document.addEventListener('DOMContentLoaded', function() {
  [0, 1, 2, 3].forEach(function(i) {
    var step = document.getElementById('prog-' + i);
    if (!step) return;
    step.addEventListener('click', function() {
      if (step.classList.contains('is-done') || step.classList.contains('is-active')) {
        showPhase(i);
      }
    });
  });
});

// Shared AI-Tutor verdict banner markup (used by every knowledge check)
function tutorVerdictHTML(pass, correct, total, msg) {
  var head = pass ? 'Demonstrated!' : 'Not yet';
  return '<div class="tutor-verdict__avatar">🎓</div>'
    + '<div class="tutor-verdict__body">'
    + '<div class="tutor-verdict__tag">Knowledge Check &middot; Marking</div>'
    + '<div class="tutor-verdict__headline">' + head + ' <span class="tutor-verdict__score">' + correct + ' / ' + total + ' correct</span></div>'
    + '<div class="tutor-verdict__msg">' + msg + '</div>'
    + '</div>';
}

// Mark one knowledge check. names: input name prefix. fbPrefix: feedback id prefix.
function markCheck(names, fbPrefix, n, exp) {
  var allAnswered = true, wrong = 0;
  for (var i = 0; i < n; i++) {
    var sel = document.querySelector('input[name="' + names + i + '"]:checked');
    var fb = document.getElementById(fbPrefix + i);
    if (!sel) { allAnswered = false; continue; }
    var label = sel.closest('label');
    label.classList.remove('quiz-opt--ok', 'quiz-opt--no');
    var isOk = label.dataset.correct === 'true';
    fb.style.display = 'block';
    if (isOk) {
      fb.className = 'quiz-feedback tutor-note tutor-note--ok';
      fb.innerHTML = '<div class="tutor-note__label">🎓 Correct</div><div class="tutor-note__text">' + exp[i].ok + '</div>';
      label.classList.add('quiz-opt--ok');
      document.querySelectorAll('input[name="' + names + i + '"]').forEach(function(r) { r.disabled = true; });
    } else {
      wrong++;
      fb.className = 'quiz-feedback tutor-note tutor-note--no';
      fb.innerHTML = '<div class="tutor-note__label">🎓 Review this</div><div class="tutor-note__text">' + exp[i].no + '</div>';
      label.classList.add('quiz-opt--no');
    }
  }
  return { allAnswered: allAnswered, wrong: wrong };
}

// Unified answer persistence: localStorage (immediate) + Supabase (debounced 2s).
// Call once per module after content is revealed, passing the module's textarea IDs.
function initAnswerPersistence(moduleId, fieldIds, uid) {
  var timers = {}
  var lsPrefix = 'afv_' + uid + '_' + moduleId.replace('module-', 'm') + '_'

  // 1. Restore from localStorage immediately (sync, 0ms)
  fieldIds.forEach(function(id) {
    var el = document.getElementById(id)
    if (!el) return
    var saved = localStorage.getItem(lsPrefix + id)
    if (saved) el.value = saved
  })

  // 2. Restore from Supabase (async — cross-device sync)
  if (typeof getAnswers === 'function') {
    getAnswers(moduleId).then(function(saved) {
      fieldIds.forEach(function(id) {
        var el = document.getElementById(id)
        if (!el) return
        if (saved[id]) {
          el.value = saved[id]
          localStorage.setItem(lsPrefix + id, saved[id])
        } else if (el.value && typeof saveAnswer === 'function') {
          // One-time migration: localStorage has data, Supabase doesn't — push it up
          saveAnswer(moduleId, id, el.value)
        }
      })
    }).catch(function() {})
  }

  // 3. Input listeners: localStorage immediate + Supabase debounced 2s
  fieldIds.forEach(function(id) {
    var el = document.getElementById(id)
    if (!el) return
    el.addEventListener('input', function() {
      localStorage.setItem(lsPrefix + id, el.value)
      clearTimeout(timers[id])
      timers[id] = setTimeout(function() {
        if (typeof saveAnswer === 'function') saveAnswer(moduleId, id, el.value)
      }, 2000)
    })
  })

  // 4. Flush pending debounced writes on tab close
  window.addEventListener('beforeunload', function() {
    fieldIds.forEach(function(id) {
      if (timers[id]) {
        clearTimeout(timers[id])
        var el = document.getElementById(id)
        if (el && el.value && typeof saveAnswer === 'function') saveAnswer(moduleId, id, el.value)
      }
    })
  }, { once: true })
}

// Reset one knowledge check for a retake.
function resetCheck(names, fbPrefix, n) {
  for (var i = 0; i < n; i++) {
    document.querySelectorAll('input[name="' + names + i + '"]').forEach(function(r) {
      r.checked = false; r.disabled = false;
      var l = r.closest('label'); if (l) l.classList.remove('quiz-opt--ok', 'quiz-opt--no');
    });
    var fb = document.getElementById(fbPrefix + i);
    if (fb) { fb.style.display = 'none'; fb.className = 'quiz-feedback'; fb.innerHTML = ''; }
  }
}

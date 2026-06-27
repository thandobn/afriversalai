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
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

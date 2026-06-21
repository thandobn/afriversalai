(function () {
  const burger = document.querySelector('.nav__hamburger');
  const links = document.querySelector('.nav__links');
  if (!burger || !links) return;

  burger.addEventListener('click', function () {
    const open = links.classList.toggle('is-open');
    burger.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__inner')) {
      links.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.nav__dropdown.is-open').forEach(function (d) {
        d.classList.remove('is-open');
      });
    }
  });

  // Close mobile menu on nav link click — skip dropdown triggers (they toggle sub-menu instead)
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.parentElement.classList.contains('nav__dropdown')) return;
      links.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Dropdown toggle: always prevent navigation; mobile toggles .is-open, desktop relies on CSS hover
  document.querySelectorAll('.nav__dropdown > a').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var dropdown = trigger.closest('.nav__dropdown');
      dropdown.classList.toggle('is-open');
    });
  });

  // Update nav for auth state if auth.js is loaded
  if (typeof updateNavForAuth === 'function') {
    updateNavForAuth();
  }

  // Accessibility: aria-labels for language switcher buttons
  var langLabels = { en: 'Switch to English', af: 'Switch to Afrikaans', fr: 'Switch to French', zu: 'Switch to Zulu' };
  document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
    var code = btn.getAttribute('data-lang-btn');
    if (langLabels[code]) btn.setAttribute('aria-label', langLabels[code]);
  });
})();

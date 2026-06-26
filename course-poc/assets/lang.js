/**
 * AfriversalAI — Language Switcher
 * Reads TRANSLATIONS from translations.js, applies strings to the DOM.
 *
 * Nav links are translated by href — no data-i18n attributes needed on them.
 * Page content uses data-i18n="key" on elements to mark translatable strings.
 * Elements with embedded HTML (like <br>) use data-i18n-html="key" to use innerHTML.
 */
(function () {
  var STORAGE_KEY = 'afriversal_lang';
  var DEFAULT_LANG = 'en';

  /* Language switcher is hidden until translations are reviewed by a native speaker.
     To re-enable: add language codes here (e.g. ['en', 'af', 'fr', 'zu']) and the
     switcher reappears site-wide automatically. */
  var ACTIVE_LANGS = ['en'];

  /* Maps nav link hrefs to translation keys */
  var NAV_LINK_KEYS = {
    'index.html':      'nav_home',
    'course.html':     'nav_course',
    'module-0.html':   'nav_fundamentals',
    'funda-five.html': 'nav_funda_five',
    'certificate.html':'nav_certificate',
    'pricing.html':    'nav_pricing',
    'register.html':   'nav_register',
  };

  function getLang() {
    var l;
    try { l = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) { l = DEFAULT_LANG; }
    /* Ignore a stored language that's no longer offered */
    return ACTIVE_LANGS.indexOf(l) !== -1 ? l : DEFAULT_LANG;
  }

  function applyLang(code) {
    var t = window.TRANSLATIONS;
    if (!t) return;
    var strings = t[code] || t[DEFAULT_LANG];

    /* Nav links — translated by href attribute */
    document.querySelectorAll('.nav__links a').forEach(function (a) {
      var href = a.getAttribute('href');
      var key = NAV_LINK_KEYS[href];
      if (key && strings[key] !== undefined) a.textContent = strings[key];
    });

    /* Hamburger button aria-label */
    document.querySelectorAll('.nav__hamburger').forEach(function (btn) {
      if (strings['nav_open']) btn.setAttribute('aria-label', strings['nav_open']);
    });

    /* data-i18n elements — plain text */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (strings[key] !== undefined) el.textContent = strings[key];
    });

    /* data-i18n-html elements — for content with embedded HTML tags */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.dataset.i18nHtml;
      if (strings[key] !== undefined) el.innerHTML = strings[key];
    });

    /* data-i18n-placeholder elements — for input/textarea placeholder text */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.dataset.i18nPlaceholder;
      if (strings[key] !== undefined) el.placeholder = strings[key];
    });

    /* Update html lang attribute */
    document.documentElement.lang = code;
  }

  function setLang(code) {
    if (ACTIVE_LANGS.indexOf(code) === -1) code = DEFAULT_LANG;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    applyLang(code);
    /* Update picker button states */
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.langBtn === code);
    });
  }

  /* Expose globally so onclick handlers in HTML can call it */
  window.setLang = setLang;
  window.getCurrentLang = getLang;

  document.addEventListener('DOMContentLoaded', function () {
    var lang = getLang();
    applyLang(lang);
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.style.display = ACTIVE_LANGS.indexOf(btn.dataset.langBtn) === -1 ? 'none' : '';
      btn.classList.toggle('is-active', btn.dataset.langBtn === lang);
    });
    /* Show the switcher only when multiple languages are active — CSS hides it by default */
    if (ACTIVE_LANGS.length > 1) {
      document.querySelectorAll('.lang-switcher').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  });
})();

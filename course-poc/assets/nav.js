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
    }
  });

  // Close on nav link click (single-page feel)
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Update nav for auth state if auth.js is loaded
  if (typeof updateNavForAuth === 'function') {
    updateNavForAuth();
  }
})();

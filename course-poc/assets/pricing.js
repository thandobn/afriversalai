// AfriversalAI — single source of truth for seat pricing.
// Founding (promotional) tuition runs until end of December 2026 (SAST),
// then standard tuition applies. Used by the pricing page countdown and by
// partner cohort onboarding to default the per-seat price correctly by date.
(function () {
  window.AF_PROMO_PRICE = 14995;       // Founding Cohort rate (per seat, ZAR)
  window.AF_STANDARD_PRICE = 19995;    // Standard tuition after the promo ends
  window.AF_PROMO_END_ISO = '2026-12-31T23:59:59+02:00'; // 31 Dec 2026, 23:59 SAST

  window.afPromoActive = function () { return Date.now() <= new Date(window.AF_PROMO_END_ISO).getTime(); };
  window.afSeatPrice = function () { return window.afPromoActive() ? window.AF_PROMO_PRICE : window.AF_STANDARD_PRICE; };
  window.afMoney = function (n) { return 'R' + (Math.round(Number(n) || 0)).toLocaleString('en-ZA'); };

  // Render a live countdown to the promo end into the element with id `elId`.
  window.afRenderCountdown = function (elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    var end = new Date(window.AF_PROMO_END_ISO).getTime();
    function box(n, l) {
      return '<span style="display:inline-flex; flex-direction:column; align-items:center; min-width:58px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); border-radius:10px; padding:8px 10px; margin:0 4px;">' +
        '<span style="font-size:1.5em; font-weight:800; line-height:1; font-variant-numeric:tabular-nums;">' + n + '</span>' +
        '<span style="font-size:0.6em; font-weight:700; letter-spacing:1px; text-transform:uppercase; opacity:0.8; margin-top:4px;">' + l + '</span></span>';
    }
    function tick() {
      var diff = end - Date.now();
      if (diff <= 0) {
        el.innerHTML = '<div style="font-weight:700;">The founding rate has ended — standard tuition is now ' + window.afMoney(window.AF_STANDARD_PRICE) + ' per seat.</div>';
        return;
      }
      var d = Math.floor(diff / 86400000),
          h = Math.floor((diff % 86400000) / 3600000),
          m = Math.floor((diff % 3600000) / 60000),
          s = Math.floor((diff % 60000) / 1000);
      el.innerHTML =
        '<div style="font-size:0.78em; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; opacity:0.85; margin-bottom:10px;">Founding rate of ' + window.afMoney(window.AF_PROMO_PRICE) + ' ends in</div>' +
        '<div style="display:flex; justify-content:center; flex-wrap:wrap;">' + box(d, 'Days') + box(h, 'Hrs') + box(m, 'Min') + box(s, 'Sec') + '</div>' +
        '<div style="font-size:0.82em; opacity:0.85; margin-top:12px;">After 31 December 2026, standard tuition is ' + window.afMoney(window.AF_STANDARD_PRICE) + ' per seat.</div>';
      setTimeout(tick, 1000);
    }
    tick();
  };
})();

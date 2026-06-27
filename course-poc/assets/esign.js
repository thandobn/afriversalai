// AfriversalAI — shared electronic-signature utilities.
// Every signature in the system carries: a date stamp, a time stamp, a unique
// signing ID, a content fingerprint, and a scannable barcode of the signing ID —
// the visible marks that it is an official, recorded electronic signature.
// Requires JsBarcode (loaded via CDN) for the barcode; degrades gracefully without it.
(function () {
  // The binding consent every user must accept (ECTA 25 of 2002, South Africa).
  window.AF_ESIGN_CONSENT =
    'I agree that signing or accepting electronically in this system is legally binding, ' +
    'and that my electronic signature has the same legal effect as a handwritten (wet-ink) ' +
    'signature under the Electronic Communications and Transactions Act 25 of 2002 (South Africa). ' +
    'I confirm I am the person named and am authorised to sign.';

  // Shorter acknowledgement for sign-up / general acceptance screens.
  window.AF_ESIGN_CONSENT_SHORT =
    'I agree that my electronic signature and acceptances in this system are legally binding ' +
    'and equivalent to a handwritten (wet-ink) signature (ECTA 25 of 2002).';

  // Unique signing ID, e.g. AAI-SIG-LXQ8ZK-7F3Q2
  window.afEsignId = function () {
    var t = Date.now().toString(36).toUpperCase();
    var r = Math.random().toString(36).slice(2, 7).toUpperCase();
    return 'AAI-SIG-' + t + '-' + r;
  };

  // Deterministic content fingerprint (djb2), e.g. FP-1A2B3C4D
  window.afEsignFingerprint = function (s) {
    var h = 5381;
    s = String(s || '');
    for (var i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h >>> 0; }
    return 'FP-' + h.toString(16).toUpperCase();
  };

  // ISO timestamp + a human SAST string for display.
  window.afEsignStamp = function () {
    var now = new Date();
    return {
      iso: now.toISOString(),
      ms: now.getTime(),
      date: now.toISOString().slice(0, 10),
      human: now.toLocaleString('en-ZA', { dateStyle: 'long', timeStyle: 'short' }) + ' SAST'
    };
  };

  // Render a Code128 barcode of `value` into the element matched by `selector`
  // (an <svg> or <canvas>). The barcode encodes the signing ID so it can be
  // scanned / verified, and visually marks the signature as official.
  window.afEsignBarcode = function (selector, value) {
    try {
      if (window.JsBarcode && value) {
        window.JsBarcode(selector, value, {
          format: 'CODE128', width: 1.5, height: 46, displayValue: true,
          fontSize: 11, font: 'ui-monospace, monospace', textMargin: 4, margin: 6,
          lineColor: '#123528', background: '#ffffff'
        });
      }
    } catch (e) { /* barcode is decorative-official; never block signing on it */ }
  };
})();

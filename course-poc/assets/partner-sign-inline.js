// AfriversalAI — in-document fillable signing.
//
// Loaded at the bottom of each signable partner document (nda / agreement /
// commercial-schedule). It:
//   1. Personalises the document to the logged-in partner (fills .af-pname).
//   2. Turns every blank (.fill) in the document into an inline input the partner
//      completes in place.
//   3. Renders a "Sign now" step at the bottom (#af-sign).
//   4. On submit: locks the completed fields into the document, records the
//      signature + field values (Supabase partner_signatures), shows an inline
//      certificate, generates a PDF of the completed & signed document, emails it
//      to the partner AND the AfriversalAI team, and offers a download.
//   5. On reopening a signed document: re-fills the values (read-only) and shows
//      the certificate, so partners can review/download later.
//
// The page must set `window.AF_SIGN_DOC = '<doc key>'` and include a
// <div id="af-sign"></div>. Load before this script: supabase-js, jsbarcode,
// html2pdf, supabase-config.js, auth.js, esign.js, partners.js, partner-data.js,
// email.js.
(function () {
  var TEAM_EMAIL = 'ask@afriversal.ai';
  var DOCS = {
    nda: { title: 'Mutual Non-Disclosure Agreement', file: 'partner-docs/nda.html' },
    agreement: { title: 'Enterprise Partner Agreement', file: 'partner-docs/agreement.html' },
    schedule: { title: 'Partner Commercial Schedule', file: 'partner-docs/commercial-schedule.html' }
  };

  var docKey = window.AF_SIGN_DOC;
  var cfg = DOCS[docKey];
  var container = document.getElementById('af-sign');
  var fillEls = [];
  var lastRec = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sigHash(s) { var h = 5381; for (var i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h >>> 0; } return 'FP-' + h.toString(16).toUpperCase(); }
  function genVerifyId() {
    var t = Date.now().toString(36).toUpperCase(), r = '', a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var arr = new Uint32Array(5); (window.crypto || window.msCrypto).getRandomValues(arr);
    for (var i = 0; i < 5; i++) r += a[arr[i] % a.length];
    return 'AAI-SIG-' + t + '-' + r;
  }

  // ---- 1. Personalise to the logged-in partner ----
  async function personalise() {
    var names = document.querySelectorAll('.af-pname');
    if (!names.length) return;
    var pname = '';
    try { if (typeof getProfile === 'function') { var p = await getProfile(); pname = (p && p.full_name) || ''; } } catch (e) {}
    if (!pname) { try { var s = await getSession(); pname = (s && s.user && s.user.user_metadata && s.user.user_metadata.full_name) || ''; } catch (e) {} }
    if (pname) for (var i = 0; i < names.length; i++) { names[i].textContent = pname; names[i].style.color = 'inherit'; }
  }

  // ---- 2. Turn every .fill blank into an inline input ----
  function makeFillable(savedFields, locked) {
    fillEls = [];
    // .fill = inline blanks/brackets; .sline = signature-block lines (empty spans)
    var nodes = document.querySelectorAll('.fill, .sline');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.closest && node.closest('#af-sign')) continue;       // skip our own block
      if (node.querySelector && node.querySelector('.af-fillin')) continue;
      var isLine = node.classList && node.classList.contains('sline');
      var raw = (node.textContent || '').trim();
      var ph = raw.replace(/_+/g, '').replace(/^[\[\(]+|[\]\)]+$/g, '').trim();
      var key = 'f' + i;
      var isCell = node.tagName === 'TD' || node.tagName === 'TH';
      var widthCh = Math.max(8, Math.min(42, (ph.length || raw.length || 14) + 2));
      var width = isCell ? 'width:100%;box-sizing:border-box;' : (isLine ? 'width:100%;box-sizing:border-box;min-width:120px;' : 'width:' + widthCh + 'ch;max-width:100%;');
      var style = 'font-family:inherit;font-size:1em;color:#123528;border:none;border-bottom:1.5px solid var(--gold-dark,#C9A227);' +
        'background:var(--gold-light,#FDF6E3);padding:1px 6px;border-radius:4px 4px 0 0;' + width;
      if (isLine) node.style.borderBottom = 'none';                 // input supplies the underline
      node.innerHTML = '<input class="af-fillin" data-key="' + key + '" type="text"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' style="' + style + '"' + (locked ? ' readonly' : '') + ' />';
      var input = node.querySelector('.af-fillin');
      if (savedFields && savedFields[key] != null) input.value = savedFields[key];
      if (locked) { input.style.background = 'transparent'; input.style.borderBottomColor = 'var(--border,#E5E7EB)'; }
      fillEls.push({ key: key, input: input, label: ph || raw });
    }
  }
  function collectFields() { var o = {}; fillEls.forEach(function (f) { o[f.key] = (f.input.value || '').trim(); }); return o; }
  function lockFills() { fillEls.forEach(function (f) { f.input.readOnly = true; f.input.style.background = 'transparent'; f.input.style.borderBottomColor = 'var(--border,#E5E7EB)'; }); }

  // ---- 3. Signature step ----
  function renderForm() {
    var gd = 'var(--green-dark,#1B4332)';
    var today = new Date().toISOString().slice(0, 10);
    container.innerHTML =
      '<div id="afs-card" style="background:#fff;border:2px solid ' + gd + ';border-radius:14px;padding:26px 28px;margin:34px 0 10px;box-shadow:0 6px 24px rgba(0,0,0,.08);">' +
        '<div style="font-size:.72em;font-weight:800;text-transform:uppercase;letter-spacing:1.6px;color:var(--gold-dark,#C9A227);">Complete &amp; sign</div>' +
        '<h2 style="color:' + gd + ';font-size:1.4em;margin:6px 0 4px;">Sign this document</h2>' +
        '<p style="color:var(--muted,#667085);font-size:.9em;margin:0 0 20px;">Complete the highlighted fields in the document above, then type your name to sign. Your completed, signed copy is emailed to you and saved to your dashboard.</p>' +
        '<form id="afs-form">' +
          '<div style="margin-bottom:14px;"><label style="display:block;font-size:.84em;font-weight:700;margin-bottom:6px;">Type your full legal name to sign *</label>' +
            '<input type="text" id="afs-name" style="width:100%;border:1.5px solid var(--border,#E5E7EB);border-radius:8px;padding:11px 13px;font-family:inherit;font-size:.95em;" required /></div>' +
          '<div style="border:1.5px dashed var(--gold,#E9C46A);border-radius:8px;background:var(--gold-light,#FDF6E3);padding:14px 16px;margin-bottom:14px;">' +
            '<div id="afs-preview" style="font-family:\'Dancing Script\',cursive;font-size:2em;color:' + gd + ';min-height:1.3em;line-height:1.2;"></div>' +
            '<div style="font-size:.74em;color:var(--muted,#667085);">Your typed name is your electronic signature.</div></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
            '<div style="margin-bottom:14px;"><label style="display:block;font-size:.84em;font-weight:700;margin-bottom:6px;">Capacity / title</label><input type="text" id="afs-title" placeholder="e.g. Director / personal capacity" style="width:100%;border:1.5px solid var(--border,#E5E7EB);border-radius:8px;padding:11px 13px;font-family:inherit;font-size:.95em;" /></div>' +
            '<div style="margin-bottom:14px;"><label style="display:block;font-size:.84em;font-weight:700;margin-bottom:6px;">Date</label><input type="date" id="afs-date" value="' + today + '" style="width:100%;border:1.5px solid var(--border,#E5E7EB);border-radius:8px;padding:11px 13px;font-family:inherit;font-size:.95em;" /></div>' +
          '</div>' +
          '<label style="display:flex;gap:10px;align-items:flex-start;margin:14px 0;font-size:.88em;"><input type="checkbox" id="afs-agree" style="margin-top:3px;" /> <span>I confirm the details I have entered are correct and that I have read and agree to this document. I agree that signing electronically is legally binding and has the same legal effect as a handwritten signature under the Electronic Communications and Transactions Act 25 of 2002. I confirm I am authorised to sign.</span></label>' +
          '<div id="afs-err" style="display:none;background:#FFF5F5;border:1px solid #FCA5A5;color:#7F1D1D;font-size:.85em;border-radius:8px;padding:10px 13px;margin:12px 0;"></div>' +
          '<button type="submit" id="afs-submit" style="width:100%;background:' + gd + ';color:#fff;border:none;border-radius:10px;padding:14px;font-family:inherit;font-size:1em;font-weight:800;cursor:pointer;">Sign &amp; submit &rarr;</button>' +
        '</form></div>';
    document.getElementById('afs-name').addEventListener('input', function () { document.getElementById('afs-preview').textContent = this.value; });
    document.getElementById('afs-form').addEventListener('submit', submitSign);
  }

  function certRow(k, v, mono) {
    return '<tr><td style="padding:9px 12px;border-bottom:1px solid var(--border,#E5E7EB);color:var(--muted,#667085);width:42%;">' + esc(k) +
      '</td><td style="padding:9px 12px;border-bottom:1px solid var(--border,#E5E7EB);font-weight:600;color:var(--green-dark,#1B4332);' + (mono ? 'font-family:ui-monospace,Menlo,monospace;' : '') + '">' + esc(v) + '</td></tr>';
  }
  function renderCertificate(rec, noteHtml) {
    var gd = 'var(--green-dark,#1B4332)';
    var dt = new Date(rec.ts || Date.parse(rec.signed_at) || Date.now());
    container.innerHTML =
      '<div style="background:#fff;border:2px solid var(--green-mid,#2D6A4F);border-radius:14px;padding:30px;margin:34px 0 10px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.08);">' +
        '<div style="width:60px;height:60px;border-radius:50%;background:var(--green-mid,#2D6A4F);color:#fff;font-size:1.9em;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">&#10004;</div>' +
        '<h2 style="color:' + gd + ';font-size:1.35em;margin:0 0 4px;">Signed &amp; recorded</h2>' +
        '<p style="color:var(--muted,#667085);font-size:.92em;margin:0 0 18px;">' + esc(cfg.title) + '</p>' +
        '<table style="width:100%;max-width:460px;margin:0 auto 16px;border-collapse:collapse;text-align:left;font-size:.86em;">' +
          certRow('Signatory', rec.name) + certRow('Capacity', rec.title || '—') +
          certRow('Date signed', dt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })) +
          certRow('Verification ID', rec.verifyId, true) + certRow('Document fingerprint', rec.fingerprint, true) +
        '</table>' +
        '<div style="margin:14px 0 6px;"><svg id="afs-barcode" role="img" aria-label="Signature barcode"></svg>' +
          '<div style="font-size:.7em;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:' + gd + ';margin-top:4px;">&#10004; Officially signed &amp; recorded</div></div>' +
        '<button id="afs-download" style="margin-top:14px;background:var(--gold-dark,#C9A227);color:#1A1A2E;border:none;border-radius:10px;padding:11px 20px;font-family:inherit;font-weight:800;cursor:pointer;">&#11015; Download signed PDF</button>' +
        '<p id="afs-emailnote" style="font-size:.82em;color:var(--muted,#667085);margin:14px 0 0;">' + (noteHtml || '') + '</p>' +
      '</div>';
    if (window.afEsignBarcode) { try { afEsignBarcode('#afs-barcode', rec.verifyId); } catch (e) {} }
    var dl = document.getElementById('afs-download');
    if (dl) dl.addEventListener('click', function () { downloadPdf(rec); });
  }

  function pdfOptions(rec) {
    var fname = (docKey + '-signed-' + rec.verifyId + '.pdf').replace(/[^A-Za-z0-9._-]/g, '');
    return {
      margin: [10, 10, 12, 10], filename: fname,
      image: { type: 'jpeg', quality: 0.9 },
      html2canvas: { scale: 1.3, useCORS: true, scrollX: 0, scrollY: 0, windowWidth: document.documentElement.scrollWidth },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
  }
  async function downloadPdf(rec) {
    if (!window.html2pdf) return;
    try { await html2pdf().set(pdfOptions(rec)).from(document.body).save(); } catch (e) {}
  }

  async function submitSign(e) {
    e.preventDefault();
    var err = document.getElementById('afs-err'); err.style.display = 'none';
    var name = (document.getElementById('afs-name').value || '').trim();
    var agree = document.getElementById('afs-agree').checked;
    function fail(m) { err.textContent = m; err.style.display = 'block'; }
    if (!name) { fail('Type your full name to sign.'); return; }
    if (!agree) { fail('Please tick the agreement box to confirm.'); return; }

    var now = new Date();
    var fields = collectFields();
    var rec = {
      name: name, title: (document.getElementById('afs-title').value || '').trim(),
      date: document.getElementById('afs-date').value, fields: fields,
      ts: now.getTime(), signedAt: now.toISOString(), signed_at: now.toISOString(), verifyId: genVerifyId()
    };
    rec.fingerprint = sigHash(docKey + '|' + name + '|' + JSON.stringify(fields) + '|' + rec.signedAt);
    lastRec = rec;

    var btn = document.getElementById('afs-submit'); btn.disabled = true; btn.textContent = 'Recording signature…';
    try { await savePartnerSignature(docKey, rec); }
    catch (ex) { fail('Could not record your signature. Please make sure you are signed in as a partner and try again.'); btn.disabled = false; btn.textContent = 'Sign & submit →'; return; }

    lockFills();                         // freeze the completed fields into the document
    renderCertificate(rec, 'Preparing your signed copy…');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    finishWithEmail(rec);
  }

  async function finishWithEmail(rec) {
    var note = document.getElementById('afs-emailnote');
    var partnerEmail = '';
    try { var s = await getSession(); partnerEmail = (s && s.user && s.user.email) || ''; } catch (e) {}
    var docUrl = 'https://app.afriversal.ai/' + cfg.file;
    var signedAtText = new Date(rec.ts).toLocaleString('en-ZA', { dateStyle: 'long', timeStyle: 'short' }) + ' SAST';

    var attachments = [];
    try {
      if (window.html2pdf) {
        var dataUri = await html2pdf().set(pdfOptions(rec)).from(document.body).outputPdf('datauristring');
        var base64 = (dataUri.split(',')[1]) || '';
        // Keep the attachment within a safe request size (~9MB base64); if the
        // PDF is bigger, send the confirmation without it (download still works).
        if (base64 && base64.length < 9000000) attachments.push({ filename: pdfOptions(rec).filename, content: base64 });
      }
    } catch (e) {}

    try {
      if (window.afSendEmail && window.afEmail) {
        var recipients = partnerEmail ? [partnerEmail, TEAM_EMAIL] : [TEAM_EMAIL];
        var build = function () {
          var m = afEmail.signatureConfirmation({
            name: rec.name, email: partnerEmail || TEAM_EMAIL, docName: cfg.title, docUrl: docUrl,
            verifyId: rec.verifyId, fingerprint: rec.fingerprint, signedAtText: signedAtText, capacity: rec.title
          });
          m.to = recipients; return m;
        };
        var msg = build();
        if (attachments.length) msg.attachments = attachments;
        var r = await afSendEmail(msg);
        // If sending with the attachment failed, retry without it so the
        // confirmation still gets through.
        if ((!r || !r.ok) && attachments.length) { r = await afSendEmail(build()); }
        if (note) note.innerHTML = (r && r.ok)
          ? '&#10004; A signed copy has been emailed to ' + esc(partnerEmail || 'you') + ' and the AfriversalAI team. You can download it above any time.'
          : 'Your signature is recorded. (The confirmation email could not be sent right now — you can still download the PDF above.)';
      } else if (note) { note.textContent = 'Your signature is recorded.'; }
    } catch (e) { if (note) note.textContent = 'Your signature is recorded.'; }
  }

  // ---- init ----
  async function init() {
    await personalise();
    if (!cfg || !container) return;
    var signed = null;
    try {
      if (typeof loadPartner === 'function') {
        var pd = await loadPartner();
        if (pd && pd.signed && pd.signed[docKey]) signed = pd.signed[docKey];
      }
    } catch (e) {}
    if (signed) {
      makeFillable(signed.fields || {}, true);   // re-fill (read-only) for review
      renderCertificate(signed, 'You signed this document on ' +
        new Date(signed.signed_at || signed.ts || Date.now()).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) +
        '. Download your signed copy below.');
    } else {
      makeFillable(null, false);                 // editable for completion
      renderForm();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

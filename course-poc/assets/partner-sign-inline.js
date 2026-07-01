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
  // AfriversalAI's authorised signatories — auto-applied (counter-signed) the
  // moment the partner signs, so the emailed form is fully executed.
  var AF_SIGNATORY1 = { name: 'Thurston R. Davis II', title: 'Executive Director' };
  var AF_SIGNATORY2 = { name: 'Ntando Barbara Davis', title: 'Co-Founder' };
  var DOCS = {
    nda: { title: 'Mutual Non-Disclosure Agreement', file: 'partner-docs/nda.html' },
    agreement: { title: 'Enterprise Partner Agreement', file: 'partner-docs/agreement.html' },
    schedule: { title: 'Partner Commercial Schedule', file: 'partner-docs/commercial-schedule.html' },
    'corporate-contract': { title: 'Enterprise Master Services Agreement (Publication 010)', file: 'corporate-contract.html' },
    mnda: { title: 'Enterprise Mutual Non-Disclosure Agreement (Publication 005)', file: 'mnda.html' },
    'commercial-schedule': { title: 'Enterprise Commercial Schedule (Publication 011)', file: 'publication-011.html' },
    sow: { title: 'Enterprise Statement of Work (Publication 012)', file: 'publication-012.html' },
    sla: { title: 'Enterprise Service Level Agreement (Publication 009)', file: 'publication-009.html' },
    dpa: { title: 'Data Processing &amp; Privacy Addendum (Publication 008)', file: 'publication-008.html' },
    aup: { title: 'Acceptable Use Policy (Publication 007)', file: 'publication-007.html' },
    'cert-policy': { title: 'Certification, Assessment &amp; Credentialing Policy (Publication 016)', file: 'publication-016.html' },
    'ip-policy': { title: 'Intellectual Property, Brand &amp; Innovation Policy (Publication 017)', file: 'publication-017.html' },
    'partner-agreement-002': { title: 'Enterprise Partner Agreement (Publication 002)', file: 'publication-002.html' },
    charter: { title: 'Executive Project Charter (Publication 003)', file: 'publication-003.html' }
  };

  var docKey = window.AF_SIGN_DOC;
  var cfg = DOCS[docKey];
  var container = document.getElementById('af-sign');
  var fillEls = [];
  var chkEls = [];
  var chkLocked = false;
  var lastRec = null;
  var corpData = null;   // logged-in corporate's record, for prefilling customer details

  // ---- semantic label derivation (clean, self-describing field keys) ----
  function groupOf(node) {
    var blk = node.closest && node.closest('.sigblock');
    if (blk) { var h = blk.querySelector('.party__h'); var t = (h && h.textContent || '').trim(); return /afriversal/i.test(t) ? 'AfriversalAI' : 'Partner'; }
    return '';
  }
  function labelFor(node, isLine) {
    if (node.tagName === 'TD' || node.tagName === 'TH') {
      var tr = node.closest('tr'); if (tr) { var first = tr.querySelector('td,th'); if (first && first !== node) return (first.textContent || '').trim(); }
    }
    if (isLine) { var row = node.closest('.sigrow'); if (row) { var lbl = row.querySelector('.lbl'); if (lbl) return (lbl.textContent || '').trim(); } }
    var raw = (node.textContent || '').trim().replace(/_+/g, '').replace(/^[\[\(]+|[\]\)]+$/g, '').trim();
    if (raw) return raw;
    var prev = node.previousSibling, t = '';
    while (prev && !t) { t = (prev.textContent || '').trim(); prev = prev.previousSibling; }
    return t || 'Field';
  }
  function blobToBase64(blob) { return new Promise(function (res) { var r = new FileReader(); r.onloadend = function () { res(((r.result || '') + '').split(',')[1] || ''); }; r.readAsDataURL(blob); }); }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sigHash(s) { var h = 5381; for (var i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h >>> 0; } return 'FP-' + h.toString(16).toUpperCase(); }
  function genVerifyId() {
    var t = Date.now().toString(36).toUpperCase(), r = '', a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var arr = new Uint32Array(5); (window.crypto || window.msCrypto).getRandomValues(arr);
    for (var i = 0; i < 5; i++) r += a[arr[i] % a.length];
    return 'AAI-SIG-' + t + '-' + r;
  }

  // ---- 1. Personalise to the logged-in signer + prefill customer details ----
  async function personalise() {
    var pname = '';
    try { if (typeof getProfile === 'function') { var p = await getProfile(); pname = (p && p.full_name) || ''; } } catch (e) {}
    if (!pname) { try { var s = await getSession(); pname = (s && s.user && s.user.user_metadata && s.user.user_metadata.full_name) || ''; } catch (e) {} }
    // Load the corporate's record (if the signer is a corporate) for prefilling.
    try { var ss = await getSession(); if (ss && ss.user && ss.user.email) { corpData = (await _supabase.from('corporates').select('*').eq('email', (ss.user.email || '').toLowerCase()).maybeSingle()).data || null; } } catch (e) {}
    var fillSpan = function (cls, val) { if (val == null || val === '') return; var els = document.querySelectorAll('.' + cls); for (var i = 0; i < els.length; i++) { els[i].textContent = val; els[i].style.color = 'inherit'; } };
    fillSpan('af-pname', pname);
    if (corpData) { fillSpan('af-cname', corpData.company_name); fillSpan('af-cemail', corpData.email); fillSpan('af-csector', corpData.sector); }
  }

  // ---- 2. Turn every .fill blank into an inline input ----
  function makeFillable(savedFields, locked) {
    fillEls = [];
    var usedKeys = {};
    // .fill = inline blanks/brackets; .sline = signature-block lines (empty spans)
    var nodes = document.querySelectorAll('.fill, .sline');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.closest && node.closest('#af-sign')) continue;       // skip our own block
      if (node.querySelector && node.querySelector('.af-fillin')) continue;
      var isLine = node.classList && node.classList.contains('sline');
      // The AfriversalAI execution block is NOT partner-fillable — it's
      // counter-signed by AfriversalAI on ratification. Leave it untouched.
      if (groupOf(node) === 'AfriversalAI') continue;
      var raw = (node.textContent || '').trim();
      var ph = raw.replace(/_+/g, '').replace(/^[\[\(]+|[\]\)]+$/g, '').trim();
      // Build a clean, human-readable, stable key (e.g. "Partner — Capacity").
      var grp = groupOf(node), lab = labelFor(node, isLine);
      var base = (grp ? grp + ' — ' : '') + lab;
      var key = base, n = 2; while (usedKeys[key]) { key = base + ' (' + n + ')'; n++; }
      usedKeys[key] = true;
      var isCell = node.tagName === 'TD' || node.tagName === 'TH';
      var widthCh = Math.max(8, Math.min(42, (ph.length || raw.length || 14) + 2));
      var width = isCell ? 'width:100%;box-sizing:border-box;' : (isLine ? 'width:100%;box-sizing:border-box;min-width:120px;' : 'width:' + widthCh + 'ch;max-width:100%;');
      var style = 'font-family:inherit;font-size:1em;color:#123528;border:none;border-bottom:1.5px solid var(--gold-dark,#C9A227);' +
        'background:var(--gold-light,#FDF6E3);padding:1px 6px;border-radius:4px 4px 0 0;' + width;
      if (isLine) node.style.borderBottom = 'none';                 // input supplies the underline
      node.innerHTML = '<input class="af-fillin" data-key="' + key + '" type="text"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' style="' + style + '"' + (locked ? ' readonly' : '') + ' />';
      var input = node.querySelector('.af-fillin');
      if (savedFields && savedFields[key] != null) input.value = savedFields[key];
      else { var pf = node.getAttribute && node.getAttribute('data-prefill'); if (pf && corpData && corpData[pf] != null && corpData[pf] !== '') input.value = corpData[pf]; }
      if (locked) { input.style.background = 'transparent'; input.style.borderBottomColor = 'var(--border,#E5E7EB)'; }
      fillEls.push({ key: key, input: input, label: base });
    }
  }
  // Turn display-only checkbox glyphs (.chk = ☐) into clickable toggles.
  function makeCheckable(savedFields, locked) {
    chkEls = [];
    var usedKeys = {};
    var spans = document.querySelectorAll('.chk');
    function process(span) {
      if (span.closest && span.closest('#af-sign')) return;
      var optNode = span.nextSibling;
      var opt = (optNode && optNode.nodeType === 3) ? optNode.textContent.replace(/ /g, ' ').trim() : '';
      var grp = '';
      var tr = span.closest && span.closest('tr');
      if (tr) { var first = tr.querySelector('td,th'); if (first) grp = (first.textContent || '').trim(); }
      var base = (grp ? grp + ': ' : '') + (opt || 'option');
      var key = base, n = 2; while (usedKeys[key]) { key = base + ' (' + n + ')'; n++; }
      usedKeys[key] = true;
      var checked = !!(savedFields && savedFields[key]);
      function paint() { span.innerHTML = checked ? '&#9745;' : '&#9744;'; span.style.color = checked ? 'var(--green-mid,#2D6A4F)' : ''; span.style.fontWeight = checked ? '800' : ''; }
      if (!locked) { span.style.cursor = 'pointer'; span.title = 'Click to select'; }
      paint();
      span.addEventListener('click', function () { if (chkLocked) return; checked = !checked; paint(); });
      chkEls.push({ key: key, get: function () { return checked; } });
    }
    for (var i = 0; i < spans.length; i++) process(spans[i]);
    if (locked) chkLocked = true;
  }

  function collectFields() {
    var o = {};
    fillEls.forEach(function (f) { var v = (f.input.value || '').trim(); if (v) o[f.key] = v; });
    chkEls.forEach(function (c) { if (c.get()) o[c.key] = 'Yes'; });
    return o;
  }
  function lockFills() {
    fillEls.forEach(function (f) { f.input.readOnly = true; f.input.style.background = 'transparent'; f.input.style.borderBottomColor = 'var(--border,#E5E7EB)'; });
    chkEls.forEach(function (c) { /* state frozen via chkLocked */ });
    chkLocked = true;
  }

  // Auto-apply AfriversalAI's counter-signature into the AfriversalAI execution
  // block (Signature 1 = signatory, Signature 2 = witness). Runs on partner
  // signing and when reopening a signed doc, so the form is fully executed.
  function autoSignAfriversal() {
    // Static AfriversalAI execution details (identical on every form). The date
    // is dynamic (today); the signature lines are auto-applied by the system.
    var NAME = 'Thurston R. Davis II', TITLE = 'Managing Partner / Co-Founder', NOTICE = 'ask@afriversal.ai';
    var today = fmtDate(Date.now());
    var script = function (txt) { return '<span style="font-family:\'Great Vibes\',\'Dancing Script\',cursive;font-size:1.35em;line-height:1;white-space:nowrap;color:var(--green-dark,#1B4332);">' + esc(txt) + '</span>'; };
    var blocks = document.querySelectorAll('.sigblock');
    for (var b = 0; b < blocks.length; b++) {
      var blk = blocks[b];
      var h = blk.querySelector('.party__h');
      if (!h || !/afriversal/i.test(h.textContent || '')) continue;
      var rows = blk.querySelectorAll('.sigrow');
      for (var r = 0; r < rows.length; r++) {
        var lbl = rows[r].querySelector('.lbl'); var line = rows[r].querySelector('.sline, .fill');
        if (!lbl || !line) continue;
        var L = (lbl.textContent || '').toLowerCase().trim();
        var html = null;
        if (/witness/.test(L)) html = '';                                   // witness lines left blank
        else if (/authorised signatory|signature/.test(L)) html = script(NAME);
        else if (/^name/.test(L)) html = esc(NAME);
        else if (/title|capacity/.test(L)) html = esc(TITLE);
        else if (/date/.test(L)) html = esc(today);
        else if (/notice/.test(L)) html = esc(NOTICE);
        if (html !== null) { line.innerHTML = html; line.style.borderBottom = (html === '') ? '' : 'none'; }
      }
    }
  }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }); }

  // Remove redundant signature rows: Witness 1/2 from BOTH parties, and the
  // 'Signature' row from the PARTNER side (they sign in the form below).
  function pruneSignatureRows() {
    var blocks = document.querySelectorAll('.sigblock');
    for (var b = 0; b < blocks.length; b++) {
      var blk = blocks[b];
      var h = blk.querySelector('.party__h');
      var isAF = h && /afriversal/i.test(h.textContent || '');
      var rows = blk.querySelectorAll('.sigrow');
      for (var r = 0; r < rows.length; r++) {
        var lbl = rows[r].querySelector('.lbl');
        var L = (lbl && lbl.textContent || '').toLowerCase().trim();
        if (/witness/.test(L) || (!isAF && /^signature$/.test(L))) {
          if (rows[r].parentNode) rows[r].parentNode.removeChild(rows[r]);
        }
      }
    }
  }

  // Make empty data-entry table rows (e.g. Protected Accounts, Named Exclusions)
  // fillable: every empty body cell becomes an input keyed by column + row.
  function makeTablesFillable(savedFields, locked) {
    var tables = document.querySelectorAll('table');
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      if (table.closest && table.closest('#af-sign')) continue;
      var heads = table.querySelectorAll('thead th');
      if (!heads.length) continue;                       // need a header row to label columns
      var cols = []; for (var c = 0; c < heads.length; c++) cols.push((heads[c].textContent || '').trim());
      var caption = '';
      var prev = table.previousElementSibling;
      while (prev && !caption) { var tx = (prev.textContent || '').trim(); if (tx) caption = tx; prev = prev.previousElementSibling; }
      var bodyRows = table.querySelectorAll('tbody tr');
      var rowIdx = 0;
      for (var br = 0; br < bodyRows.length; br++) {
        var cells = bodyRows[br].children;
        // Only treat rows whose cells are ALL empty as data-entry rows.
        var allEmpty = true;
        for (var ci = 0; ci < cells.length; ci++) { if ((cells[ci].textContent || '').replace(/\s| /g, '').length) { allEmpty = false; break; } }
        if (!allEmpty) continue;
        rowIdx++;
        for (var ci2 = 0; ci2 < cells.length; ci2++) {
          var cell = cells[ci2];
          if (cell.querySelector && cell.querySelector('.af-fillin')) continue;
          var colName = cols[ci2] || ('Col ' + (ci2 + 1));
          var key = (caption ? caption + ' — ' : '') + colName + ' (row ' + rowIdx + ')';
          var style = 'width:100%;box-sizing:border-box;font-family:inherit;font-size:1em;color:#123528;border:none;border-bottom:1.5px solid var(--gold-dark,#C9A227);background:var(--gold-light,#FDF6E3);padding:4px 6px;border-radius:4px 4px 0 0;';
          cell.innerHTML = '<input class="af-fillin" data-key="' + esc(key) + '" type="text" style="' + style + '"' + (locked ? ' readonly' : '') + ' />';
          var input = cell.querySelector('.af-fillin');
          if (savedFields && savedFields[key] != null) input.value = savedFields[key];
          if (locked) { input.style.background = 'transparent'; input.style.borderBottomColor = 'var(--border,#E5E7EB)'; }
          fillEls.push({ key: key, input: input, label: key });
        }
      }
    }
  }

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
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: ['tr', '.sigblock', '.cert', '.keynote', 'img', 'h1', 'h2', 'h3'] }
    };
  }
  // Inject transient CSS so blocks don't split across PDF pages, then remove it.
  function pdfStyle(on) {
    var id = 'af-pdf-style', ex = document.getElementById(id);
    if (on) {
      if (ex) return;
      var s = document.createElement('style'); s.id = id;
      s.textContent = 'tr,td,th,.sigblock,.cert,.keynote,.doc-card,table,img,figure,blockquote{page-break-inside:avoid!important;break-inside:avoid!important;}' +
        'h1,h2,h3,.party__h,.section-label{page-break-after:avoid!important;break-after:avoid-page!important;}';
      document.head.appendChild(s);
    } else if (ex) { ex.remove(); }
  }
  async function makePdf(rec, mode) {
    pdfStyle(true);
    try {
      if (mode === 'save') return await html2pdf().set(pdfOptions(rec)).from(document.body).save();
      return await html2pdf().set(pdfOptions(rec)).from(document.body).outputPdf('blob');
    } finally { pdfStyle(false); }
  }
  async function downloadPdf(rec) {
    // Prefer the archived copy in storage; fall back to regenerating.
    if (rec && rec.pdf_path && typeof _supabase !== 'undefined') {
      try { var s = await _supabase.storage.from('signed-docs').createSignedUrl(rec.pdf_path, 3600); if (s && s.data && s.data.signedUrl) { window.open(s.data.signedUrl, '_blank'); return; } } catch (e) {}
    }
    if (window.html2pdf) { try { await makePdf(rec, 'save'); } catch (e) {} }
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
    catch (ex) { fail('Could not record your signature. Please make sure you are signed in and try again.'); btn.disabled = false; btn.textContent = 'Sign & submit →'; return; }

    // Corporate contract: flag the corporate as contract-signed.
    if (docKey === 'corporate-contract') {
      try { var _cs = await getSession(); if (_cs && _cs.user) await _supabase.from('corporates').update({ contract_signed: true }).eq('email', (_cs.user.email || '').toLowerCase()); } catch (e) {}
    }

    lockFills();                         // freeze the completed fields into the document
    autoSignAfriversal(fmtDate(rec.ts)); // counter-sign AfriversalAI's side automatically
    renderCertificate(rec, 'Preparing your signed copy…');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    finishWithEmail(rec);
  }

  async function finishWithEmail(rec) {
    var note = document.getElementById('afs-emailnote');
    var partnerEmail = '', uid = '';
    try { var s = await getSession(); partnerEmail = (s && s.user && s.user.email) || ''; uid = (s && s.user && s.user.id) || ''; } catch (e) {}
    var docUrl = 'https://app.afriversal.ai/' + cfg.file;
    var signedAtText = new Date(rec.ts).toLocaleString('en-ZA', { dateStyle: 'long', timeStyle: 'short' }) + ' SAST';

    var attachments = [];
    try {
      if (window.html2pdf) {
        var blob = await makePdf(rec);
        var base64 = await blobToBase64(blob);
        // Archive a copy of the signed PDF to Supabase Storage (best-effort).
        try {
          if (uid && typeof _supabase !== 'undefined') {
            var path = uid + '/' + (docKey + '-' + rec.verifyId + '.pdf').replace(/[^A-Za-z0-9._\/-]/g, '');
            var up = await _supabase.storage.from('signed-docs').upload(path, blob, { upsert: true, contentType: 'application/pdf' });
            if (!up.error) {
              rec.pdf_path = path;
              try { await _supabase.from('partner_signatures').update({ pdf_path: path }).eq('partner_email', partnerEmail).eq('doc_key', docKey); } catch (e) {}
            }
          }
        } catch (e) {}
        // Keep the email attachment within a safe request size (~9MB base64).
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
    // Load signature-style fonts for the auto-applied signatures.
    if (!document.getElementById('af-sig-font')) {
      var lk = document.createElement('link'); lk.id = 'af-sig-font'; lk.rel = 'stylesheet';
      lk.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@600&display=swap';
      document.head.appendChild(lk);
    }
    await personalise();
    if (!cfg || !container) return;
    pruneSignatureRows();                          // drop witness rows + partner Signature row
    var signed = null;
    try {
      if (typeof loadPartner === 'function') {
        var pd = await loadPartner();
        if (pd && pd.signed && pd.signed[docKey]) signed = pd.signed[docKey];
      }
    } catch (e) {}
    if (signed) {
      makeFillable(signed.fields || {}, true);   // re-fill (read-only) for review
      makeCheckable(signed.fields || {}, true);
      makeTablesFillable(signed.fields || {}, true);
      autoSignAfriversal(fmtDate(signed.signed_at || signed.ts || Date.now()));
      renderCertificate(signed, 'You signed this document on ' +
        new Date(signed.signed_at || signed.ts || Date.now()).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) +
        '. Download your signed copy below.');
    } else {
      makeFillable(null, false);                 // editable for completion
      makeCheckable(null, false);
      makeTablesFillable(null, false);
      autoSignAfriversal('1 June 2026');          // AfriversalAI side is static & pre-signed by the system
      renderForm();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// AfriversalAI — replace tacky emojis with clean, custom line icons.
// One script, included site-wide: it walks text nodes and swaps any mapped
// emoji for an inline SVG sized to the surrounding text (inherits colour via
// currentColor). Unmapped emojis are left untouched.
(function () {
  // 24×24 line-icon path sets (feather-style). Keyed by the emoji's base char.
  var P = {
    '🎓': '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>',
    '📹': '<rect x="2" y="6" width="13" height="12" rx="2"/><path d="M22 8l-5 4 5 4V8z"/>',
    '📅': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    '🔒': '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    '🤝': '<path d="M8 13l2.5 2.5a2 2 0 0 0 2.8 0L20 9"/><path d="M4 8l4-4 4 3 4-3 4 4"/><path d="M4 8v5l4 4M20 8v5"/>',
    '💻': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
    '🔍': '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    '📋': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 10h6M9 14h6"/>',
    '📊': '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>',
    '💳': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    '🏛': '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10"/><path d="M12 3l9 5H3l9-5z"/>',
    '🏆': '<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3"/><path d="M10 13v4M9 21h6M12 17v4"/>',
    '🎯': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    '🌍': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
    '🤖': '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>',
    '🛡': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    '🚀': '<path d="M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5M9 19l-4-4 8.5-8.5a5 5 0 0 1 5-1.5 5 5 0 0 1-1.5 5L9 19z"/><circle cx="14.5" cy="9.5" r="1"/>',
    '📱': '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    '📧': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    '💰': '<circle cx="12" cy="13" r="8"/><path d="M12 9v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3h4"/>',
    '💡': '<path d="M9 18h6M10 21h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    '🏦': '<path d="M3 10l9-6 9 6M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M3 21h18"/>',
    '🏥': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>',
    '🏢': '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    '🏅': '<circle cx="12" cy="15" r="6"/><path d="M9 3l3 6 3-6"/><path d="M12 13l1 2h-2l1-2z"/>',
    '🌱': '<path d="M12 22V12M12 12C12 8 9 6 4 6c0 5 3 7 8 7zM12 14c0-3 2.5-5 7-5 0 4-2.5 6-7 6z"/>',
    '⭐': '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.6 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3z"/>',
    '✍': '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    '🧭': '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
    '🧩': '<path d="M9 4a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 1 0-4V4h5z"/>',
    '🧠': '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 5 1V3zM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-5 1V3z"/>',
    '🛠': '<path d="M14 7a3.5 3.5 0 0 1 4.7 4.7L21 14M14 7l-2 2M14 7L9.5 2.5a3.5 3.5 0 0 0-4.7 4.7L9 12M3 21l6-6"/>',
    '⚖': '<path d="M12 3v18M7 21h10M5 7h14l-3 6a3 3 0 0 1-6 0L5 7zM5 7l3 6a3 3 0 0 1-6 0L5 7z"/><circle cx="12" cy="4" r="1"/>',
    '🔥': '<path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s3 1 4-6z"/>',
    '📈': '<path d="M3 17l6-6 4 4 7-8"/><path d="M21 7v5h-5"/>',
    '📉': '<path d="M3 7l6 6 4-4 7 8"/><path d="M21 17v-5h-5"/>',
    '👋': '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1V4.5a1.5 1.5 0 0 1 3 0V10m0-.5V6a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2.2L4 13a1.5 1.5 0 0 1 2.4-1.8L8 13"/>',
    '💸': '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v6M18 9v6"/>',
    '👩‍🏫': '<path d="M3 4h13v9H3z"/><path d="M9 13v3M6 19h6"/><circle cx="19" cy="7" r="2"/><path d="M16 19a3 3 0 0 1 6 0"/>',
    '🎵': '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    '✅': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    '✔': '<path d="M5 13l4 4L19 7"/>',
    '❌': '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    '✗': '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  // Longest keys first so multi-codepoint sequences (e.g. 👩‍🏫) match before parts.
  var keys = Object.keys(P).sort(function (a, b) { return b.length - a.length; });
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var re = new RegExp('(' + keys.map(esc).join('|') + ')\\uFE0F?', 'gu');

  function svg(em) {
    var base = em.replace(/️/g, '');
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="width:1em;height:1em;vertical-align:-0.14em;display:inline-block;">' + (P[base] || '') + '</svg>';
  }

  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (!t) return;
      re.lastIndex = 0;
      if (!re.test(t)) return;
      re.lastIndex = 0;
      var holder = document.createElement('span');
      holder.innerHTML = t.replace(re, function (m) { return svg(m); });
      var frag = document.createDocumentFragment();
      while (holder.firstChild) frag.appendChild(holder.firstChild);
      node.parentNode.replaceChild(frag, node);
      return;
    }
    if (node.nodeType === 1) {
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'SVG' || tag === 'INPUT') return;
      var kids = Array.prototype.slice.call(node.childNodes);
      for (var i = 0; i < kids.length; i++) walk(kids[i]);
    }
  }

  window.afIconSwap = function () { try { walk(document.body); } catch (e) {} };
  if (document.readyState !== 'loading') window.afIconSwap();
  else document.addEventListener('DOMContentLoaded', window.afIconSwap);
  // Re-run shortly after load to catch i18n / JS-rendered content (dashboards, etc.)
  window.addEventListener('load', function () { setTimeout(window.afIconSwap, 400); });
})();

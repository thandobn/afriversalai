// AfriversalAI — approved Enterprise Partner allowlist (POC access control).
// Add an approved partner's account email here to grant Partner Portal access.
// Loaded by partner-login.html and partner-portal.html.
//
// NOTE (production): GitHub Pages serves every repo file publicly, so this gates
// the PAGE, not the FILES. For real confidentiality, move partner-docs to Supabase
// Storage and serve them via short-lived signed URLs keyed to this allowlist.
window.PARTNER_EMAILS = [
  'gorentaride@gmail.com',
  'partner@afriversal.ai',
  'partners@afriversal.ai',
];
window.isPartnerEmail = function (email) {
  return !!email && window.PARTNER_EMAILS
    .map(function (e) { return e.toLowerCase(); })
    .indexOf(String(email).toLowerCase()) !== -1;
};

// AfriversalAI — facilitator / admin allowlist (POC access control).
// Add a facilitator's account email here to grant Instructor Console access.
// Loaded by admin-login.html, admin.html, and dashboard.html.
window.ADMIN_EMAILS = [
  'ask@afriversal.ai',
  'afriversalai@gmail.com',
  'facilitator@afriversal.ai',
];
window.isAdminEmail = function (email) {
  return !!email && window.ADMIN_EMAILS
    .map(function (e) { return e.toLowerCase(); })
    .indexOf(String(email).toLowerCase()) !== -1;
};

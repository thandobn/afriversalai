// AfriversalAI — transactional email helper.
//
// The site is static, so it cannot send email directly. This helper calls a
// Supabase Edge Function ("send-email") which holds the provider API key
// server-side and sends via Resend. Deploy that function (see
// supabase/functions/send-email/index.ts) and set the RESEND_API_KEY +
// EMAIL_FROM secrets — until then afSendEmail() is a safe no-op that returns
// { ok:false, reason:'not_configured' } and never breaks the calling flow.
//
// Usage (works at any stage of any flow):
//   await afSendEmail({ to, subject, html, text, replyTo });
//   await afSendEmail(afEmail.partnerWelcome({ name, email, code, level }));
(function () {
  function endpoint() {
    if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL) return null;
    return SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/' + (window.AF_EMAIL_FN_NAME || 'send-email');
  }

  // Never throws — email must never break signup/approval flows.
  window.afSendEmail = async function (msg) {
    try {
      if (!msg || !msg.to) return { ok: false, reason: 'no_recipient' };
      var url = endpoint();
      if (!url) return { ok: false, reason: 'not_configured' };
      var headers = { 'Content-Type': 'application/json' };
      if (typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) {
        headers['Authorization'] = 'Bearer ' + SUPABASE_ANON_KEY;
        headers['apikey'] = SUPABASE_ANON_KEY;
      }
      var res = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(msg) });
      if (!res.ok) {
        var t = '';
        try { t = await res.text(); } catch (e) {}
        if (res.status === 404) return { ok: false, reason: 'not_configured' };
        return { ok: false, status: res.status, error: t };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  };

  // ---- Branded templates (one place to edit copy) ----
  var ORIGIN = (typeof location !== 'undefined' && location.origin) ? location.origin : 'https://afriversal.ai';
  var BASE = ORIGIN + (typeof location !== 'undefined' && /\/course-poc\//.test(location.pathname) ? '/course-poc' : '');

  function wrap(title, bodyHtml) {
    return '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A2E;">' +
      '<div style="background:#1B4332;color:#fff;padding:22px 28px;border-radius:12px 12px 0 0;">' +
      '<strong style="font-size:18px;letter-spacing:.3px;">AfriversalAI</strong></div>' +
      '<div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:28px;">' +
      '<h2 style="color:#1B4332;font-size:20px;margin:0 0 14px;">' + title + '</h2>' + bodyHtml +
      '<p style="font-size:12px;color:#6B7280;margin-top:26px;">AfriversalAI · African professionals. Global impact.</p>' +
      '</div></div>';
  }
  function btn(href, label) {
    return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#1B4332;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;display:inline-block;">' + label + '</a></p>';
  }

  window.afEmail = {
    partnerWelcome: function (p) {
      var body = '<p>Hi ' + (p.name || 'there') + ',</p>' +
        '<p>Your AfriversalAI Enterprise Partner account has been approved. You can now sign in to the Partner Portal to register corporates, create cohorts and track your commission.</p>' +
        (p.code ? '<p><strong>Your partner code:</strong> <code style="font-family:monospace;">' + p.code + '</code></p>' : '') +
        (p.level ? '<p><strong>Accreditation level:</strong> ' + p.level + '</p>' : '') +
        '<p><strong>Sign in with:</strong> ' + (p.email || 'your registered email') + '</p>' +
        btn(BASE + '/partner-login.html', 'Open the Partner Portal');
      return { to: p.email, subject: 'Your AfriversalAI Partner account is approved', html: wrap('Welcome to the Partner Programme', body) };
    },
    learnerWelcome: function (p) {
      var body = '<p>Hi ' + (p.name || 'there') + ',</p>' +
        '<p>Welcome to AfriversalAI. Your account is ready &mdash; sign in any time to continue building your AI judgment.</p>' +
        (p.cohort ? '<p><strong>Cohort:</strong> ' + p.cohort + '</p>' : '') +
        (p.memberId ? '<p><strong>Your Member ID:</strong> <code style="font-family:monospace;">' + p.memberId + '</code> (this appears on your certificate)</p>' : '') +
        btn(BASE + '/dashboard.html', 'Go to your dashboard');
      return { to: p.email, subject: 'Welcome to AfriversalAI', html: wrap('Your account is ready', body) };
    },
    cohortCode: function (p) {
      var body = '<p>Hi ' + (p.name || 'there') + ',</p>' +
        '<p>The AfriversalAI cohort for <strong>' + (p.org || 'your organisation') + '</strong> is live. Share this access code with your team &mdash; each person enters it when registering to join the cohort.</p>' +
        '<p style="font-size:22px;font-weight:800;color:#1B4332;font-family:monospace;letter-spacing:1px;">' + (p.code || '') + '</p>' +
        btn(BASE + '/register.html', 'Register page');
      return { to: p.email, subject: 'Your AfriversalAI cohort access code', html: wrap('Your cohort is ready', body) };
    }
  };
})();

// AfriversalAI — Layer 3 specialist cohort registrations.
// Used by the cohort pages (register), the learner dashboard (my cohorts),
// and the admin console (all registrations). Requires supabase-config.js + auth.js.
(function () {
  // Registry of Layer 3 cohorts and their pages.
  window.AF_COHORTS = {
    'ai-policy': { name: 'Certified AI Policy Practitioner™', label: 'AI Policy Cohort', page: 'cohort-ai-policy.html',
      blurb: 'For professionals who write, evaluate or influence AI policy. A guided 6-week build — you finish a board-ready AI policy for your own organisation.' },
    'ai-governance': { name: 'Certified AI Governance Practitioner™', label: 'AI Governance Cohort', page: 'cohort-ai-governance.html',
      blurb: 'For compliance, risk and audit professionals. You leave with a complete, auditable AI governance framework for your organisation — risk register, workflows and board reporting.' },
    'ai-regulation': { name: 'Certified AI Regulation Practitioner™', label: 'AI Regulation Cohort', page: 'cohort-ai-regulation.html',
      blurb: 'For lawyers, regulators and compliance specialists. You leave able to map SA law onto any AI use case — and with a finished, defensible regulatory guidance note.' }
  };
  window.AF_COHORT_PRICE = 'R39,995';

  async function sbEmail() {
    try { var s = await getSession(); return s && s.user ? (s.user.email || '').toLowerCase() : null; }
    catch (e) { return null; }
  }
  window.cohortSessionEmail = sbEmail;

  // Register / express interest in a cohort. Returns {ok, error}.
  window.registerCohort = async function (key, name) {
    var email = await sbEmail();
    if (!email) return { ok: false, needsAuth: true };
    try {
      var r = await _supabase.from('cohort_registrations').upsert(
        { user_email: email, cohort_key: key, cohort_name: name, status: 'interested' },
        { onConflict: 'user_email,cohort_key' }
      );
      if (r.error) return { ok: false, error: r.error };
      return { ok: true };
    } catch (e) { return { ok: false, error: e }; }
  };

  // The signed-in learner's cohort registrations.
  window.getMyCohorts = async function () {
    var email = await sbEmail();
    if (!email) return [];
    try {
      return (await _supabase.from('cohort_registrations').select('*')
        .eq('user_email', email).order('created_at', { ascending: false })).data || [];
    } catch (e) { return []; }
  };

  // Layer 1 (Core Certification) completion status for the signed-in learner.
  // Specialist cohorts require all of modules 0–6 complete (4 phases each).
  window.layer1Status = async function () {
    var email = await sbEmail();
    if (!email) return { signedIn: false, complete: false, done: 0, total: 7 };
    var prog = [];
    try { prog = (typeof getAllProgress === 'function') ? await getAllProgress() : []; } catch (e) { prog = []; }
    var byMod = {};
    (prog || []).forEach(function (r) { (byMod[r.module_id] = byMod[r.module_id] || []).push(r.phase); });
    var done = 0;
    for (var n = 0; n <= 6; n++) { if ((byMod['module-' + n] || []).length >= 4) done++; }
    return { signedIn: true, complete: done >= 7, done: done, total: 7 };
  };

  // Full register flow for a cohort page — checks prerequisites and explains any denial.
  // Expects #cohort-reg-btn and #cohort-reg-msg in the page.
  window.cohortRegisterUI = async function (key, pageUrl) {
    var btn = document.getElementById('cohort-reg-btn');
    var msg = document.getElementById('cohort-reg-msg');
    if (!btn || !msg) return;
    var label = btn.textContent;
    function show(html) { msg.innerHTML = html; msg.style.display = 'block'; }
    function reset() { btn.disabled = false; btn.textContent = label; }
    btn.disabled = true; btn.textContent = 'Checking eligibility…';
    var st = await window.layer1Status();
    var link = 'style="color:#fff;font-weight:800;text-decoration:underline;"';
    if (!st.signedIn) {
      show('<strong>Create your account first.</strong> Specialist cohorts are open to learners who have completed the <strong>Layer 1 Core Certification</strong>. Step 1 is a free account and the core course. <a href="register.html?next=' + pageUrl + '" ' + link + '>Create your free account →</a>');
      reset(); return;
    }
    if (!st.complete) {
      show('<strong>Not yet eligible — here\'s the path.</strong> This Layer 3 specialist credential requires the <strong>Layer 1 Core Certification</strong> first. You\'ve completed <strong>' + st.done + ' of ' + st.total + '</strong> core modules. Finish the remaining ' + (st.total - st.done) + ' and this unlocks automatically. <a href="dashboard.html" ' + link + '>Continue Layer 1 on your dashboard →</a>');
      reset(); return;
    }
    btn.textContent = 'Registering…';
    var c = window.AF_COHORTS[key] || { name: key };
    var res = await window.registerCohort(key, c.name);
    if (res && res.ok) {
      show('✓ You\'re registered. Track it on your <a href="dashboard.html" ' + link + '>dashboard</a> — we\'ll be in touch when the next cohort opens.');
      btn.style.display = 'none';
    } else {
      reset();
      show('Registration isn\'t open just yet. Please try again shortly, or <a href="contact.html" style="color:#fff;text-decoration:underline;">contact us</a> to join the founding list.');
    }
  };

  // All cohort registrations (admin console — relies on admin read-all RLS).
  window.getAllCohortRegs = async function () {
    try {
      return (await _supabase.from('cohort_registrations').select('*')
        .order('created_at', { ascending: false })).data || [];
    } catch (e) { return []; }
  };
})();

// AfriversalAI — Layer 3 specialist cohort registrations.
// Used by the cohort pages (register), the learner dashboard (my cohorts),
// and the admin console (all registrations). Requires supabase-config.js + auth.js.
(function () {
  // Registry of Layer 3 cohorts and their pages.
  window.AF_COHORTS = {
    'ai-policy': { name: 'Certified AI Policy Practitioner™', label: 'AI Policy Cohort', page: 'cohort-ai-policy.html' }
  };

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

  // All cohort registrations (admin console — relies on admin read-all RLS).
  window.getAllCohortRegs = async function () {
    try {
      return (await _supabase.from('cohort_registrations').select('*')
        .order('created_at', { ascending: false })).data || [];
    } catch (e) { return []; }
  };
})();

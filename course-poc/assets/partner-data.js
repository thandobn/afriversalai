// AfriversalAI — Partner Portal data layer.
// Dual-mode: authenticated partners use Supabase (partners / partner_customers /
// partner_signatures with RLS); the POC demo partner uses localStorage (it has no
// real Supabase account). All public functions are async and return the same shape.
(function () {
  var RATES = { Associate: 0.20, Professional: 0.22, Strategic: 0.25 };
  var LEVELS = ['Associate', 'Professional', 'Strategic'];
  window.PARTNER_RATES = RATES;
  window.PARTNER_LEVELS = LEVELS;
  window.partnerRate = function (l) { return RATES[l] || RATES.Associate; };
  window.fmtR = function (n) { return 'R' + Math.round(Number(n) || 0).toLocaleString('en-ZA'); };

  // Returns the applicable commission rate for a customer given their tier.
  // Year 1 (<12 months) = acquisition rate; Year 2 (12-24 mo) = 10%; Year 3+ = 5%.
  // Falls back to acquisition rate when start_date is absent (safe for legacy rows).
  window.commissionRate = function (level, startDate) {
    if (!startDate) return window.partnerRate(level);
    var months = (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (months < 12) return window.partnerRate(level);
    if (months < 24) return 0.10;
    return 0.05;
  };

  // Returns 'y1', 'y2', or 'y3' bucket for a customer's start_date.
  window.commissionTier = function (startDate) {
    if (!startDate) return 'y1';
    var months = (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return months < 12 ? 'y1' : (months < 24 ? 'y2' : 'y3');
  };

  function isDemo() { try { return sessionStorage.getItem('afv_demo_partner') === '1'; } catch (e) { return false; } }
  function pkey() { try { return sessionStorage.getItem('afv_pkey') || 'demo'; } catch (e) { return 'demo'; } }
  window.partnerIsDemo = isDemo;
  window.partnerPKey = pkey;

  async function sbEmail() {
    try { var s = await getSession(); return s && s.user ? (s.user.email || '').toLowerCase() : null; }
    catch (e) { return null; }
  }

  // ---------- localStorage (demo) ----------
  function lsLoad() { try { return JSON.parse(localStorage.getItem('afv_partner_' + pkey()) || '{}'); } catch (e) { return {}; } }
  function lsSave(p) { try { localStorage.setItem('afv_partner_' + pkey(), JSON.stringify(p)); } catch (e) {} }
  function demoSeed() {
    // Clean dummy partner (any demo pkey other than 'demo') — active account, empty dashboard, no data yet.
    if (pkey() !== 'demo') {
      var em = 'partner@afriversal.ai';
      try { em = sessionStorage.getItem('afv_demo_email') || em; } catch (e) {}
      return { email: em, level: 'Associate', status: 'active', _seeded: true, signed: {}, customers: [] };
    }
    return {
      email: 'partner@afriversal.ai', level: 'Professional', status: 'active', _seeded: true,
      signed: { nda: { name: 'Demo Partner', date: '2026-06-20', signed_at: '2026-06-20', verifyId: 'AAI-SIG-DEMO01' } },
      customers: [
        { id: 'c1', name: 'Nedbank — Group L&D', sector: 'Finance', country: 'South Africa', acv: 2400000, stage: 'Onboarded', start_date: '2024-03-01' },
        { id: 'c2', name: 'Gauteng Dept. of Education', sector: 'Government', country: 'South Africa', acv: 1200000, stage: 'Signed', start_date: '2025-02-01' },
        { id: 'c3', name: 'Vodacom Business', sector: 'Telecoms', country: 'South Africa', acv: 800000, stage: 'Proposal', start_date: '2026-04-01' },
        { id: 'c4', name: 'UCT Executive Education', sector: 'Education', country: 'South Africa', acv: 350000, stage: 'Registered', start_date: '2026-05-01' }
      ]
    };
  }

  // ---------- approval check ----------
  // True if the email has a row in `partners` (DB) or is in the static allowlist (fallback
  // so it still works before the migration is run). Demo bypass handled by the pages.
  window.isApprovedPartner = async function (email) {
    if (!email) return false;
    email = String(email).toLowerCase();
    // Cache keyed by email so different accounts in the same browser session
    // don't inherit each other's approval status.
    var cacheKey = 'afv_partner_approved_' + email;
    var cached = sessionStorage.getItem(cacheKey);
    if (cached === '1') return true;
    if (cached === '0') return false;
    var result = false;
    try {
      var r = await _supabase.from('partners').select('email').eq('email', email).maybeSingle();
      if (r && r.data && r.data.email) result = true;
    } catch (e) { /* table may not exist yet — fall through */ }
    if (!result) {
      result = !!(window.PARTNER_EMAILS && window.PARTNER_EMAILS.map(function (e) { return e.toLowerCase(); }).indexOf(email) !== -1);
    }
    sessionStorage.setItem(cacheKey, result ? '1' : '0');
    return result;
  };

  // True if this email is an approved/active corporate (Corporate Portal access).
  window.isCorporate = async function (email) {
    if (!email) return false;
    email = String(email).toLowerCase();
    try {
      var r = await _supabase.from('corporates').select('email,status').eq('email', email).maybeSingle();
      if (r && r.data && r.data.email && ['approved', 'active'].indexOf(r.data.status) !== -1) return true;
    } catch (e) { /* table may not exist yet */ }
    return false;
  };

  // Clear the approval cache for a given email on sign-out.
  window.clearPartnerApprovalCache = function (email) {
    if (!email) return;
    try { sessionStorage.removeItem('afv_partner_approved_' + String(email).toLowerCase()); } catch (e) {}
    // Also clear the old unkeyed entry in case it exists from a previous version.
    try { sessionStorage.removeItem('afv_partner_approved'); } catch (e) {}
  };

  // ---------- load full partner record ----------
  window.loadPartner = async function () {
    if (isDemo()) {
      var p = lsLoad();
      if (!p._seeded) { p = demoSeed(); lsSave(p); }
      return p;
    }
    var email = await sbEmail();
    if (!email) return { email: null, level: 'Associate', status: 'onboarding', signed: {}, customers: [] };
    var prof = {}, custs = [], sigs = [];
    try { prof = (await _supabase.from('partners').select('*').eq('email', email).maybeSingle()).data || {}; } catch (e) {}
    try { custs = (await _supabase.from('partner_customers').select('*').eq('partner_email', email)).data || []; } catch (e) {}
    try { sigs = (await _supabase.from('partner_signatures').select('*').eq('partner_email', email)).data || []; } catch (e) {}
    var signed = {};
    sigs.forEach(function (s) {
      signed[s.doc_key] = { name: s.signer_name, date: (s.signed_at || '').slice(0, 10),
        signed_at: s.signed_at, verifyId: s.verify_id, fingerprint: s.fingerprint, fields: s.fields, pdf_path: s.pdf_path || null };
    });
    return {
      email: email, level: prof.level || 'Associate', status: prof.status || 'onboarding',
      partner_code: prof.partner_code || null, signed: signed,
      customers: (custs || []).map(function (c) {
        return { id: c.id, name: c.name, sector: c.sector, country: c.country, acv: Number(c.acv) || 0, stage: c.stage, start_date: c.start_date || null };
      })
    };
  };

  // ---------- customers (CRUD) ----------
  window.addPartnerCustomer = async function (c) {
    if (isDemo()) { var p = lsLoad(); p.customers = p.customers || []; c.id = 'c' + Date.now(); p.customers.push(c); lsSave(p); return; }
    var email = await sbEmail();
    await _supabase.from('partner_customers').insert({ partner_email: email, name: c.name, sector: c.sector, country: c.country, acv: c.acv, stage: c.stage, start_date: c.start_date || null });
  };
  window.setPartnerCustomerStage = async function (id, stage) {
    if (isDemo()) { var p = lsLoad(); (p.customers || []).forEach(function (c) { if (c.id === id) c.stage = stage; }); lsSave(p); return; }
    await _supabase.from('partner_customers').update({ stage: stage, updated_at: new Date().toISOString() }).eq('id', id);
  };
  window.removePartnerCustomer = async function (id) {
    if (isDemo()) { var p = lsLoad(); p.customers = (p.customers || []).filter(function (c) { return c.id !== id; }); lsSave(p); return; }
    await _supabase.from('partner_customers').delete().eq('id', id);
  };

  // ---------- signatures ----------
  window.savePartnerSignature = async function (docKey, rec) {
    if (isDemo()) {
      var p = lsLoad(); p.signed = p.signed || {}; p.signed[docKey] = rec;
      if (docKey === 'schedule' && rec.fields && rec.fields.level) p.level = rec.fields.level;
      lsSave(p); return;
    }
    var email = await sbEmail();
    var _up = await _supabase.from('partner_signatures').upsert({
      partner_email: email, doc_key: docKey, signer_name: rec.name, capacity: rec.title || null,
      signed_at: rec.signed_at, verify_id: rec.verifyId, fingerprint: rec.fingerprint, fields: rec.fields
    }, { onConflict: 'partner_email,doc_key' });
    if (_up && _up.error) throw _up.error;   // surface RLS/constraint failures instead of faking success
    var patch = {};
    if (docKey === 'schedule' && rec.fields && rec.fields.level) patch.level = rec.fields.level;
    // Mark partner active once all three core docs are signed
    try {
      var core = (await _supabase.from('partner_signatures').select('doc_key').eq('partner_email', email)).data || [];
      var keys = core.map(function (r) { return r.doc_key; });
      if (['nda', 'agreement', 'schedule'].every(function (k) { return keys.indexOf(k) !== -1; })) patch.status = 'active';
    } catch (e) {}
    if (Object.keys(patch).length) { try { await _supabase.from('partners').update(patch).eq('email', email); } catch (e) {} }
  };

  // ---------- corporate cohorts ----------
  // Cohort enrolment code, e.g. NEDBANK-2026-K7Q (uppercase, matches existing convention).
  function cohortCode(name) {
    var base = (name || 'COHORT').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-')[0].slice(0, 12) || 'COHORT';
    return base + '-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  window.partnerCohortCode = cohortCode;

  window.loadCohorts = async function () {
    if (isDemo()) {
      var p = lsLoad();
      if (!p.cohorts) {
        p.cohorts = [{ id: 'demo-co-1', name: 'Nedbank — Group L&D', code: 'NEDBANK-2026-A', max_seats: 40,
          price_per_seat: 14995, sector: 'Finance', start_date: '2026-09-01', status: 'active', enrolled: 23 }];
        lsSave(p);
      }
      return p.cohorts;
    }
    var email = await sbEmail();
    if (!email) return [];
    var orgs = [];
    try { orgs = (await _supabase.from('organisations').select('*').eq('partner_email', email).order('created_at', { ascending: false })).data || []; }
    catch (e) { return []; }
    for (var i = 0; i < orgs.length; i++) {
      try {
        var c = await _supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('organisation_id', orgs[i].id);
        orgs[i].enrolled = c.count || 0;
      } catch (e) { orgs[i].enrolled = 0; }
    }
    return orgs;
  };

  // d: { name, sector, contact_name, contact_email, seats, price_per_seat, start_date, intake_label, brand_color }
  // Partner-created cohorts start PENDING admin approval: active=false so the access code
  // can't accept enrolments until an admin approves it.
  window.createCohort = async function (d) {
    var seats = Number(d.seats) || 0, price = Number(d.price_per_seat) || 0;
    if (isDemo()) {
      var p = lsLoad(); p.cohorts = p.cohorts || [];
      var demo = { id: 'demo-co-' + Date.now(), name: d.name, code: cohortCode(d.name), max_seats: seats,
        price_per_seat: price, sector: d.sector, start_date: d.start_date, intake_label: d.intake_label || null,
        brand_color: d.brand_color || null, status: 'pending', active: false, created_by: 'partner', enrolled: 0,
        contact_name: d.contact_name, contact_email: d.contact_email };
      p.cohorts.push(demo); lsSave(p); return demo;
    }
    var email = await sbEmail();
    // 1. the corporate as a pipeline customer (Signed — pending enrolment go-live)
    var custId = null;
    try {
      var cust = await _supabase.from('partner_customers')
        .insert({ partner_email: email, name: d.name, sector: d.sector, acv: seats * price, stage: 'Signed' })
        .select().maybeSingle();
      custId = cust.data ? cust.data.id : null;
    } catch (e) { /* non-fatal */ }
    // 2. the cohort (organisation) with a unique enrolment code (retry on collision)
    var co = null, lastErr = null;
    for (var attempt = 0; attempt < 4 && !co; attempt++) {
      var r = await _supabase.from('organisations').insert({
        name: d.name, code: cohortCode(d.name), max_seats: seats, active: false, partner_email: email,
        customer_id: custId, price_per_seat: price, sector: d.sector, start_date: d.start_date || null,
        status: 'pending', created_by: 'partner', intake_label: d.intake_label || null,
        brand_color: d.brand_color || null, contact_name: d.contact_name, contact_email: d.contact_email
      }).select().maybeSingle();
      if (r.error) {
        lastErr = r.error;
        if (r.error.code === '23505' || /duplicate|unique/i.test(r.error.message || '')) continue;
        break;
      }
      co = r.data;
    }
    if (!co) throw (lastErr || new Error('Could not create cohort'));
    co.enrolled = 0;
    return co;
  };

  window.cohortMetrics = function (co, level) {
    var rate = window.partnerRate(level);
    var revenue = (Number(co.max_seats) || 0) * (Number(co.price_per_seat) || 0);
    return { revenue: revenue, commission: revenue * rate, rate: rate };
  };

  window.loadCohortLearners = async function (orgId) {
    if (isDemo()) return [];
    var profs = [];
    try { profs = (await _supabase.from('profiles').select('id,full_name,email,role,member_id,member_no,created_at').eq('organisation_id', orgId)).data || []; }
    catch (e) { return []; }
    for (var i = 0; i < profs.length; i++) {
      try { profs[i].progress = (await _supabase.from('progress').select('module_id,phase').eq('user_id', profs[i].id)).data || []; }
      catch (e) { profs[i].progress = []; }
    }
    return profs;
  };

  // ---------- derived metrics (operate on a loaded record) ----------
  window.partnerMetrics = function (p) {
    var won = ['Signed', 'Onboarded'];
    var pipelineACV = 0, wonACV = 0, wonCount = 0, projected = 0, earned = 0;
    var tiers = { y1:{count:0,acv:0,commission:0}, y2:{count:0,acv:0,commission:0}, y3:{count:0,acv:0,commission:0} };
    (p.customers || []).forEach(function (c) {
      var acv = Number(c.acv) || 0;
      var rate = window.commissionRate(p.level, c.start_date);
      var tier = window.commissionTier(c.start_date);
      pipelineACV += acv;
      projected += acv * rate;
      if (won.indexOf(c.stage) !== -1) { wonACV += acv; wonCount++; earned += acv * rate; }
      tiers[tier].count++;
      tiers[tier].acv += acv;
      tiers[tier].commission += acv * rate;
    });
    return { rate: window.partnerRate(p.level), total: (p.customers || []).length,
      wonCount: wonCount, pipelineACV: pipelineACV, wonACV: wonACV,
      projected: projected, earned: earned, tierBreakdown: tiers };
  };
  // ---------- opportunity registrations ----------
  var OPPS_LS_KEY = 'afv_opps_demo';
  function oppsLoad() { try { return JSON.parse(localStorage.getItem(OPPS_LS_KEY) || '[]'); } catch(e) { return []; } }
  function oppsSave(o) { try { localStorage.setItem(OPPS_LS_KEY, JSON.stringify(o)); } catch(e) {} }

  window.loadOpportunities = async function () {
    if (isDemo()) {
      var opps = oppsLoad();
      if (!opps.length) {
        opps = [
          { id: 'opp-demo-1', customer_id: 'c1', customer_name: 'Nedbank — Group L&D', sector: 'Finance', country: 'South Africa',
            notes: '', submitted_at: '2026-03-15T10:00:00Z', status: 'Accepted', opp_id: 'OPP-SA-2026-00001', admin_notes: 'Approved — established relationship confirmed.' },
          { id: 'opp-demo-2', customer_id: 'c2', customer_name: 'Gauteng Dept. of Education', sector: 'Government', country: 'South Africa',
            notes: 'Public sector procurement process underway.', submitted_at: '2026-05-20T09:30:00Z', status: 'Pending', opp_id: null, admin_notes: null }
        ];
        oppsSave(opps);
      }
      return opps;
    }
    var email = await sbEmail();
    if (!email) return [];
    try {
      return (await _supabase.from('partner_opportunities').select('*').eq('partner_email', email).order('submitted_at', { ascending: false })).data || [];
    } catch(e) { return []; }
  };

  window.submitOpportunityRegistration = async function (data) {
    if (isDemo()) {
      var opps = oppsLoad();
      var entry = { id: 'opp-demo-' + Date.now(), customer_id: data.customer_id || null,
        customer_name: data.customer_name, sector: data.sector || null, country: data.country || null,
        notes: data.notes || null, submitted_at: new Date().toISOString(),
        status: 'Pending', opp_id: null, admin_notes: null };
      opps.push(entry);
      oppsSave(opps);
      return entry;
    }
    var email = await sbEmail();
    var r = await _supabase.from('partner_opportunities').insert({
      partner_email: email, customer_name: data.customer_name, sector: data.sector || null,
      country: data.country || null, notes: data.notes || null
    }).select().maybeSingle();
    if (r.error) throw r.error;
    return r.data;
  };

  window.partnerStatus = function (p) {
    var core = ['nda', 'agreement', 'schedule'];
    var done = core.filter(function (k) { return p.signed && p.signed[k]; }).length;
    if (done >= 3 || p.status === 'active') return { label: 'Active Partner', done: done, total: 3, active: true };
    return { label: 'Onboarding', done: done, total: 3, active: false };
  };
})();

/* AfriversalAI — Auth utility
 * Requires supabase-config.js to be loaded first.
 * All functions are async — await them.
 */

var _adminEmails = null

async function _loadAdminEmails() {
  if (_adminEmails !== null) return
  const { data, error } = await _supabase.from('admins').select('email')
  if (error) { console.error('[AfriversalAI] _loadAdminEmails failed:', error.message); return }
  _adminEmails = new Set((data || []).map(function(r) { return r.email.toLowerCase() }))
}

async function getSession() {
  try {
    const { data: { session } } = await _supabase.auth.getSession()
    if (session) await _loadAdminEmails().catch(function(e) { console.error('[AfriversalAI] _loadAdminEmails threw:', e) })
    return session
  } catch {
    return null
  }
}

async function getProfile() {
  const session = await getSession()
  if (!session) return null
  const { data, error } = await _supabase
    .from('profiles')
    .select('id, full_name, email, organisation, sector, org_code, role')
    .eq('id', session.user.id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    if (error.code === '42703') {
      // One or more columns missing — fall back to only the columns confirmed to exist
      console.warn('[AfriversalAI] getProfile: missing column(s), retrying with safe subset:', error.message)
      const { data: d2, error: e2 } = await _supabase
        .from('profiles')
        .select('id, full_name, organisation, sector, role')
        .eq('id', session.user.id)
        .single()
      if (e2 && e2.code !== 'PGRST116') console.error('[AfriversalAI] getProfile fallback failed:', e2.message)
      return d2 || null
    }
    console.error('[AfriversalAI] getProfile failed:', error.message, '| code:', error.code)
  }
  return data || null
}

async function afSignUp(email, password, profile) {
  const { data, error } = await _supabase.auth.signUp({ email, password })
  if (error) throw error
  if (data.user) {
    const { error: pe } = await _supabase
      .from('profiles')
      .upsert({ id: data.user.id, ...profile }, { onConflict: 'id' })
    if (pe) throw pe
  }
  return data
}

async function afSignIn(email, password) {
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  await _loadAdminEmails()
  return data
}

async function afSignOut() {
  await _supabase.auth.signOut()
  window.location.href = 'index.html'
}

async function saveProgress(moduleId, phase) {
  const session = await getSession()
  if (!session) return
  const { error } = await _supabase.from('progress').upsert(
    { user_id: session.user.id, module_id: moduleId, phase },
    { onConflict: 'user_id,module_id,phase' }
  )
  if (error) console.error('[AfriversalAI] saveProgress failed:', error.message, '| code:', error.code)
}

async function getModuleProgress(moduleId) {
  const session = await getSession()
  if (!session) return []
  const { data, error } = await _supabase
    .from('progress')
    .select('phase')
    .eq('user_id', session.user.id)
    .eq('module_id', moduleId)
  if (error) console.error('[AfriversalAI] getModuleProgress failed:', error.message)
  return data ? data.map(r => r.phase) : []
}

async function getAllProgress() {
  const session = await getSession()
  if (!session) return []
  const { data, error } = await _supabase
    .from('progress')
    .select('module_id, phase')
    .eq('user_id', session.user.id)
  if (error) console.error('[AfriversalAI] getAllProgress failed:', error.message)
  return data || []
}

async function requireAuth(redirectTo) {
  const session = await getSession()
  if (!session) {
    const next = redirectTo || window.location.pathname.split('/').pop()
    window.location.href = 'login.html?next=' + encodeURIComponent(next)
    return null
  }
  return session
}

async function updateProfile(updates) {
  const session = await getSession()
  if (!session) throw new Error('Not logged in')
  const { error } = await _supabase
    .from('profiles')
    .upsert({ id: session.user.id, ...updates }, { onConflict: 'id' })
  if (error) throw error
}

async function updatePassword(newPassword) {
  const { error } = await _supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

async function validateOrgCode(code) {
  const { data, error } = await _supabase
    .from('organisations')
    .select('id, name, max_seats')
    .eq('code', code.toUpperCase().trim())
    .eq('active', true)
    .single()
  if (error || !data) throw new Error('Access code not recognised — check with your organisation.')
  return data
}

async function updateNavForAuth() {
  const session = await getSession()
  const navLinks = document.querySelector('ul.nav__links')
  const hasGuestNav = navLinks && navLinks.querySelector('a[href="register.html"]')

  if (!session) {
    const loginItem = document.querySelector('.nav__login')
    if (loginItem) loginItem.style.display = ''
    return
  }

  if (!hasGuestNav) {
    // Already a logged-in nav page (dashboard, settings, etc.) — just sync instructor link
    _applyInstructorVisibility(session)
    return
  }

  const page = window.location.pathname.split('/').pop() || 'index.html'

  // Home page: keep the marketing nav intact, just swap login/register for a dashboard link
  if (page === 'index.html') {
    const loginItem = navLinks.querySelector('.nav__login')
    if (loginItem) loginItem.style.display = 'none'
    const registerAnchor = navLinks.querySelector('a[href="register.html"]')
    if (registerAnchor) {
      registerAnchor.href = 'dashboard.html'
      registerAnchor.textContent = 'My Dashboard →'
    }
    return
  }

  // All other guest-nav pages: replace nav entirely so it's deterministic
  const a = (href) => href === page ? ' class="active"' : ''

  navLinks.innerHTML =
    '<li><a href="index.html"' + a('index.html') + '>Home</a></li>' +
    '<li><a href="dashboard.html"' + a('dashboard.html') + '>My Dashboard</a></li>' +
    '<li id="nav-instructor" style="display:none;"><a href="admin.html">Instructor</a></li>' +
    '<li><a href="glossary.html"' + a('glossary.html') + '>Glossary</a></li>' +
    '<li class="nav__dropdown">' +
      '<a href="course-outline.html">Curriculum</a>' +
      '<ul class="nav__dropdown-menu">' +
        '<li><a href="course-outline.html">Framework Overview</a></li>' +
        '<li><a href="course-timetable.html">Q3 2026 Timetable</a></li>' +
        '<li><a href="outline-foundation.html">Why &amp; Who</a></li>' +
        '<li><a href="outline-funda-five.html">The Funda Five</a></li>' +
        '<li><a href="outline-core-modules.html">Core Modules</a></li>' +
        '<li><a href="outline-sector-tracks.html">Sector Tracks</a></li>' +
        '<li><a href="outline-delivery.html">Delivery &amp; Assessment</a></li>' +
        '<li><a href="outline-cohorts.html">Layer 3 Cohorts</a></li>' +
        '<li><a href="outline-pathways.html">Pathways</a></li>' +
      '</ul>' +
    '</li>' +
    '<li><a href="resources.html"' + a('resources.html') + '>Resources</a></li>' +
    '<li><a href="settings.html"' + a('settings.html') + '>Settings</a></li>' +
    '<li><a href="contact.html"' + a('contact.html') + '>Contact</a></li>' +
    '<li><a href="#" onclick="afSignOut(); return false;" class="btn btn--outline btn--sm">Sign out</a></li>'

  // nav.js bound dropdown and close-on-click listeners to old nodes — re-bind to new ones
  navLinks.querySelectorAll('.nav__dropdown > a').forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault()
      trigger.closest('.nav__dropdown').classList.toggle('is-open')
    })
  })
  var burger = document.querySelector('.nav__hamburger')
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (link.parentElement.classList.contains('nav__dropdown')) return
      navLinks.classList.remove('is-open')
      if (burger) { burger.classList.remove('is-active'); burger.setAttribute('aria-expanded', 'false') }
    })
  })

  _applyInstructorVisibility(session)
}

function _applyInstructorVisibility(session) {
  var instrItem = document.getElementById('nav-instructor')
  if (!instrItem) return
  var email = session && session.user && session.user.email
  instrItem.style.display = window.isAdminEmail(email) ? '' : 'none'
}

window.isAdminEmail = function(email) {
  if (!email || !_adminEmails) return false
  return _adminEmails.has(String(email).toLowerCase())
}

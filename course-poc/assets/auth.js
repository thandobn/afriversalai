/* AfriversalAI — Auth utility
 * Requires supabase-config.js to be loaded first.
 * All functions are async — await them.
 */

async function getSession() {
  try {
    const { data: { session } } = await _supabase.auth.getSession()
    return session
  } catch {
    return null
  }
}

async function getProfile() {
  const session = await getSession()
  if (!session) return null
  const { data } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  return data
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
    .update(updates)
    .eq('id', session.user.id)
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
  const registerLink = document.querySelector('a[href="register.html"]')
  if (session && registerLink) {
    registerLink.textContent = 'My Dashboard →'
    registerLink.href = 'dashboard.html'
    registerLink.classList.remove('btn--primary')
    registerLink.classList.add('btn--gold')
  }
  // Hide the "Log in" nav link once signed in (Register already becomes "My Dashboard")
  const loginItem = document.querySelector('.nav__login')
  if (loginItem) loginItem.style.display = session ? 'none' : ''
}

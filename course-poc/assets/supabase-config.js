/* AfriversalAI — Supabase client config
 * Fill in SUPABASE_ANON_KEY with the "anon public" value from
 * Supabase Dashboard → Settings → API → Project API keys
 */
const SUPABASE_URL  = 'https://evxvsldwulqvowaaurxf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_aRLfdh5hY218_Ce0ppN4_Q_I5DEhFtf'

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

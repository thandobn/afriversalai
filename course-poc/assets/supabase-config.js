/* AfriversalAI — Supabase client config
 * Fill in SUPABASE_ANON_KEY with the "anon public" value from
 * Supabase Dashboard → Settings → API → Project API keys
 */
const SUPABASE_URL  = 'https://evxvsldwulqvowaaurxf.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

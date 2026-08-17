import { createClient } from '@supabase/supabase-js'

/**
 * Step 12 - Supabase client.
 *
 * The client is only created when BOTH env vars are present. When they are
 * missing the app runs in LOCAL MODE (localStorage only) and `supabase` stays
 * null, so every caller must guard with `isSupabaseConfigured` first.
 *
 * Only the public anon key is used here. The service_role key must never reach
 * the frontend.
 */

const env = import.meta.env || {}
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    typeof supabaseUrl === 'string' &&
    typeof supabaseAnonKey === 'string' &&
    supabaseUrl.startsWith('http'),
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

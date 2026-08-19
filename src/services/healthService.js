import { t } from '../i18n/t'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  CLOUD_HEALTH_LAST_CHECK_KEY,
  safeGetJSON,
  safeSetJSON,
} from '../utils/storageUtils'

/**
 * Step 20 - cloud health checks for the Settings > Cloud Health panel.
 *
 * Every check resolves (never throws) with a small { ok, message } shape so
 * the UI can render yes/no rows without try/catch everywhere. All checks are
 * read-only and safe to run against production.
 */

const PROGRESS_PHOTOS_BUCKET = 'progress-photos'

/** Supabase client exists and the database answers a basic request. */
export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      configured: false,
      reachable: false,
      message: t('cloud.notConfigured'),
    }
  }

  try {
    // head+count returns no rows, so this works logged-out under RLS and
    // proves the database endpoint is reachable and the anon key is valid.
    const { error } = await supabase
      .from('user_settings')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return {
        configured: true,
        reachable: false,
        message: `Database responded with an error: ${error.message}`,
      }
    }

    return { configured: true, reachable: true, message: t('health.dbReachable') }
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      message: `Could not reach Supabase: ${describeError(error)}`,
    }
  }
}

/** Whether a user session exists right now. */
export async function checkAuthStatus() {
  if (!isSupabaseConfigured || !supabase) {
    return { loggedIn: false, email: null, message: t('health.localNoAuth') }
  }

  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      return { loggedIn: false, email: null, message: error.message }
    }

    const email = data?.session?.user?.email ?? null
    return {
      loggedIn: Boolean(data?.session),
      email,
      message: data?.session ? `Signed in as ${email ?? 'user'}.` : t('health.notSignedIn'),
    }
  } catch (error) {
    return { loggedIn: false, email: null, message: describeError(error) }
  }
}

/**
 * Whether the private progress-photos bucket answers for the current user.
 * Storage policies are per-user folders, so this needs a signed-in session.
 */
export async function checkStorageAccess() {
  if (!isSupabaseConfigured || !supabase) {
    return { available: false, skipped: true, message: t('health.localNoStorage') }
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      return {
        available: false,
        skipped: true,
        message: t('health.signInStorage'),
      }
    }

    const { error } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .list(userId, { limit: 1 })

    if (error) {
      return {
        available: false,
        skipped: false,
        message: `Storage error: ${error.message}`,
      }
    }

    return { available: true, skipped: false, message: t('health.storageReachable') }
  } catch (error) {
    return { available: false, skipped: false, message: describeError(error) }
  }
}

/** Runs every check, persists the result, and returns it for the UI. */
export async function runCloudHealthCheck() {
  const [connection, auth, storage] = await Promise.all([
    checkSupabaseConnection(),
    checkAuthStatus(),
    checkStorageAccess(),
  ])

  const result = {
    checkedAt: new Date().toISOString(),
    supabaseConfigured: connection.configured,
    databaseReachable: connection.reachable,
    loggedIn: auth.loggedIn,
    email: auth.email,
    storageAvailable: storage.available,
    storageSkipped: storage.skipped,
    messages: {
      connection: connection.message,
      auth: auth.message,
      storage: storage.message,
    },
  }

  safeSetJSON(CLOUD_HEALTH_LAST_CHECK_KEY, result)
  return result
}

/** Last persisted health check result, or null if none was run yet. */
export function getLastHealthCheck() {
  const stored = safeGetJSON(CLOUD_HEALTH_LAST_CHECK_KEY, null)
  return stored && typeof stored === 'object' ? stored : null
}

function describeError(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return t('sync.unknownError')
}

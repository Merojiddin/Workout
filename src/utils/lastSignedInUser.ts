/**
 * The last account that actually signed in on this device.
 *
 * Why this exists: `supabase.auth.getSession()` returns `session: null` when
 * the stored access token has expired AND the refresh call cannot reach the
 * network (auth-js hands back the refresh error rather than the session). It
 * deliberately does NOT delete the session in that case - the refresh token is
 * still on disk and still good - but the null return is indistinguishable, to
 * the caller, from "this person is signed out". A phone opening the installed
 * app an hour later, while the radio is still connecting, hits exactly that
 * path and gets shown the login form despite being signed in.
 *
 * Remembering the last real sign-in lets AuthContext tell the two apart:
 * `session: null` with an error means "cannot confirm right now, carry on",
 * while `session: null` with no error means "genuinely signed out".
 *
 * Stored through raw localStorage rather than the helpers in `storageUtils`,
 * and deliberately NOT in `FITNESS_APP_STORAGE_KEYS`: this is read before any
 * user id is known, so it cannot live inside the `u:<id>:` namespace that
 * those helpers apply - the next cold start would never find it again. It
 * holds no credential, only the identity of whoever the browser already has a
 * Supabase refresh token for.
 */
const LAST_SIGNED_IN_USER_KEY = 'lastSignedInUser'

export interface RememberedUser {
  id: string
  email: string | null
}

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

export function readLastSignedInUser(): RememberedUser | null {
  if (!canUseLocalStorage()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(LAST_SIGNED_IN_USER_KEY)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const { id, email } = parsed as Partial<RememberedUser>
    if (typeof id !== 'string' || id.trim() === '') {
      return null
    }

    return { id, email: typeof email === 'string' ? email : null }
  } catch {
    return null
  }
}

/** Call only for a verified sign-in, never for a restored placeholder. */
export function rememberSignedInUser(user: {
  id?: unknown
  email?: unknown
} | null): void {
  if (!canUseLocalStorage() || typeof user?.id !== 'string') {
    return
  }

  try {
    window.localStorage.setItem(
      LAST_SIGNED_IN_USER_KEY,
      JSON.stringify({
        id: user.id,
        email: typeof user.email === 'string' ? user.email : null,
      }),
    )
  } catch {
    // Best effort: losing this only costs the offline-restore convenience.
  }
}

export function forgetSignedInUser(): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(LAST_SIGNED_IN_USER_KEY)
  } catch {
    // Best effort.
  }
}

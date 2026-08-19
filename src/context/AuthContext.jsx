import { t } from '../i18n/t'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { setStorageNamespace } from '../utils/storageUtils'
import {
  forgetSignedInUser,
  readLastSignedInUser,
  rememberSignedInUser,
} from '../utils/lastSignedInUser'

/**
 * Step 12 - Auth context.
 *
 * Wraps Supabase auth. In LOCAL MODE (no Supabase configured) it exposes a
 * stable "not configured" state: no user, not loading, and auth methods that
 * return a friendly error instead of throwing. The rest of the app can always
 * call useAuth() safely.
 */

const AuthContext = createContext(null)

const notConfigured = {
  error: {
    message: t('auth.notConfigured'),
  },
}

export function AuthProvider({ children }) {
  // Seeded from the last verified sign-in so a returning device renders its
  // own data immediately instead of waiting on - or being locked out by - a
  // token refresh that needs the network. Supabase still has the authoritative
  // session; this only decides what to show while that answer is outstanding.
  const [restoredUser] = useState(() =>
    isSupabaseConfigured ? readLastSignedInUser() : null,
  )
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(restoredUser)
  const [loading, setLoading] = useState(isSupabaseConfigured && !restoredUser)
  const [recoveryMode, setRecoveryMode] = useState(false)
  const appliedNamespaceRef = useRef(undefined)

  // Applied during render, not in an effect: pages read localStorage while
  // they render, so an effect would let the first render of a newly signed-in
  // user read the PREVIOUS user's data. The call is idempotent, and nothing is
  // copied into the new namespace - a new account sees only what it creates.
  const activeUserId = user?.id ?? null
  if (appliedNamespaceRef.current !== activeUserId) {
    setStorageNamespace(activeUserId)
    appliedNamespaceRef.current = activeUserId
  }

  function applySession(nextSession) {
    setSession(nextSession)
    setUser(nextSession.user ?? null)
    rememberSignedInUser(nextSession.user)
    setLoading(false)
  }

  function applySignedOut() {
    setSession(null)
    setUser(null)
    forgetSignedInUser()
    setLoading(false)
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }

    let active = true

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (data.session) {
          applySession(data.session)
        } else if (error) {
          // Null WITH an error means the session could not be confirmed, not
          // that it is gone: an expired access token plus an unreachable
          // network. auth-js keeps the refresh token on disk for exactly this
          // case, so hold the restored user and let the auto-refresh ticker
          // settle it - a truly dead token comes back as SIGNED_OUT below.
          setLoading(false)
        } else {
          applySignedOut()
        }
      })
      .catch(() => {
        // A thrown getSession is the same "cannot confirm" case as above.
        if (!active) return
        setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        // Opening the emailed reset link signs the user in with a recovery
        // session. Without handling this they land on the dashboard with no
        // way to actually set a new password.
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true)
        }

        if (nextSession) {
          applySession(nextSession)
          return
        }

        // Only an explicit sign-out clears the restored user. INITIAL_SESSION
        // also arrives with a null session when the startup refresh failed,
        // and that must not log the device out.
        if (event === 'SIGNED_OUT') {
          applySignedOut()
          return
        }

        setLoading(false)
      },
    )

    return () => {
      active = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function signUp(email, password, name) {
    if (!supabase) {
      return notConfigured
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name ?? '' } },
      })
      return { data, error }
    } catch (error) {
      return { error: { message: normalizeError(error) } }
    }
  }

  async function signIn(email, password) {
    if (!supabase) {
      return notConfigured
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { error: { message: normalizeError(error) } }
    }
  }

  async function signOut() {
    if (!supabase) {
      return notConfigured
    }

    try {
      const { error } = await supabase.auth.signOut()
      // Do not wait for the SIGNED_OUT event: signing out offline can fail to
      // reach the server, and the restored user must not outlive the intent.
      forgetSignedInUser()
      return { error }
    } catch (error) {
      forgetSignedInUser()
      return { error: { message: normalizeError(error) } }
    }
  }

  /**
   * Completes a password reset. Supabase signs the user in with a recovery
   * session when they open the emailed link, so this just updates the password
   * on the already-authenticated user.
   */
  async function updatePassword(password) {
    if (!supabase) {
      return notConfigured
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (!error) {
        setRecoveryMode(false)
      }
      return { data, error }
    } catch (error) {
      return { error: { message: normalizeError(error) } }
    }
  }

  async function resetPassword(email) {
    if (!supabase) {
      return notConfigured
    }

    try {
      const redirectTo =
        typeof window !== 'undefined' ? window.location.origin : undefined
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      return { data, error }
    } catch (error) {
      return { error: { message: normalizeError(error) } }
    }
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      recoveryMode,
      isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, loading, recoveryMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    // Safe fallback so components never crash if used outside the provider.
    return {
      user: null,
      session: null,
      loading: false,
      recoveryMode: false,
      isSupabaseConfigured,
      signUp: async () => notConfigured,
      signIn: async () => notConfigured,
      signOut: async () => notConfigured,
      resetPassword: async () => notConfigured,
      updatePassword: async () => notConfigured,
    }
  }
  return context
}

function normalizeError(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'Something went wrong. Please try again.'
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

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
    message: 'Cloud sync is not configured. The app is running in local mode.',
  },
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }

    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession ?? null)
        setUser(nextSession?.user ?? null)
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
      return { error }
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
      isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }),
    [user, session, loading],
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
      isSupabaseConfigured,
      signUp: async () => notConfigured,
      signIn: async () => notConfigured,
      signOut: async () => notConfigured,
      resetPassword: async () => notConfigured,
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

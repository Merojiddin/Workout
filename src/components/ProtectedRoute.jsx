import { Dumbbell } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ForgotPassword } from '../pages/ForgotPassword'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { UpdatePassword } from '../pages/UpdatePassword'

/**
 * Step 12 - route guard.
 *
 * - Local mode (Supabase not configured): render the app, no login required.
 * - Cloud mode + not signed in: show the Login / Register / Forgot views.
 * - Cloud mode + signed in: render the app.
 */
export function ProtectedRoute({ children }) {
  const { isSupabaseConfigured, loading, recoveryMode, user } = useAuth()
  const [authView, setAuthView] = useState('login') // login | register | forgot

  // Local mode: the whole app is available offline, no auth gate.
  if (!isSupabaseConfigured) {
    return children
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-loading">
          <span className="auth-brand__icon" aria-hidden="true">
            <Dumbbell size={22} strokeWidth={2.4} />
          </span>
          <p>Loading your session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (authView === 'register') {
      return <Register onSwitch={setAuthView} />
    }
    if (authView === 'forgot') {
      return <ForgotPassword onSwitch={setAuthView} />
    }
    return <Login onSwitch={setAuthView} />
  }

  // A recovery session is signed in but exists only to set a new password.
  if (recoveryMode) {
    return <UpdatePassword />
  }

  return children
}

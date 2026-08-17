import type { ReactElement, ReactNode } from 'react'

export interface AuthUser {
  id: string
  email?: string
  [key: string]: unknown
}

export interface AuthResult {
  data?: unknown
  error?: { message: string } | null
}

export interface AuthValue {
  user: AuthUser | null
  session: unknown
  loading: boolean
  /** True while a password-reset link's recovery session is active. */
  recoveryMode: boolean
  isSupabaseConfigured: boolean
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
}

export function AuthProvider(props: { children: ReactNode }): ReactElement

export function useAuth(): AuthValue

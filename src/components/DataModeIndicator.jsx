import { Cloud, HardDrive } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/** Small pill showing whether the app is in Local Mode or Cloud Sync On. */
export function DataModeIndicator() {
  const { isSupabaseConfigured, user } = useAuth()
  const cloudActive = isSupabaseConfigured && Boolean(user)

  return (
    <span
      className={`data-mode-indicator${
        cloudActive ? ' data-mode-indicator--cloud' : ''
      }`}
      title={
        cloudActive
          ? `Signed in as ${user?.email ?? 'your account'}`
          : 'Using local browser storage'
      }
    >
      {cloudActive ? (
        <>
          <Cloud size={14} strokeWidth={2.6} aria-hidden="true" />
          Cloud Sync On
        </>
      ) : (
        <>
          <HardDrive size={14} strokeWidth={2.6} aria-hidden="true" />
          Local Mode
        </>
      )}
    </span>
  )
}

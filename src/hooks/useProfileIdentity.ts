import { useEffect, useState } from 'react'
import {
  getUserProfileSettings,
  USER_PROFILE_SETTINGS_EVENT,
} from '../utils/settingsUtils'

export interface ProfileIdentity {
  /** Full name as typed in Settings > Profile. */
  name: string
  /** First word of the name - all a nav tab has room for. */
  firstName: string
  /** Inline data URL of the profile photo, or '' when none is set. */
  avatarDataUrl: string
  /** Up to two letters, shown when there is no photo. */
  initials: string
}

/** Up to two uppercase letters from a name, for the no-photo fallback. */
export function profileInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = words.map((word) => word[0]).join('')
  return letters ? letters.toUpperCase() : '?'
}

function readIdentity(): ProfileIdentity {
  const profile = getUserProfileSettings().profile
  const name = String(profile.name ?? '').trim()

  return {
    name,
    firstName: name.split(/\s+/)[0] ?? '',
    avatarDataUrl: String(profile.avatarDataUrl ?? ''),
    initials: profileInitials(name),
  }
}

/**
 * The photo and name shown on the nav's profile tab. Re-reads on every write
 * to the profile document (same tab) and on `storage` (another tab), so
 * editing the profile updates the nav without a reload.
 */
export function useProfileIdentity(): ProfileIdentity {
  const [identity, setIdentity] = useState<ProfileIdentity>(readIdentity)

  useEffect(() => {
    function refresh() {
      setIdentity(readIdentity())
    }

    refresh()
    window.addEventListener(USER_PROFILE_SETTINGS_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(USER_PROFILE_SETTINGS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return identity
}

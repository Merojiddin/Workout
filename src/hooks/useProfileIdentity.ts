import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getUserProfileSettings,
  USER_PROFILE_SETTINGS_EVENT,
} from '../utils/settingsUtils'

export interface ProfileIdentity {
  /** What to call this person: the name from Settings, else the email nickname. */
  name: string
  /** First word of the name - all a nav tab has room for. */
  firstName: string
  /** Inline data URL of the profile photo, or '' when none is set. */
  avatarDataUrl: string
  /** Up to two letters, shown when there is no photo. */
  initials: string
  /** True when `name` came from the email fallback, not from Settings. */
  isFallbackName: boolean
}

/** Up to two uppercase letters from a name, for the no-photo fallback. */
export function profileInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = words.map((word) => word[0]).join('')
  return letters ? letters.toUpperCase() : '?'
}

/**
 * The stand-in nickname for an account that skipped the name step: the part of
 * the email before the `@`. Full addresses are too long for a nav tab, and the
 * local part is still recognisably the person's own. Empty in local mode,
 * where there is no account and therefore no email.
 */
export function nicknameFromEmail(email: string | undefined | null): string {
  const address = String(email ?? '').trim()
  const localPart = address.split('@')[0] ?? ''
  return localPart.trim()
}

function readProfileSource(): { name: string; avatarDataUrl: string } {
  const profile = getUserProfileSettings().profile

  return {
    name: String(profile.name ?? '').trim(),
    avatarDataUrl: String(profile.avatarDataUrl ?? ''),
  }
}

/** Shared by the hook and by Settings, which reads the profile document itself. */
export function buildProfileIdentity(
  name: string,
  avatarDataUrl: string,
  email: string | undefined | null,
): ProfileIdentity {
  const fallback = nicknameFromEmail(email)
  const display = name || fallback

  return {
    name: display,
    firstName: display.split(/\s+/)[0] ?? '',
    avatarDataUrl,
    initials: profileInitials(display),
    isFallbackName: name === '' && display !== '',
  }
}

/**
 * The photo and name shown on the nav's profile tab. Re-reads on every write
 * to the profile document (same tab) and on `storage` (another tab), so
 * editing the profile updates the nav without a reload.
 *
 * Skipping the name step leaves the profile nameless, so the signed-in email
 * stands in until a real name is entered - the nav never falls back to the
 * anonymous "Profile" for an account that has an address to show.
 */
export function useProfileIdentity(): ProfileIdentity {
  const { user } = useAuth()
  const [source, setSource] = useState(readProfileSource)

  useEffect(() => {
    function refresh() {
      setSource(readProfileSource())
    }

    refresh()
    window.addEventListener(USER_PROFILE_SETTINGS_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(USER_PROFILE_SETTINGS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return buildProfileIdentity(source.name, source.avatarDataUrl, user?.email)
}

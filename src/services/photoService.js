import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { dataUrlToBlob, resizeImageFile } from '../utils/imageUtils'

/**
 * Step 13 - progress photo storage service.
 *
 * Photos live in a PRIVATE Supabase Storage bucket ("progress-photos") when
 * cloud mode is on. Because the bucket is private, display URLs are short-lived
 * SIGNED URLs generated on demand. In LOCAL mode none of this runs - photos
 * stay as base64 in localStorage.
 *
 * Path layout: <user_id>/<checkin_id>/<photoType>.jpg
 */

export const PROGRESS_PHOTOS_BUCKET = 'progress-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 hour
const PHOTO_TYPES = ['front', 'side', 'back']

/** True when Supabase is configured AND a user is signed in. */
export function isCloudPhotoEnabled(user) {
  return isSupabaseConfigured && Boolean(supabase) && Boolean(user && user.id)
}

/** Keep storage keys safe: only [A-Za-z0-9._-], everything else -> "-". */
function safeSegment(value) {
  return String(value ?? '')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'item'
}

/** Deterministic storage path for a given check-in + photo slot. */
export function buildPhotoPath(userId, checkInId, photoType) {
  return `${safeSegment(userId)}/${safeSegment(checkInId)}/${photoType}.jpg`
}

/**
 * Upload one progress photo. Resizes first, then uploads with upsert so a
 * re-upload of the same slot simply overwrites it.
 * Returns { path, signedUrl, publicUrl }.
 */
export async function uploadProgressPhoto(user, file, checkInId, photoType) {
  if (!isCloudPhotoEnabled(user)) {
    throw new Error('Cloud photo storage is not available.')
  }
  if (!file) {
    throw new Error('No photo file provided.')
  }
  if (!PHOTO_TYPES.includes(photoType)) {
    throw new Error(`Unknown photo type: ${photoType}`)
  }

  const resized = await resizeImageFile(file)
  const path = buildPhotoPath(user.id, checkInId, photoType)

  const { error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .upload(path, resized, {
      upsert: true,
      contentType: 'image/jpeg',
      cacheControl: '3600',
    })

  if (error) {
    throw error
  }

  const signedUrl = await getProgressPhotoUrl(path)
  return { path, signedUrl, publicUrl: getPublicUrl(path) }
}

/** Delete a single stored photo by path. Best-effort: never throws. */
export async function deleteProgressPhoto(user, path) {
  if (!isCloudPhotoEnabled(user) || !path) {
    return { removed: false }
  }
  try {
    const { error } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .remove([path])
    return { removed: !error }
  } catch {
    return { removed: false }
  }
}

/**
 * Replace a photo: upload the new file (upsert), then delete the old path if
 * it is different from the new one (paths are deterministic per slot, so this
 * only matters when the check-in id changed).
 */
export async function replaceProgressPhoto(
  user,
  oldPath,
  newFile,
  checkInId,
  photoType,
) {
  const result = await uploadProgressPhoto(user, newFile, checkInId, photoType)
  if (oldPath && oldPath !== result.path) {
    await deleteProgressPhoto(user, oldPath)
  }
  return result
}

/**
 * Resolve a displayable URL for a stored path. Private bucket -> signed URL.
 * Returns null (never throws) so callers can fall back to base64 safely.
 */
export async function getProgressPhotoUrl(path) {
  if (!path || !supabase) {
    return null
  }
  try {
    const { data, error } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
    if (error || !data?.signedUrl) {
      return getPublicUrl(path)
    }
    return data.signedUrl
  } catch {
    return getPublicUrl(path)
  }
}

/** Public URL (used only if the bucket is later made public). */
function getPublicUrl(path) {
  if (!path || !supabase) {
    return null
  }
  try {
    const { data } = supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .getPublicUrl(path)
    return data?.publicUrl ?? null
  } catch {
    return null
  }
}

/**
 * Given a check-in that has *PhotoPath fields, resolve fresh signed URLs into
 * the matching *PhotoUrl fields. Returns a NEW check-in object; falls back to
 * any existing base64 (*Photo) when there is no path. Never throws.
 */
export async function resolveCheckInPhotoUrls(checkIn) {
  if (!checkIn || !supabase) {
    return checkIn
  }

  const next = { ...checkIn }
  await Promise.all(
    PHOTO_TYPES.map(async (type) => {
      const path = next[`${type}PhotoPath`]
      if (typeof path === 'string' && path) {
        const url = await getProgressPhotoUrl(path)
        if (url) {
          next[`${type}PhotoUrl`] = url
        }
      }
    }),
  )
  return next
}

/**
 * Optional data migration: upload local base64 progress photos to Storage and
 * record their paths on the cloud row. Does NOT delete the local base64.
 * Returns { checkInsScanned, photosUploaded, checkInsUpdated, errors }.
 */
export async function migrateLocalBase64PhotosToCloud(user, options = {}) {
  const { readCheckIns, writeCheckIns, pushToCloud } = options

  const summary = {
    checkInsScanned: 0,
    photosUploaded: 0,
    checkInsUpdated: 0,
    errors: [],
  }

  if (!isCloudPhotoEnabled(user)) {
    summary.errors.push('Sign in with a cloud account to migrate photos.')
    return summary
  }
  if (typeof readCheckIns !== 'function') {
    summary.errors.push('Migration is missing its data source.')
    return summary
  }

  const list = readCheckIns() || []
  let changed = false

  for (const checkIn of list) {
    summary.checkInsScanned += 1
    let checkInTouched = false

    for (const type of PHOTO_TYPES) {
      const base64 = checkIn[`${type}Photo`]
      const alreadyUploaded = checkIn[`${type}PhotoPath`]

      // Only migrate real base64 data URLs that are not uploaded yet.
      if (
        alreadyUploaded ||
        typeof base64 !== 'string' ||
        !base64.startsWith('data:')
      ) {
        continue
      }

      const blob = dataUrlToBlob(base64)
      if (!blob) {
        continue
      }

      try {
        const file = new File([blob], `${type}.jpg`, {
          type: blob.type || 'image/jpeg',
        })
        const { path, signedUrl } = await uploadProgressPhoto(
          user,
          file,
          checkIn.id,
          type,
        )
        // Keep the local base64 (do not delete), just add the path + url.
        checkIn[`${type}PhotoPath`] = path
        if (signedUrl) {
          checkIn[`${type}PhotoUrl`] = signedUrl
        }
        summary.photosUploaded += 1
        checkInTouched = true
      } catch (error) {
        summary.errors.push(describeError(`${type} photo`, error))
      }
    }

    if (checkInTouched) {
      changed = true
      summary.checkInsUpdated += 1
      if (typeof pushToCloud === 'function') {
        try {
          await pushToCloud(user, checkIn)
        } catch (error) {
          summary.errors.push(describeError('cloud row', error))
        }
      }
    }
  }

  if (changed && typeof writeCheckIns === 'function') {
    try {
      writeCheckIns(list)
    } catch (error) {
      summary.errors.push(describeError('local save', error))
    }
  }

  return summary
}

function describeError(label, error) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? error.message
      : 'unknown error'
  return `${label}: ${message}`
}

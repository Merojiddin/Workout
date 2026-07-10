import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import { fileToBase64 } from '../utils/imageUtils'
import {
  deleteBodyCheckIn as localDelete,
  getBodyCheckIns as localGet,
  saveBodyCheckIn as localSave,
  updateBodyCheckIn as localUpdate,
} from '../utils/bodyCheckInUtils'
import {
  buildPhotoPath,
  deleteProgressPhoto,
  getProgressPhotoUrl,
  resolveCheckInPhotoUrls,
  uploadProgressPhoto,
} from './photoService'
import {
  createCloudSyncError,
  describeError,
  isBrowserOnline,
  isCloudMode,
  num,
  supabase,
  withSyncMetadata,
  writeArrayKey,
} from './serviceUtils'
import { addToSyncQueue } from '../utils/offlineSyncQueue'

/**
 * Step 12 + 13 - body check-in service (cloud + local).
 *
 * LOCAL mode: photos stay as base64 inside the check-in (frontPhoto, ...).
 * CLOUD mode (Step 13): photo Files are uploaded to Supabase Storage and only
 * their paths are stored (frontPhotoPath, ...). Display uses short-lived signed
 * URLs (frontPhotoUrl, ...) which are resolved on read and never persisted.
 *
 * Backward compatible: old check-ins that only have base64 keep working, and
 * the *_photo_url table columns now hold the Storage PATH (or null).
 */

const PHOTO_SLOTS = ['front', 'side', 'back']

/** Build a DB row. *_photo_url columns hold Storage paths; raw_data is trimmed. */
function checkInToRow(user, checkIn) {
  return {
    user_id: user.id,
    local_id: String(checkIn.id),
    date: checkIn.date || null,
    body_weight_kg: num(checkIn.bodyWeightKg),
    waist_cm: num(checkIn.waistCm),
    belly_cm: num(checkIn.bellyCm),
    chest_cm: num(checkIn.chestCm),
    shoulders_cm: num(checkIn.shouldersCm),
    left_arm_cm: num(checkIn.leftArmCm),
    right_arm_cm: num(checkIn.rightArmCm),
    hips_cm: num(checkIn.hipsCm),
    posture_rating: num(checkIn.postureRating),
    abs_visibility_rating: num(checkIn.absVisibilityRating),
    energy_level: num(checkIn.energyLevel),
    sleep_quality: num(checkIn.sleepQuality),
    notes: typeof checkIn.notes === 'string' ? checkIn.notes : '',
    front_photo_url: checkIn.frontPhotoPath ?? null,
    side_photo_url: checkIn.sidePhotoPath ?? null,
    back_photo_url: checkIn.backPhotoPath ?? null,
    raw_data: sanitizeForStorage(checkIn),
  }
}

/**
 * Drop ephemeral signed URLs before persisting. Also drop base64 for any slot
 * that already has a Storage path, so cloud rows / the local mirror stay small.
 */
function sanitizeForStorage(checkIn) {
  const next = { ...checkIn }
  for (const slot of PHOTO_SLOTS) {
    next[`${slot}PhotoUrl`] = null
    if (next[`${slot}PhotoPath`]) {
      next[`${slot}Photo`] = null
    }
  }
  return next
}

export async function pushBodyCheckInToCloud(user, checkIn) {
  const { error } = await supabase
    .from('body_check_ins')
    .upsert(checkInToRow(user, checkIn), { onConflict: 'user_id,local_id' })
  if (error) {
    throw error
  }
}

export async function getBodyCheckIns(user) {
  if (!isCloudMode(user)) {
    return localGet()
  }
  if (!isBrowserOnline()) {
    return localGet()
  }

  const { data, error } = await supabase
    .from('body_check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
  if (error) {
    throw error
  }

  const rows = data ?? []
  const list = await Promise.all(
    rows.map((row) => resolveCheckInPhotoUrls(row.raw_data ?? reconstruct(row))),
  )

  if (list.length > 0) {
    // Mirror without ephemeral signed URLs (they expire); paths are kept.
    writeArrayKey(
      BODY_CHECK_INS_KEY,
      list.map((checkIn) => withSyncMetadata(sanitizeForStorage(checkIn), 'synced')),
    )
  }
  return list
}

/**
 * Save a NEW check-in. In cloud mode: create the row, upload any photo Files,
 * then persist the resulting paths. `photoFiles` is { front?, side?, back? }.
 * `onStatus` (optional) reports 'saving' | 'uploading' for the UI.
 */
export async function saveBodyCheckIn(user, checkIn, photoFiles, onStatus) {
  const localDraft = withSyncMetadata(
    await withLocalPhotoFallbacks(checkIn, photoFiles),
    isCloudMode(user) ? 'pending-sync' : 'local-only',
  )

  if (!isCloudMode(user)) {
    // Local mode: base64 is already inside checkIn (set by the form).
    return localSave(localDraft)
  }

  emit(onStatus, 'saving')
  localSave(localDraft) // mirror immediately

  if (!isBrowserOnline()) {
    queueCheckInChange('create', localDraft, 'offline')
    throw createCloudSyncError(new Error('offline'))
  }

  try {
    await pushBodyCheckInToCloud(user, checkIn)

    const resolved = await applyPhotoChanges(user, checkIn, photoFiles, null, onStatus)
    const synced = withSyncMetadata(resolved.checkIn, 'synced')
    await pushBodyCheckInToCloud(user, synced)

    return localUpdate(checkIn.id, sanitizeForStorage(synced))
  } catch (error) {
    queueCheckInChange('create', localDraft, describeError(error))
    localUpdate(checkIn.id, localDraft)
    throw createCloudSyncError(error)
  }
}

/**
 * Update an existing check-in. In cloud mode: replace photos that have a new
 * File, delete photos the user removed, keep the rest, then persist.
 */
export async function updateBodyCheckIn(user, id, updates, photoFiles, onStatus) {
  const localDraft = withSyncMetadata(
    await withLocalPhotoFallbacks(updates, photoFiles),
    isCloudMode(user) ? 'pending-sync' : 'local-only',
  )

  if (!isCloudMode(user)) {
    return localUpdate(id, localDraft)
  }

  const previous = localGet().find((item) => item.id === id) ?? null

  emit(onStatus, 'saving')
  const mergedList = localUpdate(id, localDraft)
  const merged = mergedList.find((item) => item.id === id)
  if (!merged) {
    return mergedList
  }

  if (!isBrowserOnline()) {
    queueCheckInChange('update', merged, 'offline')
    throw createCloudSyncError(new Error('offline'))
  }

  try {
    const resolved = await applyPhotoChanges(
      user,
      updates,
      photoFiles,
      previous,
      onStatus,
    )
    const synced = withSyncMetadata(resolved.checkIn, 'synced')
    await pushBodyCheckInToCloud(user, synced)

    return localUpdate(id, sanitizeForStorage(synced))
  } catch (error) {
    queueCheckInChange('update', merged, describeError(error))
    localUpdate(id, merged)
    throw createCloudSyncError(error)
  }
}

export async function deleteBodyCheckIn(user, id) {
  const list = localDelete(id)
  if (isCloudMode(user)) {
    if (!isBrowserOnline()) {
      queueCheckInChange('delete', { id }, 'offline')
      throw createCloudSyncError(new Error('offline'))
    }

    // Best-effort remove every deterministic photo path for this check-in.
    try {
      const paths = PHOTO_SLOTS.map((slot) =>
        buildPhotoPath(user.id, id, slot),
      )
      await Promise.all(paths.map((path) => deleteProgressPhoto(user, path)))

      const { error } = await supabase
        .from('body_check_ins')
        .delete()
        .eq('user_id', user.id)
        .eq('local_id', String(id))
      if (error) {
        throw error
      }
    } catch (error) {
      queueCheckInChange('delete', { id }, describeError(error))
      throw createCloudSyncError(error)
    }
  }
  return list
}

// --- internal ---------------------------------------------------------------

/**
 * Upload new photo Files, delete removed ones, and resolve display URLs.
 * Returns { checkIn, changed }. Never mutates the passed check-in.
 */
async function applyPhotoChanges(user, checkIn, photoFiles, previous, onStatus) {
  const next = { ...checkIn }
  let changed = false

  const hasFiles =
    photoFiles && PHOTO_SLOTS.some((slot) => Boolean(photoFiles[slot]))
  if (hasFiles) {
    emit(onStatus, 'uploading')
  }

  for (const slot of PHOTO_SLOTS) {
    const file = photoFiles ? photoFiles[slot] : null

    if (file) {
      const { path, signedUrl } = await uploadProgressPhoto(
        user,
        file,
        checkIn.id,
        slot,
      )
      next[`${slot}Photo`] = null
      next[`${slot}PhotoPath`] = path
      next[`${slot}PhotoUrl`] = signedUrl ?? null
      changed = true
      continue
    }

    const stillHasPhoto =
      Boolean(next[`${slot}PhotoPath`]) || Boolean(next[`${slot}Photo`])
    const previouslyHadPhoto =
      previous &&
      (Boolean(previous[`${slot}PhotoPath`]) || Boolean(previous[`${slot}Photo`]))

    if (!stillHasPhoto && previouslyHadPhoto) {
      // The user removed this photo.
      const oldPath =
        previous[`${slot}PhotoPath`] || buildPhotoPath(user.id, checkIn.id, slot)
      await deleteProgressPhoto(user, oldPath)
      next[`${slot}PhotoPath`] = null
      next[`${slot}PhotoUrl`] = null
      changed = true
      continue
    }

    // Unchanged: make sure a kept path has a fresh display URL.
    if (next[`${slot}PhotoPath`] && !next[`${slot}PhotoUrl`]) {
      next[`${slot}PhotoUrl`] = await getProgressPhotoUrl(next[`${slot}PhotoPath`])
    }
  }

  return { checkIn: next, changed }
}

function emit(onStatus, status) {
  if (typeof onStatus === 'function') {
    try {
      onStatus(status)
    } catch {
      // A status callback must never break a save.
    }
  }
}

async function withLocalPhotoFallbacks(checkIn, photoFiles) {
  if (!photoFiles) {
    return checkIn
  }

  const next = { ...checkIn }
  await Promise.all(
    PHOTO_SLOTS.map(async (slot) => {
      const file = photoFiles[slot]
      if (!file) {
        return
      }
      try {
        next[`${slot}Photo`] = await fileToBase64(file)
        next[`${slot}PhotoPath`] = null
        next[`${slot}PhotoUrl`] = null
      } catch {
        // Keep the measurement data even when a local photo fallback fails.
      }
    }),
  )
  return next
}

function queueCheckInChange(action, payload, lastError) {
  addToSyncQueue({
    type: 'bodyCheckIn',
    action,
    payload,
    lastError,
  })
}

function reconstruct(row) {
  return {
    id: row.local_id ?? row.id,
    date: row.date,
    bodyWeightKg: row.body_weight_kg,
    waistCm: row.waist_cm,
    bellyCm: row.belly_cm,
    chestCm: row.chest_cm,
    shouldersCm: row.shoulders_cm,
    leftArmCm: row.left_arm_cm,
    rightArmCm: row.right_arm_cm,
    hipsCm: row.hips_cm,
    postureRating: row.posture_rating,
    absVisibilityRating: row.abs_visibility_rating,
    energyLevel: row.energy_level,
    sleepQuality: row.sleep_quality,
    notes: row.notes ?? '',
    frontPhoto: null,
    sidePhoto: null,
    backPhoto: null,
    frontPhotoPath: row.front_photo_url ?? null,
    sidePhotoPath: row.side_photo_url ?? null,
    backPhotoPath: row.back_photo_url ?? null,
    frontPhotoUrl: null,
    sidePhotoUrl: null,
    backPhotoUrl: null,
    createdAt: row.created_at ?? new Date().toISOString(),
    syncStatus: 'synced',
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

import { NUTRITION_LOGS_KEY } from '../data/nutritionLogs'
import {
  deleteNutritionLog as localDelete,
  getNutritionLogs as localGet,
  saveNutritionLog as localSave,
  updateNutritionLog as localUpdate,
} from '../utils/nutritionUtils'
import { addToSyncQueue } from '../utils/offlineSyncQueue'
import {
  bool,
  createCloudSyncError,
  describeError,
  isBrowserOnline,
  isCloudMode,
  num,
  supabase,
  withSyncMetadata,
  writeArrayKey,
} from './serviceUtils'

/** Step 12 - nutrition log service (cloud + local). */

function logToRow(user, log) {
  return {
    user_id: user.id,
    local_id: String(log.id),
    date: log.date || null,
    body_weight_kg: num(log.bodyWeightKg),
    protein_grams: num(log.proteinGrams),
    water_liters: num(log.waterLiters),
    calories_estimate: num(log.caloriesEstimate),
    creatine_taken: bool(log.creatineTaken),
    creatine_grams: num(log.creatineGrams),
    whey_taken: bool(log.wheyTaken),
    whey_scoops: num(log.wheyScoops),
    eggs_count: num(log.eggsCount),
    seafood_meal: bool(log.seafoodMeal),
    oysters_meal: bool(log.oystersMeal),
    nuts_serving: bool(log.nutsServing),
    dark_chocolate: bool(log.darkChocolate),
    fruits: typeof log.fruits === 'string' ? log.fruits : '',
    coffee_cups: num(log.coffeeCups),
    notes: typeof log.notes === 'string' ? log.notes : '',
    raw_data: log,
  }
}

export async function pushNutritionLogToCloud(user, log) {
  const { error } = await supabase
    .from('nutrition_logs')
    .upsert(logToRow(user, log), { onConflict: 'user_id,local_id' })
  if (error) {
    throw error
  }
}

export async function getNutritionLogs(user) {
  if (!isCloudMode(user)) {
    return localGet()
  }
  if (!isBrowserOnline()) {
    return localGet()
  }

  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
  if (error) {
    throw error
  }

  const list = (data ?? []).map((row) => row.raw_data ?? reconstruct(row))
  if (list.length > 0) {
    writeArrayKey(
      NUTRITION_LOGS_KEY,
      list.map((log) => withSyncMetadata(log, 'synced')),
    ) // mirror, but never wipe local on empty cloud
  }
  return list
}

export async function saveNutritionLog(user, log) {
  if (!isCloudMode(user)) {
    return localSave(withSyncMetadata(log, 'local-only'))
  }

  const pending = withSyncMetadata(log, 'pending-sync')
  const list = localSave(pending)
  const persisted = findSavedLog(list, pending)

  if (!isBrowserOnline()) {
    queueNutritionChange('create', persisted, 'offline')
    throw createCloudSyncError(new Error('offline'))
  }

  try {
    const synced = withSyncMetadata(persisted, 'synced')
    await pushNutritionLogToCloud(user, synced)
    return localUpdate(synced.id, synced)
  } catch (error) {
    queueNutritionChange('create', persisted, describeError(error))
    throw createCloudSyncError(error)
  }
}

export async function updateNutritionLog(user, id, updates) {
  const status = isCloudMode(user) ? 'pending-sync' : 'local-only'
  const list = localUpdate(id, withSyncMetadata(updates, status))
  if (!isCloudMode(user)) {
    return list
  }

  const merged = list.find((item) => item.id === id)
  if (!merged) {
    return list
  }

  if (!isBrowserOnline()) {
    queueNutritionChange('update', merged, 'offline')
    throw createCloudSyncError(new Error('offline'))
  }

  try {
    const synced = withSyncMetadata(merged, 'synced')
    await pushNutritionLogToCloud(user, synced)
    return localUpdate(id, synced)
  } catch (error) {
    queueNutritionChange('update', merged, describeError(error))
    throw createCloudSyncError(error)
  }
}

export async function deleteNutritionLog(user, id) {
  const list = localDelete(id)
  if (isCloudMode(user)) {
    if (!isBrowserOnline()) {
      queueNutritionChange('delete', { id }, 'offline')
      throw createCloudSyncError(new Error('offline'))
    }

    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('local_id', String(id))
      if (error) {
        throw error
      }
    } catch (error) {
      queueNutritionChange('delete', { id }, describeError(error))
      throw createCloudSyncError(error)
    }
  }
  return list
}

function findSavedLog(list, incoming) {
  return (
    list.find((item) => item.id === incoming.id) ??
    list.find((item) => item.date === incoming.date) ??
    incoming
  )
}

function queueNutritionChange(action, payload, lastError) {
  addToSyncQueue({
    type: 'nutritionLog',
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
    proteinGrams: row.protein_grams,
    waterLiters: row.water_liters,
    caloriesEstimate: row.calories_estimate,
    creatineTaken: Boolean(row.creatine_taken),
    creatineGrams: row.creatine_grams,
    wheyTaken: Boolean(row.whey_taken),
    wheyScoops: row.whey_scoops,
    eggsCount: row.eggs_count,
    seafoodMeal: Boolean(row.seafood_meal),
    oystersMeal: Boolean(row.oysters_meal),
    nutsServing: Boolean(row.nuts_serving),
    darkChocolate: Boolean(row.dark_chocolate),
    fruits: row.fruits ?? '',
    coffeeCups: row.coffee_cups,
    notes: row.notes ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
    syncStatus: 'synced',
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

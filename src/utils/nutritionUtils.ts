import { NUTRITION_LOGS_KEY, type NutritionLog } from '../data/nutritionLogs'
import { safeGetJSON, safeSetJSON } from './storageUtils'
import { toLocalIsoDate, todayIsoDate } from './dateUtils'

/** Daily targets used across the Nutrition page. */
export const nutritionTargets = {
  proteinMin: 120,
  proteinMax: 160,
  proteinHigh: 180,
  proteinWarn: 220,
  waterMin: 2,
  waterMax: 3,
  waterMaxAllowed: 10,
  creatineMin: 3,
  creatineMax: 5,
  creatineWarn: 10,
}

/** Safely reads the nutritionLogs array from localStorage. */
export function getNutritionLogs(): NutritionLog[] {
  if (typeof window === 'undefined') {
    return []
  }

  const parsed = safeGetJSON(NUTRITION_LOGS_KEY, [])
  return Array.isArray(parsed)
    ? parsed.filter(isLogLike).map(normalizeLog)
    : []
}

/**
 * Saves a log. Nutrition is tracked one entry per day, so if a log already
 * exists for the same date it is updated in place (keeping its id/createdAt)
 * instead of adding a duplicate. Returns the new list.
 */
export function saveNutritionLog(log: NutritionLog): NutritionLog[] {
  const incoming = normalizeLog(log)
  const logs = getNutritionLogs()
  const existing = logs.find(
    (item) => item.date === incoming.date && item.id !== incoming.id,
  )

  let next: NutritionLog[]
  if (existing) {
    // Overwrite the existing same-date log, preserving its id and createdAt.
    next = logs.map((item) =>
      item.id === existing.id
        ? { ...incoming, id: existing.id, createdAt: existing.createdAt }
        : item,
    )
  } else if (logs.some((item) => item.id === incoming.id)) {
    next = logs.map((item) => (item.id === incoming.id ? incoming : item))
  } else {
    next = [incoming, ...logs]
  }

  writeNutritionLogs(next)
  return next
}

/** Updates an existing log by id and returns the new list. */
export function updateNutritionLog(
  id: string,
  updatedData: Partial<NutritionLog>,
): NutritionLog[] {
  const next = getNutritionLogs().map((log) =>
    log.id === id ? normalizeLog({ ...log, ...updatedData, id }) : log,
  )
  writeNutritionLogs(next)
  return next
}

/** Deletes a log by id and returns the new list. */
export function deleteNutritionLog(id: string): NutritionLog[] {
  const next = getNutritionLogs().filter((log) => log.id !== id)
  writeNutritionLogs(next)
  return next
}

/** Returns today's log if one exists, otherwise null. */
export function getTodayNutritionLog(logs: NutritionLog[]): NutritionLog | null {
  if (!Array.isArray(logs)) {
    return null
  }

  const today = todayIso()
  return logs.find((log) => log.date === today) ?? null
}

/** Inserts 5 demo logs (replacing any previous demo rows) and returns the list. */
export function addDemoNutritionLogs(reference = new Date()): NutritionLog[] {
  const demo = createDemoNutritionLogs(reference)
  const demoIds = new Set(demo.map((log) => log.id))
  const demoDates = new Set(demo.map((log) => log.date))
  const existing = getNutritionLogs().filter(
    (log) => !demoIds.has(log.id) && !demoDates.has(log.date),
  )
  const next = [...demo, ...existing]
  writeNutritionLogs(next)
  return next
}

/** Generates a unique id for a new log. */
export function generateNutritionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `nutrition-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Today's date as a local YYYY-MM-DD string. */
export function todayIso(): string {
  return todayIsoDate()
}

// --- internal helpers ---------------------------------------------------------

function createDemoNutritionLogs(reference: Date): NutritionLog[] {
  const createdAt = new Date().toISOString()

  const demos: Array<{ offsetDays: number; values: Partial<NutritionLog> }> = [
    {
      offsetDays: -4,
      values: {
        proteinGrams: 125,
        waterLiters: 2.2,
        creatineTaken: true,
        creatineGrams: 5,
        wheyTaken: true,
        wheyScoops: 1,
        eggsCount: 3,
        seafoodMeal: true,
        oystersMeal: false,
        nutsServing: true,
        darkChocolate: true,
        coffeeCups: 2,
        caloriesEstimate: 2500,
        bodyWeightKg: 76,
        fruits: 'Dragon fruit',
        notes: 'Solid start. Trained chest, felt strong.',
      },
    },
    {
      offsetDays: -3,
      values: {
        proteinGrams: 140,
        waterLiters: 2.5,
        creatineTaken: true,
        creatineGrams: 5,
        wheyTaken: true,
        wheyScoops: 1,
        eggsCount: 4,
        seafoodMeal: false,
        oystersMeal: true,
        nutsServing: true,
        darkChocolate: false,
        coffeeCups: 1,
        caloriesEstimate: 2600,
        bodyWeightKg: 76.2,
        fruits: 'Mangosteen',
        notes: 'Oysters for zinc. Good protein day.',
      },
    },
    {
      offsetDays: -2,
      values: {
        proteinGrams: 110,
        waterLiters: 1.7,
        creatineTaken: false,
        creatineGrams: 0,
        wheyTaken: false,
        wheyScoops: 0,
        eggsCount: 2,
        seafoodMeal: true,
        oystersMeal: false,
        nutsServing: true,
        darkChocolate: true,
        coffeeCups: 2,
        caloriesEstimate: 2300,
        bodyWeightKg: 76.1,
        fruits: 'Dragon fruit',
        notes: 'Busy day. Missed creatine and whey, protein a bit low.',
      },
    },
    {
      offsetDays: -1,
      values: {
        proteinGrams: 150,
        waterLiters: 3.0,
        creatineTaken: true,
        creatineGrams: 5,
        wheyTaken: true,
        wheyScoops: 2,
        eggsCount: 3,
        seafoodMeal: true,
        oystersMeal: true,
        nutsServing: true,
        darkChocolate: true,
        coffeeCups: 2,
        caloriesEstimate: 2700,
        bodyWeightKg: 76.4,
        fruits: 'Dragon fruit, mangosteen',
        notes: 'Best day of the week. Everything hit.',
      },
    },
    {
      offsetDays: 0,
      values: {
        proteinGrams: 132,
        waterLiters: 2.4,
        creatineTaken: true,
        creatineGrams: 5,
        wheyTaken: true,
        wheyScoops: 1,
        eggsCount: 4,
        seafoodMeal: false,
        oystersMeal: false,
        nutsServing: true,
        darkChocolate: false,
        coffeeCups: 1,
        caloriesEstimate: 2550,
        bodyWeightKg: 76.5,
        fruits: 'Mangosteen',
        notes: 'Steady. Eggs and nuts, protein target reached.',
      },
    },
  ]

  return demos.map(({ offsetDays, values }) => {
    const date = toDateKey(addDays(reference, offsetDays))
    return normalizeLog({
      id: `demo-nutrition-${date}`,
      date,
      createdAt,
      ...values,
    })
  })
}

function writeNutritionLogs(logs: NutritionLog[]) {
  if (typeof window === 'undefined') {
    return
  }

  safeSetJSON(NUTRITION_LOGS_KEY, logs)
}

function isLogLike(value: unknown): boolean {
  return Boolean(
    value && typeof value === 'object' && 'id' in value && 'date' in value,
  )
}

function normalizeLog(raw: unknown): NutritionLog {
  const value = (raw ?? {}) as Record<string, unknown>

  return {
    id: typeof value.id === 'string' && value.id ? value.id : generateNutritionId(),
    date: typeof value.date === 'string' ? value.date : '',
    bodyWeightKg: toNullableNumber(value.bodyWeightKg),
    proteinGrams: toNullableNumber(value.proteinGrams),
    waterLiters: toNullableNumber(value.waterLiters),
    caloriesEstimate: toNullableNumber(value.caloriesEstimate),
    creatineTaken: Boolean(value.creatineTaken),
    creatineGrams: toNullableNumber(value.creatineGrams),
    wheyTaken: Boolean(value.wheyTaken),
    wheyScoops: toNullableNumber(value.wheyScoops),
    eggsCount: toNullableNumber(value.eggsCount),
    seafoodMeal: Boolean(value.seafoodMeal),
    oystersMeal: Boolean(value.oystersMeal),
    nutsServing: Boolean(value.nutsServing),
    darkChocolate: Boolean(value.darkChocolate),
    fruits: typeof value.fruits === 'string' ? value.fruits : '',
    coffeeCups: toNullableNumber(value.coffeeCups),
    notes: typeof value.notes === 'string' ? value.notes : '',
    createdAt:
      typeof value.createdAt === 'string' && value.createdAt
        ? value.createdAt
        : new Date().toISOString(),
    syncStatus: toSyncStatus(value.syncStatus),
    updatedAt: toNullableString(value.updatedAt) ?? undefined,
  }
}

function toSyncStatus(value: unknown): NutritionLog['syncStatus'] {
  return value === 'local-only' || value === 'synced' || value === 'pending-sync'
    ? value
    : undefined
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function toDateKey(date: Date): string {
  return toLocalIsoDate(date)
}


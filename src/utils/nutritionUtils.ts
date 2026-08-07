import { NUTRITION_LOGS_KEY, type NutritionLog } from '../data/nutritionLogs'
import { safeGetJSON, safeSetJSON } from './storageUtils'

export type NutritionNumericKey =
  | 'bodyWeightKg'
  | 'proteinGrams'
  | 'waterLiters'
  | 'caloriesEstimate'
  | 'coffeeCups'

export interface NutritionPoint {
  date: string
  value: number
}

export interface WeeklyConsistencyPoint {
  week: string
  value: number
}

export interface WeeklyNutritionSummary {
  averageProtein: number
  averageWater: number
  creatineDays: number
  wheyDays: number
  proteinTargetDays: number
  seafoodMeals: number
  oysterMeals: number
  averageCoffee: number
  logCount: number
}

export type ProteinStatus = 'low' | 'target' | 'high'
export type WaterStatus = 'low' | 'target' | 'high'

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

/** Returns logs that fall inside the current Monday–Sunday week. */
export function getThisWeekNutritionLogs(
  logs: NutritionLog[],
  date = new Date(),
): NutritionLog[] {
  if (!Array.isArray(logs)) {
    return []
  }

  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  return logs.filter((log) => {
    const logDate = new Date(`${log.date}T00:00:00`)
    return logDate >= start && logDate < end
  })
}

/** Classifies a protein amount as low / target / high. */
export function getProteinStatus(
  proteinGrams: number | null,
  targets: Pick<typeof nutritionTargets, 'proteinMin' | 'proteinHigh'> =
    nutritionTargets,
): ProteinStatus {
  const value = toNumber(proteinGrams)
  if (value < targets.proteinMin) {
    return 'low'
  }
  if (value > targets.proteinHigh) {
    return 'high'
  }
  return 'target'
}

/** Classifies a water amount as low / target / high. */
export function getWaterStatus(waterLiters: number | null): WaterStatus {
  const value = toNumber(waterLiters)
  if (value < nutritionTargets.waterMin) {
    return 'low'
  }
  if (value > nutritionTargets.waterMax) {
    return 'high'
  }
  return 'target'
}

/** Short human message for a protein status. */
export function getProteinStatusMessage(status: ProteinStatus): string {
  switch (status) {
    case 'low':
      return 'Protein low today.'
    case 'high':
      return 'Protein high. Make sure calories are controlled.'
    default:
      return 'Protein target reached.'
  }
}

/** Short human message for a water status. */
export function getWaterStatusMessage(status: WaterStatus): string {
  switch (status) {
    case 'low':
      return 'Drink more water.'
    case 'high':
      return 'Plenty of water today.'
    default:
      return 'Water target reached.'
  }
}

/** Aggregates this week's logs into simple averages and counts. */
export function getWeeklyNutritionSummary(
  logs: NutritionLog[],
  proteinMin = nutritionTargets.proteinMin,
): WeeklyNutritionSummary {
  const week = getThisWeekNutritionLogs(logs)

  const summary: WeeklyNutritionSummary = {
    averageProtein: average(week.map((log) => log.proteinGrams)),
    averageWater: average(week.map((log) => log.waterLiters), 1),
    creatineDays: week.filter((log) => log.creatineTaken).length,
    wheyDays: week.filter((log) => log.wheyTaken).length,
    proteinTargetDays: week.filter(
      (log) => toNumber(log.proteinGrams) >= proteinMin,
    ).length,
    seafoodMeals: week.filter((log) => log.seafoodMeal).length,
    oysterMeals: week.filter((log) => log.oystersMeal).length,
    averageCoffee: average(week.map((log) => log.coffeeCups), 1),
    logCount: week.length,
  }

  return summary
}

/** Returns chart-ready [{ date, value }] data for a numeric key, oldest first. */
export function getNutritionChartData(
  logs: NutritionLog[],
  key: NutritionNumericKey,
): NutritionPoint[] {
  return sortByDateAsc(logs).flatMap((log) => {
    const value = log[key]
    return typeof value === 'number' && Number.isFinite(value)
      ? [{ date: log.date, value }]
      : []
  })
}

/** Counts creatine days per week for a simple consistency bar chart. */
export function getCreatineWeeklyConsistency(
  logs: NutritionLog[],
): WeeklyConsistencyPoint[] {
  const buckets = new Map<string, number>()

  sortByDateAsc(logs).forEach((log) => {
    const logDate = new Date(`${log.date}T00:00:00`)
    if (Number.isNaN(logDate.getTime())) {
      return
    }

    const weekKey = toDateKey(getStartOfWeek(logDate))
    const current = buckets.get(weekKey) ?? 0
    buckets.set(weekKey, current + (log.creatineTaken ? 1 : 0))
  })

  return [...buckets.entries()].map(([weekKey, value]) => ({
    week: formatWeekLabel(weekKey),
    value,
  }))
}

/** Builds an empty log for a given date (used by the checklist and new form). */
export function createEmptyNutritionLog(date = todayIso()): NutritionLog {
  return {
    id: generateNutritionId(),
    date,
    bodyWeightKg: null,
    proteinGrams: null,
    waterLiters: null,
    caloriesEstimate: null,
    creatineTaken: false,
    creatineGrams: null,
    wheyTaken: false,
    wheyScoops: null,
    eggsCount: null,
    seafoodMeal: false,
    oystersMeal: false,
    nutsServing: false,
    darkChocolate: false,
    fruits: '',
    coffeeCups: null,
    notes: '',
    createdAt: new Date().toISOString(),
  }
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

/** Formats an ISO date (YYYY-MM-DD) as a readable label. */
export function formatNutritionDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return date || '-'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

/** Today's date as a local YYYY-MM-DD string. */
export function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
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

function average(values: Array<number | null>, decimals = 0): number {
  const numbers = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  )

  if (numbers.length === 0) {
    return 0
  }

  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length
  const factor = 10 ** decimals
  return Math.round(mean * factor) / factor
}

function sortByDateAsc(logs: NutritionLog[]): NutritionLog[] {
  if (!Array.isArray(logs)) {
    return []
  }

  return [...logs].sort((a, b) => getLogTime(a) - getLogTime(b))
}

function getLogTime(log: NutritionLog): number {
  const dateTime = new Date(`${log.date}T00:00:00`).getTime()
  if (Number.isFinite(dateTime)) {
    return dateTime
  }

  const createdTime = new Date(log.createdAt).getTime()
  return Number.isFinite(createdTime) ? createdTime : 0
}

function toNumber(value: number | null): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
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

function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function toDateKey(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function formatWeekLabel(dateKey: string): string {
  const parsed = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return dateKey
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(parsed)
}

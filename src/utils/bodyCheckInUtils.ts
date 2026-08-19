import {
  BODY_CHECK_INS_KEY,
  type BodyCheckIn,
  type PhotoSlot,
} from '../data/bodyCheckIns'
import { formatDate } from '../i18n/format'
import { t } from '../i18n/t'
import type { MessageKey } from '../i18n/catalog'
import { safeGetJSON, safeSetJSON } from './storageUtils'
import { toLocalIsoDate, todayIsoDate } from './dateUtils'

export type MeasurementKey =
  | 'bodyWeightKg'
  | 'waistCm'
  | 'bellyCm'
  | 'chestCm'
  | 'shouldersCm'
  | 'leftArmCm'
  | 'rightArmCm'
  | 'hipsCm'
  | 'armAverage'
  | 'postureRating'
  | 'absVisibilityRating'
  | 'energyLevel'
  | 'sleepQuality'

export interface MeasurementPoint {
  date: string
  value: number
}

export interface MeasurementField {
  key: MeasurementKey
  /** Message key: the field list is built at module load, before a language. */
  labelKey: MessageKey
  unit: 'cm' | 'kg' | 'rating'
  goodDirection: 'up' | 'down' | 'either'
}

export interface TrendSummary {
  key: MeasurementKey
  label: string
  message: string
  direction: 'up' | 'down' | 'flat'
  tone: 'good' | 'warn' | 'neutral'
}

/**
 * Fields used for the trend summary. Order matters: upper-body growth first,
 * then waist/belly control, then posture and abs quality.
 */
export const trendFields: MeasurementField[] = [
  {
    key: 'bodyWeightKg',
    labelKey: 'measure.bodyWeightKg',
    unit: 'kg',
    goodDirection: 'either',
  },
  { key: 'chestCm', labelKey: 'measure.chestCm', unit: 'cm', goodDirection: 'up' },
  {
    key: 'shouldersCm',
    labelKey: 'measure.shouldersCm',
    unit: 'cm',
    goodDirection: 'up',
  },
  {
    key: 'armAverage',
    labelKey: 'measure.armAverage',
    unit: 'cm',
    goodDirection: 'up',
  },
  { key: 'waistCm', labelKey: 'measure.waistCm', unit: 'cm', goodDirection: 'down' },
  { key: 'bellyCm', labelKey: 'measure.bellyCm', unit: 'cm', goodDirection: 'down' },
  {
    key: 'postureRating',
    labelKey: 'measure.postureRating',
    unit: 'rating',
    goodDirection: 'up',
  },
  {
    key: 'absVisibilityRating',
    labelKey: 'measure.absVisibilityRating',
    unit: 'rating',
    goodDirection: 'up',
  },
]

/** Safely reads the bodyCheckIns array from localStorage. */
export function getBodyCheckIns(): BodyCheckIn[] {
  if (typeof window === 'undefined') {
    return []
  }

  const parsed = safeGetJSON(BODY_CHECK_INS_KEY, [])
  return Array.isArray(parsed)
    ? parsed.filter(isCheckInLike).map(normalizeCheckIn)
    : []
}

/** Adds a new check-in to the front of the stored list and returns the new list. */
export function saveBodyCheckIn(checkIn: BodyCheckIn): BodyCheckIn[] {
  const next = [normalizeCheckIn(checkIn), ...getBodyCheckIns()]
  writeBodyCheckIns(next)
  return next
}

/** Updates an existing check-in by id and returns the new list. */
export function updateBodyCheckIn(
  id: string,
  updatedData: Partial<BodyCheckIn>,
): BodyCheckIn[] {
  const next = getBodyCheckIns().map((checkIn) =>
    checkIn.id === id
      ? normalizeCheckIn({ ...checkIn, ...updatedData, id })
      : checkIn,
  )
  writeBodyCheckIns(next)
  return next
}

/** Deletes a check-in by id and returns the new list. */
export function deleteBodyCheckIn(id: string): BodyCheckIn[] {
  const next = getBodyCheckIns().filter((checkIn) => checkIn.id !== id)
  writeBodyCheckIns(next)
  return next
}

/** Returns the newest check-in by date (createdAt as a tie-breaker). */
export function getLatestCheckIn(checkIns: BodyCheckIn[]): BodyCheckIn | null {
  if (!Array.isArray(checkIns) || checkIns.length === 0) {
    return null
  }

  return [...checkIns].sort((a, b) => getCheckInTime(b) - getCheckInTime(a))[0] ?? null
}

/** Returns the average of left and right arm measurements, or null if none. */
export function getArmAverage(checkIn: BodyCheckIn): number | null {
  const values = [checkIn.leftArmCm, checkIn.rightArmCm].filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  )

  if (values.length === 0) {
    return null
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return roundOne(average)
}

/**
 * Best displayable source for a photo slot. Prefers a resolved (signed/public)
 * URL, then a stored path's URL, and finally a legacy base64 data URL. Returns
 * null when there is nothing to show. Works for both local and cloud check-ins.
 */
export function getCheckInPhotoSrc(
  checkIn: BodyCheckIn,
  slot: PhotoSlot,
): string | null {
  const record = checkIn as unknown as Record<string, unknown>
  const url = record[`${slot}PhotoUrl`]
  if (typeof url === 'string' && url) {
    return url
  }
  const base64 = record[`${slot}Photo`]
  return typeof base64 === 'string' && base64 ? base64 : null
}

/** The stored Storage path for a photo slot, if any (cloud mode). */
export function getCheckInPhotoPath(
  checkIn: BodyCheckIn,
  slot: PhotoSlot,
): string | null {
  const record = checkIn as unknown as Record<string, unknown>
  const path = record[`${slot}PhotoPath`]
  return typeof path === 'string' && path ? path : null
}

/** True when the check-in has any photo (base64, path, or resolved URL). */
export function checkInHasPhotos(checkIn: BodyCheckIn): boolean {
  const slots: PhotoSlot[] = ['front', 'side', 'back']
  return slots.some(
    (slot) =>
      Boolean(getCheckInPhotoSrc(checkIn, slot)) ||
      Boolean(getCheckInPhotoPath(checkIn, slot)),
  )
}

/** Reads a single measurement value, resolving the virtual "armAverage" key. */
export function getMeasurementValue(
  checkIn: BodyCheckIn,
  key: MeasurementKey,
): number | null {
  if (key === 'armAverage') {
    return getArmAverage(checkIn)
  }

  const value = (checkIn as unknown as Record<string, unknown>)[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** Returns chart-ready progress data ([{ date, value }]) sorted oldest first. */
export function getMeasurementProgress(
  checkIns: BodyCheckIn[],
  measurementKey: MeasurementKey,
): MeasurementPoint[] {
  return sortByDateAsc(checkIns).flatMap((checkIn) => {
    const value = getMeasurementValue(checkIn, measurementKey)
    return value === null ? [] : [{ date: checkIn.date, value }]
  })
}

/** Builds simple trend messages comparing the first and latest check-in. */
export function getBodyTrendSummary(checkIns: BodyCheckIn[]): TrendSummary[] {
  const sorted = sortByDateAsc(checkIns)
  if (sorted.length < 2) {
    return []
  }

  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return trendFields.flatMap((field) => {
    const start = getMeasurementValue(first, field.key)
    const end = getMeasurementValue(last, field.key)
    if (start === null || end === null) {
      return []
    }

    const delta = roundOne(end - start)
    const direction: TrendSummary['direction'] =
      delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'

    return [
      {
        key: field.key,
        label: t(field.labelKey),
        message: buildTrendMessage(field, delta, direction),
        direction,
        tone: getTrendTone(field, direction),
      },
    ]
  })
}

/** Creates 3 weekly demo check-ins ending on the reference date. */
export function createDemoBodyCheckIns(reference = new Date()): BodyCheckIn[] {
  const createdAt = new Date().toISOString()

  const demos: Array<{ offsetDays: number; values: Partial<BodyCheckIn>; notes: string }> = [
    {
      offsetDays: -14,
      notes: 'Baseline week. Posture still collapses when tired.',
      values: {
        bodyWeightKg: 76,
        waistCm: 80,
        bellyCm: 84,
        chestCm: 98,
        shouldersCm: 116,
        leftArmCm: 32,
        rightArmCm: 32,
        hipsCm: 92,
        postureRating: 5,
        absVisibilityRating: 4,
        energyLevel: 7,
        sleepQuality: 6,
      },
    },
    {
      offsetDays: -7,
      notes: 'Chest and shoulders filling out. Waist holding steady.',
      values: {
        bodyWeightKg: 76.4,
        waistCm: 79.5,
        bellyCm: 83.5,
        chestCm: 99,
        shouldersCm: 117,
        leftArmCm: 32.3,
        rightArmCm: 32.2,
        hipsCm: 91.5,
        postureRating: 6,
        absVisibilityRating: 4,
        energyLevel: 7,
        sleepQuality: 7,
      },
    },
    {
      offsetDays: 0,
      notes: 'Upper body up, waist down. Abs starting to show in the morning.',
      values: {
        bodyWeightKg: 76.8,
        waistCm: 79,
        bellyCm: 83,
        chestCm: 100,
        shouldersCm: 118,
        leftArmCm: 32.5,
        rightArmCm: 32.5,
        hipsCm: 91,
        postureRating: 6,
        absVisibilityRating: 5,
        energyLevel: 8,
        sleepQuality: 7,
      },
    },
  ]

  return demos.map(({ offsetDays, values, notes }) => {
    const date = addDays(reference, offsetDays)
    return normalizeCheckIn({
      id: `demo-checkin-${toDateKey(date)}`,
      date: toDateKey(date),
      notes,
      createdAt,
      ...values,
    })
  })
}

/** Inserts demo check-ins, replacing any previous demo rows, and returns the list. */
export function addDemoCheckIns(): BodyCheckIn[] {
  const demo = createDemoBodyCheckIns()
  const demoIds = new Set(demo.map((checkIn) => checkIn.id))
  const existing = getBodyCheckIns().filter((checkIn) => !demoIds.has(checkIn.id))
  const next = [...demo, ...existing]
  writeBodyCheckIns(next)
  return next
}

/** Generates a unique id for a new check-in. */
export function generateCheckInId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `checkin-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Formats an ISO date string (YYYY-MM-DD) as a readable label. */
export function formatCheckInDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return date || '-'
  }

  return formatDate(parsed, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Today's date as a local YYYY-MM-DD string. */
export function todayIso(): string {
  return todayIsoDate()
}

// --- internal helpers ---------------------------------------------------------

function writeBodyCheckIns(checkIns: BodyCheckIn[]) {
  if (typeof window === 'undefined') {
    return
  }

  safeSetJSON(BODY_CHECK_INS_KEY, checkIns)
}

function isCheckInLike(value: unknown): boolean {
  return Boolean(
    value && typeof value === 'object' && 'id' in value && 'date' in value,
  )
}

function normalizeCheckIn(raw: unknown): BodyCheckIn {
  const value = (raw ?? {}) as Record<string, unknown>

  return {
    id: typeof value.id === 'string' && value.id ? value.id : generateCheckInId(),
    date: typeof value.date === 'string' ? value.date : '',
    bodyWeightKg: toNullableNumber(value.bodyWeightKg),
    waistCm: toNullableNumber(value.waistCm),
    bellyCm: toNullableNumber(value.bellyCm),
    chestCm: toNullableNumber(value.chestCm),
    shouldersCm: toNullableNumber(value.shouldersCm),
    leftArmCm: toNullableNumber(value.leftArmCm),
    rightArmCm: toNullableNumber(value.rightArmCm),
    hipsCm: toNullableNumber(value.hipsCm),
    postureRating: toNullableNumber(value.postureRating),
    absVisibilityRating: toNullableNumber(value.absVisibilityRating),
    energyLevel: toNullableNumber(value.energyLevel),
    sleepQuality: toNullableNumber(value.sleepQuality),
    notes: typeof value.notes === 'string' ? value.notes : '',
    frontPhoto: toNullableString(value.frontPhoto),
    sidePhoto: toNullableString(value.sidePhoto),
    backPhoto: toNullableString(value.backPhoto),
    frontPhotoPath: toNullableString(value.frontPhotoPath),
    sidePhotoPath: toNullableString(value.sidePhotoPath),
    backPhotoPath: toNullableString(value.backPhotoPath),
    frontPhotoUrl: toNullableString(value.frontPhotoUrl),
    sidePhotoUrl: toNullableString(value.sidePhotoUrl),
    backPhotoUrl: toNullableString(value.backPhotoUrl),
    createdAt:
      typeof value.createdAt === 'string' && value.createdAt
        ? value.createdAt
        : new Date().toISOString(),
    syncStatus: toSyncStatus(value.syncStatus),
    updatedAt: toNullableString(value.updatedAt) ?? undefined,
  }
}

function toSyncStatus(value: unknown): BodyCheckIn['syncStatus'] {
  return value === 'local-only' || value === 'synced' || value === 'pending-sync'
    ? value
    : undefined
}

function buildTrendMessage(
  field: MeasurementField,
  delta: number,
  direction: TrendSummary['direction'],
): string {
  const label = t(field.labelKey)
  if (direction === 'flat') {
    return t('checkin.trendUnchanged', { label })
  }

  const amount = Math.abs(delta)
  const unit =
    field.unit === 'kg'
      ? t('checkin.trendUnitKg')
      : field.unit === 'cm'
        ? t('checkin.trendUnitCm')
        : t('checkin.trendUnitPoints', { count: amount })

  return direction === 'up'
    ? t('checkin.trendIncreased', { label, amount, unit })
    : t('checkin.trendDecreased', { label, amount, unit })
}

function getTrendTone(
  field: MeasurementField,
  direction: TrendSummary['direction'],
): TrendSummary['tone'] {
  if (direction === 'flat' || field.goodDirection === 'either') {
    return 'neutral'
  }

  return direction === field.goodDirection ? 'good' : 'warn'
}

function sortByDateAsc(checkIns: BodyCheckIn[]): BodyCheckIn[] {
  if (!Array.isArray(checkIns)) {
    return []
  }

  return [...checkIns].sort((a, b) => getCheckInTime(a) - getCheckInTime(b))
}

function getCheckInTime(checkIn: BodyCheckIn): number {
  const dateTime = new Date(`${checkIn.date}T00:00:00`).getTime()
  if (Number.isFinite(dateTime)) {
    return dateTime
  }

  const createdTime = new Date(checkIn.createdAt).getTime()
  return Number.isFinite(createdTime) ? createdTime : 0
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

function roundOne(value: number): number {
  return Math.round(value * 10) / 10
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function toDateKey(date: Date): string {
  return toLocalIsoDate(date)
}

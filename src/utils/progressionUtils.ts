import type { WorkoutSession } from '../data/workoutSessions'
import {
  exerciseIdentitiesMatch,
  type ExerciseIdentityOptions,
  type ExerciseIdentityInput,
} from '../data/exerciseIdentity'
import { t } from '../i18n/t'
import {
  formatDuration,
  getExerciseLoggingMode,
} from './exerciseLoggingUtils'

/**
 * Step 7 - Automatic Progression Suggestions.
 *
 * Pure, localStorage-only analysis of logged workoutSessions. Given an exercise
 * and the past sessions, it decides whether to increase weight, increase reps,
 * keep the same load, reduce load, or flag a form / pain warning. Tuned for
 * hypertrophy + body recomposition with a strong bias toward safe posture.
 *
 * Optional set fields are read defensively so legacy records keep working.
 */

export type SuggestionType =
  | 'increase'
  | 'keep'
  | 'reduce'
  | 'no-data'
  | 'form-warning'

export type ExerciseType =
  | 'weighted'
  | 'dumbbell'
  | 'bodyweight'
  | 'abs'
  | 'posture'
  | 'cardio'

export interface ProgressionSuggestion {
  type: SuggestionType
  title: string
  message: string
  nextTarget: string
  reason: string
  /** Optional context so the card can stay a self-contained component. */
  exerciseName?: string
  latestSummary?: string
}

export interface RepRange {
  min: number
  max: number
  kind: 'reps' | 'duration'
  unit?: 'sec' | 'min'
}

/** Loosely typed logged set so optional pain / time fields never crash us. */
export interface FlexibleSet {
  reps?: number | null
  weightKg?: number | null
  rpe?: number | null
  rir?: number | null
  timeSeconds?: number | null
  painLevel?: number | null
  setNumber?: number
  notes?: string
}

export interface FlexibleExerciseResult {
  exerciseId?: string | null
  exerciseName?: string
  sets?: FlexibleSet[]
  targetReps?: string
  targetDuration?: string
  targetSets?: number
}

export interface ExerciseHistoryEntry {
  date: string
  result: FlexibleExerciseResult
}

/** Exercise shape we can classify + read a target range from. */
export interface ProgressionExercise {
  id?: string
  name: string
  repRange?: string
  duration?: string
  muscleGroup?: string
  category?: string
  equipment?: string | string[]
  sets?: number
  targetRir?: string
}

// ---------------------------------------------------------------------------
// A. History helpers
// ---------------------------------------------------------------------------

/** All past logged results for one exercise, oldest first. */
export function getExerciseHistory(
  sessions: WorkoutSession[],
  exercise: string | ExerciseIdentityInput,
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): ExerciseHistoryEntry[] {
  const entries: ExerciseHistoryEntry[] = []
  const target = typeof exercise === 'string'
    ? { exerciseName: exercise }
    : exercise

  for (const session of sessions ?? []) {
    const exercises = getSessionExercises(session)
    for (const exercise of exercises) {
      if (exerciseIdentitiesMatch(exercise, target, options)) {
        entries.push({ date: sessionDateKey(session), result: exercise })
      }
    }
  }

  return entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
}

/** The most recent logged result for one exercise, or null. */
export function getLatestExerciseResult(
  sessions: WorkoutSession[],
  exercise: string | ExerciseIdentityInput,
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): FlexibleExerciseResult | null {
  const history = getExerciseHistory(sessions, exercise, options)
  return history.length > 0 ? history[history.length - 1].result : null
}

// ---------------------------------------------------------------------------
// C / D. Per-result aggregates
// ---------------------------------------------------------------------------

/** Average RPE across sets that actually logged an RPE (rounded to 0.1). */
export function getAverageRPE(exerciseResult: FlexibleExerciseResult | null) {
  const rpes = getSets(exerciseResult)
    .map((set) => toNumber(set.rpe))
    .filter((value) => value > 0)

  if (rpes.length === 0) {
    return null
  }

  const average = rpes.reduce((sum, value) => sum + value, 0) / rpes.length
  return Math.round(average * 10) / 10
}

/** Sets that were actually performed: reps > 0 OR timeSeconds > 0. */
export function getCompletedSets(
  exerciseResult: FlexibleExerciseResult | null,
): FlexibleSet[] {
  return getSets(exerciseResult).filter(
    (set) => toNumber(set.reps) > 0 || toNumber(set.timeSeconds) > 0,
  )
}

/** Highest pain value logged for the result (0 when none captured). */
export function getMaxPainLevel(exerciseResult: FlexibleExerciseResult | null) {
  return getSets(exerciseResult).reduce(
    (max, set) => Math.max(max, toNumber(set.painLevel)),
    0,
  )
}

// ---------------------------------------------------------------------------
// E. Rep / duration range parser
// ---------------------------------------------------------------------------

/**
 * "6-10" / "6–10" -> { min: 6, max: 10, kind: 'reps' }
 * "8-12 each side" -> { min: 8, max: 12, kind: 'reps' }
 * "10 each side" -> { min: 10, max: 10, kind: 'reps' }
 * "30–45 sec" -> { min: 30, max: 45, kind: 'duration', unit: 'sec' }
 * "25-35 minutes" -> { min: 25, max: 35, kind: 'duration', unit: 'min' }
 * "Easy pace" -> null
 */
export function parseRepRange(repRange?: string | null): RepRange | null {
  if (!repRange) {
    return null
  }

  const normalized = repRange.replace(/[–—]/g, '-').toLowerCase()
  const numbers = (normalized.match(/\d+(\.\d+)?/g) ?? []).map(Number)

  if (numbers.length === 0) {
    return null
  }

  const min = numbers[0]
  const max = numbers.length > 1 ? numbers[1] : numbers[0]

  const isDuration = /sec|second|min|minute|hour/.test(normalized)
  if (isDuration) {
    const unit: 'sec' | 'min' = /sec|second/.test(normalized) ? 'sec' : 'min'
    return { min, max, kind: 'duration', unit }
  }

  return { min, max, kind: 'reps' }
}

// ---------------------------------------------------------------------------
// Exercise type classifier
// ---------------------------------------------------------------------------

export function classifyExercise(exercise: ProgressionExercise): ExerciseType {
  const text = [exercise.muscleGroup, exercise.category, exercise.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const equipment = (
    Array.isArray(exercise.equipment)
      ? exercise.equipment.join(' ')
      : exercise.equipment ?? ''
  ).toLowerCase()

  if (text.includes('posture') || text.includes('mobility')) {
    return 'posture'
  }

  if (
    text.includes('conditioning') ||
    text.includes('cardio') ||
    text.includes('recovery') ||
    equipment.includes('treadmill') ||
    equipment.includes('skipping') ||
    equipment.includes('walking')
  ) {
    return 'cardio'
  }

  if (
    text.includes('abs') ||
    text.includes('oblique') ||
    text.includes('core')
  ) {
    return 'abs'
  }

  const hasBarbell = equipment.includes('barbell')
  const hasDumbbell = equipment.includes('dumbbell')
  const hasExternalLoad = [
    'cable',
    'machine',
    'smith',
    'band',
    'plate',
    'weighted',
  ].some((term) => equipment.includes(term))

  if (hasDumbbell && !hasBarbell) {
    return 'dumbbell'
  }

  if (hasBarbell || hasDumbbell || hasExternalLoad) {
    return 'weighted'
  }

  return 'bodyweight'
}

// ---------------------------------------------------------------------------
// F / G / H. Boolean progression rules
// ---------------------------------------------------------------------------

/**
 * Increase load when every completed set reached the top of the rep range,
 * average RPE is <= 9, and no pain was logged.
 */
export function shouldIncreaseLoad(
  exercise: ProgressionExercise,
  latestResult: FlexibleExerciseResult | null,
): boolean {
  const range = getTargetRange(exercise, latestResult)
  if (!range || range.kind !== 'reps') {
    return false
  }

  const completed = getCompletedSets(latestResult)
  const requiredSets = getRequiredSetCount(exercise, latestResult)
  if (completed.length < requiredSets) {
    return false
  }

  const workSets = completed.slice(0, requiredSets)
  const reachedTop = workSets.every((set) => toNumber(set.reps) >= range.max)
  const averageRpe = getAverageRPE(latestResult)
  const pain = getMaxPainLevel(latestResult)
  const requiredRir = getRequiredRir(exercise)
  const rirValues = workSets
    .map((set) => nullableNumber(set.rir))
    .filter((value): value is number => value !== null)
  const rirSatisfied = requiredRir === null
    ? true
    : rirValues.length === workSets.length &&
      rirValues.every((rir) => rir >= requiredRir)

  return (
    reachedTop &&
    rirSatisfied &&
    (averageRpe === null || averageRpe <= 9) &&
    pain === 0
  )
}

/**
 * Keep the same load when reps are inside the range but not every set reached
 * the top yet - progress by adding reps first.
 */
export function shouldKeepSameLoad(
  exercise: ProgressionExercise,
  latestResult: FlexibleExerciseResult | null,
): boolean {
  const range = getTargetRange(exercise, latestResult)
  if (!range || range.kind !== 'reps') {
    return false
  }

  const completed = getCompletedSets(latestResult)
  if (completed.length === 0) {
    return false
  }

  const inRange = completed.every((set) => toNumber(set.reps) >= range.min)
  const requiredSets = getRequiredSetCount(exercise, latestResult)
  const reachedTop =
    completed.length >= requiredSets &&
    completed
      .slice(0, requiredSets)
      .every((set) => toNumber(set.reps) >= range.max)

  return inRange && !reachedTop
}

function getRequiredSetCount(
  exercise: ProgressionExercise,
  latestResult: FlexibleExerciseResult | null,
): number {
  const value = Number(exercise.sets ?? latestResult?.targetSets ?? 1)
  return Number.isFinite(value) ? Math.max(1, Math.round(value)) : 1
}

function getRequiredRir(exercise: ProgressionExercise): number | null {
  const match = exercise.targetRir?.match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Reduce load when most sets fell below the minimum rep target, average RPE
 * hit 10, or pain was logged.
 */
export function shouldReduceLoad(
  exercise: ProgressionExercise,
  latestResult: FlexibleExerciseResult | null,
): boolean {
  const completed = getCompletedSets(latestResult)
  if (completed.length === 0) {
    return false
  }

  const range = getTargetRange(exercise, latestResult)
  const averageRpe = getAverageRPE(latestResult)
  const pain = getMaxPainLevel(latestResult)

  const belowMin =
    range && range.kind === 'reps'
      ? completed.filter((set) => toNumber(set.reps) < range.min).length
      : 0
  const mostBelowMin = belowMin > completed.length / 2

  return mostBelowMin || averageRpe === 10 || pain >= 4
}

// ---------------------------------------------------------------------------
// I. The suggestion engine
// ---------------------------------------------------------------------------

export function getProgressionSuggestion(
  exercise: ProgressionExercise,
  sessions: WorkoutSession[],
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): ProgressionSuggestion {
  const identity = {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
  }
  const latestAny = getLatestExerciseResult(sessions, identity, options)

  // Pain from a re-entry or recovery session remains safety-relevant even
  // though its deliberately reduced performance is not a progression baseline.
  if (latestAny && getMaxPainLevel(latestAny) >= 4) {
    return withMeta(formWarningSuggestion(), exercise.name, latestAny)
  }

  const latest = getLatestExerciseResult(
    (sessions ?? []).filter(isProgressionBaselineSession),
    identity,
    options,
  )

  if (!latest) {
    return withMeta(noDataSuggestion(), exercise.name, null)
  }

  const type = classifyExercise(exercise)
  const averageRpe = getAverageRPE(latest)
  const pain = getMaxPainLevel(latest)

  // 1. Pain always wins - never progress through pain.
  if (pain >= 4) {
    return withMeta(formWarningSuggestion(), exercise.name, latest)
  }

  if (
    getExerciseLoggingMode({
      duration: exercise.duration,
      repRange: exercise.repRange,
      targetDuration: latest.targetDuration,
      targetReps: latest.targetReps,
    }) === 'duration'
  ) {
    return withMeta(durationSuggestion(), exercise.name, latest)
  }

  // 2. Posture work is never heavily loaded - progress by control.
  if (type === 'posture') {
    return withMeta(postureSuggestion(exercise, latest), exercise.name, latest)
  }

  // 3. Cardio - add time / incline, never running (shins).
  if (type === 'cardio') {
    return withMeta(cardioSuggestion(averageRpe), exercise.name, latest)
  }

  if (!getTargetRange(exercise, latest)) {
    return withMeta(unknownTargetSuggestion(), exercise.name, latest)
  }

  // 4. Rep-based decision (reduce first for safety, then increase, then keep).
  if (shouldReduceLoad(exercise, latest)) {
    return withMeta(reduceSuggestion(type, averageRpe), exercise.name, latest)
  }

  if (shouldIncreaseLoad(exercise, latest)) {
    return withMeta(increaseSuggestion(type), exercise.name, latest)
  }

  if (shouldKeepSameLoad(exercise, latest)) {
    return withMeta(keepSuggestion(type), exercise.name, latest)
  }

  // 5. Fallback - timed core work or partial data.
  return withMeta(keepSuggestion(type), exercise.name, latest)
}

function isProgressionBaselineSession(session: WorkoutSession): boolean {
  return (
    session?.progressionMode !== 'reentry' &&
    session?.progressionMode !== 'recovery'
  )
}

/**
 * General "how to progress this kind of exercise" advice for the library
 * detail modal. Static rules keyed by exercise type - no session data needed.
 */
export function getGeneralProgressionAdvice(
  exercise: ProgressionExercise,
): string[] {
  if (getExerciseLoggingMode(exercise) === 'duration') {
    return [
      t('advice.duration.1'),
      t('advice.duration.2'),
      t('advice.duration.3'),
      t('advice.duration.4'),
    ]
  }

  const type = classifyExercise(exercise)

  switch (type) {
    case 'dumbbell':
      return [
        t('advice.dumbbell.1'),
        t('advice.dumbbell.2'),
        t('advice.dumbbell.3'),
        t('advice.dumbbell.4'),
      ]
    case 'weighted':
      return [
        t('advice.weighted.1'),
        t('advice.weighted.2'),
        t('advice.weighted.3'),
        t('advice.weighted.4'),
      ]
    case 'bodyweight':
      return [
        t('advice.bodyweight.1'),
        t('advice.bodyweight.2'),
        t('advice.bodyweight.3'),
        t('advice.bodyweight.4'),
      ]
    case 'abs':
      return [
        t('advice.abs.1'),
        t('advice.abs.2'),
        t('advice.abs.3'),
        t('advice.abs.4'),
      ]
    case 'posture':
      return [
        t('advice.posture.1'),
        t('advice.posture.2'),
        t('advice.posture.3'),
        t('advice.posture.4'),
      ]
    case 'cardio':
      return [
        t('advice.cardio.1'),
        t('advice.cardio.2'),
        t('advice.cardio.3'),
        t('advice.cardio.4'),
      ]
  }
}

// ---------------------------------------------------------------------------
// Suggestion builders
// ---------------------------------------------------------------------------

function noDataSuggestion(): ProgressionSuggestion {
  return {
    type: 'no-data',
    title: t('coach.noData.title'),
    message: t('coach.noData.message'),
    nextTarget: t('coach.noData.target'),
    reason: t('coach.noData.reason'),
  }
}

function unknownTargetSuggestion(): ProgressionSuggestion {
  return {
    type: 'no-data',
    title: t('coach.unknownTarget.title'),
    message:
      t('coach.unknownTarget.message'),
    nextTarget: t('coach.unknownTarget.target'),
    reason: t('coach.unknownTarget.reason'),
  }
}

function durationSuggestion(): ProgressionSuggestion {
  return {
    type: 'keep',
    title: t('coach.duration.title'),
    message: t('coach.duration.message'),
    nextTarget: t('coach.duration.target'),
    reason: t('coach.duration.reason'),
  }
}

function formWarningSuggestion(): ProgressionSuggestion {
  return {
    type: 'form-warning',
    title: t('coach.formWarning.title'),
    message:
      t('coach.formWarning.message'),
    nextTarget: t('coach.formWarning.target'),
    reason: t('coach.formWarning.reason'),
  }
}

function increaseSuggestion(type: ExerciseType): ProgressionSuggestion {
  const reason = t('coach.increase.reason')

  if (type === 'dumbbell') {
    return {
      type: 'increase',
      title: t('coach.increase.title'),
      message:
        t('coach.increase.dumbbell.message'),
      nextTarget: t('coach.increase.dumbbell.target'),
      reason,
    }
  }

  if (type === 'bodyweight') {
    return {
      type: 'increase',
      title: t('coach.increase.title'),
      message:
        t('coach.increase.bodyweight.message'),
      nextTarget: t('coach.increase.bodyweight.target'),
      reason,
    }
  }

  if (type === 'abs') {
    return {
      type: 'increase',
      title: t('coach.increase.abs.title'),
      message:
        t('coach.increase.abs.message'),
      nextTarget: t('coach.increase.abs.target'),
      reason: t('coach.increase.abs.reason'),
    }
  }

  return {
    type: 'increase',
    title: t('coach.increase.title'),
    message:
      t('coach.increase.default.message'),
    nextTarget: t('coach.increase.default.target'),
    reason,
  }
}

function keepSuggestion(type: ExerciseType): ProgressionSuggestion {
  if (type === 'bodyweight') {
    return {
      type: 'keep',
      title: t('coach.keep.title'),
      message: t('coach.keep.bodyweight.message'),
      nextTarget: t('coach.keep.bodyweight.target'),
      reason: t('coach.keep.bodyweight.reason'),
    }
  }

  if (type === 'abs') {
    return {
      type: 'keep',
      title: t('coach.keep.abs.title'),
      message: t('coach.keep.abs.message'),
      nextTarget: t('coach.keep.abs.target'),
      reason: t('coach.keep.abs.reason'),
    }
  }

  return {
    type: 'keep',
    title: t('coach.keep.title'),
    message: t('coach.keep.default.message'),
    nextTarget: t('coach.keep.default.target'),
    reason:
      t('coach.keep.default.reason'),
  }
}

function reduceSuggestion(
  type: ExerciseType,
  averageRpe: number | null,
): ProgressionSuggestion {
  if (averageRpe === 10) {
    return {
      type: 'reduce',
      title: t('coach.reduce.title'),
      message:
        t('coach.reduce.rpe.message'),
      nextTarget: t('coach.reduce.rpe.target'),
      reason: t('coach.reduce.rpe.reason'),
    }
  }

  if (type === 'bodyweight') {
    return {
      type: 'reduce',
      title: t('coach.reduce.title'),
      message:
        t('coach.reduce.bodyweight.message'),
      nextTarget: t('coach.reduce.bodyweight.target'),
      reason: t('coach.reduce.reason'),
    }
  }

  if (type === 'abs') {
    return {
      type: 'reduce',
      title: t('coach.reduce.abs.title'),
      message: t('coach.reduce.abs.message'),
      nextTarget: t('coach.reduce.abs.target'),
      reason: t('coach.reduce.reason'),
    }
  }

  return {
    type: 'reduce',
    title: t('coach.reduce.title'),
    message:
      t('coach.reduce.default.message'),
    nextTarget: t('coach.reduce.rpe.target'),
    reason: t('coach.reduce.reason'),
  }
}

function postureSuggestion(
  exercise: ProgressionExercise,
  latest: FlexibleExerciseResult,
): ProgressionSuggestion {
  const averageRpe = getAverageRPE(latest)
  const range = getTargetRange(exercise, latest)
  const completed = getCompletedSets(latest)
  const struggling =
    averageRpe === 10 ||
    (range?.kind === 'reps' &&
      completed.length > 0 &&
      completed.filter((set) => toNumber(set.reps) < range.min).length >
        completed.length / 2)

  if (struggling) {
    return {
      type: 'reduce',
      title: t('coach.posture.easeTitle'),
      message:
        t('coach.posture.easeMessage'),
      nextTarget: t('coach.posture.easeTarget'),
      reason: t('coach.posture.easeReason'),
    }
  }

  return {
    type: 'keep',
    title: t('coach.posture.buildTitle'),
    message:
      t('coach.posture.buildMessage'),
    nextTarget: t('coach.posture.buildTarget'),
    reason: t('coach.posture.buildReason'),
  }
}

function cardioSuggestion(averageRpe: number | null): ProgressionSuggestion {
  if (averageRpe !== null && averageRpe >= 9) {
    return {
      type: 'keep',
      title: t('coach.cardio.holdTitle'),
      message:
        t('coach.cardio.holdMessage'),
      nextTarget: t('coach.cardio.holdTarget'),
      reason: t('coach.cardio.holdReason'),
    }
  }

  return {
    type: 'increase',
    title: t('coach.cardio.progressTitle'),
    message:
      t('coach.cardio.progressMessage'),
    nextTarget: t('coach.cardio.progressTarget'),
    reason: t('coach.cardio.progressReason'),
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function withMeta(
  suggestion: ProgressionSuggestion,
  exerciseName: string,
  latest: FlexibleExerciseResult | null,
): ProgressionSuggestion {
  return {
    ...suggestion,
    exerciseName,
    latestSummary: latest ? summarizeResult(latest) : undefined,
  }
}

/** Short "12, 12, 12, 12 reps @ 10 kg · RPE 8.5" line for the card. */
function summarizeResult(result: FlexibleExerciseResult): string {
  const completed = getCompletedSets(result)
  const sets = completed.length > 0 ? completed : getSets(result)

  const reps = sets.map((set) => toNumber(set.reps)).filter((value) => value > 0)
  const weights = sets
    .map((set) => toNumber(set.weightKg))
    .filter((value) => value > 0)
  const times = sets
    .map((set) => toNumber(set.timeSeconds))
    .filter((value) => value > 0)
  const averageRpe = getAverageRPE(result)

  const parts: string[] = []

  if (reps.length > 0) {
    parts.push(t('coach.summary.reps', { reps: reps.join(', ') }))
  } else if (times.length > 0) {
    parts.push(times.map(formatDuration).join(', '))
  }

  if (weights.length > 0) {
    parts.push(t('coach.summary.weight', { weight: Math.max(...weights) }))
  }

  const summary = parts.join(' ')
  const rpeSuffix =
    averageRpe !== null ? t('coach.summary.rpe', { rpe: averageRpe }) : ''

  return summary ? `${summary}${rpeSuffix}` : t('coach.summary.logged')
}

function getTargetRange(
  exercise: ProgressionExercise,
  latest: FlexibleExerciseResult | null,
): RepRange | null {
  const target =
    exercise.repRange ??
    exercise.duration ??
    latest?.targetDuration ??
    latest?.targetReps ??
    null
  return parseRepRange(target)
}

function getSessionExercises(
  session: WorkoutSession,
): FlexibleExerciseResult[] {
  const exercises = (session as { exercises?: FlexibleExerciseResult[] })
    .exercises
  return Array.isArray(exercises) ? exercises : []
}

function getSets(result: FlexibleExerciseResult | null): FlexibleSet[] {
  return Array.isArray(result?.sets) ? result.sets : []
}

function sessionDateKey(session: WorkoutSession): string {
  return session.finishedAt || `${session.date}T00:00:00`
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

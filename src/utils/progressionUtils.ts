import { weeklyPlan, type Exercise, type WorkoutDay } from '../data/workoutPlan'
import type { WorkoutSession } from '../data/workoutSessions'
import {
  exerciseIdentitiesMatch,
  normalizeExerciseName,
  type ExerciseIdentityOptions,
  type ExerciseIdentityInput,
} from '../data/exerciseIdentity'
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

  if (hasDumbbell && !hasBarbell) {
    return 'dumbbell'
  }

  if (hasBarbell || hasDumbbell) {
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
  if (completed.length === 0) {
    return false
  }

  const reachedTop = completed.every((set) => toNumber(set.reps) >= range.max)
  const averageRpe = getAverageRPE(latestResult)
  const pain = getMaxPainLevel(latestResult)

  return reachedTop && (averageRpe === null || averageRpe <= 9) && pain === 0
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
  const reachedTop = completed.every((set) => toNumber(set.reps) >= range.max)

  return inRange && !reachedTop
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
  const latest = getLatestExerciseResult(sessions, {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
  }, options)

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

/** Convenience for pages that only know an exercise name. */
export function getSuggestionForExerciseName(
  exerciseName: string,
  sessions: WorkoutSession[],
  plan: WorkoutDay[] = weeklyPlan,
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): ProgressionSuggestion {
  const planExercise = findPlanExercise(exerciseName, plan)
  return getProgressionSuggestion(
    planExercise ?? { name: exerciseName },
    sessions,
    options,
  )
}

/** The most actionable suggestions for today's workout (for the dashboard). */
export function getTodayProgressionFocus(
  sessions: WorkoutSession[],
  todayExercises: Exercise[],
  limit = 3,
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): ProgressionSuggestion[] {
  const priority: Record<SuggestionType, number> = {
    'form-warning': 0,
    reduce: 1,
    increase: 2,
    keep: 3,
    'no-data': 4,
  }

  return todayExercises
    .map((exercise) => getProgressionSuggestion(exercise, sessions, options))
    .sort((a, b) => priority[a.type] - priority[b.type])
    .slice(0, limit)
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
      'Maintain the target duration with controlled effort',
      'Keep the movement or pace consistent before adding difficulty',
      'Use RPE and pain notes to guide the next session',
      'Reduce duration or load if form deteriorates',
    ]
  }

  const type = classifyExercise(exercise)

  switch (type) {
    case 'dumbbell':
      return [
        'Reach the top of your rep range on every set first',
        'Then move up to the next dumbbell size and rebuild reps',
        'Keep RPE around 8-9 - leave 1-2 reps in the tank',
        'Log any pain and reduce load if it appears',
      ]
    case 'weighted':
      return [
        'Reach the top of your rep range on every set first',
        'Then add about 2.5 kg and rebuild your reps',
        'Keep RPE around 8-9 - do not grind to failure',
        'Keep ribs down and brace; reduce load if the back arches',
      ]
    case 'bodyweight':
      return [
        'First reach all sets at the top clean rep count',
        'Then add backpack weight or a harder variation',
        'Slow the tempo before adding load',
        'If the lower back arches, reduce load and reset form',
      ]
    case 'abs':
      return [
        'Add reps or time before adding any load',
        'Slow the tempo to make it harder',
        'Keep ribs down and avoid pulling on the neck',
        'Add light load only once form is perfect',
      ]
    case 'posture':
      return [
        'Do not chase heavy load here',
        'Progress with control, slower reps, and consistency',
        'Keep ribs down and glutes lightly squeezed',
        'Quality over quantity on every rep',
      ]
    case 'cardio':
      return [
        'Add 5 minutes before adding intensity',
        'Use incline instead of running to protect your shins',
        'Keep the effort conversational',
        'Stop if your shins start to flare up',
      ]
  }
}

// ---------------------------------------------------------------------------
// Suggestion builders
// ---------------------------------------------------------------------------

function noDataSuggestion(): ProgressionSuggestion {
  return {
    type: 'no-data',
    title: 'No Data Yet',
    message: 'Complete this exercise once to get progression advice.',
    nextTarget: 'Log your first workout',
    reason: 'No previous workout data found.',
  }
}

function unknownTargetSuggestion(): ProgressionSuggestion {
  return {
    type: 'no-data',
    title: 'Rep Range Unknown',
    message:
      'Add a rep range or duration to this exercise before using progression advice.',
    nextTarget: 'Set reps or duration in Plan Editor',
    reason: 'Target data is missing, so load progression is paused.',
  }
}

function durationSuggestion(): ProgressionSuggestion {
  return {
    type: 'keep',
    title: 'Maintain Duration',
    message: 'Maintain the target duration with controlled effort.',
    nextTarget: 'Repeat the target duration',
    reason: 'Timed exercises are kept separate from repetition-based progression.',
  }
}

function formWarningSuggestion(): ProgressionSuggestion {
  return {
    type: 'form-warning',
    title: 'Form Warning',
    message:
      'Pain was logged for this exercise. Do not increase load next time. Use a lighter load and check your form.',
    nextTarget: 'Lighter load, focus on form',
    reason: 'Pain was reported - safety before progression.',
  }
}

function increaseSuggestion(type: ExerciseType): ProgressionSuggestion {
  const reason = 'All sets reached target reps with controlled RPE.'

  if (type === 'dumbbell') {
    return {
      type: 'increase',
      title: 'Increase Load',
      message:
        'You reached the top of the rep range on every set. Move up to the next dumbbell size next time.',
      nextTarget: 'Next dumbbell size up',
      reason,
    }
  }

  if (type === 'bodyweight') {
    return {
      type: 'increase',
      title: 'Increase Load',
      message:
        'You hit the top of the range on every set. Add backpack weight, slow the tempo, or try a harder variation.',
      nextTarget: 'Add backpack weight or harder variation',
      reason,
    }
  }

  if (type === 'abs') {
    return {
      type: 'increase',
      title: 'Progress Abs',
      message:
        'Top reps reached on every set. Add reps, add time, or slow the tempo. Keep load light to protect posture.',
      nextTarget: 'Add reps / time / slower tempo',
      reason: 'Top reps reached with good control - no need for heavy load yet.',
    }
  }

  return {
    type: 'increase',
    title: 'Increase Load',
    message:
      'You reached the top of the rep range for all sets. Add 2.5 kg next time.',
    nextTarget: 'Add 2.5 kg total',
    reason,
  }
}

function keepSuggestion(type: ExerciseType): ProgressionSuggestion {
  if (type === 'bodyweight') {
    return {
      type: 'keep',
      title: 'Keep Same Load',
      message: 'Same setup next time - aim for 1 more clean rep per set.',
      nextTarget: 'Same load, +1 rep total',
      reason: 'You are progressing but have not reached the top of the range yet.',
    }
  }

  if (type === 'abs') {
    return {
      type: 'keep',
      title: 'Keep Same',
      message: 'Same difficulty - add 1 rep or a few seconds next time.',
      nextTarget: '+1 rep or a few seconds',
      reason: 'Core work progresses through reps, time, and tempo.',
    }
  }

  return {
    type: 'keep',
    title: 'Keep Same Load',
    message: 'Stay with the same weight and try to add 1 rep next workout.',
    nextTarget: 'Same weight, +1 rep total',
    reason:
      'You are progressing but have not reached the top of the rep range yet.',
  }
}

function reduceSuggestion(
  type: ExerciseType,
  averageRpe: number | null,
): ProgressionSuggestion {
  if (averageRpe === 10) {
    return {
      type: 'reduce',
      title: 'Reduce Load',
      message:
        'Too close to failure last time. Keep or reduce the load next workout.',
      nextTarget: 'Reduce load by 5-10%',
      reason: 'Average RPE hit 10 - leave a rep or two in the tank.',
    }
  }

  if (type === 'bodyweight') {
    return {
      type: 'reduce',
      title: 'Reduce Load',
      message:
        'Reps dropped below target. Remove backpack weight or use an easier variation.',
      nextTarget: 'Easier variation or less added weight',
      reason: 'Performance was too difficult for the target range.',
    }
  }

  if (type === 'abs') {
    return {
      type: 'reduce',
      title: 'Reduce Difficulty',
      message: 'Reps dropped below target. Ease the difficulty and rebuild clean reps.',
      nextTarget: 'Easier variation, rebuild reps',
      reason: 'Performance was too difficult for the target range.',
    }
  }

  return {
    type: 'reduce',
    title: 'Reduce Load',
    message:
      'Your reps dropped below the target range or RPE was too high. Reduce the weight slightly.',
    nextTarget: 'Reduce load by 5-10%',
    reason: 'Performance was too difficult for the target range.',
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
      title: 'Ease Off',
      message:
        'Slow down and focus on control. Keep ribs down and reduce the difficulty.',
      nextTarget: 'Slower reps, easier variation',
      reason: 'Control matters more than load for posture work.',
    }
  }

  return {
    type: 'keep',
    title: 'Build Control',
    message:
      'Improve control and consistency. Add reps or slow the tempo - keep the load light.',
    nextTarget: 'Add reps / slower tempo, stay consistent',
    reason: 'Posture work progresses through control, not heavy load.',
  }
}

function cardioSuggestion(averageRpe: number | null): ProgressionSuggestion {
  if (averageRpe !== null && averageRpe >= 9) {
    return {
      type: 'keep',
      title: 'Hold Cardio',
      message:
        'Keep this pace and let your conditioning settle before adding time.',
      nextTarget: 'Same duration and incline',
      reason: 'Effort was already high last session.',
    }
  }

  return {
    type: 'increase',
    title: 'Progress Cardio',
    message:
      'Walk felt controlled. Add 5 minutes or a slight incline. Skip running to protect your shins.',
    nextTarget: '+5 min or slight incline',
    reason: 'Cardio completed comfortably.',
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
    parts.push(`${reps.join(', ')} reps`)
  } else if (times.length > 0) {
    parts.push(times.map(formatDuration).join(', '))
  }

  if (weights.length > 0) {
    parts.push(`@ ${Math.max(...weights)} kg`)
  }

  const summary = parts.join(' ')
  const rpeSuffix = averageRpe !== null ? ` · RPE ${averageRpe}` : ''

  return summary ? `${summary}${rpeSuffix}` : 'Logged'
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

export function findPlanExercise(
  exerciseName: string,
  plan: WorkoutDay[] = weeklyPlan,
): Exercise | undefined {
  const normalizedTarget = normalizeExerciseName(exerciseName)

  for (const day of plan) {
    const exactNameMatch = day.exercises.find(
      (exercise) => normalizeExerciseName(exercise.name) === normalizedTarget,
    )
    if (exactNameMatch) {
      return exactNameMatch
    }
  }

  for (const day of plan) {
    const aliasMatch = day.exercises.find(
      (exercise) =>
        exerciseIdentitiesMatch(
          { exerciseId: exercise.id, exerciseName: exercise.name },
          { exerciseName },
        ),
    )
    if (aliasMatch) {
      return aliasMatch
    }
  }

  return undefined
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

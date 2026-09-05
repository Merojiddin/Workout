import { findGuidedExercise } from '../data/guidedExercises'
import type {
  GuidedCategoryId,
  GuidedLevel,
  GuidedWorkout,
  GuidedWorkoutStep,
} from '../data/guidedWorkouts'
import { CUSTOM_GUIDED_WORKOUTS_KEY, safeGetJSON, safeSetJSON } from './storageUtils'

/**
 * Workouts the user builds themselves.
 *
 * They are stored as - and are - ordinary `GuidedWorkout` objects, so the
 * player, the timeline, the summary and the history row all treat them exactly
 * like the ones that ship with the app. The only difference is the `custom`
 * flag, which is what earns them an Edit button and a badge.
 *
 * Storage is the usual localStorage mirror, so it is namespaced per signed-in
 * user by `storageUtils` and never leaks between accounts.
 */

export interface CustomGuidedWorkout extends GuidedWorkout {
  custom: true
  createdAt: string
  updatedAt: string
}

const categories: GuidedCategoryId[] = ['cardio', 'abs', 'posture', 'mobility']
const levels: GuidedLevel[] = ['Beginner', 'Intermediate', 'Advanced']

/** Bounds that keep a saved workout runnable whatever was typed into it. */
const LIMITS = {
  rounds: { min: 1, max: 20 },
  work: { min: 5, max: 600 },
  rest: { min: 0, max: 600 },
  steps: { max: 40 },
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = Math.round(Number(value))
  if (!Number.isFinite(number)) {
    return fallback
  }
  return Math.min(max, Math.max(min, number))
}

function normalizeStep(raw: unknown): GuidedWorkoutStep | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const step = raw as Partial<GuidedWorkoutStep>
  const exerciseId = typeof step.exerciseId === 'string' ? step.exerciseId : ''
  // A movement that is no longer in the catalog is dropped rather than left to
  // render as a blank step mid-workout.
  if (!exerciseId || !findGuidedExercise(exerciseId)) {
    return null
  }

  const normalized: GuidedWorkoutStep = { exerciseId }
  if (step.seconds !== undefined) {
    normalized.seconds = clamp(step.seconds, LIMITS.work.min, LIMITS.work.max, 30)
  }
  if (step.restSeconds !== undefined) {
    normalized.restSeconds = clamp(step.restSeconds, LIMITS.rest.min, LIMITS.rest.max, 15)
  }
  return normalized
}

function normalize(raw: unknown): CustomGuidedWorkout | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const workout = raw as Partial<CustomGuidedWorkout>
  const id = typeof workout.id === 'string' && workout.id.trim() ? workout.id : ''
  if (!id) {
    return null
  }

  const steps = Array.isArray(workout.steps)
    ? workout.steps
        .map(normalizeStep)
        .filter((step): step is GuidedWorkoutStep => step !== null)
        .slice(0, LIMITS.steps.max)
    : []
  if (steps.length === 0) {
    return null
  }

  const categoryId = categories.includes(workout.categoryId as GuidedCategoryId)
    ? (workout.categoryId as GuidedCategoryId)
    : 'cardio'
  const level = levels.includes(workout.level as GuidedLevel)
    ? (workout.level as GuidedLevel)
    : 'Intermediate'
  const now = new Date().toISOString()

  return {
    categoryId,
    createdAt: typeof workout.createdAt === 'string' ? workout.createdAt : now,
    custom: true,
    description: typeof workout.description === 'string' ? workout.description : '',
    equipment: Array.isArray(workout.equipment)
      ? workout.equipment.filter((item): item is string => typeof item === 'string')
      : undefined,
    focus: Array.isArray(workout.focus)
      ? workout.focus.filter((item): item is string => typeof item === 'string')
      : undefined,
    id,
    level,
    name:
      typeof workout.name === 'string' && workout.name.trim()
        ? workout.name.trim()
        : 'My workout',
    prepareSeconds: clamp(workout.prepareSeconds ?? 10, 0, LIMITS.rest.max, 10),
    restSeconds: clamp(workout.restSeconds ?? 15, LIMITS.rest.min, LIMITS.rest.max, 15),
    roundRestSeconds: clamp(
      workout.roundRestSeconds ?? 60,
      LIMITS.rest.min,
      LIMITS.rest.max,
      60,
    ),
    rounds: clamp(workout.rounds ?? 1, LIMITS.rounds.min, LIMITS.rounds.max, 1),
    steps,
    updatedAt: typeof workout.updatedAt === 'string' ? workout.updatedAt : now,
    workSeconds: clamp(workout.workSeconds ?? 40, LIMITS.work.min, LIMITS.work.max, 40),
  }
}

/** Newest first - the one you just built is the one you want to see. */
export function getCustomGuidedWorkouts(): CustomGuidedWorkout[] {
  try {
    const stored = safeGetJSON(CUSTOM_GUIDED_WORKOUTS_KEY, [])
    if (!Array.isArray(stored)) {
      return []
    }
    return stored
      .map(normalize)
      .filter((workout): workout is CustomGuidedWorkout => workout !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch {
    return []
  }
}

/**
 * Inserts or replaces one workout. Returns false when the write failed, so the
 * builder can say the workout was not kept rather than closing on a lie.
 */
export function saveCustomGuidedWorkout(workout: CustomGuidedWorkout): boolean {
  const normalized = normalize({ ...workout, updatedAt: new Date().toISOString() })
  if (!normalized) {
    return false
  }

  const existing = getCustomGuidedWorkouts().filter((item) => item.id !== normalized.id)
  return Boolean(safeSetJSON(CUSTOM_GUIDED_WORKOUTS_KEY, [normalized, ...existing]))
}

export function deleteCustomGuidedWorkout(id: string): boolean {
  const remaining = getCustomGuidedWorkouts().filter((workout) => workout.id !== id)
  return Boolean(safeSetJSON(CUSTOM_GUIDED_WORKOUTS_KEY, remaining))
}

/** A blank workout to open the builder on, with workable defaults. */
export function createEmptyCustomWorkout(
  categoryId: GuidedCategoryId = 'cardio',
): CustomGuidedWorkout {
  const now = new Date().toISOString()

  return {
    categoryId,
    createdAt: now,
    custom: true,
    description: '',
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level: 'Intermediate',
    name: '',
    prepareSeconds: 10,
    restSeconds: 15,
    roundRestSeconds: 60,
    rounds: 3,
    steps: [],
    updatedAt: now,
    workSeconds: 40,
  }
}

export { LIMITS as customWorkoutLimits }

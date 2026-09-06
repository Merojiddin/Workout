import { exerciseCategories } from '../data/exerciseLibrary'
import { guidedExerciseList } from '../data/guidedExercises'
import {
  guidedWorkouts,
  type GuidedCategoryId,
  type GuidedLevel,
  type GuidedWorkoutStep,
} from '../data/guidedWorkouts'
import { t } from '../i18n/t'
import {
  customWorkoutLimits,
  getCustomGuidedWorkouts,
  type CustomGuidedWorkout,
} from './customGuidedWorkouts'

/**
 * Importing guided workouts written somewhere else - a file, or an AI chat.
 *
 * The builder is for one session at a time; this is for arriving with a whole
 * block of them already written. What comes out the other end is an ordinary
 * `CustomGuidedWorkout`, saved through the same path the builder saves through,
 * so an imported session runs on the same player with no special cases.
 *
 * Deliberately forgiving about the wrapper and the wording - markdown fences,
 * chat prose, one object or an array of them, a movement named rather than
 * given its id - because the expected source is a chat reply. Never forgiving
 * about the movements themselves: a step naming something the catalog does not
 * have is reported, not quietly rendered blank mid-session.
 */

export interface ParsedGuidedWorkoutsResult {
  /** True when at least one workout survived and can be saved. */
  success: boolean
  workouts: CustomGuidedWorkout[]
  /** Blocking problems: the whole paste, or one workout inside it, is unusable. */
  errors: string[]
  /** Things that were changed or dropped. The import still works. */
  warnings: string[]
}

const categoryIds: GuidedCategoryId[] = ['cardio', 'abs', 'posture', 'mobility']
const levels: GuidedLevel[] = ['Beginner', 'Intermediate', 'Advanced']

/** Wording an AI reply reaches for that is not one of the four category ids. */
const categorySynonyms: Record<string, GuidedCategoryId> = {
  abs: 'abs',
  cardio: 'cardio',
  conditioning: 'cardio',
  core: 'abs',
  hiit: 'cardio',
  mobility: 'mobility',
  posture: 'posture',
  stretch: 'mobility',
  stretching: 'mobility',
}

const MAX_WORKOUTS = 20

/**
 * Every movement, keyed by id and by name, so a workout that says
 * "Jumping Jacks" resolves as well as one that says "jumping-jacks".
 */
const movementsByKey = (() => {
  const map = new Map<string, string>()
  for (const exercise of guidedExerciseList) {
    map.set(normalizeKey(exercise.id), exercise.id)
    map.set(normalizeKey(exercise.name), exercise.id)
  }
  return map
})()

const shippedWorkoutIds = new Set(guidedWorkouts.map((workout) => workout.id))

/** Turns pasted text into workouts ready to save. */
export function parseGuidedWorkoutInput(input: string): ParsedGuidedWorkoutsResult {
  const errors: string[] = []
  const warnings: string[] = []
  const text = extractJsonText(input)

  if (!text) {
    return { success: false, workouts: [], errors: [t('guided.importNoJson')], warnings }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    return {
      success: false,
      workouts: [],
      errors: [describeJsonError(error, text)],
      warnings,
    }
  }

  const raw = collectWorkouts(parsed)
  if (raw.length === 0) {
    return {
      success: false,
      workouts: [],
      errors: [t('guided.importNoWorkouts')],
      warnings,
    }
  }
  if (raw.length > MAX_WORKOUTS) {
    warnings.push(t('guided.importTooMany', { max: MAX_WORKOUTS }))
  }

  // Ids already spoken for: everything that ships with the app, plus whatever
  // is already saved, so an import can never collide a card off the list.
  const savedIds = new Set(getCustomGuidedWorkouts().map((workout) => workout.id))
  const takenIds = new Set(shippedWorkoutIds)
  const workouts: CustomGuidedWorkout[] = []

  raw.slice(0, MAX_WORKOUTS).forEach((entry, index) => {
    const result = normalizeImported(entry, index, takenIds, savedIds)
    if (!result.workout) {
      errors.push(...result.errors)
      return
    }
    takenIds.add(result.workout.id)
    warnings.push(...result.warnings)
    workouts.push(result.workout)
  })

  return { success: workouts.length > 0, workouts, errors, warnings }
}

/**
 * The prompt copied for an AI chat, carrying the schema and every movement id
 * the catalog has.
 *
 * The whole list goes in rather than a sample: naming a movement the app does
 * not have is the one mistake that costs a step out of the session, and a chat
 * cannot reuse an id it was never shown.
 */
export function buildGuidedWorkoutPrompt(): string {
  return t('prompt.guidedTemplate', { movements: buildMovementCatalog() })
}

// --- internal --------------------------------------------------------------

/** One workout's worth of parsing: either a workout, or why there is not one. */
interface NormalizedWorkout {
  workout: CustomGuidedWorkout | null
  errors: string[]
  warnings: string[]
}

function normalizeImported(
  raw: unknown,
  index: number,
  takenIds: Set<string>,
  savedIds: Set<string>,
): NormalizedWorkout {
  const warnings: string[] = []

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { workout: null, errors: [t('guided.importNotWorkout', { n: index + 1 })], warnings }
  }

  const source = raw as Record<string, unknown>
  const name = text(source.name) || text(source.title)
  const label = name || t('guided.importUnnamed', { n: index + 1 })

  const rawSteps = Array.isArray(source.steps)
    ? source.steps
    : Array.isArray(source.exercises)
      ? source.exercises
      : Array.isArray(source.movements)
        ? source.movements
        : null
  if (!rawSteps) {
    return { workout: null, errors: [t('guided.importNoStepList', { name: label })], warnings }
  }

  const steps: GuidedWorkoutStep[] = []
  const unknown: string[] = []
  for (const entry of rawSteps) {
    const step = normalizeStep(entry)
    if (step) {
      steps.push(step)
    } else {
      unknown.push(describeStep(entry))
    }
  }

  if (unknown.length > 0) {
    warnings.push(
      t('guided.importUnknownMoves', { name: label, moves: unknown.join(', ') }),
    )
  }
  if (steps.length === 0) {
    return { workout: null, errors: [t('guided.importNoSteps', { name: label })], warnings }
  }
  if (steps.length > customWorkoutLimits.steps.max) {
    warnings.push(
      t('guided.importTrimmed', { name: label, max: customWorkoutLimits.steps.max }),
    )
    steps.length = customWorkoutLimits.steps.max
  }

  const rawCategory = text(source.categoryId) || text(source.category)
  const categoryId = resolveCategory(rawCategory)
  if (rawCategory && !categoryId) {
    warnings.push(t('guided.importUnknownCategory', { name: label, value: rawCategory }))
  }

  const rawLevel = text(source.level) || text(source.difficulty)
  const level = resolveLevel(rawLevel)
  if (rawLevel && !level) {
    warnings.push(t('guided.importUnknownLevel', { name: label, value: rawLevel }))
  }

  if (!name) {
    warnings.push(t('guided.importUnnamedWorkout', { name: label }))
  }

  const id = resolveId(source.id, name, index, takenIds)
  if (savedIds.has(id)) {
    warnings.push(t('guided.importReplaces', { name: label }))
  }

  const now = new Date().toISOString()

  return {
    errors: [],
    warnings,
    workout: {
      categoryId: categoryId ?? 'cardio',
      createdAt: now,
      custom: true,
      description: text(source.description) || text(source.summary),
      equipment: stringList(source.equipment),
      focus: stringList(source.focus),
      id,
      level: level ?? 'Intermediate',
      name: name || label,
      prepareSeconds: seconds(source.prepareSeconds ?? source.getReadySeconds, 10, 0),
      restSeconds: seconds(source.restSeconds ?? source.rest, 15, 0),
      roundRestSeconds: seconds(source.roundRestSeconds ?? source.roundBreakSeconds, 60, 0),
      rounds: clamp(
        source.rounds ?? source.sets,
        customWorkoutLimits.rounds.min,
        customWorkoutLimits.rounds.max,
        1,
      ),
      steps,
      updatedAt: now,
      workSeconds: seconds(
        source.workSeconds ?? source.work ?? source.seconds,
        40,
        customWorkoutLimits.work.min,
      ),
    },
  }
}

/**
 * One step. A movement may be named by id, by name, or written as a bare
 * string; anything the catalog cannot resolve returns null so the caller can
 * say which movement was dropped rather than silently shortening the session.
 */
function normalizeStep(raw: unknown): GuidedWorkoutStep | null {
  if (typeof raw === 'string') {
    const id = movementsByKey.get(normalizeKey(raw))
    return id ? { exerciseId: id } : null
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }

  const source = raw as Record<string, unknown>
  const named =
    text(source.exerciseId) ||
    text(source.id) ||
    text(source.exercise) ||
    text(source.name) ||
    text(source.movement)
  const id = movementsByKey.get(normalizeKey(named))
  if (!id) {
    return null
  }

  const step: GuidedWorkoutStep = { exerciseId: id }

  const work = source.seconds ?? source.workSeconds ?? source.duration
  if (work !== undefined) {
    step.seconds = seconds(work, 30, customWorkoutLimits.work.min)
  }
  const rest = source.restSeconds ?? source.rest
  if (rest !== undefined) {
    step.restSeconds = seconds(rest, 15, 0)
  }
  const cue = text(source.cue)
  if (cue) {
    step.cue = cue
  }

  return step
}

/** How a dropped step is named back to the user, so they can fix it. */
function describeStep(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw.trim() || '?'
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const source = raw as Record<string, unknown>
    return (
      text(source.exerciseId) ||
      text(source.id) ||
      text(source.exercise) ||
      text(source.name) ||
      text(source.movement) ||
      '?'
    )
  }
  return '?'
}

/**
 * The workouts inside a paste: an array of them, a single object, or one
 * wrapped in `workouts` / `workout` the way a chat likes to package a reply.
 */
function collectWorkouts(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed
  }
  if (!parsed || typeof parsed !== 'object') {
    return []
  }

  const source = parsed as Record<string, unknown>
  if (Array.isArray(source.workouts)) {
    return source.workouts
  }
  if (Array.isArray(source.sessions)) {
    return source.sessions
  }
  if (source.workout && typeof source.workout === 'object') {
    return [source.workout]
  }
  return [source]
}

function resolveCategory(value: string): GuidedCategoryId | null {
  const key = value.trim().toLowerCase()
  if (categoryIds.includes(key as GuidedCategoryId)) {
    return key as GuidedCategoryId
  }
  return categorySynonyms[key] ?? null
}

function resolveLevel(value: string): GuidedLevel | null {
  const key = value.trim().toLowerCase()
  return levels.find((level) => level.toLowerCase() === key) ?? null
}

/**
 * A unique id for the workout.
 *
 * An id that collides with a shipped workout - which is what happens when a
 * chat copies one out of the prompt - is given a suffix rather than reused:
 * two cards with one id is a workout you cannot open.
 */
function resolveId(
  raw: unknown,
  name: string,
  index: number,
  takenIds: Set<string>,
): string {
  const base = slugify(text(raw)) || slugify(name) || `imported-${index + 1}`
  if (!takenIds.has(base)) {
    return base
  }

  let candidate = ''
  let suffix = 2
  do {
    candidate = `${base}-${suffix}`
    suffix += 1
  } while (takenIds.has(candidate))
  return candidate
}

/**
 * Every movement id, grouped by where it sits in the Exercise Library, with
 * what it needs and whether both feet leave the floor.
 */
function buildMovementCatalog(): string {
  const byCategory = new Map<string, string[]>()
  for (const exercise of guidedExerciseList) {
    const notes: string[] = [...(exercise.equipment ?? [])]
    if (exercise.impact === 'high') {
      notes.push('jumping')
    }
    const line = `- ${exercise.id} — ${exercise.name}${
      notes.length > 0 ? ` [${notes.join(', ')}]` : ''
    }`
    byCategory.set(exercise.category, [...(byCategory.get(exercise.category) ?? []), line])
  }

  // The app's own category order, with anything added to the catalog later
  // still listed rather than silently dropped.
  const known = exerciseCategories.filter((category) => byCategory.has(category))
  const extra = [...byCategory.keys()].filter(
    (category) => !known.includes(category as (typeof exerciseCategories)[number]),
  )

  return [...known, ...extra]
    .map((category) => `${category}:\n${(byCategory.get(category) ?? []).join('\n')}`)
    .join('\n\n')
}

/**
 * Pulls the JSON out of a paste that may carry markdown fences or chat prose
 * around it, by scanning for the outermost balanced brackets while ignoring
 * anything inside a string. Handles an array as well as an object, because a
 * set of workouts is the normal thing to import.
 */
function extractJsonText(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  let value = input.trim()
  if (value === '') {
    return ''
  }

  const fenced = value.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?```$/)
  if (fenced?.[1]) {
    value = fenced[1].trim()
  }

  const brace = value.indexOf('{')
  const bracket = value.indexOf('[')
  const start =
    bracket !== -1 && (brace === -1 || bracket < brace) ? bracket : brace
  if (start === -1) {
    return ''
  }

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < value.length; index += 1) {
    const char = value[index]

    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) {
      continue
    }
    if (char === '{' || char === '[') {
      depth += 1
    } else if (char === '}' || char === ']') {
      depth -= 1
      if (depth === 0) {
        return value.slice(start, index + 1)
      }
    }
  }

  // Unbalanced: hand back the remainder so JSON.parse reports where it broke.
  return value.slice(start)
}

function describeJsonError(error: unknown, text: string): string {
  const message = error instanceof Error ? error.message : ''
  const position = message.match(/position (\d+)/)?.[1]
  if (position) {
    const line = text.slice(0, Number(position)).split('\n').length
    return t('guided.importJsonErrorLine', { line, message })
  }
  return t('guided.importJsonError', { message })
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }
  const list = value.map(text).filter((item) => item !== '')
  return list.length > 0 ? list : undefined
}

/** A seconds field, which a chat sometimes writes as "30 sec" or "30". */
function seconds(value: unknown, fallback: number, min: number): number {
  const number =
    typeof value === 'string' ? Number.parseInt(value, 10) : Number(value)
  return clamp(number, min, customWorkoutLimits.work.max, fallback)
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = Math.round(Number(value))
  if (!Number.isFinite(number)) {
    return fallback
  }
  return Math.min(max, Math.max(min, number))
}

/** Lowercase letters and digits only, with any bracketed translation removed. */
function normalizeKey(value: string): string {
  return value
    .replace(/\([^)]*\)/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function slugify(value: string): string {
  return value
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

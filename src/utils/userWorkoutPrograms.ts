import { exerciseLibrary } from '../data/exerciseLibrary'
import type {
  WorkoutProgram,
  WorkoutProgramValidationResult,
} from '../types/workoutProgram'
import {
  safeGetJSON,
  safeSetJSON,
  USER_WORKOUT_PROGRAMS_KEY,
} from './storageUtils'
import { validateWorkoutProgram } from './workoutProgramValidation'

/**
 * User-pasted workout programs.
 *
 * Bundled programs live in src/data/workout-programs/ and only change with a
 * deploy. These are pasted into the running app instead, stored per user (the
 * storage key is namespaced by storageUtils), and merged into the program
 * registry so they install through exactly the same path as bundled programs.
 */

export interface UserWorkoutProgram extends WorkoutProgram {
  /** Marks the program as user-supplied so the UI can label and delete it. */
  source: 'pasted'
  savedAt: string
}

export interface ParsedWorkoutProgramResult {
  success: boolean
  program: UserWorkoutProgram | null
  /** Blocking problems. Non-empty means the program cannot be saved. */
  errors: string[]
  /** Non-blocking problems; the program still works. */
  warnings: string[]
  /** Fields this parser filled in automatically. */
  repairs: string[]
}

const knownExerciseIds = new Set(exerciseLibrary.map((exercise) => exercise.id))

export function getUserWorkoutPrograms(): UserWorkoutProgram[] {
  const stored = safeGetJSON(USER_WORKOUT_PROGRAMS_KEY, [])
  if (!Array.isArray(stored)) {
    return []
  }

  return stored.filter(isUserWorkoutProgram)
}

export function getUserWorkoutProgram(
  id: string,
  version: string,
): UserWorkoutProgram | undefined {
  return getUserWorkoutPrograms().find(
    (program) => program.id === id && program.version === version,
  )
}

/**
 * Saves a pasted program. An existing program with the same id AND version is
 * replaced, so re-pasting a corrected copy updates in place rather than
 * creating a conflicting duplicate.
 */
export function saveUserWorkoutProgram(program: UserWorkoutProgram): {
  success: boolean
  message: string
  programs: UserWorkoutProgram[]
} {
  const existing = getUserWorkoutPrograms()
  const next = existing.filter(
    (item) => !(item.id === program.id && item.version === program.version),
  )
  const replaced = next.length !== existing.length
  next.push(program)
  next.sort(
    (left, right) =>
      left.id.localeCompare(right.id) ||
      compareVersions(left.version, right.version),
  )

  if (!safeSetJSON(USER_WORKOUT_PROGRAMS_KEY, next)) {
    return {
      success: false,
      message:
        'Could not save the program. Device storage may be full - remove old programs or photos and try again.',
      programs: existing,
    }
  }

  return {
    success: true,
    message: replaced
      ? `Replaced "${program.name}" ${program.version}.`
      : `Saved "${program.name}" ${program.version}.`,
    programs: next,
  }
}

export function deleteUserWorkoutProgram(
  id: string,
  version: string,
): { success: boolean; programs: UserWorkoutProgram[] } {
  const existing = getUserWorkoutPrograms()
  const next = existing.filter(
    (item) => !(item.id === id && item.version === version),
  )

  if (next.length === existing.length) {
    return { success: false, programs: existing }
  }
  if (!safeSetJSON(USER_WORKOUT_PROGRAMS_KEY, next)) {
    return { success: false, programs: existing }
  }

  return { success: true, programs: next }
}

/** Replaces the whole list. Used when hydrating from the cloud. */
export function replaceUserWorkoutPrograms(
  programs: unknown,
): UserWorkoutProgram[] {
  const list = Array.isArray(programs) ? programs.filter(isUserWorkoutProgram) : []
  safeSetJSON(USER_WORKOUT_PROGRAMS_KEY, list)
  return list
}

/**
 * Turns pasted text into a validated program.
 *
 * Deliberately forgiving about the wrapper around the JSON - markdown fences
 * and chat prose are stripped, and a few missing metadata fields are filled in
 * - because the expected workflow is pasting output from an AI chat. It is
 * never forgiving about the training content itself: days, exercises, sets,
 * and targets must be valid or the program is rejected.
 */
export function parseWorkoutProgramInput(
  input: string,
): ParsedWorkoutProgramResult {
  const repairs: string[] = []
  const text = extractJsonText(input)

  if (!text) {
    return {
      success: false,
      program: null,
      errors: [
        'No JSON found. Paste the whole program object, starting with { and ending with }.',
      ],
      warnings: [],
      repairs,
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    return {
      success: false,
      program: null,
      errors: [describeJsonError(error, text)],
      warnings: [],
      repairs,
    }
  }

  if (Array.isArray(parsed)) {
    return {
      success: false,
      program: null,
      errors: [
        'This looks like a list of days, not a whole program. Wrap it in an object: { "name": "...", "days": [ ... ] }.',
      ],
      warnings: [],
      repairs,
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return {
      success: false,
      program: null,
      errors: ['The pasted JSON is not a program object.'],
      warnings: [],
      repairs,
    }
  }

  const draft = { ...(parsed as Record<string, unknown>) }
  applyMetadataRepairs(draft, repairs)

  const validation: WorkoutProgramValidationResult = validateWorkoutProgram(
    draft,
    { knownExerciseIds },
  )

  if (!validation.valid || validation.errors.length > 0) {
    return {
      success: false,
      program: null,
      errors: [...validation.errors],
      warnings: [...validation.warnings],
      repairs,
    }
  }

  const program: UserWorkoutProgram = {
    ...(draft as unknown as WorkoutProgram),
    source: 'pasted',
    savedAt: new Date().toISOString(),
  }

  return {
    success: true,
    program,
    errors: [],
    warnings: [...validation.warnings],
    repairs,
  }
}

/**
 * The prompt handed to an AI chat so it returns a program this app accepts.
 * Kept here (not in the component) so the schema and the prompt stay together.
 */
export function buildProgramAuthoringPrompt(): string {
  const sampleExerciseIds = exerciseLibrary
    .slice(0, 24)
    .map((exercise) => exercise.id)
    .join(', ')

  return `Convert my workout plan into JSON for my fitness tracker app.

Reply with ONLY the JSON object - no explanation, no markdown fences.

Required shape:
{
  "id": "short-kebab-case-id",
  "name": "Program name",
  "version": "1.0.0",
  "updatedAt": "${new Date().toISOString().slice(0, 10)}",
  "description": "One or two sentences about the program.",
  "goals": ["Goal one", "Goal two"],
  "days": [
    {
      "day": 1,
      "name": "Day name, e.g. Chest + Triceps",
      "estimatedTime": "45-60 min",
      "focus": ["Chest", "Triceps"],
      "exercises": [
        {
          "id": "bench-press",
          "name": "Bench Press",
          "sets": 4,
          "repRange": "6-10",
          "restSeconds": 150,
          "muscleGroup": "Chest",
          "equipment": "Barbell / Bench",
          "formTips": ["A short cue", "Another short cue"]
        }
      ]
    }
  ]
}

Rules:
- "days" must contain exactly 7 objects, numbered 1 to 7. A rest day is a day with light exercises (for example an easy walk).
- Every exercise needs EITHER "repRange" (like "8-12") OR "duration" (like "30 sec") - never both, never neither.
- "sets" must be at least 1. "restSeconds" must be 0 or more. Both are numbers, not strings.
- "formTips" must be an array of at least one short string.
- Exercise "id" must be kebab-case and unique within its day.
- Where a movement matches one of these known ids, reuse the id exactly so the app can show its form guide and images: ${sampleExerciseIds}.
- For any other movement, invent a sensible kebab-case id. That is fine - the workout still tracks fully, it just has no built-in form guide.

My plan:
[PASTE YOUR PLAN HERE]`
}

// --- internal --------------------------------------------------------------

/**
 * Pulls the JSON object out of a paste that may include markdown fences or
 * surrounding chat text, by scanning for the outermost balanced braces while
 * ignoring braces inside strings.
 */
function extractJsonText(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  let text = input.trim()
  if (text === '') {
    return ''
  }

  // Strip a leading ```json / ``` fence and its closing counterpart.
  const fenced = text.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?```$/)
  if (fenced?.[1]) {
    text = fenced[1].trim()
  }

  const start = text.indexOf('{')
  if (start === -1) {
    return ''
  }

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < text.length; index += 1) {
    const char = text[index]

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
    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return text.slice(start, index + 1)
      }
    }
  }

  // Unbalanced braces: hand back the remainder so JSON.parse reports where.
  return text.slice(start)
}

function applyMetadataRepairs(
  draft: Record<string, unknown>,
  repairs: string[],
) {
  if (!isNonEmptyString(draft.name) && isNonEmptyString(draft.id)) {
    draft.name = draft.id.trim()
    repairs.push(`Used the id as the program name.`)
  }

  if (!isNonEmptyString(draft.id) && isNonEmptyString(draft.name)) {
    draft.id = slugify(draft.name)
    repairs.push(`Generated the program id "${String(draft.id)}" from the name.`)
  }

  if (!isNonEmptyString(draft.version)) {
    draft.version = '1.0.0'
    repairs.push('Set version to 1.0.0.')
  }

  if (!isNonEmptyString(draft.updatedAt) || !isValidDate(draft.updatedAt)) {
    draft.updatedAt = new Date().toISOString().slice(0, 10)
    repairs.push(`Set updatedAt to today (${String(draft.updatedAt)}).`)
  }

  if (!isNonEmptyString(draft.description)) {
    draft.description = isNonEmptyString(draft.name)
      ? `${draft.name} (added from a pasted program).`
      : 'Added from a pasted program.'
    repairs.push('Added a placeholder description.')
  }
}

function describeJsonError(error: unknown, text: string): string {
  const message =
    error instanceof Error ? error.message : 'The pasted text is not valid JSON.'

  const positionMatch = message.match(/position (\d+)/)
  if (positionMatch?.[1]) {
    const position = Number(positionMatch[1])
    const line = text.slice(0, position).split('\n').length
    return `Invalid JSON on line ${line}. ${message} A trailing comma, a missing quote, or a comment is the usual cause.`
  }

  return `Invalid JSON. ${message}`
}

function isUserWorkoutProgram(value: unknown): value is UserWorkoutProgram {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.name) &&
    isNonEmptyString(candidate.version) &&
    Array.isArray(candidate.days)
  )
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isValidDate(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false
  }
  return !Number.isNaN(new Date(value).getTime())
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug === '' ? 'pasted-program' : slug
}

function compareVersions(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

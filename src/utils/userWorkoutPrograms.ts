import { exerciseCategories, exerciseLibrary } from '../data/exerciseLibrary'
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
 *
 * Kept here (not in the component) so the schema and the prompt stay together.
 * It asks for every field the app actually reads - including the coaching
 * block behind the Nutrition screen - and names the ones to leave out, because
 * a program that trips validation is worse than one without an extra.
 */
export function buildProgramAuthoringPrompt(): string {
  return `Convert my workout plan into JSON for my fitness tracker app.

Reply with ONLY the JSON object - no explanation, no markdown fences.

REQUIRED SHAPE
{
  "id": "short-kebab-case-id",
  "name": "Program name",
  "version": "1.0.0",
  "updatedAt": "${new Date().toISOString().slice(0, 10)}",
  "description": "One or two sentences about the program.",
  "goals": ["Goal one", "Goal two"],
  "coaching": {
    "proteinMinGrams": 120,
    "proteinDefaultGrams": 140,
    "proteinMaxGrams": 160,
    "creatineDailyGrams": "3-5 g/day",
    "sleepHours": "7-8+ hours"
  },
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

RULES
- "days" must contain exactly 7 objects, numbered 1 to 7. Day 1 is Monday and day 7 is Sunday: the app shows day N on that weekday.
- A rest day is still one of the 7. Give it light work (an easy walk, mobility) rather than an empty list.
- Every exercise needs EITHER "repRange" (like "8-12") OR "duration" (like "30 sec") - never both, never neither.
- "sets" must be at least 1 and "restSeconds" 0 or more. Both are numbers, not strings.
- "name", "muscleGroup" and "equipment" are required strings on every exercise. "formTips" is an array of at least one short string.
- Exercise "id" must be kebab-case and unique within its day.
- "updatedAt" must be a real calendar date written as YYYY-MM-DD.
- Do not invent fields. Anything not described here is either ignored or rejected.

NUTRITION ("coaching")
The Nutrition screen reads this block, so always include it. The protein numbers are grams per day and must satisfy min <= default <= max. "creatineDailyGrams" and "sleepHours" are short strings shown as written. Use my plan's numbers where it gives them, otherwise sensible ones for the goal.

EXERCISE IDS
Reuse one of these ids wherever a movement matches - that is what gives the exercise its picture and form guide in the app:
${buildExerciseIdCatalog()}
For anything else, invent a sensible kebab-case id. That is fine: the workout still tracks fully, it just has no picture or built-in guide. If a movement is clearly one of the above but you are unsure of the id, write the exercise "name" exactly as the app spells it and it will still match.

OPTIONAL EXTRAS - only if my plan actually contains them
- "durationWeeks": 12 with "progressionPhases": [{"weeks": [1,2,3,4], "name": "Base", "volumeGuidance": "...", "rirGuidance": "...", "priorities": ["..."], "targetRir": "2-3"}]. The phases must cover every week from 1 to durationWeeks exactly once. "targetRir" is a bare number or range from 0 to 10 ("2" or "1-2"), never "2 RIR". A deload phase may add "setVolumeMultiplier" above 0 and at most 1.
- "rules": {"effort": [...], "progression": [...], "rest": [...], "substitutions": [...], "safety": [...], "returnAfterBreak": [...], "postureCue": "..."} - shown on the Weekly Plan screen. Every value is an array of strings except "postureCue".
- "benchmarkExerciseIds": ["bench-press", "squat"] - the lifts progress is measured on. Use ids from the list above.
- Per exercise: "targetRir": "1-2" and "guidance": ["short note"].
- "standaloneWorkouts" only if every exercise id in them comes from the list above; unknown ids are rejected there.
- Never use "optional": true or "alternatives". This app version hides optional exercises and rejects most alternatives blocks.

My plan:
[PASTE YOUR PLAN HERE]`
}

// --- internal --------------------------------------------------------------

/**
 * Every library exercise id, grouped by category.
 *
 * The whole library goes in rather than a sample: matching an id is what earns
 * an exercise its picture and form guide, and a chat cannot reuse an id it was
 * never shown.
 */
function buildExerciseIdCatalog(): string {
  const idsByCategory = new Map<string, string[]>()
  for (const exercise of exerciseLibrary) {
    const ids = idsByCategory.get(exercise.category) ?? []
    ids.push(exercise.id)
    idsByCategory.set(exercise.category, ids)
  }

  // Listed in the app's own category order; a category added to the library
  // later still appears rather than being silently dropped.
  const known = exerciseCategories.filter((category) =>
    idsByCategory.has(category),
  )
  const extra = [...idsByCategory.keys()].filter(
    (category) => !known.includes(category as (typeof exerciseCategories)[number]),
  )

  return [...known, ...extra]
    .map(
      (category) => `${category}: ${(idsByCategory.get(category) ?? []).join(', ')}`,
    )
    .join('\n')
}

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

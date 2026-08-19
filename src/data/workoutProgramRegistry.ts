import { t } from '../i18n/t'
import { exerciseLibrary } from './exerciseLibrary'
import type { WorkoutProgram } from '../types/workoutProgram'
import type { WorkoutProgramValidationResult } from '../types/workoutProgram'
import { getUserWorkoutPrograms } from '../utils/userWorkoutPrograms'
import { validateWorkoutProgram } from '../utils/workoutProgramValidation'

/**
 * No program ships with the app.
 *
 * Every program is uploaded by the person using it and stored under their own
 * namespaced key, so one account can never see, install, or inherit another
 * account's plan. The glob below stays because the loading and validation path
 * is shared with uploaded programs, but src/data/workout-programs/ now holds
 * only the ignored authoring template.
 */

export interface WorkoutProgramRegistryValidationResult
  extends WorkoutProgramValidationResult {
  filename: string
  programId?: string
  version?: string
}

interface ProgramCandidate {
  filename: string
  program?: WorkoutProgram
  validation: WorkoutProgramRegistryValidationResult
}

interface RegisteredProgram {
  filename: string
  program: WorkoutProgram
}

// Loading JSON as raw text lets one malformed file be diagnosed without
// preventing the other program files from entering the registry.
const discoveredModules = import.meta.glob<string>(
  './workout-programs/*.json',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
)

const knownExerciseIds = new Set(
  exerciseLibrary.map((exercise) => exercise.id),
)
const sortedDiscoveredEntries = Object.entries(discoveredModules).sort(
  ([left], [right]) => left.localeCompare(right),
)
const candidates = sortedDiscoveredEntries
  .filter(([filename]) => !shouldIgnoreProgramFile(filename))
  .map(([filename, source]) => createCandidate(filename, source))

markDuplicateProgramVersions(candidates)

const registeredPrograms: RegisteredProgram[] = candidates
  .filter(
    (candidate): candidate is ProgramCandidate & { program: WorkoutProgram } =>
      candidate.validation.valid && candidate.program !== undefined,
  )
  .map(({ filename, program }) => ({ filename, program }))
  .sort(compareRegisteredPrograms)

if (import.meta.env.DEV) {
  candidates
    .filter((candidate) => !candidate.validation.valid)
    .forEach((candidate) => {
      console.error(
        `[workout-program-registry] Excluded ${candidate.filename}.`,
        candidate.validation.errors,
      )
    })
}

/**
 * The current user's uploaded programs.
 *
 * Read on every call rather than cached at module load, because uploaded
 * programs are stored per user and can be added, replaced, or removed while
 * the app is running.
 */
function allPrograms(): RegisteredProgram[] {
  const userPrograms = getUserWorkoutPrograms().map((program) => ({
    filename: `user:${program.id}@${program.version}`,
    program: program as WorkoutProgram,
  }))

  if (userPrograms.length === 0) {
    return registeredPrograms
  }

  const shadowed = new Set(
    userPrograms.map(({ program }) => `${program.id}@${program.version}`),
  )

  return [
    ...registeredPrograms.filter(
      ({ program }) => !shadowed.has(`${program.id}@${program.version}`),
    ),
    ...userPrograms,
  ].sort(compareRegisteredPrograms)
}

export function getWorkoutPrograms(): WorkoutProgram[] {
  return allPrograms().map(({ program }) => cloneProgram(program))
}

export function getWorkoutProgramByIdAndVersion(
  id: string,
  version: string,
): WorkoutProgram | undefined {
  const match = allPrograms().find(
    ({ program }) => program.id === id && program.version === version,
  )
  return match ? cloneProgram(match.program) : undefined
}

export function getLatestWorkoutProgramById(
  id: string,
): WorkoutProgram | undefined {
  const match = allPrograms()
    .filter(({ program }) => program.id === id)
    .at(-1)
  return match ? cloneProgram(match.program) : undefined
}

export function getWorkoutProgramValidationResults(): WorkoutProgramRegistryValidationResult[] {
  return candidates.map(({ validation }) => cloneValidationResult(validation))
}

function createCandidate(filename: string, source: string): ProgramCandidate {
  let parsed: unknown

  try {
    parsed = JSON.parse(source)
  } catch {
    return {
      filename,
      validation: {
        filename,
        valid: false,
        errors: [t('valid.invalidJson')],
        warnings: [],
      },
    }
  }

  let result: WorkoutProgramValidationResult
  try {
    result = validateWorkoutProgram(parsed, { knownExerciseIds })
  } catch {
    result = {
      valid: false,
      errors: [t('valid.unexpected')],
      warnings: [],
    }
  }

  const programId = getNonEmptyStringProperty(parsed, 'id')
  const version = getNonEmptyStringProperty(parsed, 'version')

  return {
    filename,
    program: result.valid ? (parsed as WorkoutProgram) : undefined,
    validation: {
      filename,
      programId,
      version,
      valid: result.valid,
      errors: [...result.errors],
      warnings: [...result.warnings],
    },
  }
}

function markDuplicateProgramVersions(programCandidates: ProgramCandidate[]) {
  const candidatesByIdentity = new Map<string, ProgramCandidate[]>()

  programCandidates.forEach((candidate) => {
    const { programId, version } = candidate.validation
    if (!programId || !version) {
      return
    }

    const identity = JSON.stringify([programId, version])
    const matches = candidatesByIdentity.get(identity) ?? []
    matches.push(candidate)
    candidatesByIdentity.set(identity, matches)
  })

  candidatesByIdentity.forEach((matches) => {
    if (matches.length < 2) {
      return
    }

    matches.forEach((candidate) => {
      const { programId, version } = candidate.validation
      candidate.program = undefined
      candidate.validation.valid = false
      candidate.validation.errors.push(
        `Duplicate program ID conflict: ${programId}.`,
        `Duplicate program ID and version combination: ${programId}@${version}.`,
      )
    })
  })
}

function compareRegisteredPrograms(
  left: RegisteredProgram,
  right: RegisteredProgram,
): number {
  return (
    left.program.id.localeCompare(right.program.id) ||
    compareVersions(left.program.version, right.program.version) ||
    left.program.updatedAt.localeCompare(right.program.updatedAt) ||
    left.filename.localeCompare(right.filename)
  )
}

function compareVersions(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function shouldIgnoreProgramFile(path: string): boolean {
  const filename = path.split('/').at(-1) ?? path
  return filename.startsWith('_') || filename.endsWith('.example.json')
}

function getNonEmptyStringProperty(
  value: unknown,
  property: string,
): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined
  }

  const candidate = (value as Record<string, unknown>)[property]
  return typeof candidate === 'string' && candidate.trim()
    ? candidate.trim()
    : undefined
}

function cloneProgram(program: WorkoutProgram): WorkoutProgram {
  return JSON.parse(JSON.stringify(program)) as WorkoutProgram
}

function cloneValidationResult(
  result: WorkoutProgramRegistryValidationResult,
): WorkoutProgramRegistryValidationResult {
  return {
    ...result,
    errors: [...result.errors],
    warnings: [...result.warnings],
  }
}

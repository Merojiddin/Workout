import {
  exerciseLibrary,
  getHistoricalExerciseIdAliases,
  type LibraryExercise,
} from './exerciseLibrary'
import type { WorkoutSession } from './workoutSessions'
import type { Exercise } from './workoutPlan'

export interface ExerciseIdentityInput {
  exerciseId?: string | null
  exerciseName?: string | null
}

export interface ExerciseContainer {
  exercises?: Exercise[]
}

export type ExerciseIdentitySource = 'id' | 'alias' | 'name' | 'unknown'

export type MovementFamily =
  | 'horizontal-press'
  | 'vertical-press'
  | 'vertical-pull'
  | 'horizontal-pull'
  | 'squat'
  | 'hip-hinge'
  | 'calf-raise'
  | 'hanging-abs'
  | 'core-stability'

export interface ResolvedExerciseIdentity {
  canonicalId: string | null
  originalId: string | null
  originalName: string
  canonicalName: string
  source: ExerciseIdentitySource
  archived: boolean
  movementFamily: MovementFamily | null
}

export interface ExerciseIdentityOptions {
  activePlan?: readonly ExerciseContainer[] | null
  library?: readonly LibraryExercise[]
}

export interface ExerciseAliases {
  legacyIds: Record<string, string>
  normalizedNames: Record<string, string>
}

export interface HistoricalExerciseCatalogEntry
  extends ResolvedExerciseIdentity {
  key: string
  displayName: string
  active: boolean
  unknown: boolean
  exerciseId: string | null
  exerciseName: string
  equipment?: string
  muscleGroup?: string
  targetDuration?: string
  targetReps?: string
  targetRir?: string
  targetSets?: number
}

type CatalogExercise = ExerciseIdentityInput & {
  id?: string
  name?: string
  duration?: string
  equipment?: string
  muscleGroup?: string
  repRange?: string
  sets?: number
  targetDuration?: string
  targetReps?: string
  targetRir?: string
  targetSets?: number
}

const LEGACY_ID_ALIASES = getHistoricalExerciseIdAliases()

/**
 * Only explicit, conservative historical-name compatibility mappings live
 * here. Exact current library names are resolved separately and take
 * precedence over this map.
 */
const LEGACY_NORMALIZED_NAME_ALIASES: Record<string, string> = {
  'pull ups': 'pull-up',
  pullups: 'pull-up',
  'chin ups': 'chin-up',
  chinups: 'chin-up',
  'dead bug rounds': 'dead-bug',
  'side plank rounds': 'side-plank',
  'lateral raise': 'dumbbell-lateral-raise',
  'hanging knee raise leg raise': 'hanging-knee-raise',
  'dumbbell fly squeeze press': 'dumbbell-fly',
  'triceps extension skull crusher': 'triceps-extension',
  'optional vr boxing skipping rope': 'vr-boxing',
  'pike push up dumbbell shoulder press': 'pike-push-up',
  'weighted glute bridge hip thrust': 'hip-thrust',
  'standing calf raise': 'calf-raise',
  'light walking only': 'light-walking-only',
}

/**
 * Broad families are navigation metadata only. They must never be used by
 * strength, progression, volume, or personal-record matching.
 */
const MOVEMENT_FAMILY_BY_ID: Partial<Record<string, MovementFamily>> = {
  'bench-press': 'horizontal-press',
  'paused-barbell-bench-press': 'horizontal-press',
  'incline-dumbbell-press': 'horizontal-press',
  'incline-barbell-press': 'horizontal-press',
  'weighted-push-up': 'horizontal-press',
  'feet-elevated-push-up': 'horizontal-press',
  'pike-push-up': 'vertical-press',
  'dumbbell-shoulder-press': 'vertical-press',
  'pull-up': 'vertical-pull',
  'shoulder-width-pull-up': 'vertical-pull',
  'weighted-pull-up': 'vertical-pull',
  'chin-up': 'vertical-pull',
  'weighted-chin-up': 'vertical-pull',
  'barbell-row': 'horizontal-pull',
  'one-arm-dumbbell-row': 'horizontal-pull',
  'inverted-row': 'horizontal-pull',
  squat: 'squat',
  'front-squat': 'squat',
  'bulgarian-split-squat': 'squat',
  'romanian-deadlift': 'hip-hinge',
  'sumo-deadlift': 'hip-hinge',
  'hip-thrust': 'hip-hinge',
  'glute-bridge': 'hip-hinge',
  'calf-raise': 'calf-raise',
  'seated-dumbbell-calf-raise': 'calf-raise',
  'hanging-knee-raise': 'hanging-abs',
  'hanging-leg-raise': 'hanging-abs',
  'dead-bug': 'core-stability',
  'side-plank': 'core-stability',
  plank: 'core-stability',
  'hollow-body-hold': 'core-stability',
}

/**
 * Formatting-only normalization. It deliberately does not drop movement
 * qualifiers such as "paused", "front", "sumo", "weighted", or "barbell".
 */
export function normalizeExerciseName(name: unknown): string {
  return typeof name === 'string'
    ? name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/\s+/g, ' ')
    : ''
}

export function getExerciseAliases(): ExerciseAliases {
  return {
    legacyIds: { ...LEGACY_ID_ALIASES },
    normalizedNames: { ...LEGACY_NORMALIZED_NAME_ALIASES },
  }
}

export function resolveExerciseIdentity(
  input: ExerciseIdentityInput,
  options: ExerciseIdentityOptions = {},
): ResolvedExerciseIdentity {
  const library = options.library ?? exerciseLibrary
  const identity = resolveExerciseIdentityInternal(input, library)

  return {
    ...identity,
    archived: options.activePlan !== undefined
      ? !planContainsIdentity(identity, options.activePlan ?? [], library)
      : false,
  }
}

export function resolveExerciseLibraryEntry(
  input: ExerciseIdentityInput,
  options: ExerciseIdentityOptions = {},
): LibraryExercise | undefined {
  const library = options.library ?? exerciseLibrary
  const identity = resolveExerciseIdentityInternal(input, library)
  if (!identity.canonicalId) {
    return undefined
  }

  const entry = library.find(
    (exercise) => exercise.id === identity.canonicalId,
  )
  return entry ? cloneLibraryExercise(entry) : undefined
}

export function isExerciseArchived(
  identity: ResolvedExerciseIdentity,
  activePlan: readonly ExerciseContainer[] | null | undefined,
): boolean {
  return !planContainsIdentity(identity, activePlan ?? [], exerciseLibrary)
}

/**
 * Exact IDs win. Conflicting valid IDs never fall through to a name match.
 * Legacy name and alias resolution is used only where an exact ID cannot
 * settle the comparison. Movement families are intentionally ignored.
 */
export function exerciseIdentitiesMatch(
  left: ExerciseIdentityInput,
  right: ExerciseIdentityInput,
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): boolean {
  const library = options.library ?? exerciseLibrary
  const leftId = cleanId(left?.exerciseId)
  const rightId = cleanId(right?.exerciseId)

  if (leftId && rightId) {
    if (leftId === rightId) {
      return true
    }

    const leftCanonicalId = resolveCanonicalIdFromIdOnly(leftId, library)
    const rightCanonicalId = resolveCanonicalIdFromIdOnly(rightId, library)
    return Boolean(
      leftCanonicalId &&
        rightCanonicalId &&
        leftCanonicalId === rightCanonicalId,
    )
  }

  if (leftId || rightId) {
    const idInput = leftId ? left : right
    const legacyInput = leftId ? right : left
    const authoritativeId = resolveCanonicalIdFromIdOnly(
      leftId ?? rightId ?? '',
      library,
    )
    const idIdentity = resolveExerciseIdentityInternal(idInput, library)
    const legacyIdentity = resolveExerciseIdentityInternal(legacyInput, library)

    if (authoritativeId) {
      return Boolean(
        legacyIdentity.canonicalId &&
          authoritativeId === legacyIdentity.canonicalId,
      )
    }

    // An unrecognized stored ID paired with a recognizable current name is
    // still its own future identity. Letting that record fall through to the
    // ID-less name would make one legacy result feed two otherwise distinct
    // catalog entries. Exact-name continuity is reserved for genuinely
    // unknown historical identities whose old IDs never entered the library.
    if (idIdentity.source !== 'unknown') {
      return false
    }

    const idName = normalizeExerciseName(idInput.exerciseName)
    const legacyName = normalizeExerciseName(legacyInput.exerciseName)
    if (idName && legacyName && idName === legacyName) {
      return true
    }

    return false
  }

  const leftName = normalizeExerciseName(left?.exerciseName)
  const rightName = normalizeExerciseName(right?.exerciseName)
  if (leftName && rightName && leftName === rightName) {
    return true
  }
  if (
    !leftName &&
    !rightName &&
    rawExerciseName(left?.exerciseName) === rawExerciseName(right?.exerciseName)
  ) {
    return Boolean(rawExerciseName(left?.exerciseName))
  }

  const leftIdentity = resolveExerciseIdentityInternal(left, library)
  const rightIdentity = resolveExerciseIdentityInternal(right, library)
  return Boolean(
    leftIdentity.canonicalId &&
      rightIdentity.canonicalId &&
      leftIdentity.canonicalId === rightIdentity.canonicalId,
  )
}

/**
 * Active-plan exercises first, followed by conservatively de-duplicated
 * historical identities. Stored session objects are read only and every
 * returned catalog record is newly allocated.
 */
export function getHistoricalExerciseCatalog(
  sessions: WorkoutSession[] | null | undefined,
  activePlan: readonly ExerciseContainer[] | null | undefined,
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): HistoricalExerciseCatalogEntry[] {
  const library = options.library ?? exerciseLibrary
  const plan = Array.isArray(activePlan) ? activePlan : []
  const catalog: HistoricalExerciseCatalogEntry[] = []

  plan.forEach((day) => {
    safeExercises(day?.exercises).flatMap(expandPlanExercise).forEach((exercise) => {
      const input = toIdentityInput(exercise)
      if (catalog.some((entry) => exerciseIdentitiesMatch(entry, input, { library }))) {
        return
      }

      const identity = resolveExerciseIdentity(input, {
        activePlan: plan,
        library,
      })
      catalog.push(
        toCatalogEntry(
          exercise,
          { ...identity, archived: false },
          true,
          library,
        ),
      )
    })
  })

  safeSessions(sessions).forEach((session) => {
    safeCatalogExercises(session?.exercises).forEach((exercise) => {
      const input = toIdentityInput(exercise)
      if (catalog.some((entry) => exerciseIdentitiesMatch(entry, input, { library }))) {
        return
      }

      const identity = resolveExerciseIdentity(input, {
        activePlan: plan,
        library,
      })
      catalog.push(toCatalogEntry(exercise, identity, false, library))
    })
  })

  return catalog
}

function resolveExerciseIdentityInternal(
  input: ExerciseIdentityInput,
  library: readonly LibraryExercise[],
): Omit<ResolvedExerciseIdentity, 'archived'> {
  const originalId = cleanId(input?.exerciseId)
  const suppliedName = typeof input?.exerciseName === 'string'
    ? input.exerciseName
    : ''
  const indexes = buildLibraryIndexes(library)

  if (originalId) {
    const exactEntry = indexes.byId.get(originalId)
    if (exactEntry) {
      return makeResolvedIdentity(
        exactEntry,
        originalId,
        suppliedName,
        'id',
      )
    }

    const aliasId = LEGACY_ID_ALIASES[originalId]
    const aliasEntry = aliasId ? indexes.byId.get(aliasId) : undefined
    if (aliasEntry) {
      return makeResolvedIdentity(
        aliasEntry,
        originalId,
        suppliedName,
        'alias',
      )
    }
  }

  const normalizedName = normalizeExerciseName(suppliedName)
  if (normalizedName) {
    const exactNameEntry = indexes.byNormalizedName.get(normalizedName)
    if (exactNameEntry) {
      return makeResolvedIdentity(
        exactNameEntry,
        originalId,
        suppliedName,
        'name',
      )
    }

    const aliasId = LEGACY_NORMALIZED_NAME_ALIASES[normalizedName]
    const aliasEntry = aliasId ? indexes.byId.get(aliasId) : undefined
    if (aliasEntry) {
      return makeResolvedIdentity(
        aliasEntry,
        originalId,
        suppliedName,
        'alias',
      )
    }
  }

  return {
    canonicalId: null,
    originalId,
    originalName: suppliedName,
    canonicalName: suppliedName,
    source: 'unknown',
    movementFamily: null,
  }
}

function resolveCanonicalIdFromIdOnly(
  id: string,
  library: readonly LibraryExercise[],
): string | null {
  const indexes = buildLibraryIndexes(library)
  if (indexes.byId.has(id)) {
    return id
  }

  const aliasId = LEGACY_ID_ALIASES[id]
  return aliasId && indexes.byId.has(aliasId) ? aliasId : null
}

function makeResolvedIdentity(
  entry: LibraryExercise,
  originalId: string | null,
  suppliedName: string,
  source: ExerciseIdentitySource,
): Omit<ResolvedExerciseIdentity, 'archived'> {
  return {
    canonicalId: entry.id,
    originalId,
    originalName: suppliedName || entry.name,
    canonicalName: entry.name,
    source,
    movementFamily: MOVEMENT_FAMILY_BY_ID[entry.id] ?? null,
  }
}

function planContainsIdentity(
  identity: Omit<ResolvedExerciseIdentity, 'archived'> | ResolvedExerciseIdentity,
  activePlan: readonly ExerciseContainer[],
  library: readonly LibraryExercise[],
): boolean {
  const authoritativeId = identity.originalId
    ? resolveCanonicalIdFromIdOnly(identity.originalId, library)
    : null
  const target: ExerciseIdentityInput = {
    exerciseId:
      authoritativeId ?? identity.originalId ?? identity.canonicalId,
    exerciseName: identity.originalName || identity.canonicalName,
  }

  return activePlan.some((day) =>
    safeExercises(day?.exercises).flatMap(expandPlanExercise).some((exercise) =>
      exerciseIdentitiesMatch(target, toIdentityInput(exercise), { library }),
    ),
  )
}

function expandPlanExercise(exercise: Exercise): Exercise[] {
  const variants = (['home', 'gym'] as const).flatMap((location) =>
    (exercise.alternatives?.[location] ?? []).map((variant) => ({
      ...exercise,
      id: variant.id,
      name: variant.name,
      equipment: variant.equipment,
      repRange:
        variant.repRange ?? (variant.duration ? undefined : exercise.repRange),
      duration:
        variant.duration ?? (variant.repRange ? undefined : exercise.duration),
      formTips: variant.formTips ?? exercise.formTips,
      alternatives: undefined,
    })),
  )

  return [exercise, ...variants]
}

function buildLibraryIndexes(library: readonly LibraryExercise[]) {
  const byId = new Map<string, LibraryExercise>()
  const byNormalizedName = new Map<string, LibraryExercise | null>()

  library.forEach((exercise) => {
    if (!exercise?.id || byId.has(exercise.id)) {
      return
    }
    byId.set(exercise.id, exercise)

    const normalizedName = normalizeExerciseName(exercise.name)
    if (!normalizedName) {
      return
    }
    if (!byNormalizedName.has(normalizedName)) {
      byNormalizedName.set(normalizedName, exercise)
    } else {
      const existing = byNormalizedName.get(normalizedName)
      if (!existing || existing.id !== exercise.id) {
        byNormalizedName.set(normalizedName, null)
      }
    }
  })

  return {
    byId,
    byNormalizedName: new Map(
      [...byNormalizedName.entries()].filter(
        (entry): entry is [string, LibraryExercise] => entry[1] !== null,
      ),
    ),
  }
}

function toCatalogEntry(
  exercise: CatalogExercise,
  identity: ResolvedExerciseIdentity,
  active: boolean,
  library: readonly LibraryExercise[],
): HistoricalExerciseCatalogEntry {
  const exerciseName = typeof (exercise.exerciseName ?? exercise.name) === 'string'
    ? (exercise.exerciseName ?? exercise.name ?? '')
    : ''
  const displayName = exerciseName || identity.originalName || identity.canonicalName || 'Unnamed exercise'
  const authoritativeId = identity.originalId
    ? resolveCanonicalIdFromIdOnly(identity.originalId, library)
    : null
  const key = authoritativeId
    ? `id:${authoritativeId}`
    : identity.originalId
      ? `unknown-id:${identity.originalId}`
      : identity.canonicalId
        ? `id:${identity.canonicalId}`
        : `name:${normalizeExerciseName(displayName) || `raw:${displayName}`}`

  return {
    ...identity,
    key,
    displayName,
    active,
    unknown: identity.source === 'unknown',
    exerciseId: cleanId(exercise.exerciseId ?? exercise.id),
    exerciseName,
    equipment: copyText(exercise.equipment),
    muscleGroup: copyText(exercise.muscleGroup),
    targetDuration: copyText(exercise.targetDuration ?? exercise.duration),
    targetReps: copyText(exercise.targetReps ?? exercise.repRange),
    targetRir: copyText(exercise.targetRir),
    targetSets: finiteNumber(exercise.targetSets ?? exercise.sets),
  }
}

function toIdentityInput(
  exercise: Exercise | CatalogExercise | HistoricalExerciseCatalogEntry,
): ExerciseIdentityInput {
  const source = exercise as CatalogExercise & { id?: string; name?: string }
  return {
    exerciseId: source.exerciseId ?? source.id ?? null,
    exerciseName: source.exerciseName ?? source.name ?? null,
  }
}

function safeExercises(value: unknown): Exercise[] {
  return Array.isArray(value) ? value : []
}

function safeCatalogExercises(value: unknown): CatalogExercise[] {
  return Array.isArray(value) ? value : []
}

function safeSessions(value: unknown): WorkoutSession[] {
  return Array.isArray(value) ? value : []
}

function cleanId(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function rawExerciseName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function copyText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function finiteNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function cloneLibraryExercise(entry: LibraryExercise): LibraryExercise {
  return {
    ...entry,
    primaryMuscles: [...entry.primaryMuscles],
    secondaryMuscles: [...entry.secondaryMuscles],
    equipment: [...entry.equipment],
    instructions: [...entry.instructions],
    formTips: [...entry.formTips],
    commonMistakes: [...entry.commonMistakes],
    progression: [...entry.progression],
    regression: [...entry.regression],
    demoLinks: entry.demoLinks.map((link) => ({ ...link })),
    relatedWorkoutDays: [...entry.relatedWorkoutDays],
  }
}

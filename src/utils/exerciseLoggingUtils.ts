export type ExerciseLoggingMode = 'reps' | 'duration'

export interface ExerciseLoggingTarget {
  duration?: unknown
  loggingMode?: unknown
  repRange?: unknown
  /** Snapshot fields used by active and completed workout records. */
  targetDuration?: unknown
  targetReps?: unknown
}

export interface ParsedDurationTarget {
  originalText: string
  minSeconds: number | null
  maxSeconds: number | null
}

/**
 * Prefer an explicit rep range, then an explicit duration. Snapshot fields are
 * supported so the same helper can be used after a workout has started.
 */
export function getExerciseLoggingMode(
  exercise: ExerciseLoggingTarget | null | undefined,
): ExerciseLoggingMode {
  if (hasText(exercise?.repRange)) {
    return 'reps'
  }

  if (hasText(exercise?.duration)) {
    return 'duration'
  }

  if (exercise?.loggingMode === 'duration') {
    return 'duration'
  }

  if (exercise?.loggingMode === 'reps') {
    return 'reps'
  }

  // Active sessions created before timed logging stored a duration target in
  // targetReps. Recognize common duration text without changing stored data.
  if (hasText(exercise?.targetReps)) {
    return parseDurationTarget(String(exercise?.targetReps)).minSeconds === null
      ? 'reps'
      : 'duration'
  }

  if (hasText(exercise?.targetDuration)) {
    return 'duration'
  }

  return 'reps'
}

export function isTimedExercise(
  exercise: ExerciseLoggingTarget | null | undefined,
): boolean {
  return getExerciseLoggingMode(exercise) === 'duration'
}

/**
 * Parse the common duration targets used by the workout programs. Unparsed
 * text remains available in originalText so the UI can still show it while
 * accepting manual minutes and seconds.
 */
export function parseDurationTarget(
  durationText: string | null | undefined,
): ParsedDurationTarget {
  const originalText = typeof durationText === 'string' ? durationText.trim() : ''
  const normalized = originalText.replace(/[–—]/g, '-').toLowerCase()
  const match = normalized.match(
    /(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*(seconds?|secs?|sec|minutes?|mins?|min|hours?|hrs?|hr)\b/,
  )

  if (!match) {
    return { originalText, minSeconds: null, maxSeconds: null }
  }

  const first = Number(match[1])
  const second = match[2] === undefined ? first : Number(match[2])
  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return { originalText, minSeconds: null, maxSeconds: null }
  }

  const unit = match[3]
  const multiplier = unit.startsWith('hour') || unit.startsWith('hr')
    ? 3600
    : unit.startsWith('min')
      ? 60
      : 1
  const values = [first, second]
    .map((value) => Math.round(value * multiplier))
    .sort((left, right) => left - right)

  return {
    originalText,
    minSeconds: values[0],
    maxSeconds: values[1],
  }
}

/** MM:SS below one hour; H:MM:SS at one hour or above. */
export function formatDuration(seconds: number | null | undefined): string {
  const numeric = Number(seconds)
  const totalSeconds = Number.isFinite(numeric)
    ? Math.max(0, Math.round(numeric))
    : 0
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainder = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainder)}`
  }

  return `${pad(minutes)}:${pad(remainder)}`
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

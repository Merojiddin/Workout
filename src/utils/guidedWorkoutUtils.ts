import {
  findGuidedExercise,
  type GuidedExercise,
} from '../data/guidedExercises'
import {
  guidedCategories,
  guidedWorkouts,
  type GuidedCategory,
  type GuidedCategoryId,
  type GuidedLevel,
  type GuidedWorkout,
  type GuidedWorkoutStep,
} from '../data/guidedWorkouts'
import type { LoggedExercise, WorkoutSession } from '../data/workoutSessions'
import type { MessageKey } from '../i18n'
import { translateExerciseText } from '../i18n/exercises'

/** How each difficulty is named on screen, wherever a workout is listed. */
export const guidedLevelKeys: Record<GuidedLevel, MessageKey> = {
  Advanced: 'guided.levelAdvanced',
  Beginner: 'guided.levelBeginner',
  Intermediate: 'guided.levelIntermediate',
}

/**
 * Turning a guided workout definition into the flat timeline the player runs.
 *
 * The player never looks at the workout itself: it walks a list of steps, each
 * one a number of seconds and what to show while they run. Rests, the
 * get-ready countdown and the longer breaks between rounds are all steps of
 * that same list, which is what makes the session one continuous timeline
 * rather than a set of exercises with special cases between them.
 */

export type GuidedStepKind = 'prepare' | 'work' | 'rest' | 'round-rest'

export interface GuidedTimelineStep {
  /** Stable across rebuilds - it is the React key and the audio cue's identity. */
  key: string
  kind: GuidedStepKind
  seconds: number
  /** 1-based round this step belongs to. */
  round: number
  /** The movement being performed. Null on every kind but `work`. */
  exercise: GuidedExercise | null
  /** The movement's coaching line, with any per-workout override applied. */
  cue: string
  /** The movement this step leads into, for the "next up" line. */
  next: GuidedExercise | null
  /** 1-based position among the session's work steps; 0 on the others. */
  workIndex: number
  /** Seconds from the start of the session to the start of this step. */
  startsAt: number
}

export interface GuidedTimeline {
  workoutId: string
  steps: GuidedTimelineStep[]
  totalSeconds: number
  totalWorkSteps: number
  rounds: number
}

/** The exercise a step names, whether by id or defined inline. */
export function resolveGuidedStepExercise(
  step: GuidedWorkoutStep,
): GuidedExercise | null {
  if (step.exercise) {
    return step.exercise
  }
  return (step.exerciseId && findGuidedExercise(step.exerciseId)) || null
}

/**
 * The whole session as one list of timed steps.
 *
 * A rest follows every movement except the very last one, because there is
 * nothing left to rest for; the gap between two rounds uses the workout's
 * longer `roundRestSeconds` instead. A step whose movement cannot be resolved
 * is dropped rather than rendered blank.
 */
export function buildGuidedTimeline(workout: GuidedWorkout): GuidedTimeline {
  const rounds = Math.max(1, Math.round(workout.rounds ?? 1))
  const defaultWork = Math.max(1, Math.round(workout.workSeconds))
  const defaultRest = Math.max(0, Math.round(workout.restSeconds))
  const roundRest = Math.max(
    0,
    Math.round(workout.roundRestSeconds ?? workout.restSeconds),
  )

  const playable = workout.steps
    .map((step) => ({ step, exercise: resolveGuidedStepExercise(step) }))
    .filter(
      (entry): entry is { step: GuidedWorkoutStep; exercise: GuidedExercise } =>
        entry.exercise !== null,
    )

  const steps: GuidedTimelineStep[] = []
  let elapsed = 0
  let workIndex = 0

  function push(
    step: Omit<GuidedTimelineStep, 'startsAt'>,
  ): GuidedTimelineStep | null {
    if (step.seconds <= 0) {
      return null
    }

    const placed: GuidedTimelineStep = { ...step, startsAt: elapsed }
    elapsed += step.seconds
    steps.push(placed)
    return placed
  }

  const prepare = Math.max(0, Math.round(workout.prepareSeconds ?? 0))
  if (prepare > 0 && playable.length > 0) {
    push({
      key: 'prepare',
      kind: 'prepare',
      seconds: prepare,
      round: 1,
      exercise: null,
      cue: '',
      next: playable[0].exercise,
      workIndex: 0,
    })
  }

  for (let round = 1; round <= rounds; round += 1) {
    playable.forEach(({ step, exercise }, index) => {
      workIndex += 1
      const isLastOfRound = index === playable.length - 1
      const isLastOfWorkout = isLastOfRound && round === rounds
      // The next movement wraps to the top of the list on the last step of a
      // round that is not the last, because that is what actually comes next.
      const next = isLastOfWorkout
        ? null
        : (playable[index + 1] ?? playable[0]).exercise

      push({
        key: `r${round}-s${index}-work`,
        kind: 'work',
        seconds: Math.max(1, Math.round(step.seconds ?? defaultWork)),
        round,
        exercise,
        cue: step.cue ?? exercise.cue,
        next,
        workIndex,
      })

      if (isLastOfWorkout) {
        return
      }

      const rest = isLastOfRound
        ? roundRest
        : Math.max(0, Math.round(step.restSeconds ?? defaultRest))

      push({
        key: `r${round}-s${index}-rest`,
        kind: isLastOfRound ? 'round-rest' : 'rest',
        seconds: rest,
        round,
        exercise: null,
        cue: '',
        next,
        workIndex: 0,
      })
    })
  }

  return {
    rounds,
    steps,
    totalSeconds: elapsed,
    totalWorkSteps: workIndex,
    workoutId: workout.id,
  }
}

export interface GuidedWorkoutSummary {
  totalSeconds: number
  workSeconds: number
  restSeconds: number
  /** Distinct movements, not counting repeats across rounds. */
  exerciseCount: number
  rounds: number
  equipment: string[]
  /** True when nothing in it takes both feet off the floor. */
  lowImpact: boolean
}

/** The numbers printed on a workout's card, all derived from its steps. */
export function getGuidedWorkoutSummary(
  workout: GuidedWorkout,
): GuidedWorkoutSummary {
  const timeline = buildGuidedTimeline(workout)
  const exercises = new Map<string, GuidedExercise>()
  let workSeconds = 0
  let restSeconds = 0

  for (const step of timeline.steps) {
    if (step.kind === 'work' && step.exercise) {
      workSeconds += step.seconds
      exercises.set(step.exercise.id, step.exercise)
    } else {
      restSeconds += step.seconds
    }
  }

  const equipment = new Set<string>(workout.equipment ?? [])
  let lowImpact = true
  for (const exercise of exercises.values()) {
    for (const item of exercise.equipment ?? []) {
      equipment.add(item)
    }
    if (exercise.impact === 'high') {
      lowImpact = false
    }
  }

  return {
    equipment: [...equipment],
    exerciseCount: exercises.size,
    lowImpact,
    restSeconds,
    rounds: timeline.rounds,
    totalSeconds: timeline.totalSeconds,
    workSeconds,
  }
}

/** The distinct movements a workout uses, in the order they first appear. */
export function getGuidedWorkoutExercises(
  workout: GuidedWorkout,
): GuidedExercise[] {
  const seen = new Set<string>()
  const exercises: GuidedExercise[] = []

  for (const step of workout.steps) {
    const exercise = resolveGuidedStepExercise(step)
    if (exercise && !seen.has(exercise.id)) {
      seen.add(exercise.id)
      exercises.push(exercise)
    }
  }

  return exercises
}

export function findGuidedWorkout(id: string): GuidedWorkout | null {
  return guidedWorkouts.find((workout) => workout.id === id) ?? null
}

export function findGuidedCategory(
  id: GuidedCategoryId | null | undefined,
): GuidedCategory | null {
  return guidedCategories.find((category) => category.id === id) ?? null
}

/**
 * The workouts on screen, narrowed by category and by how hard they are.
 *
 * Difficulty is a filter of its own rather than a sort, because the two ends
 * want opposite orders: somebody looking for a beginner session and somebody
 * looking for the hardest thing here are both served by asking, and neither is
 * served by a list that leads with the other one.
 */
export function filterGuidedWorkouts(
  workouts: readonly GuidedWorkout[],
  categoryId: GuidedCategoryId | 'all',
  level: GuidedLevel | 'all' = 'all',
): GuidedWorkout[] {
  return workouts.filter(
    (workout) =>
      (categoryId === 'all' || workout.categoryId === categoryId) &&
      (level === 'all' || workout.level === level),
  )
}

/** The shipped workouts only, already filtered. */
export function getGuidedWorkouts(
  categoryId: GuidedCategoryId | 'all',
  level: GuidedLevel | 'all' = 'all',
): GuidedWorkout[] {
  return filterGuidedWorkouts(guidedWorkouts, categoryId, level)
}

/**
 * Workout names, coaching lines and instructions are plain English in the data
 * so a new workout can be written without touching a message catalog. They are
 * translated the same way the exercise library is: by exact phrase, passing
 * anything unrecognised through unchanged.
 */
export function translateGuidedText(text: string, exerciseName = ''): string {
  return translateExerciseText(text, exerciseName || text)
}

/** m:ss, the shape the big countdown and every duration on screen use. */
export function formatGuidedClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`
}

/** Whole minutes, rounded up: what a workout card advertises. */
export function getGuidedWorkoutMinutes(totalSeconds: number): number {
  return Math.max(1, Math.round(totalSeconds / 60))
}

/**
 * A finished guided session in the shape the history already stores, so it
 * shows up in Progress and the weekly review alongside everything else.
 *
 * Each movement becomes one logged exercise and each round one set, holding
 * the seconds it ran for. Nothing is invented: a skipped step is simply not
 * counted, so a session left half way records only what was actually done.
 */
export function buildGuidedWorkoutSession(
  workout: GuidedWorkout,
  completedSteps: GuidedTimelineStep[],
  startedAt: Date,
  finishedAt: Date,
): WorkoutSession {
  const byExercise = new Map<string, LoggedExercise>()

  for (const step of completedSteps) {
    if (step.kind !== 'work' || !step.exercise) {
      continue
    }

    const existing = byExercise.get(step.exercise.id)
    const logged: LoggedExercise = existing ?? {
      exerciseId: step.exercise.id,
      exerciseName: step.exercise.name,
      muscleGroup: workout.name,
      sets: [],
      targetReps: `${step.seconds} sec`,
      targetDuration: `${step.seconds} sec`,
      targetSets: 0,
    }

    logged.sets.push({
      completedAt: finishedAt.toISOString(),
      notes: '',
      reps: null,
      rpe: null,
      setNumber: logged.sets.length + 1,
      timeSeconds: step.seconds,
      weightKg: null,
    })
    logged.targetSets = logged.sets.length
    byExercise.set(step.exercise.id, logged)
  }

  return {
    completed: true,
    date: startedAt.toISOString().slice(0, 10),
    exercises: [...byExercise.values()],
    finishedAt: finishedAt.toISOString(),
    id: `guided-${workout.id}-${startedAt.getTime()}`,
    sessionType: 'standalone',
    standaloneWorkoutId: `guided:${workout.id}`,
    startedAt: startedAt.toISOString(),
    syncStatus: 'local-only',
    workoutDayId: null,
    workoutName: workout.name,
  }
}

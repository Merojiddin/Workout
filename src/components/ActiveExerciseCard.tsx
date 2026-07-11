import { Dumbbell, History, Target, Timer, Trophy } from 'lucide-react'
import { ExerciseMedia } from './ExerciseMedia'
import type { LibraryExercise } from '../data/exerciseLibrary'
import type { LoggedExercise } from '../data/workoutSessions'
import {
  getPostureCue,
  summarizePreviousPerformance,
  type ActiveExercise,
  type SuggestedSetTarget,
} from '../utils/liveWorkoutUtils'
import type { WorkoutDisplaySettings } from '../utils/mediaUtils'

interface ActiveExerciseCardProps {
  exercise: ActiveExercise
  currentSetIndex: number
  previousPerformance: LoggedExercise | null
  suggestedTarget: SuggestedSetTarget
  bestSummary?: string | null
  hasFormGuide?: boolean
  onViewFormGuide: () => void
  /** Library entry providing the image/video shown during the workout. */
  libraryExercise?: LibraryExercise | null
  exerciseNumber?: number
  totalExercises?: number
  displaySettings?: WorkoutDisplaySettings
}

export function ActiveExerciseCard({
  exercise,
  currentSetIndex,
  previousPerformance,
  suggestedTarget,
  bestSummary,
  hasFormGuide = false,
  onViewFormGuide,
  libraryExercise,
  exerciseNumber,
  totalExercises,
  displaySettings,
}: ActiveExerciseCardProps) {
  const totalSets = exercise.sets.length
  const setNumber = Math.min(currentSetIndex + 1, totalSets)
  const postureCue = getPostureCue(exercise.exerciseName)
  const previousSummary = summarizePreviousPerformance(previousPerformance)
  const restSeconds = Math.max(0, Math.round(exercise.restSeconds))
  const showVideoDefault =
    Boolean(displaySettings?.autoOpenVideo) ||
    displaySettings?.videosCollapsedByDefault === false

  return (
    <article className="active-exercise-card dashboard-card">
      <div className="active-exercise-card__head">
        <p className="eyebrow">
          <Dumbbell size={14} strokeWidth={2.6} aria-hidden="true" />
          {exercise.muscleGroup || 'Exercise'}
          {exerciseNumber && totalExercises ? (
            <span className="active-exercise-card__position">
              · Exercise {exerciseNumber} of {totalExercises}
            </span>
          ) : null}
        </p>
        <h2 className="active-exercise-card__name">{exercise.exerciseName}</h2>
        <p className="active-exercise-card__set">
          Set {setNumber} of {totalSets}
        </p>
      </div>

      {libraryExercise ? (
        <ExerciseMedia
          compact={displaySettings?.preferCompactView !== false}
          exercise={libraryExercise}
          onOpenFormGuide={hasFormGuide ? onViewFormGuide : undefined}
          showImage={displaySettings?.showExerciseImages !== false}
          showVideoDefault={showVideoDefault}
        />
      ) : null}

      <section aria-label="Target" className="active-exercise-card__section">
        <div className="active-target-grid">
          <div>
            <span>
              <Target size={14} strokeWidth={2.4} aria-hidden="true" />
              Target
            </span>
            <strong>{exercise.targetReps ? `${exercise.targetReps}` : 'Controlled reps'}</strong>
          </div>
          <div>
            <span>
              <Dumbbell size={14} strokeWidth={2.4} aria-hidden="true" />
              Suggested today
            </span>
            <strong>{suggestedTarget.repsTarget}</strong>
            <small>{suggestedTarget.weightTarget}</small>
          </div>
          <div>
            <span>
              <Timer size={14} strokeWidth={2.4} aria-hidden="true" />
              Rest after set
            </span>
            <strong>{restSeconds} sec</strong>
          </div>
        </div>
      </section>

      {/* Compact info row: cue, history, and suggestion share one line.
          Full form tips stay available in the Form Guide modal. */}
      <div className="active-info-row">
        <section className="form-cue" aria-label="Form cue">
          <p className="eyebrow">Form cue</p>
          <p className="form-cue__posture">
            {postureCue ??
              exercise.formTips[0] ??
              'Move with control and stop 1-2 reps before form breaks.'}
          </p>
        </section>

        <section className="previous-performance" aria-label="Previous performance">
          <div className="previous-performance__row">
            <span className="previous-performance__label">
              <History size={14} strokeWidth={2.4} aria-hidden="true" />
              Last time
            </span>
            <strong>{previousSummary ?? 'No previous data yet'}</strong>
          </div>
          {bestSummary ? (
            <div className="previous-performance__row">
              <span className="previous-performance__label">
                <Trophy size={14} strokeWidth={2.4} aria-hidden="true" />
                Best
              </span>
              <strong>{bestSummary}</strong>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  )
}

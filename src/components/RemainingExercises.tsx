import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { getExerciseTarget } from '../utils/exerciseLoggingUtils'
import { isDoneSet, type ActiveExercise } from '../utils/liveWorkoutUtils'

interface RemainingExercisesProps {
  exercises: ActiveExercise[]
  currentIndex: number
  isOpen: boolean
  onToggle: () => void
  /** Jump straight to an exercise from the list. */
  onSelect: (index: number) => void
}

/**
 * The "what else is left" answer, collapsed by default. This is the only place
 * the full exercise list appears during a workout, which keeps the training
 * screen down to the current exercise.
 */
export function RemainingExercises({
  exercises,
  currentIndex,
  isOpen,
  onToggle,
  onSelect,
}: RemainingExercisesProps) {
  const remainingCount = exercises.reduce(
    (count, exercise, index) =>
      index > currentIndex || !exercise.sets.every(isDoneSet) ? count + 1 : count,
    0,
  )

  return (
    <section className="remaining-exercises">
      <button
        aria-expanded={isOpen}
        className="remaining-exercises__toggle"
        onClick={onToggle}
        type="button"
      >
        {isOpen ? (
          <ChevronUp size={16} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />
        )}
        {isOpen ? 'Hide exercise list' : `Rest of the workout (${remainingCount})`}
      </button>

      {isOpen ? (
        <ol className="remaining-exercises__list">
          {exercises.map((exercise, index) => {
            const done = exercise.sets.length > 0 && exercise.sets.every(isDoneSet)
            const current = index === currentIndex
            const doneSets = exercise.sets.filter(isDoneSet).length

            return (
              <li key={`${exercise.exerciseId}-${index}`}>
                <button
                  aria-current={current ? 'step' : undefined}
                  className={`remaining-exercises__item${
                    current ? ' remaining-exercises__item--current' : ''
                  }${done ? ' remaining-exercises__item--done' : ''}`}
                  onClick={() => onSelect(index)}
                  type="button"
                >
                  <span className="remaining-exercises__marker" aria-hidden="true">
                    {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="remaining-exercises__text">
                    <strong>{exercise.exerciseName}</strong>
                    <small>
                      {exercise.sets.length} × {getExerciseTarget(exercise)}
                      {doneSets > 0 && !done
                        ? ` · ${doneSets} of ${exercise.sets.length} done`
                        : ''}
                    </small>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}

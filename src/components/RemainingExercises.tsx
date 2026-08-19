import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import { useT } from '../i18n'
import { getExerciseTarget } from '../utils/exerciseLoggingUtils'
import {
  countRemainingExercises,
  isDoneSet,
  type ActiveExercise,
} from '../utils/liveWorkoutUtils'

interface RemainingExercisesProps {
  exercises: ActiveExercise[]
  currentIndex: number
  onClose: () => void
  /** Jump straight to an exercise from the list. */
  onSelect: (index: number) => void
}

/**
 * The "what else is left" answer, as a sheet over the training screen. It is
 * the only place the full exercise list appears during a workout, which keeps
 * the screen itself down to the current exercise and its controls.
 */
export function RemainingExercises({
  exercises,
  currentIndex,
  onClose,
  onSelect,
}: RemainingExercisesProps) {
  const t = useT()

  // Escape closes it, the way the backdrop tap does.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="live-sheet">
      <button
        aria-label={t('live.remaining.closeAria')}
        className="live-sheet__backdrop"
        onClick={onClose}
        type="button"
      />

      <section
        aria-label={t('live.remaining.title')}
        className="live-sheet__panel"
        role="dialog"
        aria-modal="true"
      >
        <header className="live-sheet__head">
          <strong>
            {t('live.remaining.titleWithCount', {
              count: countRemainingExercises(exercises, currentIndex),
            })}
          </strong>
          <button
            aria-label={t('live.remaining.closeAria')}
            className="live-sheet__close"
            onClick={onClose}
            type="button"
          >
            <X size={17} strokeWidth={2.6} aria-hidden="true" />
          </button>
        </header>

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
                        ? ` · ${t('live.remaining.setsDone', {
                            done: doneSets,
                            total: exercise.sets.length,
                          })}`
                        : ''}
                    </small>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

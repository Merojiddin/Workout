import { Check } from 'lucide-react'
import { formatDuration } from '../utils/exerciseLoggingUtils'
import { isDoneSet, type ActiveExercise, type ActiveSet } from '../utils/liveWorkoutUtils'

interface LiveSetTableProps {
  exercise: ActiveExercise
  /** Index of the set being worked on, highlighted as the live row. */
  currentSetIndex: number
  onSelectSet: (setIndex: number) => void
}

/**
 * Every set of the current exercise, done and still to do, as one short table.
 *
 * The live screen used to show only the set you were on, which meant checking
 * what you lifted two sets ago was a trip into history. Tapping a row goes
 * back to that set.
 */
export function LiveSetTable({
  exercise,
  currentSetIndex,
  onSelectSet,
}: LiveSetTableProps) {
  const timed = exercise.loggingMode === 'duration'

  return (
    <div className="set-table" role="table" aria-label="Sets for this exercise">
      {exercise.sets.map((set, index) => {
        const done = isDoneSet(set)
        const current = index === currentSetIndex

        return (
          <button
            aria-current={current ? 'step' : undefined}
            className={`set-row${current ? ' set-row--active' : ''}${
              done ? ' set-row--done' : ''
            }`}
            key={set.setNumber}
            onClick={() => onSelectSet(index)}
            type="button"
          >
            <b>{set.setNumber}</b>
            <span>{primaryValue(set, timed)}</span>
            <span>{set.weightKg === null ? '—' : `${set.weightKg} kg`}</span>
            <span className="set-row__mark" aria-hidden="true">
              {done ? <Check size={14} strokeWidth={3} /> : '○'}
            </span>
            <span className="set-row__label">
              {done ? 'Done' : current ? 'Current set' : 'Not done'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function primaryValue(set: ActiveSet, timed: boolean): string {
  if (timed) {
    return set.timeSeconds === null ? '—' : formatDuration(set.timeSeconds)
  }

  return set.reps === null ? '—' : `${set.reps} reps`
}

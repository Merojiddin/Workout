import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExerciseLoggingMode } from '../utils/exerciseLoggingUtils'
import type { ActiveSet } from '../utils/liveWorkoutUtils'

export interface OptionalSetLogValues {
  reps: number | null
  timeSeconds: number | null
  weightKg: number | null
}

interface OptionalSetLogProps {
  /** Reset target: changing this reseeds the inputs for a new set. */
  setKey: string
  loggingMode: ExerciseLoggingMode
  initialData?: Partial<ActiveSet>
  onChange: (values: OptionalSetLogValues) => void
  /** Adds one more set to this exercise than the plan asked for. */
  onAddSet: () => void
}

/**
 * Reps, kg, and one button that adds a set.
 *
 * Logging stays optional -- leaving both fields empty is a perfectly normal
 * way to train -- but the fields are on screen rather than behind a toggle,
 * because reaching for a number you are about to type should not cost a tap.
 *
 * There is no Save button. Values are reported upward as they are typed and
 * the single "Next" button is what commits them, so the user never has to
 * press two things to move on.
 */
export function OptionalSetLog({
  setKey,
  loggingMode,
  initialData,
  onChange,
  onAddSet,
}: OptionalSetLogProps) {
  const [reps, setReps] = useState('')
  const [seconds, setSeconds] = useState('')
  const [weight, setWeight] = useState('')

  // Reseed when the target set changes, so set 2 does not inherit set 1's
  // numbers as if they had been entered again.
  useEffect(() => {
    setReps(numberToInput(initialData?.reps))
    setSeconds(numberToInput(initialData?.timeSeconds))
    setWeight(numberToInput(initialData?.weightKg))
    // Only the identity of the set should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setKey])

  function report(next: Partial<Record<'reps' | 'seconds' | 'weight', string>>) {
    const values = {
      reps: next.reps ?? reps,
      seconds: next.seconds ?? seconds,
      weight: next.weight ?? weight,
    }

    onChange({
      reps: loggingMode === 'reps' ? parseField(values.reps) : null,
      timeSeconds: loggingMode === 'duration' ? parseField(values.seconds) : null,
      weightKg: parseField(values.weight),
    })
  }

  const timed = loggingMode === 'duration'

  return (
    <section className="optional-log" aria-label="Log this set (optional)">
      <label className="optional-log__field" htmlFor="optional-log-primary">
        <span>{timed ? 'Sec' : 'Reps'}</span>
        <input
          id="optional-log-primary"
          inputMode="numeric"
          min={0}
          onChange={(event) => {
            const value = sanitize(event.target.value)
            if (timed) {
              setSeconds(value)
              report({ seconds: value })
            } else {
              setReps(value)
              report({ reps: value })
            }
          }}
          placeholder="-"
          type="number"
          value={timed ? seconds : reps}
        />
      </label>

      <label className="optional-log__field" htmlFor="optional-log-weight">
        <span>Kg</span>
        <input
          id="optional-log-weight"
          inputMode="decimal"
          min={0}
          onChange={(event) => {
            const value = sanitize(event.target.value)
            setWeight(value)
            report({ weight: value })
          }}
          placeholder="-"
          step="0.5"
          type="number"
          value={weight}
        />
      </label>

      <button
        aria-label="Add another set to this exercise"
        className="optional-log__add"
        onClick={onAddSet}
        type="button"
      >
        <Plus size={22} strokeWidth={2.6} aria-hidden="true" />
      </button>
    </section>
  )
}

function sanitize(value: string): string {
  if (value === '') {
    return ''
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? value : ''
}

function parseField(value: string): number | null {
  if (value.trim() === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.max(0, numeric) : null
}

function numberToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

import { ChevronDown, ChevronUp } from 'lucide-react'
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
  /** Kept open for the rest of the workout once the user opens it. */
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onChange: (values: OptionalSetLogValues) => void
}

/**
 * Reps and kg, and nothing else. Collapsed by default because logging is
 * optional: the workout is fully usable without ever opening this.
 *
 * There is no Save button. Values are reported upward as they are typed and
 * the screen's single "Next" button is what commits them, so the user never
 * has to press two things to move on.
 */
export function OptionalSetLog({
  setKey,
  loggingMode,
  initialData,
  isOpen,
  onOpenChange,
  onChange,
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

  if (!isOpen) {
    return (
      <button
        className="optional-log__toggle"
        onClick={() => onOpenChange(true)}
        type="button"
      >
        <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />
        Log this set (optional)
      </button>
    )
  }

  return (
    <section className="optional-log" aria-label="Log this set (optional)">
      <div className="optional-log__fields">
        <label className="optional-log__field" htmlFor="optional-log-primary">
          <span>{timed ? 'Seconds' : 'Reps'}</span>
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
          <span>Weight kg</span>
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
      </div>

      <button
        className="optional-log__toggle optional-log__toggle--close"
        onClick={() => onOpenChange(false)}
        type="button"
      >
        <ChevronUp size={16} strokeWidth={2.4} aria-hidden="true" />
        Hide
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

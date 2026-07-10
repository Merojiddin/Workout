import { Save, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ActiveSet } from '../utils/liveWorkoutUtils'

export interface SetLoggerData {
  reps: number | null
  weightKg: number | null
  rpe: number | null
  painLevel: number | null
  notes: string
}

interface SetLoggerProps {
  setNumber: number
  initialData?: Partial<ActiveSet>
  onSave: (data: SetLoggerData) => void
  onSkip: () => void
  /** Increment to trigger a save from outside (sticky action bar). */
  saveSignal?: number
}

const REP_STEPS = [-1, 1, 5]
const WEIGHT_STEPS = [-2.5, 2.5, 5]
const RPE_OPTIONS = [7, 8, 9, 10]
const PAIN_OPTIONS = [0, 1, 2, 3, 4]

export function SetLogger({
  setNumber,
  initialData,
  onSave,
  onSkip,
  saveSignal,
}: SetLoggerProps) {
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [rpe, setRpe] = useState<number | null>(null)
  const [pain, setPain] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  // Seed with the mount-time signal so a remount (next set) does not re-fire
  // a save that belonged to the previous set.
  const handledSaveSignal = useRef(saveSignal ?? 0)

  // Reseed whenever we move to a different set (or its saved data changes).
  useEffect(() => {
    setReps(numberToInput(initialData?.reps))
    setWeight(numberToInput(initialData?.weightKg))
    setRpe(initialData?.rpe ?? null)
    setPain(initialData?.painLevel ?? null)
    setNotes(initialData?.notes ?? '')
    // Only re-run when the target set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNumber])

  // Save triggered from the sticky action bar.
  useEffect(() => {
    const signal = saveSignal ?? 0
    if (signal === handledSaveSignal.current) {
      return
    }
    handledSaveSignal.current = signal
    handleSave()
    // handleSave reads the latest state each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSignal])

  function bumpReps(step: number) {
    const next = Math.max(0, Math.round(toNumber(reps) + step))
    setReps(String(next))
  }

  function bumpWeight(step: number) {
    const next = Math.max(0, roundHalf(toNumber(weight) + step))
    setWeight(String(next))
  }

  function handleSave() {
    onSave({
      reps: parseField(reps),
      weightKg: parseField(weight),
      rpe,
      painLevel: pain,
      notes: notes.trim(),
    })
  }

  const painIsHigh = pain !== null && pain >= 4

  return (
    <section className="set-logger" aria-label={`Log set ${setNumber}`}>
      <div className="set-logger__grid">
        <div className="set-logger__field">
          <label htmlFor="set-reps">Reps</label>
          <input
            id="set-reps"
            inputMode="numeric"
            min={0}
            onChange={(event) => setReps(sanitize(event.target.value))}
            placeholder="0"
            type="number"
            value={reps}
          />
          <div className="quick-row">
            {REP_STEPS.map((step) => (
              <button
                className="quick-button"
                key={step}
                onClick={() => bumpReps(step)}
                type="button"
              >
                {formatStep(step)}
              </button>
            ))}
          </div>
        </div>

        <div className="set-logger__field">
          <label htmlFor="set-weight">Weight kg</label>
          <input
            id="set-weight"
            inputMode="decimal"
            min={0}
            onChange={(event) => setWeight(sanitize(event.target.value))}
            placeholder="0"
            step="0.5"
            type="number"
            value={weight}
          />
          <div className="quick-row">
            {WEIGHT_STEPS.map((step) => (
              <button
                className="quick-button"
                key={step}
                onClick={() => bumpWeight(step)}
                type="button"
              >
                {formatStep(step)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="set-logger__field">
        <label>RPE (effort)</label>
        <div className="chip-row">
          {RPE_OPTIONS.map((value) => (
            <button
              aria-pressed={rpe === value}
              className={`chip-button${rpe === value ? ' chip-button--active' : ''}`}
              key={value}
              onClick={() => setRpe(rpe === value ? null : value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="set-logger__field">
        <label>Pain level</label>
        <div className="chip-row">
          {PAIN_OPTIONS.map((value) => (
            <button
              aria-pressed={pain === value}
              className={`chip-button chip-button--pain${
                pain === value ? ' chip-button--active' : ''
              }${value >= 4 ? ' chip-button--danger' : ''}`}
              key={value}
              onClick={() => setPain(pain === value ? null : value)}
              type="button"
            >
              {value >= 4 ? '4+' : value}
            </button>
          ))}
        </div>
        {painIsHigh ? (
          <p className="set-logger__pain-warning">
            Pain detected. Do not increase load. Reduce intensity or stop this
            exercise.
          </p>
        ) : null}
      </div>

      <div className="set-logger__field">
        <label htmlFor="set-notes">Notes</label>
        <textarea
          id="set-notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional - how did it feel?"
          rows={2}
          value={notes}
        />
      </div>

      <div className="set-logger__actions">
        <button
          className="workout-primary-button"
          onClick={handleSave}
          type="button"
        >
          <Save size={19} strokeWidth={2.4} aria-hidden="true" />
          Save Set
        </button>
        <button
          className="workout-secondary-button"
          onClick={onSkip}
          type="button"
        >
          <SkipForward size={19} strokeWidth={2.4} aria-hidden="true" />
          Skip Set
        </button>
      </div>
    </section>
  )
}

function sanitize(value: string) {
  if (value === '') {
    return ''
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return ''
  }
  return value
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

function toNumber(value: string): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2
}

function formatStep(step: number): string {
  return step > 0 ? `+${step}` : `${step}`
}

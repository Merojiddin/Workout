import { Save, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  formatDuration,
  type ExerciseLoggingMode,
} from '../utils/exerciseLoggingUtils'
import type { ActiveSet } from '../utils/liveWorkoutUtils'

export interface SetLoggerData {
  reps: number | null
  timeSeconds: number | null
  weightKg: number | null
  rpe: number | null
  painLevel: number | null
  notes: string
}

interface SetLoggerProps {
  setNumber: number
  loggingMode?: ExerciseLoggingMode
  targetDuration?: string
  initialData?: Partial<ActiveSet>
  onSave: (data: SetLoggerData) => void
  onSkip: () => void
  /** Increment to trigger a save from outside (sticky action bar). */
  saveSignal?: number
}

export function SetLogger({
  setNumber,
  loggingMode = 'reps',
  targetDuration = '',
  initialData,
  onSave,
  onSkip,
  saveSignal,
}: SetLoggerProps) {
  const [reps, setReps] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [weight, setWeight] = useState('')
  const [rpe, setRpe] = useState('')
  const [pain, setPain] = useState('')
  const [notes, setNotes] = useState('')
  // Seed with the mount-time signal so a remount (next set) does not re-fire
  // a save that belonged to the previous set.
  const handledSaveSignal = useRef(saveSignal ?? 0)

  // Reseed whenever we move to a different set (or its saved data changes).
  useEffect(() => {
    const durationInputs = timeToInputs(initialData?.timeSeconds)
    setReps(numberToInput(initialData?.reps))
    setMinutes(durationInputs.minutes)
    setSeconds(durationInputs.seconds)
    setWeight(numberToInput(initialData?.weightKg))
    setRpe(numberToInput(initialData?.rpe))
    setPain(numberToInput(initialData?.painLevel))
    setNotes(initialData?.notes ?? '')
    // Only re-run when the target set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggingMode, setNumber])

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

  function handleSave() {
    const timeSeconds =
      loggingMode === 'duration' ? durationToSeconds(minutes, seconds) : null

    onSave({
      reps: loggingMode === 'reps' ? parseField(reps) : null,
      timeSeconds,
      weightKg: parseField(weight),
      rpe: parseField(rpe),
      painLevel: parseField(pain),
      notes: notes.trim(),
    })
  }

  function handleMinutesChange(value: string) {
    setMinutes(sanitizeWholeNumber(value))
  }

  function handleSecondsChange(value: string) {
    const sanitized = sanitizeWholeNumber(value)
    if (sanitized === '') {
      setSeconds('')
      return
    }

    const enteredSeconds = Number(sanitized)
    if (enteredSeconds < 60) {
      setSeconds(sanitized)
      return
    }

    const currentMinutes = Number(minutes) || 0
    setMinutes(String(currentMinutes + Math.floor(enteredSeconds / 60)))
    setSeconds(String(enteredSeconds % 60))
  }

  const painIsHigh = pain.trim() !== '' && toNumber(pain) >= 4
  const enteredTimeSeconds =
    loggingMode === 'duration' ? durationToSeconds(minutes, seconds) : null

  return (
    <section className="set-logger" aria-label={`Log set ${setNumber}`}>
      {loggingMode === 'duration' ? (
        <p className="card-copy">
          <strong>Target duration:</strong>{' '}
          {targetDuration.trim() || 'Enter a controlled duration'}
        </p>
      ) : null}

      <div className="set-logger__grid">
        {loggingMode === 'duration' ? (
          <>
            <div className="set-logger__field">
              <label htmlFor="set-minutes">Minutes</label>
              <input
                id="set-minutes"
                inputMode="numeric"
                min={0}
                onChange={(event) => handleMinutesChange(event.target.value)}
                placeholder="0"
                step={1}
                type="number"
                value={minutes}
              />
            </div>

            <div className="set-logger__field">
              <label htmlFor="set-seconds">Seconds</label>
              <input
                id="set-seconds"
                inputMode="numeric"
                min={0}
                onChange={(event) => handleSecondsChange(event.target.value)}
                placeholder="0"
                step={1}
                type="number"
                value={seconds}
              />
            </div>
          </>
        ) : (
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
          </div>
        )}

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
        </div>

        <div className="set-logger__field">
          <label htmlFor="set-rpe">RPE</label>
          <input
            id="set-rpe"
            inputMode="decimal"
            max={10}
            min={0}
            onChange={(event) => setRpe(sanitize(event.target.value))}
            placeholder="7-10"
            step="0.5"
            type="number"
            value={rpe}
          />
        </div>

        <div className="set-logger__field">
          <label htmlFor="set-pain">Pain</label>
          <input
            id="set-pain"
            inputMode="numeric"
            max={10}
            min={0}
            onChange={(event) => setPain(sanitize(event.target.value))}
            placeholder="0-4"
            type="number"
            value={pain}
          />
        </div>
      </div>

      {loggingMode === 'duration' && enteredTimeSeconds !== null && enteredTimeSeconds > 0 ? (
        <p aria-live="polite" className="card-copy">
          Entered duration: <strong>{formatDuration(enteredTimeSeconds)}</strong>
        </p>
      ) : null}

      <div className="set-logger__field">
        <label htmlFor="set-notes">Notes</label>
        <textarea
          id="set-notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional set notes"
          rows={2}
          value={notes}
        />
      </div>

      {painIsHigh ? (
        <p className="set-logger__pain-warning">
          Pain detected. Do not increase load. Reduce intensity or stop this
          exercise.
        </p>
      ) : null}

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

function sanitizeWholeNumber(value: string): string {
  if (value === '') {
    return ''
  }

  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return ''
  }

  return String(Math.floor(numeric))
}

function durationToSeconds(minutes: string, seconds: string): number | null {
  if (minutes.trim() === '' && seconds.trim() === '') {
    return null
  }

  const total = toNumber(minutes) * 60 + toNumber(seconds)
  return Math.max(0, Math.round(total))
}

function timeToInputs(value: number | null | undefined): {
  minutes: string
  seconds: string
} {
  if (value === null || value === undefined) {
    return { minutes: '', seconds: '' }
  }

  const totalSeconds = Math.max(0, Math.round(Number(value) || 0))
  return {
    minutes: String(Math.floor(totalSeconds / 60)),
    seconds: String(totalSeconds % 60),
  }
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

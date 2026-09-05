import {
  ArrowDown,
  ArrowUp,
  Check,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { guidedExerciseList, type GuidedExercise } from '../data/guidedExercises'
import {
  guidedCategories,
  type GuidedLevel,
  type GuidedWorkoutStep,
} from '../data/guidedWorkouts'
import { useT, type MessageKey } from '../i18n'
import {
  customWorkoutLimits,
  type CustomGuidedWorkout,
} from '../utils/customGuidedWorkouts'
import {
  buildGuidedTimeline,
  formatGuidedClock,
  resolveGuidedStepExercise,
  translateGuidedText,
} from '../utils/guidedWorkoutUtils'
import { GuidedStepMedia } from './GuidedStepMedia'

interface GuidedWorkoutBuilderProps {
  /** The workout being edited, or a blank one from `createEmptyCustomWorkout`. */
  workout: CustomGuidedWorkout
  /** True when this workout already exists, which is what shows Delete. */
  existing: boolean
  onCancel: () => void
  /** Returns false when the write failed, so the builder can stay open. */
  onSave: (workout: CustomGuidedWorkout) => boolean
  onDelete: (workout: CustomGuidedWorkout) => void
}

const levels: GuidedLevel[] = ['Beginner', 'Intermediate', 'Advanced']

const levelKeys: Record<GuidedLevel, MessageKey> = {
  Advanced: 'guided.levelAdvanced',
  Beginner: 'guided.levelBeginner',
  Intermediate: 'guided.levelIntermediate',
}

/**
 * Building a session by hand.
 *
 * It writes exactly the same shape the shipped workouts are written in, so
 * anything built here runs through the same player, timeline and history path
 * with no special cases anywhere. The running total at the top is computed by
 * the real timeline builder rather than an estimate, so what it says is what
 * the session will actually take.
 */
export function GuidedWorkoutBuilder({
  existing,
  onCancel,
  onDelete,
  onSave,
  workout,
}: GuidedWorkoutBuilderProps) {
  const t = useT()
  const [draft, setDraft] = useState<CustomGuidedWorkout>(workout)
  const [search, setSearch] = useState('')
  const [pickerCategory, setPickerCategory] = useState<'all' | 'equipment' | 'none'>(
    'all',
  )
  const [saveFailed, setSaveFailed] = useState(false)

  // The real timeline, so the total is the session's actual length rather than
  // a sum that forgets the get-ready step or the round breaks.
  const timeline = useMemo(() => buildGuidedTimeline(draft), [draft])
  const canSave = draft.steps.length > 0

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  function update(patch: Partial<CustomGuidedWorkout>) {
    setDraft((current) => ({ ...current, ...patch }))
    setSaveFailed(false)
  }

  function updateSteps(next: GuidedWorkoutStep[]) {
    update({ steps: next })
  }

  function addExercise(exercise: GuidedExercise) {
    if (draft.steps.length >= customWorkoutLimits.steps.max) {
      return
    }
    updateSteps([...draft.steps, { exerciseId: exercise.id }])
  }

  function move(index: number, by: number) {
    const target = index + by
    if (target < 0 || target >= draft.steps.length) {
      return
    }
    const next = [...draft.steps]
    const [step] = next.splice(index, 1)
    next.splice(target, 0, step)
    updateSteps(next)
  }

  function remove(index: number) {
    updateSteps(draft.steps.filter((_, position) => position !== index))
  }

  function setStepSeconds(index: number, seconds: number | undefined) {
    updateSteps(
      draft.steps.map((step, position) =>
        position === index ? { ...step, seconds } : step,
      ),
    )
  }

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return guidedExerciseList.filter((exercise) => {
      const needsKit = (exercise.equipment ?? []).length > 0
      if (pickerCategory === 'equipment' && !needsKit) {
        return false
      }
      if (pickerCategory === 'none' && needsKit) {
        return false
      }
      if (!query) {
        return true
      }
      return (
        exercise.name.toLowerCase().includes(query) ||
        translateGuidedText(exercise.name).toLowerCase().includes(query) ||
        (exercise.equipment ?? []).some((item) => item.toLowerCase().includes(query))
      )
    })
  }, [pickerCategory, search])

  function save() {
    if (!canSave) {
      return
    }
    if (!onSave(draft)) {
      setSaveFailed(true)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-label={t(existing ? 'guided.builderEditTitle' : 'guided.builderTitle')}
        aria-modal="true"
        className="workout-detail-modal guided-builder"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('guided.builderEyebrow')}</p>
            <h2>{t(existing ? 'guided.builderEditTitle' : 'guided.builderTitle')}</h2>
          </div>
          <button
            aria-label={t('guided.builderCancel')}
            className="modal-close-button"
            onClick={onCancel}
            type="button"
          >
            <X size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        {/* What the session currently adds up to, recomputed on every edit. */}
        <div className="summary-grid">
          <div className="summary-stat">
            <strong>{formatGuidedClock(timeline.totalSeconds)}</strong>
            <span>{t('guided.totalTime')}</span>
          </div>
          <div className="summary-stat">
            <strong>{draft.steps.length}</strong>
            <span>{t('guided.builderMoves')}</span>
          </div>
          <div className="summary-stat">
            <strong>{timeline.totalWorkSteps}</strong>
            <span>{t('guided.builderTotalSteps')}</span>
          </div>
        </div>

        <label className="checkin-field guided-builder__name">
          <span>{t('guided.builderName')}</span>
          <input
            className="checkin-input"
            maxLength={60}
            onChange={(event) => update({ name: event.target.value })}
            placeholder={t('guided.builderNamePlaceholder')}
            type="text"
            value={draft.name}
          />
        </label>

        <div className="guided-builder__row">
          <span className="guided-builder__label">{t('guided.builderCategory')}</span>
          <div className="guided-cues__row">
            {guidedCategories.map((category) => {
              const on = draft.categoryId === category.id

              return (
                <button
                  aria-pressed={on}
                  className={`guided-chip${on ? ' guided-chip--on' : ''}`}
                  key={category.id}
                  onClick={() => update({ categoryId: category.id })}
                  type="button"
                >
                  {translateGuidedText(category.name)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="guided-builder__row">
          <span className="guided-builder__label">{t('guided.builderLevel')}</span>
          <div className="guided-cues__row">
            {levels.map((level) => {
              const on = draft.level === level

              return (
                <button
                  aria-pressed={on}
                  className={`guided-chip${on ? ' guided-chip--on' : ''}`}
                  key={level}
                  onClick={() => update({ level })}
                  type="button"
                >
                  {t(levelKeys[level])}
                </button>
              )
            })}
          </div>
        </div>

        <div className="guided-builder__timing">
          <Stepper
            label={t('guided.builderWork')}
            max={customWorkoutLimits.work.max}
            min={customWorkoutLimits.work.min}
            onChange={(workSeconds) => update({ workSeconds })}
            step={5}
            suffix="s"
            value={draft.workSeconds}
          />
          <Stepper
            label={t('guided.builderRest')}
            max={customWorkoutLimits.rest.max}
            min={customWorkoutLimits.rest.min}
            onChange={(restSeconds) => update({ restSeconds })}
            step={5}
            suffix="s"
            value={draft.restSeconds}
          />
          <Stepper
            label={t('guided.builderRounds')}
            max={customWorkoutLimits.rounds.max}
            min={customWorkoutLimits.rounds.min}
            onChange={(rounds) => update({ rounds })}
            step={1}
            value={draft.rounds ?? 1}
          />
          <Stepper
            label={t('guided.builderRoundRest')}
            max={customWorkoutLimits.rest.max}
            min={customWorkoutLimits.rest.min}
            onChange={(roundRestSeconds) => update({ roundRestSeconds })}
            step={5}
            suffix="s"
            value={draft.roundRestSeconds ?? draft.restSeconds}
          />
          <Stepper
            label={t('guided.builderPrepare')}
            max={customWorkoutLimits.rest.max}
            min={0}
            onChange={(prepareSeconds) => update({ prepareSeconds })}
            step={5}
            suffix="s"
            value={draft.prepareSeconds ?? 0}
          />
        </div>

        {/* The session so far, in the order it will run. */}
        <section className="guided-builder__section">
          <div className="section-title">
            <h2>{t('guided.builderOrder')}</h2>
            <span>{draft.steps.length}</span>
          </div>

          {draft.steps.length === 0 ? (
            <p className="guided-builder__empty">{t('guided.builderEmpty')}</p>
          ) : (
            <ol className="guided-builder__steps">
              {draft.steps.map((step, index) => {
                const exercise = resolveGuidedStepExercise(step)
                if (!exercise) {
                  return null
                }

                return (
                  <li key={`${step.exerciseId}-${index}`}>
                    <span className="guided-builder__position" aria-hidden="true">
                      {index + 1}
                    </span>
                    <GuidedStepMedia
                      className="guided-media--thumb"
                      exercise={exercise}
                      variant="still"
                    />
                    <div className="guided-builder__step-text">
                      <strong>{translateGuidedText(exercise.name)}</strong>
                      <label>
                        <span className="visually-hidden">
                          {t('guided.builderStepSeconds', {
                            name: translateGuidedText(exercise.name),
                          })}
                        </span>
                        <input
                          className="checkin-input guided-builder__seconds"
                          inputMode="numeric"
                          max={customWorkoutLimits.work.max}
                          min={customWorkoutLimits.work.min}
                          onChange={(event) => {
                            const raw = event.target.value.trim()
                            setStepSeconds(
                              index,
                              raw === '' ? undefined : Number(raw),
                            )
                          }}
                          placeholder={String(draft.workSeconds)}
                          type="number"
                          value={step.seconds ?? ''}
                        />
                        <small>{t('guided.builderSecondsHint')}</small>
                      </label>
                    </div>
                    <div className="guided-builder__step-tools">
                      <button
                        aria-label={t('guided.builderMoveUp')}
                        className="guided-icon-button"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        type="button"
                      >
                        <ArrowUp size={15} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                      <button
                        aria-label={t('guided.builderMoveDown')}
                        className="guided-icon-button"
                        disabled={index === draft.steps.length - 1}
                        onClick={() => move(index, 1)}
                        type="button"
                      >
                        <ArrowDown size={15} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                      <button
                        aria-label={t('guided.builderRemove', {
                          name: translateGuidedText(exercise.name),
                        })}
                        className="guided-icon-button guided-icon-button--danger"
                        onClick={() => remove(index)}
                        type="button"
                      >
                        <Trash2 size={15} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        {/* The whole movement library, searchable. */}
        <section className="guided-builder__section">
          <div className="section-title">
            <h2>{t('guided.builderAdd')}</h2>
            <span>{matches.length}</span>
          </div>

          <div className="guided-builder__search">
            <Search size={16} strokeWidth={2.4} aria-hidden="true" />
            <input
              aria-label={t('guided.builderSearch')}
              className="checkin-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('guided.builderSearchPlaceholder')}
              type="search"
              value={search}
            />
          </div>

          <div className="guided-cues__row">
            {(
              [
                ['all', 'guided.builderFilterAll'],
                ['none', 'guided.builderFilterBodyweight'],
                ['equipment', 'guided.builderFilterEquipment'],
              ] as const
            ).map(([value, labelKey]) => {
              const on = pickerCategory === value

              return (
                <button
                  aria-pressed={on}
                  className={`guided-chip${on ? ' guided-chip--on' : ''}`}
                  key={value}
                  onClick={() => setPickerCategory(value)}
                  type="button"
                >
                  {t(labelKey)}
                </button>
              )
            })}
          </div>

          {matches.length === 0 ? (
            <p className="guided-builder__empty">{t('guided.builderNoResults')}</p>
          ) : (
            <ul className="guided-builder__library">
              {matches.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    aria-label={t('guided.builderAddAria', {
                      name: translateGuidedText(exercise.name),
                    })}
                    className="guided-builder__add"
                    onClick={() => addExercise(exercise)}
                    type="button"
                  >
                    <GuidedStepMedia
                      className="guided-media--thumb"
                      exercise={exercise}
                      variant="still"
                    />
                    <span className="guided-builder__add-text">
                      <strong>{translateGuidedText(exercise.name)}</strong>
                      <small>
                        {(exercise.equipment ?? []).length > 0
                          ? exercise.equipment?.join(', ')
                          : t('guided.noEquipment')}
                      </small>
                    </span>
                    <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {saveFailed ? (
          <p className="guided-finish__saved guided-finish__saved--error" role="alert">
            {t('guided.builderSaveFailed')}
          </p>
        ) : null}

        <div className="guided-builder__actions">
          <button
            className="workout-primary-button"
            disabled={!canSave}
            onClick={save}
            type="button"
          >
            <Check size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('guided.builderSave')}
          </button>
          <button className="workout-secondary-button" onClick={onCancel} type="button">
            {t('guided.builderCancel')}
          </button>
          {existing ? (
            <button
              className="guided-builder__delete"
              onClick={() => onDelete(draft)}
              type="button"
            >
              <Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />
              {t('guided.builderDelete')}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}

interface StepperProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}

/** A number you nudge rather than type, because it is set with a thumb. */
function Stepper({ label, max, min, onChange, step, suffix, value }: StepperProps) {
  const t = useT()
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div className="guided-stepper">
      <span className="guided-stepper__label">{label}</span>
      <div className="guided-stepper__control">
        <button
          aria-label={t('guided.builderDecrease', { label })}
          className="guided-icon-button"
          disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}
          type="button"
        >
          <Minus size={14} strokeWidth={3} aria-hidden="true" />
        </button>
        <strong>
          {value}
          {suffix ?? ''}
        </strong>
        <button
          aria-label={t('guided.builderIncrease', { label })}
          className="guided-icon-button"
          disabled={value >= max}
          onClick={() => onChange(clamp(value + step))}
          type="button"
        >
          <Plus size={14} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

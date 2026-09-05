import { Clock3, Layers, ListChecks, Play, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GuidedStepMedia } from '../components/GuidedStepMedia'
import { GuidedTimelineList } from '../components/GuidedTimelineList'
import {
  GuidedWorkoutPlayer,
  type GuidedSaveOutcome,
} from '../components/GuidedWorkoutPlayer'
import { useAuth } from '../context/AuthContext'
import { guidedCategories, type GuidedCategoryId, type GuidedLevel, type GuidedWorkout } from '../data/guidedWorkouts'
import { saveWorkoutSession } from '../data/workoutSessions'
import { useT, type MessageKey } from '../i18n'
import * as workoutService from '../services/workoutService'
import { isSpeechSupported, primeSpeech } from '../utils/guidedAudio'
import {
  defaultGuidedSettings,
  getGuidedSettings,
  saveGuidedSettings,
  type GuidedSettings,
} from '../utils/guidedSettings'
import {
  buildGuidedTimeline,
  buildGuidedWorkoutSession,
  formatGuidedClock,
  getGuidedWorkoutExercises,
  getGuidedWorkoutMinutes,
  getGuidedWorkoutSummary,
  getGuidedWorkoutsByCategory,
  translateGuidedText,
  type GuidedTimelineStep,
} from '../utils/guidedWorkoutUtils'
import { unlockAudio } from '../utils/timerFeedback'

type Filter = GuidedCategoryId | 'all'

const levelKeys: Record<GuidedLevel, MessageKey> = {
  Advanced: 'guided.levelAdvanced',
  Beginner: 'guided.levelBeginner',
  Intermediate: 'guided.levelIntermediate',
}

/**
 * Guided workouts: pick a category, pick a session, press play.
 *
 * Everything on this screen is derived from `guidedWorkouts` - the categories,
 * the cards, the durations, the timeline in the detail sheet. Adding a workout
 * to that file adds it here, with no change to this component.
 */
export function GuidedWorkouts() {
  const t = useT()
  const { user } = useAuth()
  const [filter, setFilter] = useState<Filter>('all')
  const [detail, setDetail] = useState<GuidedWorkout | null>(null)
  const [active, setActive] = useState<GuidedWorkout | null>(null)
  const [settings, setSettings] = useState<GuidedSettings>(
    () => getGuidedSettings() ?? defaultGuidedSettings,
  )
  // Read once: a browser either has speech voices or it does not, and the
  // toggle should say so rather than silently doing nothing.
  const speechSupported = useMemo(() => isSpeechSupported(), [])

  const workouts = useMemo(() => getGuidedWorkoutsByCategory(filter), [filter])

  function updateSettings(next: GuidedSettings) {
    setSettings(next)
    saveGuidedSettings(next)
  }

  /**
   * A finished session, written to the same history everything else uses so it
   * shows up in Progress and the weekly review. Only the steps that actually
   * ran to zero are logged - a skipped movement is not something you did.
   */
  const handleComplete = useCallback(
    (
      completedWorkSteps: GuidedTimelineStep[],
      startedAt: Date,
      finishedAt: Date,
    ): GuidedSaveOutcome => {
      if (!active || completedWorkSteps.length === 0) {
        return 'empty'
      }

      const session = buildGuidedWorkoutSession(
        active,
        completedWorkSteps,
        startedAt,
        finishedAt,
      )
      if (!saveWorkoutSession(session)) {
        return 'error'
      }

      // Local history is already written; the cloud copy follows in the
      // background and must never hold up the finish screen.
      void workoutService.saveWorkoutSession(user, session).catch(() => undefined)
      return 'saved'
    },
    [active, user],
  )

  function start(workout: GuidedWorkout) {
    // The tap that starts a workout is the one moment the browser will unlock
    // the chime and the speech voice for everything that follows.
    unlockAudio()
    if (settings.voice) {
      primeSpeech()
    }
    setDetail(null)
    setActive(workout)
  }

  if (active) {
    return (
      <GuidedWorkoutPlayer
        key={active.id}
        onComplete={handleComplete}
        onExit={() => setActive(null)}
        onSettingsChange={updateSettings}
        settings={settings}
        workout={active}
      />
    )
  }

  return (
    <section className="guided-page">
      <header className="guided-page__head">
        <h1>{t('guided.title')}</h1>
        <p>{t('guided.subtitle')}</p>
      </header>

      <div className="guided-filters" role="group" aria-label={t('guided.categoriesAria')}>
        <button
          aria-pressed={filter === 'all'}
          className={`guided-filter${filter === 'all' ? ' guided-filter--on' : ''}`}
          onClick={() => setFilter('all')}
          type="button"
        >
          {t('guided.allCategories')}
        </button>
        {guidedCategories.map((category) => {
          const Icon = category.icon
          const on = filter === category.id

          return (
            <button
              aria-pressed={on}
              className={`guided-filter${on ? ' guided-filter--on' : ''}`}
              data-accent={category.id}
              key={category.id}
              onClick={() => setFilter(category.id)}
              type="button"
            >
              <Icon size={15} strokeWidth={2.4} aria-hidden="true" />
              {translateGuidedText(category.name)}
            </button>
          )
        })}
      </div>

      {workouts.length === 0 ? (
        <article className="today-empty">
          <p>{t('guided.empty')}</p>
        </article>
      ) : (
        <div className="guided-grid" aria-label={t('guided.workoutsAria')}>
          {workouts.map((workout) => (
            <GuidedWorkoutCard
              key={workout.id}
              onOpen={() => setDetail(workout)}
              workout={workout}
            />
          ))}
        </div>
      )}

      {/* Below the list rather than above it: the workouts are what the screen
          is for, and the cues are a once-a-year setting that the player also
          carries a switch for. */}
      <GuidedCueSettings
        onChange={updateSettings}
        settings={settings}
        speechSupported={speechSupported}
      />

      {detail ? (
        <GuidedWorkoutDetail
          onClose={() => setDetail(null)}
          onStart={() => start(detail)}
          workout={detail}
        />
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Cue settings
// ---------------------------------------------------------------------------

interface GuidedCueSettingsProps {
  settings: GuidedSettings
  speechSupported: boolean
  onChange: (settings: GuidedSettings) => void
}

const cueLabels: { key: keyof GuidedSettings; labelKey: MessageKey }[] = [
  { key: 'sound', labelKey: 'guided.cueSound' },
  { key: 'voice', labelKey: 'guided.cueVoice' },
  { key: 'vibration', labelKey: 'guided.cueVibration' },
  { key: 'keepAwake', labelKey: 'guided.cueKeepAwake' },
]

function GuidedCueSettings({
  onChange,
  settings,
  speechSupported,
}: GuidedCueSettingsProps) {
  const t = useT()

  return (
    <section className="guided-cues">
      <p className="eyebrow">{t('guided.cuesHeading')}</p>
      <div className="guided-cues__row">
        {cueLabels.map(({ key, labelKey }) => {
          const disabled = key === 'voice' && !speechSupported
          const on = settings[key] && !disabled

          return (
            <button
              aria-pressed={on}
              className={`guided-chip${on ? ' guided-chip--on' : ''}`}
              disabled={disabled}
              key={key}
              onClick={() => onChange({ ...settings, [key]: !settings[key] })}
              type="button"
            >
              {t(labelKey)}
            </button>
          )
        })}
      </div>
      {!speechSupported ? <small>{t('guided.voiceUnsupported')}</small> : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Workout card
// ---------------------------------------------------------------------------

interface GuidedWorkoutCardProps {
  workout: GuidedWorkout
  onOpen: () => void
}

function GuidedWorkoutCard({ onOpen, workout }: GuidedWorkoutCardProps) {
  const t = useT()
  const summary = useMemo(() => getGuidedWorkoutSummary(workout), [workout])
  const first = useMemo(() => getGuidedWorkoutExercises(workout)[0] ?? null, [workout])

  return (
    <button
      className="guided-card"
      data-accent={workout.categoryId}
      onClick={onOpen}
      type="button"
    >
      {first ? (
        <GuidedStepMedia
          className="guided-media--card"
          exercise={first}
          variant="still"
        />
      ) : null}

      <div className="guided-card__text">
        <p className="eyebrow">{t(levelKeys[workout.level])}</p>
        <h3>{translateGuidedText(workout.name)}</h3>
        <p className="guided-card__copy">{translateGuidedText(workout.description)}</p>

        <p className="guided-card__pills">
          <span>
            <Clock3 size={13} strokeWidth={2.4} aria-hidden="true" />
            {t('guided.minutes', {
              count: getGuidedWorkoutMinutes(summary.totalSeconds),
            })}
          </span>
          <span>
            <ListChecks size={13} strokeWidth={2.4} aria-hidden="true" />
            {t('guided.moveCount', { count: summary.exerciseCount })}
          </span>
          {summary.rounds > 1 ? (
            <span>
              <Layers size={13} strokeWidth={2.4} aria-hidden="true" />
              {t('guided.roundCount', { count: summary.rounds })}
            </span>
          ) : null}
          {summary.lowImpact ? <span>{t('guided.lowImpact')}</span> : null}
        </p>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Detail sheet
// ---------------------------------------------------------------------------

interface GuidedWorkoutDetailProps {
  workout: GuidedWorkout
  onClose: () => void
  onStart: () => void
}

function GuidedWorkoutDetail({
  onClose,
  onStart,
  workout,
}: GuidedWorkoutDetailProps) {
  const t = useT()
  const timeline = useMemo(() => buildGuidedTimeline(workout), [workout])
  const summary = useMemo(() => getGuidedWorkoutSummary(workout), [workout])
  const exercises = useMemo(() => getGuidedWorkoutExercises(workout), [workout])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        aria-label={t('guided.detailAria')}
        aria-modal="true"
        className="workout-detail-modal guided-detail"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t(levelKeys[workout.level])}</p>
            <h2>{translateGuidedText(workout.name)}</h2>
            <p>{translateGuidedText(workout.description)}</p>
          </div>
          <button
            aria-label={t('guided.close')}
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <div className="summary-grid">
          <div className="summary-stat">
            <strong>{formatGuidedClock(summary.totalSeconds)}</strong>
            <span>{t('guided.totalTime')}</span>
          </div>
          <div className="summary-stat">
            <strong>{formatGuidedClock(summary.workSeconds)}</strong>
            <span>{t('guided.workTime')}</span>
          </div>
          <div className="summary-stat">
            <strong>{formatGuidedClock(summary.restSeconds)}</strong>
            <span>{t('guided.restTime')}</span>
          </div>
        </div>

        <p className="guided-detail__tags">
          {summary.equipment.length > 0 ? (
            summary.equipment.map((item) => <span key={item}>{item}</span>)
          ) : (
            <span>{t('guided.noEquipment')}</span>
          )}
          {summary.lowImpact ? <span>{t('guided.lowImpact')}</span> : null}
          {(workout.focus ?? []).map((item) => (
            <span key={item}>{translateGuidedText(item)}</span>
          ))}
        </p>

        <button className="workout-primary-button" onClick={onStart} type="button">
          <Play size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('guided.start')}
        </button>

        <section className="guided-detail__section">
          <div className="section-title">
            <h2>{t('guided.movesHeading')}</h2>
            <span>{exercises.length}</span>
          </div>
          <ul className="guided-move-list">
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <GuidedStepMedia
                  className="guided-media--thumb"
                  exercise={exercise}
                  variant="still"
                />
                <div>
                  <strong>{translateGuidedText(exercise.name)}</strong>
                  <small>{translateGuidedText(exercise.cue, exercise.name)}</small>
                  <ul className="guided-move-list__how">
                    {exercise.instructions.map((line) => (
                      <li key={line}>{translateGuidedText(line, exercise.name)}</li>
                    ))}
                  </ul>
                  {exercise.mediaNote ? (
                    <small className="guided-move-list__note">
                      {t('guided.mediaNote', { note: exercise.mediaNote })}
                    </small>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="guided-detail__section">
          <div className="section-title">
            <h2>{t('guided.timelineHeading')}</h2>
            <span>{timeline.steps.length}</span>
          </div>
          <p className="guided-detail__hint">{t('guided.timelineSub')}</p>
          <GuidedTimelineList timeline={timeline} />
        </section>
      </section>
    </div>
  )
}

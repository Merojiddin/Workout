import {
  ChevronDown,
  ListChecks,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GuidedExercise } from '../data/guidedExercises'
import type { GuidedWorkout } from '../data/guidedWorkouts'
import { useGuidedTimeline } from '../hooks/useGuidedTimeline'
import { useWakeLock } from '../hooks/useWakeLock'
import { useT } from '../i18n'
import { t as translate } from '../i18n/t'
import {
  playCueAudio,
  primeSpeech,
  speak,
  stopAllGuidedAudio,
} from '../utils/guidedAudio'
import type { GuidedSettings } from '../utils/guidedSettings'
import {
  buildGuidedTimeline,
  formatGuidedClock,
  translateGuidedText,
  type GuidedTimelineStep,
} from '../utils/guidedWorkoutUtils'
import {
  playCountdownTick,
  playPhaseCue,
  unlockAudio,
  vibratePhaseCue,
} from '../utils/timerFeedback'
import { GuidedStepMedia } from './GuidedStepMedia'
import { GuidedTimelineList } from './GuidedTimelineList'

/**
 * What became of the finished session. `empty` is its own outcome rather than
 * a failure: a workout ended before a single movement ran through has nothing
 * to log, and saying storage failed would be a lie.
 */
export type GuidedSaveOutcome = 'saved' | 'empty' | 'error'

interface GuidedWorkoutPlayerProps {
  workout: GuidedWorkout
  settings: GuidedSettings
  onSettingsChange: (settings: GuidedSettings) => void
  /** Leaves the player without finishing. */
  onExit: () => void
  /**
   * The session ended. Returns what happened to it, which is the only thing
   * the finish screen claims.
   */
  onComplete: (
    completedWorkSteps: GuidedTimelineStep[],
    startedAt: Date,
    finishedAt: Date,
  ) => GuidedSaveOutcome
}

/** The last few seconds of a step, when the chime counts you in. */
const COUNT_IN_FROM = 3

/**
 * The guided workout, running.
 *
 * Its own full-screen layer, like the live strength workout: a fixed header,
 * a body that shows whichever kind of step is on - a movement, a rest, the
 * get-ready countdown - and a dock of controls that never moves. All three
 * read from one flat timeline, so the whole session is one continuous run
 * rather than a screen per exercise.
 */
export function GuidedWorkoutPlayer({
  onComplete,
  onExit,
  onSettingsChange,
  settings,
  workout,
}: GuidedWorkoutPlayerProps) {
  const t = useT()
  const timeline = useMemo(() => buildGuidedTimeline(workout), [workout])
  const [startedAt, setStartedAt] = useState(() => new Date())
  const [listOpen, setListOpen] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [outcome, setOutcome] = useState<GuidedSaveOutcome | null>(null)
  const [finishedAt, setFinishedAt] = useState<Date | null>(null)

  // Settings are read inside timer callbacks that must not be rebuilt on every
  // toggle, so the callbacks read the current value through a ref.
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  // Which of an exercise's own cues have already been read on this step.
  const firedCuesRef = useRef(new Set<string>())

  const say = useCallback((line: string) => {
    if (settingsRef.current.voice) {
      speak(line)
    }
  }, [])

  /**
   * What the player does at the moment a step comes on screen: the tone, the
   * buzz, and the line the voice reads. An exercise carrying its own recorded
   * voiceover plays that instead of the spoken name and cue.
   */
  const handleStepStart = useCallback(
    (step: GuidedTimelineStep) => {
      firedCuesRef.current = new Set()
      const cueKind = step.kind === 'work' ? 'work' : 'rest'

      if (settingsRef.current.sound) {
        playPhaseCue(cueKind)
      }
      if (settingsRef.current.vibration) {
        vibratePhaseCue(cueKind)
      }
      if (!settingsRef.current.voice) {
        return
      }

      if (step.kind === 'prepare') {
        say(
          translate('guided.say.getReady', {
            name: step.next ? translateGuidedText(step.next.name) : '',
          }),
        )
        return
      }

      if (step.kind === 'work' && step.exercise) {
        if (step.exercise.audioUrl) {
          playCueAudio(step.exercise.audioUrl)
          return
        }
        say(
          translate('guided.say.starting', {
            cue: translateGuidedText(step.cue, step.exercise.name),
            name: translateGuidedText(step.exercise.name),
          }),
        )
        return
      }

      const nextName = step.next ? translateGuidedText(step.next.name) : ''
      if (step.kind === 'round-rest') {
        say(
          translate('guided.say.roundBreak', { name: nextName, round: step.round }),
        )
        return
      }

      say(
        nextName
          ? translate('guided.say.restNext', { name: nextName })
          : translate('guided.say.rest'),
      )
    },
    [say],
  )

  /**
   * Once a second while a step runs: the count-in chime over the last three
   * seconds, and whatever the exercise itself has to say part-way through.
   */
  const handleSecond = useCallback(
    (remaining: number, step: GuidedTimelineStep) => {
      if (remaining <= COUNT_IN_FROM && remaining > 0 && settingsRef.current.sound) {
        playCountdownTick()
      }

      if (step.kind !== 'work' || !step.exercise || !settingsRef.current.voice) {
        return
      }

      const elapsed = step.seconds - remaining
      const halfway = Math.round(step.seconds / 2)

      if (elapsed === halfway && remaining > COUNT_IN_FROM) {
        if (step.exercise.perSide) {
          say(translate('guided.say.switchSides'))
          return
        }
        if (step.seconds >= 40) {
          say(translate('guided.say.halfway'))
          return
        }
      }

      for (const cue of step.exercise.audioCues ?? []) {
        const key = `${cue.at}:${cue.say}`
        if (cue.at === elapsed && !firedCuesRef.current.has(key)) {
          firedCuesRef.current.add(key)
          say(translateGuidedText(cue.say, step.exercise.name))
        }
      }
    },
    [say],
  )

  const handleComplete = useCallback(
    (completed: GuidedTimelineStep[]) => {
      const at = new Date()
      setFinishedAt(at)
      setOutcome(onComplete(completed, startedAt, at))

      if (settingsRef.current.sound) {
        playPhaseCue('finish')
      }
      if (settingsRef.current.vibration) {
        vibratePhaseCue('finish')
      }
      if (settingsRef.current.voice) {
        speak(translate('guided.say.finished'))
      }
    },
    [onComplete, startedAt],
  )

  const timer = useGuidedTimeline({
    onComplete: handleComplete,
    onSecond: handleSecond,
    onStepStart: handleStepStart,
    timeline,
  })

  useWakeLock(settings.keepAwake && timer.running && !timer.finished)

  // Nothing should still be talking once the player is gone - a skipped step,
  // a paused workout and leaving the screen all cut the voice off.
  useEffect(() => stopAllGuidedAudio, [])
  useEffect(() => {
    // Finishing stops the clock too, and its "workout complete" line is spoken
    // in the same commit: cutting the voice off on `!running` alone would
    // silence the one cue that matters most.
    if (!timer.running && !timer.finished) {
      stopAllGuidedAudio()
    }
  }, [timer.finished, timer.running])

  function toggleSetting(key: keyof GuidedSettings) {
    // Turning sound or voice back on happens inside a tap, which is the only
    // moment the browser will let either be unlocked.
    if (!settings[key]) {
      unlockAudio()
      primeSpeech()
    } else if (key === 'voice') {
      stopAllGuidedAudio()
    }
    onSettingsChange({ ...settings, [key]: !settings[key] })
  }

  function exit() {
    if (!timer.finished && timer.completedWorkSteps.length > 0) {
      if (!window.confirm(t('guided.player.exitConfirm'))) {
        return
      }
    }
    stopAllGuidedAudio()
    onExit()
  }

  function endEarly() {
    timer.pause()
    if (!window.confirm(t('guided.player.finishConfirm'))) {
      return
    }
    stopAllGuidedAudio()
    timer.finishNow()
  }

  if (timer.finished) {
    return (
      <GuidedFinishScreen
        completedWorkSteps={timer.completedWorkSteps}
        finishedAt={finishedAt}
        onDone={onExit}
        onRestart={() => {
          setOutcome(null)
          setFinishedAt(null)
          // A second run is a second session: it has its own clock, and its
          // own row in the history if it is finished.
          setStartedAt(new Date())
          unlockAudio()
          primeSpeech()
          timer.restart()
        }}
        outcome={outcome}
        rounds={timeline.rounds}
        startedAt={startedAt}
        workout={workout}
      />
    )
  }

  const step = timer.step
  if (!step) {
    return null
  }

  const resting = step.kind !== 'work'
  const upcoming = resting ? step.next : step.exercise
  const isLastMove =
    step.kind === 'work' && step.workIndex === timeline.totalWorkSteps

  return (
    <section
      className={`guided-player${resting ? ' guided-player--rest' : ''}`}
      data-accent={workout.categoryId}
    >
      <header className="guided-player__header">
        <div className="guided-player__bar">
          <button
            aria-label={t('guided.player.exitAria')}
            className="live-header__exit"
            onClick={exit}
            type="button"
          >
            <ChevronDown size={19} strokeWidth={2.6} aria-hidden="true" />
          </button>

          <span className="guided-player__name">
            {translateGuidedText(workout.name)}
          </span>

          {timeline.rounds > 1 ? (
            <span className="live-header__count">
              {t('guided.player.roundOf', {
                current: step.round,
                total: timeline.rounds,
              })}
            </span>
          ) : null}

          <span className="live-header__timer">
            {t('guided.player.timeLeft', {
              time: formatGuidedClock(timer.remainingSeconds),
            })}
          </span>
        </div>

        <div
          aria-label={t('guided.player.progressAria')}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(timer.progress * 100)}
          className="live-header__progress"
          role="progressbar"
        >
          <span style={{ width: `${timer.progress * 100}%` }} />
        </div>
      </header>

      <div className="guided-player__body">
        {resting ? (
          <RestPanel
            addSeconds={timer.addSeconds}
            countdown={timer.remaining}
            kind={step.kind}
            paused={!timer.running}
            total={step.seconds}
            upcoming={upcoming}
          />
        ) : (
          <WorkPanel
            countdown={timer.remaining}
            exercise={step.exercise}
            isLastMove={isLastMove}
            next={step.next}
            paused={!timer.running}
            position={t('guided.player.moveOf', {
              current: step.workIndex,
              total: timeline.totalWorkSteps,
            })}
            showInstructions={showInstructions}
            step={step}
            total={step.seconds}
            onToggleInstructions={() => setShowInstructions((open) => !open)}
          />
        )}
      </div>

      {listOpen ? (
        <div className="guided-player__list">
          <GuidedTimelineList
            activeIndex={timer.stepIndex}
            onSelect={(index) => {
              timer.jumpTo(index)
              setListOpen(false)
            }}
            timeline={timeline}
          />
        </div>
      ) : null}

      <div className="guided-player__dock">
        <div className="guided-player__controls">
          <button
            aria-label={t('guided.player.previousAria')}
            className="guided-control"
            onClick={timer.previous}
            type="button"
          >
            <SkipBack size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>{t('guided.player.previous')}</span>
          </button>

          <button
            className="guided-control guided-control--primary"
            onClick={() => {
              unlockAudio()
              primeSpeech()
              timer.toggle()
            }}
            type="button"
          >
            {timer.running ? (
              <>
                <Pause size={24} strokeWidth={2.5} aria-hidden="true" />
                <span>{t('guided.player.pause')}</span>
              </>
            ) : (
              <>
                <Play size={24} strokeWidth={2.5} aria-hidden="true" />
                <span>{t('guided.player.resume')}</span>
              </>
            )}
          </button>

          <button
            aria-label={t('guided.player.skipAria')}
            className="guided-control"
            onClick={timer.next}
            type="button"
          >
            <SkipForward size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>{t('guided.player.skip')}</span>
          </button>
        </div>

        <div className="guided-player__tools">
          <button
            aria-pressed={listOpen}
            className={`guided-tool${listOpen ? ' guided-tool--on' : ''}`}
            onClick={() => setListOpen((open) => !open)}
            type="button"
          >
            <ListChecks size={15} strokeWidth={2.4} aria-hidden="true" />
            {t('guided.timelineHeading')}
          </button>

          <button
            aria-pressed={settings.voice}
            className={`guided-tool${settings.voice ? ' guided-tool--on' : ''}`}
            onClick={() => toggleSetting('voice')}
            type="button"
          >
            {settings.voice ? (
              <Volume2 size={15} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <VolumeX size={15} strokeWidth={2.4} aria-hidden="true" />
            )}
            {t('guided.cueVoice')}
          </button>

          <button className="guided-tool" onClick={endEarly} type="button">
            <Square size={14} strokeWidth={2.6} aria-hidden="true" />
            {t('guided.player.finishEarly')}
          </button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Step panels
// ---------------------------------------------------------------------------

interface CountdownRingProps {
  seconds: number
  total: number
  paused: boolean
  tone: 'work' | 'rest'
}

/**
 * The big clock. Deliberately the largest thing on the screen: it is read
 * from a mat, upside down, in the middle of a set of mountain climbers.
 */
function CountdownRing({ paused, seconds, total, tone }: CountdownRingProps) {
  const t = useT()
  const fraction = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0
  const radius = 46
  const circumference = 2 * Math.PI * radius

  return (
    <div className={`guided-ring guided-ring--${tone}${paused ? ' guided-ring--paused' : ''}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="guided-ring__track" cx="50" cy="50" r={radius} />
        <circle
          className="guided-ring__value"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <div className="guided-ring__label">
        <strong aria-live="off">{formatGuidedClock(seconds)}</strong>
        {paused ? <small>{t('guided.player.paused')}</small> : null}
      </div>
    </div>
  )
}

interface WorkPanelProps {
  countdown: number
  exercise: GuidedExercise | null
  isLastMove: boolean
  next: GuidedExercise | null
  paused: boolean
  position: string
  showInstructions: boolean
  step: GuidedTimelineStep
  total: number
  onToggleInstructions: () => void
}

function WorkPanel({
  countdown,
  exercise,
  isLastMove,
  next,
  onToggleInstructions,
  paused,
  position,
  showInstructions,
  step,
  total,
}: WorkPanelProps) {
  const t = useT()
  if (!exercise) {
    return null
  }

  const name = translateGuidedText(exercise.name)

  return (
    <div className="guided-step">
      <GuidedStepMedia exercise={exercise} className="guided-media--player" />

      <div className="guided-step__head">
        <p className="eyebrow">{position}</p>
        <h1>{name}</h1>
        <p className="guided-step__cue">{translateGuidedText(step.cue, exercise.name)}</p>
        {exercise.perSide ? (
          <p className="guided-step__side">{t('guided.switchSidesHint')}</p>
        ) : null}
      </div>

      <CountdownRing paused={paused} seconds={countdown} total={total} tone="work" />

      <button
        aria-expanded={showInstructions}
        aria-label={t('guided.player.instructionsAria')}
        className="guided-step__how"
        onClick={onToggleInstructions}
        type="button"
      >
        {t('guided.player.instructions')}
      </button>

      {showInstructions ? (
        <ul className="guided-step__instructions">
          {exercise.instructions.map((line) => (
            <li key={line}>{translateGuidedText(line, exercise.name)}</li>
          ))}
        </ul>
      ) : null}

      <p className="guided-step__next">
        {isLastMove ? (
          t('guided.player.lastMove')
        ) : next ? (
          <>
            <span>{t('guided.player.nextUp')}</span>
            <strong>{translateGuidedText(next.name)}</strong>
          </>
        ) : null}
      </p>
    </div>
  )
}

interface RestPanelProps {
  addSeconds: (amount: number) => void
  countdown: number
  kind: GuidedTimelineStep['kind']
  paused: boolean
  total: number
  upcoming: GuidedExercise | null
}

/**
 * The rest screen. A separate screen rather than a badge on the exercise: what
 * you need during a rest is the clock and what is coming, not the movement you
 * have just finished.
 */
function RestPanel({
  addSeconds,
  countdown,
  kind,
  paused,
  total,
  upcoming,
}: RestPanelProps) {
  const t = useT()
  const title =
    kind === 'prepare'
      ? t('guided.stepPrepare')
      : kind === 'round-rest'
        ? t('guided.stepRoundRest')
        : t('guided.stepRest')

  return (
    <div className="guided-rest">
      <p className="eyebrow">{title}</p>
      <CountdownRing paused={paused} seconds={countdown} total={total} tone="rest" />

      {kind !== 'prepare' ? (
        <button
          aria-label={t('guided.player.addTimeAria')}
          className="guided-rest__add"
          onClick={() => addSeconds(20)}
          type="button"
        >
          <Plus size={15} strokeWidth={2.6} aria-hidden="true" />
          {t('guided.player.addTime')}
        </button>
      ) : null}

      {upcoming ? (
        <article className="guided-next">
          <GuidedStepMedia
            className="guided-media--thumb"
            exercise={upcoming}
            variant="still"
          />
          <div className="guided-next__text">
            <p className="eyebrow">{t('guided.player.nextUp')}</p>
            <strong>{translateGuidedText(upcoming.name)}</strong>
            <small>{translateGuidedText(upcoming.cue, upcoming.name)}</small>
          </div>
        </article>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Finish screen
// ---------------------------------------------------------------------------

interface GuidedFinishScreenProps {
  completedWorkSteps: GuidedTimelineStep[]
  finishedAt: Date | null
  onDone: () => void
  onRestart: () => void
  outcome: GuidedSaveOutcome | null
  rounds: number
  startedAt: Date
  workout: GuidedWorkout
}

function GuidedFinishScreen({
  completedWorkSteps,
  finishedAt,
  onDone,
  onRestart,
  outcome,
  rounds,
  startedAt,
  workout,
}: GuidedFinishScreenProps) {
  const t = useT()
  // Real elapsed time rather than the timeline's length: pausing, skipping and
  // ending early all make the session shorter or longer than it was planned.
  const elapsed = Math.max(
    0,
    Math.round(((finishedAt ?? new Date()).getTime() - startedAt.getTime()) / 1000),
  )
  const roundsDone = completedWorkSteps.reduce(
    (highest, step) => Math.max(highest, step.round),
    0,
  )

  return (
    <section className="workout-page guided-finish">
      <header className="guided-finish__head">
        <h1>{t('guided.finish.title')}</h1>
        <p>
          {t('guided.finish.subtitle', { name: translateGuidedText(workout.name) })}
        </p>
      </header>

      <div className="summary-grid">
        <div className="summary-stat">
          <strong>{formatGuidedClock(elapsed)}</strong>
          <span>{t('guided.finish.duration')}</span>
        </div>
        <div className="summary-stat">
          <strong>{completedWorkSteps.length}</strong>
          <span>{t('guided.finish.moves')}</span>
        </div>
        <div className="summary-stat">
          <strong>
            {roundsDone}/{rounds}
          </strong>
          <span>{t('guided.finish.rounds')}</span>
        </div>
      </div>

      {/* Silent when there was nothing to log: an empty session is not a
          failure, and there is no claim worth making about it. */}
      {outcome === 'saved' || outcome === 'error' ? (
        <p
          className={`guided-finish__saved${
            outcome === 'error' ? ' guided-finish__saved--error' : ''
          }`}
        >
          {outcome === 'saved' ? t('guided.finish.saved') : t('guided.finish.notSaved')}
        </p>
      ) : null}

      <div className="guided-finish__actions">
        <button className="workout-primary-button" onClick={onDone} type="button">
          {t('guided.finish.done')}
        </button>
        <button className="workout-secondary-button" onClick={onRestart} type="button">
          <RotateCcw size={17} strokeWidth={2.4} aria-hidden="true" />
          {t('guided.finish.again')}
        </button>
      </div>
    </section>
  )
}

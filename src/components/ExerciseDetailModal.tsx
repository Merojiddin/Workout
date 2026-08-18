import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Dumbbell,
  Lightbulb,
  ListOrdered,
  Signal,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Difficulty, LibraryExercise } from '../data/exerciseLibrary'
import {
  findProgramDay,
  getActiveWorkoutProgram,
  getDayLabel,
  type ActiveWorkoutProgram,
} from '../utils/activeWorkoutProgram'
import {
  getExerciseHistory,
  getExerciseTrend,
} from '../utils/exerciseHistoryUtils'
import { formatDuration } from '../utils/exerciseLoggingUtils'
import { getGeneralProgressionAdvice } from '../utils/progressionUtils'
import { ExerciseTrendChart } from './ExerciseTrendChart'
import { ExerciseMedia } from './ExerciseMedia'
import { ExerciseMediaEditor } from './ExerciseMediaEditor'
import { Tag, type TagVariant } from './Tag'

type DetailTab = 'info' | 'muscles' | 'history' | 'progress'

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'muscles', label: 'Muscles' },
  { id: 'history', label: 'History' },
  { id: 'progress', label: 'Progress' },
]

interface ExerciseDetailModalProps {
  exercise: LibraryExercise
  onClose: () => void
  /** When provided, the user can attach their own image / video link. */
  onUpdateExercise?: (exercise: LibraryExercise) => void
}

function difficultyVariant(difficulty: Difficulty): TagVariant {
  if (difficulty === 'Beginner') {
    return 'difficulty-beginner'
  }
  if (difficulty === 'Advanced') {
    return 'difficulty-advanced'
  }
  return 'difficulty-intermediate'
}

export function ExerciseDetailModal({
  exercise,
  onClose,
  onUpdateExercise,
}: ExerciseDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>('info')
  // Read once per open: history does not change while the sheet is on screen.
  const history = useMemo(
    () => getExerciseHistory(exercise.id, exercise.name),
    [exercise.id, exercise.name],
  )
  const trend = useMemo(() => getExerciseTrend(history), [history])
  const activeProgram = getActiveWorkoutProgram()
  const progressionAdvice = getGeneralProgressionAdvice({
    name: exercise.name,
    category: exercise.category,
    equipment: exercise.equipment,
    muscleGroup: exercise.postureFocus ? 'Posture' : undefined,
  })

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
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="exercise-detail-title"
        aria-modal="true"
        className="workout-detail-modal exercise-detail-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{exercise.category} · Form Guide</p>
            <h2 id="exercise-detail-title">{exercise.name}</h2>
            <p>{exercise.formCue}</p>
          </div>
          <button
            aria-label="Close exercise details"
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        {/* Four tabs instead of one long scroll: how to do it, what it works,
            what you have already done, and whether it is going anywhere. */}
        <div className="detail-tabs" role="tablist" aria-label="Exercise details">
          {DETAIL_TABS.map((item) => (
            <button
              aria-controls={`exercise-detail-panel-${item.id}`}
              aria-selected={tab === item.id}
              className={`detail-tab${tab === item.id ? ' detail-tab--active' : ''}`}
              id={`exercise-detail-tab-${item.id}`}
              key={item.id}
              onClick={() => setTab(item.id)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          aria-labelledby="exercise-detail-tab-info"
          hidden={tab !== 'info'}
          id="exercise-detail-panel-info"
          role="tabpanel"
        >
        <div className="exercise-detail-media">
          <ExerciseMedia exercise={exercise} showVideoDefault />
          {onUpdateExercise ? (
            <ExerciseMediaEditor
              exercise={exercise}
              onSave={(updates) => onUpdateExercise({ ...exercise, ...updates })}
            />
          ) : null}
        </div>

        {/* Level, category and kit, the three facts the mockup leads with. */}
        <div className="info-grid">
          <div className="info-cell">
            <Signal size={17} strokeWidth={2.2} aria-hidden="true" />
            <b>{exercise.difficulty}</b>
            <span>Level</span>
          </div>
          <div className="info-cell">
            <Dumbbell size={17} strokeWidth={2.2} aria-hidden="true" />
            <b>{exercise.category}</b>
            <span>Category</span>
          </div>
          <div className="info-cell">
            <ListOrdered size={17} strokeWidth={2.2} aria-hidden="true" />
            <b>{exercise.equipment[0] ?? 'None'}</b>
            <span>Equipment</span>
          </div>
        </div>

        <div className="exercise-detail-columns">
          <section className="exercise-detail-block">
            <h3>
              <ListOrdered size={18} strokeWidth={2.4} aria-hidden="true" />
              Instructions
            </h3>
            <ol className="exercise-detail-steps">
              {exercise.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
              Form tips
            </h3>
            <ul className="exercise-detail-list exercise-detail-list--good">
              {exercise.formTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <ShieldAlert size={18} strokeWidth={2.4} aria-hidden="true" />
              Common mistakes
            </h3>
            <ul className="exercise-detail-list exercise-detail-list--bad">
              {exercise.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <TrendingUp size={18} strokeWidth={2.4} aria-hidden="true" />
              Progression
            </h3>
            <ol className="exercise-detail-steps exercise-detail-steps--progress">
              {exercise.progression.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <TrendingDown size={18} strokeWidth={2.4} aria-hidden="true" />
              Regression (easier)
            </h3>
            <ol className="exercise-detail-steps exercise-detail-steps--progress">
              {exercise.regression.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <section className="exercise-detail-advice">
          <p className="eyebrow">
            <Lightbulb size={16} strokeWidth={2.4} aria-hidden="true" />
            Progression Advice
          </p>
          <ul>
            {progressionAdvice.map((advice) => (
              <li key={advice}>{advice}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-detail-posture">
          <p className="eyebrow">Posture &amp; arched-back notes</p>
          <p>{exercise.postureNotes}</p>
        </section>

        <div className="exercise-detail-footer">
          <section className="exercise-detail-block">
            <h3>
              <ExternalLink size={18} strokeWidth={2.4} aria-hidden="true" />
              Demo links
            </h3>
            <div className="exercise-detail-links">
              {exercise.demoLinks.map((link) => (
                <a
                  className="exercise-demo-link"
                  href={link.url}
                  key={link.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <CalendarDays size={18} strokeWidth={2.4} aria-hidden="true" />
              Related workout days
            </h3>
            {exercise.relatedWorkoutDays.length > 0 ? (
              <div className="tag-row">
                {exercise.relatedWorkoutDays.map((day) => (
                  <Tag key={day} variant="neutral">
                    {getRelatedDayLabel(activeProgram, day)}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="exercise-detail-muted">Optional / accessory work.</p>
            )}
          </section>
        </div>
        </div>

        <div
          aria-labelledby="exercise-detail-tab-muscles"
          hidden={tab !== 'muscles'}
          id="exercise-detail-panel-muscles"
          role="tabpanel"
        >
          <div className="exercise-detail-tags">
            <div className="exercise-detail-taggroup">
              <span className="exercise-card__label">Primary muscles</span>
              <div className="tag-row">
                {exercise.primaryMuscles.map((muscle) => (
                  <Tag key={muscle} variant="muscle">
                    {muscle}
                  </Tag>
                ))}
              </div>
            </div>
            {exercise.secondaryMuscles.length > 0 ? (
              <div className="exercise-detail-taggroup">
                <span className="exercise-card__label">Secondary muscles</span>
                <div className="tag-row">
                  {exercise.secondaryMuscles.map((muscle) => (
                    <Tag key={muscle} variant="secondary-muscle">
                      {muscle}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="exercise-detail-taggroup">
              <span className="exercise-card__label">Equipment</span>
              <div className="tag-row">
                {exercise.equipment.map((item) => (
                  <Tag key={item} variant="equipment">
                    {item}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="exercise-detail-taggroup">
              <span className="exercise-card__label">Difficulty</span>
              <div className="tag-row">
                <Tag variant={difficultyVariant(exercise.difficulty)}>
                  {exercise.difficulty}
                </Tag>
                {exercise.postureFocus ? (
                  <Tag variant="posture">Posture focus</Tag>
                ) : null}
              </div>
            </div>
          </div>

          <section className="exercise-detail-posture">
            <p className="eyebrow">Posture &amp; arched-back notes</p>
            <p>{exercise.postureNotes}</p>
          </section>
        </div>

        <div
          aria-labelledby="exercise-detail-tab-history"
          hidden={tab !== 'history'}
          id="exercise-detail-panel-history"
          role="tabpanel"
        >
          {history.isEmpty ? (
            <p className="exercise-detail-muted">
              Nothing logged for this exercise yet. Reps and kg typed on the
              live workout screen show up here.
            </p>
          ) : (
            <ol className="detail-history">
              {history.entries.slice(0, 12).map((entry) => (
                <li key={entry.date}>
                  <span className="detail-history__date">
                    {formatShortDate(entry.date)}
                  </span>
                  <span className="detail-history__work">
                    {entry.setCount} {entry.setCount === 1 ? 'set' : 'sets'}
                    {entry.topWeightKg !== null
                      ? ` · top ${entry.topWeightKg} kg${
                          entry.topReps ? ` × ${entry.topReps}` : ''
                        }`
                      : entry.totalReps > 0
                        ? ` · ${entry.totalReps} reps`
                        : entry.totalSeconds > 0
                          ? ` · ${formatDuration(entry.totalSeconds)}`
                          : ''}
                  </span>
                  <span className="detail-history__volume">
                    {entry.volumeKg !== null ? `${entry.volumeKg} kg` : '—'}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div
          aria-labelledby="exercise-detail-tab-progress"
          hidden={tab !== 'progress'}
          id="exercise-detail-panel-progress"
          role="tabpanel"
        >
          {trend.points.length < 2 ? (
            <p className="exercise-detail-muted">
              Two logged sessions are needed before a trend means anything.
              {history.isEmpty ? '' : ` So far there ${
                history.entries.length === 1 ? 'is 1' : `are ${history.entries.length}`
              }.`}
            </p>
          ) : (
            <>
              <div className="detail-progress__head">
                <div>
                  <p className="eyebrow">{trend.label}</p>
                  <strong>
                    {trend.points[trend.points.length - 1].value} {trend.unit}
                  </strong>
                </div>
                {history.bestWeightKg !== null ? (
                  <div className="detail-progress__best">
                    <span>Best set</span>
                    <b>
                      {history.bestWeightKg} kg
                      {history.bestReps ? ` × ${history.bestReps}` : ''}
                    </b>
                  </div>
                ) : null}
              </div>
              <ExerciseTrendChart points={trend.points} unit={trend.unit} />
            </>
          )}
        </div>
      </section>
    </div>
  )
}

/** "Aug 18" - the axis label the history list needs, nothing longer. */
function formatShortDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }

  return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
}

function getRelatedDayLabel(
  program: ActiveWorkoutProgram,
  dayNumber: number,
): string {
  const day = findProgramDay(program, dayNumber)
  return day ? getDayLabel(day) : `Day ${dayNumber}`
}

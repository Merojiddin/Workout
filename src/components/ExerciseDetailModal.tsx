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
  formatDate,
  useLanguage,
  type MessageKey,
  type TranslateFn,
} from '../i18n'
import {
  getExerciseCopy,
  translateCategory,
  translateDifficulty,
  translateEquipment,
} from '../i18n/exercises'
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
import { ExerciseMuscleMap } from './ExerciseMuscleMap'
import { ExerciseMediaEditor } from './ExerciseMediaEditor'
import { Tag, type TagVariant } from './Tag'

type DetailTab = 'info' | 'muscles' | 'history' | 'progress'

const DETAIL_TABS: { id: DetailTab; labelKey: MessageKey }[] = [
  { id: 'info', labelKey: 'library.modal.tab.info' },
  { id: 'muscles', labelKey: 'library.modal.tab.muscles' },
  { id: 'history', labelKey: 'library.modal.tab.history' },
  { id: 'progress', labelKey: 'library.modal.tab.progress' },
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
  const { language, t } = useLanguage()
  // The guide text in the reader's language. `exercise` itself stays English:
  // it is what history lookups, the media editor and the save path all use.
  const copy = useMemo(
    () => getExerciseCopy(exercise, language),
    [exercise, language],
  )
  const [tab, setTab] = useState<DetailTab>('info')
  // Read once per open: history does not change while the sheet is on screen.
  const history = useMemo(
    () => getExerciseHistory(exercise.id, exercise.name),
    [exercise.id, exercise.name],
  )
  const trend = useMemo(() => getExerciseTrend(history), [history])
  const activeProgram = getActiveWorkoutProgram()
  const progressionAdvice = useMemo(
    () =>
      getGeneralProgressionAdvice({
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        muscleGroup: exercise.postureFocus ? 'Posture' : undefined,
      }),
    // Built in the active language, so it is rebuilt when that changes.
    // The language is a real dependency: these helpers read it from the
    // i18n store rather than taking it as an argument, so the linter
    // cannot see it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise, language],
  )

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
            <p className="eyebrow">
              {t('library.modal.formGuide', {
                category: translateCategory(exercise.category, language),
              })}
            </p>
            <h2 id="exercise-detail-title">{copy.name}</h2>
            <p>{copy.formCue}</p>
          </div>
          <button
            aria-label={t('library.modal.close')}
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        {/* Four tabs instead of one long scroll: how to do it, what it works,
            what you have already done, and whether it is going anywhere. */}
        <div
          className="detail-tabs"
          role="tablist"
          aria-label={t('library.modal.tabsAria')}
        >
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
              {t(item.labelKey)}
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
            <b>{translateDifficulty(exercise.difficulty, language)}</b>
            <span>{t('library.modal.level')}</span>
          </div>
          <div className="info-cell">
            <Dumbbell size={17} strokeWidth={2.2} aria-hidden="true" />
            <b>{translateCategory(exercise.category, language)}</b>
            <span>{t('library.modal.category')}</span>
          </div>
          <div className="info-cell">
            <ListOrdered size={17} strokeWidth={2.2} aria-hidden="true" />
            <b>
              {exercise.equipment[0]
                ? translateEquipment(exercise.equipment[0], language)
                : t('library.modal.noEquipment')}
            </b>
            <span>{t('library.modal.equipment')}</span>
          </div>
        </div>

        <div className="exercise-detail-columns">
          <section className="exercise-detail-block">
            <h3>
              <ListOrdered size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('library.modal.instructions')}
            </h3>
            <ol className="exercise-detail-steps">
              {copy.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('library.modal.formTips')}
            </h3>
            <ul className="exercise-detail-list exercise-detail-list--good">
              {copy.formTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <ShieldAlert size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('library.modal.commonMistakes')}
            </h3>
            <ul className="exercise-detail-list exercise-detail-list--bad">
              {copy.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <TrendingUp size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('library.modal.progression')}
            </h3>
            <ol className="exercise-detail-steps exercise-detail-steps--progress">
              {copy.progression.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <TrendingDown size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('library.modal.regression')}
            </h3>
            <ol className="exercise-detail-steps exercise-detail-steps--progress">
              {copy.regression.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <section className="exercise-detail-advice">
          <p className="eyebrow">
            <Lightbulb size={16} strokeWidth={2.4} aria-hidden="true" />
            {t('library.modal.progressionAdvice')}
          </p>
          <ul>
            {progressionAdvice.map((advice) => (
              <li key={advice}>{advice}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-detail-posture">
          <p className="eyebrow">{t('library.modal.postureNotes')}</p>
          <p>{copy.postureNotes}</p>
        </section>

        <div className="exercise-detail-footer">
          <section className="exercise-detail-block">
            <h3>
              <ExternalLink size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('library.modal.demoLinks')}
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
              {t('library.modal.relatedDays')}
            </h3>
            {exercise.relatedWorkoutDays.length > 0 ? (
              <div className="tag-row">
                {exercise.relatedWorkoutDays.map((day) => (
                  <Tag key={day} variant="neutral">
                    {getRelatedDayLabel(activeProgram, day, t)}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="exercise-detail-muted">
                {t('library.modal.accessoryWork')}
              </p>
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
              <span className="exercise-card__label">
                {t('library.card.primaryMuscles')}
              </span>
              <div className="tag-row">
                {copy.primaryMuscles.map((muscle) => (
                  <Tag key={muscle} variant="muscle">
                    {muscle}
                  </Tag>
                ))}
              </div>
            </div>
            {exercise.secondaryMuscles.length > 0 ? (
              <div className="exercise-detail-taggroup">
                <span className="exercise-card__label">
                  {t('library.modal.secondaryMuscles')}
                </span>
                <div className="tag-row">
                  {copy.secondaryMuscles.map((muscle) => (
                    <Tag key={muscle} variant="secondary-muscle">
                      {muscle}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="exercise-detail-taggroup">
              <span className="exercise-card__label">
                {t('library.modal.equipment')}
              </span>
              <div className="tag-row">
                {exercise.equipment.map((item) => (
                  <Tag key={item} variant="equipment">
                    {translateEquipment(item, language)}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="exercise-detail-taggroup">
              <span className="exercise-card__label">
                {t('library.modal.difficulty')}
              </span>
              <div className="tag-row">
                <Tag variant={difficultyVariant(exercise.difficulty)}>
                  {translateDifficulty(exercise.difficulty, language)}
                </Tag>
                {exercise.postureFocus ? (
                  <Tag variant="posture">{t('library.modal.postureFocus')}</Tag>
                ) : null}
              </div>
            </div>
          </div>

          <ExerciseMuscleMap
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
          />

          <section className="exercise-detail-posture">
            <p className="eyebrow">{t('library.modal.postureNotes')}</p>
            <p>{copy.postureNotes}</p>
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
              {t('library.modal.historyEmpty')}
            </p>
          ) : (
            <ol className="detail-history">
              {history.entries.slice(0, 12).map((entry) => (
                <li key={entry.date}>
                  <span className="detail-history__date">
                    {formatShortDate(entry.date)}
                  </span>
                  <span className="detail-history__work">
                    {t('library.modal.historySets', { count: entry.setCount })}
                    {entry.topWeightKg !== null
                      ? entry.topReps
                        ? t('library.modal.historyTopReps', {
                            weight: entry.topWeightKg,
                            reps: entry.topReps,
                          })
                        : t('library.modal.historyTop', {
                            weight: entry.topWeightKg,
                          })
                      : entry.totalReps > 0
                        ? t('library.modal.historyReps', { reps: entry.totalReps })
                        : entry.totalSeconds > 0
                          ? ` · ${formatDuration(entry.totalSeconds)}`
                          : ''}
                  </span>
                  <span className="detail-history__volume">
                    {entry.volumeKg !== null
                      ? `${entry.volumeKg} ${t('unit.kg')}`
                      : '—'}
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
              {t('library.modal.trendEmpty')}
              {history.isEmpty
                ? ''
                : t('library.modal.trendSoFar', {
                    count: history.entries.length,
                  })}
            </p>
          ) : (
            <>
              <div className="detail-progress__head">
                <div>
                  <p className="eyebrow">{t(trend.labelKey)}</p>
                  <strong>
                    {trend.points[trend.points.length - 1].value}{' '}
                    {t(trend.unitKey, { count: 2 })}
                  </strong>
                </div>
                {history.bestWeightKg !== null ? (
                  <div className="detail-progress__best">
                    <span>{t('library.modal.bestSet')}</span>
                    <b>
                      {history.bestReps
                        ? t('library.modal.bestSetValueReps', {
                            weight: history.bestWeightKg,
                            reps: history.bestReps,
                          })
                        : t('library.modal.bestSetValue', {
                            weight: history.bestWeightKg,
                          })}
                    </b>
                  </div>
                ) : null}
              </div>
              <ExerciseTrendChart
                points={trend.points}
                unit={t(trend.unitKey, { count: 2 })}
              />
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

  return formatDate(parsed, { month: 'short', day: '2-digit' })
}

function getRelatedDayLabel(
  program: ActiveWorkoutProgram,
  dayNumber: number,
  t: TranslateFn,
): string {
  const day = findProgramDay(program, dayNumber)
  return day ? getDayLabel(day) : t('workout.dayNumber', { day: dayNumber })
}

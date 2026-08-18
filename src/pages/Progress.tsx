import { Check, Flame, TrendingDown, TrendingUp, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { ExerciseTrendChart } from '../components/ExerciseTrendChart'
import { getBodyCheckIns } from '../utils/bodyCheckInUtils'
import {
  getCurrentWorkoutStreak,
  getThisWeekSessions,
  getWeeklyCompletion,
  getWorkoutSessions,
} from '../utils/progressUtils'
import {
  countWorkedSets,
  getMuscleFocus,
  getPersonalRecords,
} from '../utils/trainingProgressUtils'
import type { PageId } from '../types/navigation'

interface ProgressProps {
  onNavigate: (page: PageId) => void
}

const FOCUS_COLORS = [
  'var(--green)',
  'var(--blue)',
  'var(--orange)',
  'var(--purple)',
  'var(--yellow)',
  'var(--red)',
]

/**
 * The training trend, on one screen.
 *
 * Everything here is derived from sessions and check-ins that are already
 * stored -- nothing is asked for twice. Weekly Review still owns the coaching
 * narrative and Body Check-in still owns the measurements; this is the glance.
 */
export function Progress({ onNavigate }: ProgressProps) {
  const sessions = useMemo(() => getWorkoutSessions(), [])
  const checkIns = useMemo(() => getBodyCheckIns(), [])

  const week = useMemo(() => getWeeklyCompletion(sessions), [sessions])
  const weekSessions = useMemo(() => getThisWeekSessions(sessions), [sessions])
  const streak = useMemo(() => getCurrentWorkoutStreak(sessions), [sessions])
  const records = useMemo(() => getPersonalRecords(sessions), [sessions])
  const focus = useMemo(() => getMuscleFocus(weekSessions), [weekSessions])
  const weekSets = useMemo(() => countWorkedSets(weekSessions), [weekSessions])
  const doneThisWeek = week.filter((day) => day.completed > 0).length

  const weightPoints = useMemo(
    () =>
      [...checkIns]
        .filter((checkIn) => typeof checkIn.bodyWeightKg === 'number')
        .sort((left, right) => left.date.localeCompare(right.date))
        .map((checkIn) => ({
          date: checkIn.date,
          value: checkIn.bodyWeightKg as number,
        })),
    [checkIns],
  )
  const weightDelta =
    weightPoints.length > 1
      ? weightPoints[weightPoints.length - 1].value - weightPoints[0].value
      : null

  return (
    <section className="progress-page">
      <header className="progress-page__head">
        <h1>Progress</h1>
        <p>Your training trend, from what you have already logged.</p>
      </header>

      {/* This week: which days you trained, at a glance. */}
      <article className="progress-card">
        <div className="progress-card__top">
          <div>
            <p className="eyebrow">This week</p>
            <strong className="progress-card__value">
              {doneThisWeek} <span>/ 7 days</span>
            </strong>
          </div>
          <div className="progress-card__aside">
            <span>{weekSets}</span>
            <small>sets</small>
          </div>
        </div>

        <ol className="week-strip">
          {week.map((day) => (
            <li
              className={`week-strip__day${
                day.completed > 0 ? ' week-strip__day--done' : ''
              }`}
              key={day.day}
            >
              <span>{day.day.charAt(0)}</span>
              <i aria-hidden="true">
                {day.completed > 0 ? <Check size={13} strokeWidth={3.2} /> : null}
              </i>
              <small className="week-strip__label">
                {day.day}: {day.completed > 0 ? 'trained' : 'no workout'}
              </small>
            </li>
          ))}
        </ol>
      </article>

      <article className="progress-card progress-card--streak">
        <div>
          <p className="eyebrow">
            <Flame size={14} strokeWidth={2.4} aria-hidden="true" />
            Current streak
          </p>
          <strong className="progress-card__value">
            {streak} <span>{streak === 1 ? 'day' : 'days'}</span>
          </strong>
        </div>
        <p className="progress-card__note">
          {streak > 0
            ? 'Counted back from today, one day at a time.'
            : 'Finish a workout today to start one.'}
        </p>
      </article>

      {/* Body weight, from Body Check-in. */}
      <article className="progress-card">
        <div className="progress-card__top">
          <div>
            <p className="eyebrow">Body weight</p>
            {weightPoints.length > 0 ? (
              <strong className="progress-card__value">
                {weightPoints[weightPoints.length - 1].value}
                <span> kg</span>
              </strong>
            ) : (
              <strong className="progress-card__value">
                <span>Not logged</span>
              </strong>
            )}
          </div>
          {weightDelta !== null && Math.abs(weightDelta) >= 0.1 ? (
            <p
              className={`progress-delta${
                weightDelta < 0 ? ' progress-delta--down' : ''
              }`}
            >
              {weightDelta < 0 ? (
                <TrendingDown size={15} strokeWidth={2.4} aria-hidden="true" />
              ) : (
                <TrendingUp size={15} strokeWidth={2.4} aria-hidden="true" />
              )}
              {weightDelta > 0 ? '+' : ''}
              {weightDelta.toFixed(1)} kg
            </p>
          ) : null}
        </div>

        {weightPoints.length > 1 ? (
          <ExerciseTrendChart points={weightPoints} unit="kg" />
        ) : (
          <p className="progress-empty">
            Two check-ins are needed to draw a line.{' '}
            <button onClick={() => onNavigate('body-check-in')} type="button">
              Add a check-in
            </button>
          </p>
        )}
      </article>

      {/* Where the week's sets actually went. */}
      <article className="progress-card">
        <p className="eyebrow">Muscle focus this week</p>
        {focus.length > 0 ? (
          <ul className="focus-bars">
            {focus.map((item, index) => (
              <li key={item.muscleGroup}>
                <div className="focus-bars__head">
                  <span>{item.muscleGroup}</span>
                  <b>{Math.round(item.share * 100)}%</b>
                </div>
                <div className="focus-bars__rail">
                  <span
                    style={{
                      background: FOCUS_COLORS[index % FOCUS_COLORS.length],
                      width: `${Math.max(3, Math.round(item.share * 100))}%`,
                    }}
                  />
                </div>
                <small>
                  {item.sets} {item.sets === 1 ? 'set' : 'sets'}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="progress-empty">
            Nothing logged this week yet. Sets counted here come from finished
            workouts.
          </p>
        )}
      </article>

      {/* Heaviest set per movement. */}
      <article className="progress-card">
        <p className="eyebrow">
          <Trophy size={14} strokeWidth={2.4} aria-hidden="true" />
          Personal records
        </p>
        {records.length > 0 ? (
          <ol className="record-list">
            {records.map((record) => (
              <li key={record.exerciseName}>
                <span className="record-list__name">{record.exerciseName}</span>
                <span className="record-list__load">
                  {record.weightKg} kg
                  {record.reps ? ` × ${record.reps}` : ''}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="progress-empty">
            No loads logged yet. Type a weight on the live workout screen and
            your heaviest set for each movement shows up here.
          </p>
        )}
      </article>

      <div className="progress-links">
        <button
          className="workout-secondary-button"
          onClick={() => onNavigate('weekly-review')}
          type="button"
        >
          Weekly review
        </button>
        <button
          className="workout-secondary-button"
          onClick={() => onNavigate('body-check-in')}
          type="button"
        >
          Body check-in
        </button>
      </div>
    </section>
  )
}

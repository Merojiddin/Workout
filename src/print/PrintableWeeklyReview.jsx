import { formatDate as formatLocaleDate, t } from '../i18n'
export function PrintableWeeklyReview({ review }) {
  if (!review) {
    return (
      <article className="print-page">
        <h1>{t('print.review.title')}</h1>
        <p className="print-empty">{t('print.review.empty')}</p>
      </article>
    )
  }

  const workoutSummary = review.workoutSummary ?? {}
  const scheduledCompletedWorkouts =
    workoutSummary.scheduledCompletedWorkouts ??
    workoutSummary.completedWorkouts ??
    0
  const standaloneWorkoutsCompleted =
    workoutSummary.standaloneWorkoutsCompleted ?? 0

  return (
    <article className="print-page">
      <h1>{t('print.review.title')}</h1>
      <p className="print-small">{review.weekLabel}</p>

      <div className="print-meta-grid">
        <div className="print-meta">
          <span className="print-label">{t('print.program')}</span>
          <strong>{review.program?.programName ?? t('program.customPlanName')}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.version')}</span>
          <strong>{review.program?.programVersion ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.printed')}</span>
          <strong>{formatDate(review.generatedAt)}</strong>
        </div>
      </div>

      <div className="print-summary-grid">
        <Summary label={t('print.review.weeklyScore')} value={`${review.weeklyScore?.score ?? 0}/100`} />
        <Summary
          label={t('print.review.scheduledWorkouts')}
          value={`${scheduledCompletedWorkouts}/${
            workoutSummary.targetWorkouts ?? 0
          }`}
        />
        <Summary
          label={t('print.review.standaloneWorkouts')}
          value={formatStandaloneWorkoutCount(standaloneWorkoutsCompleted)}
        />
        <Summary label={t('print.review.totalSets')} value={workoutSummary.totalSets ?? 0} />
        <Summary
          label={t('print.review.workoutDuration')}
          value={workoutSummary.totalDurationLabel ?? '-'}
        />
      </div>

      <h2>{t('print.review.muscleVolume')}</h2>
      <table>
        <thead>
          <tr>
            <th>{t('print.muscle')}</th>
            <th>{t('print.sets')}</th>
            <th>{t('print.review.sessions')}</th>
            <th>{t('print.review.message')}</th>
          </tr>
        </thead>
        <tbody>
          {safeArray(review.muscleVolume).map((item) => (
            <tr key={item.muscle}>
              <td>{item.muscle}</td>
              <td>{item.sets}</td>
              <td>{item.sessions}</td>
              <td>{item.message}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{t('print.review.strength')}</h2>
      <table>
        <thead>
          <tr>
            <th>{t('print.exercise')}</th>
            <th>{t('print.review.thisWeek')}</th>
            <th>{t('print.review.previous')}</th>
            <th>{t('print.review.change')}</th>
          </tr>
        </thead>
        <tbody>
          {safeArray(review.strengthComparison).map((item) => (
            <tr key={item.exerciseName}>
              <td>{item.exerciseName}</td>
              <td>{item.currentBest}</td>
              <td>{item.previousBest}</td>
              <td>{item.change}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{t('print.review.bodyProgress')}</h2>
      {review.bodySummary?.hasCurrent ? (
        <table>
          <thead>
            <tr>
              <th>{t('print.review.metric')}</th>
              <th>{t('print.review.current')}</th>
              <th>{t('print.review.previous')}</th>
              <th>{t('print.review.change')}</th>
            </tr>
          </thead>
          <tbody>
            {safeArray(review.bodySummary.metrics).map((metric) => (
              <tr key={metric.label}>
                <td>{metric.label}</td>
                <td>{metric.currentLabel}</td>
                <td>{metric.previousLabel}</td>
                <td>{metric.changeLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="print-empty">{t('print.review.noCheckIn')}</p>
      )}

      <h2>{t('print.review.nutrition')}</h2>
      <div className="print-summary-grid">
        <Summary
          label={t('print.review.avgProtein')}
          value={`${review.nutritionSummary?.averageProtein ?? 0} g`}
        />
        <Summary
          label={t('print.review.avgWater')}
          value={`${review.nutritionSummary?.averageWater ?? 0} L`}
        />
        <Summary
          label={t('print.review.creatineDays')}
          value={review.nutritionSummary?.creatineDays ?? 0}
        />
        <Summary label={t('print.review.wheyDays')} value={review.nutritionSummary?.wheyDays ?? 0} />
      </div>

      <h2>{t('print.review.focus')}</h2>
      <ul>
        {safeArray(review.focusItems).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t('print.review.warnings')}</h2>
      {safeArray(review.warnings).length > 0 ? (
        <ul>
          {review.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : (
        <p>{t('print.review.noWarnings')}</p>
      )}
    </article>
  )
}

function Summary({ label, value }) {
  return (
    <div className="print-summary-box">
      <span className="print-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function formatStandaloneWorkoutCount(count) {
  const total = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0
  return `${total} standalone workout${total === 1 ? '' : 's'} completed`
}

function formatDate(value) {
  const date = new Date(value ?? '')
  return Number.isNaN(date.getTime())
    ? '-'
    : formatLocaleDate(date, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

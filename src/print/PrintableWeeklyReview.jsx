export function PrintableWeeklyReview({ review }) {
  if (!review) {
    return (
      <article className="print-page">
        <h1>Weekly Review</h1>
        <p className="print-empty">No weekly review data yet.</p>
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
      <h1>Weekly Review</h1>
      <p className="print-small">{review.weekLabel}</p>

      <div className="print-meta-grid">
        <div className="print-meta">
          <span className="print-label">Program</span>
          <strong>{review.program?.programName ?? 'Custom Workout Plan'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Version</span>
          <strong>{review.program?.programVersion ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Printed</span>
          <strong>{formatDate(review.generatedAt)}</strong>
        </div>
      </div>

      <div className="print-summary-grid">
        <Summary label="Weekly score" value={`${review.weeklyScore?.score ?? 0}/100`} />
        <Summary
          label="Scheduled workouts"
          value={`${scheduledCompletedWorkouts}/${
            workoutSummary.targetWorkouts ?? 0
          }`}
        />
        <Summary
          label="Standalone workouts"
          value={formatStandaloneWorkoutCount(standaloneWorkoutsCompleted)}
        />
        <Summary label="Total sets" value={workoutSummary.totalSets ?? 0} />
        <Summary
          label="Workout duration"
          value={workoutSummary.totalDurationLabel ?? '-'}
        />
      </div>

      <h2>Muscle Volume</h2>
      <table>
        <thead>
          <tr>
            <th>Muscle</th>
            <th>Sets</th>
            <th>Sessions</th>
            <th>Message</th>
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

      <h2>Strength Progress</h2>
      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>This week</th>
            <th>Previous</th>
            <th>Change</th>
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

      <h2>Body Progress</h2>
      {review.bodySummary?.hasCurrent ? (
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Previous</th>
              <th>Change</th>
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
        <p className="print-empty">No body check-in this week.</p>
      )}

      <h2>Nutrition Summary</h2>
      <div className="print-summary-grid">
        <Summary
          label="Average protein"
          value={`${review.nutritionSummary?.averageProtein ?? 0} g`}
        />
        <Summary
          label="Average water"
          value={`${review.nutritionSummary?.averageWater ?? 0} L`}
        />
        <Summary
          label="Creatine days"
          value={review.nutritionSummary?.creatineDays ?? 0}
        />
        <Summary label="Whey days" value={review.nutritionSummary?.wheyDays ?? 0} />
      </div>

      <h2>Next Week Focus</h2>
      <ul>
        {safeArray(review.focusItems).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Warnings</h2>
      {safeArray(review.warnings).length > 0 ? (
        <ul>
          {review.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : (
        <p>No warnings.</p>
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
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
}

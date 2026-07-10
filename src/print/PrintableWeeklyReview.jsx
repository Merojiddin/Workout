export function PrintableWeeklyReview({ review }) {
  if (!review) {
    return (
      <article className="print-page">
        <h1>Weekly Review</h1>
        <p className="print-empty">No weekly review data yet.</p>
      </article>
    )
  }

  return (
    <article className="print-page">
      <h1>Weekly Review</h1>
      <p className="print-small">{review.weekLabel}</p>

      <div className="print-summary-grid">
        <Summary label="Weekly score" value={`${review.weeklyScore?.score ?? 0}/100`} />
        <Summary
          label="Workouts completed"
          value={`${review.workoutSummary?.completedWorkouts ?? 0}/${
            review.workoutSummary?.targetWorkouts ?? 0
          }`}
        />
        <Summary label="Total sets" value={review.workoutSummary?.totalSets ?? 0} />
        <Summary
          label="Workout duration"
          value={review.workoutSummary?.totalDurationLabel ?? '-'}
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

export function WeeklyScoreCard({ score, label, message, breakdown }) {
  const scoreStyle = { '--score-percent': `${Math.max(0, Math.min(score, 100))}%` }

  return (
    <article className="weekly-score-card">
      <div className="weekly-score-card__ring" style={scoreStyle}>
        <span>{score}</span>
        <small>/100</small>
      </div>
      <div className="weekly-score-card__body">
        <p className="eyebrow">Weekly Score</p>
        <h2>{label}</h2>
        <p>{message}</p>
        {breakdown ? (
          <div className="weekly-score-breakdown" aria-label="Score breakdown">
            <span>Workouts {breakdown.workout}/40</span>
            <span>Nutrition {breakdown.nutrition}/25</span>
            <span>Check-in {breakdown.body}/10</span>
            <span>Abs/Posture {breakdown.absPosture}/15</span>
            <span>Strength {breakdown.progression}/10</span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

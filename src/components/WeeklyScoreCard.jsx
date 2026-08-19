import { useT } from '../i18n'

export function WeeklyScoreCard({ score, label, message, breakdown }) {
  const t = useT()
  const scoreStyle = { '--score-percent': `${Math.max(0, Math.min(score, 100))}%` }

  return (
    <article className="weekly-score-card">
      <div className="weekly-score-card__ring" style={scoreStyle}>
        <span>{score}</span>
        <small>{t('review.score.outOf')}</small>
      </div>
      <div className="weekly-score-card__body">
        <p className="eyebrow">{t('review.score.eyebrow')}</p>
        <h2>{label}</h2>
        <p>{message}</p>
        {breakdown ? (
          <div
            className="weekly-score-breakdown"
            aria-label={t('review.score.breakdownAria')}
          >
            <span>{t('review.score.workouts', { value: breakdown.workout })}</span>
            <span>
              {t('review.score.nutrition', { value: breakdown.nutrition })}
            </span>
            <span>{t('review.score.checkIn', { value: breakdown.body })}</span>
            <span>
              {t('review.score.absPosture', { value: breakdown.absPosture })}
            </span>
            <span>
              {t('review.score.strength', { value: breakdown.progression })}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

import { useT } from '../i18n'

export function MuscleVolumeChart({ data }) {
  const t = useT()
  const maxSets = Math.max(...(data ?? []).map((item) => item.sets), 1)
  const highlighted = (data ?? []).filter((item) =>
    ['Chest', 'Abs', 'Posture', 'Legs'].includes(item.muscle),
  )

  return (
    <article className="dashboard-card muscle-volume-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{t('review.volume.eyebrow')}</p>
          <h2>{t('review.volume.title')}</h2>
        </div>
      </div>
      {(data ?? []).length === 0 ? (
        <div className="chart-empty-state">{t('review.volume.empty')}</div>
      ) : null}
      <div className="muscle-volume-list">
        {(data ?? []).map((item) => (
          <div className="muscle-volume-row" key={item.muscle}>
            <div>
              <strong>{t(`muscle.${item.muscle}`)}</strong>
              <span>
                {t('review.volume.sets', { count: item.sets })}
                {item.sessions
                  ? ` / ${t('review.volume.sessions', { count: item.sessions })}`
                  : ''}
              </span>
            </div>
            <div className="muscle-volume-track" aria-hidden="true">
              <span style={{ width: `${Math.max((item.sets / maxSets) * 100, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="coach-message-list">
        {highlighted
          .filter((item) => item.message)
          .map((item) => (
            <p className={`coach-message coach-message--${item.status}`} key={item.muscle}>
              {item.message}
            </p>
          ))}
      </div>
    </article>
  )
}


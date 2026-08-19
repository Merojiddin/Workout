import { useT } from '../i18n'

/** Stored status values, mapped to their display wording. */
const STATUS_KEYS = {
  improved: 'review.strength.improved',
  same: 'review.strength.same',
  decreased: 'review.strength.decreased',
  'no data': 'review.strength.noDataStatus',
}

export function StrengthComparisonTable({ comparisons }) {
  const t = useT()
  return (
    <article className="history-card strength-comparison-card">
      <div>
        <p className="eyebrow">{t('review.strength.eyebrow')}</p>
        <h2>{t('review.strength.title')}</h2>
      </div>
      <div className="history-table-wrap">
        <table className="history-table strength-table">
          <thead>
            <tr>
              <th>{t('review.strength.exercise')}</th>
              <th>{t('review.strength.thisWeek')}</th>
              <th>{t('review.strength.previousWeek')}</th>
              <th>{t('review.strength.change')}</th>
              <th>{t('review.strength.status')}</th>
            </tr>
          </thead>
          <tbody>
            {(comparisons ?? []).map((item) => (
              <tr key={item.exerciseName}>
                <td>{item.exerciseName}</td>
                <td>{item.currentBest}</td>
                <td>{item.previousBest}</td>
                <td>{item.change}</td>
                <td>
                  <span className={`review-status review-status--${slugStatus(item.status)}`}>
                    {STATUS_KEYS[item.status]
                      ? t(STATUS_KEYS[item.status])
                      : item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function slugStatus(status) {
  return String(status ?? 'no data').replace(/\s+/g, '-')
}

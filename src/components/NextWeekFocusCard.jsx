import { useT } from '../i18n'

export function NextWeekFocusCard({ items }) {
  const t = useT()
  return (
    <article className="dashboard-card focus-card">
      <div>
        <p className="eyebrow">{t('review.focus.eyebrow')}</p>
        <h2>{t('review.focus.title')}</h2>
      </div>
      <ol className="focus-list">
        {(items ?? []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </article>
  )
}

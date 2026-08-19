import { useT } from '../i18n'

export function WarningsCard({ warnings }) {
  const t = useT()
  if (!warnings?.length) {
    return null
  }

  return (
    <article className="dashboard-card warnings-card">
      <div>
        <p className="eyebrow">{t('review.warnings.eyebrow')}</p>
        <h2>{t('review.warnings.title')}</h2>
      </div>
      <div className="warnings-list">
        {warnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </article>
  )
}

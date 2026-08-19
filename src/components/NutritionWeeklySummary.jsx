import { useT } from '../i18n'

export function NutritionWeeklySummary({ summary }) {
  const t = useT()
  const proteinMin = summary.proteinMin ?? 120
  const proteinMax = summary.proteinMax ?? 160
  const metrics = [
    [
      t('review.nutrition.avgProtein'),
      t('review.nutrition.avgProteinValue', { value: summary.averageProtein }),
      t('review.nutrition.perLoggedDay'),
    ],
    [
      t('review.nutrition.proteinTargetDays'),
      String(summary.proteinTargetDays),
      t('review.nutrition.proteinRange', { min: proteinMin, max: proteinMax }),
    ],
    [
      t('review.nutrition.avgWater'),
      t('review.nutrition.avgWaterValue', { value: summary.averageWater }),
      t('review.nutrition.waterTarget'),
    ],
    [
      t('review.nutrition.creatineDays'),
      String(summary.creatineDays),
      t('review.nutrition.creatineTarget'),
    ],
    [
      t('review.nutrition.wheyDays'),
      String(summary.wheyDays),
      t('review.nutrition.wheyUsed'),
    ],
    [
      t('review.nutrition.avgCalories'),
      summary.averageCalories ? `${summary.averageCalories}` : '-',
      t('review.nutrition.estimate'),
    ],
    [
      t('review.nutrition.seafoodMeals'),
      String(summary.seafoodMeals),
      t('review.nutrition.thisWeek'),
    ],
    [
      t('review.nutrition.oysterMeals'),
      String(summary.oysterMeals),
      t('review.nutrition.thisWeek'),
    ],
    [
      t('review.nutrition.avgCoffee'),
      String(summary.averageCoffee),
      t('review.nutrition.cupsPerDay'),
    ],
  ]

  return (
    <article className="dashboard-card nutrition-weekly-summary-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{t('review.nutrition.eyebrow')}</p>
          <h2>{t('review.nutrition.title')}</h2>
        </div>
      </div>
      {summary.logCount > 0 ? (
        <>
          <div className="nutrition-weekly-grid">
            {metrics.map(([title, value, subtitle]) => (
              <div className="nutrition-weekly-metric" key={title}>
                <span>{title}</span>
                <strong>{value}</strong>
                <p>{subtitle}</p>
              </div>
            ))}
          </div>
          <div className="coach-message-list">
            {summary.messages.map((message) => (
              <p className="coach-message coach-message--neutral" key={message}>
                {message}
              </p>
            ))}
          </div>
        </>
      ) : (
        <div className="chart-empty-state">{t('review.nutrition.empty')}</div>
      )}
    </article>
  )
}

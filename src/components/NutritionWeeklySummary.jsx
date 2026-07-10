export function NutritionWeeklySummary({ summary }) {
  const metrics = [
    ['Avg protein', `${summary.averageProtein} g`, 'Per logged day'],
    ['Protein target days', String(summary.proteinTargetDays), '120-160 g/day'],
    ['Avg water', `${summary.averageWater} L`, 'Target 2-3 L/day'],
    ['Creatine days', String(summary.creatineDays), 'Daily 3-5 g'],
    ['Whey days', String(summary.wheyDays), 'Whey used'],
    ['Avg calories', summary.averageCalories ? `${summary.averageCalories}` : '-', 'Estimate'],
    ['Seafood meals', String(summary.seafoodMeals), 'This week'],
    ['Oyster meals', String(summary.oysterMeals), 'This week'],
    ['Avg coffee', String(summary.averageCoffee), 'Cups/day'],
  ]

  return (
    <article className="dashboard-card nutrition-weekly-summary-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Nutrition Summary</p>
          <h2>Protein, creatine, water</h2>
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
        <div className="chart-empty-state">No nutrition logs this week.</div>
      )}
    </article>
  )
}

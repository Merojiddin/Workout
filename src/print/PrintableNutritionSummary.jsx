export function PrintableNutritionSummary({ logs, summary }) {
  const sorted = [...safeArray(logs)].sort((a, b) =>
    String(b?.date ?? '').localeCompare(String(a?.date ?? '')),
  )

  return (
    <article className="print-page">
      <h1>Nutrition Summary</h1>
      {sorted.length > 0 ? (
        <>
          <div className="print-summary-grid">
            <Summary label="Average protein" value={`${summary?.averageProtein ?? 0} g`} />
            <Summary label="Average water" value={`${summary?.averageWater ?? 0} L`} />
            <Summary label="Creatine days" value={summary?.creatineDays ?? 0} />
            <Summary label="Whey days" value={summary?.wheyDays ?? 0} />
            <Summary label="Seafood meals" value={summary?.seafoodMeals ?? 0} />
            <Summary label="Oyster meals" value={summary?.oysterMeals ?? 0} />
            <Summary label="Protein target days" value={summary?.proteinTargetDays ?? 0} />
            <Summary label="Average coffee" value={summary?.averageCoffee ?? 0} />
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Protein</th>
                <th>Water</th>
                <th>Creatine</th>
                <th>Whey</th>
                <th>Eggs</th>
                <th>Seafood</th>
                <th>Oysters</th>
                <th>Calories</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>{formatUnit(log.proteinGrams, 'g')}</td>
                  <td>{formatUnit(log.waterLiters, 'L')}</td>
                  <td>{yesNo(log.creatineTaken)}</td>
                  <td>{yesNo(log.wheyTaken)}</td>
                  <td>{log.eggsCount ?? '-'}</td>
                  <td>{yesNo(log.seafoodMeal)}</td>
                  <td>{yesNo(log.oystersMeal)}</td>
                  <td>{log.caloriesEstimate ?? '-'}</td>
                  <td>{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="print-empty">No data yet. Complete logs first.</p>
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

function formatUnit(value, unit) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value} ${unit}` : '-'
}

function yesNo(value) {
  return value ? 'Yes' : 'No'
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

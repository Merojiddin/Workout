import type { NutritionLog } from '../data/nutritionLogs'
import { formatNutritionDate } from '../utils/nutritionUtils'

interface NutritionHistoryTableProps {
  logs: NutritionLog[]
  onView: (log: NutritionLog) => void
  onEdit: (log: NutritionLog) => void
  onDelete: (log: NutritionLog) => void
}

export function NutritionHistoryTable({
  logs,
  onView,
  onEdit,
  onDelete,
}: NutritionHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <article className="history-card">
        <p className="eyebrow">Nutrition History</p>
        <h2>Recent logs</h2>
        <div className="chart-empty-state">
          No nutrition logs yet. Save your first day above to build history.
        </div>
      </article>
    )
  }

  const ordered = [...logs].sort((a, b) => getTime(b) - getTime(a))

  return (
    <article className="history-card">
      <div>
        <p className="eyebrow">Nutrition History</p>
        <h2>Recent logs</h2>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Protein</th>
              <th>Water</th>
              <th>Creatine</th>
              <th>Whey</th>
              <th>Eggs</th>
              <th>Seafood/Oysters</th>
              <th>Calories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((log) => (
              <tr key={log.id}>
                <td>{formatNutritionDate(log.date)}</td>
                <td>{formatValue(log.proteinGrams, 'g')}</td>
                <td>{formatValue(log.waterLiters, 'L')}</td>
                <td>{log.creatineTaken ? 'Yes' : 'No'}</td>
                <td>{log.wheyTaken ? 'Yes' : 'No'}</td>
                <td>{formatCount(log.eggsCount)}</td>
                <td>{formatMeals(log)}</td>
                <td>{formatValue(log.caloriesEstimate, 'kcal')}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-button"
                      onClick={() => onView(log)}
                      type="button"
                    >
                      View
                    </button>
                    <button
                      className="table-action-button"
                      onClick={() => onEdit(log)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="table-action-button table-action-button--danger"
                      onClick={() => onDelete(log)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function formatValue(value: number | null, unit: string): string {
  return value === null ? '—' : `${value} ${unit}`
}

function formatCount(value: number | null): string {
  return value === null ? '—' : String(value)
}

function formatMeals(log: NutritionLog): string {
  const meals: string[] = []
  if (log.seafoodMeal) {
    meals.push('Seafood')
  }
  if (log.oystersMeal) {
    meals.push('Oysters')
  }
  return meals.length > 0 ? meals.join(', ') : '—'
}

function getTime(log: NutritionLog): number {
  const time = new Date(`${log.date}T00:00:00`).getTime()
  return Number.isFinite(time) ? time : 0
}

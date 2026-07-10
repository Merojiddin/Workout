import type { BodyCheckIn } from '../data/bodyCheckIns'
import { formatCheckInDate } from '../utils/bodyCheckInUtils'

interface CheckInHistoryTableProps {
  checkIns: BodyCheckIn[]
  onView: (checkIn: BodyCheckIn) => void
  onEdit: (checkIn: BodyCheckIn) => void
  onDelete: (checkIn: BodyCheckIn) => void
}

export function CheckInHistoryTable({
  checkIns,
  onView,
  onEdit,
  onDelete,
}: CheckInHistoryTableProps) {
  if (checkIns.length === 0) {
    return (
      <article className="history-card">
        <p className="eyebrow">Check-in History</p>
        <h2>Previous check-ins</h2>
        <div className="chart-empty-state">
          No check-ins yet. Save your first one above to build history.
        </div>
      </article>
    )
  }

  const ordered = [...checkIns].sort(
    (a, b) => getTime(b) - getTime(a),
  )

  return (
    <article className="history-card">
      <div>
        <p className="eyebrow">Check-in History</p>
        <h2>Previous check-ins</h2>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Waist</th>
              <th>Belly</th>
              <th>Chest</th>
              <th>Shoulders</th>
              <th>Abs</th>
              <th>Posture</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((checkIn) => (
              <tr key={checkIn.id}>
                <td>{formatCheckInDate(checkIn.date)}</td>
                <td>{formatValue(checkIn.bodyWeightKg, 'kg')}</td>
                <td>{formatValue(checkIn.waistCm, 'cm')}</td>
                <td>{formatValue(checkIn.bellyCm, 'cm')}</td>
                <td>{formatValue(checkIn.chestCm, 'cm')}</td>
                <td>{formatValue(checkIn.shouldersCm, 'cm')}</td>
                <td>{formatRating(checkIn.absVisibilityRating)}</td>
                <td>{formatRating(checkIn.postureRating)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-button"
                      onClick={() => onView(checkIn)}
                      type="button"
                    >
                      View
                    </button>
                    <button
                      className="table-action-button"
                      onClick={() => onEdit(checkIn)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="table-action-button table-action-button--danger"
                      onClick={() => onDelete(checkIn)}
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

function formatRating(value: number | null): string {
  return value === null ? '—' : `${value}/10`
}

function getTime(checkIn: BodyCheckIn): number {
  const time = new Date(`${checkIn.date}T00:00:00`).getTime()
  return Number.isFinite(time) ? time : 0
}

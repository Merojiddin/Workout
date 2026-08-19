import type { BodyCheckIn } from '../data/bodyCheckIns'
import { useT, type TranslateFn } from '../i18n'
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
  const t = useT()
  const kg = t('unit.kg')
  const cm = t('unit.cm')

  if (checkIns.length === 0) {
    return (
      <article className="history-card">
        <p className="eyebrow">{t('checkin.historyEyebrow')}</p>
        <h2>{t('checkin.historyTitle')}</h2>
        <div className="chart-empty-state">{t('checkin.historyEmpty')}</div>
      </article>
    )
  }

  const ordered = [...checkIns].sort(
    (a, b) => getTime(b) - getTime(a),
  )

  return (
    <article className="history-card">
      <div>
        <p className="eyebrow">{t('checkin.historyEyebrow')}</p>
        <h2>{t('checkin.historyTitle')}</h2>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>{t('checkin.table.date')}</th>
              <th>{t('measure.weight')}</th>
              <th>{t('measure.waistCm')}</th>
              <th>{t('measure.bellyCm')}</th>
              <th>{t('measure.chestCm')}</th>
              <th>{t('measure.shouldersCm')}</th>
              <th>{t('measure.abs')}</th>
              <th>{t('measure.posture')}</th>
              <th>{t('checkin.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((checkIn) => (
              <tr key={checkIn.id}>
                <td>{formatCheckInDate(checkIn.date)}</td>
                <td>{formatValue(checkIn.bodyWeightKg, kg)}</td>
                <td>{formatValue(checkIn.waistCm, cm)}</td>
                <td>{formatValue(checkIn.bellyCm, cm)}</td>
                <td>{formatValue(checkIn.chestCm, cm)}</td>
                <td>{formatValue(checkIn.shouldersCm, cm)}</td>
                <td>{formatRating(checkIn.absVisibilityRating, t)}</td>
                <td>{formatRating(checkIn.postureRating, t)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-button"
                      onClick={() => onView(checkIn)}
                      type="button"
                    >
                      {t('checkin.action.view')}
                    </button>
                    <button
                      className="table-action-button"
                      onClick={() => onEdit(checkIn)}
                      type="button"
                    >
                      {t('action.edit')}
                    </button>
                    <button
                      className="table-action-button table-action-button--danger"
                      onClick={() => onDelete(checkIn)}
                      type="button"
                    >
                      {t('action.delete')}
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

function formatRating(value: number | null, t: TranslateFn): string {
  return value === null ? '—' : t('checkin.rating', { value })
}

function getTime(checkIn: BodyCheckIn): number {
  const time = new Date(`${checkIn.date}T00:00:00`).getTime()
  return Number.isFinite(time) ? time : 0
}

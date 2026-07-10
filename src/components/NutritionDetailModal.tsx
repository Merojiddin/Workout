import { X } from 'lucide-react'
import type { NutritionLog } from '../data/nutritionLogs'
import { formatNutritionDate } from '../utils/nutritionUtils'

interface NutritionDetailModalProps {
  log: NutritionLog
  onClose: () => void
}

export function NutritionDetailModal({ log, onClose }: NutritionDetailModalProps) {
  const metrics = [
    { label: 'Protein', value: formatMetric(log.proteinGrams, 'g') },
    { label: 'Water', value: formatMetric(log.waterLiters, 'L') },
    { label: 'Calories', value: formatMetric(log.caloriesEstimate, 'kcal') },
    { label: 'Body weight', value: formatMetric(log.bodyWeightKg, 'kg') },
    { label: 'Creatine', value: formatSupplement(log.creatineTaken, log.creatineGrams, 'g') },
    { label: 'Whey', value: formatSupplement(log.wheyTaken, log.wheyScoops, 'scoops') },
    { label: 'Eggs', value: formatCount(log.eggsCount) },
    { label: 'Coffee', value: formatCount(log.coffeeCups) },
    { label: 'Seafood', value: log.seafoodMeal ? 'Yes' : 'No' },
    { label: 'Oysters', value: log.oystersMeal ? 'Yes' : 'No' },
    { label: 'Nuts', value: log.nutsServing ? 'Yes' : 'No' },
    { label: 'Dark chocolate', value: log.darkChocolate ? 'Yes' : 'No' },
  ]

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="nutrition-detail-title"
        aria-modal="true"
        className="workout-detail-modal"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Nutrition Details</p>
            <h2 id="nutrition-detail-title">{formatNutritionDate(log.date)}</h2>
          </div>
          <button
            aria-label="Close nutrition details"
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <div className="checkin-detail-metrics">
          {metrics.map((metric) => (
            <div className="checkin-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>

        {log.fruits.trim() ? (
          <div className="checkin-detail-notes">
            <p className="eyebrow">Fruits</p>
            <p>{log.fruits.trim()}</p>
          </div>
        ) : null}

        {log.notes ? (
          <div className="checkin-detail-notes">
            <p className="eyebrow">Notes</p>
            <p>{log.notes}</p>
          </div>
        ) : (
          <p className="checkin-detail-empty">No notes for this day.</p>
        )}
      </section>
    </div>
  )
}

function formatMetric(value: number | null, unit: string): string {
  return value === null ? '—' : `${value} ${unit}`
}

function formatCount(value: number | null): string {
  return value === null ? '—' : String(value)
}

function formatSupplement(
  taken: boolean,
  amount: number | null,
  unit: string,
): string {
  if (!taken) {
    return 'No'
  }
  return amount ? `Yes · ${amount} ${unit}` : 'Yes'
}

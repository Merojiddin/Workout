import { CalendarCheck2 } from 'lucide-react'
import type { NutritionLog } from '../data/nutritionLogs'
import { ProgressBar } from './ProgressBar'
import {
  formatNutritionDate,
  getProteinStatus,
  getProteinStatusMessage,
  getWaterStatus,
  getWaterStatusMessage,
  nutritionTargets,
} from '../utils/nutritionUtils'

interface NutritionSummaryCardProps {
  log: NutritionLog
}

export function NutritionSummaryCard({ log }: NutritionSummaryCardProps) {
  const proteinStatus = getProteinStatus(log.proteinGrams)
  const waterStatus = getWaterStatus(log.waterLiters)

  const highlights = buildHighlights(log)

  return (
    <article className="dashboard-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Today's Nutrition</p>
          <h2>{formatNutritionDate(log.date)}</h2>
        </div>
        <CalendarCheck2 size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <ProgressBar
        label={`Protein (${getProteinStatusMessage(proteinStatus)})`}
        max={nutritionTargets.proteinMax}
        value={Math.round(log.proteinGrams ?? 0)}
      />
      <ProgressBar
        label={`Water (${getWaterStatusMessage(waterStatus)})`}
        max={nutritionTargets.waterMax}
        value={round1(log.waterLiters ?? 0)}
      />

      <div className="summary-supp-grid">
        <div className="summary-supp">
          <span>Creatine</span>
          <strong>
            {log.creatineTaken
              ? `Taken${log.creatineGrams ? ` · ${log.creatineGrams} g` : ''}`
              : 'Not taken'}
          </strong>
        </div>
        <div className="summary-supp">
          <span>Whey</span>
          <strong>
            {log.wheyTaken
              ? `Taken${log.wheyScoops ? ` · ${log.wheyScoops} scoop${log.wheyScoops === 1 ? '' : 's'}` : ''}`
              : 'Not taken'}
          </strong>
        </div>
        <div className="summary-supp">
          <span>Calories</span>
          <strong>{log.caloriesEstimate ? `${log.caloriesEstimate} kcal` : '—'}</strong>
        </div>
        <div className="summary-supp">
          <span>Body weight</span>
          <strong>{log.bodyWeightKg ? `${log.bodyWeightKg} kg` : '—'}</strong>
        </div>
      </div>

      {highlights.length > 0 ? (
        <div className="summary-highlights">
          {highlights.map((item) => (
            <span className="food-chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="checklist-hint">No food highlights logged for today.</p>
      )}

      {log.notes ? <p className="checkin-notes">“{log.notes}”</p> : null}
    </article>
  )
}

function buildHighlights(log: NutritionLog): string[] {
  const items: string[] = []
  if (log.eggsCount) {
    items.push(`${log.eggsCount} egg${log.eggsCount === 1 ? '' : 's'}`)
  }
  if (log.seafoodMeal) {
    items.push('Seafood')
  }
  if (log.oystersMeal) {
    items.push('Oysters')
  }
  if (log.nutsServing) {
    items.push('Nuts')
  }
  if (log.darkChocolate) {
    items.push('Dark chocolate')
  }
  if (log.coffeeCups) {
    items.push(`${log.coffeeCups} coffee`)
  }
  if (log.fruits.trim()) {
    items.push(log.fruits.trim())
  }
  return items
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

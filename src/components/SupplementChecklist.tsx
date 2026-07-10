import { Check, CircleCheck, Droplets, TriangleAlert } from 'lucide-react'
import type { NutritionLog } from '../data/nutritionLogs'
import {
  getProteinStatus,
  getProteinStatusMessage,
  getWaterStatus,
  getWaterStatusMessage,
  nutritionTargets,
} from '../utils/nutritionUtils'

interface SupplementChecklistProps {
  log: NutritionLog
  onChange: (log: NutritionLog) => void
}

export function SupplementChecklist({ log, onChange }: SupplementChecklistProps) {
  function patch(changes: Partial<NutritionLog>) {
    onChange({ ...log, ...changes })
  }

  const proteinStatus = getProteinStatus(log.proteinGrams)
  const waterStatus = getWaterStatus(log.waterLiters)

  const statuses = [
    {
      key: 'protein',
      tone: proteinStatus === 'target' ? 'good' : proteinStatus === 'low' ? 'warn' : 'info',
      message: getProteinStatusMessage(proteinStatus),
    },
    {
      key: 'water',
      tone: waterStatus === 'low' ? 'warn' : 'good',
      message: getWaterStatusMessage(waterStatus),
    },
    {
      key: 'creatine',
      tone: log.creatineTaken ? 'good' : 'info',
      message: log.creatineTaken ? 'Creatine completed.' : 'Creatine not taken yet.',
    },
  ] as const

  return (
    <article className="dashboard-card checklist-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Daily Checklist</p>
          <h2>Supplements & targets</h2>
        </div>
        <Droplets size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="checklist-toggles">
        <ChecklistToggle
          checked={log.creatineTaken}
          label="Creatine taken?"
          onToggle={() => patch({ creatineTaken: !log.creatineTaken })}
        />
        <ChecklistToggle
          checked={log.wheyTaken}
          label="Whey protein taken?"
          onToggle={() => patch({ wheyTaken: !log.wheyTaken })}
        />
      </div>

      <div className="checklist-grid">
        <ChecklistNumber
          id="checklist-creatine"
          label="Creatine"
          onChange={(value) => patch({ creatineGrams: value })}
          step="0.5"
          unit="g"
          value={log.creatineGrams}
        />
        <ChecklistNumber
          id="checklist-whey"
          label="Whey"
          onChange={(value) => patch({ wheyScoops: value })}
          step="1"
          unit="scoops"
          value={log.wheyScoops}
        />
        <ChecklistNumber
          id="checklist-water"
          label="Water"
          onChange={(value) => patch({ waterLiters: value })}
          step="0.1"
          unit="L"
          value={log.waterLiters}
        />
        <ChecklistNumber
          id="checklist-protein"
          label="Protein"
          onChange={(value) => patch({ proteinGrams: value })}
          step="1"
          unit="g"
          value={log.proteinGrams}
        />
      </div>

      <div className="checklist-status">
        {statuses.map((status) => (
          <span
            className={`status-chip status-chip--${status.tone}`}
            key={status.key}
          >
            {status.tone === 'good' ? (
              <CircleCheck size={15} strokeWidth={2.6} aria-hidden="true" />
            ) : (
              <TriangleAlert size={15} strokeWidth={2.6} aria-hidden="true" />
            )}
            {status.message}
          </span>
        ))}
      </div>

      <p className="checklist-hint">
        Targets: protein {nutritionTargets.proteinMin}–{nutritionTargets.proteinMax} g,
        water {nutritionTargets.waterMin}–{nutritionTargets.waterMax} L, creatine{' '}
        {nutritionTargets.creatineMin}–{nutritionTargets.creatineMax} g. Changes save to
        today automatically.
      </p>
    </article>
  )
}

interface ChecklistToggleProps {
  checked: boolean
  label: string
  onToggle: () => void
}

function ChecklistToggle({ checked, label, onToggle }: ChecklistToggleProps) {
  return (
    <button
      aria-pressed={checked}
      className={`nutrition-toggle${checked ? ' nutrition-toggle--on' : ''}`}
      onClick={onToggle}
      type="button"
    >
      <span className="nutrition-toggle__box" aria-hidden="true">
        {checked ? <Check size={14} strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
  )
}

interface ChecklistNumberProps {
  id: string
  label: string
  unit: string
  step: string
  value: number | null
  onChange: (value: number | null) => void
}

function ChecklistNumber({
  id,
  label,
  unit,
  step,
  value,
  onChange,
}: ChecklistNumberProps) {
  return (
    <div className="nutrition-field">
      <label htmlFor={id}>
        {label} <span className="nutrition-field__unit">({unit})</span>
      </label>
      <input
        className="nutrition-input"
        id={id}
        inputMode="decimal"
        min={0}
        onChange={(event) => onChange(parseInput(event.target.value))}
        placeholder="0"
        step={step}
        type="number"
        value={value ?? ''}
      />
    </div>
  )
}

function parseInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

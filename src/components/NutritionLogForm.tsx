import { Check, RotateCcw, Save, X } from 'lucide-react'
import { useState } from 'react'
import type { NutritionLog } from '../data/nutritionLogs'
import {
  generateNutritionId,
  nutritionTargets,
  todayIso,
} from '../utils/nutritionUtils'

type NumberKey =
  | 'bodyWeightKg'
  | 'proteinGrams'
  | 'waterLiters'
  | 'caloriesEstimate'
  | 'creatineGrams'
  | 'wheyScoops'
  | 'eggsCount'
  | 'coffeeCups'

type BoolKey =
  | 'creatineTaken'
  | 'wheyTaken'
  | 'seafoodMeal'
  | 'oystersMeal'
  | 'nutsServing'
  | 'darkChocolate'

type NutritionDraft = {
  date: string
  fruits: string
  notes: string
} & Record<NumberKey, string> &
  Record<BoolKey, boolean>

interface NutritionLogFormProps {
  onSave: (log: NutritionLog) => void
  initialData?: NutritionLog | null
  mode?: 'create' | 'edit'
  onCancel?: () => void
}

const coreInputs: { key: NumberKey; label: string; unit: string; step: string }[] = [
  { key: 'bodyWeightKg', label: 'Body weight', unit: 'kg', step: '0.1' },
  { key: 'proteinGrams', label: 'Protein', unit: 'g', step: '1' },
  { key: 'waterLiters', label: 'Water', unit: 'L', step: '0.1' },
  { key: 'caloriesEstimate', label: 'Estimated calories', unit: 'kcal', step: '10' },
]

const supplementNumberInputs: {
  key: NumberKey
  label: string
  unit: string
  step: string
}[] = [
  { key: 'creatineGrams', label: 'Creatine', unit: 'g', step: '0.5' },
  { key: 'wheyScoops', label: 'Whey', unit: 'scoops', step: '1' },
]

const foodNumberInputs: { key: NumberKey; label: string; unit: string; step: string }[] =
  [
    { key: 'eggsCount', label: 'Eggs', unit: 'count', step: '1' },
    { key: 'coffeeCups', label: 'Coffee', unit: 'cups', step: '1' },
  ]

const supplementToggles: { key: BoolKey; label: string }[] = [
  { key: 'creatineTaken', label: 'Creatine taken' },
  { key: 'wheyTaken', label: 'Whey protein taken' },
]

const foodToggles: { key: BoolKey; label: string }[] = [
  { key: 'seafoodMeal', label: 'Seafood meal' },
  { key: 'oystersMeal', label: 'Oysters meal' },
  { key: 'nutsServing', label: 'Nuts serving' },
  { key: 'darkChocolate', label: 'Dark chocolate' },
]

const numberKeys: NumberKey[] = [
  ...coreInputs,
  ...supplementNumberInputs,
  ...foodNumberInputs,
].map((input) => input.key)

export function NutritionLogForm({
  onSave,
  initialData,
  mode = 'create',
  onCancel,
}: NutritionLogFormProps) {
  const [draft, setDraft] = useState<NutritionDraft>(() => createDraft(initialData))
  const [errors, setErrors] = useState<Partial<Record<NumberKey | 'date', string>>>(
    {},
  )

  const isEdit = mode === 'edit'

  // Non-blocking warnings shown live as the user types.
  const warnings: string[] = []
  const proteinValue = Number(draft.proteinGrams)
  const creatineValue = Number(draft.creatineGrams)
  if (Number.isFinite(proteinValue) && proteinValue > nutritionTargets.proteinWarn) {
    warnings.push(
      `Protein over ${nutritionTargets.proteinWarn} g is very high — keep calories controlled.`,
    )
  }
  if (Number.isFinite(creatineValue) && creatineValue > nutritionTargets.creatineWarn) {
    warnings.push(
      `Creatine over ${nutritionTargets.creatineWarn} g is more than needed — ${nutritionTargets.creatineMin}–${nutritionTargets.creatineMax} g is enough.`,
    )
  }

  function setNumber(key: NumberKey, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function setText(key: 'date' | 'fruits' | 'notes', value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function toggle(key: BoolKey) {
    setDraft((current) => ({ ...current, [key]: !current[key] }))
  }

  function handleClear() {
    setDraft(createDraft(null))
    setErrors({})
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextErrors: Partial<Record<NumberKey | 'date', string>> = {}

    if (!draft.date) {
      nextErrors.date = 'Date is required.'
    }

    for (const key of numberKeys) {
      const raw = draft[key].trim()
      if (raw === '') {
        continue
      }

      const parsed = Number(raw)
      if (!Number.isFinite(parsed)) {
        nextErrors[key] = 'Enter a valid number.'
      } else if (parsed < 0) {
        nextErrors[key] = 'Cannot be negative.'
      } else if (key === 'waterLiters' && parsed > nutritionTargets.waterMaxAllowed) {
        nextErrors[key] = `Water cannot be more than ${nutritionTargets.waterMaxAllowed} L.`
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onSave(buildLog(draft, initialData))

    if (!isEdit) {
      handleClear()
    }
  }

  return (
    <article className="dashboard-card nutrition-form-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{isEdit ? 'Edit Log' : 'Food & Supplement Log'}</p>
          <h2>{isEdit ? 'Update this day' : 'Log today'}</h2>
        </div>
      </div>

      <form className="nutrition-form" noValidate onSubmit={handleSubmit}>
        <div className="nutrition-field">
          <label htmlFor="nutrition-date">Date</label>
          <input
            className="nutrition-input"
            id="nutrition-date"
            onChange={(event) => setText('date', event.target.value)}
            type="date"
            value={draft.date}
          />
          {errors.date ? (
            <span className="nutrition-field__error">{errors.date}</span>
          ) : null}
        </div>

        <div className="nutrition-form__grid">
          {coreInputs.map((input) => (
            <NumberField
              draft={draft}
              error={errors[input.key]}
              input={input}
              key={input.key}
              onChange={setNumber}
            />
          ))}
        </div>

        <fieldset className="nutrition-fieldset">
          <legend>Supplements</legend>
          <div className="nutrition-toggle-grid">
            {supplementToggles.map((item) => (
              <ToggleButton
                checked={draft[item.key]}
                key={item.key}
                label={item.label}
                onToggle={() => toggle(item.key)}
              />
            ))}
          </div>
          <div className="nutrition-form__grid">
            {supplementNumberInputs.map((input) => (
              <NumberField
                draft={draft}
                error={errors[input.key]}
                input={input}
                key={input.key}
                onChange={setNumber}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="nutrition-fieldset">
          <legend>Food</legend>
          <div className="nutrition-toggle-grid">
            {foodToggles.map((item) => (
              <ToggleButton
                checked={draft[item.key]}
                key={item.key}
                label={item.label}
                onToggle={() => toggle(item.key)}
              />
            ))}
          </div>
          <div className="nutrition-form__grid">
            {foodNumberInputs.map((input) => (
              <NumberField
                draft={draft}
                error={errors[input.key]}
                input={input}
                key={input.key}
                onChange={setNumber}
              />
            ))}
          </div>
          <div className="nutrition-field">
            <label htmlFor="nutrition-fruits">Fruits eaten</label>
            <input
              className="nutrition-input"
              id="nutrition-fruits"
              onChange={(event) => setText('fruits', event.target.value)}
              placeholder="e.g. dragon fruit, mangosteen"
              type="text"
              value={draft.fruits}
            />
          </div>
        </fieldset>

        <div className="nutrition-field">
          <label htmlFor="nutrition-notes">Notes</label>
          <textarea
            className="nutrition-textarea"
            id="nutrition-notes"
            onChange={(event) => setText('notes', event.target.value)}
            placeholder="How you ate and felt, appetite, training, anything worth remembering."
            rows={3}
            value={draft.notes}
          />
        </div>

        {warnings.length > 0 ? (
          <div className="nutrition-warning">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}

        <div className="nutrition-actions">
          <button className="workout-primary-button" type="submit">
            <Save size={18} strokeWidth={2.4} aria-hidden="true" />
            {isEdit ? 'Update Nutrition Log' : 'Save Nutrition Log'}
          </button>
          <button
            className="workout-secondary-button"
            onClick={handleClear}
            type="button"
          >
            <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
            Clear Form
          </button>
          {isEdit && onCancel ? (
            <button
              className="workout-secondary-button"
              onClick={onCancel}
              type="button"
            >
              <X size={18} strokeWidth={2.4} aria-hidden="true" />
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
    </article>
  )
}

interface NumberFieldProps {
  draft: NutritionDraft
  error?: string
  input: { key: NumberKey; label: string; unit: string; step: string }
  onChange: (key: NumberKey, value: string) => void
}

function NumberField({ draft, error, input, onChange }: NumberFieldProps) {
  return (
    <div className="nutrition-field">
      <label htmlFor={`nutrition-${input.key}`}>
        {input.label} <span className="nutrition-field__unit">({input.unit})</span>
      </label>
      <input
        className="nutrition-input"
        id={`nutrition-${input.key}`}
        inputMode="decimal"
        min={0}
        onChange={(event) => onChange(input.key, event.target.value)}
        placeholder="0"
        step={input.step}
        type="number"
        value={draft[input.key]}
      />
      {error ? <span className="nutrition-field__error">{error}</span> : null}
    </div>
  )
}

interface ToggleButtonProps {
  checked: boolean
  label: string
  onToggle: () => void
}

function ToggleButton({ checked, label, onToggle }: ToggleButtonProps) {
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

function createDraft(initialData?: NutritionLog | null): NutritionDraft {
  return {
    date: initialData?.date || todayIso(),
    bodyWeightKg: numberToInput(initialData?.bodyWeightKg),
    proteinGrams: numberToInput(initialData?.proteinGrams),
    waterLiters: numberToInput(initialData?.waterLiters),
    caloriesEstimate: numberToInput(initialData?.caloriesEstimate),
    creatineGrams: numberToInput(initialData?.creatineGrams),
    wheyScoops: numberToInput(initialData?.wheyScoops),
    eggsCount: numberToInput(initialData?.eggsCount),
    coffeeCups: numberToInput(initialData?.coffeeCups),
    creatineTaken: initialData?.creatineTaken ?? false,
    wheyTaken: initialData?.wheyTaken ?? false,
    seafoodMeal: initialData?.seafoodMeal ?? false,
    oystersMeal: initialData?.oystersMeal ?? false,
    nutsServing: initialData?.nutsServing ?? false,
    darkChocolate: initialData?.darkChocolate ?? false,
    fruits: initialData?.fruits ?? '',
    notes: initialData?.notes ?? '',
  }
}

function buildLog(
  draft: NutritionDraft,
  initialData?: NutritionLog | null,
): NutritionLog {
  return {
    id: initialData?.id ?? generateNutritionId(),
    date: draft.date,
    bodyWeightKg: inputToNumber(draft.bodyWeightKg),
    proteinGrams: inputToNumber(draft.proteinGrams),
    waterLiters: inputToNumber(draft.waterLiters),
    caloriesEstimate: inputToNumber(draft.caloriesEstimate),
    creatineTaken: draft.creatineTaken,
    creatineGrams: inputToNumber(draft.creatineGrams),
    wheyTaken: draft.wheyTaken,
    wheyScoops: inputToNumber(draft.wheyScoops),
    eggsCount: inputToNumber(draft.eggsCount),
    seafoodMeal: draft.seafoodMeal,
    oystersMeal: draft.oystersMeal,
    nutsServing: draft.nutsServing,
    darkChocolate: draft.darkChocolate,
    fruits: draft.fruits.trim(),
    coffeeCups: inputToNumber(draft.coffeeCups),
    notes: draft.notes.trim(),
    createdAt: initialData?.createdAt ?? new Date().toISOString(),
  }
}

function numberToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

function inputToNumber(value: string): number | null {
  const raw = value.trim()
  if (raw === '') {
    return null
  }

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

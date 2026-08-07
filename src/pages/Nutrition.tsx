import {
  Coffee,
  Droplets,
  FileSpreadsheet,
  FlaskConical,
  Flame,
  Info,
  PlusCircle,
  Printer,
  Sparkles,
  Target,
  Utensils,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { NutritionChart } from '../components/NutritionChart'
import { NutritionDetailModal } from '../components/NutritionDetailModal'
import { NutritionHistoryTable } from '../components/NutritionHistoryTable'
import { NutritionLogForm } from '../components/NutritionLogForm'
import { NutritionSummaryCard } from '../components/NutritionSummaryCard'
import { NutritionTargetCard } from '../components/NutritionTargetCard'
import { OverviewCard } from '../components/OverviewCard'
import { PrintableNutritionSummary } from '../print/PrintableNutritionSummary'
import { ProgressChart } from '../components/ProgressChart'
import { SupplementChecklist } from '../components/SupplementChecklist'
import type { NutritionLog } from '../data/nutritionLogs'
import { useAuth } from '../context/AuthContext'
import * as nutritionService from '../services/nutritionService'
import { exportNutritionLogsCSV } from '../utils/exportUtils'
import {
  addDemoNutritionLogs,
  createEmptyNutritionLog,
  formatNutritionDate,
  getCreatineWeeklyConsistency,
  getNutritionChartData,
  getNutritionLogs,
  getThisWeekNutritionLogs,
  getTodayNutritionLog,
  getWeeklyNutritionSummary,
} from '../utils/nutritionUtils'
import { printElement } from '../utils/printUtils'
import {
  getActiveWorkoutProgram,
  getProgramNutritionTargets,
} from '../utils/activeWorkoutProgram'

const supportFoods = [
  { food: 'Eggs', benefit: 'Protein, healthy fats, vitamin D' },
  { food: 'Oysters', benefit: 'Zinc' },
  { food: 'Seafood', benefit: 'Protein and omega-3' },
  { food: 'Nuts', benefit: 'Healthy fats and magnesium' },
  { food: 'Dark chocolate', benefit: 'Magnesium' },
  { food: 'Dragon fruit / mangosteen', benefit: 'Antioxidants and fiber' },
  { food: 'Coffee', benefit: 'Useful before a workout, but avoid too late' },
]

export function Nutrition() {
  const { user } = useAuth()
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  const proteinTargets = useMemo(
    () => getProgramNutritionTargets(activeProgram),
    [activeProgram],
  )
  const [logs, setLogs] = useState<NutritionLog[]>(() => getNutritionLogs())
  const [today, setToday] = useState<NutritionLog>(
    () => getTodayNutritionLog(getNutritionLogs()) ?? createEmptyNutritionLog(),
  )
  const [editingLog, setEditingLog] = useState<NutritionLog | null>(null)
  const [viewingLog, setViewingLog] = useState<NutritionLog | null>(null)
  const [deletingLog, setDeletingLog] = useState<NutritionLog | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const hasLogs = logs.length > 0
  const storedTodayLog = useMemo(() => getTodayNutritionLog(logs), [logs])
  const weekly = useMemo(
    () => getWeeklyNutritionSummary(logs, proteinTargets.proteinMin),
    [logs, proteinTargets.proteinMin],
  )
  const weekLogCount = useMemo(() => getThisWeekNutritionLogs(logs).length, [logs])
  const proteinChart = useMemo(
    () => getNutritionChartData(logs, 'proteinGrams'),
    [logs],
  )
  const waterChart = useMemo(() => getNutritionChartData(logs, 'waterLiters'), [logs])
  const weightChart = useMemo(
    () => getNutritionChartData(logs, 'bodyWeightKg'),
    [logs],
  )
  const caloriesChart = useMemo(
    () => getNutritionChartData(logs, 'caloriesEstimate'),
    [logs],
  )
  const creatineChart = useMemo(() => getCreatineWeeklyConsistency(logs), [logs])

  function resyncToday(nextLogs: NutritionLog[]) {
    setLogs(nextLogs)
    setToday(getTodayNutritionLog(nextLogs) ?? createEmptyNutritionLog())
  }

  async function handleChecklistChange(next: NutritionLog) {
    setToday(next)
    try {
      setLogs(await nutritionService.saveNutritionLog(user, next))
      setSaveError(null)
    } catch {
      setLogs(getNutritionLogs())
      setSaveError('Saved locally. Cloud sync failed.')
    }
  }

  async function handleSave(log: NutritionLog) {
    try {
      const next = editingLog
        ? await nutritionService.updateNutritionLog(user, editingLog.id, log)
        : await nutritionService.saveNutritionLog(user, log)
      resyncToday(next)
      setEditingLog(null)
      setSaveError(null)
    } catch {
      resyncToday(getNutritionLogs())
      setSaveError('Saved locally. Cloud sync failed.')
    }
  }

  function handleAddDemo() {
    resyncToday(addDemoNutritionLogs())
    setSaveError(null)
  }

  function handleEdit(log: NutritionLog) {
    setEditingLog(log)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleConfirmDelete() {
    if (!deletingLog) {
      return
    }

    const targetId = deletingLog.id
    try {
      resyncToday(await nutritionService.deleteNutritionLog(user, targetId))
    } catch {
      resyncToday(getNutritionLogs())
    }
    if (editingLog?.id === targetId) {
      setEditingLog(null)
    }
    setDeletingLog(null)
  }

  return (
    <section className="nutrition-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Nutrition</p>
          <h1>Nutrition &amp; Supplements</h1>
          <p>
            Track protein, creatine, whey, water, and foods that support muscle
            growth.
          </p>
        </div>
        <div className="progress-hero-actions">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => exportNutritionLogsCSV(logs)}
            type="button"
          >
            <FileSpreadsheet size={19} strokeWidth={2.4} aria-hidden="true" />
            Export Nutrition CSV
          </button>
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => printElement('nutrition-summary-print-source')}
            type="button"
          >
            <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
            Print Nutrition Summary
          </button>
          {!hasLogs ? (
            <button className="demo-data-button" onClick={handleAddDemo} type="button">
              <PlusCircle size={19} strokeWidth={2.4} aria-hidden="true" />
              Add Demo Nutrition Logs
            </button>
          ) : null}
        </div>
      </header>

      <section
        className="nutrition-target-grid"
        aria-label="Daily nutrition targets"
      >
        <NutritionTargetCard
          icon={Flame}
          status="protein"
          subtitle="Muscle gain fuel"
          title="Protein target"
          value={`${proteinTargets.proteinMin}–${proteinTargets.proteinMax} g/day`}
        />
        <NutritionTargetCard
          icon={Droplets}
          status="water"
          subtitle="Stay hydrated"
          title="Water target"
          value="2–3 L/day"
        />
        <NutritionTargetCard
          icon={FlaskConical}
          status="creatine"
          subtitle="Daily, any time"
          title="Creatine"
          value={activeProgram.coaching.creatineDailyGrams ?? '3–5 g/day'}
        />
        <NutritionTargetCard
          icon={Utensils}
          status="neutral"
          subtitle="Adjust from actual trends"
          title="Calories"
          value="No fixed universal target"
        />
        <NutritionTargetCard
          icon={Target}
          status="goal"
          subtitle="Gradual fat loss + strength"
          title="Goal"
          value={activeProgram.coaching.targetWeightLossKgPerWeek ?? 'Sustainable recomposition'}
        />
      </section>

      <div className="nutrition-info-grid">
        <article className="dashboard-card recomp-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">How to read progress</p>
              <h2>Body recomposition</h2>
            </div>
            <Info size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <p className="card-copy">
            Your goal is recomposition: build muscle while keeping belly fat
            controlled. Do not starve yourself. For your body, the best signs are
            strength increasing, chest/shoulders increasing, waist stable or
            decreasing, and protein target reached most days.
          </p>
        </article>

        <article className="dashboard-card foods-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Nutrition support</p>
              <h2>Foods that support muscle and hormones</h2>
            </div>
            <Sparkles size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="foods-list">
            {supportFoods.map((item) => (
              <div className="foods-row" key={item.food}>
                <strong>{item.food}</strong>
                <span>{item.benefit}</span>
              </div>
            ))}
          </div>
          <p className="foods-disclaimer">
            These foods support general health, training, and nutrient intake. They
            do not replace sleep, resistance training, and good body fat control.
          </p>
        </article>
      </div>

      <SupplementChecklist
        log={today}
        onChange={handleChecklistChange}
        proteinTargets={proteinTargets}
      />

      {storedTodayLog ? (
        <NutritionSummaryCard
          log={storedTodayLog}
          proteinTargets={proteinTargets}
        />
      ) : (
        <article className="progress-empty-card">
          <Utensils size={26} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <h2>No nutrition log for today yet</h2>
            <p>Use the checklist or the form below to log today, or add demo logs.</p>
          </div>
          <button
            className="workout-primary-button"
            onClick={handleAddDemo}
            type="button"
          >
            Add Demo Nutrition Logs
          </button>
        </article>
      )}

      <div ref={formRef}>
        <NutritionLogForm
          initialData={editingLog}
          key={editingLog?.id ?? 'new'}
          mode={editingLog ? 'edit' : 'create'}
          onCancel={() => setEditingLog(null)}
          onSave={handleSave}
        />
      </div>

      {saveError ? <div className="nutrition-save-error">{saveError}</div> : null}

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">This Week</p>
            <h2>Weekly nutrition summary</h2>
          </div>
        </div>
        {weekLogCount > 0 ? (
          <div className="overview-grid">
            <OverviewCard
              subtitle="Per logged day"
              title="Avg protein"
              value={`${weekly.averageProtein} g`}
            />
            <OverviewCard
              subtitle="Per logged day"
              title="Avg water"
              value={`${weekly.averageWater} L`}
            />
            <OverviewCard
              subtitle={`Out of ${weekLogCount} logged`}
              title="Creatine days"
              value={String(weekly.creatineDays)}
            />
            <OverviewCard
              subtitle={`Out of ${weekLogCount} logged`}
              title="Whey days"
              value={String(weekly.wheyDays)}
            />
            <OverviewCard
              subtitle={`Protein ≥ ${proteinTargets.proteinMin} g`}
              title="Target days"
              value={String(weekly.proteinTargetDays)}
            />
            <OverviewCard
              subtitle="Cups per logged day"
              title="Avg coffee"
              value={String(weekly.averageCoffee)}
            />
            <OverviewCard
              subtitle="Meals this week"
              title="Seafood"
              value={String(weekly.seafoodMeals)}
            />
            <OverviewCard
              subtitle="Meals this week"
              title="Oysters"
              value={String(weekly.oysterMeals)}
            />
          </div>
        ) : (
          <div className="chart-empty-state">
            No logs this week yet. Log a day to see weekly averages.
          </div>
        )}
      </section>

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Trends</p>
            <h2>Nutrition charts</h2>
          </div>
        </div>
        <div className="chart-grid">
          <NutritionChart
            data={proteinChart}
            emptyMessage="No protein data yet."
            title="Protein"
            unit="g"
          />
          <NutritionChart
            data={waterChart}
            emptyMessage="No water data yet."
            title="Water"
            unit="L"
          />
          <NutritionChart
            data={weightChart}
            emptyMessage="No body weight data yet."
            title="Body weight"
            unit="kg"
          />
          <NutritionChart
            data={caloriesChart}
            emptyMessage="No calorie data yet."
            title="Calories"
            unit="kcal"
          />
          <ProgressChart
            data={creatineChart}
            dataKey="value"
            emptyMessage="No creatine data yet."
            title="Creatine consistency"
            valueLabel="Creatine days"
            variant="bar"
            xKey="week"
          />
        </div>
      </section>

      <NutritionHistoryTable
        logs={logs}
        onDelete={setDeletingLog}
        onEdit={handleEdit}
        onView={setViewingLog}
      />

      <div className="print-source" id="nutrition-summary-print-source" aria-hidden="true">
        <PrintableNutritionSummary logs={logs} summary={weekly} />
      </div>

      {viewingLog ? (
        <NutritionDetailModal log={viewingLog} onClose={() => setViewingLog(null)} />
      ) : null}

      {deletingLog ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="delete-nutrition-title"
            aria-modal="true"
            className="confirm-modal"
            role="dialog"
          >
            <p className="eyebrow">Delete log</p>
            <h2 id="delete-nutrition-title">
              Delete {formatNutritionDate(deletingLog.date)}?
            </h2>
            <p>This removes the nutrition log for this day. This cannot be undone.</p>
            <div className="confirm-actions">
              <button
                className="workout-secondary-button"
                onClick={() => setDeletingLog(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                onClick={handleConfirmDelete}
                type="button"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <p className="nutrition-coffee-note">
        <Coffee size={15} strokeWidth={2.4} aria-hidden="true" />
        Coffee is useful before training. Avoid it too late so it does not hurt
        sleep, which matters more than any single food.
      </p>
    </section>
  )
}

import {
  ClipboardList,
  Download,
  FileJson,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { PrintableBlankWorkoutLog } from '../print/PrintableBlankWorkoutLog'
import { PrintableBodyProgress } from '../print/PrintableBodyProgress'
import { PrintableNutritionSummary } from '../print/PrintableNutritionSummary'
import { PrintableTodayWorkout } from '../print/PrintableTodayWorkout'
import { PrintableWeeklyPlan } from '../print/PrintableWeeklyPlan'
import { PrintableWeeklyReview } from '../print/PrintableWeeklyReview'
import { PrintableWorkoutSession } from '../print/PrintableWorkoutSession'
import { getBodyCheckIns } from '../utils/bodyCheckInUtils'
import {
  exportAllDataJSON,
  exportBodyCheckInsCSV,
  exportNutritionLogsCSV,
  exportWorkoutPlanJSON,
  exportWeeklySummaryCSV,
  exportWorkoutSessionsCSV,
} from '../utils/exportUtils'
import { getNutritionLogs, getWeeklyNutritionSummary } from '../utils/nutritionUtils'
import {
  buildWeeklyReviewPrintData,
  getLatestWorkoutSession,
  getTodayWorkoutForPrint,
  prepareWeeklyPlanPrintData,
  printElement,
} from '../utils/printUtils'
import { getWorkoutSessions } from '../utils/progressUtils'
import {
  getEffectiveExerciseLibrary,
  getUserProfileSettings,
} from '../utils/settingsUtils'
import {
  getActiveWorkoutProgram,
  getProgramNutritionTargets,
} from '../utils/activeWorkoutProgram'

const printableActions = [
  {
    description: 'Full seven-day schedule with exercises, sets, rest, and notes.',
    id: 'print-weekly-plan',
    label: 'Print Weekly Plan',
  },
  {
    description: 'A hand-written log sheet for any workout day.',
    id: 'print-blank-log',
    label: 'Print Blank Daily Workout Log',
  },
  {
    description: 'Today’s workout with targets, rest, and form tips.',
    id: 'print-today-workout',
    label: "Print Today's Workout",
  },
  {
    description: 'The latest saved workout session with logged sets.',
    id: 'print-latest-session',
    label: 'Print Latest Completed Workout',
  },
  {
    description: 'Score, muscle volume, nutrition, warnings, and focus items.',
    id: 'print-weekly-review',
    label: 'Print Weekly Review',
  },
  {
    description: 'Latest measurements, history, notes, and photo thumbnails.',
    id: 'print-body-progress',
    label: 'Print Body Progress Report',
  },
  {
    description: 'Weekly nutrition averages and recent log rows.',
    id: 'print-nutrition-summary',
    label: 'Print Nutrition Summary',
  },
]

export function ExportPrint() {
  const [notice, setNotice] = useState('')
  const settings = useMemo(() => getUserProfileSettings(), [])
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  const proteinTargets = useMemo(
    () => getProgramNutritionTargets(activeProgram),
    [activeProgram],
  )
  const workoutPlan = activeProgram.days
  const identityExerciseContainers = useMemo(
    () => [...workoutPlan, ...activeProgram.standaloneWorkouts],
    [activeProgram.standaloneWorkouts, workoutPlan],
  )
  const exerciseLibrary = useMemo(() => getEffectiveExerciseLibrary(), [])
  const sessions = useMemo(() => getWorkoutSessions(), [])
  const checkIns = useMemo(() => getBodyCheckIns(), [])
  const nutritionLogs = useMemo(() => getNutritionLogs(), [])
  const todayWorkout = useMemo(
    () => getTodayWorkoutForPrint(workoutPlan),
    [workoutPlan],
  )
  const latestSession = useMemo(() => getLatestWorkoutSession(sessions), [sessions])
  const weeklyReview = useMemo(
    () =>
      buildWeeklyReviewPrintData({
        checkIns,
        activeProgram,
        exerciseLibrary,
        nutritionLogs,
        sessions,
        workoutPlan,
      }),
    [activeProgram, checkIns, exerciseLibrary, nutritionLogs, sessions, workoutPlan],
  )
  const weeklyPlanPrintData = useMemo(
    () => prepareWeeklyPlanPrintData(workoutPlan, settings, activeProgram),
    [activeProgram, settings, workoutPlan],
  )
  const nutritionSummary = useMemo(
    () => getWeeklyNutritionSummary(nutritionLogs, proteinTargets.proteinMin),
    [nutritionLogs, proteinTargets.proteinMin],
  )

  function handlePrint(elementId, label) {
    const success = printElement(elementId)
    setNotice(success ? `${label} opened for printing.` : 'Could not open print view.')
  }

  function handleExport(action, label) {
    action()
    setNotice(`${label} downloaded.`)
  }

  return (
    <section className="export-print-page">
      <header className="progress-hero export-print-hero">
        <div>
          <p className="eyebrow">Export &amp; Print</p>
          <h1>Export &amp; Print</h1>
          <p>
            Print workout sheets or export your training, body, and nutrition data.
          </p>
        </div>
        <div className="hero-target">
          <ShieldCheck size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>Storage</span>
          <strong>localStorage only</strong>
        </div>
      </header>

      {notice ? (
        <div className="settings-notice" role="status">
          <Download size={18} strokeWidth={2.4} aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      <section className="export-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Printable Templates</p>
            <h2>Print or save as PDF</h2>
          </div>
          <Printer size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <div className="export-action-grid">
          {printableActions.map((action) => (
            <ActionCard
              description={action.description}
              icon={Printer}
              key={action.id}
              label={action.label}
              onClick={() => handlePrint(action.id, action.label)}
            />
          ))}
        </div>
      </section>

      <section className="export-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Data Export</p>
            <h2>CSV and full backup</h2>
          </div>
          <FileSpreadsheet size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <div className="export-action-grid">
          <ActionCard
            description="Every logged exercise set, ready for Excel or Google Sheets."
            icon={FileSpreadsheet}
            label="Export Workout Sessions CSV"
            onClick={() =>
              handleExport(
                () => exportWorkoutSessionsCSV(sessions),
                'Workout sessions CSV',
              )
            }
          />
          <ActionCard
            description="All measurement check-ins without photo payloads."
            icon={FileSpreadsheet}
            label="Export Body Check-ins CSV"
            onClick={() =>
              handleExport(() => exportBodyCheckInsCSV(checkIns), 'Body CSV')
            }
          />
          <ActionCard
            description="Protein, water, supplements, food, calories, and notes."
            icon={FileSpreadsheet}
            label="Export Nutrition Logs CSV"
            onClick={() =>
              handleExport(
                () => exportNutritionLogsCSV(nutritionLogs),
                'Nutrition CSV',
              )
            }
          />
          <ActionCard
            description="Current week score, sets, protein, water, and body changes."
            icon={FileSpreadsheet}
            label="Export Weekly Summary CSV"
            onClick={() =>
              handleExport(
                () => exportWeeklySummaryCSV(weeklyReview),
                'Weekly summary CSV',
              )
            }
          />
          <ActionCard
            description="Active program metadata and the current saved workout days."
            icon={FileJson}
            label="Export Workout Plan JSON"
            onClick={() =>
              handleExport(
                () => exportWorkoutPlanJSON(activeProgram),
                'Workout plan JSON',
              )
            }
          />
          <ActionCard
            description="Complete app backup with settings, plan, library, and logs."
            icon={FileJson}
            label="Export All Data JSON"
            onClick={() => handleExport(exportAllDataJSON, 'Full JSON backup')}
          />
        </div>
      </section>

      <article className="dashboard-card export-reminder-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Import / Backup Reminder</p>
            <h2>Use JSON for restore</h2>
          </div>
          <ClipboardList size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <p className="card-copy">
          Use JSON export as your full backup. CSV is for Excel/Google Sheets
          viewing.
        </p>
      </article>

      <div className="print-source" aria-hidden="true">
        <div id="print-weekly-plan">
          <PrintableWeeklyPlan data={weeklyPlanPrintData} />
        </div>
        <div id="print-blank-log">
          <PrintableBlankWorkoutLog workout={todayWorkout} />
        </div>
        <div id="print-today-workout">
          <PrintableTodayWorkout
            generatedAt={new Date().toISOString()}
            program={activeProgram}
            workout={todayWorkout}
          />
        </div>
        <div id="print-latest-session">
          <PrintableWorkoutSession
            exerciseLibrary={exerciseLibrary}
            session={latestSession}
            workoutPlan={identityExerciseContainers}
          />
        </div>
        <div id="print-weekly-review">
          <PrintableWeeklyReview review={weeklyReview} />
        </div>
        <div id="print-body-progress">
          <PrintableBodyProgress checkIns={checkIns} />
        </div>
        <div id="print-nutrition-summary">
          <PrintableNutritionSummary logs={nutritionLogs} summary={nutritionSummary} />
        </div>
      </div>
    </section>
  )
}

function ActionCard({ description, icon: Icon, label, onClick }) {
  return (
    <article className="dashboard-card export-action-card">
      <div>
        <Icon size={24} strokeWidth={2.4} aria-hidden="true" />
        <h3>{label}</h3>
        <p>{description}</p>
      </div>
      <button className="workout-primary-button" onClick={onClick} type="button">
        {label}
      </button>
    </article>
  )
}

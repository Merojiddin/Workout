import {
  getEffectiveExerciseLibrary,
  getWorkoutForDate,
} from './settingsUtils'
import { getProgressionSuggestion } from './progressionUtils'
import { exerciseIdentitiesMatch } from '../data/exerciseIdentity'
import {
  getActiveWorkoutProgram,
  getProgramBenchmarkExercises,
  getProgramBenchmarkExercisesWithFallback,
  getProgramNutritionTargets,
} from './activeWorkoutProgram'
import {
  calculateWeeklyScore,
  formatWeekRange,
  generateNextWeekFocus,
  generateWarnings,
  getBodyProgressSummary,
  getCheckInsForWeek,
  getMuscleVolumeSummary,
  getNutritionForWeek,
  getNutritionSummary,
  getSessionsForWeek,
  getStrengthComparison,
  getWeekRange,
  getWorkoutCompletionSummary,
} from './weeklyReviewUtils'

export function printElement(elementId) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  const element = document.getElementById(elementId)
  if (!element) {
    return false
  }

  const printWindow = window.open('', '_blank', 'width=980,height=720')
  if (!printWindow) {
    return false
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Workout OS Print</title>
        <style>${printDocumentCss}</style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()

  window.setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 120)

  return true
}

export function openPrintView(type, data) {
  return { type, data }
}

export function formatPrintDate(date) {
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return String(date ?? '-')
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function getTodayWorkoutForPrint(workoutPlan) {
  return getWorkoutForDate(new Date(), workoutPlan)
}

export function getLatestWorkoutSession(sessions = []) {
  return [...safeArray(sessions)]
    .filter((session) => session?.completed || safeArray(session?.exercises).length > 0)
    .sort((a, b) => sessionTime(b) - sessionTime(a))[0] ?? null
}

export function prepareWeeklyPlanPrintData(workoutPlan, profile, activeProgram) {
  return {
    generatedAt: new Date().toISOString(),
    plan: safeArray(workoutPlan),
    profile,
    program: activeProgram ?? getActiveWorkoutProgram(),
  }
}

export function buildWeeklyReviewPrintData({
  date = new Date(),
  sessions = [],
  checkIns = [],
  nutritionLogs = [],
  workoutPlan = [],
  activeProgram = getActiveWorkoutProgram(),
  exerciseLibrary = getEffectiveExerciseLibrary(),
} = {}) {
  const week = getWeekRange(date)
  const previousAnchor = new Date(week.start)
  previousAnchor.setDate(week.start.getDate() - 7)
  const previousWeek = getWeekRange(previousAnchor)
  const weekSessions = getSessionsForWeek(sessions, week.start, week.end)
  const previousWeekSessions = getSessionsForWeek(
    sessions,
    previousWeek.start,
    previousWeek.end,
  )
  const weekNutrition = getNutritionForWeek(nutritionLogs, week.start, week.end)
  const weekCheckIns = getCheckInsForWeek(checkIns, week.start, week.end)
  const program = {
    ...activeProgram,
    days: safeArray(activeProgram?.days).length
      ? activeProgram.days
      : safeArray(workoutPlan),
  }
  const explicitBenchmarkExercises = getProgramBenchmarkExercises(
    program,
    exerciseLibrary,
  )
  const benchmarkExercises =
    explicitBenchmarkExercises.length > 0 ||
    safeArray(program.benchmarkExerciseIds).length > 0
      ? explicitBenchmarkExercises
      : getProgramBenchmarkExercisesWithFallback(program, exerciseLibrary)
  const workoutSummary = getWorkoutCompletionSummary(weekSessions, program)
  const muscleVolume = getMuscleVolumeSummary(weekSessions, program, {
    library: exerciseLibrary,
  })
  const strengthComparison = getStrengthComparison(
    weekSessions,
    previousWeekSessions,
    benchmarkExercises,
    { library: exerciseLibrary },
  )
  const bodySummary = getBodyProgressSummary(weekCheckIns, checkIns)
  const nutritionSummary = getNutritionSummary(
    weekNutrition,
    getProgramNutritionTargets(program),
  )
  const progressionSuggestions = benchmarkExercises
    .map((benchmark) =>
      safeArray(program.days)
        .flatMap((day) => safeArray(day?.exercises))
        .find((exercise) =>
          exerciseIdentitiesMatch(
            { exerciseId: exercise?.id, exerciseName: exercise?.name },
            { exerciseId: benchmark.id, exerciseName: benchmark.name },
            { library: exerciseLibrary },
          ),
        ),
    )
    .filter(Boolean)
    .map((exercise) =>
      getProgressionSuggestion(exercise, sessions, {
        library: exerciseLibrary,
      }),
    )
  const weeklyScore = calculateWeeklyScore({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
  })
  const focusItems = generateNextWeekFocus({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
    progressionSuggestions,
    activeProgram: program,
  })
  const warnings = generateWarnings({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
    weekSessions,
    activeProgram: program,
  })

  return {
    week,
    weekEnd: dateKey(week.end),
    weekLabel: formatWeekRange(week.start, week.end),
    weekStart: dateKey(week.start),
    workoutSummary,
    muscleVolume,
    strengthComparison,
    bodySummary,
    nutritionSummary,
    weeklyScore,
    focusItems,
    warnings,
    program,
    generatedAt: new Date().toISOString(),
  }
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function sessionTime(session) {
  const timestamp = session?.finishedAt || session?.date
  const parsed = new Date(timestamp).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function dateKey(date) {
  const parsed = date instanceof Date ? date : new Date(date)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

const printDocumentCss = `
  @page {
    margin: 14mm;
    size: A4 portrait;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background: #fff;
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    line-height: 1.35;
    margin: 0;
  }

  h1, h2, h3, p {
    margin-top: 0;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 6px;
  }

  h2 {
    border-bottom: 1px solid #222;
    font-size: 16px;
    margin: 18px 0 8px;
    padding-bottom: 4px;
  }

  h3 {
    font-size: 13px;
    margin-bottom: 6px;
  }

  table {
    border-collapse: collapse;
    margin-bottom: 12px;
    width: 100%;
  }

  th, td {
    border: 1px solid #c7c7c7;
    padding: 6px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: #efefef;
    font-weight: 700;
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }

  img {
    border: 1px solid #ccc;
    max-height: 150px;
    max-width: 160px;
    object-fit: cover;
  }

  .print-page {
    background: #fff;
    color: #111;
    page-break-after: always;
  }

  .print-page:last-child {
    page-break-after: auto;
  }

  .print-meta-grid,
  .print-summary-grid,
  .print-line-grid,
  .print-photo-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 12px;
  }

  .print-meta,
  .print-summary-box,
  .print-line,
  .print-note-box,
  .print-empty {
    border: 1px solid #c7c7c7;
    padding: 8px;
  }

  .print-label {
    color: #444;
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .print-exercise-status {
    color: #7a3f00;
    font-size: 9px;
    font-weight: 700;
    margin-top: 2px;
    text-transform: uppercase;
  }

  .print-signature {
    margin-top: 22px;
  }

  .print-wide-table {
    font-size: 10px;
  }

  .print-small {
    color: #444;
    font-size: 10px;
  }
`

import { getActiveWorkoutProgram } from './activeWorkoutProgram'

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

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function sessionTime(session) {
  const timestamp = session?.finishedAt || session?.date
  const parsed = new Date(timestamp).getTime()
  return Number.isFinite(parsed) ? parsed : 0
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

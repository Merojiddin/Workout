export function PrintableTodayWorkout({ generatedAt, program, workout }) {
  const exercises = safeArray(workout?.exercises)
  const scheduledDay = getScheduledDay(workout)
  const isStandalone = Boolean(workout) && scheduledDay === null

  return (
    <article className="print-page">
      <h1>Today's Workout</h1>
      {workout ? (
        <>
          <div className="print-meta-grid">
            <div className="print-meta">
              <span className="print-label">Program</span>
              <strong>{program?.programName ?? 'Custom Workout Plan'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Program ID</span>
              <strong>{program?.programId ?? '-'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Version</span>
              <strong>{program?.programVersion ?? '-'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Plan status</span>
              <strong>{getPlanStatus(program)}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Printed</span>
              <strong>{formatDate(generatedAt)}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Workout</span>
              <strong>
                {scheduledDay === null
                  ? `${workout.name} — Standalone workout`
                  : `Day ${scheduledDay} - ${workout.name}`}
              </strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Estimated time</span>
              <strong>{workout.estimatedTime}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Focus</span>
              <strong>{safeArray(workout.focus).join(', ') || '-'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Posture reminder</span>
              <strong>
                {program?.rules?.postureCue ??
                  'Keep every repetition controlled and stop if form deteriorates.'}
              </strong>
            </div>
          </div>

          {isStandalone ? (
            <section>
              <h2>Standalone Workout</h2>
              <p>
                This optional session is outside the normal weekly rotation.
                Completing it does not replace or advance a scheduled day.
              </p>
              {workout.description ? <p>{workout.description}</p> : null}
              {workout.recommendedUse ? (
                <p>
                  <strong>Recommended use:</strong> {workout.recommendedUse}
                </p>
              ) : null}
              {safeArray(workout.rules).length > 0 ? (
                <div>
                  <strong>Workout rules</strong>
                  <PrintList values={safeArray(workout.rules)} />
                </div>
              ) : null}
            </section>
          ) : null}

          <table>
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Sets / reps</th>
                <th>Rest</th>
                <th>Form tips</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>
                    <PrintableExerciseSlot exercise={exercise} />
                  </td>
                  <td>
                    {targetLabel(exercise)}
                    {exercise?.targetRir ? (
                      <>
                        <br />
                        <span className="print-small">
                          Target: {exercise.targetRir} RIR
                        </span>
                      </>
                    ) : null}
                    {safeArray(exercise?.phaseTargets).map((target, index) => (
                      <span
                        className="print-small"
                        key={`${safeArray(target?.weeks).join('-')}-${index}`}
                      >
                        <br />
                        {formatPhaseTarget(target)}
                      </span>
                    ))}
                  </td>
                  <td>{exercise.restSeconds ?? '-'} sec</td>
                  <td>
                    <PrintList
                      values={[
                        ...safeArray(exercise.formTips),
                        ...safeArray(exercise.guidance),
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="print-empty">No workout found for today.</p>
      )}
    </article>
  )
}

function PrintableExerciseSlot({ exercise }) {
  const home = safeArray(exercise?.alternatives?.home)
  const gym = safeArray(exercise?.alternatives?.gym)
  const hasAlternatives = home.length > 0 || gym.length > 0

  return (
    <>
      <strong>{exercise?.name ?? '-'}</strong>
      {exercise?.optional ? (
        <>
          <br />
          <span className="print-small">Optional slot</span>
        </>
      ) : null}
      {hasAlternatives ? (
        <span className="print-small">
          <br />
          <strong>{getSelectionInstruction(exercise)}</strong>
          <VariantLine label="Home" variants={home} />
          <VariantLine label="Gym" variants={gym} />
        </span>
      ) : null}
    </>
  )
}

function VariantLine({ label, variants }) {
  if (variants.length === 0) return null

  return (
    <>
      <br />
      <strong>{label}:</strong>{' '}
      {variants
        .map(
          (variant) =>
            `${variant?.name ?? '-'} (${variant?.equipment ?? '-'})${
              variant?.repRange
                ? ` — ${variant.repRange}`
                : variant?.duration
                  ? ` — ${variant.duration}`
                  : ''
            }`,
        )
        .join(' · ')}
    </>
  )
}

function PrintList({ values }) {
  if (values.length === 0) return <span>-</span>

  return (
    <ul>
      {values.map((value, index) => (
        <li key={`${value}-${index}`}>{value}</li>
      ))}
    </ul>
  )
}

function getSelectionInstruction(exercise) {
  if (exercise?.selectionMode !== 'multiple') {
    return 'Choose one; do not perform every alternative.'
  }

  const minimum = Math.max(1, Number(exercise?.minSelections) || 1)
  const maximum = Math.max(minimum, Number(exercise?.maxSelections) || minimum)
  return minimum === maximum
    ? `Choose ${minimum}.`
    : `Choose ${minimum}-${maximum}.`
}

function formatPhaseTarget(target) {
  const prescription = [
    target?.sets ? `${target.sets} sets` : '',
    target?.repRange ?? target?.duration ?? '',
  ]
    .filter(Boolean)
    .join(' × ')
  const guidance = safeArray(target?.guidance).join(' ')
  return `${formatWeeks(target?.weeks)}: ${[prescription, guidance]
    .filter(Boolean)
    .join(' · ')}`
}

function formatWeeks(weeks) {
  const sorted = [
    ...new Set(safeArray(weeks).map(Number).filter(Number.isFinite)),
  ].sort((left, right) => left - right)
  if (sorted.length === 0) return 'Weeks not specified'
  if (sorted.length === 1) return `Week ${sorted[0]}`
  const sequential = sorted.every(
    (week, index) => index === 0 || week === sorted[index - 1] + 1,
  )
  return sequential
    ? `Weeks ${sorted[0]}-${sorted.at(-1)}`
    : `Weeks ${sorted.join(', ')}`
}

function getScheduledDay(workout) {
  const day = Number(workout?.day)
  return Number.isInteger(day) && day > 0 ? day : null
}

function targetLabel(exercise) {
  return `${exercise?.sets ?? '-'} sets x ${
    exercise?.repRange ?? exercise?.duration ?? 'rep range unknown'
  }`
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function formatDate(value) {
  const date = new Date(value ?? '')
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
}

function getPlanStatus(program) {
  if (program?.modifiedAfterInstallation) return 'Modified after installation'
  if (program?.installed) return 'Installed plan unchanged'
  return program?.source === 'custom' ? 'Custom plan' : 'Default plan'
}

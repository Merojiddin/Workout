export function PrintableWeeklyPlan({ data }) {
  const plan = Array.isArray(data?.plan) ? data.plan : []
  const settings = data?.profile ?? {}
  const profile = settings.profile ?? {}
  const goals = settings.goals ?? {}
  const program = data?.program ?? {}
  const progressionPhases = safeArray(program?.progressionPhases)
  const standaloneWorkouts = safeArray(program?.standaloneWorkouts)
  const ruleSections = getRuleSections(program?.rules)

  return (
    <article className="print-page">
      <h1>Weekly Workout Plan</h1>
      <div className="print-meta-grid">
        <div className="print-meta">
          <span className="print-label">Program</span>
          <strong>{program.programName ?? 'Custom Workout Plan'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Program ID</span>
          <strong>{program.programId ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Version</span>
          <strong>{program.programVersion ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Plan status</span>
          <strong>{getPlanStatus(program)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Printed</span>
          <strong>{formatDate(data?.generatedAt)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Name</span>
          <strong>{profile.name ?? 'Mike'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Goal</span>
          <strong>{profile.trainingGoal ?? goals.primaryGoal ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Main focus</span>
          <strong>{profile.mainFocus ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Training time</span>
          <strong>{profile.trainingTimePerDay ?? '-'}</strong>
        </div>
        {program?.durationWeeks ? (
          <div className="print-meta">
            <span className="print-label">Program duration</span>
            <strong>{program.durationWeeks} weeks</strong>
          </div>
        ) : null}
      </div>

      {progressionPhases.length > 0 ? (
        <>
          <h2>Progression Phases</h2>
          <table>
            <thead>
              <tr>
                <th>Weeks</th>
                <th>Phase</th>
                <th>Volume</th>
                <th>Effort / RIR</th>
                <th>Priorities and limits</th>
              </tr>
            </thead>
            <tbody>
              {progressionPhases.map((phase) => (
                <tr key={`${phase?.name}-${safeArray(phase?.weeks).join('-')}`}>
                  <td>{formatWeeks(phase?.weeks)}</td>
                  <td><strong>{phase?.name ?? '-'}</strong></td>
                  <td>{phase?.volumeGuidance ?? '-'}</td>
                  <td>{phase?.rirGuidance ?? '-'}</td>
                  <td>
                    <PrintList values={[
                      ...safeArray(phase?.priorities),
                      ...safeArray(phase?.restrictions),
                      ...safeArray(phase?.assessmentItems),
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {ruleSections.length > 0 ? (
        <>
          <h2>Program Rules</h2>
          <table>
            <tbody>
              {ruleSections.map((section) => (
                <tr key={section.title}>
                  <th>{section.title}</th>
                  <td><PrintList values={section.values} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {plan.length > 0 ? (
        <table className="print-wide-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Workout</th>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps / Duration</th>
              <th>Rest</th>
              <th>Muscle</th>
              <th>Equipment</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {plan.flatMap((day) =>
              safeArray(day?.exercises).map((exercise, index) => (
                <tr key={`${day?.day}-${exercise?.id ?? index}`}>
                  {index === 0 ? (
                    <>
                      <td rowSpan={Math.max(safeArray(day?.exercises).length, 1)}>
                        Day {day?.day ?? '-'}
                      </td>
                      <td rowSpan={Math.max(safeArray(day?.exercises).length, 1)}>
                        <strong>{day?.name ?? '-'}</strong>
                        <br />
                        <span className="print-small">
                          {safeArray(day?.focus).join(', ') || '-'}
                          <br />
                          {day?.estimatedTime ?? ''}
                        </span>
                      </td>
                    </>
                  ) : null}
                  <td>
                    <PrintableExerciseSlot exercise={exercise} />
                  </td>
                  <td>{exercise?.sets ?? '-'}</td>
                  <td>
                    {exercise?.repRange ?? exercise?.duration ?? '-'}
                    {exercise?.targetRir ? (
                      <>
                        <br />
                        <span className="print-small">
                          Target: {exercise.targetRir} RIR
                        </span>
                      </>
                    ) : null}
                    {safeArray(exercise?.phaseTargets).map((target, targetIndex) => (
                      <span
                        className="print-small"
                        key={`${safeArray(target?.weeks).join('-')}-${targetIndex}`}
                      >
                        <br />{formatPhaseTarget(target)}
                      </span>
                    ))}
                  </td>
                  <td>{exercise?.restSeconds ?? '-'} sec</td>
                  <td>{exercise?.muscleGroup ?? 'Other'}</td>
                  <td>{exercise?.equipment ?? '-'}</td>
                  <td>{exercise?.notes ?? day?.notes ?? ''}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      ) : (
        <p className="print-empty">No workout plan found.</p>
      )}

      {standaloneWorkouts.length > 0 ? (
        <section>
          <h2>Optional Standalone Workouts</h2>
          <p>
            These workouts are outside the normal weekly rotation. Completing
            one does not replace or advance a scheduled day.
          </p>
          {standaloneWorkouts.map((workout) => (
            <section key={workout?.id ?? workout?.name}>
              <h3>{workout?.name ?? 'Standalone workout'}</h3>
              <p>
                {workout?.description ?? ''}
                {workout?.recommendedUse ? (
                  <>
                    <br />
                    <strong>Recommended use:</strong>{' '}
                    {workout.recommendedUse}
                  </>
                ) : null}
                <br />
                <strong>Estimated time:</strong>{' '}
                {workout?.estimatedTime ?? '-'}
                {' · '}
                <strong>Focus:</strong>{' '}
                {safeArray(workout?.focus).join(', ') || '-'}
              </p>
              {safeArray(workout?.rules).length > 0 ? (
                <div>
                  <strong>Rules</strong>
                  <PrintList values={safeArray(workout.rules)} />
                </div>
              ) : null}
              <table>
                <thead>
                  <tr>
                    <th>Exercise slot</th>
                    <th>Sets</th>
                    <th>Reps / Duration</th>
                    <th>Rest</th>
                    <th>Muscle</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {safeArray(workout?.exercises).map((exercise, index) => (
                    <tr key={`${workout?.id}-${exercise?.id ?? index}`}>
                      <td><PrintableExerciseSlot exercise={exercise} /></td>
                      <td>{exercise?.sets ?? '-'}</td>
                      <td>
                        {exercise?.repRange ?? exercise?.duration ?? '-'}
                        {exercise?.targetRir ? ` · ${exercise.targetRir} RIR` : ''}
                      </td>
                      <td>{exercise?.restSeconds ?? '-'} sec</td>
                      <td>{exercise?.muscleGroup ?? 'Other'}</td>
                      <td>{safeArray(exercise?.guidance).join(' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </section>
      ) : null}
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
          <br /><span className="print-small">Optional slot</span>
        </>
      ) : null}
      {hasAlternatives ? (
        <span className="print-small">
          <br /><strong>{getSelectionInstruction(exercise)}</strong>
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

function getRuleSections(rules) {
  return [
    { title: 'Effort and RIR', values: safeArray(rules?.effort) },
    { title: 'Double progression', values: safeArray(rules?.progression) },
    { title: 'Rest between sets', values: safeArray(rules?.rest) },
    { title: 'Exercise substitutions', values: safeArray(rules?.substitutions) },
    { title: 'Return after a break', values: safeArray(rules?.returnAfterBreak) },
    { title: 'Safety', values: safeArray(rules?.safety) },
    { title: 'Optional neck work', values: safeArray(rules?.optionalNeckWork) },
    {
      title: 'Posture and control',
      values: rules?.postureCue ? [rules.postureCue] : [],
    },
  ].filter((section) => section.values.length > 0)
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
  ].filter(Boolean).join(' × ')
  const guidance = safeArray(target?.guidance).join(' ')
  return `${formatWeeks(target?.weeks)}: ${[prescription, guidance]
    .filter(Boolean)
    .join(' · ')}`
}

function formatWeeks(weeks) {
  const sorted = [...new Set(safeArray(weeks).map(Number).filter(Number.isFinite))]
    .sort((left, right) => left - right)
  if (sorted.length === 0) return 'Weeks not specified'
  if (sorted.length === 1) return `Week ${sorted[0]}`
  const sequential = sorted.every(
    (week, index) => index === 0 || week === sorted[index - 1] + 1,
  )
  return sequential
    ? `Weeks ${sorted[0]}-${sorted.at(-1)}`
    : `Weeks ${sorted.join(', ')}`
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

import { formatDate as formatLocaleDate, t } from '../i18n'
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
      <h1>{t('print.plan.title')}</h1>
      <div className="print-meta-grid">
        <div className="print-meta">
          <span className="print-label">{t('print.program')}</span>
          <strong>{program.programName ?? t('program.customPlanName')}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.programId')}</span>
          <strong>{program.programId ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.version')}</span>
          <strong>{program.programVersion ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.planStatus')}</span>
          <strong>{getPlanStatus(program)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.printed')}</span>
          <strong>{formatDate(data?.generatedAt)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Name</span>
          <strong>{printable(profile.name)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('checkin.goal')}</span>
          <strong>{printable(profile.trainingGoal || goals.primaryGoal)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.mainFocus')}</span>
          <strong>{printable(profile.mainFocus)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">{t('print.trainingTime')}</span>
          <strong>{printable(profile.trainingTimePerDay)}</strong>
        </div>
        {program?.durationWeeks ? (
          <div className="print-meta">
            <span className="print-label">{t('print.programDuration')}</span>
            <strong>{program.durationWeeks} weeks</strong>
          </div>
        ) : null}
      </div>

      {progressionPhases.length > 0 ? (
        <>
          <h2>{t('print.phases')}</h2>
          <table>
            <thead>
              <tr>
                <th>{t('print.weeks')}</th>
                <th>{t('print.phase')}</th>
                <th>{t('print.volume')}</th>
                <th>{t('print.effortRir')}</th>
                <th>{t('print.prioritiesLimits')}</th>
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
          <h2>{t('print.rules')}</h2>
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
              <th>{t('print.workout')}</th>
              <th>{t('print.exercise')}</th>
              <th>{t('print.sets')}</th>
              <th>{t('print.repsDuration')}</th>
              <th>{t('print.rest')}</th>
              <th>{t('print.muscle')}</th>
              <th>{t('print.equipment')}</th>
              <th>{t('print.notes')}</th>
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
        <p className="print-empty">{t('print.noPlan')}</p>
      )}

      {standaloneWorkouts.length > 0 ? (
        <section>
          <h2>{t('print.standalone')}</h2>
          <p>
            These workouts are outside the normal weekly rotation. Completing
            one does not replace or advance a scheduled day.
          </p>
          {standaloneWorkouts.map((workout) => (
            <section key={workout?.id ?? workout?.name}>
              <h3>{workout?.name ?? t('print.standaloneFallback')}</h3>
              <p>
                {workout?.description ?? ''}
                {workout?.recommendedUse ? (
                  <>
                    <br />
                    <strong>{t('print.recommendedUse')}</strong>{' '}
                    {workout.recommendedUse}
                  </>
                ) : null}
                <br />
                <strong>{t('print.estimatedTime')}</strong>{' '}
                {workout?.estimatedTime ?? '-'}
                {' · '}
                <strong>{t('print.focus')}</strong>{' '}
                {safeArray(workout?.focus).join(', ') || '-'}
              </p>
              {safeArray(workout?.rules).length > 0 ? (
                <div>
                  <strong>{t('plan.workoutRules')}</strong>
                  <PrintList values={safeArray(workout.rules)} />
                </div>
              ) : null}
              <table>
                <thead>
                  <tr>
                    <th>{t('print.exerciseSlot')}</th>
                    <th>{t('print.sets')}</th>
                    <th>{t('print.repsDuration')}</th>
                    <th>{t('print.rest')}</th>
                    <th>{t('print.muscle')}</th>
                    <th>{t('print.notes')}</th>
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
                      <td>
                        {exercise?.restSeconds === undefined ||
                        exercise?.restSeconds === null
                          ? '-'
                          : t('print.restSeconds', {
                              seconds: exercise.restSeconds,
                            })}
                      </td>
                      <td>{exercise?.muscleGroup ?? t('plan.muscleFallback')}</td>
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
          <br /><span className="print-small">{t('print.optionalSlot')}</span>
        </>
      ) : null}
      {hasAlternatives ? (
        <span className="print-small">
          <br /><strong>{getSelectionInstruction(exercise)}</strong>
          <VariantLine label={t('plan.home')} variants={home} />
          <VariantLine label={t('plan.gym')} variants={gym} />
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
    { title: t('plan.rules.effort'), values: safeArray(rules?.effort) },
    { title: t('plan.rules.progression'), values: safeArray(rules?.progression) },
    { title: t('plan.rules.rest'), values: safeArray(rules?.rest) },
    {
      title: t('plan.rules.substitutions'),
      values: safeArray(rules?.substitutions),
    },
    {
      title: t('plan.rules.returnAfterBreak'),
      values: safeArray(rules?.returnAfterBreak),
    },
    { title: t('plan.rules.safety'), values: safeArray(rules?.safety) },
    {
      title: t('plan.rules.optionalNeckWork'),
      values: safeArray(rules?.optionalNeckWork),
    },
    {
      title: t('plan.rules.posture'),
      values: rules?.postureCue ? [rules.postureCue] : [],
    },
  ].filter((section) => section.values.length > 0)
}

function getSelectionInstruction(exercise) {
  if (exercise?.selectionMode !== 'multiple') {
    return t('print.chooseOne')
  }
  const minimum = Math.max(1, Number(exercise?.minSelections) || 1)
  const maximum = Math.max(minimum, Number(exercise?.maxSelections) || minimum)
  return minimum === maximum
    ? t('print.chooseCount', { count: minimum })
    : t('print.chooseRange', { min: minimum, max: maximum })
}

function formatPhaseTarget(target) {
  const prescription = [
    target?.sets ? t('plan.setsTimes', { count: target.sets }) : '',
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
  if (sorted.length === 0) return t('plan.weeksNotSpecified')
  if (sorted.length === 1) return t('plan.weekSingle', { week: sorted[0] })
  const sequential = sorted.every(
    (week, index) => index === 0 || week === sorted[index - 1] + 1,
  )
  return sequential
    ? t('plan.weekRange', { from: sorted[0], to: sorted.at(-1) })
    : t('plan.weekList', { weeks: sorted.join(', ') })
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

/**
 * Profile fields are optional, so a printed plan has to cope with a user who
 * never filled them in. '' is the unset value, which ?? would happily print as
 * an empty cell, so this checks for blank rather than for nullish.
 */
function printable(value) {
  const text = typeof value === 'string' ? value.trim() : value
  return text ? text : t('state.notSet')
}

function formatDate(value) {
  const date = new Date(value ?? '')
  return Number.isNaN(date.getTime())
    ? '-'
    : formatLocaleDate(date, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

function getPlanStatus(program) {
  if (program?.modifiedAfterInstallation) return t('print.status.modified')
  if (program?.installed) return t('print.status.unchanged')
  return program?.source === 'custom'
    ? t('print.status.custom')
    : t('print.status.default')
}

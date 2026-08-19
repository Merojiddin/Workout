import { BookOpen, CalendarDays, Clock3, Printer, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { t as translateText, useT } from '../i18n'
import { PrintableWeeklyPlan } from '../print/PrintableWeeklyPlan'
import type { LibraryExercise } from '../data/exerciseLibrary'
import type { Exercise, ExercisePhaseTarget } from '../data/workoutPlan'
import {
  findLibraryExerciseForWorkout,
  getExerciseTargetLabel,
  getUserProfileSettings,
} from '../utils/settingsUtils'
import { prepareWeeklyPlanPrintData, printElement } from '../utils/printUtils'
import type { PageId } from '../types/navigation'
import {
  getActiveWorkoutProgram,
  getRestDays,
  getTrainingDays,
} from '../utils/activeWorkoutProgram'

interface WeeklyPlanProps {
  onNavigate: (page: PageId) => void
}

export function WeeklyPlan({ onNavigate }: WeeklyPlanProps) {
  const t = useT()
  const [viewingExercise, setViewingExercise] = useState<LibraryExercise | null>(
    null,
  )
  const activeProgram = getActiveWorkoutProgram()
  const plan = activeProgram.days
  const trainingDayCount = getTrainingDays(activeProgram).length
  const restDayCount = getRestDays(activeProgram).length
  const ruleSections = getRuleSections(activeProgram.rules)
  const weeklyPlanPrintData = prepareWeeklyPlanPrintData(
    plan,
    getUserProfileSettings(),
    activeProgram,
  )

  return (
    <section className="weekly-plan-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">{t('plan.eyebrow')}</p>
          <h1>{activeProgram.programName}</h1>
          <p>{activeProgram.description}</p>
          <div className="tag-row">
            <span className="tag tag--category">
              {t('plan.splitTag', { days: plan.length })}
            </span>
            {activeProgram.programVersion ? (
              <span className="tag tag--secondary-muscle">
                {t('plan.versionTag', { version: activeProgram.programVersion })}
              </span>
            ) : null}
            {activeProgram.durationWeeks ? (
              <span className="tag tag--secondary-muscle">
                {t('plan.weeksTag', { count: activeProgram.durationWeeks })}
              </span>
            ) : null}
            {activeProgram.modifiedAfterInstallation ? (
              <span className="tag tag--secondary-muscle">
                {t('plan.modifiedTag')}
              </span>
            ) : null}
          </div>
          {activeProgram.goals.length > 0 ? (
            <p>
              <strong>{t('plan.goals')}</strong> {activeProgram.goals.join(' · ')}
            </p>
          ) : null}
        </div>
        <div className="progress-hero-actions">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => printElement('weekly-plan-print-source')}
            type="button"
          >
            <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('plan.print')}
          </button>
          <button
            className="demo-data-button"
            onClick={() => onNavigate('settings')}
            type="button"
          >
            <SlidersHorizontal size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('plan.changeProgram')}
          </button>
        </div>
        <div className="hero-target">
          <CalendarDays size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>{t('plan.schedule')}</span>
          <strong>
            {t('plan.scheduleSummary', {
              sessions: t('plan.scheduledSessions', { count: trainingDayCount }),
              rest: t('plan.restDays', { count: restDayCount }),
            })}
          </strong>
        </div>
      </header>

      {activeProgram.progressionPhases.length > 0 ? (
        <section aria-labelledby="program-progression-title">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t('plan.progressionEyebrow')}</p>
              <h2 id="program-progression-title">
                {activeProgram.durationWeeks
                  ? t('plan.progressionTitle', {
                      weeks: activeProgram.durationWeeks,
                    })
                  : t('plan.progressionTitleGeneric')}
              </h2>
            </div>
          </div>
          <div className="weekly-plan-grid">
            {activeProgram.progressionPhases.map((phase) => (
              <article
                className="dashboard-card weekly-day-card"
                key={`${phase.name}-${phase.weeks.join('-')}`}
              >
                <p className="eyebrow">{formatWeeks(phase.weeks)}</p>
                <h3>{phase.name}</h3>
                <p>
                  <strong>{t('plan.volume')}</strong> {phase.volumeGuidance}
                </p>
                <p>
                  <strong>{t('plan.effort')}</strong> {phase.rirGuidance}
                </p>
                <GuidanceList
                  title={t('plan.priorities')}
                  values={phase.priorities}
                />
                <GuidanceList
                  title={t('plan.restrictions')}
                  values={phase.restrictions ?? []}
                />
                <GuidanceList
                  title={t('plan.assessment')}
                  values={phase.assessmentItems ?? []}
                />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {ruleSections.length > 0 ? (
        <section aria-labelledby="program-rules-title">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t('plan.rulesEyebrow')}</p>
              <h2 id="program-rules-title">{t('plan.rulesTitle')}</h2>
            </div>
          </div>
          <div className="weekly-plan-grid">
            {ruleSections.map((section) => (
              <article
                className="dashboard-card weekly-day-card"
                key={section.title}
              >
                <h3>{section.title}</h3>
                <GuidanceList values={section.values} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="weekly-plan-grid">
        {plan.map((day) => (
          <article className="dashboard-card weekly-day-card" key={day.day}>
            <div className="weekly-day-card__head">
              <div>
                <p className="eyebrow">{t('workout.dayNumber', { day: day.day })}</p>
                <h2>{day.name}</h2>
              </div>
              <span className="weekly-day-time">
                <Clock3 size={16} strokeWidth={2.4} aria-hidden="true" />
                {day.estimatedTime}
              </span>
            </div>

            <div className="weekly-focus-row">
              {day.focus.map((focus) => (
                <span className="weekly-focus-chip" key={focus}>
                  {focus}
                </span>
              ))}
            </div>

            <ul className="weekly-exercise-list">
              {day.exercises.map((exercise, index) => (
                <ExerciseSlotRow
                  exercise={exercise}
                  key={`${exercise.id}-${index}`}
                  onOpenGuide={setViewingExercise}
                />
              ))}
            </ul>
          </article>
        ))}
      </div>

      {activeProgram.standaloneWorkouts.length > 0 ? (
        <section aria-labelledby="standalone-workouts-title">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t('plan.standaloneEyebrow')}</p>
              <h2 id="standalone-workouts-title">{t('plan.standaloneTitle')}</h2>
              <p>{t('plan.standaloneIntro')}</p>
            </div>
          </div>
          <div className="weekly-plan-grid">
            {activeProgram.standaloneWorkouts.map((workout) => (
              <article
                className="dashboard-card weekly-day-card"
                key={workout.id}
              >
                <div className="weekly-day-card__head">
                  <div>
                    <p className="eyebrow">{t('plan.standaloneCard')}</p>
                    <h3>{workout.name}</h3>
                  </div>
                  <span className="weekly-day-time">
                    <Clock3 size={16} strokeWidth={2.4} aria-hidden="true" />
                    {workout.estimatedTime}
                  </span>
                </div>
                <p>{workout.description}</p>
                <p>
                  <strong>{t('plan.whenToUse')}</strong> {workout.recommendedUse}
                </p>
                <div className="weekly-focus-row">
                  {workout.focus.map((focus) => (
                    <span className="weekly-focus-chip" key={focus}>
                      {focus}
                    </span>
                  ))}
                </div>
                <GuidanceList
                  title={t('plan.workoutRules')}
                  values={workout.rules ?? []}
                />
                <ul className="weekly-exercise-list">
                  {workout.exercises.map((exercise, index) => (
                    <ExerciseSlotRow
                      exercise={exercise}
                      key={`${workout.id}-${exercise.id}-${index}`}
                      onOpenGuide={setViewingExercise}
                    />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="print-source" id="weekly-plan-print-source" aria-hidden="true">
        <PrintableWeeklyPlan data={weeklyPlanPrintData} />
      </div>

      {viewingExercise ? (
        <ExerciseDetailModal
          exercise={viewingExercise}
          onClose={() => setViewingExercise(null)}
        />
      ) : null}
    </section>
  )
}

function ExerciseSlotRow({
  exercise,
  onOpenGuide,
}: {
  exercise: Exercise
  onOpenGuide: (exercise: LibraryExercise) => void
}) {
  const t = useT()
  const guide = findLibraryExerciseForWorkout(exercise)
  const homeAlternatives = exercise.alternatives?.home ?? []
  const gymAlternatives = exercise.alternatives?.gym ?? []
  const hasAlternatives =
    homeAlternatives.length > 0 || gymAlternatives.length > 0

  return (
    <li className="weekly-exercise-row">
      <div className="weekly-exercise-info">
        {guide ? (
          <button
            className="weekly-exercise-name"
            onClick={() => onOpenGuide(guide)}
            type="button"
          >
            {exercise.name}
          </button>
        ) : (
          <span className="weekly-exercise-name weekly-exercise-name--static">
            {exercise.name}
          </span>
        )}
        <span className="weekly-exercise-target">
          {exercise.optional ? t('plan.optionalPrefix') : ''}
          {getExerciseTargetLabel(exercise)}
          {exercise.targetRir
            ? ` · ${t('plan.rirSuffix', { value: exercise.targetRir })}`
            : ''}
        </span>
        <span className="weekly-exercise-meta">
          {t('plan.exerciseMeta', {
            seconds: exercise.restSeconds ?? 0,
            muscle: exercise.muscleGroup ?? t('plan.muscleFallback'),
            equipment: exercise.equipment ?? t('plan.equipmentFallback'),
          })}
        </span>
        {hasAlternatives ? (
          <>
            <span className="weekly-exercise-meta">
              <strong>{getSelectionInstruction(exercise)}</strong>
            </span>
            <AlternativeLine label={t('plan.home')} variants={homeAlternatives} />
            <AlternativeLine label={t('plan.gym')} variants={gymAlternatives} />
          </>
        ) : null}
        {safeArray(exercise.guidance).length > 0 ? (
          <GuidanceList
            title={t('plan.guidance')}
            values={exercise.guidance ?? []}
          />
        ) : null}
        {safeArray(exercise.phaseTargets).length > 0 ? (
          <GuidanceList
            title={t('plan.phaseTargets')}
            values={(exercise.phaseTargets ?? []).map(formatPhaseTarget)}
          />
        ) : null}
      </div>
      {guide ? (
        <button
          aria-label={t('plan.openGuideFor', { name: exercise.name })}
          className="weekly-guide-button"
          onClick={() => onOpenGuide(guide)}
          type="button"
        >
          <BookOpen size={15} strokeWidth={2.4} aria-hidden="true" />
          {t('plan.guide')}
        </button>
      ) : null}
    </li>
  )
}

function AlternativeLine({
  label,
  variants,
}: {
  label: string
  variants: NonNullable<Exercise['alternatives']>['home']
}) {
  if (!variants || variants.length === 0) return null

  return (
    <span className="weekly-exercise-meta">
      <strong>{label}:</strong>{' '}
      {variants
        .map((variant) =>
          `${variant.name} (${variant.equipment})${
            variant.repRange
              ? ` — ${variant.repRange}`
              : variant.duration
                ? ` — ${variant.duration}`
                : ''
          }`,
        )
        .join(' · ')}
    </span>
  )
}

function GuidanceList({
  title,
  values,
}: {
  title?: string
  values: readonly string[]
}) {
  if (values.length === 0) return null

  return (
    <div>
      {title ? <strong>{title}</strong> : null}
      <ul>
        {values.map((value, index) => (
          <li key={`${value}-${index}`}>{value}</li>
        ))}
      </ul>
    </div>
  )
}

function getRuleSections(rules: ReturnType<typeof getActiveWorkoutProgram>['rules']) {
  return [
    { title: translateText('plan.rules.effort'), values: rules.effort ?? [] },
    {
      title: translateText('plan.rules.progression'),
      values: rules.progression ?? [],
    },
    { title: translateText('plan.rules.rest'), values: rules.rest ?? [] },
    {
      title: translateText('plan.rules.substitutions'),
      values: rules.substitutions ?? [],
    },
    {
      title: translateText('plan.rules.returnAfterBreak'),
      values: rules.returnAfterBreak ?? [],
    },
    { title: translateText('plan.rules.safety'), values: rules.safety ?? [] },
    {
      title: translateText('plan.rules.optionalNeckWork'),
      values: rules.optionalNeckWork ?? [],
    },
    {
      title: translateText('plan.rules.posture'),
      values: rules.postureCue ? [rules.postureCue] : [],
    },
  ].filter((section) => section.values.length > 0)
}

function getSelectionInstruction(exercise: Exercise): string {
  const optionalPrefix = exercise.optional
    ? translateText('plan.optionalSlotPrefix')
    : ''
  if (exercise.selectionMode !== 'multiple') {
    return `${optionalPrefix}${translateText('plan.selectOne')}`
  }

  const minimum = Math.max(1, exercise.minSelections ?? 1)
  const maximum = Math.max(minimum, exercise.maxSelections ?? minimum)
  const count = minimum === maximum ? String(minimum) : `${minimum}-${maximum}`
  return `${optionalPrefix}${translateText('plan.selectCount', { count })}`
}

function formatPhaseTarget(target: ExercisePhaseTarget): string {
  const prescription = [
    target.sets ? translateText('plan.setsTimes', { count: target.sets }) : '',
    target.repRange ?? target.duration ?? '',
  ]
    .filter(Boolean)
    .join(' × ')
  const guidance = safeArray(target.guidance).join(' ')
  return `${formatWeeks(target.weeks)}: ${[prescription, guidance]
    .filter(Boolean)
    .join(' · ')}`
}

function formatWeeks(weeks: readonly number[]): string {
  const sorted = [...new Set(weeks)].sort((left, right) => left - right)
  if (sorted.length === 0) return translateText('plan.weeksNotSpecified')
  if (sorted.length === 1) return translateText('plan.weekSingle', { week: sorted[0] })
  const sequential = sorted.every(
    (week, index) => index === 0 || week === sorted[index - 1] + 1,
  )
  return sequential
    ? translateText('plan.weekRange', { from: sorted[0], to: sorted.at(-1) ?? '' })
    : translateText('plan.weekList', { weeks: sorted.join(', ') })
}

function safeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : []
}


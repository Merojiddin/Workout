import { BookOpen, CalendarDays, Clock3, Printer, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
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
          <p className="eyebrow">Weekly Plan</p>
          <h1>{activeProgram.programName}</h1>
          <p>{activeProgram.description}</p>
          <div className="tag-row">
            <span className="tag tag--category">
              {plan.length}-day training split
            </span>
            {activeProgram.programVersion ? (
              <span className="tag tag--secondary-muscle">
                Version {activeProgram.programVersion}
              </span>
            ) : null}
            {activeProgram.durationWeeks ? (
              <span className="tag tag--secondary-muscle">
                {activeProgram.durationWeeks} weeks
              </span>
            ) : null}
            {activeProgram.modifiedAfterInstallation ? (
              <span className="tag tag--secondary-muscle">
                Modified after installation
              </span>
            ) : null}
          </div>
          {activeProgram.goals.length > 0 ? (
            <p>
              <strong>Goals:</strong> {activeProgram.goals.join(' · ')}
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
            Print Weekly Plan
          </button>
          <button
            className="demo-data-button"
            onClick={() => onNavigate('plan-editor')}
            type="button"
          >
            <SlidersHorizontal size={19} strokeWidth={2.4} aria-hidden="true" />
            Edit Plan
          </button>
        </div>
        <div className="hero-target">
          <CalendarDays size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>Training schedule</span>
          <strong>
            {trainingDayCount} scheduled {pluralize(trainingDayCount, 'session')} ·{' '}
            {restDayCount} {pluralize(restDayCount, 'rest day')}
          </strong>
        </div>
      </header>

      {activeProgram.progressionPhases.length > 0 ? (
        <section aria-labelledby="program-progression-title">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Program progression</p>
              <h2 id="program-progression-title">
                {activeProgram.durationWeeks
                  ? `${activeProgram.durationWeeks}-week training phases`
                  : 'Training phases'}
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
                  <strong>Volume:</strong> {phase.volumeGuidance}
                </p>
                <p>
                  <strong>Effort:</strong> {phase.rirGuidance}
                </p>
                <GuidanceList title="Priorities" values={phase.priorities} />
                <GuidanceList
                  title="Restrictions"
                  values={phase.restrictions ?? []}
                />
                <GuidanceList
                  title="Assessment"
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
              <p className="eyebrow">How to use the plan</p>
              <h2 id="program-rules-title">Program rules</h2>
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
                <p className="eyebrow">Day {day.day}</p>
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
              <p className="eyebrow">Optional sessions</p>
              <h2 id="standalone-workouts-title">Standalone workouts</h2>
              <p>
                These sessions sit outside the normal weekly rotation and do
                not replace or advance a scheduled day.
              </p>
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
                    <p className="eyebrow">Standalone workout</p>
                    <h3>{workout.name}</h3>
                  </div>
                  <span className="weekly-day-time">
                    <Clock3 size={16} strokeWidth={2.4} aria-hidden="true" />
                    {workout.estimatedTime}
                  </span>
                </div>
                <p>{workout.description}</p>
                <p>
                  <strong>When to use:</strong> {workout.recommendedUse}
                </p>
                <div className="weekly-focus-row">
                  {workout.focus.map((focus) => (
                    <span className="weekly-focus-chip" key={focus}>
                      {focus}
                    </span>
                  ))}
                </div>
                <GuidanceList title="Rules" values={workout.rules ?? []} />
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
          {exercise.optional ? 'Optional · ' : ''}
          {getExerciseTargetLabel(exercise)}
          {exercise.targetRir ? ` · ${exercise.targetRir} RIR` : ''}
        </span>
        <span className="weekly-exercise-meta">
          Rest {exercise.restSeconds ?? 0}s · {exercise.muscleGroup ?? 'Other'} ·{' '}
          {exercise.equipment ?? 'Bodyweight'}
        </span>
        {hasAlternatives ? (
          <>
            <span className="weekly-exercise-meta">
              <strong>{getSelectionInstruction(exercise)}</strong>
            </span>
            <AlternativeLine label="Home" variants={homeAlternatives} />
            <AlternativeLine label="Gym" variants={gymAlternatives} />
          </>
        ) : null}
        {safeArray(exercise.guidance).length > 0 ? (
          <GuidanceList title="Guidance" values={exercise.guidance ?? []} />
        ) : null}
        {safeArray(exercise.phaseTargets).length > 0 ? (
          <GuidanceList
            title="Week-specific prescription"
            values={(exercise.phaseTargets ?? []).map(formatPhaseTarget)}
          />
        ) : null}
      </div>
      {guide ? (
        <button
          aria-label={`Open form guide for ${exercise.name}`}
          className="weekly-guide-button"
          onClick={() => onOpenGuide(guide)}
          type="button"
        >
          <BookOpen size={15} strokeWidth={2.4} aria-hidden="true" />
          Guide
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
    { title: 'Effort and RIR', values: rules.effort ?? [] },
    { title: 'Double progression', values: rules.progression ?? [] },
    { title: 'Rest between sets', values: rules.rest ?? [] },
    { title: 'Exercise substitutions', values: rules.substitutions ?? [] },
    { title: 'Return after a break', values: rules.returnAfterBreak ?? [] },
    { title: 'Safety', values: rules.safety ?? [] },
    { title: 'Optional neck work', values: rules.optionalNeckWork ?? [] },
    {
      title: 'Posture and control',
      values: rules.postureCue ? [rules.postureCue] : [],
    },
  ].filter((section) => section.values.length > 0)
}

function getSelectionInstruction(exercise: Exercise): string {
  const optionalPrefix = exercise.optional ? 'Optional slot. ' : ''
  if (exercise.selectionMode !== 'multiple') {
    return `${optionalPrefix}Choose one exercise from this slot; do not perform every alternative.`
  }

  const minimum = Math.max(1, exercise.minSelections ?? 1)
  const maximum = Math.max(minimum, exercise.maxSelections ?? minimum)
  const count = minimum === maximum ? String(minimum) : `${minimum}-${maximum}`
  return `${optionalPrefix}Choose ${count} exercises from this slot.`
}

function formatPhaseTarget(target: ExercisePhaseTarget): string {
  const prescription = [
    target.sets ? `${target.sets} sets` : '',
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
  if (sorted.length === 0) return 'Weeks not specified'
  if (sorted.length === 1) return `Week ${sorted[0]}`
  const sequential = sorted.every(
    (week, index) => index === 0 || week === sorted[index - 1] + 1,
  )
  return sequential
    ? `Weeks ${sorted[0]}-${sorted.at(-1)}`
    : `Weeks ${sorted.join(', ')}`
}

function safeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`
}

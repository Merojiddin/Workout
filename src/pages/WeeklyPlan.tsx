import { BookOpen, CalendarDays, Clock3, Printer, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { PrintableWeeklyPlan } from '../print/PrintableWeeklyPlan'
import type { LibraryExercise } from '../data/exerciseLibrary'
import {
  findLibraryExerciseForWorkout,
  getCustomWorkoutPlan,
  getExerciseTargetLabel,
  getUserProfileSettings,
} from '../utils/settingsUtils'
import { prepareWeeklyPlanPrintData, printElement } from '../utils/printUtils'
import type { PageId } from '../types/navigation'
import type { WorkoutDay } from '../data/workoutPlan'

interface WeeklyPlanProps {
  onNavigate: (page: PageId) => void
}

export function WeeklyPlan({ onNavigate }: WeeklyPlanProps) {
  const [viewingExercise, setViewingExercise] = useState<LibraryExercise | null>(
    null,
  )
  const plan = getCustomWorkoutPlan() as WorkoutDay[]
  const weeklyPlanPrintData = prepareWeeklyPlanPrintData(
    plan,
    getUserProfileSettings(),
  )

  return (
    <section className="weekly-plan-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Weekly Plan</p>
          <h1>7-Day Training Split</h1>
          <p>
            Your full week at a glance. Tap Guide on any exercise to open its
            form, muscles worked, mistakes, and progressions.
          </p>
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
          <span>Training days</span>
          <strong>6 on · 1 recovery</strong>
        </div>
      </header>

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
              {day.exercises.map((exercise) => {
                const guide = findLibraryExerciseForWorkout(exercise)

                return (
                  <li className="weekly-exercise-row" key={exercise.id}>
                    <div className="weekly-exercise-info">
                      {guide ? (
                        <button
                          className="weekly-exercise-name"
                          onClick={() => setViewingExercise(guide)}
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
                        {getExerciseTargetLabel(exercise)}
                      </span>
                      <span className="weekly-exercise-meta">
                        Rest {exercise.restSeconds ?? 0}s ·{' '}
                        {exercise.muscleGroup ?? 'Other'} ·{' '}
                        {exercise.equipment ?? 'Bodyweight'}
                      </span>
                    </div>
                    {guide ? (
                      <button
                        aria-label={`Open form guide for ${exercise.name}`}
                        className="weekly-guide-button"
                        onClick={() => setViewingExercise(guide)}
                        type="button"
                      >
                        <BookOpen size={15} strokeWidth={2.4} aria-hidden="true" />
                        Guide
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>

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

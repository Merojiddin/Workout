import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  ListOrdered,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import type { Difficulty, LibraryExercise } from '../data/exerciseLibrary'
import {
  findProgramDay,
  getActiveWorkoutProgram,
  getDayLabel,
  type ActiveWorkoutProgram,
} from '../utils/activeWorkoutProgram'
import { getGeneralProgressionAdvice } from '../utils/progressionUtils'
import { ExerciseMedia } from './ExerciseMedia'
import { ExerciseMediaEditor } from './ExerciseMediaEditor'
import { Tag, type TagVariant } from './Tag'

interface ExerciseDetailModalProps {
  exercise: LibraryExercise
  onClose: () => void
  /** When provided, the user can attach their own image / video link. */
  onUpdateExercise?: (exercise: LibraryExercise) => void
}

function difficultyVariant(difficulty: Difficulty): TagVariant {
  if (difficulty === 'Beginner') {
    return 'difficulty-beginner'
  }
  if (difficulty === 'Advanced') {
    return 'difficulty-advanced'
  }
  return 'difficulty-intermediate'
}

export function ExerciseDetailModal({
  exercise,
  onClose,
  onUpdateExercise,
}: ExerciseDetailModalProps) {
  const activeProgram = getActiveWorkoutProgram()
  const progressionAdvice = getGeneralProgressionAdvice({
    name: exercise.name,
    category: exercise.category,
    equipment: exercise.equipment,
    muscleGroup: exercise.postureFocus ? 'Posture' : undefined,
  })

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="exercise-detail-title"
        aria-modal="true"
        className="workout-detail-modal exercise-detail-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{exercise.category} · Form Guide</p>
            <h2 id="exercise-detail-title">{exercise.name}</h2>
            <p>{exercise.formCue}</p>
          </div>
          <button
            aria-label="Close exercise details"
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <div className="exercise-detail-media">
          <ExerciseMedia exercise={exercise} showVideoDefault />
          {onUpdateExercise ? (
            <ExerciseMediaEditor
              exercise={exercise}
              onSave={(updates) => onUpdateExercise({ ...exercise, ...updates })}
            />
          ) : null}
        </div>

        <div className="exercise-detail-tags">
          <div className="exercise-detail-taggroup">
            <span className="exercise-card__label">Difficulty</span>
            <div className="tag-row">
              <Tag variant={difficultyVariant(exercise.difficulty)}>
                {exercise.difficulty}
              </Tag>
              {exercise.postureFocus ? (
                <Tag variant="posture">Posture focus</Tag>
              ) : null}
            </div>
          </div>
          <div className="exercise-detail-taggroup">
            <span className="exercise-card__label">Primary muscles</span>
            <div className="tag-row">
              {exercise.primaryMuscles.map((muscle) => (
                <Tag key={muscle} variant="muscle">
                  {muscle}
                </Tag>
              ))}
            </div>
          </div>
          {exercise.secondaryMuscles.length > 0 ? (
            <div className="exercise-detail-taggroup">
              <span className="exercise-card__label">Secondary muscles</span>
              <div className="tag-row">
                {exercise.secondaryMuscles.map((muscle) => (
                  <Tag key={muscle} variant="secondary-muscle">
                    {muscle}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}
          <div className="exercise-detail-taggroup">
            <span className="exercise-card__label">Equipment</span>
            <div className="tag-row">
              {exercise.equipment.map((item) => (
                <Tag key={item} variant="equipment">
                  {item}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="exercise-detail-columns">
          <section className="exercise-detail-block">
            <h3>
              <ListOrdered size={18} strokeWidth={2.4} aria-hidden="true" />
              Instructions
            </h3>
            <ol className="exercise-detail-steps">
              {exercise.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
              Form tips
            </h3>
            <ul className="exercise-detail-list exercise-detail-list--good">
              {exercise.formTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <ShieldAlert size={18} strokeWidth={2.4} aria-hidden="true" />
              Common mistakes
            </h3>
            <ul className="exercise-detail-list exercise-detail-list--bad">
              {exercise.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <TrendingUp size={18} strokeWidth={2.4} aria-hidden="true" />
              Progression
            </h3>
            <ol className="exercise-detail-steps exercise-detail-steps--progress">
              {exercise.progression.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <TrendingDown size={18} strokeWidth={2.4} aria-hidden="true" />
              Regression (easier)
            </h3>
            <ol className="exercise-detail-steps exercise-detail-steps--progress">
              {exercise.regression.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <section className="exercise-detail-advice">
          <p className="eyebrow">
            <Lightbulb size={16} strokeWidth={2.4} aria-hidden="true" />
            Progression Advice
          </p>
          <ul>
            {progressionAdvice.map((advice) => (
              <li key={advice}>{advice}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-detail-posture">
          <p className="eyebrow">Posture &amp; arched-back notes</p>
          <p>{exercise.postureNotes}</p>
        </section>

        <div className="exercise-detail-footer">
          <section className="exercise-detail-block">
            <h3>
              <ExternalLink size={18} strokeWidth={2.4} aria-hidden="true" />
              Demo links
            </h3>
            <div className="exercise-detail-links">
              {exercise.demoLinks.map((link) => (
                <a
                  className="exercise-demo-link"
                  href={link.url}
                  key={link.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          <section className="exercise-detail-block">
            <h3>
              <CalendarDays size={18} strokeWidth={2.4} aria-hidden="true" />
              Related workout days
            </h3>
            {exercise.relatedWorkoutDays.length > 0 ? (
              <div className="tag-row">
                {exercise.relatedWorkoutDays.map((day) => (
                  <Tag key={day} variant="neutral">
                    {getRelatedDayLabel(activeProgram, day)}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="exercise-detail-muted">Optional / accessory work.</p>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}

function getRelatedDayLabel(
  program: ActiveWorkoutProgram,
  dayNumber: number,
): string {
  const day = findProgramDay(program, dayNumber)
  return day ? getDayLabel(day) : `Day ${dayNumber}`
}

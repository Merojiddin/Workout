import { ArrowRight, PlayCircle, Quote } from 'lucide-react'
import { useState } from 'react'
import type { Difficulty, LibraryExercise } from '../data/exerciseLibrary'
import {
  DEFAULT_EXERCISE_IMAGE,
  getExerciseImage,
  getExerciseImageAlt,
  getExerciseVideo,
} from '../utils/mediaUtils'
import { Tag, type TagVariant } from './Tag'

interface ExerciseCardProps {
  exercise: LibraryExercise
  onView: (exercise: LibraryExercise) => void
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

export function ExerciseCard({ exercise, onView }: ExerciseCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasVideo = getExerciseVideo(exercise) !== ''
  const thumbnail = imageFailed ? DEFAULT_EXERCISE_IMAGE : getExerciseImage(exercise)

  return (
    <article className="exercise-card">
      <div className="exercise-card__thumb">
        <img
          alt={getExerciseImageAlt(exercise)}
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={thumbnail}
        />
        {hasVideo ? (
          <span className="exercise-card__video-badge">
            <PlayCircle size={14} strokeWidth={2.4} aria-hidden="true" />
            Video
          </span>
        ) : null}
      </div>

      <div className="exercise-card__top">
        <div className="exercise-card__titles">
          <Tag variant="category">{exercise.category}</Tag>
          <h3>{exercise.name}</h3>
        </div>
        <Tag variant={difficultyVariant(exercise.difficulty)}>
          {exercise.difficulty}
        </Tag>
      </div>

      <div className="exercise-card__section">
        <span className="exercise-card__label">Primary muscles</span>
        <div className="tag-row">
          {exercise.primaryMuscles.map((muscle) => (
            <Tag key={muscle} variant="muscle">
              {muscle}
            </Tag>
          ))}
        </div>
      </div>

      <div className="exercise-card__section">
        <span className="exercise-card__label">Equipment</span>
        <div className="tag-row">
          {exercise.equipment.map((item) => (
            <Tag key={item} variant="equipment">
              {item}
            </Tag>
          ))}
        </div>
      </div>

      <p className="exercise-card__cue">
        <Quote size={15} strokeWidth={2.4} aria-hidden="true" />
        {exercise.formCue}
      </p>

      <button
        className="exercise-card__button"
        onClick={() => onView(exercise)}
        type="button"
      >
        View Details
        <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </article>
  )
}

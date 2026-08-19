import { ArrowRight, PlayCircle, Quote } from 'lucide-react'
import { useState } from 'react'
import type { Difficulty, LibraryExercise } from '../data/exerciseLibrary'
import { useLanguage } from '../i18n'
import {
  getExerciseCopy,
  translateCategory,
  translateDifficulty,
  translateEquipment,
} from '../i18n/exercises'
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
  const { language, t } = useLanguage()
  // The card reads the translated copy but hands the untranslated exercise
  // back to `onView`: the modal, the filters and the media lookups all key off
  // the English record.
  const copy = getExerciseCopy(exercise, language)
  const [imageFailed, setImageFailed] = useState(false)
  const hasVideo = getExerciseVideo(exercise) !== ''
  const thumbnail = imageFailed ? DEFAULT_EXERCISE_IMAGE : getExerciseImage(exercise)

  return (
    <article className="exercise-card">
      <div className="exercise-card__thumb">
        <img
          alt={getExerciseImageAlt(copy)}
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={thumbnail}
        />
        {hasVideo ? (
          <span className="exercise-card__video-badge">
            <PlayCircle size={14} strokeWidth={2.4} aria-hidden="true" />
            {t('library.card.video')}
          </span>
        ) : null}
      </div>

      <div className="exercise-card__top">
        <div className="exercise-card__titles">
          <Tag variant="category">
            {translateCategory(exercise.category, language)}
          </Tag>
          <h3>{copy.name}</h3>
        </div>
        <Tag variant={difficultyVariant(exercise.difficulty)}>
          {translateDifficulty(exercise.difficulty, language)}
        </Tag>
      </div>

      <div className="exercise-card__section">
        <span className="exercise-card__label">
          {t('library.card.primaryMuscles')}
        </span>
        <div className="tag-row">
          {copy.primaryMuscles.map((muscle) => (
            <Tag key={muscle} variant="muscle">
              {muscle}
            </Tag>
          ))}
        </div>
      </div>

      <div className="exercise-card__section">
        <span className="exercise-card__label">{t('library.card.equipment')}</span>
        <div className="tag-row">
          {exercise.equipment.map((item) => (
            <Tag key={item} variant="equipment">
              {translateEquipment(item, language)}
            </Tag>
          ))}
        </div>
      </div>

      <p className="exercise-card__cue">
        <Quote size={15} strokeWidth={2.4} aria-hidden="true" />
        {copy.formCue}
      </p>

      <button
        className="exercise-card__button"
        onClick={() => onView(exercise)}
        type="button"
      >
        {t('library.card.viewDetails')}
        <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </article>
  )
}

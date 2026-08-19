import { useEffect, useState } from 'react'
import type { LibraryExercise } from '../data/exerciseLibrary'
import { useT } from '../i18n'
import {
  DEFAULT_EXERCISE_IMAGE,
  getExerciseImage,
  getExerciseImageAlt,
} from '../utils/mediaUtils'

interface LiveExerciseImageProps {
  exercise: LibraryExercise
  /** Tapping the image opens the full form guide. */
  onOpenFormGuide?: () => void
}

/**
 * The exercise picture, shown inline while training so you can see the
 * movement without opening anything. Deliberately just the image: the video,
 * tips and muscle detail stay in the form-guide modal.
 */
export function LiveExerciseImage({
  exercise,
  onOpenFormGuide,
}: LiveExerciseImageProps) {
  const t = useT()
  const source = getExerciseImage(exercise)
  const [src, setSrc] = useState(source)
  const [hidden, setHidden] = useState(false)

  // A new exercise gets a fresh attempt at its own image.
  useEffect(() => {
    setSrc(source)
    setHidden(false)
  }, [source])

  if (hidden) {
    return null
  }

  const image = (
    <img
      alt={getExerciseImageAlt(exercise)}
      className="live-exercise__image"
      loading="lazy"
      onError={() => {
        // Broken remote image -> local placeholder; if that fails too, drop
        // the figure rather than leaving a broken-image box on screen.
        if (src !== DEFAULT_EXERCISE_IMAGE) {
          setSrc(DEFAULT_EXERCISE_IMAGE)
        } else {
          setHidden(true)
        }
      }}
      src={src}
    />
  )

  if (!onOpenFormGuide) {
    return <figure className="live-exercise__figure">{image}</figure>
  }

  return (
    <button
      aria-label={t('live.openFormGuideFor', { name: exercise.name })}
      className="live-exercise__figure live-exercise__figure--button"
      onClick={onOpenFormGuide}
      type="button"
    >
      {image}
    </button>
  )
}

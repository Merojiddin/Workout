import { BookOpen, Eye, EyeOff, ImageOff, Play, Video, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import {
  DEFAULT_EXERCISE_IMAGE,
  getExerciseImage,
  getExerciseImageAlt,
  getExerciseVideo,
  getExerciseVideoTitle,
  getYouTubeSearchUrl,
  type ExerciseMediaSource,
} from '../utils/mediaUtils'

interface ExerciseMediaProps {
  exercise: ExerciseMediaSource | null | undefined
  /** Tighter layout for the live workout screen. */
  compact?: boolean
  /** Start with the video player open instead of collapsed. */
  showVideoDefault?: boolean
  /** Hide the image block (video controls still work). */
  showImage?: boolean
  /** When provided, renders an "Open Form Guide" button. */
  onOpenFormGuide?: () => void
}

/**
 * One media panel per exercise: the image with a play overlay, swapped
 * in place for the embedded video (never both at once). Safe fallbacks:
 * placeholder when no/broken image, offline notice, and a loading
 * skeleton while the iframe loads.
 */
export function ExerciseMedia({
  exercise,
  compact = false,
  showVideoDefault = false,
  showImage = true,
  onOpenFormGuide,
}: ExerciseMediaProps) {
  const { isOnline } = useOnlineStatus()
  const [showVideo, setShowVideo] = useState(showVideoDefault)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  // Deliberately NOT reset per exercise: once hidden, media stays hidden
  // for the rest of the session until the user shows it again.
  const [mediaHidden, setMediaHidden] = useState(false)

  const exerciseName = typeof exercise?.name === 'string' ? exercise.name : ''
  const videoUrl = getExerciseVideo(exercise)
  const hasVideo = videoUrl !== ''

  // Reset per-exercise state when the shown exercise changes.
  useEffect(() => {
    setShowVideo(showVideoDefault)
    setVideoLoaded(false)
    setImageFailed(false)
    // Re-run only when the exercise (or default) actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseName, videoUrl, showVideoDefault])

  if (!exercise) {
    return null
  }

  const imageSrc = imageFailed ? DEFAULT_EXERCISE_IMAGE : getExerciseImage(exercise)
  const videoOpen = showVideo && hasVideo

  function toggleVideo() {
    setVideoLoaded(false)
    setShowVideo((open) => !open)
  }

  return (
    <section
      className={`exercise-media${compact ? ' exercise-media--compact' : ''}`}
      aria-label={`${exerciseName || 'Exercise'} media`}
    >
      {!mediaHidden && (showImage || videoOpen) ? (
        <div className="exercise-media__panel">
          {videoOpen && isOnline ? (
            <div className="exercise-media__video">
              {!videoLoaded ? (
                <div className="exercise-media__skeleton" aria-hidden="true">
                  <Play size={28} strokeWidth={2.2} />
                  <span>Loading video...</span>
                </div>
              ) : null}
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={videoLoaded ? 'exercise-media__iframe--loaded' : ''}
                loading="lazy"
                onLoad={() => setVideoLoaded(true)}
                referrerPolicy="strict-origin-when-cross-origin"
                src={videoUrl}
                title={getExerciseVideoTitle(exercise)}
              />
              <button
                aria-label="Back to image"
                className="exercise-media__close"
                onClick={toggleVideo}
                type="button"
              >
                <X size={16} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              {showImage ? (
                <figure className="exercise-media__figure">
                  <img
                    alt={getExerciseImageAlt(exercise)}
                    className="exercise-media__image"
                    loading="lazy"
                    onError={(event) => {
                      // Broken external image -> local placeholder. If even
                      // that fails, fall through to the text placeholder.
                      if (!imageFailed) {
                        setImageFailed(true)
                      } else {
                        event.currentTarget.style.display = 'none'
                      }
                    }}
                    src={imageSrc}
                  />
                  <figcaption className="exercise-media__caption">
                    {exercise.imageUrl && !imageFailed
                      ? exerciseName
                      : 'Exercise image coming soon'}
                  </figcaption>
                </figure>
              ) : null}
              {hasVideo && showImage ? (
                <button
                  aria-expanded={false}
                  className="exercise-media__play"
                  onClick={toggleVideo}
                  type="button"
                >
                  <span>
                    <Play size={16} strokeWidth={2.4} aria-hidden="true" />
                    Watch Video
                  </span>
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {showImage || hasVideo || onOpenFormGuide ? (
        <div className="exercise-media__actions">
          {showImage || hasVideo ? (
            <button
              aria-pressed={mediaHidden}
              className="workout-secondary-button"
              onClick={() => setMediaHidden((hidden) => !hidden)}
              type="button"
            >
              {mediaHidden ? (
                <Eye size={18} strokeWidth={2.4} aria-hidden="true" />
              ) : (
                <EyeOff size={18} strokeWidth={2.4} aria-hidden="true" />
              )}
              {mediaHidden ? 'Show Video / Image' : 'Hide Video / Image'}
            </button>
          ) : null}
          {!mediaHidden && !showImage && hasVideo ? (
            <button
              aria-expanded={videoOpen}
              className={`workout-secondary-button exercise-media__video-toggle${
                videoOpen ? ' exercise-media__video-toggle--open' : ''
              }`}
              onClick={toggleVideo}
              type="button"
            >
              {videoOpen ? (
                <X size={18} strokeWidth={2.4} aria-hidden="true" />
              ) : (
                <Play size={18} strokeWidth={2.4} aria-hidden="true" />
              )}
              {videoOpen ? 'Hide Video' : 'Watch Video'}
            </button>
          ) : null}
          {onOpenFormGuide ? (
            <button
              className="workout-secondary-button"
              onClick={onOpenFormGuide}
              type="button"
            >
              <BookOpen size={18} strokeWidth={2.4} aria-hidden="true" />
              Open Form Guide
            </button>
          ) : null}
        </div>
      ) : null}

      {!mediaHidden && !hasVideo ? (
        <p className="exercise-media__note">
          <Video size={15} strokeWidth={2.4} aria-hidden="true" />
          Video guide not added yet.
          <a
            href={getYouTubeSearchUrl(exerciseName)}
            rel="noreferrer"
            target="_blank"
          >
            Search on YouTube
          </a>
        </p>
      ) : null}

      {videoOpen && !isOnline ? (
        <p className="exercise-media__note exercise-media__note--offline">
          <WifiOff size={15} strokeWidth={2.4} aria-hidden="true" />
          Video requires internet connection.
        </p>
      ) : null}

      {!mediaHidden && showImage && imageFailed ? (
        <p className="exercise-media__note">
          <ImageOff size={15} strokeWidth={2.4} aria-hidden="true" />
          Original image failed to load - showing placeholder.
        </p>
      ) : null}
    </section>
  )
}

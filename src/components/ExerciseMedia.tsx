import {
  BookOpen,
  Eye,
  EyeOff,
  ImageOff,
  Play,
  Repeat,
  Video,
  WifiOff,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useT } from '../i18n'
import {
  DEFAULT_EXERCISE_IMAGE,
  getExerciseGifAlt,
  getExerciseGifUrl,
  getExerciseImage,
  getExerciseImageAlt,
  getExerciseVideo,
  getExerciseVideoTitle,
  getYouTubeSearchUrl,
  isExerciseAnimationVideo,
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

const MAX_ANIMATION_RETRIES = 2
const ANIMATION_RETRY_DELAY_MS = 2_500

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
  const t = useT()

  const exerciseName = typeof exercise?.name === 'string' ? exercise.name : ''
  const videoUrl = getExerciseVideo(exercise)
  const hasVideo = videoUrl !== ''
  const gifUrl = getExerciseGifUrl(exercise)
  const animationIsVideo = isExerciseAnimationVideo(gifUrl)

  // When there is an animation it leads, even where the caller asked for the
  // form video: it starts instantly and the switch is right there. Bundled
  // animations work offline; source-hosted overrides use their still fallback.
  const videoDefault = showVideoDefault && gifUrl === ''

  const [showVideo, setShowVideo] = useState(videoDefault)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [gifFailed, setGifFailed] = useState(false)
  const animationRetryCountRef = useRef(0)
  const animationRetryTimerRef = useRef<number | null>(null)
  // Deliberately NOT reset per exercise: once hidden, media stays hidden
  // for the rest of the session until the user shows it again.
  const [mediaHidden, setMediaHidden] = useState(false)

  // A broken animation falls back to the still image rather than a dead frame.
  const hasGif = gifUrl !== '' && !gifFailed

  // Reset per-exercise state when the shown exercise changes.
  useEffect(() => {
    if (animationRetryTimerRef.current !== null) {
      window.clearTimeout(animationRetryTimerRef.current)
      animationRetryTimerRef.current = null
    }
    animationRetryCountRef.current = 0
    setShowVideo(videoDefault)
    setVideoLoaded(false)
    setImageFailed(false)
    setGifFailed(false)
    return () => {
      if (animationRetryTimerRef.current !== null) {
        window.clearTimeout(animationRetryTimerRef.current)
        animationRetryTimerRef.current = null
      }
    }
    // Re-run only when the exercise (or default) actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id, exerciseName, videoUrl, gifUrl, videoDefault])

  // Retry source-hosted media after reconnecting instead of keeping a
  // transient offline failure sticky for the lifetime of the modal.
  useEffect(() => {
    if (isOnline) {
      if (animationRetryTimerRef.current !== null) {
        window.clearTimeout(animationRetryTimerRef.current)
        animationRetryTimerRef.current = null
      }
      animationRetryCountRef.current = 0
      setVideoLoaded(false)
      setImageFailed(false)
      setGifFailed(false)
    }
  }, [isOnline])

  if (!exercise) {
    return null
  }

  const imageSrc = imageFailed ? DEFAULT_EXERCISE_IMAGE : getExerciseImage(exercise)
  const videoOpen = showVideo && hasVideo

  function toggleVideo() {
    setVideoLoaded(false)
    setShowVideo((open) => !open)
  }

  function handleAnimationError() {
    setGifFailed(true)
    if (
      !isOnline ||
      animationRetryCountRef.current >= MAX_ANIMATION_RETRIES ||
      animationRetryTimerRef.current !== null
    ) {
      return
    }

    animationRetryCountRef.current += 1
    animationRetryTimerRef.current = window.setTimeout(() => {
      animationRetryTimerRef.current = null
      setGifFailed(false)
    }, ANIMATION_RETRY_DELAY_MS * animationRetryCountRef.current)
  }

  return (
    <section
      className={`exercise-media${compact ? ' exercise-media--compact' : ''}`}
      aria-label={t('media.aria', {
        name: exerciseName || t('media.exerciseFallback'),
      })}
    >
      {!mediaHidden && (showImage || videoOpen) ? (
        <div className="exercise-media__panel">
          {videoOpen && isOnline ? (
            <div className="exercise-media__video">
              {!videoLoaded ? (
                <div className="exercise-media__skeleton" aria-hidden="true">
                  <Play size={28} strokeWidth={2.2} />
                  <span>{t('media.loadingVideo')}</span>
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
                aria-label={t('media.backToImage')}
                className="exercise-media__close"
                onClick={toggleVideo}
                type="button"
              >
                <X size={16} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              {showImage && hasGif ? (
                <figure className="exercise-media__figure exercise-media__figure--gif">
                  {animationIsVideo ? (
                    <video
                      aria-label={getExerciseGifAlt(exercise)}
                      autoPlay
                      className="exercise-media__gif exercise-media__gif--video"
                      loop
                      muted
                      key={`${exercise.id ?? exerciseName}:${gifUrl}`}
                      onError={handleAnimationError}
                      playsInline
                      poster={imageSrc}
                      preload="metadata"
                      src={gifUrl}
                    />
                  ) : (
                    <img
                      alt={getExerciseGifAlt(exercise)}
                      className="exercise-media__gif"
                      loading="lazy"
                      onError={handleAnimationError}
                      src={gifUrl}
                    />
                  )}
                  <figcaption className="exercise-media__caption">
                    {exerciseName}
                  </figcaption>
                </figure>
              ) : null}
              {showImage && !hasGif ? (
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
                      : t('media.imageComingSoon')}
                  </figcaption>
                </figure>
              ) : null}
              {/* With an animation present the segmented switch below already
                  offers the video, so this overlay would be a second control
                  for the same thing. */}
              {hasVideo && showImage && !hasGif ? (
                <button
                  aria-expanded={false}
                  className="exercise-media__play"
                  onClick={toggleVideo}
                  type="button"
                >
                  <span>
                    <Play size={16} strokeWidth={2.4} aria-hidden="true" />
                    {t('media.watchVideo')}
                  </span>
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {!mediaHidden && showImage && hasGif && hasVideo ? (
        <div
          className="exercise-media__switch"
          role="group"
          aria-label={t('media.switchAria')}
        >
          <button
            aria-pressed={!videoOpen}
            className={`exercise-media__switch-option${
              !videoOpen ? ' exercise-media__switch-option--active' : ''
            }`}
            onClick={() => {
              setVideoLoaded(false)
              setShowVideo(false)
            }}
            type="button"
          >
            <Repeat size={16} strokeWidth={2.4} aria-hidden="true" />
            {t('media.animation')}
          </button>
          <button
            aria-pressed={videoOpen}
            className={`exercise-media__switch-option${
              videoOpen ? ' exercise-media__switch-option--active' : ''
            }`}
            onClick={() => {
              setVideoLoaded(false)
              setShowVideo(true)
            }}
            type="button"
          >
            <Play size={16} strokeWidth={2.4} aria-hidden="true" />
            {t('media.video')}
          </button>
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
              {mediaHidden ? t('media.showMedia') : t('media.hideMedia')}
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
              {videoOpen ? t('media.hideVideo') : t('media.watchVideo')}
            </button>
          ) : null}
          {onOpenFormGuide ? (
            <button
              className="workout-secondary-button"
              onClick={onOpenFormGuide}
              type="button"
            >
              <BookOpen size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('media.openFormGuide')}
            </button>
          ) : null}
        </div>
      ) : null}

      {!mediaHidden && !hasVideo ? (
        <p className="exercise-media__note">
          <Video size={15} strokeWidth={2.4} aria-hidden="true" />
          {t('media.noVideoYet')}
          <a
            href={getYouTubeSearchUrl(exerciseName)}
            rel="noreferrer"
            target="_blank"
          >
            {t('media.searchYouTube')}
          </a>
        </p>
      ) : null}

      {videoOpen && !isOnline ? (
        <p className="exercise-media__note exercise-media__note--offline">
          <WifiOff size={15} strokeWidth={2.4} aria-hidden="true" />
          {t('media.needsInternet')}
        </p>
      ) : null}

      {!mediaHidden && showImage && imageFailed ? (
        <p className="exercise-media__note">
          <ImageOff size={15} strokeWidth={2.4} aria-hidden="true" />
          {t('media.imageFailed')}
        </p>
      ) : null}
    </section>
  )
}

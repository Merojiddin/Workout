import { useEffect, useRef, useState } from 'react'
import {
  getGuidedExerciseMedia,
  type GuidedExercise,
} from '../data/guidedExercises'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { DEFAULT_EXERCISE_IMAGE, isExerciseAnimationVideo } from '../utils/mediaUtils'
import { translateGuidedText } from '../utils/guidedWorkoutUtils'

interface GuidedStepMediaProps {
  exercise: GuidedExercise
  /** Extra class on the figure, for the player's larger frame. */
  className?: string
  /**
   * `clip` plays the looping demonstration; `still` shows only the thumbnail.
   *
   * A list of fifteen workout cards is fifteen frames, and streaming a video
   * into each of them would pull tens of megabytes over mobile data to show
   * pictures the size of a stamp. The clip is what you are copying, so it
   * belongs on the screen where you are copying it and nowhere else.
   */
  variant?: 'clip' | 'still'
}

const MAX_ANIMATION_RETRIES = 2
const ANIMATION_RETRY_DELAY_MS = 2_500

/**
 * The looping demonstration shown while a guided step runs.
 *
 * The clip is the point of a guided workout - you are copying it rather than
 * reading about it - so it leads, with the still as the fallback and a local
 * placeholder behind that. Nothing here is ever routed through the service
 * worker: the CDN sends no CORS header, and WebKit refuses to play a media
 * element served an opaque response (see docs/exercise-gifs.md).
 */
export function GuidedStepMedia({
  className,
  exercise,
  variant = 'clip',
}: GuidedStepMediaProps) {
  const { isOnline } = useOnlineStatus()
  const { animationUrl, imageUrl } = getGuidedExerciseMedia(exercise)
  const animationIsVideo = isExerciseAnimationVideo(animationUrl)
  const videoRef = useRef<HTMLVideoElement>(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<number | null>(null)
  const [animationFailed, setAnimationFailed] = useState(false)
  const [stillSrc, setStillSrc] = useState(imageUrl || DEFAULT_EXERCISE_IMAGE)
  const showAnimation = variant === 'clip' && animationUrl !== '' && !animationFailed
  const alt = translateGuidedText(exercise.name)

  // A new movement gets a fresh attempt at both its clip and its still.
  useEffect(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    retryCountRef.current = 0
    setAnimationFailed(false)
    setStillSrc(imageUrl || DEFAULT_EXERCISE_IMAGE)

    return () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
    }
  }, [animationUrl, imageUrl])

  // A request that failed while offline deserves another go the moment the
  // connection is back, without waiting for the next exercise.
  useEffect(() => {
    if (isOnline) {
      retryCountRef.current = 0
      setAnimationFailed(false)
    }
  }, [isOnline])

  // Browsers pause muted autoplay when a tab is backgrounded or a phone
  // sleeps. The demonstration has to be moving again the moment you look back.
  useEffect(() => {
    if (!showAnimation || !animationIsVideo) {
      return undefined
    }

    const resume = () => {
      const video = videoRef.current
      if (!video || document.hidden) {
        return
      }
      video.muted = true
      void video.play().catch(() => undefined)
    }
    const resumeWhenVisible = () => {
      if (!document.hidden) {
        resume()
      }
    }

    resume()
    document.addEventListener('visibilitychange', resumeWhenVisible)
    window.addEventListener('focus', resume)
    window.addEventListener('pageshow', resume)

    return () => {
      document.removeEventListener('visibilitychange', resumeWhenVisible)
      window.removeEventListener('focus', resume)
      window.removeEventListener('pageshow', resume)
    }
  }, [animationIsVideo, animationUrl, showAnimation])

  function handleAnimationError() {
    setAnimationFailed(true)
    if (
      !isOnline ||
      retryCountRef.current >= MAX_ANIMATION_RETRIES ||
      retryTimerRef.current !== null
    ) {
      return
    }

    retryCountRef.current += 1
    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null
      setAnimationFailed(false)
    }, ANIMATION_RETRY_DELAY_MS * retryCountRef.current)
  }

  const still = (
    <img
      alt={alt}
      className="guided-media__asset"
      loading="eager"
      onError={() => {
        if (stillSrc !== DEFAULT_EXERCISE_IMAGE) {
          setStillSrc(DEFAULT_EXERCISE_IMAGE)
        }
      }}
      src={stillSrc}
    />
  )

  return (
    <figure className={`guided-media${className ? ` ${className}` : ''}`}>
      {showAnimation ? (
        animationIsVideo ? (
          <video
            aria-label={alt}
            autoPlay
            className="guided-media__asset"
            key={`${exercise.id}:${animationUrl}`}
            loop
            muted
            onCanPlay={(event) => {
              event.currentTarget.muted = true
              void event.currentTarget.play().catch(() => undefined)
            }}
            onEnded={(event) => {
              event.currentTarget.currentTime = 0
              void event.currentTarget.play().catch(() => undefined)
            }}
            onError={handleAnimationError}
            onPause={(event) => {
              if (!document.hidden) {
                event.currentTarget.muted = true
                void event.currentTarget.play().catch(() => undefined)
              }
            }}
            playsInline
            poster={stillSrc}
            preload="auto"
            ref={videoRef}
            src={animationUrl}
          />
        ) : (
          <img
            alt={alt}
            className="guided-media__asset"
            loading="eager"
            onError={handleAnimationError}
            src={animationUrl}
          />
        )
      ) : (
        still
      )}
    </figure>
  )
}

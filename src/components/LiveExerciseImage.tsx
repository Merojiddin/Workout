import { useEffect, useRef, useState } from 'react'
import type { LibraryExercise } from '../data/exerciseLibrary'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useT } from '../i18n'
import {
  DEFAULT_EXERCISE_IMAGE,
  getExerciseGifAlt,
  getExerciseGifUrl,
  getExerciseImage,
  getExerciseImageAlt,
  isExerciseAnimationVideo,
} from '../utils/mediaUtils'

interface LiveExerciseImageProps {
  exercise: LibraryExercise
  /** Tapping the image opens the full form guide. */
  onOpenFormGuide?: () => void
}

const MAX_ANIMATION_RETRIES = 2
const ANIMATION_RETRY_DELAY_MS = 2_500

/**
 * The movement demonstration shown inline while training. A bundled GIF or
 * explicit looping clip leads when available; otherwise the still image is
 * used. Tapping it still opens the full guide with tips and muscle detail.
 */
export function LiveExerciseImage({
  exercise,
  onOpenFormGuide,
}: LiveExerciseImageProps) {
  const t = useT()
  const { isOnline } = useOnlineStatus()
  const animationSource = getExerciseGifUrl(exercise)
  const animationIsVideo = isExerciseAnimationVideo(animationSource)
  const stillSource = getExerciseImage(exercise)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationRetryCountRef = useRef(0)
  const animationRetryTimerRef = useRef<number | null>(null)
  const [animationFailed, setAnimationFailed] = useState(false)
  const [src, setSrc] = useState(stillSource)
  const [hidden, setHidden] = useState(false)
  const showAnimation = animationSource !== '' && !animationFailed

  // A new exercise gets a fresh attempt at both its animation and still.
  useEffect(() => {
    if (animationRetryTimerRef.current !== null) {
      window.clearTimeout(animationRetryTimerRef.current)
      animationRetryTimerRef.current = null
    }
    animationRetryCountRef.current = 0
    setAnimationFailed(false)
    setSrc(stillSource)
    setHidden(false)

    return () => {
      if (animationRetryTimerRef.current !== null) {
        window.clearTimeout(animationRetryTimerRef.current)
        animationRetryTimerRef.current = null
      }
    }
  }, [exercise.id, animationSource, stillSource])

  // A request that failed while offline should get another chance as soon as
  // connectivity returns, without making the user change exercises first.
  useEffect(() => {
    if (isOnline) {
      if (animationRetryTimerRef.current !== null) {
        window.clearTimeout(animationRetryTimerRef.current)
        animationRetryTimerRef.current = null
      }
      animationRetryCountRef.current = 0
      setAnimationFailed(false)
      setSrc(stillSource)
      setHidden(false)
    }
  }, [isOnline, stillSource])

  // Browsers may pause muted autoplay when the tab is backgrounded or the
  // device sleeps. Resume whenever this exercise becomes playable or the page
  // becomes active again so the live-workout demonstration keeps looping.
  useEffect(() => {
    if (!showAnimation || !animationIsVideo) {
      return
    }

    const resume = () => {
      const video = videoRef.current
      if (!video || document.hidden) {
        return
      }
      video.muted = true
      void video.play().catch(() => {
        // onCanPlay and the next focus/visibility event will retry. A rejected
        // autoplay promise is expected on browsers with stricter policies.
      })
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
  }, [animationIsVideo, animationSource, showAnimation])

  if (hidden) {
    return null
  }

  function handleAnimationError() {
    setAnimationFailed(true)
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
      setSrc(stillSource)
      setHidden(false)
      setAnimationFailed(false)
    }, ANIMATION_RETRY_DELAY_MS * animationRetryCountRef.current)
  }

  const still = (
    <img
      alt={getExerciseImageAlt(exercise)}
      className="live-exercise__image"
      loading="eager"
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

  const media = showAnimation ? (
    animationIsVideo ? (
      <video
        aria-label={getExerciseGifAlt(exercise)}
        autoPlay
        className="live-exercise__image"
        key={`${exercise.id}:${animationSource}`}
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
        poster={src}
        preload="auto"
        ref={videoRef}
        src={animationSource}
      />
    ) : (
      <img
        alt={getExerciseGifAlt(exercise)}
        className="live-exercise__image"
        loading="eager"
        onError={handleAnimationError}
        src={animationSource}
      />
    )
  ) : still

  if (!onOpenFormGuide) {
    return <figure className="live-exercise__figure">{media}</figure>
  }

  return (
    <button
      aria-label={t('live.openFormGuideFor', { name: exercise.name })}
      className="live-exercise__figure live-exercise__figure--button"
      onClick={onOpenFormGuide}
      type="button"
    >
      {media}
    </button>
  )
}

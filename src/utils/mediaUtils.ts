import { exerciseGifs } from '../data/exerciseGifs'
import { t } from '../i18n/t'
/**
 * Step 18 - exercise media helpers.
 *
 * Everything here is defensive: exercises may come from the default library,
 * a stored custom library without media fields, or user-edited data with
 * broken URLs. Every function returns a safe fallback instead of throwing.
 */

export const DEFAULT_EXERCISE_IMAGE = '/exercise-placeholders/default-exercise.svg'

const categoryPlaceholders: Record<string, string> = {
  chest: '/exercise-placeholders/chest.svg',
  back: '/exercise-placeholders/back.svg',
  shoulders: '/exercise-placeholders/shoulders.svg',
  arms: '/exercise-placeholders/arms.svg',
  legs: '/exercise-placeholders/legs.svg',
  abs: '/exercise-placeholders/abs.svg',
  posture: '/exercise-placeholders/posture.svg',
  conditioning: '/exercise-placeholders/conditioning.svg',
}

/** Workout display preferences saved in userProfileSettings.workoutDisplay. */
export interface WorkoutDisplaySettings {
  showExerciseImages: boolean
  videosCollapsedByDefault: boolean
  autoOpenVideo: boolean
  preferCompactView: boolean
}

/** Shape we can safely read media from - all fields optional on purpose. */
export interface ExerciseMediaSource {
  /** Library id, used to look up the bundled ExerciseDB animation. */
  id?: string
  name?: string
  category?: string
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  videoType?: string
  videoTitle?: string
  /** Explicit animation URL (GIF or looping video), which wins over the bundled one. */
  gifUrl?: string
  gifAlt?: string
}

const animationVideoPattern = /\.(?:mp4|webm)(?:$|[?#])/i

/** Whether an animation URL needs the looping video renderer instead of an image. */
export function isExerciseAnimationVideo(url: unknown): boolean {
  return typeof url === 'string' && animationVideoPattern.test(url.trim())
}

const youtubeHosts = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
])

const videoIdPattern = /^[A-Za-z0-9_-]{6,20}$/

/**
 * Convert any supported YouTube URL into an embeddable URL.
 *
 * Supported inputs:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *
 * Returns '' for anything else (search pages, playlists, non-YouTube hosts,
 * malformed strings) so an unsafe URL never reaches an iframe.
 */
export function getEmbedVideoUrl(url: unknown): string {
  if (typeof url !== 'string' || url.trim() === '') {
    return ''
  }

  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return ''
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return ''
  }

  const host = parsed.hostname.toLowerCase()
  let videoId = ''

  if (host === 'youtu.be') {
    videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? ''
  } else if (youtubeHosts.has(host)) {
    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments[0] === 'watch') {
      videoId = parsed.searchParams.get('v') ?? ''
    } else if (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'v') {
      videoId = segments[1] ?? ''
    }
  }

  if (!videoIdPattern.test(videoId)) {
    return ''
  }

  // rel=0 keeps "more videos" suggestions inside the same channel.
  return `https://www.youtube.com/embed/${videoId}?rel=0`
}
/**
 * Image to show for an exercise: its own imageUrl when set, otherwise the
 * category placeholder, otherwise the default placeholder. Always non-empty.
 */
export function getExerciseImage(exercise: ExerciseMediaSource | null | undefined): string {
  const imageUrl = typeof exercise?.imageUrl === 'string' ? exercise.imageUrl.trim() : ''
  if (imageUrl) {
    return imageUrl
  }

  const category = typeof exercise?.category === 'string' ? exercise.category.trim().toLowerCase() : ''
  return categoryPlaceholders[category] ?? DEFAULT_EXERCISE_IMAGE
}

/**
 * Looping animation for an exercise, or '' when there is none. Existing
 * callers use the historical "gif" name, but explicit overrides may also be
 * browser-playable MP4/WebM clips.
 *
 * An explicit gifUrl on the exercise wins (a user can attach their own), then
 * the bundled ExerciseDB animation keyed by library id. See
 * docs/exercise-gifs.md for where those come from.
 */
export function getExerciseGifUrl(
  exercise: ExerciseMediaSource | null | undefined,
): string {
  const explicit = typeof exercise?.gifUrl === 'string' ? exercise.gifUrl.trim() : ''
  if (explicit) {
    return explicit
  }

  const id = typeof exercise?.id === 'string' ? exercise.id.trim() : ''
  return (id && exerciseGifs[id]?.gifUrl) || ''
}

/** Alt text for the animation, falling back to the exercise name. */
export function getExerciseGifAlt(
  exercise: ExerciseMediaSource | null | undefined,
): string {
  const alt = typeof exercise?.gifAlt === 'string' ? exercise.gifAlt.trim() : ''
  if (alt) {
    return alt
  }
  const name = typeof exercise?.name === 'string' ? exercise.name.trim() : ''
  return name ? `${name} animation` : 'Exercise animation'
}

/** Alt text for the exercise image, with a sensible fallback. */
export function getExerciseImageAlt(exercise: ExerciseMediaSource | null | undefined): string {
  const alt = typeof exercise?.imageAlt === 'string' ? exercise.imageAlt.trim() : ''
  if (alt) {
    return alt
  }
  const name = typeof exercise?.name === 'string' ? exercise.name.trim() : ''
  return name
    ? t('media.demonstrationAlt', { name })
    : t('media.demonstrationAltFallback')
}

/**
 * Safe embed URL for the exercise video, or '' when there is no usable video
 * (missing URL, videoType "none", or a URL that cannot be embedded).
 */
export function getExerciseVideo(exercise: ExerciseMediaSource | null | undefined): string {
  if (!exercise || exercise.videoType === 'none') {
    return ''
  }
  return getEmbedVideoUrl(exercise.videoUrl)
}

/** Title used on the iframe / video header. */
export function getExerciseVideoTitle(exercise: ExerciseMediaSource | null | undefined): string {
  const title = typeof exercise?.videoTitle === 'string' ? exercise.videoTitle.trim() : ''
  if (title) {
    return title
  }
  const name = typeof exercise?.name === 'string' ? exercise.name.trim() : ''
  return name
    ? t('media.formGuideTitle', { name })
    : t('media.formGuideTitleFallback')
}

/** YouTube search link (opens in a new tab - never used inside an iframe). */
export function getYouTubeSearchUrl(exerciseName: unknown): string {
  const name = typeof exerciseName === 'string' && exerciseName.trim() ? exerciseName.trim() : 'exercise'
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`proper ${name} form`)}`
}

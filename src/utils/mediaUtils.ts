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
  name?: string
  category?: string
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  videoType?: string
  videoTitle?: string
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

/** Alt text for the exercise image, with a sensible fallback. */
export function getExerciseImageAlt(exercise: ExerciseMediaSource | null | undefined): string {
  const alt = typeof exercise?.imageAlt === 'string' ? exercise.imageAlt.trim() : ''
  if (alt) {
    return alt
  }
  const name = typeof exercise?.name === 'string' ? exercise.name.trim() : ''
  return name ? `${name} exercise demonstration` : 'Exercise demonstration'
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
  return name ? `${name} form guide` : 'Exercise form guide'
}

/** YouTube search link (opens in a new tab - never used inside an iframe). */
export function getYouTubeSearchUrl(exerciseName: unknown): string {
  const name = typeof exerciseName === 'string' && exerciseName.trim() ? exerciseName.trim() : 'exercise'
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`proper ${name} form`)}`
}

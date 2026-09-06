import { useCallback, useState } from 'react'
import type { GuidedSaveOutcome } from '../components/GuidedWorkoutPlayer'
import { useAuth } from '../context/AuthContext'
import type { GuidedWorkout } from '../data/guidedWorkouts'
import { saveWorkoutSession } from '../data/workoutSessions'
import * as workoutService from '../services/workoutService'
import { primeSpeech } from '../utils/guidedAudio'
import {
  defaultGuidedSettings,
  getGuidedSettings,
  saveGuidedSettings,
  type GuidedSettings,
} from '../utils/guidedSettings'
import {
  buildGuidedWorkoutSession,
  type GuidedTimelineStep,
} from '../utils/guidedWorkoutUtils'
import { unlockAudio } from '../utils/timerFeedback'

export interface GuidedSession {
  /** The session the player is running, or null when nothing is playing. */
  active: GuidedWorkout | null
  settings: GuidedSettings
  /** Unlocks audio and hands the workout to the player. */
  start: (workout: GuidedWorkout) => void
  /** Leaves the player without finishing. */
  exit: () => void
  complete: (
    completedWorkSteps: GuidedTimelineStep[],
    startedAt: Date,
    finishedAt: Date,
  ) => GuidedSaveOutcome
  updateSettings: (settings: GuidedSettings) => void
}

/**
 * Running a guided session, wherever it is started from.
 *
 * The Guided Workouts screen and the Cardio side of Today's Workout both put
 * the same player on screen and write the same history, so the parts that are
 * easy to get subtly different - unlocking audio on the starting tap, saving
 * only the steps that actually ran - live here rather than in each screen.
 */
export function useGuidedSession(): GuidedSession {
  const { user } = useAuth()
  const [active, setActive] = useState<GuidedWorkout | null>(null)
  const [settings, setSettings] = useState<GuidedSettings>(
    () => getGuidedSettings() ?? defaultGuidedSettings,
  )

  const updateSettings = useCallback((next: GuidedSettings) => {
    setSettings(next)
    saveGuidedSettings(next)
  }, [])

  const start = useCallback(
    (workout: GuidedWorkout) => {
      // The tap that starts a workout is the one moment the browser will unlock
      // the chime and the speech voice for everything that follows.
      unlockAudio()
      if (settings.voice) {
        primeSpeech()
      }
      setActive(workout)
    },
    [settings.voice],
  )

  const exit = useCallback(() => setActive(null), [])

  /**
   * A finished session, written to the same history everything else uses so it
   * shows up in Progress and the weekly review. Only the steps that actually
   * ran to zero are logged - a skipped movement is not something you did.
   */
  const complete = useCallback(
    (
      completedWorkSteps: GuidedTimelineStep[],
      startedAt: Date,
      finishedAt: Date,
    ): GuidedSaveOutcome => {
      if (!active || completedWorkSteps.length === 0) {
        return 'empty'
      }

      const session = buildGuidedWorkoutSession(
        active,
        completedWorkSteps,
        startedAt,
        finishedAt,
      )
      if (!saveWorkoutSession(session)) {
        return 'error'
      }

      // Local history is already written; the cloud copy follows in the
      // background and must never hold up the finish screen.
      void workoutService.saveWorkoutSession(user, session).catch(() => undefined)
      return 'saved'
    },
    [active, user],
  )

  return { active, complete, exit, settings, start, updateSettings }
}

import { t } from '../i18n/t'

export function getWeeklyCoachConclusion({
  workoutSummary,
  nutritionSummary,
  bodySummary,
  focusItems,
  muscleVolume,
}) {
  const targetWorkouts = workoutSummary?.targetWorkouts ?? 0
  const scheduledCompletedWorkouts =
    workoutSummary?.scheduledCompletedWorkouts ??
    workoutSummary?.completedWorkouts ??
    0
  const training =
    targetWorkouts > 0 &&
    scheduledCompletedWorkouts >= targetWorkouts
      ? t('review.conclusion.consistencyStrong')
      : t('review.conclusion.consistencyCount', {
          completed: scheduledCompletedWorkouts,
          target: targetWorkouts,
        })
  const chest = findMuscle(muscleVolume, 'Chest')
  const back = findMuscle(muscleVolume, 'Back')
  const volume =
    isMuscleTargetMet(chest) && isMuscleTargetMet(back)
      ? t('review.conclusion.volumeBalanced')
      : isMuscleTargetMet(chest)
        ? t('review.conclusion.chestStrong')
        : t('review.conclusion.volumeDefault')
  const nutrition =
    (nutritionSummary?.proteinTargetDays ?? 0) >= 5
      ? t('review.conclusion.proteinGood')
      : t('review.conclusion.proteinInconsistent')
  const body =
    bodySummary?.messages?.[0] ??
    (bodySummary?.hasCurrent
      ? t('review.conclusion.bodyTracked')
      : t('review.conclusion.bodyMissing'))
  const next =
    safeArray(focusItems)[0] ?? t('review.conclusion.defaultNext')

  return t('review.conclusion.sentence', {
    training,
    volume,
    nutrition,
    body,
    next,
  })
}

function findMuscle(muscleVolume, muscle) {
  return (
    safeArray(muscleVolume).find((item) => item?.muscle === muscle) ?? {
      muscle,
      sets: 0,
      sessions: 0,
      targetSets: 0,
      targetSessions: 0,
    }
  )
}

function isMuscleTargetMet(summary) {
  if ((summary?.targetSets ?? 0) <= 0 && (summary?.targetSessions ?? 0) <= 0) {
    return false
  }
  return (
    ((summary?.targetSets ?? 0) <= 0 || summary.sets >= summary.targetSets) &&
    ((summary?.targetSessions ?? 0) <= 0 ||
      summary.sessions >= summary.targetSessions)
  )
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

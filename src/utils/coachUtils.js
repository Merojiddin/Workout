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
      ? 'Training consistency was strong.'
      : `Training consistency was ${scheduledCompletedWorkouts}/${targetWorkouts} workouts.`
  const chest = findMuscle(muscleVolume, 'Chest')
  const back = findMuscle(muscleVolume, 'Back')
  const volume =
    isMuscleTargetMet(chest) && isMuscleTargetMet(back)
      ? 'Chest and back volume were balanced.'
      : isMuscleTargetMet(chest)
        ? 'Chest volume was strong; keep back volume high too.'
        : 'Complete the active program’s scheduled training volume next week.'
  const nutrition =
    (nutritionSummary?.proteinTargetDays ?? 0) >= 5
      ? 'Protein consistency was good.'
      : 'Protein tracking was inconsistent.'
  const body =
    bodySummary?.messages?.[0] ??
    (bodySummary?.hasCurrent
      ? 'Body direction is being tracked.'
      : 'Body check-in is missing.')
  const next = safeArray(focusItems)[0] ?? 'Next week, log every workout and keep water at 2-3 L.'

  return `${training} ${volume} ${nutrition} ${body} Next week: ${next}`
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

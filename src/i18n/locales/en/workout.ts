/** Today's Workout: the pre-workout screen, the live session and its sheets. */
export const workoutMessages = {
  'workout.greeting': 'Hi, {name}',
  'workout.greetingAnonymous': 'Ready to train',
  'workout.greetingSub': "Ready for today's session?",

  'workout.currentPlan': 'Current plan',
  'workout.weekOf': 'Week {week} of {total}',
  'workout.todaysWorkout': "Today's workout",
  'workout.dayNumber': 'Day {day}',
  'workout.exerciseCount': { one: '{count} exercise', other: '{count} exercises' },
  'workout.easyWeekNotice':
    '{phase}: keep it easy and do not chase a heavier load this week.',

  'workout.modeAria': 'What to train',
  'workout.modeWorkout': 'Workout',
  'workout.modeCardio': 'Cardio',

  'workout.trainingLocation': 'Training location',
  'workout.locationHome': 'Home',
  'workout.locationGym': 'Gym',
  'workout.start': 'Start workout',

  'workout.statExercises': 'exercises',
  'workout.statWorkingSets': 'working sets',
  'workout.statMinutes': 'minutes',
  'workout.statMoves': 'moves',
  'workout.statRounds': 'rounds',
  'workout.exercisesHeading': 'Exercises',
  'workout.movementsHeading': 'Movements',
  'workout.stepSeconds': { one: '{count} sec', other: '{count} sec' },

  'workout.emptyDay': 'This day has no exercises yet.',
  'workout.viewWeeklyPlan': 'View weekly plan',
  'workout.emptySession': 'This workout has no exercises to work through.',

  'workout.showOtherDays': 'Train a different day',
  'workout.hideOtherDays': 'Hide other workouts',
  'workout.chooseWorkout': 'Choose a workout',
  'workout.extraStartsNow': 'Extra · starts now',

  'workout.showOtherSessions': 'Pick a different session',
  'workout.hideOtherSessions': 'Hide other sessions',
  'workout.chooseSession': 'Choose a cardio session',
  'workout.noCardio': 'There are no cardio sessions yet.',
  'workout.moreGuidedTitle': 'All guided sessions',
  'workout.moreGuidedSub': 'Abs, posture and stretching too, or build your own.',

  'workout.saveFailed':
    'Could not save this workout - device storage is full. Free up space (More > Settings > Backup) and press Finish again. Your workout is still here.',
  'workout.discardConfirm': {
    one: 'Discard this workout? {count} completed set will be deleted and cannot be recovered.',
    other:
      'Discard this workout? {count} completed sets will be deleted and cannot be recovered.',
  },
  'workout.discardConfirmEmpty': 'Discard this workout? It cannot be recovered.',
  'workout.endConfirm': {
    one: 'End the workout here? {count} planned set is still left. Everything you have already done is saved.',
    other:
      'End the workout here? {count} planned sets are still left. Everything you have already done is saved.',
  },

  'live.exerciseFallback': 'Exercise',
  'live.setOf': 'Set {current} of {total} · {target}',
  'live.swapAria': 'Swap this exercise for an alternative',
  'live.formGuideAria': 'Form guide, tips and video',
  'live.swapWithCount': 'Swap exercise ({count})',
  'live.formGuide': 'Form guide, tips and video',
  'live.endAria': 'End the workout here',
  'live.end': 'End workout',
  'live.finish': 'Finish',
  'live.finishWorkout': 'Finish workout',
  'live.nextExercise': 'Next exercise',
  'live.nextSet': 'Next set',
  'live.backOneSet': 'Go back one set',
  'live.skipAria': 'Skip to the next exercise',
  'live.skip': 'Skip',
  'live.listAria': 'Rest of the workout, {count} left',
  'live.list': 'List ({count})',
  'live.openFormGuideFor': 'Open the form guide for {name}',

  'live.header.exitAria': 'Leave the workout screen - your progress is kept',
  'live.header.positionAria': 'Exercise {current} of {total}',
  'live.header.progressAria': 'Sets completed',

  'live.stats.timeTarget': 'Time target',
  'live.stats.repsTarget': 'Reps target',
  'live.stats.setsDone': 'Sets done',
  'live.stats.pauseSet': 'Pause the set timer',
  'live.stats.startSet': 'Start the set timer',
  'live.stats.pauseRest': 'Pause the rest countdown',
  'live.stats.startRest': 'Start the rest countdown',
  'live.stats.resting': 'Resting',
  'live.stats.rest': 'Rest',
  'live.stats.paused': 'Paused',
  'live.stats.timeHit': 'Time hit',
  'live.stats.done': 'Done',
  'live.stats.timing': 'Timing',
  'live.stats.time': 'Time',

  'live.sets.tableAria': 'Sets for this exercise',
  'live.sets.done': 'Done',
  'live.sets.current': 'Current set',
  'live.sets.notDone': 'Not done',
  'live.sets.repsValue': '{reps} reps',
  'live.sets.weightValue': '{weight} kg',

  'live.remaining.closeAria': 'Close the exercise list',
  'live.remaining.title': 'Rest of the workout',
  'live.remaining.titleWithCount': 'Rest of the workout ({count})',
  'live.remaining.setsDone': '{done} of {total} done',

  'live.log.aria': 'Log this set (optional)',
  'live.log.seconds': 'Sec',
  'live.log.reps': 'Reps',
  'live.log.weight': 'Kg',
  'live.log.addSet': 'Add another set to this exercise',

  'swap.closeAria': 'Close the alternatives list',
  'swap.title': 'Exercise alternatives',
  'swap.sameSlot': 'Same slot',
  'swap.sameSlotWithMuscle': 'Same slot · {muscle}',
  'swap.loggedNotice': {
    one: '{count} set is already logged here. Those stay recorded against the current exercise, and the sets left move to the one you pick.',
    other:
      '{count} sets are already logged here. Those stay recorded against the current exercise, and the sets left move to the one you pick.',
  },
  'swap.sameTargetArea': 'Same target area',
  'swap.fromLibrary':
    'Your program names no alternatives for this slot, so these are the exercise library\u2019s closest matches. They keep this slot\u2019s sets and rep target.',

  'unfinished.eyebrow': 'Unfinished workout',
  'unfinished.title': 'You have an unfinished workout.',
  'unfinished.standalone': 'Standalone workout',
  'unfinished.summary': '{name} - {done} of {total} sets done.',
  'unfinished.summaryWithStart': '{name} - {done} of {total} sets done, started {started}.',
  'unfinished.continue': 'Continue Workout',
  'unfinished.discard': 'Discard Workout',
  'unfinished.workoutFallback': 'Workout',

  'finish.title': 'Workout done',
  'finish.savedLine': '{name} · saved',
  'finish.exercises': 'exercises',
  'finish.sets': 'sets',
  'finish.time': 'time',
  'finish.durationMinutes': '{minutes} min',
  'finish.durationHours': '{hours}h {minutes}m',

  'target.reps': '{reps} reps',
  'target.controlledWork': 'controlled work',

  'guidance.programWeek': 'Program week {week}. Follow the prescribed sets and effort.',
  'guidance.weekPhase': 'Week {week} — {phase}: {guidance}',
  'guidance.priority': 'Priority: {value}',
  'guidance.restriction': 'Restriction: {value}',
} as const

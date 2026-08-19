/**
 * Progression advice: the suggestion the app makes after a logged session,
 * and the static "how to progress this kind of movement" list in the library.
 */
export const coachMessages = {
  'coach.noData.title': 'No Data Yet',
  'coach.noData.message': 'Complete this exercise once to get progression advice.',
  'coach.noData.target': 'Log your first workout',
  'coach.noData.reason': 'No previous workout data found.',

  'coach.unknownTarget.title': 'Rep Range Unknown',
  'coach.unknownTarget.message':
    'Add a rep range or duration to this exercise before using progression advice.',
  'coach.unknownTarget.target': 'Set reps or duration in Plan Editor',
  'coach.unknownTarget.reason': 'Target data is missing, so load progression is paused.',

  'coach.duration.title': 'Maintain Duration',
  'coach.duration.message': 'Maintain the target duration with controlled effort.',
  'coach.duration.target': 'Repeat the target duration',
  'coach.duration.reason':
    'Timed exercises are kept separate from repetition-based progression.',

  'coach.formWarning.title': 'Form Warning',
  'coach.formWarning.message':
    'Pain was logged for this exercise. Do not increase load next time. Use a lighter load and check your form.',
  'coach.formWarning.target': 'Lighter load, focus on form',
  'coach.formWarning.reason': 'Pain was reported - safety before progression.',

  'coach.increase.title': 'Increase Load',
  'coach.increase.reason': 'All sets reached target reps with controlled RPE.',
  'coach.increase.dumbbell.message':
    'You reached the top of the rep range on every set. Move up to the next dumbbell size next time.',
  'coach.increase.dumbbell.target': 'Next dumbbell size up',
  'coach.increase.bodyweight.message':
    'You hit the top of the range on every set. Add backpack weight, slow the tempo, or try a harder variation.',
  'coach.increase.bodyweight.target': 'Add backpack weight or harder variation',
  'coach.increase.abs.title': 'Progress Abs',
  'coach.increase.abs.message':
    'Top reps reached on every set. Add reps, add time, or slow the tempo. Keep load light to protect posture.',
  'coach.increase.abs.target': 'Add reps / time / slower tempo',
  'coach.increase.abs.reason':
    'Top reps reached with good control - no need for heavy load yet.',
  'coach.increase.default.message':
    'You reached the top of the rep range for all sets. Use the smallest practical load increase next time.',
  'coach.increase.default.target': 'Add the smallest practical increment',

  'coach.keep.title': 'Keep Same Load',
  'coach.keep.bodyweight.message':
    'Same setup next time - aim for 1 more clean rep per set.',
  'coach.keep.bodyweight.target': 'Same load, +1 rep total',
  'coach.keep.bodyweight.reason':
    'You are progressing but have not reached the top of the range yet.',
  'coach.keep.abs.title': 'Keep Same',
  'coach.keep.abs.message': 'Same difficulty - add 1 rep or a few seconds next time.',
  'coach.keep.abs.target': '+1 rep or a few seconds',
  'coach.keep.abs.reason': 'Core work progresses through reps, time, and tempo.',
  'coach.keep.default.message':
    'Stay with the same weight and try to add 1 rep next workout.',
  'coach.keep.default.target': 'Same weight, +1 rep total',
  'coach.keep.default.reason':
    'You are progressing but have not reached the top of the rep range yet.',

  'coach.reduce.title': 'Reduce Load',
  'coach.reduce.reason': 'Performance was too difficult for the target range.',
  'coach.reduce.rpe.message':
    'Too close to failure last time. Keep or reduce the load next workout.',
  'coach.reduce.rpe.target': 'Reduce load by 5-10%',
  'coach.reduce.rpe.reason': 'Average RPE hit 10 - leave a rep or two in the tank.',
  'coach.reduce.bodyweight.message':
    'Reps dropped below target. Remove backpack weight or use an easier variation.',
  'coach.reduce.bodyweight.target': 'Easier variation or less added weight',
  'coach.reduce.abs.title': 'Reduce Difficulty',
  'coach.reduce.abs.message':
    'Reps dropped below target. Ease the difficulty and rebuild clean reps.',
  'coach.reduce.abs.target': 'Easier variation, rebuild reps',
  'coach.reduce.default.message':
    'Your reps dropped below the target range or RPE was too high. Reduce the weight slightly.',
  'coach.reduce.default.target': 'Reduce load by 5-10%',

  'coach.posture.easeTitle': 'Ease Off',
  'coach.posture.easeMessage':
    'Slow down and focus on control. Keep ribs down and reduce the difficulty.',
  'coach.posture.easeTarget': 'Slower reps, easier variation',
  'coach.posture.easeReason': 'Control matters more than load for posture work.',
  'coach.posture.buildTitle': 'Build Control',
  'coach.posture.buildMessage':
    'Improve control and consistency. Add reps or slow the tempo - keep the load light.',
  'coach.posture.buildTarget': 'Add reps / slower tempo, stay consistent',
  'coach.posture.buildReason': 'Posture work progresses through control, not heavy load.',

  'coach.cardio.holdTitle': 'Hold Cardio',
  'coach.cardio.holdMessage':
    'Keep this pace and let your conditioning settle before adding time.',
  'coach.cardio.holdTarget': 'Same duration and incline',
  'coach.cardio.holdReason': 'Effort was already high last session.',
  'coach.cardio.progressTitle': 'Progress Cardio',
  'coach.cardio.progressMessage':
    'Walk felt controlled. Add 5 minutes or a slight incline. Skip running to protect your shins.',
  'coach.cardio.progressTarget': '+5 min or slight incline',
  'coach.cardio.progressReason': 'Cardio completed comfortably.',

  'coach.summary.reps': '{reps} reps',
  'coach.summary.weight': '@ {weight} kg',
  'coach.summary.rpe': ' · RPE {rpe}',
  'coach.summary.logged': 'Logged',

  'advice.duration.1': 'Maintain the target duration with controlled effort',
  'advice.duration.2': 'Keep the movement or pace consistent before adding difficulty',
  'advice.duration.3': 'Use RPE and pain notes to guide the next session',
  'advice.duration.4': 'Reduce duration or load if form deteriorates',

  'advice.dumbbell.1': 'Reach the top of your rep range on every set first',
  'advice.dumbbell.2': 'Then move up to the next dumbbell size and rebuild reps',
  'advice.dumbbell.3': 'Keep RPE around 8-9 - leave 1-2 reps in the tank',
  'advice.dumbbell.4': 'Log any pain and reduce load if it appears',

  'advice.weighted.1': 'Reach the top of your rep range on every set first',
  'advice.weighted.2':
    'Then add the smallest practical load increment and rebuild your reps',
  'advice.weighted.3': 'Keep RPE around 8-9 - do not grind to failure',
  'advice.weighted.4': 'Keep ribs down and brace; reduce load if the back arches',

  'advice.bodyweight.1': 'First reach all sets at the top clean rep count',
  'advice.bodyweight.2': 'Then add backpack weight or a harder variation',
  'advice.bodyweight.3': 'Slow the tempo before adding load',
  'advice.bodyweight.4': 'If the lower back arches, reduce load and reset form',

  'advice.abs.1': 'Add reps or time before adding any load',
  'advice.abs.2': 'Slow the tempo to make it harder',
  'advice.abs.3': 'Keep ribs down and avoid pulling on the neck',
  'advice.abs.4': 'Add light load only once form is perfect',

  'advice.posture.1': 'Do not chase heavy load here',
  'advice.posture.2': 'Progress with control, slower reps, and consistency',
  'advice.posture.3': 'Keep ribs down and glutes lightly squeezed',
  'advice.posture.4': 'Quality over quantity on every rep',

  'advice.cardio.1': 'Add 5 minutes before adding intensity',
  'advice.cardio.2': 'Use incline instead of running to protect your shins',
  'advice.cardio.3': 'Keep the effort conversational',
  'advice.cardio.4': 'Stop if your shins start to flare up',
} as const

import { getPlanfitMediaById } from './planfitExerciseMedia'

/**
 * The movement catalog the guided workouts are built from.
 *
 * Guided workouts are follow-along drills rather than program slots: nothing
 * here is logged in reps and weight, nothing is swapped for an alternative,
 * and every movement is held for a number of seconds. That is a different
 * shape from `exerciseLibrary`, so it is a separate, much smaller catalog
 * rather than a set of extra fields bolted onto the strength library.
 *
 * Adding a movement is a matter of adding one entry here: a name, a coaching
 * line, two how-to lines, and where its demonstration comes from. Nothing in
 * the player is aware of any particular exercise.
 */

/** A spoken line, timed from the moment the exercise starts. */
export interface GuidedAudioCue {
  /** Seconds into the step. A cue past the step's length is simply not read. */
  at: number
  say: string
}

export interface GuidedExercise {
  id: string
  name: string
  /** One line, printed under the name and read aloud as the exercise starts. */
  cue: string
  /** How the movement is performed. Two lines, readable at arm's length. */
  instructions: string[]
  /**
   * Planfit catalog id. The still and the looping clip are both derived from
   * it, so a movement needs one number rather than two URLs.
   */
  planfitId?: number
  /** Any GIF/MP4/WebM URL, used instead of the Planfit clip. */
  animationUrl?: string
  /** Still shown under the clip, and instead of it when it will not play. */
  imageUrl?: string
  /** Why the demonstration is a near match rather than the exact movement. */
  mediaNote?: string
  /** Coaching read part-way through, on top of the automatic cues. */
  audioCues?: GuidedAudioCue[]
  /**
   * A recorded voiceover for this exercise, played instead of the device
   * speech voice. Any audio URL the browser can play.
   */
  audioUrl?: string
  /** Done one side at a time - the player says which half to swap over. */
  perSide?: boolean
  /** Both feet leave the floor. What the low-impact workouts stay clear of. */
  impact?: 'low' | 'high'
  /** Empty means nothing but a floor and your own bodyweight. */
  equipment?: string[]
}

/** Resolved demonstration media for one movement. */
export interface GuidedExerciseMedia {
  imageUrl: string
  animationUrl: string
}

const catalog: GuidedExercise[] = [
  // ----------------------------------------------------------- cardio / HIIT
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    cue: 'Land soft, arms all the way overhead.',
    instructions: [
      'Jump the feet wide and sweep both arms above your head.',
      'Jump them back together and keep a steady, springy rhythm.',
    ],
    planfitId: 9006,
    impact: 'high',
    audioCues: [{ at: 12, say: 'Arms all the way up. Stay light on your feet.' }],
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    cue: 'Knees to hip height, stay on the balls of your feet.',
    instructions: [
      'Drive one knee up to hip height, then quickly swap.',
      'Stay tall, pump the arms, and keep the contact with the floor short.',
    ],
    planfitId: 9017,
    mediaNote:
      'Planfit High Knee Skips: the same knee drive and arm action, demonstrated with a small skip between reps.',
    impact: 'high',
    audioCues: [{ at: 15, say: 'Higher knees. Drive the arms.' }],
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    cue: 'Hips low, shoulders stacked over your hands.',
    instructions: [
      'Start in a push-up position with your hands under your shoulders.',
      'Drive the knees to your chest one at a time without letting the hips rise.',
    ],
    planfitId: 5025,
    impact: 'low',
    audioCues: [{ at: 15, say: 'Keep the hips down. Quick feet.' }],
  },
  {
    id: 'burpees',
    name: 'Burpees',
    cue: 'Chest to the floor, then jump and reach.',
    instructions: [
      'Squat down, plant your hands, and shoot the feet back to a plank.',
      'Jump the feet back in, stand, and finish with a jump and a reach overhead.',
    ],
    planfitId: 9005,
    impact: 'high',
    audioCues: [{ at: 20, say: 'Pace it. Full stand at the top of every rep.' }],
  },
  {
    id: 'slow-burpees',
    name: 'Slow Burpees',
    cue: 'Same shape as a burpee, walked instead of jumped.',
    instructions: [
      'Squat down, plant the hands, and step the feet back one at a time.',
      'Step them back in and stand tall - no jump at either end.',
    ],
    planfitId: 9021,
    impact: 'low',
  },
  {
    id: 'squat-jumps',
    name: 'Squat Jumps',
    cue: 'Sit back, explode up, land quietly.',
    instructions: [
      'Drop into a squat with your chest up and your weight through mid-foot.',
      'Drive up into a jump and absorb the landing straight back into the next squat.',
    ],
    planfitId: 4051,
    impact: 'high',
    audioCues: [{ at: 15, say: 'Soft landings. Knees tracking over your toes.' }],
  },
  {
    id: 'skater-hops',
    name: 'Skater Hops',
    cue: 'Bound side to side and stick each landing.',
    instructions: [
      'Push off one leg and bound sideways onto the other.',
      'Let the trailing leg swing behind you and hold the landing for a beat.',
    ],
    planfitId: 9050,
    impact: 'high',
  },
  {
    id: 'plank-jacks',
    name: 'Plank Jacks',
    cue: 'Plank on top, jumping feet underneath.',
    instructions: [
      'Hold a strong plank with your shoulders over your hands.',
      'Jump the feet wide and back together without letting the hips bounce.',
    ],
    planfitId: 5047,
    impact: 'high',
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    cue: 'Small hops, wrists doing the turning.',
    instructions: [
      'Turn the rope from the wrists, elbows tucked in near your ribs.',
      'Keep the jumps low - just enough to clear the rope.',
    ],
    planfitId: 9007,
    impact: 'high',
    equipment: ['Skipping rope'],
  },
  {
    id: 'criss-cross-jacks',
    name: 'Criss-Cross Jacks',
    cue: 'Cross the arms and feet, then open wide.',
    instructions: [
      'Jump the feet apart and swing the arms out to the sides.',
      'Jump them back crossing one foot and one arm over the other, alternating each rep.',
    ],
    planfitId: 9015,
    impact: 'high',
  },
  {
    id: 'step-jacks',
    name: 'Step Jacks',
    cue: 'A jumping jack with one foot always down.',
    instructions: [
      'Step one foot out to the side and sweep both arms overhead.',
      'Step it back in and repeat on the other side, keeping the rhythm going.',
    ],
    planfitId: 9018,
    impact: 'low',
  },
  {
    id: 'marching-on-spot',
    name: 'Marching On The Spot',
    cue: 'Tall posture, knees up, arms swinging.',
    instructions: [
      'March on the spot lifting each knee to hip height.',
      'Swing the opposite arm with every step and breathe steadily.',
    ],
    planfitId: 9024,
    impact: 'low',
  },
  {
    id: 'ankle-touches',
    name: 'Alternating Ankle Touches',
    cue: 'Hinge side to side and reach for the ankle.',
    instructions: [
      'Stand with your feet wide and bend to one side, reaching for that ankle.',
      'Come back up and repeat on the other side at a steady pace.',
    ],
    planfitId: 9042,
    impact: 'low',
  },
  {
    id: 'front-kicks',
    name: 'Front Kicks',
    cue: 'Kick from the hip, guard up.',
    instructions: [
      'Keep your hands up and drive one foot forward at hip height.',
      'Bring it straight back under you and swap sides.',
    ],
    planfitId: 5046,
    impact: 'low',
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    cue: 'Thighs parallel, back flat against the wall.',
    instructions: [
      'Slide down a wall until your knees are bent to a right angle.',
      'Press your lower back into the wall and breathe - nothing moves.',
    ],
    planfitId: 4069,
    impact: 'low',
    audioCues: [{ at: 20, say: 'Keep breathing. Weight in your heels.' }],
  },
  {
    id: 'bodyweight-squats',
    name: 'Bodyweight Squats',
    cue: 'Sit back between your heels, chest tall.',
    instructions: [
      'Feet about shoulder width, toes turned slightly out.',
      'Sit back and down as far as you can hold a flat back, then stand and squeeze.',
    ],
    planfitId: 4056,
    impact: 'low',
  },
  {
    id: 'lunge-twist',
    name: 'Lunge With Twist',
    cue: 'Long step, then rotate over the front leg.',
    instructions: [
      'Step forward into a lunge until both knees are bent to a right angle.',
      'Rotate your torso towards the front leg, come back to centre and push up.',
    ],
    planfitId: 4111,
    impact: 'low',
  },

  // -------------------------------------------------------------------- abs
  {
    id: 'crunch',
    name: 'Crunch',
    cue: 'Ribs towards hips - the lower back stays down.',
    instructions: [
      'Lie on your back with your knees bent and your hands by your ears.',
      'Curl your shoulders off the floor, pause at the top, and lower with control.',
    ],
    planfitId: 5002,
    impact: 'low',
    audioCues: [{ at: 15, say: 'Chin off your chest. Squeeze at the top.' }],
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    cue: 'Opposite elbow towards opposite knee, slowly.',
    instructions: [
      'Lie back, lift both feet, and bring one knee in as the other leg extends.',
      'Rotate your chest - not just your elbow - towards the bent knee, and alternate.',
    ],
    planfitId: 5006,
    impact: 'low',
  },
  {
    id: 'reverse-crunch',
    name: 'Reverse Crunch',
    cue: 'Roll the hips up, do not swing the legs.',
    instructions: [
      'Lie on your back with your knees bent over your hips and arms by your sides.',
      'Curl your hips off the floor towards your ribs, then lower slowly.',
    ],
    planfitId: 5028,
    impact: 'low',
  },
  {
    id: 'plank',
    name: 'Plank',
    cue: 'One straight line from your head to your heels.',
    instructions: [
      'Elbows under your shoulders, forearms flat on the floor.',
      'Squeeze your glutes and abs so your hips neither sag nor pike up.',
    ],
    planfitId: 5009,
    impact: 'low',
    audioCues: [{ at: 20, say: 'Hips level. Keep breathing.' }],
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    cue: 'Hips high, shoulder stacked over the elbow.',
    instructions: [
      'Lie on your side and prop yourself on one forearm, feet stacked.',
      'Lift your hips until your body is a straight line and hold.',
    ],
    planfitId: 5019,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'leg-raise',
    name: 'Lying Leg Raise',
    cue: 'Lower only as far as your back stays flat.',
    instructions: [
      'Lie flat with your hands under your hips and your legs straight.',
      'Raise both legs to vertical, then lower them slowly without arching.',
    ],
    planfitId: 5001,
    impact: 'low',
  },
  {
    id: 'flutter-kicks',
    name: 'Flutter Kicks',
    cue: 'Small, fast kicks with the lower back pinned down.',
    instructions: [
      'Lie on your back with your legs straight and lifted just off the floor.',
      'Kick them past each other in a short, quick scissor.',
    ],
    planfitId: 5050,
    impact: 'low',
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    cue: 'Rotate from the ribs, chest stays lifted.',
    instructions: [
      'Sit back at about forty-five degrees with your feet off the floor.',
      'Rotate your torso from side to side, touching the floor beside each hip.',
    ],
    planfitId: 5017,
    impact: 'low',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    cue: 'Lower back glued to the floor throughout.',
    instructions: [
      'Lie back with your arms up and your knees over your hips.',
      'Lower one arm and the opposite leg, breathe out, and return. Alternate sides.',
    ],
    planfitId: 5054,
    impact: 'low',
    audioCues: [{ at: 15, say: 'Press your lower back into the floor.' }],
  },
  {
    id: 'hollow-hold',
    name: 'Hollow Hold',
    cue: 'Press the lower back down and hold the dish shape.',
    instructions: [
      'Lie on your back and lift your shoulders, arms and legs off the floor.',
      'Keep the lower back pressed flat - drop the legs higher if it lifts.',
    ],
    planfitId: 5027,
    impact: 'low',
  },
  {
    id: 'heel-touches',
    name: 'Heel Touches',
    cue: 'Crunch to the side and tap your heel.',
    instructions: [
      'Lie on your back with your knees bent and heels close to your hips.',
      'Lift your shoulders slightly and reach side to side to touch each heel.',
    ],
    planfitId: 5036,
    impact: 'low',
  },
  {
    id: 'oblique-crunch',
    name: 'Oblique Crunch',
    cue: 'Drive the elbow towards the opposite hip.',
    instructions: [
      'Lie on your back with both knees dropped to one side.',
      'Curl your shoulders up towards your top hip, then lower with control.',
    ],
    planfitId: 5015,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'hip-raise-plank',
    name: 'Plank Hip Raise',
    cue: 'From a forearm plank, pike the hips up and back.',
    instructions: [
      'Hold a forearm plank with your feet about hip width apart.',
      'Push the hips up towards the ceiling, then lower back to a flat plank.',
    ],
    planfitId: 5048,
    impact: 'low',
  },
  {
    id: 'reverse-plank',
    name: 'Reverse Plank',
    cue: 'Chest open, hips lifted, eyes forward.',
    instructions: [
      'Sit with your legs straight and your hands on the floor behind your hips.',
      'Press through your hands and heels to lift the hips into a straight line.',
    ],
    planfitId: 5016,
    impact: 'low',
  },
  {
    id: 'torso-rotation',
    name: 'Standing Torso Rotation',
    cue: 'Turn from the waist, hips facing forward.',
    instructions: [
      'Stand tall with your arms bent in front of your chest.',
      'Rotate your upper body left and right, keeping your hips still.',
    ],
    planfitId: 5049,
    impact: 'low',
  },

  // ---------------------------------------------------- posture correction
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    cue: 'Opposite arm and leg, no wobble through the hips.',
    instructions: [
      'On all fours, hands under shoulders and knees under hips.',
      'Reach one arm forward and the opposite leg back, pause, and swap.',
    ],
    planfitId: 5040,
    impact: 'low',
    audioCues: [{ at: 15, say: 'Slow it down. Keep your hips square to the floor.' }],
  },
  {
    id: 'superman',
    name: 'Superman',
    cue: 'Lift the chest and thighs, look at the floor.',
    instructions: [
      'Lie face down with your arms reaching in front of you.',
      'Lift your chest, arms and legs a few inches, hold a beat, and lower.',
    ],
    planfitId: 5021,
    impact: 'low',
  },
  {
    id: 'prone-w-raise',
    name: 'Prone W Raise',
    cue: 'Pull the shoulder blades down and together.',
    instructions: [
      'Lie face down with your elbows bent so your arms make a W.',
      'Lift your hands and chest slightly by squeezing between the shoulder blades.',
    ],
    planfitId: 1073,
    impact: 'low',
  },
  {
    id: 'band-reverse-fly',
    name: 'Band Reverse Fly',
    cue: 'Open the arms wide, thumbs leading.',
    instructions: [
      'Hold a band in front of you at chest height with straight arms.',
      'Pull it apart until your arms are wide, squeeze, and return slowly.',
    ],
    planfitId: 3052,
    impact: 'low',
    equipment: ['Resistance bands'],
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    cue: 'Pull to your forehead, elbows high.',
    instructions: [
      'Hold a band at head height and pull it towards your face.',
      'Finish with your hands beside your ears and your elbows above your wrists.',
    ],
    planfitId: 3009,
    impact: 'low',
    equipment: ['Resistance bands'],
  },
  {
    id: 'wall-walks',
    name: 'Wall Shoulder Walks',
    cue: 'Ribs down - do not arch to reach higher.',
    instructions: [
      'Stand facing a wall and place both hands on it at chest height.',
      'Walk your hands up the wall as far as you can without your ribs flaring, then back down.',
    ],
    planfitId: 5097,
    impact: 'low',
  },
  {
    id: 'wall-push-up',
    name: 'Wall Push-Up',
    cue: 'Push the floor away and let the shoulder blades spread.',
    instructions: [
      'Stand an arm length from a wall with your hands at shoulder height.',
      'Bend your elbows to bring your chest to the wall, then press away.',
    ],
    planfitId: 6024,
    impact: 'low',
  },
  {
    id: 'good-morning',
    name: 'Bodyweight Good Morning',
    cue: 'Hinge at the hips with a flat back.',
    instructions: [
      'Stand with your hands behind your head and a soft bend in your knees.',
      'Push your hips back until you feel your hamstrings, then stand and squeeze your glutes.',
    ],
    planfitId: 1030,
    impact: 'low',
  },
  {
    id: 'chin-tuck',
    name: 'Chin Tuck',
    cue: 'Slide the head back over your shoulders.',
    instructions: [
      'Sit or stand tall and look straight ahead.',
      'Draw your chin straight back to make a double chin, hold, and release.',
    ],
    planfitId: 10046,
    mediaNote:
      'Planfit Forward Neck Flexion Stretch: it starts from the same chin-in retraction, then continues into a larger neck stretch.',
    impact: 'low',
  },
  {
    id: 'back-slaps',
    name: 'Back Slaps And Wrap',
    cue: 'Swing the arms open, then wrap them around you.',
    instructions: [
      'Swing both arms wide open to stretch across the chest.',
      'Wrap them around yourself to open up between the shoulder blades, and repeat.',
    ],
    planfitId: 10009,
    impact: 'low',
  },
  {
    id: 'elbows-back-stretch',
    name: 'Elbows Back Stretch',
    cue: 'Chest open, shoulders rolling back and down.',
    instructions: [
      'Bring your hands behind your head with your elbows wide.',
      'Draw the elbows back until you feel the chest open, and breathe there.',
    ],
    planfitId: 10012,
    impact: 'low',
  },
  {
    id: 'reach-up-rotation',
    name: 'Standing Reach And Rotate',
    cue: 'Reach tall, then turn and open the chest.',
    instructions: [
      'Reach both arms overhead and lengthen through your side.',
      'Open one arm behind you as you rotate the upper back, then swap sides.',
    ],
    planfitId: 10006,
    impact: 'low',
  },
  {
    id: 'chest-stretch',
    name: 'Overhead Chest Stretch',
    cue: 'Hands behind the head, elbows back.',
    instructions: [
      'Lace your fingers behind your head and lift your chest.',
      'Ease the elbows back until the front of your shoulders opens, then hold.',
    ],
    planfitId: 10008,
    impact: 'low',
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    cue: 'Round on the way out, arch on the way in.',
    instructions: [
      'Start on all fours with your hands under your shoulders.',
      'Round your back as you breathe out, then arch and lift your chest as you breathe in.',
    ],
    planfitId: 10050,
    impact: 'low',
  },
  {
    id: 'cobra-stretch',
    name: 'Cobra Stretch',
    cue: 'Long through the front, shoulders away from your ears.',
    instructions: [
      'Lie face down with your hands under your shoulders.',
      'Press up to lift your chest, keeping your hips on the floor.',
    ],
    planfitId: 10054,
    impact: 'low',
  },

  // ------------------------------------------------- mobility / stretching
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    cue: 'Hips high, heels reaching for the floor.',
    instructions: [
      'From all fours, tuck your toes and lift your hips into an upside-down V.',
      'Press the floor away, lengthen your spine, and let the heels sink.',
    ],
    planfitId: 5090,
    impact: 'low',
  },
  {
    id: 'low-lunge',
    name: 'Low Lunge',
    cue: 'Sink the hips forward and stay tall.',
    instructions: [
      'Step one foot forward and lower the back knee to the floor.',
      'Ease your hips forward until the front of the back hip opens, and hold.',
    ],
    planfitId: 4110,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'lunge-stretch',
    name: 'Deep Lunge Stretch',
    cue: 'Drop the hips and let the chest stay lifted.',
    instructions: [
      'Take a long step forward and sink into a deep lunge.',
      'Keep the back leg long and breathe into the front of that hip.',
    ],
    planfitId: 10065,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Kneeling Hip Flexor Stretch',
    cue: 'Tuck the tailbone under before you lean.',
    instructions: [
      'Kneel on one knee with the other foot planted in front.',
      'Squeeze the glute on the kneeling side and ease your hips forward.',
    ],
    planfitId: 10064,
    perSide: true,
    impact: 'low',
    audioCues: [{ at: 12, say: 'Tuck your tailbone. Do not arch your lower back.' }],
  },
  {
    id: 'butterfly-stretch',
    name: 'Butterfly Stretch',
    cue: 'Soles together, chest tall, knees easing down.',
    instructions: [
      'Sit with the soles of your feet together and your heels near your hips.',
      'Sit up tall and let your knees settle towards the floor.',
    ],
    planfitId: 10020,
    impact: 'low',
  },
  {
    id: 'lying-hamstring-stretch',
    name: 'Lying Hamstring Stretch',
    cue: 'Straight leg up, the other one pressed down.',
    instructions: [
      'Lie on your back and raise one straight leg towards you.',
      'Hold behind the thigh and keep the other leg flat on the floor.',
    ],
    planfitId: 10021,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'standing-hamstring-stretch',
    name: 'Standing Hamstring Stretch',
    cue: 'Hinge from the hips, back stays long.',
    instructions: [
      'Put one heel in front of you with that leg straight and toes up.',
      'Push your hips back and hinge forward until the hamstring pulls.',
    ],
    planfitId: 10067,
    impact: 'low',
  },
  {
    id: 'quad-stretch',
    name: 'Standing Quad Stretch',
    cue: 'Knees together, hips tucked under.',
    instructions: [
      'Hold one ankle behind you and bring the knees level.',
      'Tuck your hips under until the front of the thigh stretches.',
    ],
    planfitId: 10037,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'calf-stretch',
    name: 'Seated Calf Stretch',
    cue: 'Pull the toes towards you, knee straight.',
    instructions: [
      'Sit with one leg straight out in front of you.',
      'Reach for the foot and draw the toes back towards your shin.',
    ],
    planfitId: 10025,
    impact: 'low',
  },
  {
    id: 'lat-stretch',
    name: 'Kneeling Lat Stretch',
    cue: 'Hips back, armpits sinking towards the floor.',
    instructions: [
      'Kneel and place both hands on the floor in front of you.',
      'Sit your hips back and let your chest sink between your arms.',
    ],
    planfitId: 10002,
    impact: 'low',
  },
  {
    id: 'shoulder-stretch',
    name: 'Cross-Body Shoulder Stretch',
    cue: 'Arm across the chest, shoulder pulled down.',
    instructions: [
      'Bring one straight arm across your chest.',
      'Hook it with the other arm and draw it in, keeping the shoulder down.',
    ],
    planfitId: 10055,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'neck-stretch',
    name: 'Side Neck Stretch',
    cue: 'Ear towards the shoulder, no shrugging.',
    instructions: [
      'Sit or stand tall and tilt one ear towards that shoulder.',
      'Let the opposite shoulder stay heavy and breathe into the stretch.',
    ],
    planfitId: 10049,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'dynamic-chest-stretch',
    name: 'Dynamic Chest Stretch',
    cue: 'Open the arms wide and pulse gently.',
    instructions: [
      'Bring both arms out to the sides at shoulder height.',
      'Draw them back to open the chest, then release, in a steady rhythm.',
    ],
    planfitId: 10011,
    impact: 'low',
  },
  {
    id: 'dynamic-back-stretch',
    name: 'Dynamic Back Stretch',
    cue: 'Round forward, then open wide.',
    instructions: [
      'Reach both arms forward and round your upper back.',
      'Open the arms wide and lift the chest, then repeat at an easy pace.',
    ],
    planfitId: 10003,
    impact: 'low',
  },
]

/** Every movement the guided workouts can use, keyed by id. */
export const guidedExercises: Readonly<Record<string, GuidedExercise>> =
  Object.freeze(
    catalog.reduce<Record<string, GuidedExercise>>((map, exercise) => {
      map[exercise.id] = exercise
      return map
    }, {}),
  )

export const guidedExerciseList: readonly GuidedExercise[] = catalog

/** The catalog entry for an id, or undefined when nothing is registered. */
export function findGuidedExercise(id: string): GuidedExercise | undefined {
  return guidedExercises[id]
}

/**
 * Where the demonstration comes from: an explicit URL when the exercise
 * carries one, otherwise the Planfit pair derived from its catalog id.
 *
 * Never routed through the service worker - see docs/exercise-gifs.md: the
 * CDN sends no CORS header, so a cached response is opaque and WebKit
 * refuses to play it.
 */
export function getGuidedExerciseMedia(
  exercise: GuidedExercise | null | undefined,
): GuidedExerciseMedia {
  if (!exercise) {
    return { animationUrl: '', imageUrl: '' }
  }

  const planfit =
    typeof exercise.planfitId === 'number'
      ? getPlanfitMediaById(exercise.planfitId)
      : undefined

  return {
    animationUrl: exercise.animationUrl?.trim() || planfit?.animationUrl || '',
    imageUrl: exercise.imageUrl?.trim() || planfit?.imageUrl || '',
  }
}

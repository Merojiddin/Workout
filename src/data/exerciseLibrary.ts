export type ExerciseCategory =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Abs'
  | 'Posture'
  | 'Conditioning'

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type EquipmentTag =
  | 'Bodyweight'
  | 'Backpack'
  | 'Pull-up bar'
  | 'Dips'
  | 'Dumbbells'
  | 'Barbell'
  | 'Bench'
  | 'Treadmill'
  | 'Skipping rope'
  | 'VR Quest 2'
  | 'Mat'
  | 'Resistance bands'
  | 'Cable machine'
  | 'Smith machine'
  | 'Weight machine'
  | 'Plyometric box'
  | 'Medicine ball'
  | 'Heavy bag'
  | 'Landmine'
  | "Captain's chair"

export interface DemoLink {
  label: string
  url: string
}

export type VideoType = 'youtube' | 'external' | 'none'

/** Media fields shown during workouts and in the exercise library. */
export interface ExerciseMedia {
  /** Image URL. Local placeholder paths work offline; replace with real photos later. */
  imageUrl?: string
  imageAlt?: string
  /** Embeddable video URL (https://www.youtube.com/embed/VIDEO_ID). Watch/short URLs are auto-converted. */
  videoUrl?: string
  videoType?: VideoType
  videoTitle?: string
}

export interface LibraryExercise extends ExerciseMedia {
  id: string
  name: string
  category: ExerciseCategory
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: EquipmentTag[]
  difficulty: Difficulty
  formCue: string
  instructions: string[]
  formTips: string[]
  commonMistakes: string[]
  progression: string[]
  regression: string[]
  postureNotes: string
  demoLinks: DemoLink[]
  relatedWorkoutDays: number[]
  postureFocus?: boolean
}

// Options used by the filters. Order matters for the UI.
export const exerciseCategories: ExerciseCategory[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Abs',
  'Posture',
  'Conditioning',
]

export const equipmentOptions: EquipmentTag[] = [
  'Bodyweight',
  'Backpack',
  'Pull-up bar',
  'Dips',
  'Dumbbells',
  'Barbell',
  'Bench',
  'Treadmill',
  'Skipping rope',
  'VR Quest 2',
  'Resistance bands',
  'Cable machine',
  'Smith machine',
  'Weight machine',
  'Plyometric box',
  'Medicine ball',
  'Heavy bag',
  'Landmine',
  "Captain's chair",
]

export const difficultyOptions: Difficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
]

// Shared arched-back / neutral-spine safety note reused across pressing,
// planks, squats, rows and overhead work.
const archSafety =
  'Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.'

// Every demo link is a YouTube search so links never break. Two per exercise:
// one for correct form, one for common mistakes.
function ytForm(query: string): DemoLink {
  return {
    label: 'YouTube · proper form',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${query} proper form technique`,
    )}`,
  }
}

function ytMistakes(query: string): DemoLink {
  return {
    label: 'YouTube · common mistakes',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${query} common mistakes`,
    )}`,
  }
}

function demos(query: string): DemoLink[] {
  return [ytForm(query), ytMistakes(query)]
}

type V21ProgressionMode = 'load' | 'skill' | 'control'

interface V21ExerciseSeed {
  id: string
  name: string
  category: ExerciseCategory
  primaryMuscles: string[]
  secondaryMuscles?: string[]
  equipment: EquipmentTag[]
  difficulty?: Difficulty
  formCue: string
  setup: string
  execution: string
  safety?: string
  relatedWorkoutDays: number[]
  progressionMode?: V21ProgressionMode
  progression?: string[]
  regression?: string[]
  postureNotes?: string
  postureFocus?: boolean
}

const categoryPlaceholder: Record<ExerciseCategory, string> = {
  Chest: '/exercise-placeholders/chest.svg',
  Back: '/exercise-placeholders/back.svg',
  Shoulders: '/exercise-placeholders/shoulders.svg',
  Arms: '/exercise-placeholders/arms.svg',
  Legs: '/exercise-placeholders/legs.svg',
  Abs: '/exercise-placeholders/abs.svg',
  Posture: '/exercise-placeholders/posture.svg',
  Conditioning: '/exercise-placeholders/conditioning.svg',
}

/**
 * V2.1 adds many equipment-specific variants. Keeping the shared guide copy in
 * one factory makes each variant a complete LibraryExercise without pretending
 * that machine, cable, Smith, band, and free-weight loads are interchangeable.
 */
function createV21Exercise(seed: V21ExerciseSeed): LibraryExercise {
  const progressionMode = seed.progressionMode ?? 'load'
  const progression =
    seed.progression ??
    (progressionMode === 'load'
      ? [
          `Learn ${seed.name} with a clearly manageable load`,
          'Add clean repetitions within the programmed range',
          'Reach the top of the range at the required RIR',
          'Increase by the smallest practical load increment',
        ]
      : progressionMode === 'skill'
        ? [
            `Practice ${seed.name} slowly with consistent technique`,
            'Build repeatable rounds or repetitions',
            'Increase duration or complexity only while quality stays high',
          ]
        : [
            `Learn ${seed.name} in a small comfortable range`,
            'Build smooth, repeatable control',
            'Add range or light resistance without creating fatigue',
          ])

  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    primaryMuscles: seed.primaryMuscles,
    secondaryMuscles: seed.secondaryMuscles ?? [],
    equipment: seed.equipment,
    difficulty: seed.difficulty ?? 'Intermediate',
    formCue: seed.formCue,
    instructions: [
      seed.setup,
      seed.execution,
      'Use a smooth, controlled return to the start position.',
      seed.safety ?? 'Stop the set before technique changes or pain appears.',
    ],
    formTips: [
      seed.formCue,
      'Use the full range that you can control comfortably',
      'Keep each repetition consistent',
      'Leave the programmed repetitions in reserve',
    ],
    commonMistakes: [
      'Using momentum instead of the target muscles',
      'Changing the range from repetition to repetition',
      'Using more load than can be controlled',
      'Continuing through sharp or unusual pain',
    ],
    progression,
    regression: seed.regression ?? [
      `Use a lighter ${seed.name} variation`,
      'Reduce the range to a comfortable controlled range',
      'Choose the simpler equipment alternative from the same workout slot',
    ],
    postureNotes:
      seed.postureNotes ??
      'Keep the neck comfortable, ribs controlled, and spine neutral. Do not gain range by jutting the chin or over-arching the lower back.',
    demoLinks: demos(seed.name),
    relatedWorkoutDays: seed.relatedWorkoutDays,
    imageUrl: categoryPlaceholder[seed.category],
    imageAlt: `${seed.name} exercise category placeholder`,
    videoType: 'none',
    postureFocus: seed.postureFocus,
  }
}

const v21ExerciseLibrary: LibraryExercise[] = [
  // ----------------------------------------------------------------- Back
  createV21Exercise({
    id: 'assisted-pull-up',
    name: 'Assisted Pull-Up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: ['Weight machine', 'Pull-up bar'],
    difficulty: 'Beginner',
    formCue:
      'Use only enough assistance for controlled full-range repetitions.',
    setup:
      'Set the assistance and take a secure overhand grip on the pull-up handles.',
    execution:
      'Drive the elbows down, lift without swinging, and lower to a controlled hang.',
    safety: 'Keep the neck long; do not reach the chin toward the handles.',
    relatedWorkoutDays: [1],
  }),
  createV21Exercise({
    id: 'neutral-grip-lat-pulldown',
    name: 'Neutral-Grip Lat Pulldown',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: ['Cable machine'],
    formCue:
      'Pull the neutral handles toward the upper chest without leaning back.',
    setup:
      'Secure the thighs under the pad and take a palms-facing neutral grip.',
    execution:
      'Set the shoulders down and pull the elbows toward the ribs, then reach up under control.',
    safety:
      'Finish with the arms and shoulder blades rather than extending the neck.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'neutral-grip-pull-up',
    name: 'Neutral-Grip Pull-Up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    formCue:
      'Keep the palms facing and drive the elbows down without swinging.',
    setup:
      'Take a secure palms-facing grip and begin from a quiet controlled hang.',
    execution:
      'Pull the chest toward the handles and lower through a comfortable full range.',
    safety: 'Keep the ribs controlled and do not finish by craning the neck.',
    relatedWorkoutDays: [6],
  }),
  createV21Exercise({
    id: 'chest-supported-machine-row',
    name: 'Chest-Supported Machine Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the chest on the pad while the shoulder blades move naturally.',
    setup:
      'Adjust the seat and chest pad so the handles begin just beyond arm length.',
    execution:
      'Row the elbows toward the torso without lifting the chest from the pad.',
    safety: 'Do not jerk the load or poke the chin forward to finish.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'chest-supported-t-bar-row',
    name: 'Chest-Supported T-Bar Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps'],
    equipment: ['Weight machine'],
    formCue: 'Stay supported and row the handles without bouncing off the pad.',
    setup: 'Lie securely on the chest pad and take the selected T-bar handles.',
    execution:
      'Pull toward the lower ribs, pause briefly, and lower until the shoulder blades spread.',
    safety:
      'Keep the neck relaxed and stop before the shoulders roll forward uncontrollably.',
    relatedWorkoutDays: [1],
  }),
  createV21Exercise({
    id: 'cable-row',
    name: 'Seated Cable Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps'],
    equipment: ['Cable machine'],
    formCue: 'Hold a stable torso and row without rocking backward.',
    setup:
      'Sit tall with the feet braced and take the selected cable attachment.',
    execution:
      'Row toward the lower ribs, allow a controlled reach, and keep the torso angle steady.',
    safety: 'Do not create range by rounding or overextending the spine.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'machine-row',
    name: 'Seated Machine Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the torso supported and pull the elbows back without shrugging.',
    setup:
      'Adjust the seat and handles so the shoulders can reach forward comfortably.',
    execution:
      'Row through the elbows, pause without leaning, and return under control.',
    safety:
      'Keep the head over the ribs rather than reaching the chin toward the pad.',
    relatedWorkoutDays: [6],
  }),
  createV21Exercise({
    id: 'one-arm-cable-row',
    name: 'One-Arm Cable Row',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: ['Cable machine'],
    formCue: 'Brace the torso and row one side without rotating.',
    setup:
      'Take one cable handle with the shoulders and hips square to the machine.',
    execution:
      'Pull the elbow toward the hip while resisting trunk rotation, then reach forward slowly.',
    safety: 'Reduce the load if the torso twists or the shoulder shrugs.',
    relatedWorkoutDays: [1],
  }),
  createV21Exercise({
    id: 'one-arm-machine-row',
    name: 'One-Arm Machine Row',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: ['Weight machine'],
    formCue:
      'Stay square against the support and row one arm without twisting.',
    setup:
      'Adjust the seat or chest pad and take one handle with the free hand braced.',
    execution:
      'Drive the working elbow back and return until the shoulder blade reaches naturally.',
    safety:
      'Keep the chest supported and avoid rotating to move a heavier load.',
    relatedWorkoutDays: [1],
  }),

  // ------------------------------------------------------------ Shoulders
  createV21Exercise({
    id: 'incline-bench-rear-delt-raise',
    name: 'Incline-Bench Rear-Delt Dumbbell Raise',
    category: 'Shoulders',
    primaryMuscles: ['Rear Shoulders'],
    secondaryMuscles: ['Upper Back', 'Traps'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    formCue:
      'Keep the chest supported and sweep light dumbbells out without shrugging.',
    setup:
      'Lie face down on a low incline bench with light dumbbells hanging freely.',
    execution:
      'Raise the arms out to the sides with a fixed elbow bend, then lower slowly.',
    safety: 'Use a load that lets the neck and upper traps stay relaxed.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'reverse-pec-deck',
    name: 'Reverse Pec Deck',
    category: 'Shoulders',
    primaryMuscles: ['Rear Shoulders'],
    secondaryMuscles: ['Upper Back', 'Traps'],
    equipment: ['Weight machine'],
    formCue: 'Keep the chest supported and open the arms without shrugging.',
    setup:
      'Adjust the seat so the handles align near shoulder height and brace the chest on the pad.',
    execution:
      'Sweep the arms back through a comfortable arc and return without letting the stack slam.',
    safety: 'Avoid forcing the handles behind a comfortable shoulder range.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'cable-rear-delt-fly',
    name: 'Cable Rear-Delt Fly',
    category: 'Shoulders',
    primaryMuscles: ['Rear Shoulders'],
    secondaryMuscles: ['Upper Back', 'Traps'],
    equipment: ['Cable machine'],
    formCue:
      'Open the arms with the rear delts while the ribs and torso stay quiet.',
    setup:
      'Set the cables near shoulder height and take the opposite handle in each hand.',
    execution:
      'Sweep the arms outward with soft elbows and return until the rear delts lengthen.',
    safety:
      'Keep the shoulders away from the ears and avoid a forceful end range.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    category: 'Shoulders',
    primaryMuscles: ['Side Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Cable machine'],
    formCue: 'Lead with the elbow and keep cable tension without leaning back.',
    setup:
      'Set a low cable, stand side-on, and hold the handle with the outside hand.',
    execution:
      'Raise the arm toward shoulder height, then lower slowly across the body.',
    safety: 'Reduce the load if the torso sways or the shoulder shrugs.',
    relatedWorkoutDays: [1, 4, 6],
  }),
  createV21Exercise({
    id: 'lateral-raise-machine',
    name: 'Lateral Raise Machine',
    category: 'Shoulders',
    primaryMuscles: ['Side Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the torso on the pad and lift through the elbows without shrugging.',
    setup: 'Adjust the seat so the machine pivot aligns with the shoulders.',
    execution:
      'Drive the pads outward to a controlled height and lower without dropping the stack.',
    safety: 'Use a pain-free arc and keep the neck relaxed.',
    relatedWorkoutDays: [1, 4, 6],
  }),
  createV21Exercise({
    id: 'supported-seated-dumbbell-press',
    name: 'Supported Seated Dumbbell Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders', 'Side Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    equipment: ['Dumbbells', 'Bench'],
    formCue: 'Stay against the backrest and press without flaring the ribs.',
    setup:
      'Set the bench upright, sit with the upper back supported, and bring the dumbbells to shoulder height.',
    execution:
      'Press through a symptom-free overhead arc and lower with the wrists stacked over the elbows.',
    safety:
      'Do not gain range by jutting the chin or arching away from the backrest.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'high-incline-one-arm-dumbbell-press',
    name: 'High-Incline One-Arm Dumbbell Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders', 'Upper Chest'],
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    formCue:
      'Stay square on the high incline and resist rotating as one arm presses.',
    setup:
      'Set a high incline, brace both feet, and hold one dumbbell at shoulder height.',
    execution:
      'Press upward while keeping both shoulders against the bench, then lower under control.',
    safety:
      'Use only symptom-free range and keep the ribs stacked over the pelvis.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'landmine-press',
    name: 'Landmine Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders', 'Upper Chest'],
    secondaryMuscles: ['Triceps', 'Serratus', 'Core'],
    equipment: ['Landmine', 'Barbell'],
    formCue: 'Press up and forward while keeping the ribs and pelvis stacked.',
    setup:
      'Secure the bar in a landmine, face the sleeve, and hold it at shoulder height.',
    execution:
      'Press along the bar path while allowing the shoulder blade to rotate naturally.',
    safety: 'Do not lean back or twist to finish the press.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'machine-shoulder-press',
    name: 'Machine Shoulder Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders', 'Side Shoulders'],
    secondaryMuscles: ['Triceps'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the back supported and press through a comfortable shoulder path.',
    setup:
      'Adjust the seat so the handles begin around shoulder height with the back supported.',
    execution:
      'Press without locking forcefully and lower until the shoulders remain comfortable.',
    safety: 'Keep the ribs down and avoid forcing a deep bottom position.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'push-up-plus',
    name: 'Push-Up Plus',
    category: 'Posture',
    primaryMuscles: ['Serratus'],
    secondaryMuscles: ['Chest', 'Triceps', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Finish by gently spreading the shoulder blades without rounding the whole spine.',
    setup:
      'Take a stable push-up position with the ribs controlled and elbows comfortably angled.',
    execution:
      'Complete the push-up, then push the floor away slightly farther as the shoulder blades wrap forward.',
    safety:
      'Keep this light, stop well before failure, and avoid jutting the head forward.',
    relatedWorkoutDays: [4],
    progressionMode: 'control',
    postureFocus: true,
  }),
  createV21Exercise({
    id: 'band-face-pull',
    name: 'Light Band Face Pull',
    category: 'Posture',
    primaryMuscles: ['Upper Back', 'Rear Shoulders'],
    secondaryMuscles: ['External Rotators'],
    equipment: ['Resistance bands'],
    difficulty: 'Beginner',
    formCue:
      'Pull lightly toward the face while keeping the neck long and ribs quiet.',
    setup:
      'Anchor a light band around face height and step back until it is gently tensioned.',
    execution:
      'Pull toward the eyebrows with the elbows open, then return until the shoulder blades reach.',
    safety:
      'Use light resistance; this recovery drill should not create fatigue.',
    relatedWorkoutDays: [7],
    progressionMode: 'control',
    postureFocus: true,
  }),
  createV21Exercise({
    id: 'band-pull-apart',
    name: 'Band Pull-Apart',
    category: 'Posture',
    primaryMuscles: ['Upper Back', 'Rear Shoulders'],
    secondaryMuscles: ['External Rotators'],
    equipment: ['Resistance bands'],
    difficulty: 'Beginner',
    formCue: 'Pull the light band apart without flaring the ribs or shrugging.',
    setup:
      'Hold a light band at chest height with soft elbows and relaxed shoulders.',
    execution:
      'Separate the hands until the band nears the chest, then return slowly.',
    safety:
      'Shorten the range if the shoulders roll forward or the neck tightens.',
    relatedWorkoutDays: [7],
    progressionMode: 'control',
    postureFocus: true,
  }),
  createV21Exercise({
    id: 'wall-slide',
    name: 'Wall Slide',
    category: 'Posture',
    primaryMuscles: ['Serratus', 'Lower Traps'],
    secondaryMuscles: ['Shoulders', 'Upper Back'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Reach upward smoothly while the ribs stay stacked and the neck stays relaxed.',
    setup:
      'Stand facing a wall with the forearms supported and the feet in a comfortable stance.',
    execution:
      'Slide the forearms upward while reaching gently into the wall, then return slowly.',
    safety:
      'Use only the range that does not cause pinching or lower-back arching.',
    relatedWorkoutDays: [7],
    progressionMode: 'control',
    postureFocus: true,
  }),

  // ----------------------------------------------------------------- Arms
  createV21Exercise({
    id: 'bayesian-cable-curl',
    name: 'Bayesian Cable Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Cable machine'],
    formCue:
      'Keep the upper arm behind the torso while curling without shoulder movement.',
    setup:
      'Set a low cable, face away, and step forward with the working arm extended behind the torso.',
    execution:
      'Curl the handle while keeping the upper arm quiet, then lower to a comfortable long-muscle position.',
    safety:
      'Do not force the shoulder farther behind the body than feels comfortable.',
    relatedWorkoutDays: [1],
  }),
  createV21Exercise({
    id: 'preacher-curl',
    name: 'Preacher Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the upper arms on the pad and control the lengthened bottom position.',
    setup:
      'Adjust the preacher seat so the armpits rest comfortably near the top of the pad.',
    execution:
      'Curl without lifting the upper arms, then lower slowly before the elbows lock forcefully.',
    safety: 'Avoid bouncing or relaxing suddenly at the bottom of the curl.',
    relatedWorkoutDays: [1, 6],
  }),
  createV21Exercise({
    id: 'cable-curl',
    name: 'Cable Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Cable machine'],
    formCue: 'Keep the elbows still and curl without rocking the torso.',
    setup:
      'Attach the selected handle to a low cable and stand tall with the arms extended.',
    execution:
      'Curl the handle toward the shoulders and lower until the elbows straighten under control.',
    safety:
      'Reduce the load if the shoulders roll forward or the torso leans back.',
    relatedWorkoutDays: [6],
  }),
  createV21Exercise({
    id: 'rope-hammer-curl',
    name: 'Rope Hammer Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps', 'Brachialis'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Cable machine'],
    formCue:
      'Keep a neutral grip and curl the rope without moving the elbows forward.',
    setup:
      'Attach a rope to a low cable and hold it with the palms facing each other.',
    execution:
      'Curl the rope ends toward the shoulders, then extend the elbows slowly.',
    safety: 'Keep the wrists neutral and do not lean back to finish.',
    relatedWorkoutDays: [1],
  }),
  createV21Exercise({
    id: 'resistance-band-overhead-triceps-extension',
    name: 'Resistance-Band Overhead Triceps Extension',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Core'],
    equipment: ['Resistance bands'],
    difficulty: 'Beginner',
    formCue:
      'Keep the upper arms steady and ribs down as the elbows straighten.',
    setup:
      'Secure the band low behind the body and bring the hands overhead with the elbows bent.',
    execution:
      'Straighten the elbows without moving the upper arms, then return slowly.',
    safety:
      'Use a band and range that do not irritate the elbows or shoulders.',
    relatedWorkoutDays: [4, 6],
  }),
  createV21Exercise({
    id: 'cable-overhead-triceps-extension',
    name: 'Cable Overhead Triceps Extension',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Core'],
    equipment: ['Cable machine'],
    formCue:
      'Hold the upper arms still and extend without arching the lower back.',
    setup:
      'Face away from a cable with a rope held behind the head and take a stable staggered stance.',
    execution:
      'Straighten the elbows along the cable path, then return to a comfortable stretch.',
    safety: 'Keep the ribs controlled and use symptom-free shoulder range.',
    relatedWorkoutDays: [4, 6],
  }),
  createV21Exercise({
    id: 'resistance-band-triceps-pressdown',
    name: 'Resistance-Band Triceps Pressdown',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Resistance bands'],
    difficulty: 'Beginner',
    formCue: 'Pin the elbows near the ribs and press down without rocking.',
    setup:
      'Anchor the band securely overhead and hold it with the elbows bent beside the torso.',
    execution:
      'Straighten the elbows until the hands pass the hips, then return under control.',
    safety:
      'Check the anchor before every set and keep the band away from the face.',
    relatedWorkoutDays: [4, 6],
  }),
  createV21Exercise({
    id: 'cable-triceps-pressdown',
    name: 'Cable Triceps Pressdown',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Cable machine'],
    difficulty: 'Beginner',
    formCue:
      'Keep the elbows fixed beside the torso and press without shoulder movement.',
    setup:
      'Attach a bar or rope to a high cable and stand with the elbows close to the ribs.',
    execution:
      'Extend the elbows fully under control, then return without letting them drift forward.',
    safety:
      'Use a load that does not require leaning body weight onto the handle.',
    relatedWorkoutDays: [4, 6],
  }),

  // ----------------------------------------------------------------- Legs
  createV21Exercise({
    id: 'countermovement-jump',
    name: 'Countermovement Jump',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Calves', 'Hamstrings'],
    equipment: ['Bodyweight'],
    difficulty: 'Intermediate',
    formCue:
      'Jump crisply and land quietly in balance; every rep is a fresh effort.',
    setup:
      'Stand in an athletic stance with clear space and knees tracking over the toes.',
    execution:
      'Dip quickly, jump vertically, and absorb the landing before fully resetting.',
    safety:
      'Use only when the knees and ankles feel good; stop as soon as jump quality drops.',
    relatedWorkoutDays: [2],
    progressionMode: 'skill',
    progression: [
      'Practice low submaximal jumps and quiet landings',
      'Build consistent sets of three crisp repetitions',
      'Increase jump intent without adding fatigue',
    ],
  }),
  createV21Exercise({
    id: 'box-jump',
    name: 'Box Jump',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Calves', 'Hamstrings'],
    equipment: ['Plyometric box'],
    difficulty: 'Intermediate',
    formCue:
      'Use a conservative box, land fully on top, and step down between reps.',
    setup:
      'Choose a stable non-slip box that does not require an extreme knee tuck.',
    execution:
      'Jump onto the center of the box, stand under control, and step down carefully.',
    safety:
      'Never chase box height when tired, and do not jump down from the box.',
    relatedWorkoutDays: [2],
    progressionMode: 'skill',
    progression: [
      'Practice low-box landings',
      'Build consistent sets of three clean jumps',
      'Use a slightly higher box only if landing mechanics stay identical',
    ],
  }),
  createV21Exercise({
    id: 'goblet-squat',
    name: 'Heavy Goblet Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Adductors', 'Core'],
    equipment: ['Dumbbells'],
    formCue:
      'Hold the dumbbell close, brace, and keep the knees tracking with the toes.',
    setup:
      'Cup one dumbbell vertically at the chest and set a stable squat stance.',
    execution:
      'Squat between the hips to a controlled depth and drive through the whole foot.',
    safety:
      'Stop before the pelvis or lower back loses a comfortable neutral position.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'double-dumbbell-squat',
    name: 'Double-Dumbbell Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Adductors', 'Core'],
    equipment: ['Dumbbells'],
    formCue: 'Keep both dumbbells stable and descend with even foot pressure.',
    setup:
      'Hold two dumbbells securely at the sides or shoulders and set a balanced stance.',
    execution:
      'Descend under control with the knees tracking, then stand without shifting side to side.',
    safety:
      'Choose the loading position that keeps the wrists, shoulders, and back comfortable.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'hack-squat',
    name: 'Hack Squat',
    category: 'Legs',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glutes', 'Adductors'],
    equipment: ['Weight machine'],
    formCue: 'Keep the back on the pad and track the knees over the toes.',
    setup:
      'Set the feet securely on the platform and place the shoulders beneath the pads.',
    execution:
      'Lower to a controlled depth and drive the platform away without locking the knees forcefully.',
    safety:
      'Do not descend farther than the pelvis and lower back can remain supported.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'pendulum-squat',
    name: 'Pendulum Squat',
    category: 'Legs',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glutes', 'Adductors'],
    equipment: ['Weight machine'],
    formCue:
      'Stay against the pad and follow the machine arc with controlled knee tracking.',
    setup:
      'Adjust the machine and place the feet where the full foot stays planted through the arc.',
    execution:
      'Descend smoothly, pause before position changes, and drive back without bouncing.',
    safety:
      'Use the safety stops and a depth that remains comfortable for knees and hips.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'leg-press',
    name: 'Leg Press',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Adductors', 'Hamstrings'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the pelvis on the pad and lower only as far as the back stays controlled.',
    setup:
      'Set both feet securely on the platform and release the safeties only after bracing.',
    execution:
      'Lower the platform smoothly and press through the whole foot without hard knee lockout.',
    safety:
      'Stop the descent before the pelvis tucks or the lower back lifts from the pad.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'smith-machine-squat',
    name: 'Smith Machine Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Adductors', 'Core'],
    equipment: ['Smith machine'],
    formCue:
      'Choose a foot position that fits the fixed bar path and keep pressure even.',
    setup:
      'Set the safeties, place the bar comfortably across the upper back, and position the feet.',
    execution:
      'Squat along the fixed path to a controlled depth and stand without snapping the knees.',
    safety: 'Test the rack hooks and safeties before loading working weight.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'smith-machine-bulgarian-split-squat',
    name: 'Smith Machine Bulgarian Split Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Adductors'],
    equipment: ['Smith machine', 'Bench'],
    formCue:
      'Stay balanced under the bar and drive through the entire front foot.',
    setup:
      'Set the safeties, place the rear foot on a bench, and center the front stance beneath the bar.',
    execution:
      'Lower vertically with the front knee tracking and rise without pushing off the rear leg.',
    safety: 'Confirm the hooks can be engaged safely from the split stance.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'leg-extension',
    name: 'Leg Extension',
    category: 'Legs',
    primaryMuscles: ['Quads'],
    secondaryMuscles: [],
    equipment: ['Weight machine'],
    difficulty: 'Beginner',
    formCue: 'Keep the hips on the seat and extend the knees without swinging.',
    setup:
      'Align the machine pivot with the knee and place the shin pad above the ankles.',
    execution:
      'Extend to a comfortable top position, squeeze briefly, and lower slowly.',
    safety: 'Use a pain-free range and avoid kicking the pad with momentum.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'resistance-band-leg-curl',
    name: 'Resistance-Band Leg Curl',
    category: 'Legs',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    equipment: ['Resistance bands', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Keep the hips quiet and curl the heels without arching the back.',
    setup:
      'Anchor the band securely and attach it around the ankles in a stable lying position.',
    execution:
      'Bend the knees against the band, pause, and extend slowly without losing tension.',
    safety: 'Check the band and anchor for damage before every set.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'seated-leg-curl',
    name: 'Seated Leg Curl',
    category: 'Legs',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the thighs secured and curl through a controlled full range.',
    setup:
      'Align the knees with the machine pivot and secure the thigh pad comfortably.',
    execution:
      'Curl the heels down and back, pause, and return until the hamstrings lengthen.',
    safety:
      'Do not let the weight pull the knees into a forceful locked position.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'lying-leg-curl',
    name: 'Lying Leg Curl',
    category: 'Legs',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    equipment: ['Weight machine'],
    formCue: 'Keep the hips on the pad and curl without lifting the pelvis.',
    setup:
      'Lie face down with the knees aligned to the pivot and the roller above the heels.',
    execution:
      'Curl toward the glutes, pause before the hips lift, and lower slowly.',
    safety:
      'Reduce the load if the lower back arches or the pelvis leaves the pad.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'weighted-single-leg-calf-raise',
    name: 'Weighted Single-Leg Calf Raise',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    secondaryMuscles: ['Foot Stabilizers'],
    equipment: ['Dumbbells'],
    formCue:
      'Use support for balance and move one ankle through a full controlled range.',
    setup:
      'Stand on one foot near a stable support and hold a dumbbell in the other hand.',
    execution:
      'Rise onto the ball of the foot, pause, and lower into a comfortable calf stretch.',
    safety:
      'Keep the ankle aligned and stop if the Achilles tendon or foot feels painful.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'standing-calf-machine-raise',
    name: 'Standing Calf Machine Raise',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    secondaryMuscles: ['Foot Stabilizers'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the knees softly straight and pause at both ends of the ankle range.',
    setup:
      'Set the shoulder pads comfortably and place the balls of the feet securely on the platform.',
    execution:
      'Rise as high as controlled, pause, and lower the heels into a comfortable stretch.',
    safety:
      'Keep the machine safeties engaged and avoid bouncing out of the bottom.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'seated-calf-machine-raise',
    name: 'Seated Calf Machine Raise',
    category: 'Legs',
    primaryMuscles: ['Calves', 'Soleus'],
    secondaryMuscles: [],
    equipment: ['Weight machine'],
    formCue: 'Keep the knees under the pad and move only through the ankles.',
    setup:
      'Sit with the knee pad secured above the knees and the balls of the feet on the platform.',
    execution:
      'Raise the heels, pause, and lower slowly into a comfortable stretch.',
    safety:
      'Release and engage the machine stop only while the heels are supported.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'leg-press-calf-raise',
    name: 'Leg-Press Calf Raise',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    secondaryMuscles: ['Foot Stabilizers'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the knees stable and move the platform only through the ankles.',
    setup:
      'On a secured leg press, place the balls of the feet on the lower platform with the knees softly bent.',
    execution:
      'Press through the toes, pause, and lower the heels without letting the feet slip.',
    safety:
      'Use safeties and never place the feet so low that they can slide off the platform.',
    relatedWorkoutDays: [2, 5],
  }),
  createV21Exercise({
    id: 'dumbbell-romanian-deadlift',
    name: 'Dumbbell Romanian Deadlift',
    category: 'Legs',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core', 'Forearms'],
    equipment: ['Dumbbells'],
    formCue: 'Push the hips back and keep the dumbbells close to the legs.',
    setup:
      'Stand with two dumbbells at the thighs, feet hip-width, and knees softly bent.',
    execution:
      'Hinge until the hamstrings limit the range, then stand by driving the hips forward.',
    safety:
      'Stop before lumbar position changes and keep the neck neutral throughout.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'smith-machine-romanian-deadlift',
    name: 'Smith Machine Romanian Deadlift',
    category: 'Legs',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core', 'Forearms'],
    equipment: ['Smith machine'],
    formCue:
      'Hinge along the fixed bar path while keeping the bar close and spine neutral.',
    setup:
      'Set the Smith safeties and begin with the bar at the thighs in a stable hip-width stance.',
    execution:
      'Push the hips back along the bar path, then stand once the hamstrings reach their controlled limit.',
    safety: 'Stop before the lower back rounds or the neck changes position.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'front-foot-elevated-dumbbell-reverse-lunge',
    name: 'Front-Foot-Elevated Dumbbell Reverse Lunge',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Core'],
    equipment: ['Dumbbells'],
    formCue:
      'Keep the entire front foot on the platform and step back under control.',
    setup:
      'Stand on a stable low platform with dumbbells at the sides and clear space behind.',
    execution:
      'Step back, lower through the front hip and knee, and drive through the elevated front foot.',
    safety:
      'Use a low non-slip elevation and stop before balance or pelvic control changes.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'front-foot-elevated-smith-reverse-lunge',
    name: 'Front-Foot-Elevated Smith Reverse Lunge',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Adductors'],
    equipment: ['Smith machine'],
    formCue:
      'Stay centered under the bar and drive through the elevated front foot.',
    setup:
      'Set the safeties and a stable low front platform, then center beneath the Smith bar.',
    execution:
      'Step one foot back, descend on the front leg, and return without pushing from the rear foot.',
    safety:
      'Confirm the hooks and safety height can be reached from the lunge stance.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'dumbbell-hip-thrust',
    name: 'Dumbbell Hip Thrust',
    category: 'Legs',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    formCue:
      'Secure the dumbbell at the hips and finish with the glutes, not the lower back.',
    setup:
      'Brace the upper back on a bench and hold a padded dumbbell securely across the hips.',
    execution:
      'Drive through the feet to a level hip position and lower without losing rib control.',
    safety:
      'Do not hyperextend the lower back or let the dumbbell roll toward the abdomen.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'smith-machine-hip-thrust',
    name: 'Smith Machine Hip Thrust',
    category: 'Legs',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Smith machine', 'Bench'],
    formCue:
      'Keep the bar padded and finish with level hips without over-arching.',
    setup:
      'Position a stable bench, pad the Smith bar over the hips, and set the machine safeties.',
    execution:
      'Drive the bar up with the glutes, pause at level hips, and lower under control.',
    safety:
      'Check bench stability and do not finish by extending the neck or lower back.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'hip-thrust-machine',
    name: 'Hip-Thrust Machine',
    category: 'Legs',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Weight machine'],
    formCue: 'Keep the ribs down and drive to level hips using the glutes.',
    setup:
      'Adjust the machine belt or pad securely across the hips and plant both feet.',
    execution:
      'Extend the hips to a controlled level position, pause, and lower smoothly.',
    safety:
      'Do not chase range by arching the lower back or throwing the head back.',
    relatedWorkoutDays: [5],
  }),
  createV21Exercise({
    id: 'suitcase-hold',
    name: 'Suitcase Hold',
    category: 'Abs',
    primaryMuscles: ['Obliques', 'Core'],
    secondaryMuscles: ['Forearms', 'Shoulders'],
    equipment: ['Dumbbells'],
    formCue: 'Stand tall and resist leaning toward or away from the load.',
    setup:
      'Stand with one dumbbell held at the side and both feet planted evenly.',
    execution:
      'Hold the stacked position while breathing normally, then switch sides.',
    safety: 'End the hold when posture shifts or grip becomes unreliable.',
    relatedWorkoutDays: [5],
    progressionMode: 'control',
    progression: [
      'Use a short light suitcase hold',
      'Build toward the programmed hold duration',
      'Increase load only while the torso stays level',
    ],
  }),
  createV21Exercise({
    id: 'captains-chair-knee-raise',
    name: "Captain's Chair Knee Raise",
    category: 'Abs',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Hip Flexors', 'Obliques'],
    equipment: ["Captain's chair"],
    difficulty: 'Intermediate',
    formCue: 'Curl the pelvis toward the ribs and lower without swinging.',
    setup:
      'Support the forearms on the chair pads, brace the back, and let the legs hang quietly.',
    execution:
      'Raise the knees by curling the pelvis, pause, and lower without losing control.',
    safety: 'Stop before shoulder support fails or the legs begin to swing.',
    relatedWorkoutDays: [5],
  }),

  // ---------------------------------------------------------------- Chest
  createV21Exercise({
    id: 'high-incline-dumbbell-press',
    name: 'High-Incline Dumbbell Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest', 'Front Shoulders'],
    secondaryMuscles: ['Triceps'],
    equipment: ['Dumbbells', 'Bench'],
    formCue:
      'Stay supported on the high incline and press without flaring the ribs.',
    setup:
      'Set a high incline, plant the feet, and bring both dumbbells to a stable shoulder position.',
    execution:
      'Press upward along a comfortable arc and lower with the wrists stacked over the elbows.',
    safety:
      'Do not gain range by jutting the chin or excessively arching the lower back.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'incline-smith-machine-press',
    name: 'Incline Smith Machine Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps'],
    equipment: ['Smith machine', 'Bench'],
    formCue:
      'Set the bench to match the fixed bar path and lower with control.',
    setup:
      'Center an incline bench beneath the Smith bar and set the safeties above the chest.',
    execution:
      'Lower toward the upper chest through comfortable range and press without lifting the hips.',
    safety: 'Test the hooks and safety stops before the working set.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'incline-chest-press-machine',
    name: 'Incline Chest Press Machine',
    category: 'Chest',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the torso on the pad and press through a comfortable incline path.',
    setup:
      'Adjust the seat so the handles begin around the upper chest with the back fully supported.',
    execution:
      'Press without forceful lockout and return until the shoulders remain comfortable.',
    safety: 'Avoid lifting the chest or head from the pad to gain range.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps'],
    equipment: ['Dumbbells', 'Bench'],
    formCue:
      'Keep the shoulder blades controlled and press the dumbbells evenly.',
    setup:
      'Lie on a flat bench with the feet planted and dumbbells stable beside the chest.',
    execution:
      'Press over the chest and lower until the shoulders remain comfortable and controlled.',
    safety: 'Do not use lower-back arch or chin reach to create extra range.',
    relatedWorkoutDays: [4, 6],
  }),
  createV21Exercise({
    id: 'chest-press-machine',
    name: 'Chest Press Machine',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps'],
    equipment: ['Weight machine'],
    formCue: 'Stay against the pad and press without shrugging or bouncing.',
    setup:
      'Adjust the seat so the handles align around mid-chest and the feet are stable.',
    execution:
      'Press along the machine path and return to a comfortable chest stretch.',
    safety:
      'Avoid forcing a deep start position that rolls the shoulders forward.',
    relatedWorkoutDays: [4, 6],
  }),
  createV21Exercise({
    id: 'cable-chest-fly',
    name: 'Cable Fly',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Shoulders'],
    equipment: ['Cable machine'],
    formCue: 'Bring the arms together in an arc while the torso stays still.',
    setup:
      'Set both cables to the selected height and take a stable staggered stance between them.',
    execution:
      'Sweep the hands together with soft elbows, then open to a comfortable chest stretch.',
    safety:
      'Do not let the cables pull the shoulders into an uncontrolled end range.',
    relatedWorkoutDays: [4],
  }),
  createV21Exercise({
    id: 'pec-deck',
    name: 'Pec Deck',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Shoulders'],
    equipment: ['Weight machine'],
    formCue:
      'Keep the torso supported and bring the pads together without shoulder roll.',
    setup:
      'Adjust the seat and start position so the upper arms are supported comfortably.',
    execution:
      'Bring the arms together, squeeze briefly, and return to a controlled stretch.',
    safety:
      'Use a start position that does not force the shoulders too far behind the torso.',
    relatedWorkoutDays: [4],
  }),

  // ------------------------------------------------------------------ Abs
  createV21Exercise({
    id: 'resistance-band-kneeling-crunch',
    name: 'Resistance-Band Kneeling Crunch',
    category: 'Abs',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Obliques'],
    equipment: ['Resistance bands', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Curl the ribs toward the pelvis instead of hinging at the hips.',
    setup:
      'Anchor a band securely overhead and kneel while holding it beside the head.',
    execution:
      'Shorten the trunk by curling the ribs down, then return without shifting the hips.',
    safety: 'Check the anchor and keep the band clear of the face.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'cable-kneeling-crunch',
    name: 'Cable Kneeling Crunch',
    category: 'Abs',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Obliques'],
    equipment: ['Cable machine', 'Mat'],
    formCue:
      'Curl the ribs toward the pelvis while the hips stay nearly fixed.',
    setup:
      'Kneel facing a high cable and hold the rope beside the head with a stable base.',
    execution:
      'Flex the trunk to bring the ribs toward the pelvis, then uncurl slowly.',
    safety: 'Do not use a heavy load that turns the movement into a hip hinge.',
    relatedWorkoutDays: [2],
  }),
  createV21Exercise({
    id: 'resistance-band-pallof-press',
    name: 'Resistance-Band Pallof Press',
    category: 'Abs',
    primaryMuscles: ['Obliques', 'Core'],
    secondaryMuscles: ['Glutes', 'Shoulders'],
    equipment: ['Resistance bands'],
    difficulty: 'Beginner',
    formCue: 'Press straight out while resisting rotation toward the anchor.',
    setup:
      'Anchor the band near chest height and stand side-on in a balanced stance.',
    execution:
      'Press the hands away from the sternum, pause without rotating, and return slowly.',
    safety:
      'Use light tension that allows normal breathing and a level pelvis.',
    relatedWorkoutDays: [2],
    progressionMode: 'control',
  }),
  createV21Exercise({
    id: 'cable-pallof-press',
    name: 'Cable Pallof Press',
    category: 'Abs',
    primaryMuscles: ['Obliques', 'Core'],
    secondaryMuscles: ['Glutes', 'Shoulders'],
    equipment: ['Cable machine'],
    formCue: 'Stay square while pressing the cable away from the chest.',
    setup:
      'Set the cable near chest height and stand side-on with the feet planted.',
    execution:
      'Press the handle straight out, resist the cable rotation, and return under control.',
    safety:
      'Choose a load that does not pull the hips or shoulders out of alignment.',
    relatedWorkoutDays: [2],
    progressionMode: 'control',
  }),

  // --------------------------------------------------------- Conditioning
  createV21Exercise({
    id: 'boxing-footwork-drill',
    name: 'Boxing Footwork Drill',
    category: 'Conditioning',
    primaryMuscles: ['Boxing Skill', 'Legs'],
    secondaryMuscles: ['Calves', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Keep the stance balanced, move without crossing the feet, and reset after angles.',
    setup:
      'Take a relaxed boxing stance in clear space with the guard in a comfortable position.',
    execution:
      'Practice forward, backward, lateral, pivot, and angle-exit steps while maintaining stance width.',
    safety:
      'Keep the rounds technical and stop if balance or foot placement becomes careless.',
    relatedWorkoutDays: [3],
    progressionMode: 'skill',
  }),
  createV21Exercise({
    id: 'shadowboxing',
    name: 'Shadowboxing',
    category: 'Conditioning',
    primaryMuscles: ['Boxing Skill', 'Shoulders'],
    secondaryMuscles: ['Core', 'Legs', 'Cardiovascular System'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Punch smoothly, recover the guard quickly, and stay balanced after combinations.',
    setup:
      'Take a relaxed stance with clear space and choose a technical focus for the round.',
    execution:
      'Link controlled punches, defense, pivots, and exits without chasing maximal speed.',
    safety: 'Avoid snapping the elbows or exaggerating neck and head movement.',
    relatedWorkoutDays: [3],
    progressionMode: 'skill',
  }),
  createV21Exercise({
    id: 'boxing-defense-drill',
    name: 'Boxing Defense Drill',
    category: 'Conditioning',
    primaryMuscles: ['Boxing Skill', 'Core'],
    secondaryMuscles: ['Legs', 'Shoulders'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Use small controlled slips, rolls, pivots, and exits while staying in stance.',
    setup:
      'Begin in a balanced guard and select one defensive response to practice at a time.',
    execution:
      'Practice slips, rolls, pivots, and exits with immediate guard and stance recovery.',
    safety:
      'Avoid exaggerated head or neck motion and keep the drills submaximal.',
    relatedWorkoutDays: [3],
    progressionMode: 'skill',
  }),
  createV21Exercise({
    id: 'heavy-bag-boxing',
    name: 'Heavy-Bag Boxing',
    category: 'Conditioning',
    primaryMuscles: ['Boxing Skill', 'Cardiovascular System'],
    secondaryMuscles: ['Shoulders', 'Core', 'Legs'],
    equipment: ['Heavy bag'],
    difficulty: 'Intermediate',
    formCue:
      'Keep the wrist stacked, recover the hands quickly, and prioritize clean mechanics.',
    setup:
      'Wrap the hands, wear appropriate gloves, and begin at a balanced distance from the bag.',
    execution:
      'Deliver planned combinations with stance recovery, defense, and controlled power.',
    safety:
      'Do not make every round maximal; stop if wrist alignment or technique deteriorates.',
    relatedWorkoutDays: [3, 6],
    progressionMode: 'skill',
  }),
  createV21Exercise({
    id: 'rotational-medicine-ball-throw',
    name: 'Rotational Medicine-Ball Throw',
    category: 'Conditioning',
    primaryMuscles: ['Core', 'Hips'],
    secondaryMuscles: ['Shoulders', 'Chest'],
    equipment: ['Medicine ball'],
    difficulty: 'Intermediate',
    formCue:
      'Rotate through the hips and trunk, release crisply, and reset every repetition.',
    setup:
      'Stand side-on to a solid throwing wall with a light medicine ball and clear rebound space.',
    execution:
      'Load the hips, rotate, and throw into the wall before collecting the rebound and resetting.',
    safety:
      'Use a ball and wall rated for throwing and keep bystanders outside the rebound path.',
    relatedWorkoutDays: [3],
    progressionMode: 'skill',
    progression: [
      'Learn the throw with a light ball',
      'Build repeatable sets of four to six crisp throws per side',
      'Increase intent before considering a heavier medicine ball',
    ],
  }),
  createV21Exercise({
    id: 'brisk-walking',
    name: 'Brisk Walking',
    category: 'Conditioning',
    primaryMuscles: ['Cardiovascular System', 'Legs'],
    secondaryMuscles: ['Calves', 'Glutes'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Walk tall at a sustainable conversational pace with a natural stride.',
    setup:
      'Choose a safe route or flat walking surface and begin at an easy pace.',
    execution:
      'Build to a brisk but controlled rhythm while keeping the shoulders relaxed.',
    safety:
      'Slow down if breathing is no longer conversational or recovery is worsened.',
    relatedWorkoutDays: [7],
    progressionMode: 'control',
    progression: [
      'Begin with a short easy walk',
      'Build toward thirty minutes at a conversational pace',
      'Extend gradually toward forty-five minutes when recovery stays good',
    ],
  }),

  // -------------------------------------------------------------- Posture
  createV21Exercise({
    id: 'chin-tuck',
    name: 'Chin Tuck',
    category: 'Posture',
    primaryMuscles: ['Deep Neck Flexors'],
    secondaryMuscles: ['Upper Back'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue: 'Glide the head straight back gently without looking down.',
    setup: 'Sit or stand tall with the eyes level and the jaw relaxed.',
    execution:
      'Draw the chin straight backward into a small double-chin position, pause, and release.',
    safety:
      'Use very light effort and stop for dizziness, radiating symptoms, or neck pain.',
    relatedWorkoutDays: [7],
    progressionMode: 'control',
    postureNotes:
      'This is a light movement-control drill, not a structural correction. Keep it symptom-free and avoid pressing the head forcefully backward.',
    postureFocus: true,
  }),
  createV21Exercise({
    id: 'thoracic-extension-reach',
    name: 'Thoracic Extension / Reach',
    category: 'Posture',
    primaryMuscles: ['Upper Back'],
    secondaryMuscles: ['Shoulders', 'Serratus'],
    equipment: ['Bodyweight', 'Bench'],
    difficulty: 'Beginner',
    formCue:
      'Reach through the upper back while the ribs and pelvis remain controlled.',
    setup:
      'Kneel in front of a bench or wall with the elbows or hands supported comfortably.',
    execution:
      'Sit the hips back and let the upper chest reach down through a comfortable thoracic range.',
    safety:
      'Do not force range through the neck, shoulders, or lower-back arch.',
    relatedWorkoutDays: [7],
    progressionMode: 'control',
    postureFocus: true,
  }),
  createV21Exercise({
    id: 'four-way-neck-isometric',
    name: 'Four-Way Neck Isometric',
    category: 'Posture',
    primaryMuscles: ['Neck Flexors', 'Neck Extensors'],
    secondaryMuscles: ['Lateral Neck Flexors'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue:
      'Use easy hand resistance and keep the head still in every direction.',
    setup:
      'Sit tall and place a hand on the forehead, back, or side of the head for the selected direction.',
    execution:
      'Press gently into the hand without moving the neck, breathe normally, then change directions.',
    safety:
      'Use easy to moderate effort only; no maximal effort, harness loading, or painful holds.',
    relatedWorkoutDays: [],
    progressionMode: 'control',
    progression: [
      'Begin with brief ten-second easy holds',
      'Build toward two controlled twenty-second holds per direction',
      'Keep effort moderate rather than adding heavy resistance',
    ],
    postureNotes:
      'Optional only when completely symptom-free, no more than twice weekly. Stop for pain, dizziness, weakness, numbness, or radiating symptoms.',
    postureFocus: true,
  }),
]

const baseExerciseLibrary: LibraryExercise[] = [
  // ---------------------------------------------------------------- Chest
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Shoulders'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Shoulder blades back and down, press without bouncing.',
    instructions: [
      'Set shoulder blades back and down on the bench.',
      'Grip slightly wider than shoulder-width.',
      'Plant your feet and keep a stable ribcage.',
      'Lower the bar to mid-chest under control.',
      'Press up without bouncing or over-arching.',
    ],
    formTips: [
      'Ribs down between reps',
      'Keep wrists stacked over elbows',
      'Feet planted, glutes lightly squeezed',
      'Neutral spine, small natural arch only',
      'Stop 1-2 reps before form breaks',
    ],
    commonMistakes: [
      'Bouncing the bar off the chest',
      'Flaring elbows to 90 degrees',
      'Over-arching the lower back',
      'Lifting hips off the bench',
      'Half reps that never reach the chest',
    ],
    progression: [
      'Push-up',
      'Dumbbell bench press',
      'Barbell bench press',
      'Heavier barbell bench press',
    ],
    regression: ['Incline push-up', 'Push-up', 'Dumbbell floor press'],
    postureNotes: archSafety,
    demoLinks: demos('barbell bench press'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'weighted-push-up',
    name: 'Weighted Push-up',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Shoulders', 'Core'],
    equipment: ['Backpack', 'Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Body in one straight line, do not let the lower back sag.',
    instructions: [
      'Put the backpack on securely so it does not slide.',
      'Place hands slightly wider than shoulder-width.',
      'Keep the body straight from head to heels.',
      'Lower the chest under control.',
      'Push up without letting the lower back sag.',
    ],
    formTips: [
      'Ribs down',
      'Abs tight',
      'Glutes slightly squeezed',
      'Do not over-arch lower back',
      'Stop 1-2 reps before form breaks',
    ],
    commonMistakes: [
      'Lower back sagging',
      'Half reps',
      'Neck reaching forward',
      'Backpack sliding',
      'Elbows flaring too much',
    ],
    progression: [
      'Normal push-up',
      'Slow push-up',
      'Weighted push-up',
      'Feet-elevated weighted push-up',
    ],
    regression: ['Incline push-up', 'Normal push-up', 'Knee push-up'],
    postureNotes: `For arched back, keep ribs down and glutes slightly squeezed. ${archSafety}`,
    demoLinks: demos('weighted push up'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'feet-elevated-push-up',
    name: 'Feet-elevated Push-up',
    category: 'Chest',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps', 'Core'],
    equipment: ['Bodyweight', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Feet up shifts load to the upper chest — keep hips in line.',
    instructions: [
      'Place your feet on a bench or sturdy surface.',
      'Set hands slightly wider than shoulders.',
      'Brace the core so hips stay in line with shoulders.',
      'Lower the chest toward the floor under control.',
      'Press back up without dropping the hips.',
    ],
    formTips: [
      'Ribs down',
      'Abs tight',
      'Do not let hips sag or pike',
      'Neutral spine head to heels',
      'Control the lowering',
    ],
    commonMistakes: [
      'Hips sagging toward the floor',
      'Piking the hips up',
      'Partial range of motion',
      'Head dropping forward',
      'Flaring elbows too wide',
    ],
    progression: [
      'Push-up',
      'Feet-elevated push-up',
      'Feet-elevated weighted push-up',
      'Deficit feet-elevated push-up',
    ],
    regression: ['Push-up', 'Incline push-up', 'Knee push-up'],
    postureNotes: archSafety,
    demoLinks: demos('feet elevated decline push up'),
    relatedWorkoutDays: [4],
  },
  {
    id: 'dips',
    name: 'Dips',
    category: 'Chest',
    primaryMuscles: ['Chest', 'Triceps'],
    secondaryMuscles: ['Front Shoulders'],
    equipment: ['Dips', 'Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Lean slightly forward for chest, keep shoulders down.',
    instructions: [
      'Grip the dip bars and press to a tall lockout.',
      'Lean the torso slightly forward for more chest.',
      'Lower under control until the upper arms are near parallel.',
      'Keep shoulders pulled away from the ears.',
      'Press through the palms back to lockout.',
    ],
    formTips: [
      'Shoulders down, away from ears',
      'Lean forward for chest emphasis',
      'Ribs down, abs tight',
      'Control the bottom position',
      'Stop before shoulder pain',
    ],
    commonMistakes: [
      'Dropping too deep and straining the shoulders',
      'Shrugging the shoulders up',
      'Bouncing out of the bottom',
      'Flaring elbows aggressively',
      'Swinging the legs for momentum',
    ],
    progression: [
      'Bench dip',
      'Assisted dip',
      'Bodyweight dip',
      'Weighted dip (backpack)',
    ],
    regression: ['Bench dip', 'Band-assisted dip', 'Negative-only dip'],
    postureNotes: archSafety,
    demoLinks: demos('chest dips'),
    relatedWorkoutDays: [1, 4],
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Modest incline, elbows slightly tucked, press up and in.',
    instructions: [
      'Set the bench to a modest incline (about 30 degrees).',
      'Sit back with shoulder blades set down and back.',
      'Start with dumbbells at the upper chest.',
      'Lower evenly with elbows slightly tucked.',
      'Press up and slightly in without clashing the bells.',
    ],
    formTips: [
      'Keep upper chest active',
      'Elbows slightly tucked, not flared',
      'Ribs down between reps',
      'Control the lowering',
      'Full range without shoulder strain',
    ],
    commonMistakes: [
      'Incline set far too steep (turns into shoulders)',
      'Elbows flaring straight out',
      'Bouncing at the bottom',
      'Over-arching to move heavier bells',
      'Short, choppy reps',
    ],
    progression: [
      'Incline push-up',
      'Incline dumbbell press',
      'Heavier incline dumbbell press',
      'Incline dumbbell press with pause',
    ],
    regression: ['Incline push-up', 'Flat dumbbell press', 'Machine press'],
    postureNotes: archSafety,
    demoLinks: demos('incline dumbbell press'),
    relatedWorkoutDays: [1, 4],
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Shoulders'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Small fixed elbow bend, open slowly, hug the chest together.',
    instructions: [
      'Lie on a flat bench holding light dumbbells above the chest.',
      'Set a small, fixed bend in the elbows.',
      'Open the arms in a wide arc, lowering slowly.',
      'Stop before the shoulders feel over-stretched.',
      'Squeeze the chest to bring the dumbbells back together.',
    ],
    formTips: [
      'Use a light, controlled load',
      'Keep the elbow bend fixed',
      'Do not overstretch the shoulders',
      'Abs tight, ribs down',
      'Squeeze the chest at the top',
    ],
    commonMistakes: [
      'Going too heavy and turning it into a press',
      'Straightening then re-bending the elbows',
      'Dropping too deep and stressing the shoulder',
      'Arching the lower back off the bench',
      'Rushing the reps',
    ],
    progression: [
      'Floor dumbbell fly',
      'Flat dumbbell fly',
      'Incline dumbbell fly',
      'Dumbbell fly with slow eccentric',
    ],
    regression: ['Floor dumbbell fly', 'Cable/band fly', 'Squeeze press'],
    postureNotes: archSafety,
    demoLinks: demos('dumbbell chest fly'),
    relatedWorkoutDays: [4],
  },
  {
    id: 'dumbbell-squeeze-press',
    name: 'Dumbbell Squeeze Press',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Shoulders'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    formCue: 'Press the dumbbells hard together the whole set.',
    instructions: [
      'Lie on a flat bench holding two dumbbells together over the chest.',
      'Press the dumbbells firmly into each other.',
      'Keep that inward pressure and lower to the chest.',
      'Feel the inner chest working throughout.',
      'Press back up while still squeezing the bells together.',
    ],
    formTips: [
      'Constant inward squeeze',
      'Elbows travel close to the body',
      'Ribs down, abs tight',
      'Control the lowering',
      'Keep shoulders set back',
    ],
    commonMistakes: [
      'Letting the dumbbells drift apart',
      'Flaring the elbows',
      'Using momentum at the bottom',
      'Arching the lower back',
      'Going too heavy to hold the squeeze',
    ],
    progression: [
      'Squeeze press',
      'Heavier squeeze press',
      'Incline squeeze press',
      'Squeeze press with pause',
    ],
    regression: ['Floor squeeze press', 'Push-up', 'Machine press'],
    postureNotes: archSafety,
    demoLinks: demos('dumbbell squeeze press'),
    relatedWorkoutDays: [4],
  },
  {
    id: 'diamond-push-up',
    name: 'Diamond Push-up',
    category: 'Chest',
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Front Shoulders', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Hands form a diamond, elbows stay close to the body.',
    instructions: [
      'Place the hands close so the index fingers and thumbs form a diamond.',
      'Set the body in one straight line.',
      'Keep the elbows tucked close to the ribs.',
      'Lower the chest toward the hands under control.',
      'Press back up without letting the hips sag.',
    ],
    formTips: [
      'Elbows close to the body',
      'Ribs down, abs tight',
      'Neutral spine head to heels',
      'Control the lowering',
      'Stop 1-2 reps before form breaks',
    ],
    commonMistakes: [
      'Hips sagging',
      'Elbows flaring wide',
      'Partial range of motion',
      'Head dropping forward',
      'Wrist strain from a rushed setup',
    ],
    progression: [
      'Close-grip knee push-up',
      'Diamond push-up',
      'Feet-elevated diamond push-up',
      'Weighted diamond push-up',
    ],
    regression: ['Incline diamond push-up', 'Knee diamond push-up', 'Push-up'],
    postureNotes: archSafety,
    demoLinks: demos('diamond push up'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'paused-barbell-bench-press',
    name: 'Paused Barbell Bench Press',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Shoulders'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    formCue:
      'Pause softly on the chest, stay tight, then press without bouncing.',
    instructions: [
      'Plant the feet and set the shoulder blades back and down.',
      'Unrack with the wrists stacked over the elbows.',
      'Lower the bar under control to the lower chest.',
      'Pause motionless without relaxing into the chest.',
      'Press up while keeping the hips on the bench.',
    ],
    formTips: [
      'Stay braced during the pause',
      'Keep wrists stacked over elbows',
      'Touch the chest softly',
      'Keep feet and hips planted',
      'Use a consistent touch point',
    ],
    commonMistakes: [
      'Bouncing instead of pausing',
      'Relaxing the upper back at the chest',
      'Letting the wrists bend backward',
      'Lifting the hips to start the press',
      'Flaring the elbows abruptly',
    ],
    progression: [
      'Barbell bench press',
      'Paused barbell bench press',
      'Longer paused bench press',
      'Heavier paused bench press',
    ],
    regression: ['Dumbbell floor press', 'Barbell bench press', 'Push-up'],
    postureNotes: `Keep the ribcage controlled and use only a small natural bench arch. ${archSafety}`,
    demoLinks: demos('paused barbell bench press'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'one-arm-dumbbell-floor-press',
    name: 'One-Arm Dumbbell Floor Press',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Shoulders', 'Core'],
    equipment: ['Dumbbells', 'Mat'],
    difficulty: 'Intermediate',
    formCue: 'Brace against rotation and press with the wrist over the elbow.',
    instructions: [
      'Lie square on the floor with the knees bent and feet planted.',
      'Hold one dumbbell over the shoulder and brace the abdomen.',
      'Lower until the upper arm touches the floor softly.',
      'Pause without letting the torso rotate.',
      'Press the dumbbell up with the wrist stacked over the elbow.',
    ],
    formTips: [
      'Keep both shoulders grounded',
      'Brace before each repetition',
      'Touch the upper arm down softly',
      'Keep the forearm vertical',
      'Press without twisting',
    ],
    commonMistakes: [
      'Rolling toward the working side',
      'Crashing the upper arm into the floor',
      'Letting the wrist fold backward',
      'Flaring the ribs to finish the press',
      'Using a range the shoulder cannot control',
    ],
    progression: [
      'Two-arm dumbbell floor press',
      'One-arm dumbbell floor press',
      'One-arm floor press with pause',
      'Heavier one-arm floor press',
    ],
    regression: ['Two-arm dumbbell floor press', 'Push-up', 'Incline push-up'],
    postureNotes:
      'Keep the ribs down and pelvis level so the single-sided load does not rotate or arch the torso.',
    demoLinks: demos('one arm dumbbell floor press'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'close-grip-push-up',
    name: 'Close-Grip Push-Up',
    category: 'Chest',
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Front Shoulders', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Intermediate',
    formCue:
      'Hands just inside shoulder width, elbows track close to the ribs.',
    instructions: [
      'Place the hands just inside shoulder width.',
      'Brace into a straight line from head to heels.',
      'Lower the chest while the elbows track close to the ribs.',
      'Reach a comfortable full range without rolling the shoulders forward.',
      'Press the floor away while keeping the hips level.',
    ],
    formTips: [
      'Keep elbows near the ribs',
      'Use a firm whole-hand contact',
      'Keep ribs and hips aligned',
      'Move the chest and hips together',
      'Control the lowering',
    ],
    commonMistakes: [
      'Placing the hands so close that the wrists hurt',
      'Flaring the elbows wide',
      'Letting the hips sag',
      'Leading with the head',
      'Cutting the range short',
    ],
    progression: [
      'Incline close-grip push-up',
      'Close-grip push-up',
      'Feet-elevated close-grip push-up',
      'Weighted close-grip push-up',
    ],
    regression: [
      'Incline close-grip push-up',
      'Knee close-grip push-up',
      'Push-up',
    ],
    postureNotes: archSafety,
    demoLinks: demos('close grip push up'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'incline-barbell-press',
    name: 'Incline Barbell Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Front Shoulders', 'Triceps'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    formCue:
      'Use a modest incline and lower the bar to the upper chest under control.',
    instructions: [
      'Set the bench to a low or moderate incline.',
      'Plant the feet and set the shoulder blades back and down.',
      'Unrack with the wrists stacked over the elbows.',
      'Lower the bar toward the upper chest under control.',
      'Press up without lifting the hips or shrugging.',
    ],
    formTips: [
      'Use a modest bench angle',
      'Keep shoulder blades anchored',
      'Keep wrists over elbows',
      'Touch the upper chest gently',
      'Control the ribcage',
    ],
    commonMistakes: [
      'Setting the bench too steep',
      'Flaring the elbows straight out',
      'Bouncing the bar off the chest',
      'Lifting the hips from the bench',
      'Shrugging at lockout',
    ],
    progression: [
      'Incline dumbbell press',
      'Incline barbell press',
      'Paused incline barbell press',
      'Heavier incline barbell press',
    ],
    regression: [
      'Incline dumbbell press',
      'Flat barbell bench press',
      'Incline push-up',
    ],
    postureNotes: `Keep the ribs controlled and avoid turning the incline press into a large lower-back arch. ${archSafety}`,
    demoLinks: demos('incline barbell bench press'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'deficit-push-up',
    name: 'Deficit Push-Up',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Shoulders', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Intermediate',
    formCue:
      'Use stable supports and lower between the hands only as far as controlled.',
    instructions: [
      'Set two equal, non-rolling supports and confirm they cannot move.',
      'Grip the supports and brace into a straight body line.',
      'Lower the chest between the hands through a comfortable range.',
      'Pause before the shoulders roll forward or feel strained.',
      'Press evenly through both hands to the start.',
    ],
    formTips: [
      'Check support stability first',
      'Keep the body rigid',
      'Use only pain-free depth',
      'Press evenly through both hands',
      'Keep ribs down',
    ],
    commonMistakes: [
      'Using unstable or rolling supports',
      'Dropping deeper than the shoulders can control',
      'Letting the hips sag',
      'Flaring the elbows wide',
      'Pressing unevenly from side to side',
    ],
    progression: [
      'Push-up',
      'Shallow deficit push-up',
      'Full deficit push-up',
      'Weighted deficit push-up',
    ],
    regression: ['Push-up', 'Incline push-up', 'Knee push-up'],
    postureNotes: archSafety,
    demoLinks: demos('deficit push up on handles'),
    relatedWorkoutDays: [5],
  },

  // ----------------------------------------------------------------- Back
  {
    id: 'pull-up',
    name: 'Pull-up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Start shoulders down, pull elbows toward the ribs.',
    instructions: [
      'Hang from the bar with hands slightly wider than shoulders.',
      'Set the shoulders down and away from the ears.',
      'Pull the elbows down toward the ribs.',
      'Bring the chest toward the bar without swinging.',
      'Lower all the way under control.',
    ],
    formTips: [
      'Start with shoulders down',
      'Pull elbows toward ribs',
      'Keep chest tall',
      'Control the lowering',
      'Do not swing or kip',
    ],
    commonMistakes: [
      'Swinging or kipping for momentum',
      'Half reps that never reach full hang',
      'Shrugging the shoulders up',
      'Chin poking forward instead of chest up',
      'Rushing the lowering phase',
    ],
    progression: [
      'Inverted row',
      'Negative pull-up',
      'Pull-up',
      'Weighted pull-up',
    ],
    regression: ['Band-assisted pull-up', 'Negative pull-up', 'Inverted row'],
    postureNotes:
      'Keep the ribs down and core braced so you do not swing from the lower back. Neutral spine, no over-arching.',
    demoLinks: demos('pull up'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'weighted-pull-up',
    name: 'Weighted Pull-up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: ['Pull-up bar', 'Backpack'],
    difficulty: 'Advanced',
    formCue: 'Add load only once bodyweight pull-ups are clean and full range.',
    instructions: [
      'Wear a secure backpack or add a dip belt.',
      'Hang with shoulders set down and away from the ears.',
      'Pull the elbows down toward the ribs.',
      'Bring the chest toward the bar without swinging.',
      'Lower under full control to a complete hang.',
    ],
    formTips: [
      'Full range every rep',
      'Start with shoulders down',
      'Brace the core, no swing',
      'Control the lowering',
      'Add weight slowly over time',
    ],
    commonMistakes: [
      'Adding weight before clean bodyweight reps',
      'Cutting the range short',
      'Swinging the legs',
      'Backpack sliding around',
      'Dropping fast on the way down',
    ],
    progression: [
      'Pull-up',
      'Weighted pull-up (light backpack)',
      'Heavier weighted pull-up',
      'Weighted pull-up with pause',
    ],
    regression: ['Pull-up', 'Negative pull-up', 'Inverted row'],
    postureNotes:
      'Brace the core so the weight does not pull you into a swing. Ribs down, neutral spine.',
    demoLinks: demos('weighted pull up'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'chin-up',
    name: 'Chin-up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Biceps'],
    secondaryMuscles: ['Upper Back', 'Forearms', 'Core'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Underhand grip, drive the elbows down and back.',
    instructions: [
      'Grip the bar underhand at about shoulder-width.',
      'Set the shoulders down and away from the ears.',
      'Drive the elbows down and back.',
      'Pull the chest toward the bar without swinging.',
      'Lower all the way under control.',
    ],
    formTips: [
      'Underhand grip, wrists neutral',
      'Elbows down and back',
      'Chest tall, ribs down',
      'Control the lowering',
      'Do not swing',
    ],
    commonMistakes: [
      'Swinging for momentum',
      'Half reps',
      'Shrugging the shoulders',
      'Elbows drifting forward',
      'Dropping down fast',
    ],
    progression: [
      'Inverted row (underhand)',
      'Negative chin-up',
      'Chin-up',
      'Weighted chin-up',
    ],
    regression: ['Band-assisted chin-up', 'Negative chin-up', 'Inverted row'],
    postureNotes:
      'Keep ribs down and core braced so the movement comes from the back and arms, not a lower-back swing.',
    demoLinks: demos('chin up'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps', 'Lower Back'],
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    formCue: 'Hinge and brace first, pull the bar to the lower ribs.',
    instructions: [
      'Hinge at the hips with a flat back and soft knees.',
      'Brace the core before the first rep.',
      'Let the bar hang under the shoulders.',
      'Pull the bar toward the lower ribs.',
      'Lower under control without rounding the back.',
    ],
    formTips: [
      'Hinge and brace first',
      'Keep spine neutral',
      'Pull toward the lower ribs',
      'Do not jerk the weight',
      'Control the lowering',
    ],
    commonMistakes: [
      'Yanking the bar with the lower back',
      'Rounding the spine',
      'Standing up more upright each rep',
      'Using leg bounce for momentum',
      'Pulling to the chest instead of the belly',
    ],
    progression: [
      'Inverted row',
      'Dumbbell row',
      'Barbell row',
      'Heavier barbell row',
    ],
    regression: ['Chest-supported row', 'Inverted row', 'Dumbbell row'],
    postureNotes: `Brace hard and keep a neutral spine while hinged. ${archSafety}`,
    demoLinks: demos('barbell bent over row'),
    relatedWorkoutDays: [2, 5],
  },
  {
    id: 'one-arm-dumbbell-row',
    name: 'One-arm Dumbbell Row',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    formCue: 'Flat back, pull the dumbbell to the hip, no twisting.',
    instructions: [
      'Brace one hand and knee on a bench.',
      'Set a flat back roughly parallel to the floor.',
      'Let the dumbbell hang under the shoulder.',
      'Pull it toward the hip, leading with the elbow.',
      'Lower under control without twisting the torso.',
    ],
    formTips: [
      'Keep the back flat',
      'Pull the elbow toward the hip',
      'Do not rotate the torso',
      'Squeeze the shoulder blade',
      'Control the lowering',
    ],
    commonMistakes: [
      'Twisting the torso to lift heavier',
      'Rounding the back',
      'Yanking with the biceps only',
      'Short range of motion',
      'Shrugging the shoulder up',
    ],
    progression: [
      'Chest-supported row',
      'One-arm dumbbell row',
      'Heavier one-arm dumbbell row',
      'One-arm row with pause',
    ],
    regression: ['Chest-supported row', 'Inverted row', 'Band row'],
    postureNotes:
      'Keep a flat, neutral spine and avoid twisting the lower back to move the weight.',
    demoLinks: demos('one arm dumbbell row'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'inverted-row',
    name: 'Inverted Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps', 'Core'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    difficulty: 'Beginner',
    formCue: 'Body straight, pull the chest to the bar, squeeze the blades.',
    instructions: [
      'Set a bar at about hip height (or use a sturdy table).',
      'Hang underneath with the body straight.',
      'Brace the core and squeeze the glutes.',
      'Pull the chest toward the bar, squeezing the shoulder blades.',
      'Lower under control to a full arm extension.',
    ],
    formTips: [
      'Body in one straight line',
      'Ribs down, glutes squeezed',
      'Pull the chest to the bar',
      'Squeeze the shoulder blades',
      'Control the lowering',
    ],
    commonMistakes: [
      'Hips sagging toward the floor',
      'Partial range of motion',
      'Shrugging the shoulders',
      'Jerking the body up',
      'Head poking forward',
    ],
    progression: [
      'Incline inverted row (bar higher)',
      'Inverted row (bar lower)',
      'Feet-elevated inverted row',
      'Weighted inverted row',
    ],
    regression: [
      'Bar higher (more upright)',
      'Bent-knee inverted row',
      'Band row',
    ],
    postureNotes:
      'Keep ribs down and glutes squeezed so the body stays in one line instead of sagging at the hips.',
    demoLinks: demos('inverted row bodyweight'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'dumbbell-pullover',
    name: 'Dumbbell Pullover',
    category: 'Back',
    primaryMuscles: ['Lats', 'Chest'],
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Move through the shoulders, feel the lats stretch, ribs down.',
    instructions: [
      'Lie on a bench holding one dumbbell over the chest.',
      'Keep a slight, fixed bend in the elbows.',
      'Lower the dumbbell back behind the head.',
      'Feel the lats and chest stretch, ribs staying down.',
      'Pull the dumbbell back over the chest under control.',
    ],
    formTips: [
      'Keep ribs down (do not flare)',
      'Move through the shoulders',
      'Feel the lats stretch',
      'Fixed slight elbow bend',
      'Control the top and bottom',
    ],
    commonMistakes: [
      'Flaring the ribs and arching the back',
      'Bending and straightening the elbows',
      'Going too heavy and losing control',
      'Overreaching the shoulder at the bottom',
      'Rushing the reps',
    ],
    progression: [
      'Light dumbbell pullover',
      'Dumbbell pullover',
      'Heavier dumbbell pullover',
      'Pullover with slow eccentric',
    ],
    regression: [
      'Band pullover',
      'Light dumbbell pullover',
      'Lat prayer/stretch',
    ],
    postureNotes:
      'The most common fault is flaring the ribs and arching the lower back. Keep ribs down and abs tight through the stretch.',
    demoLinks: demos('dumbbell pullover'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'shoulder-width-pull-up',
    name: 'Shoulder-Width Pull-Up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Set the shoulders, then drive the elbows down without swinging.',
    instructions: [
      'Take an overhand grip at about shoulder width.',
      'Begin from a controlled hang and set the shoulders down.',
      'Drive the elbows toward the ribs to lift the chest.',
      'Reach the highest clean position without craning the neck.',
      'Lower under control to full elbow extension.',
    ],
    formTips: [
      'Engage the shoulders before pulling',
      'Drive elbows toward the ribs',
      'Keep the legs quiet',
      'Use a full controlled range',
      'Keep the neck neutral',
    ],
    commonMistakes: [
      'Swinging or kipping',
      'Starting with the shoulders shrugged',
      'Cutting off the bottom range',
      'Poking the chin toward the bar',
      'Dropping quickly from the top',
    ],
    progression: [
      'Assisted shoulder-width pull-up',
      'Shoulder-width pull-up',
      'Paused shoulder-width pull-up',
      'Weighted pull-up',
    ],
    regression: ['Band-assisted pull-up', 'Negative pull-up', 'Inverted row'],
    postureNotes:
      'Keep the ribs down and abdomen braced so the torso stays quiet instead of swinging or over-arching.',
    demoLinks: demos('shoulder width pull up'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'chest-supported-dumbbell-row',
    name: 'Chest-Supported Dumbbell Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    formCue:
      'Keep the chest supported and row the elbows toward the hips without shrugging.',
    instructions: [
      'Set an incline bench and lie face down with the chest supported.',
      'Let the dumbbells hang with the neck relaxed.',
      'Pull the elbows toward the hips without lifting the chest.',
      'Pause briefly as the dumbbells reach the torso.',
      'Lower until the shoulder blades spread under control.',
    ],
    formTips: [
      'Keep the chest on the bench',
      'Pull elbows toward the hips',
      'Keep shoulders away from the ears',
      'Pause at the top',
      'Reach fully at the bottom',
    ],
    commonMistakes: [
      'Lifting the chest to create momentum',
      'Shrugging while rowing',
      'Pulling only with the hands',
      'Cutting the bottom range short',
      'Using a load that prevents control',
    ],
    progression: [
      'Light chest-supported row',
      'Chest-supported dumbbell row',
      'Row with a top pause',
      'Heavier chest-supported row',
    ],
    regression: ['Light chest-supported row', 'Band row', 'Inverted row'],
    postureNotes:
      'Let the bench support a neutral torso and keep the neck long; do not lift or over-arch the chest to finish a rep.',
    demoLinks: demos('chest supported dumbbell row'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'weighted-chin-up',
    name: 'Weighted Chin-Up',
    category: 'Back',
    primaryMuscles: ['Lats', 'Biceps'],
    secondaryMuscles: ['Upper Back', 'Forearms', 'Core'],
    equipment: ['Pull-up bar', 'Backpack'],
    difficulty: 'Advanced',
    formCue:
      'Secure the load, pull the chest up, and lower to a controlled full hang.',
    instructions: [
      'Secure a light added load so it cannot swing.',
      'Take a shoulder-width underhand grip and begin from a controlled hang.',
      'Set the shoulders and drive the elbows down.',
      'Pull the chest toward the bar without kicking.',
      'Lower under control to full elbow extension.',
    ],
    formTips: [
      'Earn clean chin-ups before adding load',
      'Secure the load close to the body',
      'Keep wrists neutral',
      'Keep the legs quiet',
      'Control the full descent',
    ],
    commonMistakes: [
      'Adding load before bodyweight reps are solid',
      'Letting the load swing',
      'Kipping to clear the bar',
      'Stopping short of full extension',
      'Dropping into the shoulders',
    ],
    progression: [
      'Chin-up',
      'Light weighted chin-up',
      'Weighted chin-up with pause',
      'Heavier weighted chin-up',
    ],
    regression: ['Chin-up', 'Band-assisted chin-up', 'Negative chin-up'],
    postureNotes:
      'Brace the abdomen and keep the load still so it does not pull the ribs forward or swing the lower back.',
    demoLinks: demos('weighted chin up'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'pendlay-row',
    name: 'Pendlay Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Rear Shoulders', 'Biceps', 'Lower Back'],
    equipment: ['Barbell'],
    difficulty: 'Advanced',
    formCue:
      'Brace nearly parallel to the floor and pull each dead-stop rep without rising.',
    instructions: [
      'Set the bar over the mid-foot and hinge until the torso is nearly parallel.',
      'Brace with a neutral spine while the bar rests motionless.',
      'Pull the bar quickly toward the lower chest.',
      'Keep the torso angle fixed throughout the pull.',
      'Return the bar under control and reset before the next rep.',
    ],
    formTips: [
      'Reset the brace every rep',
      'Keep the bar over mid-foot',
      'Hold a fixed torso angle',
      'Pull toward the lower chest',
      'Start from a true dead stop',
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Raising the torso as the bar leaves the floor',
      'Bouncing the bar between reps',
      'Jerking before the brace is set',
      'Using a load that changes the movement',
    ],
    progression: [
      'Chest-supported row',
      'Barbell row',
      'Pendlay row',
      'Heavier Pendlay row',
    ],
    regression: ['Barbell row', 'Chest-supported row', 'One-arm dumbbell row'],
    postureNotes: `Maintain a rigid neutral spine and reset the brace from the floor before every repetition. ${archSafety}`,
    demoLinks: demos('Pendlay row'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'elbows-out-dumbbell-row',
    name: 'Elbows-Out Dumbbell Row',
    category: 'Back',
    primaryMuscles: ['Upper Back', 'Rear Shoulders'],
    secondaryMuscles: ['Traps', 'Biceps'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue:
      'Hold the hinge and row toward the upper ribs with the elbows wide.',
    instructions: [
      'Hinge at the hips with soft knees and a neutral spine.',
      'Brace the torso and let the dumbbells hang below the shoulders.',
      'Row toward the upper ribs with the elbows angled out.',
      'Pause as the shoulder blades draw together.',
      'Lower slowly without changing the torso angle.',
    ],
    formTips: [
      'Keep the torso still',
      'Aim toward the upper ribs',
      'Let the elbows travel wide',
      'Keep the neck relaxed',
      'Lower under control',
    ],
    commonMistakes: [
      'Standing up during each row',
      'Rounding the back',
      'Shrugging toward the ears',
      'Yanking the dumbbells with momentum',
      'Pulling toward the hips with tucked elbows',
    ],
    progression: [
      'Chest-supported elbows-out row',
      'Elbows-out dumbbell row',
      'Row with a top pause',
      'Heavier elbows-out row',
    ],
    regression: [
      'Chest-supported dumbbell row',
      'Rear delt raise',
      'Light dumbbell row',
    ],
    postureNotes: `Brace the hinge with a long neutral spine; do not round or over-arch to move the dumbbells. ${archSafety}`,
    demoLinks: demos('elbows out dumbbell row'),
    relatedWorkoutDays: [5],
  },

  // ------------------------------------------------------------ Shoulders
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders', 'Side Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Ribs down, press overhead without flaring the lower back.',
    instructions: [
      'Sit or stand with dumbbells at shoulder height.',
      'Brace the core and keep the ribs down.',
      'Press the dumbbells overhead under control.',
      'Stop just short of a hard lockout.',
      'Lower back to the shoulders without flaring the ribs.',
    ],
    formTips: [
      'Ribs down, abs braced',
      'Press overhead under control',
      'Do not flare the lower back',
      'Wrists stacked over elbows',
      'Stop with a good shoulder position',
    ],
    commonMistakes: [
      'Arching the lower back to press',
      'Flaring the ribs upward',
      'Pressing the dumbbells too far forward',
      'Half reps that never reach overhead',
      'Shrugging aggressively at the top',
    ],
    progression: [
      'Pike push-up',
      'Seated dumbbell shoulder press',
      'Standing dumbbell shoulder press',
      'Heavier standing press',
    ],
    regression: [
      'Seated press with back support',
      'Pike push-up',
      'Band press',
    ],
    postureNotes: `Overhead pressing tempts the ribs to flare. ${archSafety}`,
    demoLinks: demos('dumbbell shoulder press'),
    relatedWorkoutDays: [4],
  },
  {
    id: 'pike-push-up',
    name: 'Pike Push-up',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Hips high in an A-shape, lower the head between the hands.',
    instructions: [
      'Start in a push-up and walk the feet in to lift the hips high.',
      'Form an A-shape with hips as the high point.',
      'Lower the head toward the floor between the hands.',
      'Keep the elbows tracking back at about 45 degrees.',
      'Press back up to the tall pike position.',
    ],
    formTips: [
      'Hips high, weight over the hands',
      'Lower the crown of the head',
      'Elbows track back, not wide',
      'Brace the core',
      'Control the lowering',
    ],
    commonMistakes: [
      'Hips dropping so it becomes a push-up',
      'Flaring the elbows wide',
      'Head crashing to the floor',
      'Short range of motion',
      'Losing the brace and arching',
    ],
    progression: [
      'Incline pike push-up',
      'Pike push-up',
      'Feet-elevated pike push-up',
      'Wall handstand push-up',
    ],
    regression: [
      'Wall/box pike hold',
      'Incline pike push-up',
      'Dumbbell press',
    ],
    postureNotes:
      'Keep the core braced and ribs down as you invert so the load stays on the shoulders, not the lower back.',
    demoLinks: demos('pike push up'),
    relatedWorkoutDays: [4],
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    primaryMuscles: ['Side Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    formCue: 'Lead with the elbows, stop at shoulder height, no shrug.',
    instructions: [
      'Stand tall with light dumbbells at the sides.',
      'Keep a small bend in the elbows.',
      'Lead with the elbows to raise the arms out to the sides.',
      'Stop at about shoulder height.',
      'Lower slowly under control.',
    ],
    formTips: [
      'Lead with the elbows',
      'Light, controlled reps',
      'Stop at shoulder height',
      'Do not shrug the traps',
      'Keep the torso still',
    ],
    commonMistakes: [
      'Swinging the weights up with momentum',
      'Shrugging the shoulders',
      'Raising above shoulder height',
      'Using too much weight',
      'Leaning back to cheat the rep',
    ],
    progression: [
      'Light lateral raise',
      'Lateral raise',
      'Slow-tempo lateral raise',
      'Lateral raise with pause at top',
    ],
    regression: [
      'Seated lateral raise',
      'Leaning cable/band raise',
      'Partial raise',
    ],
    postureNotes:
      'Keep the torso still and ribs down; do not lean back or swing from the lower back to lift the weight.',
    demoLinks: demos('dumbbell lateral raise'),
    relatedWorkoutDays: [1, 4],
  },
  {
    id: 'rear-delt-raise',
    name: 'Rear Delt Raise',
    category: 'Shoulders',
    primaryMuscles: ['Rear Shoulders'],
    secondaryMuscles: ['Upper Back', 'Traps'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    formCue: 'Hinge forward, raise with the rear delts, neck relaxed.',
    instructions: [
      'Hinge forward at the hips with a flat back.',
      'Let light dumbbells hang under the shoulders.',
      'Keep a small fixed bend in the elbows.',
      'Raise the arms out to the sides using the rear delts.',
      'Lower slowly without swinging.',
    ],
    formTips: [
      'Hinge slightly forward',
      'Keep the neck relaxed',
      'Raise with the rear delts',
      'Light, controlled load',
      'Avoid swinging',
    ],
    commonMistakes: [
      'Using the biceps or traps instead of rear delts',
      'Swinging the weights up',
      'Rounding the back while hinged',
      'Going too heavy',
      'Jerking the neck forward',
    ],
    progression: [
      'Rear delt raise',
      'Chest-supported rear delt raise',
      'Slow-tempo rear delt raise',
      'Rear delt raise with pause',
    ],
    regression: ['Chest-supported raise', 'Band pull-apart', 'Partial raise'],
    postureNotes:
      'Keep a neutral, flat spine while hinged. Do not round or over-arch the lower back to move the weight.',
    demoLinks: demos('rear delt raise'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'lean-away-dumbbell-lateral-raise',
    name: 'Lean-Away Dumbbell Lateral Raise',
    category: 'Shoulders',
    primaryMuscles: ['Side Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Lean away as one rigid line and lead the raise with the elbow.',
    instructions: [
      'Hold a stable support with one hand and keep both feet planted.',
      'Lean away slightly while keeping the body in one straight line.',
      'Hold a light dumbbell at the outside thigh.',
      'Lead with the elbow and raise the arm near shoulder height.',
      'Lower slowly through the stretched bottom position.',
    ],
    formTips: [
      'Use a secure support',
      'Keep the lean fixed',
      'Lead with the elbow',
      'Keep the shoulder away from the ear',
      'Lower slowly',
    ],
    commonMistakes: [
      'Changing the body angle to swing the weight',
      'Shrugging at the top',
      'Leading with the hand',
      'Raising far above shoulder height',
      'Using a load that shortens the range',
    ],
    progression: [
      'Dumbbell lateral raise',
      'Lean-away lateral raise',
      'Lean-away raise with pause',
      'Heavier lean-away lateral raise',
    ],
    regression: [
      'Dumbbell lateral raise',
      'Seated lateral raise',
      'Partial lateral raise',
    ],
    postureNotes:
      'Keep the ribs stacked over the pelvis and lean as one unit; do not side-bend or arch to lift the dumbbell.',
    demoLinks: demos('lean away dumbbell lateral raise'),
    relatedWorkoutDays: [1],
  },
  {
    id: 'prone-y-raise',
    name: 'Prone Y-Raise',
    category: 'Shoulders',
    primaryMuscles: ['Lower Traps'],
    secondaryMuscles: ['Rear Shoulders', 'Upper Back'],
    equipment: ['Bodyweight', 'Dumbbells', 'Bench', 'Mat'],
    difficulty: 'Beginner',
    formCue:
      'Reach into a wide Y with thumbs up and lift from the shoulder blades.',
    instructions: [
      'Lie face down on an incline bench or mat.',
      'Reach the arms into a wide Y with the thumbs pointing up.',
      'Keep the forehead supported or the neck long.',
      'Lift the arms a small distance by moving the shoulder blades.',
      'Pause briefly, then lower without swinging.',
    ],
    formTips: [
      'Use bodyweight or very light dumbbells',
      'Keep thumbs pointing up',
      'Reach long through the arms',
      'Keep shoulders away from the ears',
      'Use a small controlled range',
    ],
    commonMistakes: [
      'Using weight that forces momentum',
      'Shrugging instead of using the lower traps',
      'Lifting the head to gain range',
      'Bending the elbows into a row',
      'Arching the lower back',
    ],
    progression: [
      'Prone Y hold',
      'Prone Y-raise',
      'Light dumbbell Y-raise',
      'Y-raise with a longer pause',
    ],
    regression: ['Prone Y hold', 'Wall slide', 'One arm at a time'],
    postureNotes:
      'Keep the neck long, ribs supported, and shoulders away from the ears while the lower traps guide the shoulder blades.',
    demoLinks: demos('prone Y raise lower trap'),
    relatedWorkoutDays: [3],
    postureFocus: true,
  },
  {
    id: 'one-arm-dumbbell-overhead-press',
    name: 'Standing One-Arm Dumbbell Overhead Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Shoulders', 'Side Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Brace before pressing and finish overhead without leaning away.',
    instructions: [
      'Stand with both feet planted and hold one dumbbell at shoulder height.',
      'Brace the abdomen and stack the wrist over the elbow.',
      'Press overhead while keeping the torso centered.',
      'Finish with the arm beside the ear and ribs controlled.',
      'Lower to the shoulder under control before changing sides.',
    ],
    formTips: [
      'Brace before every press',
      'Keep the wrist stacked',
      'Stay centered over both feet',
      'Keep ribs down',
      'Finish beside the ear',
    ],
    commonMistakes: [
      'Leaning away from the dumbbell',
      'Flaring the ribs to finish overhead',
      'Pressing forward instead of overhead',
      'Bending the wrist backward',
      'Rushing the lowering phase',
    ],
    progression: [
      'Seated one-arm dumbbell press',
      'Standing one-arm dumbbell press',
      'Press with a top pause',
      'Heavier one-arm dumbbell press',
    ],
    regression: [
      'Seated one-arm dumbbell press',
      'Two-arm dumbbell press',
      'Pike push-up',
    ],
    postureNotes: `Resist side-bending and keep the ribs stacked over the pelvis throughout the single-arm press. ${archSafety}`,
    demoLinks: demos('standing one arm dumbbell overhead press'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'rear-delt-dumbbell-row',
    name: 'Rear-Delt Dumbbell Row',
    category: 'Shoulders',
    primaryMuscles: ['Rear Shoulders'],
    secondaryMuscles: ['Upper Back', 'Traps', 'Biceps'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue:
      'Use a light load and row wide toward the upper ribs without shrugging.',
    instructions: [
      'Hinge forward with soft knees and a neutral spine.',
      'Let light dumbbells hang below the shoulders.',
      'Drive the elbows out and back toward the upper ribs.',
      'Pause briefly without shrugging the shoulders.',
      'Lower slowly until the rear shoulders lengthen.',
    ],
    formTips: [
      'Use a light controlled load',
      'Keep the elbows wide',
      'Pull toward the upper ribs',
      'Keep the neck relaxed',
      'Hold the torso still',
    ],
    commonMistakes: [
      'Using too much weight',
      'Tucking the elbows toward the hips',
      'Shrugging at the top',
      'Rounding the back',
      'Swinging the torso for momentum',
    ],
    progression: [
      'Rear delt raise',
      'Rear-delt dumbbell row',
      'Rear-delt row with pause',
      'Heavier rear-delt row',
    ],
    regression: [
      'Chest-supported rear-delt row',
      'Rear delt raise',
      'Band pull-apart',
    ],
    postureNotes:
      'Hold a neutral hip hinge and a long neck; do not round, over-arch, or shrug to complete the row.',
    demoLinks: demos('rear delt dumbbell row'),
    relatedWorkoutDays: [5],
  },

  // ----------------------------------------------------------------- Arms
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Barbell'],
    difficulty: 'Beginner',
    formCue: 'Elbows near the ribs, curl without leaning back.',
    instructions: [
      'Stand tall holding the barbell with an underhand grip.',
      'Keep the elbows tucked near the ribs.',
      'Curl the bar up by bending the elbows.',
      'Squeeze the biceps at the top.',
      'Lower slowly under control.',
    ],
    formTips: [
      'Keep elbows near the ribs',
      'Do not lean back',
      'Squeeze at the top',
      'Lower slowly',
      'Stop before the shoulders swing forward',
    ],
    commonMistakes: [
      'Swinging the torso to lift the bar',
      'Elbows drifting forward',
      'Using momentum instead of the biceps',
      'Partial range of motion',
      'Dropping the bar down fast',
    ],
    progression: [
      'Light barbell curl',
      'Barbell curl',
      'Heavier barbell curl',
      'Barbell curl with slow eccentric',
    ],
    regression: ['Dumbbell curl', 'Band curl', 'Seated curl'],
    postureNotes:
      'Brace the core and keep ribs down so you do not lean back or arch to swing the weight up.',
    demoLinks: demos('barbell curl'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    formCue: 'Elbows fixed at the sides, curl and squeeze, lower slowly.',
    instructions: [
      'Stand or sit holding dumbbells at the sides.',
      'Keep the elbows fixed near the ribs.',
      'Curl one or both dumbbells up.',
      'Squeeze the biceps at the top.',
      'Lower slowly under control.',
    ],
    formTips: [
      'Elbows fixed at the sides',
      'Do not swing the torso',
      'Squeeze at the top',
      'Control the lowering',
      'Keep wrists neutral',
    ],
    commonMistakes: [
      'Swinging the body for momentum',
      'Elbows drifting forward',
      'Partial reps',
      'Dropping the weight fast',
      'Shrugging at the top',
    ],
    progression: [
      'Light dumbbell curl',
      'Dumbbell curl',
      'Alternating dumbbell curl',
      'Slow-tempo dumbbell curl',
    ],
    regression: ['Seated dumbbell curl', 'Band curl', 'Partial curl'],
    postureNotes:
      'Keep ribs down and the torso still; do not lean back to help the curl.',
    demoLinks: demos('dumbbell biceps curl'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps', 'Forearms'],
    secondaryMuscles: ['Brachialis'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    formCue: 'Neutral (thumbs-up) grip, elbows close, no swing.',
    instructions: [
      'Hold dumbbells with a neutral (thumbs-up) grip.',
      'Keep the elbows close to the ribs.',
      'Curl the dumbbells up without rotating the wrists.',
      'Squeeze the forearms and biceps at the top.',
      'Lower slowly under control.',
    ],
    formTips: [
      'Keep elbows close',
      'Neutral grip throughout',
      'Do not swing',
      'Squeeze forearms and biceps',
      'Lower slowly',
    ],
    commonMistakes: [
      'Swinging the weights',
      'Elbows flaring out',
      'Partial range of motion',
      'Rotating the wrist mid-rep',
      'Dropping the weight fast',
    ],
    progression: [
      'Light hammer curl',
      'Hammer curl',
      'Heavier hammer curl',
      'Cross-body hammer curl',
    ],
    regression: ['Seated hammer curl', 'Band hammer curl', 'Partial curl'],
    postureNotes:
      'Keep the torso still and ribs down; avoid leaning back to move the weight.',
    demoLinks: demos('hammer curl'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'triceps-extension',
    name: 'Triceps Extension',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    formCue: 'Elbows stable and pointing up, only the forearms move.',
    instructions: [
      'Hold a dumbbell overhead with both hands (or one in each hand).',
      'Keep the elbows pointing up and close to the head.',
      'Lower the weight behind the head by bending the elbows.',
      'Keep the upper arms still.',
      'Press back up by straightening the elbows.',
    ],
    formTips: [
      'Keep elbows stable and high',
      'Only the forearms move',
      'Ribs down, do not flare',
      'Control the lowering',
      'Stop before elbow discomfort',
    ],
    commonMistakes: [
      'Elbows flaring out wide',
      'Upper arms swinging',
      'Arching the lower back overhead',
      'Partial range of motion',
      'Going too heavy and losing control',
    ],
    progression: [
      'Light overhead extension',
      'Overhead triceps extension',
      'Heavier overhead extension',
      'Single-arm overhead extension',
    ],
    regression: ['Band pushdown', 'Bench dip', 'Kickback'],
    postureNotes:
      'Overhead work tempts the ribs to flare and the back to arch. Keep ribs down and abs braced.',
    demoLinks: demos('overhead triceps extension'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Upper arms stay vertical, lower toward the forehead.',
    instructions: [
      'Lie on a bench holding dumbbells or a barbell over the chest.',
      'Keep the upper arms vertical and still.',
      'Bend the elbows to lower the weight toward the forehead.',
      'Stop just above the forehead.',
      'Press back up by straightening the elbows.',
    ],
    formTips: [
      'Upper arms stay vertical',
      'Only the forearms move',
      'Control the lowering',
      'Ribs down on the bench',
      'Stop before elbow pain',
    ],
    commonMistakes: [
      'Letting the elbows drift back',
      'Flaring the elbows wide',
      'Bouncing at the bottom',
      'Arching the back off the bench',
      'Going too heavy',
    ],
    progression: [
      'Dumbbell skull crusher',
      'Barbell skull crusher',
      'Heavier skull crusher',
      'Skull crusher with slow eccentric',
    ],
    regression: ['Band pushdown', 'Close-grip push-up', 'Bench dip'],
    postureNotes:
      'Keep the ribs down against the bench and avoid arching the lower back to press the weight.',
    demoLinks: demos('skull crusher triceps'),
    relatedWorkoutDays: [5],
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue:
      'Keep the upper arms behind the torso and curl without moving the elbows forward.',
    instructions: [
      'Set an incline bench and sit with the upper back supported.',
      'Let the arms hang behind the torso with palms facing forward.',
      'Curl the dumbbells while keeping the upper arms still.',
      'Squeeze at the top without rolling the shoulders forward.',
      'Lower slowly to a comfortable full stretch.',
    ],
    formTips: [
      'Keep the back supported',
      'Let the arms hang naturally',
      'Keep upper arms still',
      'Keep wrists straight',
      'Lower slowly to full length',
    ],
    commonMistakes: [
      'Moving the elbows forward during the curl',
      'Lifting the shoulders from the bench',
      'Swinging out of the bottom',
      'Bending the wrists',
      'Lowering beyond a comfortable shoulder position',
    ],
    progression: [
      'Seated dumbbell curl',
      'Incline dumbbell curl',
      'Incline curl with slow lowering',
      'Heavier incline dumbbell curl',
    ],
    regression: [
      'Seated dumbbell curl',
      'Standing dumbbell curl',
      'Alternating curl',
    ],
    postureNotes:
      'Keep the upper back against the bench and ribs controlled; do not arch or roll the shoulders forward to finish the curl.',
    demoLinks: demos('incline dumbbell curl'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'overhead-dumbbell-triceps-extension',
    name: 'Overhead Dumbbell Triceps Extension',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Shoulders', 'Core'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    formCue:
      'Keep the ribs down and upper arms still while the elbows bend and straighten.',
    instructions: [
      'Hold one dumbbell securely with both hands overhead.',
      'Brace the abdomen and point the elbows forward.',
      'Lower the dumbbell behind the head by bending the elbows.',
      'Keep the upper arms close to the head and still.',
      'Straighten the elbows without flaring the ribs.',
    ],
    formTips: [
      'Secure the dumbbell before starting',
      'Keep elbows near the head',
      'Keep upper arms still',
      'Keep ribs down',
      'Use a controlled stretch',
    ],
    commonMistakes: [
      'Flaring the elbows wide',
      'Arching the lower back',
      'Moving the upper arms with each rep',
      'Lowering too far for the shoulders',
      'Using a loose grip on the dumbbell',
    ],
    progression: [
      'Light overhead dumbbell extension',
      'Overhead dumbbell triceps extension',
      'Extension with slow lowering',
      'Heavier overhead extension',
    ],
    regression: [
      'Single light dumbbell extension',
      'Dumbbell kickback',
      'Close-grip push-up',
    ],
    postureNotes: `Overhead extensions can flare the ribs and arch the back. ${archSafety}`,
    demoLinks: demos('overhead dumbbell triceps extension'),
    relatedWorkoutDays: [3],
  },

  // ----------------------------------------------------------------- Legs
  {
    id: 'squat',
    name: 'Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Lower Back'],
    equipment: ['Barbell', 'Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Brace every rep, knees track the toes, stay mid-foot.',
    instructions: [
      'Set the feet about shoulder-width, toes slightly out.',
      'Brace the core before descending.',
      'Sit down and back, keeping the knees tracking the toes.',
      'Descend to a depth you can control with a neutral spine.',
      'Drive up through mid-foot to standing.',
    ],
    formTips: [
      'Brace before every rep',
      'Knees track over the toes',
      'Stay balanced mid-foot',
      'Control the depth',
      'Do not collapse forward',
    ],
    commonMistakes: [
      'Knees caving inward',
      'Heels lifting off the floor',
      'Rounding the lower back at the bottom',
      'Collapsing the chest forward',
      'Bouncing out of the bottom',
    ],
    progression: [
      'Bodyweight squat',
      'Goblet squat',
      'Dumbbell/barbell squat',
      'Heavier barbell squat',
    ],
    regression: ['Box squat', 'Bodyweight squat', 'Assisted squat'],
    postureNotes: `Brace and keep a neutral spine top to bottom. ${archSafety}`,
    demoLinks: demos('barbell squat'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'Legs',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core', 'Forearms'],
    equipment: ['Barbell', 'Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Hinge at the hips, soft knees, feel the hamstrings stretch.',
    instructions: [
      'Hold the bar or dumbbells at the thighs, feet hip-width.',
      'Keep the lats tight and knees softly bent.',
      'Push the hips back, lowering the weight down the legs.',
      'Feel the hamstrings stretch with a flat back.',
      'Stand tall by driving the hips forward, without over-arching.',
    ],
    formTips: [
      'Hinge at the hips',
      'Keep the lats tight',
      'Soft knees, not locked',
      'Feel the hamstrings stretch',
      'Stand tall without over-arching',
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Turning it into a squat',
      'Bar drifting away from the legs',
      'Over-arching at the top',
      'Going too low past the hamstring stretch',
    ],
    progression: [
      'Dumbbell RDL',
      'Barbell RDL',
      'Heavier barbell RDL',
      'Single-leg RDL',
    ],
    regression: ['Hip hinge with dowel', 'Light dumbbell RDL', 'Glute bridge'],
    postureNotes: `Keep a flat, neutral spine through the hinge and avoid snapping into an arch at lockout. ${archSafety}`,
    demoLinks: demos('romanian deadlift'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Stable split stance, drop straight down, drive the front foot.',
    instructions: [
      'Rest the back foot on a bench behind you.',
      'Set a stable split stance with the front foot forward.',
      'Lower straight down under control.',
      'Keep the torso tall and the front knee tracking the toes.',
      'Drive up through the front foot.',
    ],
    formTips: [
      'Take a stable split stance',
      'Control the drop',
      'Drive through the front foot',
      'Keep the torso tall',
      'Do both sides evenly',
    ],
    commonMistakes: [
      'Front knee caving inward',
      'Leaning too far forward',
      'Pushing off the back foot',
      'Stance too short (knee over toes)',
      'Losing balance and rushing reps',
    ],
    progression: [
      'Bodyweight split squat',
      'Bulgarian split squat',
      'Dumbbell Bulgarian split squat',
      'Heavier Bulgarian split squat',
    ],
    regression: ['Static split squat', 'Assisted split squat', 'Reverse lunge'],
    postureNotes:
      'Keep the torso tall with ribs down and core braced; avoid arching the lower back as you stand.',
    demoLinks: demos('bulgarian split squat'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'Legs',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Squeeze the glutes to lift, ribs down, no lower-back arch.',
    instructions: [
      'Lie on your back with the knees bent and feet flat.',
      'Press the lower back gently toward the floor.',
      'Squeeze the glutes to lift the hips.',
      'Stop when the body is straight from knees to shoulders.',
      'Lower under control without arching the back.',
    ],
    formTips: [
      'Squeeze the glutes to lift',
      'Ribs down, abs tight',
      'Do not arch the lower back',
      'Drive through the heels',
      'Hold the top briefly',
    ],
    commonMistakes: [
      'Over-arching and using the lower back',
      'Pushing the hips too high',
      'Feet too far forward or back',
      'Rushing the reps',
      'Not squeezing the glutes at the top',
    ],
    progression: [
      'Glute bridge',
      'Single-leg glute bridge',
      'Weighted glute bridge',
      'Hip thrust',
    ],
    regression: [
      'Short-range bridge',
      'Glute squeeze (no lift)',
      'Wall bridge',
    ],
    postureNotes:
      'A great arched-back drill: keep ribs down and lift with the glutes, not the lower back. Do not hyperextend at the top.',
    demoLinks: demos('glute bridge'),
    relatedWorkoutDays: [3, 6],
    postureFocus: true,
  },
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    category: 'Legs',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Barbell', 'Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Upper back on the bench, tuck the ribs, thrust to a flat hip.',
    instructions: [
      'Rest the upper back on a bench, feet flat on the floor.',
      'Place a weight across the hips (padded).',
      'Tuck the ribs down and brace the core.',
      'Drive the hips up by squeezing the glutes.',
      'Stop level (no over-arch), then lower under control.',
    ],
    formTips: [
      'Tuck the ribs, chin slightly down',
      'Drive through the heels',
      'Squeeze the glutes at the top',
      'Stop at a flat hip, do not hyperextend',
      'Control the lowering',
    ],
    commonMistakes: [
      'Over-arching the lower back at the top',
      'Pushing through the toes',
      'Ribs flaring up',
      'Neck cranking back',
      'Partial range of motion',
    ],
    progression: [
      'Glute bridge',
      'Bodyweight hip thrust',
      'Weighted hip thrust',
      'Heavier hip thrust',
    ],
    regression: ['Glute bridge', 'Feet-elevated bridge', 'Single-leg bridge'],
    postureNotes:
      'Finish with a flat, level hip. Keep the ribs down and glutes squeezed; do not hyperextend the lower back at lockout.',
    demoLinks: demos('barbell hip thrust'),
    relatedWorkoutDays: [3],
    postureFocus: true,
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    secondaryMuscles: [],
    equipment: ['Bodyweight', 'Dumbbells'],
    difficulty: 'Beginner',
    formCue: 'Full range, pause at the top, lower slowly, no bounce.',
    instructions: [
      'Stand tall, optionally with the balls of the feet on a step.',
      'Press up onto the toes through a full range.',
      'Pause and squeeze the calves at the top.',
      'Lower slowly to a full stretch.',
      'Keep the ankles controlled, no bouncing.',
    ],
    formTips: [
      'Use full range',
      'Pause at the top',
      'Lower slowly',
      'Keep the ankles controlled',
      'Do not bounce',
    ],
    commonMistakes: [
      'Bouncing at the bottom',
      'Partial range of motion',
      'Rushing the reps',
      'Rolling onto the outside of the foot',
      'No pause or squeeze at the top',
    ],
    progression: [
      'Two-leg calf raise',
      'Weighted calf raise',
      'Single-leg calf raise',
      'Deficit single-leg calf raise',
    ],
    regression: [
      'Flat-floor calf raise',
      'Supported calf raise',
      'Seated calf raise',
    ],
    postureNotes:
      'Stand tall with ribs down and a neutral spine; keep the core lightly braced for balance.',
    demoLinks: demos('calf raise'),
    relatedWorkoutDays: [3],
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Core', 'Upper Back', 'Adductors'],
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    formCue: 'Elbows high, brace hard, and drive through the whole foot.',
    instructions: [
      'Rest the bar across the front shoulders and set the feet about shoulder-width.',
      'Lift the elbows, brace the core, and keep the whole foot planted.',
      'Descend between the hips with the knees tracking the toes.',
      'Squat only as deep as you can keep the torso and pelvis controlled.',
      'Push the floor away to stand while keeping the elbows high.',
    ],
    formTips: [
      'Keep the elbows high',
      'Brace before descending',
      'Track the knees with the toes',
      'Stay balanced over the whole foot',
      'Keep the torso tall',
    ],
    commonMistakes: [
      'Letting the elbows drop',
      'Knees collapsing inward',
      'Heels lifting from the floor',
      'Losing the brace at the bottom',
      'Loading more weight than the rack position allows',
    ],
    progression: [
      'Goblet squat',
      'Front squat',
      'Paused front squat',
      'Heavier front squat',
    ],
    regression: [
      'Bodyweight squat',
      'Heels-elevated goblet squat',
      'Light goblet squat',
    ],
    postureNotes:
      'Keep the ribs stacked over the pelvis and the upper back tall. Brace instead of leaning back or rounding to hold the bar.',
    demoLinks: demos('barbell front squat'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'single-leg-romanian-deadlift',
    name: 'Single-Leg Romanian Deadlift',
    category: 'Legs',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Core', 'Lower Back', 'Adductors'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue:
      'Reach the free leg back, keep the hips square, and hinge as one unit.',
    instructions: [
      'Stand on one leg with a soft knee and hold the dumbbells by the thighs.',
      'Brace, then reach the free leg back as the torso hinges forward.',
      'Keep both hips square and the dumbbells close to the standing leg.',
      'Stop when the hamstring is loaded or the pelvis starts to rotate.',
      'Drive the standing foot down and squeeze the glute to return upright.',
    ],
    formTips: [
      'Keep a soft bend in the standing knee',
      'Reach the free leg straight back',
      'Keep both hips square',
      'Hold the dumbbells close to the leg',
      'Return without twisting',
    ],
    commonMistakes: [
      'Opening the free-leg hip outward',
      'Rounding the lower back',
      'Squatting instead of hinging',
      'Reaching the weights toward the floor',
      'Rushing and losing balance',
    ],
    progression: [
      'Supported single-leg hip hinge',
      'Single-leg Romanian deadlift',
      'Heavier dumbbell single-leg Romanian deadlift',
      'Paused single-leg Romanian deadlift',
    ],
    regression: [
      'Romanian deadlift',
      'Kickstand Romanian deadlift',
      'Supported bodyweight single-leg hinge',
    ],
    postureNotes:
      'Move the torso and free leg together around the hip. Keep the spine long and the pelvis level rather than twisting or reaching lower.',
    demoLinks: demos('dumbbell single leg Romanian deadlift'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'dumbbell-step-up',
    name: 'Dumbbell Step-Up',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue: 'Plant the whole foot and let the elevated leg do the work.',
    instructions: [
      'Stand close to a stable step or bench with a dumbbell in each hand.',
      'Place the entire working foot on the elevated surface.',
      'Drive through that foot to rise without pushing off the floor leg.',
      'Finish tall with the hips level and the working knee controlled.',
      'Lower slowly to the floor before the next repetition.',
    ],
    formTips: [
      'Place the whole foot on the step',
      'Drive through the elevated leg',
      'Keep the knee aligned with the toes',
      'Keep the hips level',
      'Lower under control',
    ],
    commonMistakes: [
      'Pushing hard from the trailing foot',
      'Using a surface that is too high or unstable',
      'Letting the working knee cave inward',
      'Only placing the toes on the step',
      'Dropping quickly back to the floor',
    ],
    progression: [
      'Bodyweight step-up',
      'Dumbbell step-up',
      'Heavier dumbbell step-up',
      'Step-up with a controlled knee drive',
    ],
    regression: ['Low step-up', 'Supported step-up', 'Reverse lunge'],
    postureNotes:
      'Stay tall with the ribs stacked over the pelvis. Choose a height that lets you keep the knee aligned and the pelvis level.',
    demoLinks: demos('dumbbell step up'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'sliding-hamstring-curl',
    name: 'Sliding Hamstring Curl',
    category: 'Legs',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Glutes', 'Core', 'Calves'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Intermediate',
    formCue: 'Keep the hips lifted and pelvis level as the heels slide.',
    instructions: [
      'Lie on your back with the heels on sliders or towels over a smooth floor.',
      'Brace the core and lift the hips into a low bridge.',
      'Slowly slide the heels away while keeping the pelvis level.',
      'Stop before the hips drop or the lower back arches.',
      'Pull the heels back with the hamstrings, then reset under control.',
    ],
    formTips: [
      'Lift the hips before sliding',
      'Keep the pelvis level',
      'Pull with the hamstrings',
      'Control both directions',
      'Shorten the range before the back arches',
    ],
    commonMistakes: [
      'Letting the hips sag',
      'Arching the lower back',
      'Moving too quickly on the slide out',
      'Pulling unevenly through the feet',
      'Using more range than the hamstrings can control',
    ],
    progression: [
      'Short-range sliding hamstring curl',
      'Full sliding hamstring curl',
      'Slow-eccentric sliding hamstring curl',
      'Single-leg sliding hamstring curl',
    ],
    regression: ['Glute bridge', 'Heel walkout', 'Eccentric-only sliding curl'],
    postureNotes:
      'Keep the ribs down and pelvis level so the hamstrings and glutes move the legs without the lower back taking over.',
    demoLinks: demos('sliding hamstring curl towels'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'seated-dumbbell-calf-raise',
    name: 'Seated Dumbbell Calf Raise',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    secondaryMuscles: [],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    formCue: 'Use full ankle range, pause at the top, and lower slowly.',
    instructions: [
      'Sit tall on a bench with the knees bent and feet about hip-width.',
      'Place the balls of the feet on a stable edge and secure dumbbells on the thighs.',
      'Lower the heels slowly into a comfortable calf stretch.',
      'Press through the balls of the feet to raise the heels fully.',
      'Pause at the top, then lower without bouncing.',
    ],
    formTips: [
      'Keep the dumbbells secure on the thighs',
      'Use a controlled calf stretch',
      'Rise through full range',
      'Pause at the top',
      'Keep pressure even across the forefoot',
    ],
    commonMistakes: [
      'Bouncing out of the bottom',
      'Using partial range of motion',
      'Rolling the ankles outward',
      'Letting the dumbbells slide toward the knees',
      'Rushing the lowering phase',
    ],
    progression: [
      'Bodyweight seated calf raise',
      'Seated dumbbell calf raise',
      'Heavier seated dumbbell calf raise',
      'Single-leg seated dumbbell calf raise',
    ],
    regression: [
      'Flat-floor seated calf raise',
      'Bodyweight calf raise',
      'Supported calf raise',
    ],
    postureNotes:
      'Sit tall with the ribs over the pelvis and keep the feet and knees aligned while the ankles move through their full range.',
    demoLinks: demos('seated dumbbell calf raise'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'wall-tibialis-raise',
    name: 'Wall Tibialis Raise',
    category: 'Legs',
    primaryMuscles: ['Tibialis Anterior'],
    secondaryMuscles: ['Ankle Dorsiflexors'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue: 'Keep the heels planted and pull the toes toward the shins.',
    instructions: [
      'Lean the upper back against a wall and walk the feet slightly forward.',
      'Stand evenly on both heels with the knees softly bent.',
      'Lift the toes and forefeet toward the shins as high as possible.',
      'Pause briefly without shifting the hips away from the wall.',
      'Lower the forefeet slowly while the heels remain planted.',
    ],
    formTips: [
      'Keep both heels planted',
      'Lift the toes toward the shins',
      'Keep pressure even between sides',
      'Pause at the top',
      'Lower the forefeet slowly',
    ],
    commonMistakes: [
      'Rocking forward and lifting the heels',
      'Using momentum instead of ankle motion',
      'Turning the feet outward',
      'Shifting the hips during each repetition',
      'Dropping the toes quickly',
    ],
    progression: [
      'Wall tibialis raise close to the wall',
      'Wall tibialis raise with feet farther forward',
      'Single-leg wall tibialis raise',
      'Paused wall tibialis raise',
    ],
    regression: [
      'Seated toe raise',
      'Standing toe raise with support',
      'Short-range wall tibialis raise',
    ],
    postureNotes:
      'Keep the head, ribs, and pelvis stacked against the wall. The movement should come from the ankles rather than rocking the body.',
    demoLinks: demos('wall tibialis raise'),
    relatedWorkoutDays: [2],
  },
  {
    id: 'sumo-deadlift',
    name: 'Sumo Deadlift',
    category: 'Legs',
    primaryMuscles: ['Glutes', 'Hamstrings', 'Adductors'],
    secondaryMuscles: ['Quads', 'Lower Back', 'Core', 'Forearms'],
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    formCue: 'Brace, push the knees out, and drive the floor away.',
    instructions: [
      'Take a comfortable wide stance with the toes turned out and the bar over mid-foot.',
      'Grip the bar inside the knees, brace, and pull the slack from it.',
      'Keep the knees tracking the toes as you push the floor away.',
      'Keep the bar close and rise with the hips and shoulders together.',
      'Stand tall without leaning back, then lower the bar under control.',
    ],
    formTips: [
      'Use a comfortable wide stance',
      'Brace before the bar leaves the floor',
      'Pull the slack from the bar',
      'Drive the knees with the toes',
      'Finish tall without leaning back',
    ],
    commonMistakes: [
      'Setting the stance wider than the hips can control',
      'Knees collapsing inward',
      'Rounding the lower back off the floor',
      'Letting the hips shoot up first',
      'Hyperextending at lockout',
    ],
    progression: [
      'Kettlebell or dumbbell sumo deadlift',
      'Barbell sumo deadlift',
      'Paused sumo deadlift',
      'Heavier barbell sumo deadlift',
    ],
    regression: [
      'Dumbbell sumo deadlift',
      'Block sumo deadlift',
      'Hip hinge with dowel',
    ],
    postureNotes:
      'Brace before lifting and keep the spine neutral as the hips and shoulders rise together. Lock out with the glutes, not a backward lean.',
    demoLinks: demos('barbell sumo deadlift'),
    relatedWorkoutDays: [6],
  },
  {
    id: 'dumbbell-reverse-lunge',
    name: 'Dumbbell Reverse Lunge',
    category: 'Legs',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Core'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Step back with control and drive through the planted front foot.',
    instructions: [
      'Stand tall with a dumbbell at each side and the feet hip-width.',
      'Step one foot back far enough to keep the front foot planted.',
      'Lower both knees while keeping the hips square and torso controlled.',
      'Track the front knee in line with the toes.',
      'Drive through the front foot to return, then repeat on the other side.',
    ],
    formTips: [
      'Take a controlled step back',
      'Keep the front foot planted',
      'Track the front knee with the toes',
      'Keep the hips square',
      'Drive through the front foot',
    ],
    commonMistakes: [
      'Using a step that is too short',
      'Letting the front knee cave inward',
      'Pushing mainly from the back foot',
      'Twisting the pelvis',
      'Rushing the return to standing',
    ],
    progression: [
      'Bodyweight reverse lunge',
      'Dumbbell reverse lunge',
      'Heavier dumbbell reverse lunge',
      'Deficit dumbbell reverse lunge',
    ],
    regression: [
      'Supported reverse lunge',
      'Static split squat',
      'Low step-up',
    ],
    postureNotes:
      'Keep the ribs stacked, hips square, and front knee aligned. A slight forward torso angle is fine if the spine stays neutral.',
    demoLinks: demos('dumbbell reverse lunge'),
    relatedWorkoutDays: [6],
  },
  {
    id: 'heels-elevated-goblet-squat',
    name: 'Heels-Elevated Goblet Squat',
    category: 'Legs',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glutes', 'Adductors', 'Core'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue:
      'Hold the weight close, stay tall, and let the knees track forward.',
    instructions: [
      'Place both heels evenly on a stable low support with the feet about shoulder-width.',
      'Hold one dumbbell close to the chest and brace the core.',
      'Descend between the hips as the knees travel forward with the toes.',
      'Use only the depth where the feet, knees, and pelvis stay controlled.',
      'Push through the whole supported foot to stand tall.',
    ],
    formTips: [
      'Elevate both heels evenly',
      'Keep the dumbbell close to the chest',
      'Brace before descending',
      'Track the knees with the toes',
      'Maintain pelvic control at depth',
    ],
    commonMistakes: [
      'Using an unstable heel support',
      'Letting the knees collapse inward',
      'Holding the dumbbell away from the body',
      'Losing foot pressure at the bottom',
      'Descending past controlled pelvic range',
    ],
    progression: [
      'Bodyweight heels-elevated squat',
      'Heels-elevated goblet squat',
      'Paused heels-elevated goblet squat',
      'Heavier heels-elevated goblet squat',
    ],
    regression: ['Goblet box squat', 'Bodyweight squat', 'Supported squat'],
    postureNotes:
      'Stay tall with the ribs over the pelvis and keep the dumbbell close. Stop the descent before the lower back rounds or arches.',
    demoLinks: demos('heels elevated goblet squat'),
    relatedWorkoutDays: [6],
  },
  {
    id: 'single-leg-hip-thrust',
    name: 'Single-Leg Hip Thrust',
    category: 'Legs',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Bodyweight', 'Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    formCue:
      'Keep the pelvis level and finish with the glute, not the lower back.',
    instructions: [
      'Set the upper back securely on a bench and plant one foot beneath its knee.',
      'Lift the other foot and keep the pelvis level before starting.',
      'Brace the core and drive through the planted foot to raise the hips.',
      'Squeeze the working glute at the top without arching the lower back.',
      'Lower under control while keeping both sides of the pelvis even.',
    ],
    formTips: [
      'Secure the upper back on the bench',
      'Plant the working foot beneath the knee',
      'Keep the pelvis level',
      'Drive through the whole foot',
      'Finish without arching the back',
    ],
    commonMistakes: [
      'Rotating or dropping one side of the pelvis',
      'Over-arching at the top',
      'Pushing mostly through the toes',
      'Placing the working foot too far away',
      'Rushing the lowering phase',
    ],
    progression: [
      'Bodyweight single-leg hip thrust',
      'Paused single-leg hip thrust',
      'Dumbbell single-leg hip thrust',
      'Heavier single-leg hip thrust',
    ],
    regression: ['Glute bridge', 'Hip thrust', 'Single-leg glute bridge'],
    postureNotes:
      'Keep the ribs down and pelvis level throughout. Stop at a straight hip line and use the glute instead of hyperextending the lower back.',
    demoLinks: demos('single leg hip thrust'),
    relatedWorkoutDays: [6],
    postureFocus: true,
  },

  // ------------------------------------------------------------------ Abs
  {
    id: 'hanging-knee-raise',
    name: 'Hanging Knee Raise',
    category: 'Abs',
    primaryMuscles: ['Lower Abs'],
    secondaryMuscles: ['Hip Flexors', 'Forearms'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    difficulty: 'Intermediate',
    formCue: 'Curl the pelvis up, lift with the abs, do not swing.',
    instructions: [
      'Hang from the bar with shoulders set down.',
      'Brace the core and keep the ribs down.',
      'Curl the pelvis up as you raise the knees.',
      'Lift the knees toward the chest without swinging.',
      'Lower slowly under control.',
    ],
    formTips: [
      'Curl the pelvis, not just the hips',
      'Lift with the abs',
      'Ribs down, no swinging',
      'Control the lowering',
      'Keep shoulders active on the bar',
    ],
    commonMistakes: [
      'Swinging the body for momentum',
      'Only lifting with the hip flexors',
      'Arching and flaring the ribs',
      'Dropping the legs fast',
      'Partial range of motion',
    ],
    progression: [
      'Lying reverse crunch',
      'Hanging knee raise',
      'Hanging straight-leg raise',
      'Toes-to-bar',
    ],
    regression: [
      'Lying leg raise',
      'Reverse crunch',
      'Captain-chair knee raise',
    ],
    postureNotes:
      'Curling the pelvis up (posterior tilt) trains the exact control that fixes an arched back. Keep ribs down and avoid swinging.',
    demoLinks: demos('hanging knee raise'),
    relatedWorkoutDays: [3, 5],
    postureFocus: true,
  },
  {
    id: 'lying-leg-raise',
    name: 'Lying Leg Raise',
    category: 'Abs',
    primaryMuscles: ['Lower Abs'],
    secondaryMuscles: ['Hip Flexors'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue:
      'Press the lower back to the floor, lower legs only as far as you can hold it.',
    instructions: [
      'Lie on your back with the legs straight.',
      'Press the lower back gently into the floor.',
      'Raise the legs toward the ceiling with the abs.',
      'Lower the legs slowly only as far as the back stays flat.',
      'Keep the lower back pinned throughout.',
    ],
    formTips: [
      'Press the lower back to the floor',
      'Move slowly under control',
      'Only lower as far as you can hold the back flat',
      'Ribs down, abs tight',
      'Breathe steadily',
    ],
    commonMistakes: [
      'Lower back arching off the floor',
      'Dropping the legs too fast',
      'Using momentum',
      'Holding the breath',
      'Lowering past your control',
    ],
    progression: [
      'Bent-knee leg raise',
      'Lying leg raise',
      'Leg raise with hip lift',
      'Hanging leg raise',
    ],
    regression: ['Bent-knee raise', 'Dead bug', 'Reverse crunch'],
    postureNotes:
      'Keeping the lower back pressed flat is the whole point. If the back arches, reduce the range — this directly builds anti-arch control.',
    demoLinks: demos('lying leg raise'),
    relatedWorkoutDays: [5],
    postureFocus: true,
  },
  {
    id: 'reverse-crunch',
    name: 'Reverse Crunch',
    category: 'Abs',
    primaryMuscles: ['Lower Abs'],
    secondaryMuscles: ['Hip Flexors'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Curl the hips off the floor using the abs, not a swing.',
    instructions: [
      'Lie on your back with the knees bent over the hips.',
      'Press the lower back into the floor.',
      'Curl the hips up off the floor using the abs.',
      'Bring the knees toward the chest.',
      'Lower the hips slowly under control.',
    ],
    formTips: [
      'Curl with the abs, not a leg swing',
      'Press the lower back down',
      'Ribs down, controlled tempo',
      'Small, precise range',
      'Lower slowly',
    ],
    commonMistakes: [
      'Swinging the legs for momentum',
      'Arching the lower back',
      'Rushing the reps',
      'Only moving the knees, not the pelvis',
      'Yanking the neck',
    ],
    progression: [
      'Reverse crunch',
      'Slow reverse crunch',
      'Reverse crunch with hip lift',
      'Hanging knee raise',
    ],
    regression: ['Dead bug', 'Knee tuck', 'Pelvic tilt'],
    postureNotes:
      'The pelvic curl trains posterior tilt control, directly helping an arched-back posture. Keep ribs down.',
    demoLinks: demos('reverse crunch'),
    relatedWorkoutDays: [6],
    postureFocus: true,
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'Abs',
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Straight line head to heels, ribs down, glutes squeezed.',
    instructions: [
      'Set the forearms under the shoulders.',
      'Extend the legs to form a straight line head to heels.',
      'Tuck the ribs down and brace the abs.',
      'Squeeze the glutes lightly.',
      'Hold steady, breathing normally.',
    ],
    formTips: [
      'Ribs down, abs tight',
      'Glutes slightly squeezed',
      'Neutral spine, no sag',
      'Do not over-arch lower back',
      'Stop if the hips start to drop',
    ],
    commonMistakes: [
      'Hips sagging toward the floor',
      'Hips piking up too high',
      'Head dropping or craning up',
      'Holding the breath',
      'Letting the lower back arch',
    ],
    progression: [
      'Knee plank',
      'Plank',
      'Long-lever plank',
      'Weighted plank (backpack)',
    ],
    regression: ['Incline plank (hands on bench)', 'Knee plank', 'Dead bug'],
    postureNotes: `A key anti-arch drill. ${archSafety}`,
    demoLinks: demos('forearm plank'),
    relatedWorkoutDays: [6],
    postureFocus: true,
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    category: 'Abs',
    primaryMuscles: ['Obliques', 'Core'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Stack the body in one line, lift the hips, do not sag.',
    instructions: [
      'Lie on your side with the forearm under the shoulder.',
      'Stack the feet and hips.',
      'Lift the hips so the body is one straight line.',
      'Brace the obliques and keep the ribs down.',
      'Hold steady, then switch sides.',
    ],
    formTips: [
      'Stack the body in one line',
      'Lift the hips, do not sag',
      'Ribs down, core braced',
      'Keep the neck neutral',
      'Do both sides evenly',
    ],
    commonMistakes: [
      'Hips sagging toward the floor',
      'Rotating the torso forward',
      'Shoulder collapsing',
      'Holding the breath',
      'Uneven time on each side',
    ],
    progression: [
      'Knee side plank',
      'Side plank',
      'Side plank with leg lift',
      'Weighted side plank',
    ],
    regression: ['Knee side plank', 'Short-hold side plank', 'Side-lying hold'],
    postureNotes:
      'Keep ribs down and hips lifted in one line; this builds lateral core control that supports the spine.',
    demoLinks: demos('side plank'),
    relatedWorkoutDays: [3, 6],
    postureFocus: true,
  },
  {
    id: 'hollow-body-hold',
    name: 'Hollow Body Hold',
    category: 'Abs',
    primaryMuscles: ['Core', 'Lower Abs'],
    secondaryMuscles: ['Hip Flexors'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Intermediate',
    formCue: 'Press the lower back flat, then lift shoulders and legs.',
    instructions: [
      'Lie on your back with the arms overhead.',
      'Press the lower back firmly into the floor.',
      'Lift the shoulders and legs off the floor.',
      'Hold a shallow banana shape with the back still pinned.',
      'Regress the arm or leg position if the back arches.',
    ],
    formTips: [
      'Press the lower back flat first',
      'Ribs down, abs braced',
      'Lower the legs only as far as the back stays flat',
      'Keep the neck relaxed',
      'Breathe steadily',
    ],
    commonMistakes: [
      'Lower back arching off the floor',
      'Legs too low for your control',
      'Straining the neck',
      'Holding the breath',
      'Losing the flat-back position',
    ],
    progression: [
      'Tuck hold',
      'One leg extended',
      'Hollow body hold',
      'Hollow body rocks',
    ],
    regression: ['Tuck hold', 'Dead bug', 'Pelvic tilt'],
    postureNotes:
      'The flat-back requirement makes this one of the best anti-arch drills. If the back lifts, raise the legs higher or tuck the knees.',
    demoLinks: demos('hollow body hold'),
    relatedWorkoutDays: [2],
    postureFocus: true,
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'Abs',
    primaryMuscles: ['Core', 'Lower Abs'],
    secondaryMuscles: ['Hip Flexors'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Back stays flat while an opposite arm and leg reach out.',
    instructions: [
      'Lie on your back with the arms up and knees over the hips.',
      'Press the lower back gently into the floor.',
      'Slowly lower one arm and the opposite leg.',
      'Keep the lower back pinned the whole time.',
      'Return and repeat on the other side.',
    ],
    formTips: [
      'Keep the lower back flat',
      'Move slowly and controlled',
      'Ribs down, abs braced',
      'Only reach as far as the back stays flat',
      'Breathe out as you extend',
    ],
    commonMistakes: [
      'Lower back arching off the floor',
      'Moving too fast',
      'Holding the breath',
      'Reaching too far too soon',
      'Rushing side to side',
    ],
    progression: [
      'Dead bug (arms only)',
      'Dead bug (legs only)',
      'Dead bug (opposite arm and leg)',
      'Weighted dead bug',
    ],
    regression: ['Heel taps', 'Marching', 'Pelvic tilt'],
    postureNotes:
      'A cornerstone anti-arch exercise: it teaches you to keep a neutral, flat lower back while the limbs move.',
    demoLinks: demos('dead bug exercise'),
    relatedWorkoutDays: [1, 6],
    postureFocus: true,
  },
  {
    id: 'side-plank-reach-through',
    name: 'Side-Plank Reach-Through',
    category: 'Abs',
    primaryMuscles: ['Obliques', 'Core'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Intermediate',
    formCue:
      'Keep the hips lifted while the upper torso rotates under control.',
    instructions: [
      'Set the supporting elbow directly under the shoulder.',
      'Lift the hips into a straight side-plank position.',
      'Reach the top arm under the ribs by rotating the upper torso.',
      'Return to a stable open position without dropping the hips.',
      'Complete the repetitions, then switch sides.',
    ],
    formTips: [
      'Press the floor away through the forearm',
      'Keep the hips high and stacked',
      'Rotate through the upper torso',
      'Move slowly in both directions',
      'Breathe out during the reach',
    ],
    commonMistakes: [
      'Letting the hips sag',
      'Collapsing into the supporting shoulder',
      'Twisting only from the reaching arm',
      'Rushing through the rotation',
      'Rolling the pelvis toward the floor',
    ],
    progression: [
      'Knee side-plank reach-through',
      'Side-plank reach-through',
      'Feet-stacked reach-through',
      'Slow reach-through with a pause',
    ],
    regression: [
      'Knee side plank',
      'Static side plank',
      'Short-range reach-through',
    ],
    postureNotes:
      'Keep the ribs stacked over the pelvis and rotate through the upper torso while the waist stays lifted. This builds lateral core control without side-bending the lower back.',
    demoLinks: demos('side plank reach through'),
    relatedWorkoutDays: [4],
    postureFocus: true,
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'Abs',
    primaryMuscles: ['Lower Abs'],
    secondaryMuscles: ['Hip Flexors', 'Forearms', 'Lats'],
    equipment: ['Pull-up bar', 'Bodyweight'],
    difficulty: 'Advanced',
    formCue: 'Start from a still hang, curl the pelvis up, and never swing.',
    instructions: [
      'Take a secure overhand grip and begin from a still active hang.',
      'Brace the abs and gently tuck the pelvis before lifting.',
      'Raise the straight legs only as high as the torso stays controlled.',
      'Pause briefly without leaning back or swinging.',
      'Lower slowly to a still hang before the next repetition.',
    ],
    formTips: [
      'Curl the pelvis toward the ribs',
      'Keep the shoulders active',
      'Use a controlled range',
      'Lower more slowly than you lift',
      'Reset any swing between reps',
    ],
    commonMistakes: [
      'Swinging for momentum',
      'Lifting only from the hip flexors',
      'Arching and flaring the ribs',
      'Dropping the legs quickly',
      'Continuing after the grip fails',
    ],
    progression: [
      'Hanging knee raise',
      'Bent-leg hanging raise',
      'Hanging straight-leg raise',
      'Toes-to-bar',
    ],
    regression: ['Hanging knee raise', 'Lying leg raise', 'Reverse crunch'],
    postureNotes:
      'Lead with a pelvic curl and keep the ribs down. If the lower back arches or the body swings, bend the knees or shorten the range.',
    demoLinks: demos('hanging straight leg raise'),
    relatedWorkoutDays: [5],
    postureFocus: true,
  },
  {
    id: 'kneeling-barbell-rollout',
    name: 'Kneeling Barbell Rollout',
    category: 'Abs',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: ['Lats', 'Shoulders', 'Triceps'],
    equipment: ['Barbell', 'Mat'],
    difficulty: 'Intermediate',
    formCue: 'Roll only as far as the ribs and pelvis stay stacked.',
    instructions: [
      'Confirm the barbell plates roll securely and kneel on a mat.',
      'Grip the bar, tuck the pelvis slightly, and brace the abs.',
      'Roll forward slowly while keeping the hips and ribs connected.',
      'Stop before the lower back begins to arch.',
      'Tighten the abs and lats to pull the bar back to the start.',
    ],
    formTips: [
      'Test the bar and plates before starting',
      'Keep the ribs down',
      'Use a slight pelvic tuck',
      'Reach only within your control',
      'Pull back with the abs and lats',
    ],
    commonMistakes: [
      'Using unsecured or non-rolling plates',
      'Letting the lower back sag',
      'Pushing the hips forward without the shoulders',
      'Rolling farther than the core can control',
      'Jerking the bar back with momentum',
    ],
    progression: [
      'Short-range kneeling rollout',
      'Kneeling barbell rollout',
      'Longer-range rollout with a pause',
      'Standing partial rollout',
    ],
    regression: ['Long-lever plank', 'Short-range barbell rollout', 'Dead bug'],
    postureNotes:
      'This is an anti-extension drill: keep the ribs down and pelvis lightly tucked. End the rollout as soon as the lower back starts to arch.',
    demoLinks: demos('kneeling barbell rollout'),
    relatedWorkoutDays: [6],
    postureFocus: true,
  },

  // -------------------------------------------------------------- Posture
  {
    id: 'posterior-pelvic-tilt',
    name: 'Posterior Pelvic Tilt',
    category: 'Posture',
    primaryMuscles: ['Lower Abs', 'Glutes'],
    secondaryMuscles: ['Core'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Flatten the lower back by tilting the pelvis with the abs.',
    instructions: [
      'Lie on your back with the knees bent and feet flat.',
      'Notice the natural gap under the lower back.',
      'Gently tilt the pelvis to flatten the back into the floor.',
      'Use the lower abs and a light glute squeeze.',
      'Hold briefly, then release to neutral and repeat.',
    ],
    formTips: [
      'Tilt with the abs, not by pushing the feet',
      'Light glute squeeze',
      'Small, controlled movement',
      'Ribs down',
      'Breathe throughout',
    ],
    commonMistakes: [
      'Pushing through the feet instead of tilting',
      'Holding the breath',
      'Using too much force',
      'Lifting the hips into a bridge',
      'Rushing the reps',
    ],
    progression: [
      'Pelvic tilt on the floor',
      'Pelvic tilt with breathing',
      'Standing pelvic tilt',
      'Dead bug',
    ],
    regression: ['Smaller-range tilt', 'Seated pelvic tilt', 'Breathing drill'],
    postureNotes:
      'This is the foundational drill for correcting an over-arched (anterior tilt) lower back. Learn the flatten-and-hold, then apply it during planks, presses and squats.',
    demoLinks: demos('posterior pelvic tilt'),
    relatedWorkoutDays: [4],
    postureFocus: true,
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'Posture',
    primaryMuscles: ['Hip Flexors'],
    secondaryMuscles: ['Quads'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Squeeze the back-leg glute, tuck the pelvis, feel the front hip.',
    instructions: [
      'Kneel in a half-kneeling position (one knee down).',
      'Squeeze the glute on the back leg.',
      'Tuck the pelvis under (posterior tilt).',
      'Shift gently forward until you feel the front-of-hip stretch.',
      'Hold and breathe, keeping the ribs down.',
    ],
    formTips: [
      'Squeeze the glute on the back leg',
      'Keep ribs down',
      'Do not arch the lower back',
      'Breathe slowly',
      'Hold steady tension',
    ],
    commonMistakes: [
      'Arching the lower back instead of tucking',
      'Leaning the torso forward',
      'Not squeezing the glute',
      'Bouncing in the stretch',
      'Holding the breath',
    ],
    progression: [
      'Half-kneeling stretch',
      'Half-kneeling with glute squeeze',
      'Elevated back foot (couch stretch)',
      'Add overhead reach',
    ],
    regression: [
      'Standing hip flexor stretch',
      'Shorter hold',
      'Supported stretch',
    ],
    postureNotes:
      'Tight hip flexors pull the pelvis into an arch. Squeezing the glute and tucking the pelvis is what opens the front of the hip — do not just lean forward and arch.',
    demoLinks: demos('kneeling hip flexor stretch'),
    relatedWorkoutDays: [3],
    postureFocus: true,
  },
  {
    id: 'plank-with-glute-squeeze',
    name: 'Plank with Glute Squeeze',
    category: 'Posture',
    primaryMuscles: ['Core', 'Glutes'],
    secondaryMuscles: ['Shoulders'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Plank, then squeeze the glutes to tuck the pelvis flat.',
    instructions: [
      'Set up a forearm plank with a straight body line.',
      'Tuck the ribs down and brace the abs.',
      'Squeeze the glutes to gently tuck the pelvis.',
      'Feel the lower back flatten out of any arch.',
      'Hold, breathing steadily.',
    ],
    formTips: [
      'Squeeze the glutes to tuck the pelvis',
      'Ribs down, abs tight',
      'Flatten the lower back',
      'Neutral neck',
      'Stop if the hips sag',
    ],
    commonMistakes: [
      'Letting the lower back arch',
      'Hips sagging or piking',
      'Forgetting to squeeze the glutes',
      'Holding the breath',
      'Head dropping',
    ],
    progression: [
      'Knee plank + glute squeeze',
      'Plank + glute squeeze',
      'Long-lever plank + glute squeeze',
      'Weighted plank + glute squeeze',
    ],
    regression: ['Incline plank + squeeze', 'Knee plank', 'Dead bug'],
    postureNotes:
      'This is the plank tuned for arched-back correction: the glute squeeze drives a posterior tilt so the lower back stays flat. Ribs down, abs tight, glutes squeezed.',
    demoLinks: demos('plank with posterior pelvic tilt glute squeeze'),
    relatedWorkoutDays: [6],
    postureFocus: true,
  },
  {
    id: 'ninety-ninety-hip-lift',
    name: '90/90 Hip Lift with Full Exhale',
    category: 'Posture',
    primaryMuscles: ['Hamstrings', 'Lower Abs'],
    secondaryMuscles: ['Glutes', 'Breathing Muscles'],
    equipment: ['Bodyweight', 'Bench', 'Mat'],
    difficulty: 'Beginner',
    formCue:
      'Dig the heels down, tip the pelvis back, and fully exhale the ribs down.',
    instructions: [
      'Lie on your back with the hips and knees bent to 90 degrees.',
      'Support both feet on a wall or bench and gently pull the heels down.',
      'Tip the pelvis back until the lower back rests softly on the mat.',
      'Exhale fully until the lower ribs settle, then pause briefly.',
      'Inhale quietly without losing the rib and pelvic position.',
    ],
    formTips: [
      'Keep light pressure through the heels',
      'Feel the hamstrings, not the lower back',
      'Use a long complete exhale',
      'Keep the neck and jaw relaxed',
      'Maintain the pelvic position as you inhale',
    ],
    commonMistakes: [
      'Pushing into a high bridge',
      'Flaring the ribs during the inhale',
      'Pressing through the toes instead of the heels',
      'Tensing the neck and shoulders',
      'Losing the pelvic tuck between breaths',
    ],
    progression: [
      'Supine full-exhale breathing',
      '90/90 hip lift',
      '90/90 hip lift with reach',
      'Alternating 90/90 heel pressure',
    ],
    regression: [
      'Posterior pelvic tilt',
      'Feet-on-bench breathing',
      'Shorter exhales',
    ],
    postureNotes:
      'The heel pull and full exhale bring the pelvis and lower ribs toward a stacked position. Keep the movement gentle; this is a breathing and control drill, not a high bridge.',
    demoLinks: demos('90 90 hip lift full exhale'),
    relatedWorkoutDays: [1, 4],
    postureFocus: true,
  },
  {
    id: 'bird-dog-with-pause',
    name: 'Bird Dog with Pause',
    category: 'Posture',
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Glutes', 'Back', 'Shoulders'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Beginner',
    formCue: 'Reach long, pause, and keep the pelvis square to the floor.',
    instructions: [
      'Set the hands under the shoulders and knees under the hips.',
      'Brace lightly with the spine in a neutral position.',
      'Reach one arm and the opposite leg away from the body.',
      'Pause without rotating the pelvis or arching the lower back.',
      'Return slowly and alternate sides.',
    ],
    formTips: [
      'Reach long instead of lifting high',
      'Keep both hip bones facing the floor',
      'Press the supporting hand into the mat',
      'Keep the ribs down',
      'Own the pause before returning',
    ],
    commonMistakes: [
      'Opening the pelvis to the side',
      'Arching to lift the leg higher',
      'Shrugging into the supporting shoulder',
      'Moving too quickly to control the pause',
      'Shifting all the weight to one side',
    ],
    progression: [
      'Arm-only or leg-only bird dog',
      'Bird dog',
      'Bird dog with pause',
      'Bird dog with elbow-to-knee return',
    ],
    regression: ['Quadruped brace', 'Arm-only bird dog', 'Leg-only bird dog'],
    postureNotes:
      'Keep the ribs and pelvis quiet while the limbs move. Reach lower and longer if lifting the leg makes the back arch.',
    demoLinks: demos('bird dog exercise with pause'),
    relatedWorkoutDays: [2],
    postureFocus: true,
  },
  {
    id: 'glute-bridge-march',
    name: 'Glute Bridge March',
    category: 'Posture',
    primaryMuscles: ['Glutes', 'Core'],
    secondaryMuscles: ['Hamstrings', 'Hip Flexors'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'Intermediate',
    formCue: 'Hold the bridge level while one foot lifts at a time.',
    instructions: [
      'Lie on your back with the knees bent and feet planted.',
      'Exhale, keep the ribs down, and lift into a glute bridge.',
      'Brace before lifting one foot a few centimetres from the floor.',
      'Set it down softly, then alternate without shifting the pelvis.',
      'Lower the hips when you can no longer keep them level.',
    ],
    formTips: [
      'Squeeze the glutes before marching',
      'Keep both hip bones level',
      'Use a small controlled foot lift',
      'Keep the ribs down',
      'Reset the bridge height as needed',
    ],
    commonMistakes: [
      'Letting one hip drop',
      'Arching the lower back at the top',
      'Lifting the knee too far toward the chest',
      'Pushing through the toes',
      'Marching faster than the pelvis can stay steady',
    ],
    progression: [
      'Glute bridge',
      'Bridge weight shift',
      'Glute bridge march',
      'Long-pause bridge march',
    ],
    regression: [
      'Posterior pelvic tilt',
      'Glute bridge',
      'Alternating heel lift',
    ],
    postureNotes:
      'Keep the ribs down and pelvis level so the glutes and core control the march. Reduce the foot lift if the lower back arches or the hips twist.',
    demoLinks: demos('glute bridge march'),
    relatedWorkoutDays: [4],
    postureFocus: true,
  },
  {
    id: 'couch-hip-flexor-stretch',
    name: 'Couch Hip-Flexor Stretch',
    category: 'Posture',
    primaryMuscles: ['Hip Flexors', 'Quads'],
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: ['Bodyweight', 'Bench', 'Mat'],
    difficulty: 'Beginner',
    formCue:
      'Tuck the pelvis and squeeze the rear glute before moving upright.',
    instructions: [
      'Pad the back knee and place the rear foot against a wall or bench.',
      'Set the front foot far enough forward to feel stable.',
      'Gently tuck the pelvis and squeeze the rear-leg glute.',
      'Move the torso upright only until the front hip and thigh stretch.',
      'Breathe slowly, then change sides.',
    ],
    formTips: [
      'Use generous padding under the knee',
      'Tuck the pelvis before moving upright',
      'Squeeze the rear-leg glute',
      'Keep the ribs down',
      'Use support if balance is limiting',
    ],
    commonMistakes: [
      'Arching the lower back for more range',
      'Placing the front foot too close',
      'Forcing the rear knee into discomfort',
      'Letting the ribs flare',
      'Bouncing deeper into the stretch',
    ],
    progression: [
      'Half-kneeling hip-flexor stretch',
      'Supported couch stretch',
      'Upright couch stretch',
      'Couch stretch with overhead reach',
    ],
    regression: [
      'Standing hip-flexor stretch',
      'Half-kneeling stretch',
      'Rear foot kept lower',
    ],
    postureNotes:
      'The pelvic tuck, not a lower-back arch, creates the useful hip-flexor stretch. Stay tall only within the range where the ribs remain stacked.',
    demoLinks: demos('couch hip flexor stretch'),
    relatedWorkoutDays: [4],
    postureFocus: true,
  },

  // --------------------------------------------------------- Conditioning
  {
    id: 'treadmill-incline-walk',
    name: 'Treadmill Incline Walk',
    category: 'Conditioning',
    primaryMuscles: ['Glutes', 'Calves', 'Heart & Lungs'],
    secondaryMuscles: ['Hamstrings', 'Quads'],
    equipment: ['Treadmill'],
    difficulty: 'Beginner',
    formCue: 'Use incline instead of running to spare the shins.',
    instructions: [
      'Set a walking pace with a moderate incline.',
      'Stand tall, ribs down, and take smooth steps.',
      'Let the arms swing naturally.',
      'Keep breathing steady and conversational.',
      'Walk 25-35 minutes, avoiding a hard run.',
    ],
    formTips: [
      'Use incline instead of running',
      'Keep steps smooth',
      'Do not chase speed',
      'Stand tall, ribs down',
      'Stop if the shins flare up',
    ],
    commonMistakes: [
      'Holding the handrails and hunching',
      'Setting the speed too high',
      'Leaning back on the belt',
      'Over-striding',
      'Ignoring early shin pain',
    ],
    progression: [
      'Flat walk',
      'Incline walk',
      'Steeper incline walk',
      'Longer incline walk',
    ],
    regression: ['Shorter walk', 'Lower incline', 'Flat easy walk'],
    postureNotes:
      'Walk tall with ribs down and a neutral spine. Do not hang on the handrails, which rounds the posture.',
    demoLinks: demos('treadmill incline walk fat loss'),
    relatedWorkoutDays: [6],
  },
  {
    id: 'skipping-rope',
    name: 'Skipping Rope',
    category: 'Conditioning',
    primaryMuscles: ['Calves', 'Heart & Lungs'],
    secondaryMuscles: ['Shoulders', 'Forearms', 'Core'],
    equipment: ['Skipping rope'],
    difficulty: 'Beginner',
    formCue: 'Small bounces on the balls of the feet, wrists do the turning.',
    instructions: [
      'Hold the handles with the elbows near the ribs.',
      'Turn the rope with the wrists, not big arm swings.',
      'Take small, soft bounces on the balls of the feet.',
      'Keep the shoulders relaxed and the core braced.',
      'Work in short rounds and build up over time.',
    ],
    formTips: [
      'Stay light on the feet',
      'Keep the shoulders relaxed',
      'Turn with the wrists',
      'Use short rounds',
      'Stop if the shins hurt',
    ],
    commonMistakes: [
      'Jumping too high',
      'Big arm swings instead of wrist turns',
      'Landing flat-footed and hard',
      'Going too long before conditioned',
      'Tensing the shoulders',
    ],
    progression: [
      'Practice bounce (no rope)',
      'Basic skip',
      'Longer rounds',
      'Faster / double-under work',
    ],
    regression: ['Shorter rounds', 'Bounce without the rope', 'Step-throughs'],
    postureNotes:
      'Stay tall with ribs down and core braced; land softly to protect the shins and keep the spine neutral.',
    demoLinks: demos('jump rope for beginners'),
    relatedWorkoutDays: [6],
  },
  {
    id: 'vr-boxing',
    name: 'VR Boxing',
    category: 'Conditioning',
    primaryMuscles: ['Heart & Lungs', 'Shoulders'],
    secondaryMuscles: ['Core', 'Legs', 'Back'],
    equipment: ['VR Quest 2'],
    difficulty: 'Beginner',
    formCue: 'Light on the feet, rotate through the core, keep a guard.',
    instructions: [
      'Clear a safe space and set your VR guardian boundary.',
      'Stand light on the balls of the feet with a slight knee bend.',
      'Throw punches by rotating through the hips and core.',
      'Keep the non-punching hand up as a guard.',
      'Work in short rounds and keep the movement smooth.',
    ],
    formTips: [
      'Stay light on the feet',
      'Rotate through the core, not just the arms',
      'Keep a guard up',
      'Ribs down, core braced',
      'Use short rounds',
    ],
    commonMistakes: [
      'Over-reaching and hyperextending the elbow',
      'Standing flat-footed',
      'Only using the arms (no rotation)',
      'Going too long before conditioned',
      'Ignoring the play boundary',
    ],
    progression: [
      'Short easy rounds',
      'Moderate rounds',
      'Longer rounds',
      'Higher-intensity rounds',
    ],
    regression: ['Shorter rounds', 'Lower intensity', 'Rhythm-focused songs'],
    postureNotes:
      'Move from a braced, ribs-down torso and rotate through the core. Avoid over-reaching, which strains the shoulder and lower back.',
    demoLinks: demos('VR boxing workout quest 2'),
    relatedWorkoutDays: [6],
  },
  {
    id: 'suitcase-carry',
    name: 'Suitcase Carry',
    category: 'Conditioning',
    primaryMuscles: ['Obliques', 'Grip'],
    secondaryMuscles: ['Traps', 'Forearms', 'Glutes'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Walk tall and resist leaning toward or away from the load.',
    instructions: [
      'Lift one dumbbell safely and hold it beside one thigh.',
      'Stand tall with level shoulders and the ribs over the pelvis.',
      'Walk with short controlled steps without leaning or swaying.',
      'Turn carefully while keeping the dumbbell close and still.',
      'Set the weight down safely and repeat on the other side.',
    ],
    formTips: [
      'Choose a load you can control without leaning',
      'Keep both shoulders level',
      'Take quiet, deliberate steps',
      'Keep the free hand relaxed',
      'Use equal time on both sides',
    ],
    commonMistakes: [
      'Leaning toward the dumbbell',
      'Leaning away to compensate',
      'Letting the weight swing',
      'Taking rushed or uneven steps',
      'Shrugging the loaded shoulder',
    ],
    progression: [
      'Static suitcase hold',
      'Light suitcase carry',
      'Heavier suitcase carry',
      'Longer suitcase carry',
    ],
    regression: ['Lighter dumbbell', 'Shorter carry', 'Static suitcase hold'],
    postureNotes:
      'The torso should remain vertical with the ribs stacked over the pelvis. Reduce the load if you cannot resist side-bending in either direction.',
    demoLinks: demos('dumbbell suitcase carry'),
    relatedWorkoutDays: [3],
    postureFocus: true,
  },
  {
    id: 'easy-indoor-swimming',
    name: 'Easy Indoor Swimming',
    category: 'Conditioning',
    primaryMuscles: ['Heart & Lungs', 'Back'],
    secondaryMuscles: ['Shoulders', 'Legs', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue: 'Use smooth strokes and an easy pace with relaxed breathing.',
    instructions: [
      'Enter the pool safely and begin with a few easy lengths.',
      'Choose a comfortable stroke and a conversational effort.',
      'Exhale steadily in the water and keep the neck relaxed.',
      'Rest or change strokes before technique becomes strained.',
      'Finish with easy lengths and exit the pool carefully.',
    ],
    formTips: [
      'Keep the effort easy and repeatable',
      'Use smooth unhurried strokes',
      'Exhale steadily underwater',
      'Relax the neck and shoulders',
      'Take rests whenever needed',
    ],
    commonMistakes: [
      'Turning a recovery swim into hard intervals',
      'Holding the breath underwater',
      'Craning the neck to look forward',
      'Forcing a painful shoulder range',
      'Continuing after technique breaks down',
    ],
    progression: [
      'Short easy swim with frequent rests',
      'Continuous easy swimming',
      'Longer easy swimming',
      'Brief moderate intervals on a training day',
    ],
    regression: [
      'Shorter pool session',
      'More rest between lengths',
      'Easy water walking',
    ],
    postureNotes:
      'Keep the head aligned with the torso and let the body stay long in the water. Change stroke or stop if the neck, shoulders, or lower back become uncomfortable.',
    demoLinks: demos('easy swimming technique recovery workout'),
    relatedWorkoutDays: [4],
  },
  {
    id: 'farmer-carry',
    name: 'Farmer Carry',
    category: 'Conditioning',
    primaryMuscles: ['Grip', 'Traps'],
    secondaryMuscles: ['Forearms', 'Core', 'Glutes'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    formCue: 'Carry equal loads with level shoulders and short steady steps.',
    instructions: [
      'Place equal dumbbells beside the feet and lift them with a safe hinge.',
      'Stand tall with the weights beside the thighs.',
      'Brace lightly and walk with short steady steps.',
      'Keep the shoulders level and the weights from hitting the legs.',
      'Stop under control and set both weights down safely.',
    ],
    formTips: [
      'Use equal controllable loads',
      'Keep the ribs stacked over the pelvis',
      'Walk tall without swaying',
      'Keep the weights close and quiet',
      'Maintain a strong full-hand grip',
    ],
    commonMistakes: [
      'Using a load that shortens posture',
      'Shrugging or rounding the shoulders',
      'Taking long unstable steps',
      'Letting the dumbbells swing into the legs',
      'Dropping the weights at the finish',
    ],
    progression: [
      'Light farmer hold',
      'Light farmer carry',
      'Heavier farmer carry',
      'Longer farmer carry',
    ],
    regression: ['Lighter dumbbells', 'Shorter carry', 'Static farmer hold'],
    postureNotes:
      'Stay tall with the ribs stacked and shoulders level. The load is too heavy if it pulls the torso forward or makes each step sway.',
    demoLinks: demos('dumbbell farmer carry'),
    relatedWorkoutDays: [6],
    postureFocus: true,
  },
  {
    id: 'light-walking-only',
    name: 'Light Walking',
    category: 'Conditioning',
    primaryMuscles: ['Heart & Lungs', 'Legs'],
    secondaryMuscles: ['Calves', 'Glutes'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    formCue: 'Keep the pace easy, posture relaxed, and stride natural.',
    instructions: [
      'Choose a flat, comfortable route or walking surface.',
      'Start at an easy pace that supports relaxed breathing.',
      'Walk tall with the shoulders loose and arms swinging naturally.',
      'Keep the stride comfortable rather than reaching forward.',
      'Shorten or skip the walk if full rest would aid recovery more.',
    ],
    formTips: [
      'Keep the pace conversational',
      'Use a relaxed natural stride',
      'Let the shoulders stay loose',
      'Choose a flat route when fatigued',
      'Treat the walk as recovery',
    ],
    commonMistakes: [
      'Walking hard enough to add fatigue',
      'Over-striding',
      'Hunching over a phone',
      'Ignoring foot, shin, or joint pain',
      'Walking when complete rest is needed',
    ],
    progression: [
      'Five-minute easy stroll',
      'Short recovery walk',
      'Twenty-to-forty-minute easy walk',
      'Longer easy walk when well recovered',
    ],
    regression: ['Shorter walk', 'Slower flat walk', 'Full rest day'],
    postureNotes:
      'Walk tall without forcing a rigid posture. Keep the ribs comfortably over the pelvis and avoid looking down at a phone for long periods.',
    demoLinks: demos('easy recovery walking posture'),
    relatedWorkoutDays: [7],
  },
  ...v21ExerciseLibrary,
]

// ---------------------------------------------------------------------------
// Exercise media (Step 18)
//
// One place to add or replace images and videos. Keyed by exercise id.
//  - Every bundled exercise has a matching PNG at
//    "/exercise-images/<exercise-id>.png" so the full library works offline.
//    An explicit non-placeholder imageUrl below can still override it.
//  - videoUrl: MUST be an embeddable URL (https://www.youtube.com/embed/ID).
//    Normal watch/youtu.be/shorts URLs are auto-converted by mediaUtils, but
//    never put a search/results URL here.
// Exercises without an entry still receive their matching bundled image and
// show "Video guide not added yet".
// ---------------------------------------------------------------------------
const exerciseMedia: Record<string, ExerciseMedia> = {
  // ---------------------------------------------------------------- Chest
  'bench-press': {
    imageUrl: '/exercise-images/bench-press.png',
    imageAlt: 'Barbell bench press setup on a flat bench',
    videoUrl: 'https://www.youtube.com/embed/4Y2ZdHCOXok',
    videoType: 'youtube',
    videoTitle: 'Bench Press Form Guide',
  },
  'weighted-push-up': {
    imageUrl: '/exercise-images/weighted-push-up.png',
    imageAlt: 'Push-up with a weighted backpack on the upper back',
    videoUrl: 'https://www.youtube.com/embed/_M0YXeKNB5s',
    videoType: 'youtube',
    videoTitle: 'Weighted Push-up (Backpack) Form Guide',
  },
  'feet-elevated-push-up': {
    imageUrl: '/exercise-images/feet-elevated-push-up.png',
    imageAlt: 'Decline push-up with feet elevated on a bench',
    videoUrl: 'https://www.youtube.com/embed/SKPab2YC8BE',
    videoType: 'youtube',
    videoTitle: 'Feet-elevated (Decline) Push-up Form Guide',
  },
  dips: {
    imageUrl: '/exercise-images/dips.png',
    imageAlt: 'Chest dips on parallel bars with a slight forward lean',
    videoUrl: 'https://www.youtube.com/embed/yN6Q1UI_xkE',
    videoType: 'youtube',
    videoTitle: 'Dips Form Guide (Chest Focus)',
  },
  'incline-dumbbell-press': {
    imageUrl: '/exercise-placeholders/chest.svg',
    imageAlt: 'Incline dumbbell press on a 30-degree bench',
    videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
    videoType: 'youtube',
    videoTitle: 'Incline Dumbbell Press Form Guide',
  },
  'dumbbell-fly': {
    imageUrl: '/exercise-placeholders/chest.svg',
    imageAlt: 'Flat bench dumbbell fly with a fixed elbow bend',
    videoUrl: 'https://www.youtube.com/embed/QENKPHhQVi4',
    videoType: 'youtube',
    videoTitle: 'Dumbbell Fly Form Guide',
  },
  'diamond-push-up': {
    imageUrl: '/exercise-placeholders/chest.svg',
    imageAlt: 'Diamond push-up with hands forming a triangle',
    videoUrl: 'https://www.youtube.com/embed/J0DnG1_S92I',
    videoType: 'youtube',
    videoTitle: 'Diamond Push-up Form Guide',
  },

  // ----------------------------------------------------------------- Back
  'pull-up': {
    imageUrl: '/exercise-placeholders/back.svg',
    imageAlt: 'Pull-up on a bar with an overhand grip',
    videoUrl: 'https://www.youtube.com/embed/MhokcbRLP5w',
    videoType: 'youtube',
    videoTitle: 'Pull-up Form Guide',
  },
  'weighted-pull-up': {
    imageUrl: '/exercise-placeholders/back.svg',
    imageAlt: 'Weighted pull-up with a backpack or dip belt',
    videoUrl: 'https://www.youtube.com/embed/HuuyDNGrCI8',
    videoType: 'youtube',
    videoTitle: 'Weighted Pull-up Form Guide',
  },
  'chin-up': {
    imageUrl: '/exercise-placeholders/back.svg',
    imageAlt: 'Chin-up with an underhand shoulder-width grip',
    videoUrl: 'https://www.youtube.com/embed/e1YSApl-QcM',
    videoType: 'youtube',
    videoTitle: 'Chin-up Form Guide',
  },
  'barbell-row': {
    imageUrl: '/exercise-placeholders/back.svg',
    imageAlt: 'Bent-over barbell row with a flat back',
    videoUrl: 'https://www.youtube.com/embed/kBWAon7ItDw',
    videoType: 'youtube',
    videoTitle: 'Barbell Row Form Guide',
  },
  'one-arm-dumbbell-row': {
    imageUrl: '/exercise-placeholders/back.svg',
    imageAlt: 'One-arm dumbbell row supported on a bench',
    videoUrl: 'https://www.youtube.com/embed/pYcpY20QaE8',
    videoType: 'youtube',
    videoTitle: 'One-arm Dumbbell Row Form Guide',
  },
  'inverted-row': {
    imageUrl: '/exercise-placeholders/back.svg',
    imageAlt: 'Inverted bodyweight row under a low bar',
    videoUrl: 'https://www.youtube.com/embed/GdyhjXlxE-U',
    videoType: 'youtube',
    videoTitle: 'Inverted Row Form Guide',
  },

  // ------------------------------------------------------------ Shoulders
  'dumbbell-shoulder-press': {
    imageUrl: '/exercise-placeholders/shoulders.svg',
    imageAlt: 'Dumbbell shoulder press with ribs down',
    videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
    videoType: 'youtube',
    videoTitle: 'Dumbbell Shoulder Press Form Guide',
  },
  'pike-push-up': {
    imageUrl: '/exercise-placeholders/shoulders.svg',
    imageAlt: 'Pike push-up in an A-shape with hips high',
    videoUrl: 'https://www.youtube.com/embed/2b5t0Cu2nQI',
    videoType: 'youtube',
    videoTitle: 'Pike Push-up Form Guide',
  },
  'dumbbell-lateral-raise': {
    imageUrl: '/exercise-placeholders/shoulders.svg',
    imageAlt: 'Dumbbell lateral raise to shoulder height',
    videoUrl: 'https://www.youtube.com/embed/XNKqPCDtC1k',
    videoType: 'youtube',
    videoTitle: 'Dumbbell Lateral Raise Form Guide',
  },
  'rear-delt-raise': {
    imageUrl: '/exercise-placeholders/shoulders.svg',
    imageAlt: 'Bent-over rear delt raise with light dumbbells',
    videoUrl: 'https://www.youtube.com/embed/rQhdsa5QdVU',
    videoType: 'youtube',
    videoTitle: 'Rear Delt Raise Form Guide',
  },

  // ----------------------------------------------------------------- Legs
  squat: {
    imageUrl: '/exercise-placeholders/legs.svg',
    imageAlt: 'Barbell squat with knees tracking over toes',
    videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg',
    videoType: 'youtube',
    videoTitle: 'Squat Form Guide',
  },
  'romanian-deadlift': {
    imageUrl: '/exercise-placeholders/legs.svg',
    imageAlt: 'Romanian deadlift hip hinge with a flat back',
    videoUrl: 'https://www.youtube.com/embed/uhghy9pFIPY',
    videoType: 'youtube',
    videoTitle: 'Romanian Deadlift Form Guide',
  },
  'bulgarian-split-squat': {
    imageUrl: '/exercise-placeholders/legs.svg',
    imageAlt: 'Bulgarian split squat with rear foot on a bench',
    videoUrl: 'https://www.youtube.com/embed/DeCnHqrN22U',
    videoType: 'youtube',
    videoTitle: 'Bulgarian Split Squat Form Guide',
  },
  'glute-bridge': {
    imageUrl: '/exercise-placeholders/legs.svg',
    imageAlt: 'Glute bridge with hips lifted and ribs down',
    videoUrl: 'https://www.youtube.com/embed/wPM8icPu6H8',
    videoType: 'youtube',
    videoTitle: 'Glute Bridge Form Guide',
  },
  'hip-thrust': {
    imageUrl: '/exercise-placeholders/legs.svg',
    imageAlt: 'Hip thrust with upper back on a bench',
    videoUrl: 'https://www.youtube.com/embed/pBH7pKHn-dI',
    videoType: 'youtube',
    videoTitle: 'Hip Thrust Form Guide',
  },

  // ------------------------------------------------------------------ Abs
  'hanging-knee-raise': {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Hanging knee raise with a pelvic curl',
    videoUrl: 'https://www.youtube.com/embed/G6a5267YpHM',
    videoType: 'youtube',
    videoTitle: 'Hanging Knee Raise Form Guide',
  },
  'lying-leg-raise': {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Lying leg raise with the lower back pressed flat',
    videoUrl: 'https://www.youtube.com/embed/xJJu-WiROM8',
    videoType: 'youtube',
    videoTitle: 'Lying Leg Raise Form Guide',
  },
  'reverse-crunch': {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Reverse crunch curling the hips off the floor',
    videoUrl: 'https://www.youtube.com/embed/yH-oSzE5_g0',
    videoType: 'youtube',
    videoTitle: 'Reverse Crunch Form Guide',
  },
  plank: {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Forearm plank in a straight line head to heels',
    videoUrl: 'https://www.youtube.com/embed/mH5Sfb_KTGg',
    videoType: 'youtube',
    videoTitle: 'Plank Form Guide',
  },
  'side-plank': {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Side plank with stacked hips and lifted waist',
    videoUrl: 'https://www.youtube.com/embed/XeN4pEZZJNI',
    videoType: 'youtube',
    videoTitle: 'Side Plank Form Guide',
  },
  'hollow-body-hold': {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Hollow body hold with the lower back pinned down',
    videoUrl: 'https://www.youtube.com/embed/0yPin8hSc8o',
    videoType: 'youtube',
    videoTitle: 'Hollow Body Hold Form Guide',
  },
  'dead-bug': {
    imageUrl: '/exercise-placeholders/abs.svg',
    imageAlt: 'Dead bug with opposite arm and leg extended',
    videoUrl: 'https://www.youtube.com/embed/bxn9FBrt4-A',
    videoType: 'youtube',
    videoTitle: 'Dead Bug Form Guide',
  },

  // -------------------------------------------------------------- Posture
  'posterior-pelvic-tilt': {
    imageUrl: '/exercise-placeholders/posture.svg',
    imageAlt: 'Posterior pelvic tilt flattening the lower back',
    videoUrl: 'https://www.youtube.com/embed/D00Ixukw8bw',
    videoType: 'youtube',
    videoTitle: 'Posterior Pelvic Tilt Form Guide',
  },
  'hip-flexor-stretch': {
    imageUrl: '/exercise-placeholders/posture.svg',
    imageAlt: 'Half-kneeling hip flexor stretch with a pelvic tuck',
    videoUrl: 'https://www.youtube.com/embed/Bfb-9dIWEr4',
    videoType: 'youtube',
    videoTitle: 'Hip Flexor Stretch Form Guide',
  },
  'plank-with-glute-squeeze': {
    imageUrl: '/exercise-placeholders/posture.svg',
    imageAlt: 'Forearm plank with glutes squeezed and pelvis tucked',
    videoUrl: 'https://www.youtube.com/embed/A2b2EmIg0dA',
    videoType: 'youtube',
    videoTitle: 'Plank with Glute Squeeze Form Guide',
  },

  // --------------------------------------------------------- Conditioning
  'treadmill-incline-walk': {
    imageUrl: '/exercise-placeholders/conditioning.svg',
    imageAlt: 'Walking tall on an inclined treadmill',
    videoUrl: 'https://www.youtube.com/embed/NAsObfFJXvE',
    videoType: 'youtube',
    videoTitle: 'Treadmill Incline Walk Guide (12-3-30)',
  },
  'skipping-rope': {
    imageUrl: '/exercise-placeholders/conditioning.svg',
    imageAlt: 'Skipping rope with small bounces on the balls of the feet',
    videoUrl: 'https://www.youtube.com/embed/_UTR1VWg8WY',
    videoType: 'youtube',
    videoTitle: 'Skipping Rope Beginner Guide',
  },
  'vr-boxing': {
    imageUrl: '/exercise-placeholders/conditioning.svg',
    imageAlt: 'VR boxing stance with guard up',
    videoUrl: '',
    videoType: 'none',
    videoTitle: '',
  },
}

/** Default library with its bundled image plus any richer media metadata. */
export const exerciseLibrary: LibraryExercise[] = baseExerciseLibrary.map(
  (exercise) => {
    const media = exerciseMedia[exercise.id]
    const exerciseImageUrl = exercise.imageUrl?.trim()
    const configuredImageUrl = media?.imageUrl?.trim() || exerciseImageUrl
    const usesLegacyPlaceholder = configuredImageUrl?.startsWith(
      '/exercise-placeholders/',
    )
    const hasExerciseLevelPlaceholder =
      Boolean(exerciseImageUrl) && configuredImageUrl === exerciseImageUrl

    return {
      ...exercise,
      videoType: 'none',
      ...media,
      imageUrl:
        configuredImageUrl &&
        (!usesLegacyPlaceholder || hasExerciseLevelPlaceholder)
          ? configuredImageUrl
          : `/exercise-images/${exercise.id}.png`,
      imageAlt:
        media?.imageAlt?.trim() ||
        exercise.imageAlt?.trim() ||
        `${exercise.name} exercise form demonstration`,
    }
  },
)

/**
 * Conservative legacy IDs approved for historical performance identity.
 * Guide-only compatibility mappings stay in workoutIdToLibraryId below and
 * must not automatically combine strength records.
 */
export const historicalExerciseIdAliases: Readonly<Record<string, string>> =
  Object.freeze({
    'pull-ups': 'pull-up',
    'chin-ups': 'chin-up',
    'barbell-row-volume': 'barbell-row',
    'dead-bug-rounds': 'dead-bug',
    'side-plank-rounds': 'side-plank',
    'lateral-raise': 'dumbbell-lateral-raise',
    'hanging-knee-raise-leg-raise': 'hanging-knee-raise',
    'dumbbell-fly-squeeze-press': 'dumbbell-fly',
    'triceps-extension-skull-crusher': 'triceps-extension',
    'optional-vr-boxing-skipping-rope': 'vr-boxing',
    'pike-push-up-dumbbell-shoulder-press': 'pike-push-up',
    'weighted-glute-bridge-hip-thrust': 'hip-thrust',
  })

// Map from workoutPlan.ts exercise ids to library exercise ids. Some workout
// entries pair two movements (e.g. "Triceps Extension / Skull Crusher"); those
// point at the primary library exercise for the guide.
const workoutIdToLibraryId: Record<string, string> = {
  ...historicalExerciseIdAliases,
  'bench-press': 'bench-press',
  'weighted-push-up': 'weighted-push-up',
  dips: 'dips',
  'incline-dumbbell-press': 'incline-dumbbell-press',
  'dumbbell-lateral-raise': 'dumbbell-lateral-raise',
  'diamond-push-up': 'diamond-push-up',
  'dead-bug': 'dead-bug',
  'barbell-row': 'barbell-row',
  'one-arm-dumbbell-row': 'one-arm-dumbbell-row',
  'rear-delt-raise': 'rear-delt-raise',
  'barbell-dumbbell-curl': 'barbell-curl',
  'hollow-body-hold': 'hollow-body-hold',
  squat: 'squat',
  'romanian-deadlift': 'romanian-deadlift',
  'bulgarian-split-squat': 'bulgarian-split-squat',
  'glute-bridge': 'glute-bridge',
  'calf-raise': 'calf-raise',
  'hanging-knee-raise': 'hanging-knee-raise',
  'side-plank': 'side-plank',
  'hip-flexor-stretch': 'hip-flexor-stretch',
  'feet-elevated-push-up': 'feet-elevated-push-up',
  'posterior-pelvic-tilt': 'posterior-pelvic-tilt',
  'weighted-pull-up': 'weighted-pull-up',
  'dumbbell-pullover': 'dumbbell-pullover',
  'inverted-row': 'inverted-row',
  'hammer-curl': 'hammer-curl',
  'reverse-crunch': 'reverse-crunch',
  'plank-with-glute-squeeze': 'plank-with-glute-squeeze',
  'treadmill-incline-walk': 'treadmill-incline-walk',
}

/**
 * Defensive copy of the explicit workout-plan ID compatibility map.
 *
 * Historical identity resolution reuses this list so legacy plan IDs have one
 * source of truth. Callers receive a new object and cannot mutate library
 * lookup behavior.
 */
export function getHistoricalExerciseIdAliases(): Record<string, string> {
  return { ...historicalExerciseIdAliases }
}

const exerciseById = new Map(
  exerciseLibrary.map((exercise) => [exercise.id, exercise]),
)

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bups\b/g, 'up')
    .replace(/\bs\b/g, '')
    .trim()
}

const exerciseByNormalizedName = new Map(
  exerciseLibrary.map((exercise) => [normalizeName(exercise.name), exercise]),
)

/**
 * Find the library entry that matches a workout-plan exercise. Tries the
 * explicit alias map first, then a direct id match, then a normalized-name
 * match. Returns undefined when there is no guide (e.g. light walking).
 */
export function findLibraryExerciseForWorkout(workout: {
  id: string
  name: string
}): LibraryExercise | undefined {
  const aliasId = workoutIdToLibraryId[workout.id]
  if (aliasId) {
    const byAlias = exerciseById.get(aliasId)
    if (byAlias) {
      return byAlias
    }
  }

  const byId = exerciseById.get(workout.id)
  if (byId) {
    return byId
  }

  return exerciseByNormalizedName.get(normalizeName(workout.name))
}

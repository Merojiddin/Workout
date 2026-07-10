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
    regression: ['Bar higher (more upright)', 'Bent-knee inverted row', 'Band row'],
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
    regression: ['Band pullover', 'Light dumbbell pullover', 'Lat prayer/stretch'],
    postureNotes:
      'The most common fault is flaring the ribs and arching the lower back. Keep ribs down and abs tight through the stretch.',
    demoLinks: demos('dumbbell pullover'),
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
    regression: ['Seated press with back support', 'Pike push-up', 'Band press'],
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
    regression: ['Wall/box pike hold', 'Incline pike push-up', 'Dumbbell press'],
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
    regression: ['Seated lateral raise', 'Leaning cable/band raise', 'Partial raise'],
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
    regression: ['Short-range bridge', 'Glute squeeze (no lift)', 'Wall bridge'],
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
    regression: ['Flat-floor calf raise', 'Supported calf raise', 'Seated calf raise'],
    postureNotes:
      'Stand tall with ribs down and a neutral spine; keep the core lightly braced for balance.',
    demoLinks: demos('calf raise'),
    relatedWorkoutDays: [3],
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
    regression: ['Lying leg raise', 'Reverse crunch', 'Captain-chair knee raise'],
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
    formCue: 'Press the lower back to the floor, lower legs only as far as you can hold it.',
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
    regression: ['Standing hip flexor stretch', 'Shorter hold', 'Supported stretch'],
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
]

// ---------------------------------------------------------------------------
// Exercise media (Step 18)
//
// One place to add or replace images and videos. Keyed by exercise id.
//  - imageUrl: local placeholder now ("/exercise-placeholders/*.svg" works
//    offline); swap in your own photo URL later.
//  - videoUrl: MUST be an embeddable URL (https://www.youtube.com/embed/ID).
//    Normal watch/youtu.be/shorts URLs are auto-converted by mediaUtils, but
//    never put a search/results URL here.
// Exercises without an entry fall back to their category placeholder image
// and show "Video guide not added yet".
// ---------------------------------------------------------------------------
const exerciseMedia: Record<string, ExerciseMedia> = {
  // ---------------------------------------------------------------- Chest
  'bench-press': {
    imageUrl: '/exercise-placeholders/chest.svg',
    imageAlt: 'Barbell bench press setup on a flat bench',
    videoUrl: 'https://www.youtube.com/embed/4Y2ZdHCOXok',
    videoType: 'youtube',
    videoTitle: 'Bench Press Form Guide',
  },
  'weighted-push-up': {
    imageUrl: '/exercise-placeholders/chest.svg',
    imageAlt: 'Push-up with a weighted backpack on the upper back',
    videoUrl: 'https://www.youtube.com/embed/_M0YXeKNB5s',
    videoType: 'youtube',
    videoTitle: 'Weighted Push-up (Backpack) Form Guide',
  },
  'feet-elevated-push-up': {
    imageUrl: '/exercise-placeholders/chest.svg',
    imageAlt: 'Decline push-up with feet elevated on a bench',
    videoUrl: 'https://www.youtube.com/embed/SKPab2YC8BE',
    videoType: 'youtube',
    videoTitle: 'Feet-elevated (Decline) Push-up Form Guide',
  },
  dips: {
    imageUrl: '/exercise-placeholders/chest.svg',
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

/** Default library with media merged in. */
export const exerciseLibrary: LibraryExercise[] = baseExerciseLibrary.map(
  (exercise) => ({
    ...exercise,
    videoType: 'none',
    ...exerciseMedia[exercise.id],
  }),
)

// Map from workoutPlan.ts exercise ids to library exercise ids. Some workout
// entries pair two movements (e.g. "Triceps Extension / Skull Crusher"); those
// point at the primary library exercise for the guide.
const workoutIdToLibraryId: Record<string, string> = {
  'bench-press': 'bench-press',
  'weighted-push-up': 'weighted-push-up',
  dips: 'dips',
  'incline-dumbbell-press': 'incline-dumbbell-press',
  'dumbbell-lateral-raise': 'dumbbell-lateral-raise',
  'lateral-raise': 'dumbbell-lateral-raise',
  'diamond-push-up': 'diamond-push-up',
  'dead-bug': 'dead-bug',
  'dead-bug-rounds': 'dead-bug',
  'pull-ups': 'pull-up',
  'barbell-row': 'barbell-row',
  'barbell-row-volume': 'barbell-row',
  'one-arm-dumbbell-row': 'one-arm-dumbbell-row',
  'chin-ups': 'chin-up',
  'rear-delt-raise': 'rear-delt-raise',
  'barbell-dumbbell-curl': 'barbell-curl',
  'hollow-body-hold': 'hollow-body-hold',
  squat: 'squat',
  'romanian-deadlift': 'romanian-deadlift',
  'bulgarian-split-squat': 'bulgarian-split-squat',
  'weighted-glute-bridge-hip-thrust': 'hip-thrust',
  'glute-bridge': 'glute-bridge',
  'calf-raise': 'calf-raise',
  'hanging-knee-raise': 'hanging-knee-raise',
  'hanging-knee-raise-leg-raise': 'hanging-knee-raise',
  'side-plank': 'side-plank',
  'side-plank-rounds': 'side-plank',
  'hip-flexor-stretch': 'hip-flexor-stretch',
  'feet-elevated-push-up': 'feet-elevated-push-up',
  'dumbbell-fly-squeeze-press': 'dumbbell-fly',
  'pike-push-up-dumbbell-shoulder-press': 'pike-push-up',
  'posterior-pelvic-tilt': 'posterior-pelvic-tilt',
  'weighted-pull-up': 'weighted-pull-up',
  'dumbbell-pullover': 'dumbbell-pullover',
  'inverted-row': 'inverted-row',
  'hammer-curl': 'hammer-curl',
  'triceps-extension-skull-crusher': 'triceps-extension',
  'reverse-crunch': 'reverse-crunch',
  'plank-with-glute-squeeze': 'plank-with-glute-squeeze',
  'treadmill-incline-walk': 'treadmill-incline-walk',
  'optional-vr-boxing-skipping-rope': 'vr-boxing',
}

const exerciseById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]))

export function getLibraryExerciseById(id: string): LibraryExercise | undefined {
  return exerciseById.get(id)
}

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

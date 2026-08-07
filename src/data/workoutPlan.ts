export type TrainingLocation = 'home' | 'gym'

export interface ExerciseVariant {
  id: string
  name: string
  equipment: string
  /** Optional variation-specific target when a substitution uses another range. */
  repRange?: string
  duration?: string
  formTips?: string[]
}

export interface ExerciseAlternatives {
  home?: ExerciseVariant[]
  gym?: ExerciseVariant[]
}

export interface ExercisePhaseTarget {
  weeks: number[]
  sets?: number
  repRange?: string
  duration?: string
  guidance?: string[]
}

export interface Exercise {
  /** Home/gym choices for one movement slot. Only selected variants are logged. */
  alternatives?: ExerciseAlternatives
  /** Optional slots are excluded until the user explicitly includes them. */
  optional?: boolean
  /** Multi-select is reserved for short choose-a-few recovery routines. */
  selectionMode?: 'single' | 'multiple'
  minSelections?: number
  maxSelections?: number
  defaultVariantIds?: string[]
  /** Week-specific prescriptions such as boxing round progressions. */
  phaseTargets?: ExercisePhaseTarget[]
  guidance?: string[]
  targetRir?: string
  duration?: string
  equipment: string
  formTips: string[]
  id: string
  muscleGroup: string
  name: string
  repRange?: string
  restSeconds: number
  sets: number
}

export interface WorkoutDay {
  day: number
  estimatedTime: string
  exercises: Exercise[]
  focus: string[]
  name: string
}

const defaultFormTips = [
  'Keep ribs down',
  'Abs tight',
  'Control the lowering',
  'Stop 1-2 reps before form breaks',
]

const postureTips = [
  'Ribs down',
  'Abs tight',
  'Glutes slightly squeezed',
  'Do not over-arch lower back',
  'Move slowly enough to feel control',
]

const pullTips = [
  'Start with shoulders down',
  'Pull elbows toward ribs',
  'Keep chest tall',
  'Control the lowering',
  'Do not swing',
]

export const weeklyPlan: WorkoutDay[] = [
  {
    day: 1,
    name: 'Chest Heavy + Shoulders + Triceps',
    estimatedTime: '45-60 min',
    focus: ['Chest', 'Shoulders', 'Triceps', 'Abs'],
    exercises: [
      {
        equipment: 'Barbell / Bench',
        formTips: [
          'Set shoulder blades back and down',
          'Keep feet planted',
          'Lower under control',
          'Press without bouncing',
          'Keep ribs down between reps',
        ],
        id: 'bench-press',
        muscleGroup: 'Chest',
        name: 'Bench Press',
        repRange: '6-10',
        restSeconds: 150,
        sets: 4,
      },
      {
        equipment: 'Backpack / Bodyweight',
        formTips: [
          'Keep ribs down',
          'Abs tight',
          'Do not let lower back arch',
          'Lower under control',
          'Stop 1-2 reps before form breaks',
        ],
        id: 'weighted-push-up',
        muscleGroup: 'Chest',
        name: 'Weighted Push-up',
        repRange: '8-15',
        restSeconds: 90,
        sets: 4,
      },
      {
        equipment: 'Dip bars',
        formTips: [
          'Lean slightly forward',
          'Keep shoulders away from ears',
          'Control the bottom',
          'Press through palms',
          'Stop before shoulder pain',
        ],
        id: 'dips',
        muscleGroup: 'Chest / Triceps',
        name: 'Dips',
        repRange: '6-12',
        restSeconds: 120,
        sets: 3,
      },
      {
        equipment: 'Dumbbells / Incline bench',
        formTips: [
          'Set bench to a modest incline',
          'Keep elbows slightly tucked',
          'Lower dumbbells evenly',
          'Press up and in',
          'Keep upper chest active',
        ],
        id: 'incline-dumbbell-press',
        muscleGroup: 'Upper chest',
        name: 'Incline Dumbbell Press',
        repRange: '8-12',
        restSeconds: 120,
        sets: 3,
      },
      {
        equipment: 'Dumbbells',
        formTips: [
          'Lead with elbows',
          'Use light controlled reps',
          'Stop at shoulder height',
          'Do not shrug',
          'Keep torso still',
        ],
        id: 'dumbbell-lateral-raise',
        muscleGroup: 'Shoulders',
        name: 'Dumbbell Lateral Raise',
        repRange: '12-20',
        restSeconds: 60,
        sets: 3,
      },
      {
        equipment: 'Bodyweight',
        formTips: defaultFormTips,
        id: 'diamond-push-up',
        muscleGroup: 'Triceps / Chest',
        name: 'Diamond Push-up',
        repRange: '10-15',
        restSeconds: 75,
        sets: 2,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'dead-bug',
        muscleGroup: 'Abs / Posture',
        name: 'Dead Bug',
        repRange: '10 each side',
        restSeconds: 45,
        sets: 3,
      },
    ],
  },
  {
    day: 2,
    name: 'Back + Biceps',
    estimatedTime: '45-60 min',
    focus: ['Back', 'Biceps', 'Rear delts', 'Abs'],
    exercises: [
      {
        equipment: 'Pull-up bar',
        formTips: pullTips,
        id: 'pull-ups',
        muscleGroup: 'Back',
        name: 'Pull-ups',
        repRange: '6-10',
        restSeconds: 120,
        sets: 4,
      },
      {
        equipment: 'Barbell',
        formTips: [
          'Hinge and brace first',
          'Keep spine neutral',
          'Pull bar toward lower ribs',
          'Do not jerk the weight',
          'Control the lowering',
        ],
        id: 'barbell-row',
        muscleGroup: 'Back',
        name: 'Barbell Row',
        repRange: '8-12',
        restSeconds: 120,
        sets: 4,
      },
      {
        equipment: 'Dumbbell / Bench',
        formTips: pullTips,
        id: 'one-arm-dumbbell-row',
        muscleGroup: 'Back',
        name: 'One-arm Dumbbell Row',
        repRange: '10-12 each side',
        restSeconds: 90,
        sets: 3,
      },
      {
        equipment: 'Pull-up bar',
        formTips: pullTips,
        id: 'chin-ups',
        muscleGroup: 'Back / Biceps',
        name: 'Chin-ups',
        repRange: '8-12',
        restSeconds: 120,
        sets: 3,
      },
      {
        equipment: 'Dumbbells',
        formTips: [
          'Hinge slightly forward',
          'Keep neck relaxed',
          'Raise with rear delts',
          'Use light control',
          'Avoid swinging',
        ],
        id: 'rear-delt-raise',
        muscleGroup: 'Rear delts',
        name: 'Rear Delt Raise',
        repRange: '15-20',
        restSeconds: 60,
        sets: 3,
      },
      {
        equipment: 'Barbell / Dumbbells',
        formTips: [
          'Keep elbows near ribs',
          'Do not lean back',
          'Squeeze at the top',
          'Lower slowly',
          'Stop before shoulder moves forward',
        ],
        id: 'barbell-dumbbell-curl',
        muscleGroup: 'Biceps',
        name: 'Barbell/Dumbbell Curl',
        repRange: '8-12',
        restSeconds: 75,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'hollow-body-hold',
        muscleGroup: 'Abs',
        name: 'Hollow Body Hold',
        duration: '20-40 sec',
        restSeconds: 45,
        sets: 3,
      },
    ],
  },
  {
    day: 3,
    name: 'Legs + Abs + Posture',
    estimatedTime: '50-60 min',
    focus: ['Legs', 'Glutes', 'Abs', 'Posture'],
    exercises: [
      {
        equipment: 'Barbell / Dumbbells',
        formTips: [
          'Brace before every rep',
          'Keep knees tracking toes',
          'Stay balanced mid-foot',
          'Control depth',
          'Do not collapse forward',
        ],
        id: 'squat',
        muscleGroup: 'Legs',
        name: 'Squat',
        repRange: '8-12',
        restSeconds: 150,
        sets: 4,
      },
      {
        equipment: 'Barbell / Dumbbells',
        formTips: [
          'Hinge at hips',
          'Keep lats tight',
          'Soft knees',
          'Feel hamstrings stretch',
          'Stand tall without over-arching',
        ],
        id: 'romanian-deadlift',
        muscleGroup: 'Hamstrings / Glutes',
        name: 'Romanian Deadlift',
        repRange: '8-12',
        restSeconds: 120,
        sets: 4,
      },
      {
        equipment: 'Dumbbells / Bench',
        formTips: [
          'Take a stable split stance',
          'Control the drop',
          'Drive through front foot',
          'Keep torso tall',
          'Do both sides evenly',
        ],
        id: 'bulgarian-split-squat',
        muscleGroup: 'Legs',
        name: 'Bulgarian Split Squat',
        repRange: '8-12 each leg',
        restSeconds: 90,
        sets: 3,
      },
      {
        equipment: 'Barbell / Dumbbell / Bench',
        formTips: postureTips,
        id: 'weighted-glute-bridge-hip-thrust',
        muscleGroup: 'Glutes',
        name: 'Weighted Glute Bridge / Hip Thrust',
        repRange: '10-15',
        restSeconds: 90,
        sets: 4,
      },
      {
        equipment: 'Bodyweight / Dumbbells',
        formTips: [
          'Use full range',
          'Pause at the top',
          'Lower slowly',
          'Keep ankles controlled',
          'Do not bounce',
        ],
        id: 'calf-raise',
        muscleGroup: 'Calves',
        name: 'Calf Raise',
        repRange: '15-25',
        restSeconds: 45,
        sets: 3,
      },
      {
        equipment: 'Pull-up bar',
        formTips: postureTips,
        id: 'hanging-knee-raise',
        muscleGroup: 'Abs',
        name: 'Hanging Knee Raise',
        repRange: '10-15',
        restSeconds: 60,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'side-plank',
        muscleGroup: 'Abs / Obliques',
        name: 'Side Plank',
        duration: '30-45 sec each side',
        restSeconds: 45,
        sets: 2,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: [
          'Squeeze glute on back leg',
          'Keep ribs down',
          'Do not arch lower back',
          'Breathe slowly',
          'Hold steady tension',
        ],
        id: 'hip-flexor-stretch',
        muscleGroup: 'Mobility / Posture',
        name: 'Hip Flexor Stretch',
        duration: '45 sec each side',
        restSeconds: 30,
        sets: 2,
      },
    ],
  },
  {
    day: 4,
    name: 'Chest Volume + Shoulders',
    estimatedTime: '45-60 min',
    focus: ['Chest', 'Shoulders', 'Upper body', 'Posture'],
    exercises: [
      {
        equipment: 'Dumbbells / Incline bench',
        formTips: [
          'Set shoulder blades back',
          'Lower with control',
          'Keep elbows slightly tucked',
          'Press smoothly',
          'Keep ribs down',
        ],
        id: 'incline-dumbbell-press',
        muscleGroup: 'Upper chest',
        name: 'Incline Dumbbell Press',
        repRange: '8-12',
        restSeconds: 120,
        sets: 4,
      },
      {
        equipment: 'Bodyweight',
        formTips: defaultFormTips,
        id: 'feet-elevated-push-up',
        muscleGroup: 'Chest',
        name: 'Feet-elevated Push-up',
        repRange: '10-20',
        restSeconds: 90,
        sets: 4,
      },
      {
        equipment: 'Dumbbells / Bench',
        formTips: [
          'Use a small elbow bend',
          'Open chest slowly',
          'Do not overstretch shoulders',
          'Squeeze chest together',
          'Keep abs tight',
        ],
        id: 'dumbbell-fly-squeeze-press',
        muscleGroup: 'Chest',
        name: 'Dumbbell Fly / Squeeze Press',
        repRange: '12-15',
        restSeconds: 75,
        sets: 3,
      },
      {
        equipment: 'Dip bars',
        formTips: [
          'Lean slightly forward',
          'Keep shoulders controlled',
          'Lower under control',
          'Press without shrugging',
          'Stop before pain',
        ],
        id: 'dips',
        muscleGroup: 'Chest / Triceps',
        name: 'Dips',
        repRange: '8-12',
        restSeconds: 90,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Dumbbells',
        formTips: [
          'Keep ribs down',
          'Brace abs',
          'Press overhead under control',
          'Do not flare lower back',
          'Stop with good shoulder position',
        ],
        id: 'pike-push-up-dumbbell-shoulder-press',
        muscleGroup: 'Shoulders',
        name: 'Pike Push-up / Dumbbell Shoulder Press',
        repRange: '8-12',
        restSeconds: 90,
        sets: 3,
      },
      {
        equipment: 'Dumbbells',
        formTips: [
          'Lead with elbows',
          'Keep wrists neutral',
          'Stop at shoulder height',
          'Avoid shrugging',
          'Use steady tempo',
        ],
        id: 'lateral-raise',
        muscleGroup: 'Shoulders',
        name: 'Lateral Raise',
        repRange: '15-20',
        restSeconds: 60,
        sets: 4,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'posterior-pelvic-tilt',
        muscleGroup: 'Posture / Abs',
        name: 'Posterior Pelvic Tilt',
        repRange: '15',
        restSeconds: 45,
        sets: 3,
      },
    ],
  },
  {
    day: 5,
    name: 'Back + Arms + Abs',
    estimatedTime: '45-60 min',
    focus: ['Back', 'Arms', 'Abs', 'Upper body'],
    exercises: [
      {
        equipment: 'Pull-up bar / Backpack',
        formTips: pullTips,
        id: 'weighted-pull-up',
        muscleGroup: 'Back',
        name: 'Weighted Pull-up',
        repRange: '6-10',
        restSeconds: 150,
        sets: 4,
      },
      {
        equipment: 'Barbell',
        formTips: [
          'Brace torso',
          'Pull toward lower ribs',
          'Control every rep',
          'Keep neck neutral',
          'Do not yank from lower back',
        ],
        id: 'barbell-row-volume',
        muscleGroup: 'Back',
        name: 'Barbell Row',
        repRange: '10-15',
        restSeconds: 100,
        sets: 3,
      },
      {
        equipment: 'Dumbbell / Bench',
        formTips: [
          'Keep ribs down',
          'Move through shoulders',
          'Feel lats stretch',
          'Avoid flaring ribs',
          'Control the top',
        ],
        id: 'dumbbell-pullover',
        muscleGroup: 'Lats / Chest',
        name: 'Dumbbell Pullover',
        repRange: '10-15',
        restSeconds: 75,
        sets: 3,
      },
      {
        equipment: 'Bar / Table / Rings',
        formTips: pullTips,
        id: 'inverted-row',
        muscleGroup: 'Back',
        name: 'Inverted Row',
        repRange: '10-15',
        restSeconds: 75,
        sets: 3,
      },
      {
        equipment: 'Dumbbells',
        formTips: [
          'Keep elbows close',
          'Use full control',
          'Do not swing',
          'Squeeze forearms and biceps',
          'Lower slowly',
        ],
        id: 'hammer-curl',
        muscleGroup: 'Biceps / Forearms',
        name: 'Hammer Curl',
        repRange: '10-12',
        restSeconds: 60,
        sets: 3,
      },
      {
        equipment: 'Dumbbell / Barbell',
        formTips: [
          'Keep elbows stable',
          'Control the lowering',
          'Do not flare ribs',
          'Press smoothly',
          'Stop before elbow discomfort',
        ],
        id: 'triceps-extension-skull-crusher',
        muscleGroup: 'Triceps',
        name: 'Triceps Extension / Skull Crusher',
        repRange: '10-12',
        restSeconds: 75,
        sets: 3,
      },
      {
        equipment: 'Pull-up bar / Mat',
        formTips: postureTips,
        id: 'hanging-knee-raise-leg-raise',
        muscleGroup: 'Abs',
        name: 'Hanging Knee Raise / Leg Raise',
        repRange: '10-15',
        restSeconds: 60,
        sets: 3,
      },
    ],
  },
  {
    day: 6,
    name: 'Fat Control + Abs + Posture',
    estimatedTime: '35-55 min',
    focus: ['Fat control', 'Abs', 'Posture', 'Conditioning'],
    exercises: [
      {
        duration: '25-35 minutes',
        equipment: 'Treadmill',
        formTips: [
          'Use incline instead of running',
          'Keep steps smooth',
          'Do not chase speed',
          'Stop if shins flare up',
          'Breathe through the walk',
        ],
        id: 'treadmill-incline-walk',
        muscleGroup: 'Conditioning',
        name: 'Treadmill Incline Walk',
        restSeconds: 60,
        sets: 1,
      },
      {
        duration: '10-15 minutes',
        equipment: 'VR Quest 2 / Skipping rope',
        formTips: [
          'Stay light on feet',
          'Keep shoulders relaxed',
          'Use short rounds',
          'Stop if shins hurt',
          'Keep breathing controlled',
        ],
        id: 'optional-vr-boxing-skipping-rope',
        muscleGroup: 'Conditioning',
        name: 'Optional VR Boxing / Skipping Rope',
        restSeconds: 60,
        sets: 1,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'dead-bug-rounds',
        muscleGroup: 'Abs / Posture',
        name: 'Dead Bug',
        repRange: '10 each side',
        restSeconds: 45,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'reverse-crunch',
        muscleGroup: 'Abs',
        name: 'Reverse Crunch',
        repRange: '12-15',
        restSeconds: 45,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'plank-with-glute-squeeze',
        muscleGroup: 'Abs / Posture',
        name: 'Plank with Glute Squeeze',
        duration: '30-45 sec',
        restSeconds: 45,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'side-plank-rounds',
        muscleGroup: 'Abs / Obliques',
        name: 'Side Plank',
        duration: '30 sec each side',
        restSeconds: 45,
        sets: 3,
      },
      {
        equipment: 'Bodyweight / Mat',
        formTips: postureTips,
        id: 'glute-bridge',
        muscleGroup: 'Glutes / Posture',
        name: 'Glute Bridge',
        repRange: '20',
        restSeconds: 45,
        sets: 3,
      },
    ],
  },
  {
    day: 7,
    name: 'Rest',
    estimatedTime: '20-40 min',
    focus: ['Recovery', 'Walking', 'Mobility'],
    exercises: [
      {
        duration: 'Easy pace',
        equipment: 'Walking shoes',
        formTips: [
          'Keep pace easy',
          'Breathe through nose if possible',
          'Stay relaxed',
          'Stop if shins hurt',
          'Treat this as recovery',
        ],
        id: 'light-walking-only',
        muscleGroup: 'Recovery',
        name: 'Light walking only',
        restSeconds: 90,
        sets: 1,
      },
    ],
  },
]

export function getWorkoutForDate(date = new Date()) {
  const dayOfWeek = date.getDay()
  const mondayBasedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  return weeklyPlan[mondayBasedIndex]
}

export function getExerciseTarget(exercise: Exercise) {
  if (exercise.repRange) {
    return `${exercise.sets} sets x ${exercise.repRange} reps`
  }

  return `${exercise.sets} sets x ${exercise.duration ?? 'timed work'}`
}

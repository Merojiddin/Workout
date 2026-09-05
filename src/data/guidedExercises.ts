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


  // --- the hard end of the cardio catalog ---------------------------------
  //
  // Plyometrics and full-body work. Everything below leaves the floor, loads
  // a landing, or does both at once - it is what the Advanced sessions are
  // built from, and none of it belongs in a beginner circuit.
  {
    id: 'squat-burpee',
    name: 'Squat Burpee',
    cue: 'A burpee that lands in a full squat every rep.',
    instructions: [
      'Drop into a squat, plant the hands and kick the feet back to a plank.',
      'Jump the feet back under you into a deep squat, then drive up and jump.',
    ],
    planfitId: 9012,
    impact: 'high',
    audioCues: [{ at: 20, say: 'Hit the bottom of the squat every rep.' }],
  },
  {
    id: 'burpee-side-kick',
    name: 'Burpee With Side Kick',
    cue: 'Burpee, then kick out hard on the way up.',
    instructions: [
      'Perform a full burpee back to standing.',
      'Fire a side kick off one leg at the top, and alternate legs each rep.',
    ],
    planfitId: 9020,
    impact: 'high',
  },
  {
    id: 'jump-lunges',
    name: 'Jump Lunges',
    cue: 'Swap legs in the air, land deep and quiet.',
    instructions: [
      'Drop into a lunge until both knees are bent to a right angle.',
      'Explode up, switch legs mid-air, and absorb the landing into the next lunge.',
    ],
    planfitId: 4068,
    impact: 'high',
    audioCues: [{ at: 15, say: 'Chest up. Full depth on every landing.' }],
  },
  {
    id: 'box-jumps',
    name: 'Box Jumps',
    cue: 'Jump up, stand all the way tall, step back down.',
    instructions: [
      'Stand a short step from the box, load the hips and swing the arms.',
      'Jump up and land softly with both feet flat, stand tall, then step down.',
    ],
    planfitId: 4023,
    impact: 'high',
    equipment: ['Plyometric box'],
  },
  {
    id: 'split-jump-to-box',
    name: 'Split Jump To Box',
    cue: 'One foot on the box, swap in the air.',
    instructions: [
      'Put one foot on the box and drop into a split stance.',
      'Jump up, switch which foot lands on the box, and keep the rhythm going.',
    ],
    planfitId: 9035,
    impact: 'high',
    equipment: ['Plyometric box'],
  },
  {
    id: 'double-unders',
    name: 'Double Unders',
    cue: 'Two rope turns for every jump.',
    instructions: [
      'Jump a little higher than a single, and turn the rope twice underneath.',
      'Keep the elbows in and the arms quiet - the wrists do all of the speed.',
    ],
    planfitId: 9034,
    impact: 'high',
    equipment: ['Skipping rope'],
  },
  {
    id: 'criss-cross-jumps',
    name: 'Criss-Cross Jumps',
    cue: 'Scissor the feet in the air, fast.',
    instructions: [
      'Jump and cross one foot in front of the other.',
      'Jump again and switch which foot leads, staying light and quick.',
    ],
    planfitId: 9016,
    impact: 'high',
  },
  {
    id: 'high-knee-squat',
    name: 'High-Knee Squat',
    cue: 'Two knee drives, then a full squat.',
    instructions: [
      'Drive each knee up to hip height on the spot.',
      'Drop straight into a full squat, stand, and go again without a pause.',
    ],
    planfitId: 4065,
    impact: 'high',
  },
  {
    id: 'knee-thrusts',
    name: 'Knee Thrusts',
    cue: 'Pull the knee hard into your hands.',
    instructions: [
      'Reach both arms overhead and stand tall.',
      'Drive one knee up as you pull the arms down to meet it, then swap sides.',
    ],
    planfitId: 9044,
    impact: 'high',
  },
  {
    id: 'twisting-knee-thrusts',
    name: 'Twisting Knee Thrusts',
    cue: 'Opposite elbow meets the knee, from standing.',
    instructions: [
      'Hands behind your head, elbows wide, standing tall.',
      'Drive one knee up and rotate the opposite elbow across to meet it.',
    ],
    planfitId: 9023,
    impact: 'high',
  },
  {
    id: 'inchworm-climbers',
    name: 'Inchworm To Climbers',
    cue: 'Walk out, climb, walk back, stand.',
    instructions: [
      'Hinge and walk your hands out to a plank.',
      'Run four mountain climbers, walk the hands back in and stand tall.',
    ],
    planfitId: 9047,
    impact: 'low',
    audioCues: [{ at: 20, say: 'Keep the hips low through the climbers.' }],
  },
  {
    id: 'side-mountain-climbers',
    name: 'Side Mountain Climbers',
    cue: 'Knee to the same elbow, hips square.',
    instructions: [
      'Hold a strong plank with your hands under your shoulders.',
      'Drive each knee out to the elbow on the same side and back, quickly.',
    ],
    planfitId: 9039,
    impact: 'low',
  },
  {
    id: 'plank-ups',
    name: 'Plank-Ups',
    cue: 'Forearms to hands and back, no hip swing.',
    instructions: [
      'Start in a forearm plank with your feet a little wider than usual.',
      'Press up onto one hand at a time to a high plank, then back down. Alternate the lead arm.',
    ],
    planfitId: 5032,
    impact: 'low',
    audioCues: [{ at: 20, say: 'Keep the hips still. Nothing rocks.' }],
  },
  {
    id: 'rotation-push-ups',
    name: 'Rotation Push-Ups',
    cue: 'Push up, then open into a side plank.',
    instructions: [
      'Perform a full push-up with your chest to the floor.',
      'At the top, rotate into a side plank and reach the top arm at the ceiling. Alternate sides.',
    ],
    planfitId: 5033,
    impact: 'low',
  },
  {
    id: 'archer-push-ups',
    name: 'Archer Push-Ups',
    cue: 'Load one arm, the other stays straight.',
    instructions: [
      'Take a wide hand position in a push-up.',
      'Lower towards one hand keeping the other arm straight, press back up, and alternate.',
    ],
    planfitId: 2033,
    impact: 'low',
  },
  {
    id: 'jumping-pull-ups',
    name: 'Jumping Pull-Ups',
    cue: 'Jump into it, lower yourself slowly.',
    instructions: [
      'Stand under a bar you can reach with a small jump.',
      'Jump and pull your chin over the bar, then lower under control.',
    ],
    planfitId: 1061,
    impact: 'high',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'battle-ropes',
    name: 'Battle Ropes',
    cue: 'Waves from the hips, not the shoulders.',
    instructions: [
      'Hold one rope end in each hand in a quarter squat.',
      'Drive fast alternating waves down the rope without standing up.',
    ],
    planfitId: 9060,
    impact: 'low',
    equipment: ['Battle rope'],
    audioCues: [{ at: 15, say: 'Stay low. Do not let the waves die.' }],
  },
  {
    id: 'wall-balls',
    name: 'Wall Balls',
    cue: 'Full squat, then throw from the hips.',
    instructions: [
      'Hold a medicine ball at your chest and squat below parallel.',
      'Drive up and throw the ball to a mark on the wall, then catch it into the next squat.',
    ],
    planfitId: 5096,
    impact: 'low',
    equipment: ['Medicine ball'],
  },
  {
    id: 'air-runner-sprint',
    name: 'Sprint Intervals',
    cue: 'All out. Nothing held back.',
    instructions: [
      'Run flat out for the whole interval, arms driving.',
      'Step off and walk it down the moment the clock stops.',
    ],
    planfitId: 9026,
    impact: 'high',
    equipment: ['Air runner'],
    mediaNote:
      'Planfit Assault Run: a curved manual treadmill. The same interval works on any treadmill, a bike, or outdoors.',
  },

  {
    id: 'squat-to-overhead-press',
    name: 'Squat To Overhead Reach',
    cue: 'Full squat, then punch both arms up.',
    instructions: [
      'Squat as deep as you can hold a flat back.',
      'Drive up and reach both arms straight overhead, then go again without pausing.',
    ],
    planfitId: 9043,
    impact: 'low',
  },
  {
    id: 'heel-touch-side-kick-squat',
    name: 'Squat, Touch And Kick',
    cue: 'Squat, touch the floor, kick out.',
    instructions: [
      'Squat down and touch the floor beside one heel.',
      'Stand and fire a side kick off that leg, then repeat on the other side.',
    ],
    planfitId: 9040,
    impact: 'low',
  },
  {
    id: 'woodchoppers',
    name: 'Woodchoppers',
    cue: 'Chop from high to low across the body.',
    instructions: [
      'Reach both hands high on one side and hinge into a quarter squat.',
      'Swing them down and across past the opposite hip, then reverse. Swap sides halfway.',
    ],
    planfitId: 9045,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'side-raise-and-kick',
    name: 'Side Raise And Kick',
    cue: 'Knee up, then extend the kick out.',
    instructions: [
      'Stand tall and lift one knee out to the side to hip height.',
      'Extend that leg into a side kick and bring it straight back. Swap sides halfway.',
    ],
    planfitId: 4061,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'stepback-handraise',
    name: 'Step Back And Reach',
    cue: 'Long step back, both arms overhead.',
    instructions: [
      'Take a long step back into a lunge.',
      'Reach both arms overhead as you sink, then drive back to standing.',
    ],
    planfitId: 4070,
    impact: 'low',
  },
  {
    id: 'walking-the-dog',
    name: 'Walk The Dog',
    cue: 'Walk the hands out, walk them back.',
    instructions: [
      'Hinge and walk your hands out until you are in a long plank.',
      'Walk them back to your feet and stand tall, keeping the legs as straight as you can.',
    ],
    planfitId: 9036,
    impact: 'low',
  },
  {
    id: 'assault-bike',
    name: 'Assault Bike Sprint',
    cue: 'Arms and legs both driving. All out.',
    instructions: [
      'Set up with the seat at hip height and grip the handles.',
      'Push and pull with the arms as hard as you drive with the legs for the whole interval.',
    ],
    planfitId: 9062,
    impact: 'low',
    equipment: ['Air bike'],
  },
  {
    id: 'ski-erg',
    name: 'Ski Erg',
    cue: 'Hinge and drive down through the handles.',
    instructions: [
      'Reach the handles high with soft knees.',
      'Pull down hard, hinging at the hips, and finish with the hands past your thighs.',
    ],
    planfitId: 9061,
    impact: 'low',
    equipment: ['Ski erg'],
  },


  // --- hard pushing and pulling -------------------------------------------
  //
  // Bodyweight strength at conditioning pace. These are the movements that
  // make a circuit hard on the arms and shoulders rather than only the lungs.
  {
    id: 'hand-release-push-ups',
    name: 'Hand-Release Push-Ups',
    cue: 'Chest down, hands off the floor, press.',
    instructions: [
      'Lower all the way until your chest is on the floor.',
      'Lift both hands off for a moment, put them back down, and press up.',
    ],
    planfitId: 2050,
    impact: 'low',
    audioCues: [{ at: 20, say: 'Full chest to the floor every rep.' }],
  },
  {
    id: 'hindu-push-ups',
    name: 'Hindu Push-Ups',
    cue: 'Dive under, sweep up, reverse it.',
    instructions: [
      'Start hips high, then dive your chest low between your hands.',
      'Sweep forward and up into a cobra, then push back to the start along the same path.',
    ],
    planfitId: 3037,
    impact: 'low',
  },
  {
    id: 'spiderman-push-ups',
    name: 'Spiderman Push-Ups',
    cue: 'Knee to the elbow on the way down.',
    instructions: [
      'Lower into a push-up and bring one knee up to the elbow on that side.',
      'Press back up as the foot returns, and alternate legs each rep.',
    ],
    planfitId: 5042,
    impact: 'low',
  },
  {
    id: 'walking-push-ups',
    name: 'Walking Push-Ups',
    cue: 'Push up, then travel sideways on your hands.',
    instructions: [
      'Do one push-up, then walk both hands and feet a step to the side.',
      'Push up again and keep travelling, changing direction when you run out of room.',
    ],
    planfitId: 3033,
    impact: 'low',
  },
  {
    id: 'wide-push-ups',
    name: 'Wide Push-Ups',
    cue: 'Hands wide, chest doing the work.',
    instructions: [
      'Set your hands well outside shoulder width.',
      'Lower until your chest is just off the floor and press back up.',
    ],
    planfitId: 2035,
    impact: 'low',
  },
  {
    id: 'handstand-push-ups',
    name: 'Handstand Push-Ups',
    cue: 'Kick up to the wall, lower the head to the floor.',
    instructions: [
      'Kick up into a handstand with your heels resting on a wall.',
      'Bend the elbows to lower the crown of your head towards the floor, then press back up.',
    ],
    planfitId: 3063,
    impact: 'low',
    audioCues: [{ at: 12, say: 'Come down if the shoulders start to give. Do not fold.' }],
  },
  {
    id: 'bench-dips',
    name: 'Bench Dips',
    cue: 'Elbows straight back, hips close to the bench.',
    instructions: [
      'Sit on the edge of a bench with your hands beside your hips and slide forward.',
      'Bend the elbows to lower your hips, then press back up without locking out hard.',
    ],
    planfitId: 6007,
    impact: 'low',
    equipment: ['Bench'],
  },
  {
    id: 'weighted-dips',
    name: 'Weighted Dips',
    cue: 'Lean forward slightly, full depth.',
    instructions: [
      'Hang a plate or dumbbell from a belt and support yourself on the bars.',
      'Lower until your shoulders are below your elbows, then press back to the top.',
    ],
    planfitId: 2040,
    impact: 'low',
    equipment: ['Dips', 'Dumbbells'],
  },
  {
    id: 'wide-grip-pull-ups',
    name: 'Wide-Grip Pull-Ups',
    cue: 'Wide hands, chest to the bar.',
    instructions: [
      'Take a grip well outside shoulder width with your palms forward.',
      'Pull your chest towards the bar, then lower all the way to straight arms.',
    ],
    planfitId: 1078,
    impact: 'low',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'close-grip-pull-ups',
    name: 'Close-Grip Pull-Ups',
    cue: 'Hands together, elbows driving down.',
    instructions: [
      'Grip the bar with your hands almost touching.',
      'Pull until your chin clears the bar, then lower under control.',
    ],
    planfitId: 1077,
    impact: 'low',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'archer-pull-ups',
    name: 'Archer Pull-Ups',
    cue: 'Pull to one hand, the other arm stays long.',
    instructions: [
      'Take a wide grip on the bar.',
      'Pull up towards one hand while the other arm stays straight, then alternate.',
    ],
    planfitId: 1057,
    impact: 'low',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'butterfly-pull-ups',
    name: 'Butterfly Pull-Ups',
    cue: 'Kip in a circle, keep the rhythm unbroken.',
    instructions: [
      'Swing into an arch, then pull as the hips drive forward.',
      'Push away from the bar at the top and let the circle carry you into the next rep.',
    ],
    planfitId: 1060,
    impact: 'high',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'superman-row',
    name: 'Superman Row',
    cue: 'Chest off the floor, then row the elbows back.',
    instructions: [
      'Lie face down and lift your chest and arms off the floor.',
      'Row both elbows back past your ribs, squeeze, and reach forward again without dropping.',
    ],
    planfitId: 1041,
    impact: 'low',
  },


  // --- hard legs ------------------------------------------------------------
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    cue: 'Travel forward, back knee just off the floor.',
    instructions: [
      'Step forward into a lunge until the back knee nearly touches down.',
      'Drive through the front heel straight into the next step forward.',
    ],
    planfitId: 4019,
    impact: 'low',
    audioCues: [{ at: 20, say: 'Chest tall. Do not let the front knee cave in.' }],
  },
  {
    id: 'cross-lunges',
    name: 'Curtsy Lunges',
    cue: 'Step back and across, hips square.',
    instructions: [
      'Step one foot back and across behind the other.',
      'Sink until both knees are bent, then drive back to standing and swap sides.',
    ],
    planfitId: 4043,
    impact: 'low',
  },
  {
    id: 'side-lunges',
    name: 'Side Lunges',
    cue: 'Sit into one hip, the other leg stays straight.',
    instructions: [
      'Take a wide step out to one side and push your hips back.',
      'Bend that knee while the other leg stays straight, then drive back to the middle.',
    ],
    planfitId: 4040,
    impact: 'low',
  },
  {
    id: 'pistol-squat-to-box',
    name: 'Box Pistol Squats',
    cue: 'One leg down to the box, one leg back up.',
    instructions: [
      'Stand on one leg in front of a box with the other leg held out in front.',
      'Sit back until you touch the box, then stand up on that same leg. Swap sides halfway.',
    ],
    planfitId: 4084,
    perSide: true,
    impact: 'low',
    equipment: ['Plyometric box'],
  },
  {
    id: 'sissy-squats',
    name: 'Sissy Squats',
    cue: 'Knees forward, hips and shoulders in one line.',
    instructions: [
      'Hold something for balance and rise onto the balls of your feet.',
      'Drive your knees forward and lean back, keeping hips and shoulders in a straight line.',
    ],
    planfitId: 4125,
    impact: 'low',
  },
  {
    id: 'glute-ham-raise',
    name: 'Glute-Ham Raise',
    cue: 'Lower as slowly as you can hold it.',
    instructions: [
      'Kneel with your ankles anchored and your body upright.',
      'Lower your torso towards the floor as slowly as possible, then pull yourself back up.',
    ],
    planfitId: 4026,
    impact: 'low',
    audioCues: [{ at: 15, say: 'Hips stay open. Do not fold at the waist.' }],
  },
  {
    id: 'band-lateral-walk',
    name: 'Band Lateral Walks',
    cue: 'Stay low, tension never goes slack.',
    instructions: [
      'Put a band around your legs above the knees and drop into a quarter squat.',
      'Step sideways without letting the feet come together, and change direction halfway.',
    ],
    planfitId: 4102,
    impact: 'low',
    equipment: ['Resistance bands'],
  },
  {
    id: 'dumbbell-walking-lunges',
    name: 'Dumbbell Walking Lunges',
    cue: 'Loaded, and the back knee still touches down.',
    instructions: [
      'Hold a dumbbell in each hand at your sides.',
      'Lunge forward until the back knee is just off the floor, then step straight into the next one.',
    ],
    planfitId: 4104,
    impact: 'low',
    equipment: ['Dumbbells'],
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

  {
    id: 'v-ups',
    name: 'V-Ups',
    cue: 'Fold in half, hands to feet.',
    instructions: [
      'Lie flat with your arms overhead and your legs straight.',
      'Lift the arms and legs together to meet over your hips, then lower without touching down.',
    ],
    planfitId: 5010,
    impact: 'low',
    audioCues: [{ at: 15, say: 'Keep the legs straight. Slow on the way down.' }],
  },
  {
    id: 'toes-to-bar',
    name: 'Toes To Bar',
    cue: 'Toes to the bar, no swinging for free reps.',
    instructions: [
      'Hang from a bar with your shoulders active and your body tight.',
      'Bring both feet up to touch the bar, then lower under control.',
    ],
    planfitId: 5022,
    impact: 'low',
    equipment: ['Pull-up bar'],
  },

  {
    id: 'dragon-flag',
    name: 'Dragon Flag',
    cue: 'Whole body one rigid line, lowering slowly.',
    instructions: [
      'Lie on a bench and grip behind your head, then drive your legs and hips up over your shoulders.',
      'Lower the whole body as one straight line as slowly as you can, without letting the hips bend.',
    ],
    planfitId: 5026,
    impact: 'low',
    equipment: ['Bench'],
    audioCues: [{ at: 12, say: 'Bend the knees if the hips start to break. Never the lower back.' }],
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    cue: 'Roll out only as far as the ribs stay down.',
    instructions: [
      'Kneel and hold the wheel under your shoulders with your hips tucked.',
      'Roll out as far as you can hold a flat back, then pull yourself back in.',
    ],
    planfitId: 5011,
    impact: 'low',
    equipment: ['Ab wheel'],
  },
  {
    id: 'knees-to-elbows',
    name: 'Knees To Elbows',
    cue: 'Hanging, knees up to touch the elbows.',
    instructions: [
      'Hang from a bar with active shoulders and no swing.',
      'Pull both knees up to touch your elbows, then lower under control.',
    ],
    planfitId: 5014,
    impact: 'low',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    cue: 'Straight legs to horizontal, no swing.',
    instructions: [
      'Hang from a bar with your body tight and still.',
      'Raise both straight legs to at least hip height, then lower slowly.',
    ],
    planfitId: 5005,
    impact: 'low',
    equipment: ['Pull-up bar'],
  },
  {
    id: 'captains-chair-raise',
    name: 'Captain\'s Chair Leg Raise',
    cue: 'Back flat against the pad, hips curling up.',
    instructions: [
      'Support yourself on the arm pads with your back against the rest.',
      'Raise both legs to hip height or higher, then lower without swinging.',
    ],
    planfitId: 5004,
    impact: 'low',
    equipment: ["Captain's chair"],
  },
  {
    id: 'v-sit',
    name: 'V-Sit Hold',
    cue: 'Balance on your seat, legs and chest lifted.',
    instructions: [
      'Sit and lift both legs so you are balanced on your sit bones.',
      'Hold the V shape with a tall chest, arms reaching past your knees.',
    ],
    planfitId: 5084,
    impact: 'low',
  },
  {
    id: 'sit-ups',
    name: 'Sit-Ups',
    cue: 'All the way up, all the way down.',
    instructions: [
      'Lie back with your knees bent and feet anchored or flat.',
      'Sit all the way up until your chest meets your thighs, then lower with control.',
    ],
    planfitId: 5020,
    impact: 'low',
  },
  {
    id: 'decline-crunch',
    name: 'Decline Crunch',
    cue: 'Head lower than the hips, curl up hard.',
    instructions: [
      'Hook your feet at the top of a decline bench and lie back.',
      'Curl your shoulders up towards your hips, then lower slowly.',
    ],
    planfitId: 5007,
    impact: 'low',
    equipment: ['Bench'],
  },
  {
    id: 'criss-cross',
    name: 'Criss-Cross',
    cue: 'Slow rotation, both shoulders off the floor.',
    instructions: [
      'Lie back with your hands behind your head and both feet lifted.',
      'Rotate one elbow towards the opposite knee as the other leg extends, slowly.',
    ],
    planfitId: 5029,
    impact: 'low',
  },
  {
    id: 'rotation-plank',
    name: 'Rotation Plank',
    cue: 'Plank to side plank and back, hips high.',
    instructions: [
      'Hold a forearm plank with your feet a little apart.',
      'Rotate onto one forearm into a side plank, return to centre, and alternate sides.',
    ],
    planfitId: 5039,
    impact: 'low',
  },
  {
    id: 'rainbow-plank',
    name: 'Rainbow Plank',
    cue: 'Dip the hips side to side without dropping them.',
    instructions: [
      'Hold a forearm plank with your feet wide.',
      'Rotate the hips down towards one side, then sweep through to the other in an arc.',
    ],
    planfitId: 5077,
    impact: 'low',
  },
  {
    id: 'single-leg-plank',
    name: 'Single-Leg Plank',
    cue: 'One foot up, hips dead level.',
    instructions: [
      'Hold a forearm plank and lift one foot a few inches off the floor.',
      'Keep the hips square and level, and swap legs halfway through.',
    ],
    planfitId: 5071,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'plank-lateral-raise',
    name: 'Plank Lateral Raise',
    cue: 'Raise one arm out sideways without twisting.',
    instructions: [
      'Hold a high plank with your feet wide for balance.',
      'Lift one straight arm out to the side to shoulder height, lower it, and alternate.',
    ],
    planfitId: 3036,
    impact: 'low',
  },
  {
    id: 'side-knee-ups',
    name: 'Side Knee-Ups',
    cue: 'Lying on your side, knee to elbow.',
    instructions: [
      'Lie on one side propped on your forearm with your legs long.',
      'Crunch the top knee up to meet the top elbow, then extend. Swap sides halfway.',
    ],
    planfitId: 5051,
    perSide: true,
    impact: 'low',
  },
  {
    id: 'exercise-ball-pull-in',
    name: 'Ball Pull-Ins',
    cue: 'Shins on the ball, pull the knees to the chest.',
    instructions: [
      'Get into a high plank with your shins resting on an exercise ball.',
      'Pull your knees towards your chest, rolling the ball in, then extend back out.',
    ],
    planfitId: 5089,
    impact: 'low',
    equipment: ['Exercise ball'],
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

  // ------------------------------------------------ loaded conditioning
  //
  // Weights moved fast. Heavier on the lungs than anything above, and the one
  // part of the catalog that needs equipment rather than a patch of floor.
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    cue: 'Snap the hips - the arms just hold on.',
    instructions: [
      'Hinge at the hips and hike the bell back between your legs.',
      'Snap the hips forward to float it to chest height, then let it fall back into the next rep.',
    ],
    planfitId: 5023,
    impact: 'low',
    equipment: ['Kettlebell'],
    audioCues: [{ at: 15, say: 'This is a hinge, not a squat. Squeeze at the top.' }],
  },
  {
    id: 'one-arm-kettlebell-swing',
    name: 'One-Arm Kettlebell Swing',
    cue: 'Same hinge, one hand, shoulders square.',
    instructions: [
      'Hike the bell back with one hand and keep the free arm out for balance.',
      'Snap the hips to swing it to chest height without letting the torso rotate.',
    ],
    planfitId: 5075,
    perSide: true,
    impact: 'low',
    equipment: ['Kettlebell'],
  },
  {
    id: 'dumbbell-thrusters',
    name: 'Dumbbell Thrusters',
    cue: 'Squat and press as one movement.',
    instructions: [
      'Hold the dumbbells at your shoulders and squat to depth.',
      'Drive up and let the momentum carry them straight overhead, then bring them back down into the next squat.',
    ],
    planfitId: 5037,
    impact: 'low',
    equipment: ['Dumbbells'],
    audioCues: [{ at: 20, say: 'One movement. Do not stop at the top of the squat.' }],
  },
  {
    id: 'kettlebell-thrusters',
    name: 'Kettlebell Thrusters',
    cue: 'Bells racked, squat, punch overhead.',
    instructions: [
      'Rack the bells on your forearms at shoulder height and squat to depth.',
      'Stand hard and press them overhead in one motion, then return to the rack.',
    ],
    planfitId: 5068,
    impact: 'low',
    equipment: ['Kettlebell'],
  },
  {
    id: 'dumbbell-power-clean',
    name: 'Dumbbell Power Clean',
    cue: 'Pull from the floor, catch at the shoulders.',
    instructions: [
      'Hinge down and grip both dumbbells on the floor with a flat back.',
      'Extend the hips hard, pull them up, and catch them on your shoulders in a quarter squat.',
    ],
    planfitId: 5065,
    impact: 'low',
    equipment: ['Dumbbells'],
  },
  {
    id: 'dumbbell-snatch',
    name: 'One-Arm Dumbbell Snatch',
    cue: 'Floor to overhead in one pull.',
    instructions: [
      'Hinge and grip one dumbbell between your feet.',
      'Drive the hips through and pull it straight overhead in one movement, then lower it under control.',
    ],
    planfitId: 5066,
    perSide: true,
    impact: 'low',
    equipment: ['Dumbbells'],
  },
  {
    id: 'turkish-get-up',
    name: 'Turkish Get-Up',
    cue: 'Floor to standing with the bell locked overhead.',
    instructions: [
      'Lie on your back holding a kettlebell straight up in one arm.',
      'Stand up one stage at a time keeping the arm vertical throughout, then reverse it. Swap sides halfway.',
    ],
    planfitId: 5056,
    perSide: true,
    impact: 'low',
    equipment: ['Kettlebell'],
    audioCues: [{ at: 25, say: 'Eyes on the bell. One stage at a time.' }],
  },
  {
    id: 'sumo-deadlift-high-pull',
    name: 'Sumo Deadlift High Pull',
    cue: 'Wide stance, pull it to your chin.',
    instructions: [
      'Stand wide over a kettlebell and grip it with both hands.',
      'Drive the hips and pull the bell up to chin height with the elbows leading.',
    ],
    planfitId: 4047,
    impact: 'low',
    equipment: ['Kettlebell'],
  },
  {
    id: 'kettlebell-goblet-squat',
    name: 'Kettlebell Goblet Squat',
    cue: 'Bell at the chest, sit straight down.',
    instructions: [
      'Hold a kettlebell at chest height with both hands.',
      'Squat between your feet keeping the chest tall, then stand and squeeze.',
    ],
    planfitId: 4094,
    impact: 'low',
    equipment: ['Kettlebell'],
  },
  {
    id: 'dumbbell-swing',
    name: 'Dumbbell Swing',
    cue: 'Same hip snap, one dumbbell.',
    instructions: [
      'Hold one dumbbell with both hands and hinge it back between your legs.',
      'Snap the hips forward to swing it to chest height, then let it fall into the next rep.',
    ],
    planfitId: 5081,
    impact: 'low',
    equipment: ['Dumbbells'],
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

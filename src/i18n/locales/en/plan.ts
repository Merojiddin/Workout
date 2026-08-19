/**
 * Weekly Plan.
 *
 * The program's own words -- day names, phase names, guidance lines, rule
 * text -- come from the JSON that was installed and are shown as written.
 * Only the labels the app puts around them are translated here.
 */
export const planMessages = {
  'plan.eyebrow': 'Weekly Plan',
  'plan.splitTag': '{days}-day training split',
  'plan.versionTag': 'Version {version}',
  'plan.weeksTag': { one: '{count} week', other: '{count} weeks' },
  'plan.modifiedTag': 'Modified after installation',
  'plan.goals': 'Goals:',
  'plan.print': 'Print Weekly Plan',
  'plan.changeProgram': 'Change Program',
  'plan.schedule': 'Training schedule',
  'plan.scheduleSummary': '{sessions} · {rest}',
  'plan.scheduledSessions': {
    one: '{count} scheduled session',
    other: '{count} scheduled sessions',
  },
  'plan.restDays': { one: '{count} rest day', other: '{count} rest days' },

  'plan.progressionEyebrow': 'Program progression',
  'plan.progressionTitle': '{weeks}-week training phases',
  'plan.progressionTitleGeneric': 'Training phases',
  'plan.volume': 'Volume:',
  'plan.effort': 'Effort:',
  'plan.priorities': 'Priorities',
  'plan.restrictions': 'Restrictions',
  'plan.assessment': 'Assessment',

  'plan.rulesEyebrow': 'How to use the plan',
  'plan.rulesTitle': 'Program rules',
  'plan.rules.effort': 'Effort and RIR',
  'plan.rules.progression': 'Double progression',
  'plan.rules.rest': 'Rest between sets',
  'plan.rules.substitutions': 'Exercise substitutions',
  'plan.rules.returnAfterBreak': 'Return after a break',
  'plan.rules.safety': 'Safety',
  'plan.rules.optionalNeckWork': 'Optional neck work',
  'plan.rules.posture': 'Posture and control',

  'plan.standaloneEyebrow': 'Optional sessions',
  'plan.standaloneTitle': 'Standalone workouts',
  'plan.standaloneIntro':
    'These sessions sit outside the normal weekly rotation and do not replace or advance a scheduled day.',
  'plan.standaloneCard': 'Standalone workout',
  'plan.whenToUse': 'When to use:',
  'plan.workoutRules': 'Rules',

  'plan.optionalPrefix': 'Optional · ',
  'plan.rirSuffix': '{value} RIR',
  'plan.exerciseMeta': 'Rest {seconds}s · {muscle} · {equipment}',
  'plan.muscleFallback': 'Other',
  'plan.equipmentFallback': 'Bodyweight',
  'plan.home': 'Home',
  'plan.gym': 'Gym',
  'plan.guidance': 'Guidance',
  'plan.phaseTargets': 'Week-specific prescription',
  'plan.openGuideFor': 'Open form guide for {name}',
  'plan.guide': 'Guide',

  'plan.selectOne':
    'Choose one exercise from this slot; do not perform every alternative.',
  'plan.selectCount': 'Choose {count} exercises from this slot.',
  'plan.optionalSlotPrefix': 'Optional slot. ',

  'plan.setsTimes': '{count} sets',
  'plan.weeksNotSpecified': 'Weeks not specified',
  'plan.weekSingle': 'Week {week}',
  'plan.weekRange': 'Weeks {from}-{to}',
  'plan.weekList': 'Weeks {weeks}',
} as const

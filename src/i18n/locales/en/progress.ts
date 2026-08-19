/** Progress page: the week strip, streak, body weight, focus and records. */
export const progressMessages = {
  'progress.title': 'Progress',
  'progress.subtitle': 'Your training trend, from what you have already logged.',

  'progress.thisWeek': 'This week',
  'progress.daysOfSeven': '/ 7 days',
  'progress.setsLabel': 'sets',
  'progress.dayTrained': '{day}: trained',
  'progress.dayRested': '{day}: no workout',

  'progress.streak': 'Current streak',
  'progress.streakDays': { one: 'day', other: 'days' },
  'progress.streakNote': 'Counted back from today, one day at a time.',
  'progress.streakEmpty': 'Finish a workout today to start one.',

  'progress.bodyWeight': 'Body weight',
  'progress.notLogged': 'Not logged',
  'progress.needTwoCheckIns': 'Two check-ins are needed to draw a line.',
  'progress.addCheckIn': 'Add a check-in',

  'progress.muscleFocus': 'Muscle focus this week',
  'progress.focusSets': { one: '{count} set', other: '{count} sets' },
  'progress.focusEmpty':
    'Nothing logged this week yet. Sets counted here come from finished workouts.',

  'progress.records': 'Personal records',
  'progress.recordsEmpty':
    'No loads logged yet. Type a weight on the live workout screen and your heaviest set for each movement shows up here.',

  'progress.weeklyReviewLink': 'Weekly review',
  'progress.checkInLink': 'Body check-in',
} as const

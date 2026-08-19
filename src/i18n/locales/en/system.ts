/**
 * App-wide system surfaces: the crash screen, offline banner, PWA install
 * prompt, notification centre and the reminders it lists.
 */
export const systemMessages = {
  'boundary.eyebrow': 'App safety',
  'boundary.title': 'Something went wrong',
  'boundary.copy': 'The app hit an error. Your saved data should still be safe.',
  'boundary.reload': 'Reload App',
  'boundary.goHome': "Go to Today's Workout",
  'boundary.exportBackup': 'Export Backup',
  'boundary.technicalDetails': 'Technical details',
  'boundary.productionHint':
    'Details are hidden in production. Use the button below to copy the full error for a bug report.',
  'boundary.copyError': 'Copy error details',

  'toast.genericError': 'Something went wrong. Your data should still be safe.',

  'loading.page': 'Loading page...',

  'lazy.failed': 'Failed to load this page. Check your connection and reload.',
  'lazy.reload': 'Reload',

  'offline.banner':
    'You are offline. Training logs will be saved locally and can sync later.',
  'offline.backOnline': 'Back online.',

  'pwa.install': 'Install App',
  'pwa.iosHint': 'To install: tap Share, then Add to Home Screen.',

  'notify.open': 'Open reminders',
  'notify.title': 'Reminders',
  'notify.listAria': 'Reminder list',
  'notify.activeCount': { one: '{count} active', other: '{count} active' },
  'notify.empty': 'No active reminders',
  'notify.justNow': 'Just now',
  'notify.status.inAppOnly': 'In-app only',
  'notify.status.browserOn': 'Browser on',
  'notify.status.blocked': 'Blocked',
  'notify.empty.unsupported':
    'Browser notifications are not supported here. In-app reminders still work.',
  'notify.empty.enabled': 'Browser notifications are enabled.',
  'notify.empty.blocked': 'Notifications are blocked in browser settings.',
  'notify.empty.disabled': 'Enable browser notifications from Reminder Settings.',
  'notify.category.workout': 'Workout',
  'notify.category.supplement': 'Supplement',
  'notify.category.nutrition': 'Nutrition',
  'notify.category.body': 'Body',
  'notify.category.safety': 'Safety',
  'notify.category.system': 'System',

  'reminder.workout.title': 'Workout Reminder',
  'reminder.workout.message':
    "Today's workout is Day {day} - {name}. Start when ready.",
  'reminder.creatine.title': 'Creatine Reminder',
  'reminder.creatine.message':
    'Creatine monohydrate not logged today. Take 3-5 g if you have not taken it.',
  'reminder.protein.title': 'Protein Reminder',
  'reminder.protein.message':
    'Protein is below target. Aim for {min}-{max} g today.',
  'reminder.water.title': 'Water Reminder',
  'reminder.water.message':
    'Water is low today. Drink more, especially if taking creatine.',
  'reminder.bodyCheckIn.title': 'Body Check-in Reminder',
  'reminder.bodyCheckIn.message':
    'No body check-in this week. Log weight, waist, chest, shoulders, and photos.',
  'reminder.weeklyReview.title': 'Weekly Review Reminder',
  'reminder.weeklyReview.message':
    'Review workouts, nutrition, body progress, and next week focus.',
  'reminder.unfinished.title': 'Unfinished Workout',
  'reminder.unfinished.message':
    'You have an unfinished workout. Continue or discard it.',
} as const

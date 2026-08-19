/** Privacy notice and disclaimer, reached from the Settings footer. */
export const legalMessages = {
  'privacy.eyebrow': 'Privacy',
  'privacy.title': 'Privacy notice',
  'privacy.subtitle': 'Where your fitness data is stored and who can see it.',
  'privacy.localHeading': 'Local storage by default',
  'privacy.localCopy':
    "If cloud sync is not configured, everything you enter — workouts, body check-ins, nutrition logs, settings, and photos — is stored only in this browser's local storage on your device. Nothing leaves your device.",
  'privacy.cloudHeading': 'Cloud sync when you log in',
  'privacy.cloudCopy':
    'If you create an account and log in, your data is also stored in a Supabase database tied to your account. Row Level Security ensures only your account can read or change your rows.',
  'privacy.photosHeading': 'Progress photos',
  'privacy.photosCopy':
    'Progress photos may be uploaded to Supabase Storage when cloud sync is on. The photo bucket is private: photos are shown to you through short-lived signed links and are not publicly accessible.',
  'privacy.exportHeading': 'Your data stays yours',
  'privacy.exportCopy':
    'You can export a full backup of your local data at any time (Settings → Backup), and you can delete all local data from this browser (Settings → Backup → Clear All Data). Exported files contain personal fitness data — keep them private.',
  'privacy.noSellingHeading': 'No selling, no tracking',
  'privacy.noSellingCopy':
    'This is a personal fitness tracker. No data is sold, shared with advertisers, or used for anything other than showing you your own progress.',

  'disclaimer.eyebrow': 'Terms',
  'disclaimer.title': 'Disclaimer',
  'disclaimer.subtitle': 'What this app is — and what it is not.',
  'disclaimer.notMedicalHeading': 'Fitness tracking, not medical advice',
  'disclaimer.notMedicalCopy':
    'This app is for logging and reviewing your own training, body measurements, and nutrition. Nothing in it — including the Smart Coach suggestions — is medical advice, diagnosis, or treatment.',
  'disclaimer.painHeading': 'Pain and injury warnings are general guidance',
  'disclaimer.painCopy':
    'Pain-level prompts and injury warnings are general safety reminders, not a professional assessment. They cannot detect or rule out an injury.',
  'disclaimer.professionalHeading': 'When to see a professional',
  'disclaimer.professionalCopy':
    'If pain continues, gets worse, or limits normal movement, stop training the affected area and consult a qualified medical professional or physiotherapist before continuing.',
  'disclaimer.nutritionHeading': 'Nutrition guidance is general',
  'disclaimer.nutritionCopy':
    'Protein, water, and calorie targets in this app are general fitness guidance, not a medical diet prescription. For medical conditions, allergies, or clinical weight management, consult a doctor or registered dietitian.',
} as const

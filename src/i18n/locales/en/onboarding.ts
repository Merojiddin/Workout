/** The two first-run screens: adding a program, then the short profile step. */
export const onboardingMessages = {
  'setup.step1': 'Step 1 of 2',
  'setup.step2': 'Step 2 of 2',

  'setup.program.title': 'Add your workout program',
  'setup.program.subtitle':
    "This app does not come with a program, and it never shows you anyone else's. Upload your own program file to get started - it stays private to your account.",
  'setup.program.chooseFile': 'Choose program file',
  'setup.program.loaded': 'Loaded {name}',
  'setup.program.readFailed': 'Could not read "{name}". Try choosing the file again.',
  'setup.program.pasteInstead': 'Paste the JSON instead',
  'setup.program.pasteHint':
    'Have your plan as plain text? Copy this prompt into ChatGPT (or any AI chat) with your plan, then upload or paste the JSON it gives back.',
  'setup.program.copyPrompt': 'Copy AI prompt',
  'setup.program.copyManual': 'Press Ctrl/Cmd+C',
  'setup.program.looksGood': '{name} looks good - {days} days.',
  'setup.program.unusable': 'This program cannot be used yet.',
  'setup.program.offline':
    'You are offline. Reconnect to finish setting up your program.',
  'setup.program.installing': 'Setting up...',
  'setup.program.install': 'Use this program',

  'setup.profile.title': 'A little about you',
  'setup.profile.subtitle':
    'Body Check-in and your printed plan use these to show progress against a goal. Nothing here is shared, and you can change or add it any time in Settings › Profile.',
  'setup.profile.namePlaceholder': 'What should we call you?',
  'setup.profile.height': 'Height',
  'setup.profile.currentWeight': 'Current weight',
  'setup.profile.goalWeightFrom': 'Goal weight from',
  'setup.profile.goalWeightTo': 'Goal weight to',
  'setup.profile.fieldWithUnit': '{label} {unit}',
  'setup.profile.saveAndContinue': 'Save and continue',
  'setup.profile.skip': 'Skip for now',
} as const

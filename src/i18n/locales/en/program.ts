/**
 * Program management: the manager panel, the upload/paste flow, the read-only
 * preview, install confirmation, and the messages the program services return.
 */
export const programMessages = {
  'pm.cloudTitle': 'Cloud Program Manager',
  'pm.localTitle': 'Local Program Manager',
  'pm.heading': 'Workout Programs',
  'pm.cloudIntro':
    'Preview discovered programs, install with verified local and cloud backups, or keep your current plan.',
  'pm.localIntro':
    'Preview discovered programs, install one with a local backup, or keep your current custom plan.',
  'pm.cloudOffline':
    'Connect to the internet before changing a cloud workout program.',
  'pm.activeWorkoutBlocked':
    'Finish or discard the active workout before changing programs.',
  'pm.unsavedEdits':
    'Save your manual plan edits before installing or restoring a workout program.',
  'pm.unsavedInstall': 'Save your manual plan edits before installing a workout program.',
  'pm.unsavedRestore':
    'Save your manual plan edits before restoring a workout plan backup.',
  'pm.useCloudBackup': 'Use a Cloud backup when cloud sync is active.',
  'pm.installedUnavailable': 'Installed program unavailable in this build.',
  'pm.modifiedAfterInstall': 'Modified after installation',
  'pm.customPlan': 'Custom workout plan',
  'pm.noProgram': 'No program installed',
  'pm.planNameModified': '{name} (modified)',

  'pm.restoreLocalConfirm':
    'Restore this workout plan backup? Your current plan will be backed up first.',
  'pm.restoreCloudConfirm':
    'Restore this cloud workout plan backup? Your current local and cloud plans will be backed up first.',

  'pm.hideDismissed': 'Hide dismissed programs',
  'pm.showDismissed': 'Show dismissed programs again ({count})',
  'pm.exportCurrent': 'Export Current Plan',
  'pm.exportNote':
    'Current-plan exports contain the last saved plan; unsaved editor changes are not included.',

  'pm.status.current': 'Current',
  'pm.status.available': 'Available',
  'pm.status.dismissed': 'Dismissed',
  'pm.version': 'Version {version}',
  'pm.updated': 'Updated',
  'pm.days': 'Days',
  'pm.exercises': 'Exercises',
  'pm.validationWarningCount': {
    one: '{count} validation warning',
    other: '{count} validation warnings',
  },
  'pm.preview': 'Preview',
  'pm.install': 'Install',
  'pm.currentProgram': 'Current Program',
  'pm.keepCurrent': 'Keep Current Plan',
  'pm.currentKept': 'Current Plan Kept',

  'pm.backupsEyebrow': 'Local and cloud safety copies',
  'pm.backupsHeading': 'Workout Plan Backups',
  'pm.localBackups': 'Local backups',
  'pm.cloudBackups': 'Cloud backups',
  'pm.noLocalBackups': 'No local backups have been created yet.',
  'pm.noCloudBackups': 'No cloud backups have been created for this account yet.',
  'pm.localBackup': 'Local backup',
  'pm.cloudBackup': 'Cloud backup',
  'pm.previousProgram': 'Previous program: ',
  'pm.noneRecorded': 'None recorded',
  'pm.backupDays': { one: '{count} day', other: '{count} days' },
  'pm.restore': 'Restore',
  'pm.exportBackup': 'Export Backup',

  'pm.previewEyebrow': 'Read-only Program Preview',
  'pm.programId': 'Program ID',
  'pm.duration': 'Duration',
  'pm.exerciseOccurrences': 'Exercise occurrences',
  'pm.validationWarnings': 'Validation warnings',
  'pm.phasesHeading': 'Progression phases',
  'pm.volume': 'Volume:',
  'pm.effort': 'Effort:',
  'pm.comparisonHeading': 'Simple plan comparison',
  'pm.currentPlan': 'Current plan',
  'pm.selectedProgram': 'Selected program',
  'pm.currentOccurrences': 'Current exercise occurrences',
  'pm.newOccurrences': 'New exercise occurrences',
  'pm.standaloneWorkout': 'Standalone workout',
  'pm.recommendedUse': 'Recommended use:',
  'pm.noneListed': 'None listed.',
  'pm.none': 'None',

  'pm.closePreview': 'Close program preview',
  'pm.restSeconds': 'Rest: {seconds} sec',
  'pm.guidancePrefix': 'Guidance:',

  'pm.rules.effort': 'Rules — Effort',
  'pm.rules.progression': 'Rules — Progression',
  'pm.rules.rest': 'Rules — Rest between sets',
  'pm.rules.substitutions': 'Rules — Substitutions',
  'pm.rules.posture': 'Rules — Posture cue',
  'pm.rules.returnAfterBreak': 'Rules — Return after a break',
  'pm.rules.safety': 'Rules — Safety',
  'pm.rules.neckWork': 'Rules — Optional neck work',

  'pm.confirmCloudTitle': 'Confirm cloud installation',
  'pm.confirmLocalTitle': 'Confirm local installation',
  'pm.confirmCloudCopy':
    'This will replace your cloud custom workout plan only after local and cloud backups are created. The verified plan will then update this device. Your workout history will not be changed.',
  'pm.confirmLocalCopy':
    'This will replace your active custom workout plan with the selected program. Your workout history will not be changed. A local backup of your current plan will be created first.',
  'pm.installProgram': 'Install Program',
  'pm.activeWorkoutBlock': 'Active workout block',
  'pm.blocked': 'Blocked',
  'pm.noActiveWorkout': 'No active workout',

  'paste.open': 'Add a workout program',
  'paste.close': 'Close import panel',
  'paste.hint':
    'Upload your program as a .json file. If you have your plan as plain text, copy the prompt below into ChatGPT (or any AI chat) along with your plan, then upload or paste the JSON it returns.',
  'paste.chooseFile': 'Choose program file',
  'paste.loaded': 'Loaded {name}',
  'paste.readFailed': 'Could not read "{name}". Try choosing the file again.',
  'paste.jsonLabel': 'Program JSON',
  'paste.jsonLabelNote': '(or paste it here)',
  'paste.check': 'Check',
  'paste.save': 'Save program',
  'paste.looksGood': '{name} looks good - {days} days, {exercises} exercises.',
  'paste.saveHint': 'Choose "Save program" to add it to your list.',
  'paste.cannotSave': 'This program cannot be saved yet.',
  'paste.warningSummary': {
    one: '{count} warning (program still works)',
    other: '{count} warnings (program still works)',
  },
  'paste.savedTitle': 'Your pasted programs ({count})',
  'paste.removeAria': 'Remove {name} {version}',
  'paste.removeConfirm':
    'Remove "{name}" {version} from your pasted programs?\n\nThis does not change your current workout plan.',
  'paste.removed': 'Removed "{name}" {version}.',
  'paste.savedThenInstall': '{message} Find it in the list below to install it.',
} as const

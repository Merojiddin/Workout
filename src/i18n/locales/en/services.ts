/**
 * Messages returned by the storage, sync and program services.
 *
 * These surface in the Program Manager's notice strip, the sync banner and
 * the Cloud Sync panel, so they are user-facing even though they are produced
 * far from any component.
 */
export const serviceMessages = {
  // -------------------------------------------------------- program validation
  'valid.notObject': 'Program is not an object.',
  'valid.missingId': 'Missing or empty program id.',
  'valid.missingName': 'Missing or empty name.',
  'valid.missingVersion': 'Missing or empty version.',
  'valid.missingUpdatedAt': 'Missing or invalid updatedAt.',
  'valid.missingDescription': 'Missing optional description.',
  'valid.descriptionType': 'Description must be a string when supplied.',
  'valid.emptyGoals': 'Empty goals.',
  'valid.goalsArray': 'Goals must be an array of strings.',
  'valid.goalsStrings': 'Goals must contain only non-empty strings.',
  'valid.emptyBenchmarks': 'Empty benchmark list.',
  'valid.benchmarksArray': 'Benchmark exercise IDs must be an array of strings.',
  'valid.benchmarksStrings':
    'Benchmark exercise IDs must contain only non-empty strings.',
  'valid.missingDays': 'Missing or empty days array.',
  'valid.notSevenDays': 'Program does not have exactly seven days.',
  'valid.daysNotSequential': 'Day numbers are not sequential.',
  'valid.rulesObject': 'Rules must be an object.',
  'valid.coachingObject': 'coaching must be an object when supplied.',
  'valid.coachingProtein':
    'coaching protein targets must satisfy min <= default <= max.',
  'valid.durationWeeks': 'durationWeeks must be a positive integer when supplied.',
  'valid.normalWeeklyDays':
    'normalWeeklyDays must be a positive integer when supplied.',
  'valid.progressionPhases':
    'progressionPhases must be a non-empty array when supplied.',
  'valid.postureCue': 'rules.postureCue must be a non-empty string when supplied.',
  'valid.standaloneWorkouts': 'standaloneWorkouts must be an array when supplied.',
  'valid.invalidJson': 'Program file contains invalid JSON.',
  'valid.unexpected': 'Program validation failed unexpectedly.',

  // ------------------------------------------------------- local program manager
  'svc.idVersionRequired': 'Program ID and version are required.',
  'svc.validIdVersionRequired': 'A valid program ID and version are required.',
  'svc.planAndReasonRequired': 'A workout plan and backup reason are required.',
  'svc.noInstalledMetadata': 'No locally installed workout program metadata was found.',
  'svc.installedMetadataInvalid': 'The installed workout program metadata is invalid.',
  'svc.installedTimestampInvalid': 'The installed-program timestamp is invalid.',
  'svc.installedMetadataSaveFailed':
    'The installed workout program metadata could not be saved.',
  'svc.installedMetadataVerifyFailed':
    'The installed workout program metadata could not be verified.',
  'svc.installedMetadataSaved': 'Installed workout program metadata saved.',
  'svc.installedMetadataCleared': 'Installed workout program metadata cleared.',
  'svc.installedMetadataClearFailed':
    'Installed workout program metadata could not be cleared.',
  'svc.installedMetadataClearVerifyFailed':
    'Cleared installed workout program metadata could not be verified.',
  'svc.noClearNeeded': 'No installed workout program metadata needed clearing.',
  'svc.noneDismissed': 'No workout programs are dismissed.',
  'svc.dismissedListInvalid': 'The dismissed workout program list is invalid.',
  'svc.dismissedSaveFailed': 'The dismissed workout program could not be saved.',
  'svc.dismissedVerifyFailed': 'The dismissed workout program could not be verified.',
  'svc.dismissedEntryClearFailed':
    'The dismissed workout program entry could not be cleared.',
  'svc.dismissedEntryClearVerifyFailed':
    'The cleared dismissed workout program entry could not be verified.',
  'svc.dismissedEntryCleared': 'Dismissed workout program entry cleared.',
  'svc.notDismissed': 'The workout program was not dismissed.',
  'svc.noBackupsFound': 'No workout plan backups were found.',
  'svc.backupListInvalid': 'The workout plan backup list is invalid.',
  'svc.backupSaveFailed': 'The workout plan backup could not be saved.',
  'svc.backupVerifyFailed': 'The workout plan backup could not be verified.',
  'svc.backupCreated': 'Workout plan backup created.',
  'svc.backupNotFound': 'The selected workout plan backup was not found.',
  'svc.planEmpty':
    'The current workout plan cannot be backed up because it is empty or incomplete.',
  'svc.planSaveFailed': 'The workout program plan could not be saved.',
  'svc.planVerifyFailed': 'The saved workout program plan could not be verified.',
  'svc.notInRegistry': 'The selected program is not in the workout program registry.',
  'svc.notInRegistryShort': 'The selected program is not in the registry.',
  'svc.failedValidation':
    'The selected workout program failed validation and was not installed.',
  'svc.alreadyInstalled': 'This workout program is already installed.',
  'svc.activeWorkoutBlocks': 'Finish or discard the active workout before changing programs.',
  'svc.noActiveWorkoutBlock': 'No active workout blocks program changes.',
  'svc.historyUnchanged': 'Workout history and active workout data were not changed.',
  'svc.planBackedUpBeforeInstall': 'The previous plan was backed up before installation.',
  'svc.planBackedUpBeforeRestore': 'The current plan was backed up before restore.',
  'svc.backupPlanSaveFailed':
    'The backup plan could not be saved; the previous plan was restored.',
  'svc.restoredPlanVerifyFailed':
    'The restored plan could not be verified; the previous plan was restored.',
  'svc.restoredPlanFinalVerifyFailed':
    'The restored plan did not pass final verification; the previous plan was restored.',
  'svc.priorMetadataRestoreFailed':
    'The prior installed-program metadata could not be restored; the previous plan was restored.',
  'svc.planAndMetadataVerified':
    'The saved plan and installed-program metadata were verified.',
  'svc.backupRestored': 'Workout plan backup restored. The selected backup was kept.',

  // --------------------------------------------------------------- cloud program
  'cloud.userIdRequired': 'A user ID is required for cloud Program Manager hydration.',
  'cloud.signInToChange': 'Sign in with a cloud account to change workout programs.',
  'cloud.notConfigured': 'Supabase is not configured. Running in local mode.',
  'cloud.offline': 'Connect to the internet before changing a cloud workout program.',
  'cloud.backupIdFailed': 'A unique cloud backup ID could not be created.',
  'cloud.metadataHydrateFailed': 'Cloud Program Manager metadata could not be hydrated.',
  'cloud.metadataLoadFailed': 'Cloud Program Manager metadata could not be loaded.',
  'cloud.metadataHydrated':
    'Cloud Program Manager metadata hydrated. Local-only backups were preserved.',
  'cloud.metadataInvalid': 'Cloud Program Manager metadata is invalid.',
  'cloud.metadataMustBeObject': 'Cloud Program Manager metadata must be an object.',
  'cloud.dismissedMetadataInvalid': 'Cloud dismissed-program metadata is invalid.',
  'cloud.installedMetadataInvalid': 'Cloud installed-program metadata is invalid.',
  'cloud.settingsMustBeObject': 'Cloud user settings must be an object.',
  'cloud.planMustBeArray': 'Cloud workout plan must be an array.',
  'cloud.refetchFailed': 'Cloud values could not be refetched.',
  'cloud.verifyFailedAfterInstall': 'Cloud verification failed after installation.',
  'cloud.verifyFailedDuringRestore':
    'Cloud verification failed while restoring the backup.',
  'cloud.backupMetadataInvalid': 'Cloud workout plan backup metadata is invalid.',
  'cloud.backupRestored': 'Cloud workout plan backup restored.',
  'cloud.hydratedLoaded': 'Hydrated cloud Program Manager metadata loaded.',
  'cloud.noHydrated':
    'No hydrated cloud Program Manager metadata was found for this account.',
  'cloud.localSaveVerifyFailed':
    'Local Program Manager metadata could not be saved and verified.',
  'cloud.rollbackMetadataVerifyFailed':
    'Previous cloud metadata could not be verified after rollback.',
  'cloud.rollbackMetadataRestored':
    'Previous cloud metadata restored; the created backup was preserved.',
  'cloud.rollbackMetadataFailed': 'Previous cloud metadata rollback failed.',
  'cloud.rollbackPlanVerifyFailed':
    'Previous cloud plan could not be verified after rollback.',
  'cloud.rollbackPlanRestored': 'Previous cloud plan restored and verified.',
  'cloud.rollbackPlanFailed': 'Previous cloud plan rollback failed.',
  'cloud.rollbackSettingsVerifyFailed':
    'Previous cloud settings could not be verified after rollback.',
  'cloud.rollbackSettingsRestored': 'Previous cloud settings restored and verified.',
  'cloud.rollbackSettingsFailed': 'Previous cloud settings rollback failed.',
  'cloud.backupPlanRestoreFailed': 'The cloud backup plan could not be restored.',
  'cloud.planHistoryUnchanged':
    'The cloud custom plan and workout history were not changed.',
  'cloud.planRowExists': 'The cloud custom plan row still exists.',
  'cloud.dismissalVerifyFailed': 'The cloud dismissal metadata could not be verified.',
  'cloud.dismissalCacheFailed':
    'The cloud dismissal was verified, but the local dismissed cache could not be updated.',
  'cloud.installedMetadataMismatch': 'The cloud installed-program metadata does not match.',
  'cloud.planRefetchedVerified':
    'The cloud plan and installed-program metadata were refetched and verified.',
  'cloud.planMismatch': 'The cloud plan does not match the expected program.',
  'cloud.settingsAbsent': 'The cloud settings document is absent or invalid.',
  'cloud.backupVerifyFailed': 'The cloud workout plan backup could not be verified.',
  'cloud.planSaveFailed': 'The cloud workout plan could not be saved.',
  'cloud.currentPlanInvalid': 'The current cloud custom plan is invalid.',
  'cloud.plansBackedUpBeforeRestore':
    'The current local and cloud plans were backed up before restore.',
  'cloud.backupFailed': 'The current plans could not be backed up.',
  'cloud.settingsDocInvalid': 'The existing cloud user settings document is invalid.',
  'cloud.installedMetadataSaveFailed':
    'The installed-program metadata could not be saved.',
  'cloud.localUpdatedAfterVerify':
    'The local plan was updated only after cloud verification.',
  'cloud.previousSnapshotInvalid': 'The previous cloud plan snapshot is invalid.',
  'cloud.plansBackedUp': 'The previous local and cloud plans were backed up.',
  'cloud.priorMetadataRestoreFailed':
    'The prior installed-program metadata could not be restored.',
  'cloud.dismissFailed': 'The program could not be dismissed in the cloud.',
  'cloud.restoredVerified':
    'The restored cloud plan and installed metadata were verified before local changes.',
  'cloud.backupChanged': 'The selected cloud backup changed before restoration began.',
  'cloud.backupKept': 'The selected cloud backup was kept.',
  'cloud.backupNotFound': 'The selected cloud backup was not found.',
  'cloud.commitBackupFailed': 'The verified cloud backup could not be committed locally.',
  'cloud.commitProgramFailed': 'The verified cloud program could not be committed locally.',
  'cloud.settingsMergeMismatch':
    'The verified cloud settings document does not match the complete expected settings merge.',
  'cloud.planLocalSaveFailed': 'The verified plan could not be saved and verified locally.',
  'cloud.planExpectedLocally': 'A plan is expected locally but no cloud plan row exists.',
  'cloud.modeUnavailable': 'Cloud mode is unavailable for this account.',
  'cloud.status.saving': 'Saving cloud plan…',
  'cloud.status.verifying': 'Verifying cloud plan…',
  'cloud.status.restoring': 'Restoring previous plan…',
  'cloud.status.complete': 'Installation complete',
  'cloud.status.failed': 'Installation failed and previous plan restored',
  'cloud.notAvailableYet': 'Cloud program installation will be added in Part 4B.',

  'csv.date': 'Date',
  'csv.workoutName': 'Workout Name',
  'csv.sessionType': 'Session Type',
  'csv.standaloneId': 'Standalone Workout ID',
  'csv.programId': 'Program ID',
  'csv.programVersion': 'Program Version',
  'csv.programWeek': 'Program Week',
  'csv.exercise': 'Exercise',
  'csv.exerciseId': 'Exercise ID',
  'csv.canonicalId': 'Resolved Canonical ID',
  'csv.archived': 'Archived',
  'csv.setNumber': 'Set Number',
  'csv.reps': 'Reps',
  'csv.durationSeconds': 'Duration Seconds',
  'csv.formattedDuration': 'Formatted Duration',
  'csv.weightKg': 'Weight Kg',
  'csv.rpe': 'RPE',
  'csv.rir': 'RIR',
  'csv.painLevel': 'Pain Level',
  'csv.notes': 'Notes',
  'csv.completed': 'Completed',
  'csv.bodyWeightKg': 'Body Weight Kg',
  'csv.waistCm': 'Waist Cm',
  'csv.bellyCm': 'Belly Cm',
  'csv.chestCm': 'Chest Cm',
  'csv.shouldersCm': 'Shoulders Cm',
  'csv.leftArmCm': 'Left Arm Cm',
  'csv.rightArmCm': 'Right Arm Cm',
  'csv.hipsCm': 'Hips Cm',
  'csv.postureRating': 'Posture Rating',
  'csv.absVisibilityRating': 'Abs Visibility Rating',
  'csv.energyLevel': 'Energy Level',
  'csv.sleepQuality': 'Sleep Quality',
  'csv.standaloneWorkout': 'Standalone workout',
  'csv.scheduledWorkout': 'Scheduled workout',

  'demo.nutrition.1': 'Solid start. Trained chest, felt strong.',
  'demo.nutrition.2': 'Oysters for zinc. Good protein day.',
  'demo.nutrition.3': 'Busy day. Missed creatine and whey, protein a bit low.',
  'demo.nutrition.4': 'Best day of the week. Everything hit.',
  'demo.nutrition.5': 'Steady. Eggs and nuts, protein target reached.',
  'demo.fruit.dragon': 'Dragon fruit',
  'demo.fruit.mangosteen': 'Mangosteen',
  'demo.fruit.both': 'Dragon fruit, mangosteen',
  'demo.checkIn.1': 'Baseline week. Posture still collapses when tired.',
  'demo.checkIn.2': 'Chest and shoulders filling out. Waist holding steady.',
  'demo.checkIn.3': 'Upper body up, waist down. Abs starting to show in the morning.',

  // ----------------------------------------------------------------------- sync
  'sync.missingLocalId': 'Missing local id for delete.',
  'sync.missingPayload': 'Missing sync payload.',
  'sync.offlinePending': 'Offline. Pending changes will sync when online.',
  'sync.signInDownload': 'Sign in with a cloud account to download your data.',
  'sync.signInPending': 'Sign in with a cloud account to sync pending changes.',
  'sync.signInUpload': 'Sign in with a cloud account to upload your data.',
  'sync.savedLocally': 'Saved locally. Cloud sync failed.',
  'sync.someFailed': 'Some changes could not sync.',
  'sync.unknownError': 'unknown error',
  'sync.entity.bodyCheckIn': 'body check-in',
  'sync.entity.bodyCheckIns': 'body check-ins',
  'sync.entity.exerciseLibrary': 'exercise library',
  'sync.entity.nutritionLog': 'nutrition log',
  'sync.entity.nutritionLogs': 'nutrition logs',
  'sync.entity.pastedPrograms': 'pasted workout programs',
  'sync.entity.workoutPlan': 'workout plan',
  'sync.entity.programMetadata': 'workout program metadata',
  'sync.entity.workoutSession': 'workout session',
  'sync.entity.workoutSessions': 'workout sessions',
  'sync.entity.cloudSettings': 'cloud user settings',
  'sync.entity.cloudPlan': 'cloud workout plan',
  'sync.entity.cloudRow': 'cloud row',
  'sync.entity.localSave': 'local save',

  // --------------------------------------------------------------------- health
  'health.dbReachable': 'Database reachable.',
  'health.localNoAuth': 'Local mode (no auth).',
  'health.localNoStorage': 'Local mode (no storage).',
  'health.notSignedIn': 'Not signed in.',
  'health.signInStorage': 'Sign in to test storage access.',
  'health.storageReachable': 'Storage bucket reachable.',

  // --------------------------------------------------------------------- photos
  'photo.storageUnavailable': 'Cloud photo storage is not available.',
  'photo.missingSource': 'Migration is missing its data source.',
  'photo.noFile': 'No photo file provided.',
  'photo.signInMigrate': 'Sign in with a cloud account to migrate photos.',

  // ---------------------------------------------------------------------- images
  'image.readerUnavailable': 'FileReader unavailable',
  'image.noFile': 'No file selected.',
  'image.unsupportedType': 'Unsupported image type. Use JPG, PNG, or WEBP.',

  // ------------------------------------------------------------------ env / auth
  'env.localMode': 'Local Mode',
  'env.cloudMode': 'Cloud Mode',
  'env.localOnly': 'App is running in local-only mode (localStorage, no cloud sync).',
  'env.notConfigured':
    'Cloud sync is not configured. This deployment is using local browser storage only.',
  'auth.notConfigured':
    'Cloud sync is not configured. The app is running in local mode.',

  'env.production': 'Production',
  'env.development': 'Development',
  'env.missingUrl': 'VITE_SUPABASE_URL is missing.',
  'env.missingKey': 'VITE_SUPABASE_ANON_KEY is missing.',

  'cloudPanel.eyebrow': 'Cloud Sync',
  'cloudPanel.title': 'Login & cloud database',
  'cloudPanel.notConfiguredDev':
    'Cloud sync not configured. App is using local browser storage.',
  'cloudPanel.mode': 'Mode',
  'cloudPanel.cloudMode': 'Cloud mode',
  'cloudPanel.localMode': 'Local mode',
  'cloudPanel.supabaseConfigured': 'Supabase configured',
  'cloudPanel.signedInAs': 'Signed in as',
  'cloudPanel.notSignedIn': 'Not signed in',
  'cloudPanel.uploadConfirm':
    'This will upload your local browser data to your cloud account.',
  'cloudPanel.downloadConfirm':
    'This may overwrite local display data. Export a backup first if unsure.',
  'cloudPanel.photosConfirm':
    'This uploads local progress photos to your Supabase account. Keep a JSON backup first.',
  'cloudPanel.uploaded': 'Uploaded {count} records to the cloud.',
  'cloudPanel.uploadedWithIssues': {
    one: 'Uploaded {count} records with {issues} issue.',
    other: 'Uploaded {count} records with {issues} issues.',
  },
  'cloudPanel.downloaded': 'Downloaded {count} records. Reopen a page to see them.',
  'cloudPanel.unavailable': 'Cloud sync unavailable.',
  'cloudPanel.localRefreshed': 'Local data summary refreshed.',
  'cloudPanel.cloudRefreshed': 'Cloud data summary refreshed.',
  'cloudPanel.unreachable': 'Could not reach the cloud.',
  'cloudPanel.noPhotos': 'No local base64 photos needed migrating.',
  'cloudPanel.photosUploaded':
    'Uploaded {photos} photo(s) from {checkIns} check-in(s).',
  'cloudPanel.photosUploadedWithIssues':
    'Uploaded {photos} photo(s) from {checkIns} check-in(s) with {issues} issue(s).',
  'cloudPanel.photoMigrationFailed': 'Photo migration failed.',
  'cloudPanel.uploading': 'Uploading...',
  'cloudPanel.syncUp': 'Sync Local Data to Cloud',
  'cloudPanel.downloading': 'Downloading...',
  'cloudPanel.syncDown': 'Download Cloud Data to This Browser',
  'cloudPanel.uploadingPhotos': 'Uploading photos...',
  'cloudPanel.migratePhotos': 'Migrate Local Photos to Cloud',
  'cloudPanel.localSummary': 'View Local Data Summary',
  'cloudPanel.checking': 'Checking...',
  'cloudPanel.cloudSummary': 'View Cloud Data Summary',
  'cloudPanel.localBrowser': 'Local browser',
  'cloudPanel.cloudAccount': 'Cloud account',
  'cloudPanel.row.workoutSessions': 'Workout sessions',
  'cloudPanel.row.bodyCheckIns': 'Body check-ins',
  'cloudPanel.row.nutritionLogs': 'Nutrition logs',
  'cloudPanel.row.settings': 'Settings',
  'cloudPanel.row.customPlan': 'Custom plan',
  'cloudPanel.row.customLibrary': 'Custom library',

  'health.eyebrow': 'Cloud Health',
  'health.title': 'Deployment & connection status',
  'health.supabaseConfigured': 'Supabase configured',
  'health.loggedIn': 'User logged in',
  'health.databaseReachableLabel': 'Database reachable',
  'health.storageAvailable': 'Storage available',
  'health.lastChecked': 'Last checked',
  'health.runCheck': 'Run Health Check',
  'health.checking': 'Checking...',
  'health.skipped': 'Skipped',
  'health.notChecked': 'Not checked',

  // ------------------------------------------------------------- active program
  'program.customPlanName': 'Custom Workout Plan',
  'program.customPlanDescription': 'A manually configured workout plan.',
  'program.noneYet': 'No program yet',
  'program.uploadToStart': 'Upload a program file to start training.',
  'program.noneInstalled': 'No workout program is installed. Upload one to edit your plan.',
  'program.chooseValidDay': 'Choose a valid workout day to reset.',
  'program.baselineUnavailable': 'The active program baseline is unavailable.',
  'program.noPlanChangesSaved': '{reason} No plan changes were saved.',
  'program.standaloneIdRequired':
    'A standalone workout ID is required to start this workout.',

  // ------------------------------------------------------- pasted program errors
  'paste.storageFull':
    'Could not save the program. Device storage may be full - remove old programs or photos and try again.',
  'paste.noJson':
    'No JSON found. Paste the whole program object, starting with { and ending with }.',
  'paste.looksLikeDays':
    'This looks like a list of days, not a whole program. Wrap it in an object: { "name": "...", "days": [ ... ] }.',
  'paste.notProgramObject': 'The pasted JSON is not a program object.',
  'paste.invalidJson': 'The pasted text is not valid JSON.',
  'paste.setVersion': 'Set version to 1.0.0.',
  'paste.addedDescription': 'Added a placeholder description.',
  'paste.placeholderDescription': 'Added from a pasted program.',
  'paste.importInvalid': 'Invalid backup file.',
  'paste.importDone': 'Data imported.',
} as const

/**
 * Messages returned by the storage, sync and program services.
 *
 * These surface in the Program Manager's notice strip, the sync banner and
 * the Cloud Sync panel, so they are user-facing even though they are produced
 * far from any component.
 */
export const serviceMessages = {
  // -------------------------------------------------------- program validation
  'valid.notObject': 'Giáo án không phải là một đối tượng.',
  'valid.missingId': 'Thiếu hoặc để trống id của giáo án.',
  'valid.missingName': 'Thiếu hoặc để trống tên.',
  'valid.missingVersion': 'Thiếu hoặc để trống phiên bản.',
  'valid.missingUpdatedAt': 'Thiếu hoặc sai định dạng updatedAt.',
  'valid.missingDescription': 'Thiếu phần mô tả (không bắt buộc).',
  'valid.descriptionType': 'Mô tả phải là chuỗi ký tự nếu được cung cấp.',
  'valid.emptyGoals': 'Danh sách mục tiêu trống.',
  'valid.goalsArray': 'Mục tiêu phải là một mảng chuỗi ký tự.',
  'valid.goalsStrings': 'Mục tiêu chỉ được chứa các chuỗi không rỗng.',
  'valid.emptyBenchmarks': 'Danh sách bài đối chiếu trống.',
  'valid.benchmarksArray': 'ID bài đối chiếu phải là một mảng chuỗi ký tự.',
  'valid.benchmarksStrings': 'ID bài đối chiếu chỉ được chứa các chuỗi không rỗng.',
  'valid.missingDays': 'Thiếu hoặc để trống mảng days.',
  'valid.notSevenDays': 'Giáo án không có đúng bảy ngày.',
  'valid.daysNotSequential': 'Số thứ tự ngày không liên tiếp.',
  'valid.rulesObject': 'Rules phải là một đối tượng.',
  'valid.coachingObject': 'coaching phải là một đối tượng nếu được cung cấp.',
  'valid.coachingProtein':
    'Các mức đạm trong coaching phải thoả mãn min <= default <= max.',
  'valid.durationWeeks': 'durationWeeks phải là số nguyên dương nếu được cung cấp.',
  'valid.normalWeeklyDays':
    'normalWeeklyDays phải là số nguyên dương nếu được cung cấp.',
  'valid.progressionPhases':
    'progressionPhases phải là một mảng không rỗng nếu được cung cấp.',
  'valid.postureCue': 'rules.postureCue phải là chuỗi không rỗng nếu được cung cấp.',
  'valid.standaloneWorkouts': 'standaloneWorkouts phải là một mảng nếu được cung cấp.',
  'valid.invalidJson': 'Tệp giáo án chứa JSON không hợp lệ.',
  'valid.unexpected': 'Việc kiểm tra giáo án thất bại ngoài dự kiến.',

  // ------------------------------------------------------- local program manager
  'svc.idVersionRequired': 'Cần có ID và phiên bản của giáo án.',
  'svc.validIdVersionRequired': 'Cần có ID và phiên bản giáo án hợp lệ.',
  'svc.planAndReasonRequired': 'Cần có giáo án và lý do sao lưu.',
  'svc.noInstalledMetadata':
    'Không tìm thấy thông tin giáo án đã cài đặt trên máy.',
  'svc.installedMetadataInvalid': 'Thông tin giáo án đã cài đặt không hợp lệ.',
  'svc.installedTimestampInvalid': 'Dấu thời gian của giáo án đã cài không hợp lệ.',
  'svc.installedMetadataSaveFailed': 'Không lưu được thông tin giáo án đã cài đặt.',
  'svc.installedMetadataVerifyFailed':
    'Không xác minh được thông tin giáo án đã cài đặt.',
  'svc.installedMetadataSaved': 'Đã lưu thông tin giáo án đã cài đặt.',
  'svc.installedMetadataCleared': 'Đã xoá thông tin giáo án đã cài đặt.',
  'svc.installedMetadataClearFailed': 'Không xoá được thông tin giáo án đã cài đặt.',
  'svc.installedMetadataClearVerifyFailed':
    'Không xác minh được việc xoá thông tin giáo án đã cài đặt.',
  'svc.noClearNeeded': 'Không có thông tin giáo án đã cài nào cần xoá.',
  'svc.noneDismissed': 'Không có giáo án nào bị bỏ qua.',
  'svc.dismissedListInvalid': 'Danh sách giáo án đã bỏ qua không hợp lệ.',
  'svc.dismissedSaveFailed': 'Không lưu được giáo án đã bỏ qua.',
  'svc.dismissedVerifyFailed': 'Không xác minh được giáo án đã bỏ qua.',
  'svc.dismissedEntryClearFailed': 'Không xoá được mục giáo án đã bỏ qua.',
  'svc.dismissedEntryClearVerifyFailed':
    'Không xác minh được việc xoá mục giáo án đã bỏ qua.',
  'svc.dismissedEntryCleared': 'Đã xoá mục giáo án đã bỏ qua.',
  'svc.notDismissed': 'Giáo án này chưa bị bỏ qua.',
  'svc.noBackupsFound': 'Không tìm thấy bản sao lưu giáo án nào.',
  'svc.backupListInvalid': 'Danh sách sao lưu giáo án không hợp lệ.',
  'svc.backupSaveFailed': 'Không lưu được bản sao lưu giáo án.',
  'svc.backupVerifyFailed': 'Không xác minh được bản sao lưu giáo án.',
  'svc.backupCreated': 'Đã tạo bản sao lưu giáo án.',
  'svc.backupNotFound': 'Không tìm thấy bản sao lưu giáo án đã chọn.',
  'svc.planEmpty':
    'Không thể sao lưu giáo án hiện tại vì nó trống hoặc chưa đầy đủ.',
  'svc.planSaveFailed': 'Không lưu được nội dung giáo án.',
  'svc.planVerifyFailed': 'Không xác minh được nội dung giáo án đã lưu.',
  'svc.notInRegistry': 'Giáo án đã chọn không có trong danh mục giáo án.',
  'svc.notInRegistryShort': 'Giáo án đã chọn không có trong danh mục.',
  'svc.failedValidation':
    'Giáo án đã chọn không qua được bước kiểm tra nên chưa được cài đặt.',
  'svc.alreadyInstalled': 'Giáo án này đã được cài đặt.',
  'svc.activeWorkoutBlocks':
    'Hãy kết thúc hoặc huỷ buổi tập đang diễn ra trước khi đổi giáo án.',
  'svc.noActiveWorkoutBlock': 'Không có buổi tập nào chặn việc đổi giáo án.',
  'svc.historyUnchanged':
    'Lịch sử tập luyện và dữ liệu buổi tập đang diễn ra không bị thay đổi.',
  'svc.planBackedUpBeforeInstall': 'Giáo án trước đó đã được sao lưu trước khi cài đặt.',
  'svc.planBackedUpBeforeRestore': 'Giáo án hiện tại đã được sao lưu trước khi khôi phục.',
  'svc.backupPlanSaveFailed':
    'Không lưu được giáo án sao lưu; giáo án trước đó đã được khôi phục.',
  'svc.restoredPlanVerifyFailed':
    'Không xác minh được giáo án vừa khôi phục; giáo án trước đó đã được khôi phục.',
  'svc.restoredPlanFinalVerifyFailed':
    'Giáo án vừa khôi phục không qua được bước xác minh cuối; giáo án trước đó đã được khôi phục.',
  'svc.priorMetadataRestoreFailed':
    'Không khôi phục được thông tin giáo án trước đó; giáo án trước đó đã được khôi phục.',
  'svc.planAndMetadataVerified':
    'Đã xác minh giáo án đã lưu và thông tin giáo án đã cài đặt.',
  'svc.backupRestored':
    'Đã khôi phục bản sao lưu giáo án. Bản sao lưu đã chọn vẫn được giữ lại.',

  // --------------------------------------------------------------- cloud program
  'cloud.userIdRequired':
    'Cần có ID người dùng để nạp dữ liệu trình quản lý giáo án trên đám mây.',
  'cloud.signInToChange':
    'Hãy đăng nhập bằng tài khoản đám mây để đổi giáo án.',
  'cloud.notConfigured':
    'Supabase chưa được cấu hình. Ứng dụng đang chạy ở chế độ trên máy.',
  'cloud.offline': 'Hãy kết nối internet trước khi thay đổi giáo án trên đám mây.',
  'cloud.backupIdFailed': 'Không tạo được ID sao lưu đám mây duy nhất.',
  'cloud.metadataHydrateFailed':
    'Không nạp được thông tin trình quản lý giáo án trên đám mây.',
  'cloud.metadataLoadFailed':
    'Không tải được thông tin trình quản lý giáo án trên đám mây.',
  'cloud.metadataHydrated':
    'Đã nạp thông tin trình quản lý giáo án trên đám mây. Các bản sao lưu chỉ có trên máy vẫn được giữ.',
  'cloud.metadataInvalid': 'Thông tin trình quản lý giáo án trên đám mây không hợp lệ.',
  'cloud.metadataMustBeObject':
    'Thông tin trình quản lý giáo án trên đám mây phải là một đối tượng.',
  'cloud.dismissedMetadataInvalid':
    'Thông tin giáo án đã bỏ qua trên đám mây không hợp lệ.',
  'cloud.installedMetadataInvalid':
    'Thông tin giáo án đã cài trên đám mây không hợp lệ.',
  'cloud.settingsMustBeObject': 'Cài đặt người dùng trên đám mây phải là một đối tượng.',
  'cloud.planMustBeArray': 'Giáo án trên đám mây phải là một mảng.',
  'cloud.refetchFailed': 'Không tải lại được dữ liệu từ đám mây.',
  'cloud.verifyFailedAfterInstall': 'Xác minh trên đám mây thất bại sau khi cài đặt.',
  'cloud.verifyFailedDuringRestore':
    'Xác minh trên đám mây thất bại khi đang khôi phục bản sao lưu.',
  'cloud.backupMetadataInvalid':
    'Thông tin bản sao lưu giáo án trên đám mây không hợp lệ.',
  'cloud.backupRestored': 'Đã khôi phục bản sao lưu giáo án trên đám mây.',
  'cloud.hydratedLoaded': 'Đã tải thông tin trình quản lý giáo án từ đám mây.',
  'cloud.noHydrated':
    'Không tìm thấy thông tin trình quản lý giáo án trên đám mây cho tài khoản này.',
  'cloud.localSaveVerifyFailed':
    'Không lưu và xác minh được thông tin trình quản lý giáo án trên máy.',
  'cloud.rollbackMetadataVerifyFailed':
    'Không xác minh được thông tin đám mây trước đó sau khi hoàn tác.',
  'cloud.rollbackMetadataRestored':
    'Đã khôi phục thông tin đám mây trước đó; bản sao lưu vừa tạo vẫn được giữ.',
  'cloud.rollbackMetadataFailed': 'Hoàn tác thông tin đám mây trước đó thất bại.',
  'cloud.rollbackPlanVerifyFailed':
    'Không xác minh được giáo án đám mây trước đó sau khi hoàn tác.',
  'cloud.rollbackPlanRestored': 'Đã khôi phục và xác minh giáo án đám mây trước đó.',
  'cloud.rollbackPlanFailed': 'Hoàn tác giáo án đám mây trước đó thất bại.',
  'cloud.rollbackSettingsVerifyFailed':
    'Không xác minh được cài đặt đám mây trước đó sau khi hoàn tác.',
  'cloud.rollbackSettingsRestored': 'Đã khôi phục và xác minh cài đặt đám mây trước đó.',
  'cloud.rollbackSettingsFailed': 'Hoàn tác cài đặt đám mây trước đó thất bại.',
  'cloud.backupPlanRestoreFailed': 'Không khôi phục được giáo án từ bản sao lưu đám mây.',
  'cloud.planHistoryUnchanged':
    'Giáo án tuỳ chỉnh trên đám mây và lịch sử tập luyện không bị thay đổi.',
  'cloud.planRowExists': 'Bản ghi giáo án tuỳ chỉnh trên đám mây vẫn còn tồn tại.',
  'cloud.dismissalVerifyFailed':
    'Không xác minh được thông tin bỏ qua giáo án trên đám mây.',
  'cloud.dismissalCacheFailed':
    'Việc bỏ qua trên đám mây đã được xác minh, nhưng bộ nhớ đệm trên máy không cập nhật được.',
  'cloud.installedMetadataMismatch':
    'Thông tin giáo án đã cài trên đám mây không khớp.',
  'cloud.planRefetchedVerified':
    'Đã tải lại và xác minh giáo án cùng thông tin giáo án đã cài trên đám mây.',
  'cloud.planMismatch': 'Giáo án trên đám mây không khớp với giáo án mong đợi.',
  'cloud.settingsAbsent': 'Tài liệu cài đặt trên đám mây không tồn tại hoặc không hợp lệ.',
  'cloud.backupVerifyFailed': 'Không xác minh được bản sao lưu giáo án trên đám mây.',
  'cloud.planSaveFailed': 'Không lưu được giáo án lên đám mây.',
  'cloud.currentPlanInvalid': 'Giáo án tuỳ chỉnh hiện tại trên đám mây không hợp lệ.',
  'cloud.plansBackedUpBeforeRestore':
    'Giáo án hiện tại trên máy và trên đám mây đã được sao lưu trước khi khôi phục.',
  'cloud.backupFailed': 'Không sao lưu được các giáo án hiện tại.',
  'cloud.settingsDocInvalid':
    'Tài liệu cài đặt người dùng hiện có trên đám mây không hợp lệ.',
  'cloud.installedMetadataSaveFailed': 'Không lưu được thông tin giáo án đã cài đặt.',
  'cloud.localUpdatedAfterVerify':
    'Giáo án trên máy chỉ được cập nhật sau khi đã xác minh trên đám mây.',
  'cloud.previousSnapshotInvalid': 'Bản chụp giáo án đám mây trước đó không hợp lệ.',
  'cloud.plansBackedUp': 'Đã sao lưu giáo án trước đó trên máy và trên đám mây.',
  'cloud.priorMetadataRestoreFailed':
    'Không khôi phục được thông tin giáo án đã cài trước đó.',
  'cloud.dismissFailed': 'Không bỏ qua được giáo án này trên đám mây.',
  'cloud.restoredVerified':
    'Giáo án và thông tin cài đặt khôi phục từ đám mây đã được xác minh trước khi thay đổi trên máy.',
  'cloud.backupChanged':
    'Bản sao lưu đám mây đã chọn thay đổi trước khi quá trình khôi phục bắt đầu.',
  'cloud.backupKept': 'Bản sao lưu đám mây đã chọn vẫn được giữ lại.',
  'cloud.backupNotFound': 'Không tìm thấy bản sao lưu đám mây đã chọn.',
  'cloud.commitBackupFailed':
    'Không ghi được bản sao lưu đám mây đã xác minh xuống máy.',
  'cloud.commitProgramFailed': 'Không ghi được giáo án đám mây đã xác minh xuống máy.',
  'cloud.settingsMergeMismatch':
    'Tài liệu cài đặt đám mây đã xác minh không khớp với kết quả hợp nhất cài đặt mong đợi.',
  'cloud.planLocalSaveFailed':
    'Không lưu và xác minh được giáo án đã xác minh trên máy.',
  'cloud.planExpectedLocally':
    'Trên máy có giáo án nhưng trên đám mây không có bản ghi giáo án nào.',
  'cloud.modeUnavailable': 'Chế độ đám mây không khả dụng cho tài khoản này.',
  'cloud.status.saving': 'Đang lưu giáo án lên đám mây…',
  'cloud.status.verifying': 'Đang xác minh giáo án trên đám mây…',
  'cloud.status.restoring': 'Đang khôi phục giáo án trước đó…',
  'cloud.status.complete': 'Cài đặt hoàn tất',
  'cloud.status.failed': 'Cài đặt thất bại và giáo án trước đó đã được khôi phục',
  'cloud.notAvailableYet': 'Việc cài đặt giáo án trên đám mây sẽ có ở Phần 4B.',

  'csv.date': 'Ngày',
  'csv.workoutName': 'Tên buổi tập',
  'csv.sessionType': 'Loại buổi tập',
  'csv.standaloneId': 'ID buổi tập độc lập',
  'csv.programId': 'ID giáo án',
  'csv.programVersion': 'Phiên bản giáo án',
  'csv.programWeek': 'Tuần của giáo án',
  'csv.exercise': 'Bài tập',
  'csv.exerciseId': 'ID bài tập',
  'csv.canonicalId': 'ID chuẩn đã xác định',
  'csv.archived': 'Đã lưu trữ',
  'csv.setNumber': 'Hiệp số',
  'csv.reps': 'Số lần',
  'csv.durationSeconds': 'Thời lượng (giây)',
  'csv.formattedDuration': 'Thời lượng',
  'csv.weightKg': 'Mức tạ (kg)',
  'csv.rpe': 'RPE',
  'csv.rir': 'RIR',
  'csv.painLevel': 'Mức đau',
  'csv.notes': 'Ghi chú',
  'csv.completed': 'Đã hoàn thành',
  'csv.bodyWeightKg': 'Cân nặng (kg)',
  'csv.waistCm': 'Vòng eo (cm)',
  'csv.bellyCm': 'Vòng bụng (cm)',
  'csv.chestCm': 'Vòng ngực (cm)',
  'csv.shouldersCm': 'Vòng vai (cm)',
  'csv.leftArmCm': 'Tay trái (cm)',
  'csv.rightArmCm': 'Tay phải (cm)',
  'csv.hipsCm': 'Vòng hông (cm)',
  'csv.postureRating': 'Điểm tư thế',
  'csv.absVisibilityRating': 'Độ rõ cơ bụng',
  'csv.energyLevel': 'Mức năng lượng',
  'csv.sleepQuality': 'Chất lượng giấc ngủ',
  'csv.standaloneWorkout': 'Buổi tập độc lập',
  'csv.scheduledWorkout': 'Buổi tập theo lịch',

  // ----------------------------------------------------------------------- sync
  'sync.missingLocalId': 'Thiếu id trên máy để xoá.',
  'sync.missingPayload': 'Thiếu dữ liệu đồng bộ.',
  'sync.offlinePending':
    'Đang ngoại tuyến. Các thay đổi sẽ được đồng bộ khi có mạng.',
  'sync.signInDownload': 'Hãy đăng nhập bằng tài khoản đám mây để tải dữ liệu về.',
  'sync.signInPending':
    'Hãy đăng nhập bằng tài khoản đám mây để đồng bộ các thay đổi đang chờ.',
  'sync.signInUpload': 'Hãy đăng nhập bằng tài khoản đám mây để tải dữ liệu lên.',
  'sync.savedLocally': 'Đã lưu trên máy. Đồng bộ đám mây thất bại.',
  'sync.someFailed': 'Một số thay đổi không đồng bộ được.',
  'sync.unknownError': 'lỗi không xác định',
  'sync.entity.bodyCheckIn': 'lần đo cơ thể',
  'sync.entity.bodyCheckIns': 'các lần đo cơ thể',
  'sync.entity.exerciseLibrary': 'thư viện bài tập',
  'sync.entity.nutritionLog': 'nhật ký dinh dưỡng',
  'sync.entity.nutritionLogs': 'các nhật ký dinh dưỡng',
  'sync.entity.pastedPrograms': 'các giáo án đã dán',
  'sync.entity.workoutPlan': 'giáo án tập luyện',
  'sync.entity.programMetadata': 'thông tin giáo án tập luyện',
  'sync.entity.workoutSession': 'buổi tập',
  'sync.entity.workoutSessions': 'các buổi tập',
  'sync.entity.cloudSettings': 'cài đặt người dùng trên đám mây',
  'sync.entity.cloudPlan': 'giáo án trên đám mây',
  'sync.entity.cloudRow': 'bản ghi trên đám mây',
  'sync.entity.localSave': 'lưu trên máy',

  // --------------------------------------------------------------------- health
  'health.dbReachable': 'Kết nối được tới cơ sở dữ liệu.',
  'health.localNoAuth': 'Chế độ trên máy (không đăng nhập).',
  'health.localNoStorage': 'Chế độ trên máy (không có kho lưu trữ).',
  'health.notSignedIn': 'Chưa đăng nhập.',
  'health.signInStorage': 'Hãy đăng nhập để kiểm tra quyền truy cập kho lưu trữ.',
  'health.storageReachable': 'Kết nối được tới kho lưu trữ.',

  // --------------------------------------------------------------------- photos
  'photo.storageUnavailable': 'Kho ảnh trên đám mây không khả dụng.',
  'photo.missingSource': 'Quá trình chuyển dữ liệu thiếu nguồn dữ liệu.',
  'photo.noFile': 'Chưa chọn tệp ảnh nào.',
  'photo.signInMigrate': 'Hãy đăng nhập bằng tài khoản đám mây để chuyển ảnh.',

  // ---------------------------------------------------------------------- images
  'image.readerUnavailable': 'FileReader không khả dụng',
  'image.noFile': 'Chưa chọn tệp nào.',
  'image.unsupportedType':
    'Định dạng ảnh không được hỗ trợ. Hãy dùng JPG, PNG hoặc WEBP.',

  // ------------------------------------------------------------------ env / auth
  'env.localMode': 'Chế độ trên máy',
  'env.cloudMode': 'Chế độ đám mây',
  'env.localOnly':
    'Ứng dụng đang chạy ở chế độ chỉ lưu trên máy (localStorage, không đồng bộ đám mây).',
  'env.notConfigured':
    'Đồng bộ đám mây chưa được cấu hình. Bản triển khai này chỉ dùng bộ nhớ trình duyệt.',
  'auth.notConfigured':
    'Đồng bộ đám mây chưa được cấu hình. Ứng dụng đang chạy ở chế độ trên máy.',

  'env.production': 'Bản phát hành',
  'env.development': 'Bản phát triển',
  'env.missingUrl': 'Thiếu VITE_SUPABASE_URL.',
  'env.missingKey': 'Thiếu VITE_SUPABASE_ANON_KEY.',

  'cloudPanel.eyebrow': 'Đồng bộ đám mây',
  'cloudPanel.title': 'Đăng nhập và cơ sở dữ liệu đám mây',
  'cloudPanel.notConfiguredDev':
    'Chưa cấu hình đồng bộ đám mây. Ứng dụng đang dùng bộ nhớ trình duyệt.',
  'cloudPanel.mode': 'Chế độ',
  'cloudPanel.cloudMode': 'Chế độ đám mây',
  'cloudPanel.localMode': 'Chế độ trên máy',
  'cloudPanel.supabaseConfigured': 'Đã cấu hình Supabase',
  'cloudPanel.signedInAs': 'Đang đăng nhập bằng',
  'cloudPanel.notSignedIn': 'Chưa đăng nhập',
  'cloudPanel.uploadConfirm':
    'Thao tác này sẽ tải dữ liệu trong trình duyệt lên tài khoản đám mây của bạn.',
  'cloudPanel.downloadConfirm':
    'Thao tác này có thể ghi đè dữ liệu hiển thị trên máy. Hãy xuất một bản sao lưu trước nếu bạn chưa chắc.',
  'cloudPanel.photosConfirm':
    'Thao tác này tải ảnh tiến trình trên máy lên tài khoản Supabase của bạn. Hãy giữ một bản sao lưu JSON trước.',
  'cloudPanel.uploaded': 'Đã tải {count} bản ghi lên đám mây.',
  'cloudPanel.uploadedWithIssues': {
    one: 'Đã tải {count} bản ghi với {issues} lỗi.',
    other: 'Đã tải {count} bản ghi với {issues} lỗi.',
  },
  'cloudPanel.downloaded':
    'Đã tải về {count} bản ghi. Hãy mở lại một trang để xem chúng.',
  'cloudPanel.unavailable': 'Đồng bộ đám mây không khả dụng.',
  'cloudPanel.localRefreshed': 'Đã làm mới tóm tắt dữ liệu trên máy.',
  'cloudPanel.cloudRefreshed': 'Đã làm mới tóm tắt dữ liệu trên đám mây.',
  'cloudPanel.unreachable': 'Không kết nối được tới đám mây.',
  'cloudPanel.noPhotos': 'Không có ảnh base64 nào trên máy cần chuyển.',
  'cloudPanel.photosUploaded': 'Đã tải {photos} ảnh từ {checkIns} lần đo.',
  'cloudPanel.photosUploadedWithIssues':
    'Đã tải {photos} ảnh từ {checkIns} lần đo, có {issues} lỗi.',
  'cloudPanel.photoMigrationFailed': 'Chuyển ảnh thất bại.',
  'cloudPanel.uploading': 'Đang tải lên...',
  'cloudPanel.syncUp': 'Đồng bộ dữ liệu trên máy lên đám mây',
  'cloudPanel.downloading': 'Đang tải về...',
  'cloudPanel.syncDown': 'Tải dữ liệu đám mây về trình duyệt này',
  'cloudPanel.uploadingPhotos': 'Đang tải ảnh lên...',
  'cloudPanel.migratePhotos': 'Chuyển ảnh trên máy lên đám mây',
  'cloudPanel.localSummary': 'Xem tóm tắt dữ liệu trên máy',
  'cloudPanel.checking': 'Đang kiểm tra...',
  'cloudPanel.cloudSummary': 'Xem tóm tắt dữ liệu trên đám mây',
  'cloudPanel.localBrowser': 'Trình duyệt trên máy',
  'cloudPanel.cloudAccount': 'Tài khoản đám mây',
  'cloudPanel.row.workoutSessions': 'Buổi tập',
  'cloudPanel.row.bodyCheckIns': 'Lần đo cơ thể',
  'cloudPanel.row.nutritionLogs': 'Nhật ký dinh dưỡng',
  'cloudPanel.row.settings': 'Cài đặt',
  'cloudPanel.row.customPlan': 'Giáo án tuỳ chỉnh',
  'cloudPanel.row.customLibrary': 'Thư viện tuỳ chỉnh',

  'health.eyebrow': 'Tình trạng đám mây',
  'health.title': 'Trạng thái triển khai và kết nối',
  'health.supabaseConfigured': 'Đã cấu hình Supabase',
  'health.loggedIn': 'Người dùng đã đăng nhập',
  'health.databaseReachableLabel': 'Kết nối được cơ sở dữ liệu',
  'health.storageAvailable': 'Kho lưu trữ khả dụng',
  'health.lastChecked': 'Kiểm tra lần cuối',
  'health.runCheck': 'Chạy kiểm tra',
  'health.checking': 'Đang kiểm tra...',
  'health.skipped': 'Đã bỏ qua',
  'health.notChecked': 'Chưa kiểm tra',

  // ------------------------------------------------------------- active program
  'program.customPlanName': 'Giáo án tuỳ chỉnh',
  'program.customPlanDescription': 'Một giáo án được cấu hình thủ công.',
  'program.noneYet': 'Chưa có giáo án',
  'program.uploadToStart': 'Hãy tải lên một tệp giáo án để bắt đầu tập.',
  'program.noneInstalled':
    'Chưa cài đặt giáo án nào. Hãy tải lên một giáo án để chỉnh sửa kế hoạch của bạn.',
  'program.chooseValidDay': 'Hãy chọn một ngày tập hợp lệ để đặt lại.',
  'program.baselineUnavailable': 'Không có dữ liệu gốc của giáo án đang dùng.',
  'program.noPlanChangesSaved': '{reason} Không có thay đổi nào được lưu.',
  'program.standaloneIdRequired':
    'Cần có ID buổi tập độc lập để bắt đầu buổi tập này.',

  // ------------------------------------------------------- pasted program errors
  'paste.storageFull':
    'Không lưu được giáo án. Bộ nhớ thiết bị có thể đã đầy - hãy xoá bớt giáo án hoặc ảnh cũ rồi thử lại.',
  'paste.noJson':
    'Không tìm thấy JSON. Hãy dán toàn bộ đối tượng giáo án, bắt đầu bằng { và kết thúc bằng }.',
  'paste.looksLikeDays':
    'Nội dung này trông giống danh sách các ngày chứ không phải một giáo án hoàn chỉnh. Hãy bọc nó trong một đối tượng: { "name": "...", "days": [ ... ] }.',
  'paste.notProgramObject': 'JSON đã dán không phải là một đối tượng giáo án.',
  'paste.invalidJson': 'Nội dung đã dán không phải JSON hợp lệ.',
  'paste.setVersion': 'Đã đặt phiên bản thành 1.0.0.',
  'paste.addedDescription': 'Đã thêm một mô tả tạm.',
  'paste.placeholderDescription': 'Được thêm từ một giáo án đã dán.',
  'paste.importInvalid': 'Tệp sao lưu không hợp lệ.',
  'paste.importDone': 'Đã nhập dữ liệu.',
} as const

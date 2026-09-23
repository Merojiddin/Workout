/**
 * Program management: the manager panel, the upload/paste flow, the read-only
 * preview, install confirmation, and the messages the program services return.
 */
export const programMessages = {
  'pm.cloudTitle': 'Trình quản lý giáo án đám mây',
  'pm.localTitle': 'Trình quản lý giáo án trên máy',
  'pm.heading': 'Giáo án tập luyện',
  'pm.cloudIntro':
    'Thêm giáo án cho tại nhà hoặc phòng gym, xem trước và chọn giáo án muốn dùng. Các giáo án đã lưu vẫn luôn có sẵn.',
  'pm.localIntro':
    'Thêm giáo án cho tại nhà hoặc phòng gym, xem trước và chọn giáo án muốn dùng. Các giáo án đã lưu vẫn luôn có sẵn.',
  'pm.cloudOffline':
    'Bạn có thể chọn giáo án đã lưu khi ngoại tuyến. Thao tác với bản sao lưu và ẩn giáo án trên đám mây cần kết nối internet.',
  'pm.activeWorkoutBlocked':
    'Hãy kết thúc hoặc huỷ buổi tập đang diễn ra trước khi đổi giáo án.',
  'pm.unsavedEdits':
    'Hãy lưu các chỉnh sửa thủ công trước khi cài đặt hoặc khôi phục giáo án.',
  'pm.unsavedInstall':
    'Hãy lưu các chỉnh sửa thủ công trước khi cài đặt giáo án.',
  'pm.unsavedRestore':
    'Hãy lưu các chỉnh sửa thủ công trước khi khôi phục bản sao lưu giáo án.',
  'pm.useCloudBackup':
    'Hãy dùng bản sao lưu trên đám mây khi đồng bộ đám mây đang bật.',
  'pm.installedUnavailable':
    'Giáo án đã cài không có sẵn trong phiên bản này.',
  'pm.modifiedAfterInstall': 'Đã chỉnh sửa sau khi cài đặt',
  'pm.customPlan': 'Giáo án tuỳ chỉnh',
  'pm.noProgram': 'Chưa cài giáo án nào',
  'pm.planNameModified': '{name} (đã chỉnh sửa)',

  'pm.restoreLocalConfirm':
    'Khôi phục bản sao lưu giáo án này? Giáo án hiện tại sẽ được sao lưu trước.',
  'pm.restoreCloudConfirm':
    'Khôi phục bản sao lưu giáo án trên đám mây này? Giáo án hiện tại trên máy và trên đám mây sẽ được sao lưu trước.',

  'pm.hideDismissed': 'Ẩn các giáo án đã bỏ qua',
  'pm.showDismissed': 'Hiện lại các giáo án đã bỏ qua ({count})',
  'pm.exportCurrent': 'Xuất giáo án hiện tại',
  'pm.exportNote':
    'Bản xuất chứa giáo án đã lưu gần nhất; các thay đổi chưa lưu trong trình sửa sẽ không được đưa vào.',

  'pm.status.current': 'Đang dùng',
  'pm.status.available': 'Có sẵn',
  'pm.status.dismissed': 'Đã bỏ qua',
  'pm.version': 'Phiên bản {version}',
  'pm.updated': 'Cập nhật',
  'pm.days': 'Số ngày',
  'pm.exercises': 'Số bài tập',
  'pm.validationWarningCount': {
    one: '{count} cảnh báo kiểm tra',
    other: '{count} cảnh báo kiểm tra',
  },
  'pm.preview': 'Xem trước',
  'pm.install': 'Dùng giáo án này',
  'pm.reapply': 'Áp dụng bản mới',
  'pm.currentProgram': 'Giáo án hiện tại',
  'pm.keepCurrent': 'Giữ giáo án hiện tại',
  'pm.currentKept': 'Đã giữ giáo án hiện tại',

  'pm.backupsEyebrow': 'Bản sao an toàn trên máy và đám mây',
  'pm.backupsHeading': 'Sao lưu giáo án',
  'pm.localBackups': 'Sao lưu trên máy',
  'pm.cloudBackups': 'Sao lưu trên đám mây',
  'pm.noLocalBackups': 'Chưa tạo bản sao lưu nào trên máy.',
  'pm.noCloudBackups':
    'Chưa có bản sao lưu đám mây nào được tạo cho tài khoản này.',
  'pm.localBackup': 'Sao lưu trên máy',
  'pm.cloudBackup': 'Sao lưu trên đám mây',
  'pm.previousProgram': 'Giáo án trước đó: ',
  'pm.noneRecorded': 'Không ghi nhận',
  'pm.backupDays': { one: '{count} ngày', other: '{count} ngày' },
  'pm.restore': 'Khôi phục',
  'pm.exportBackup': 'Xuất bản sao lưu',

  'pm.previewEyebrow': 'Xem trước giáo án (chỉ đọc)',
  'pm.programId': 'Mã giáo án',
  'pm.duration': 'Thời lượng',
  'pm.exerciseOccurrences': 'Số lượt bài tập',
  'pm.validationWarnings': 'Cảnh báo kiểm tra',
  'pm.phasesHeading': 'Các giai đoạn tăng tiến',
  'pm.volume': 'Khối lượng:',
  'pm.effort': 'Mức gắng sức:',
  'pm.comparisonHeading': 'So sánh nhanh hai giáo án',
  'pm.currentPlan': 'Giáo án hiện tại',
  'pm.selectedProgram': 'Giáo án đã chọn',
  'pm.currentOccurrences': 'Số lượt bài tập hiện tại',
  'pm.newOccurrences': 'Số lượt bài tập mới',
  'pm.standaloneWorkout': 'Buổi tập độc lập',
  'pm.recommendedUse': 'Nên dùng khi:',
  'pm.noneListed': 'Không có mục nào.',
  'pm.none': 'Không có',

  'pm.closePreview': 'Đóng xem trước giáo án',
  'pm.restSeconds': 'Nghỉ: {seconds} giây',
  'pm.guidancePrefix': 'Hướng dẫn:',

  'pm.benchmarks': 'Bài tập đối chiếu',
  'pm.changedDays': 'Những ngày đổi tên',
  'pm.exercisesAdded': 'Bài tập được thêm',
  'pm.exercisesRemoved': 'Bài tập bị bỏ',
  'pm.optionalStandalone': 'Buổi tập độc lập (không bắt buộc)',
  'pm.workoutRules': 'Nguyên tắc buổi tập',

  'pm.rules.effort': 'Nguyên tắc — Mức gắng sức',
  'pm.rules.progression': 'Nguyên tắc — Tăng tiến',
  'pm.rules.rest': 'Nguyên tắc — Nghỉ giữa hiệp',
  'pm.rules.substitutions': 'Nguyên tắc — Thay thế bài tập',
  'pm.rules.posture': 'Nguyên tắc — Lưu ý tư thế',
  'pm.rules.returnAfterBreak': 'Nguyên tắc — Quay lại sau khi nghỉ dài',
  'pm.rules.safety': 'Nguyên tắc — An toàn',
  'pm.rules.neckWork': 'Nguyên tắc — Bài cổ (không bắt buộc)',

  'pm.confirmCloudTitle': 'Dùng giáo án này?',
  'pm.confirmLocalTitle': 'Dùng giáo án này?',
  'pm.confirmCloudCopy':
    'Giáo án hiện tại và các chỉnh sửa đã lưu vẫn có sẵn sau khi chuyển. Lựa chọn này được lưu vào tài khoản và lịch sử tập luyện được giữ nguyên.',
  'pm.confirmLocalCopy':
    'Giáo án hiện tại và các chỉnh sửa đã lưu vẫn có sẵn sau khi chuyển. Bạn có thể chọn lại bất cứ lúc nào và lịch sử tập luyện được giữ nguyên.',
  'pm.installProgram': 'Dùng giáo án này',
  'pm.activeWorkoutBlock': 'Chặn do buổi tập đang diễn ra',
  'pm.blocked': 'Đang bị chặn',
  'pm.noActiveWorkout': 'Không có buổi tập nào đang diễn ra',

  'paste.open': 'Thêm một giáo án',
  'paste.close': 'Đóng bảng nhập',
  'paste.hint':
    'Hãy tải giáo án của bạn lên dưới dạng tệp .json. Nếu giáo án đang ở dạng văn bản thuần, hãy sao chép lời nhắc bên dưới vào ChatGPT (hoặc bất kỳ AI chat nào) kèm giáo án của bạn, rồi tải lên hoặc dán đoạn JSON nhận được.',
  'paste.destination': 'Địa điểm tập',
  'paste.destinationHint': 'Thêm giáo án vào danh sách tại nhà, phòng gym hoặc cả hai.',
  'paste.location.home': 'Tại nhà',
  'paste.location.gym': 'Phòng gym',
  'paste.location.both': 'Tại nhà và phòng gym',
  'paste.copyName': '{name} (bản sao {number})',
  'paste.savedChoice': 'Đã thêm "{name}". Hãy chọn giáo án này trong danh sách khi bạn muốn sử dụng.',
  'paste.activeDeleteBlocked': 'Hãy chọn giáo án khác để sử dụng trước khi xoá giáo án này.',
  'library.selected': 'Đã chọn giáo án tập.',
  'library.syncPending': 'Lựa chọn giáo án đang được đồng bộ. Hãy thử lại thao tác đám mây này sau khi đồng bộ xong.',
  'library.offlineSelection': 'Lựa chọn được lưu trên thiết bị và sẽ đồng bộ khi có kết nối trở lại.',
  'library.queueFailed': 'Không thể lưu lựa chọn trên thiết bị. Hãy giải phóng bộ nhớ rồi thử lại; giáo án trước đó vẫn được chọn.',
  'library.wrongLocation': 'Giáo án này không có sẵn cho địa điểm tập này.',
  'valid.trainingLocations': 'trainingLocations phải chứa home, gym hoặc cả hai.',
  'paste.chooseFile': 'Chọn tệp giáo án',
  'paste.loaded': 'Đã tải {name}',
  'paste.readFailed': 'Không đọc được "{name}". Hãy thử chọn lại tệp.',
  'paste.jsonLabel': 'JSON giáo án',
  'paste.jsonLabelNote': '(hoặc dán vào đây)',
  'paste.check': 'Kiểm tra',
  'paste.save': 'Lưu giáo án',
  'paste.looksGood': '{name} hợp lệ - {days} ngày, {exercises} bài tập.',
  'paste.saveHint': 'Lưu để thêm một lựa chọn. Giáo án bạn đang dùng vẫn được giữ nguyên.',
  'paste.cannotSave': 'Giáo án này chưa lưu được.',
  'paste.warningSummary': {
    one: '{count} cảnh báo (giáo án vẫn dùng được)',
    other: '{count} cảnh báo (giáo án vẫn dùng được)',
  },
  'paste.savedTitle': 'Các giáo án bạn đã thêm ({count})',
  'paste.removeAria': 'Xoá {name} {version}',
  'paste.removeConfirm':
    'Xoá "{name}" {version} khỏi danh sách giáo án của bạn?\n\nThao tác này không thay đổi giáo án đang dùng.',
  'paste.removed': 'Đã xoá "{name}" {version}.',
  'paste.savedThenInstall':
    '{message} Hãy chọn giáo án này khi bạn muốn sử dụng.',
} as const

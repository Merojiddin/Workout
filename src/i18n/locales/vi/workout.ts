/** Today's Workout: the pre-workout screen, the live session and its sheets. */
export const workoutMessages = {
  'workout.greeting': 'Chào {name}',
  'workout.greetingAnonymous': 'Sẵn sàng tập',
  'workout.greetingSub': 'Sẵn sàng cho buổi tập hôm nay chưa?',

  'workout.currentPlan': 'Giáo án hiện tại',
  'workout.weekOf': 'Tuần {week} / {total}',
  'workout.todaysWorkout': 'Buổi tập hôm nay',
  'workout.dayNumber': 'Ngày {day}',
  'workout.exerciseCount': { one: '{count} bài tập', other: '{count} bài tập' },
  'workout.easyWeekNotice':
    '{phase}: giữ nhẹ nhàng và đừng cố nâng nặng hơn trong tuần này.',

  'workout.trainingLocation': 'Nơi tập',
  'workout.locationHome': 'Tại nhà',
  'workout.locationGym': 'Phòng gym',
  'workout.start': 'Bắt đầu tập',

  'workout.statExercises': 'bài tập',
  'workout.statWorkingSets': 'hiệp chính',
  'workout.statMinutes': 'phút',
  'workout.exercisesHeading': 'Bài tập',

  'workout.emptyDay': 'Ngày này chưa có bài tập nào.',
  'workout.viewWeeklyPlan': 'Xem lịch tập tuần',
  'workout.emptySession': 'Buổi tập này không có bài nào để thực hiện.',

  'workout.showOtherDays': 'Tập một ngày khác',
  'workout.hideOtherDays': 'Ẩn các buổi tập khác',
  'workout.chooseWorkout': 'Chọn một buổi tập',
  'workout.extraStartsNow': 'Bổ sung · bắt đầu ngay',

  'workout.saveFailed':
    'Không lưu được buổi tập này - bộ nhớ thiết bị đã đầy. Hãy giải phóng dung lượng (Thêm > Cài đặt > Sao lưu) rồi bấm Kết thúc lại. Buổi tập của bạn vẫn còn đây.',
  'workout.discardConfirm': {
    one: 'Huỷ buổi tập này? {count} hiệp đã hoàn thành sẽ bị xoá và không thể khôi phục.',
    other:
      'Huỷ buổi tập này? {count} hiệp đã hoàn thành sẽ bị xoá và không thể khôi phục.',
  },
  'workout.discardConfirmEmpty': 'Huỷ buổi tập này? Không thể khôi phục lại.',
  'workout.endConfirm': {
    one: 'Kết thúc buổi tập tại đây? Vẫn còn {count} hiệp theo kế hoạch. Mọi thứ bạn đã làm đều được lưu.',
    other:
      'Kết thúc buổi tập tại đây? Vẫn còn {count} hiệp theo kế hoạch. Mọi thứ bạn đã làm đều được lưu.',
  },

  'live.exerciseFallback': 'Bài tập',
  'live.setOf': 'Hiệp {current}/{total} · {target}',
  'live.swapAria': 'Đổi bài tập này sang bài thay thế',
  'live.formGuideAria': 'Hướng dẫn kỹ thuật, mẹo và video',
  'live.swapWithCount': 'Đổi bài tập ({count})',
  'live.formGuide': 'Hướng dẫn kỹ thuật, mẹo và video',
  'live.endAria': 'Kết thúc buổi tập tại đây',
  'live.end': 'Kết thúc buổi tập',
  'live.finish': 'Kết thúc',
  'live.finishWorkout': 'Kết thúc buổi tập',
  'live.nextExercise': 'Bài tiếp theo',
  'live.nextSet': 'Hiệp tiếp theo',
  'live.backOneSet': 'Lùi lại một hiệp',
  'live.skipAria': 'Bỏ qua, sang bài tiếp theo',
  'live.skip': 'Bỏ qua',
  'live.listAria': 'Phần còn lại của buổi tập, còn {count} bài',
  'live.list': 'Danh sách ({count})',
  'live.openFormGuideFor': 'Mở hướng dẫn kỹ thuật cho {name}',

  'live.header.exitAria': 'Rời màn hình tập - tiến trình của bạn vẫn được giữ',
  'live.header.positionAria': 'Bài {current}/{total}',
  'live.header.progressAria': 'Số hiệp đã hoàn thành',

  'live.stats.timeTarget': 'Mục tiêu thời gian',
  'live.stats.repsTarget': 'Mục tiêu số lần',
  'live.stats.setsDone': 'Hiệp đã xong',
  'live.stats.pauseSet': 'Tạm dừng đồng hồ hiệp',
  'live.stats.startSet': 'Chạy đồng hồ hiệp',
  'live.stats.pauseRest': 'Tạm dừng đếm ngược nghỉ',
  'live.stats.startRest': 'Chạy đếm ngược nghỉ',
  'live.stats.resting': 'Đang nghỉ',
  'live.stats.rest': 'Nghỉ',
  'live.stats.paused': 'Tạm dừng',
  'live.stats.timeHit': 'Đạt thời gian',
  'live.stats.done': 'Xong',
  'live.stats.timing': 'Đang tính giờ',
  'live.stats.time': 'Thời gian',

  'live.sets.tableAria': 'Các hiệp của bài tập này',
  'live.sets.done': 'Xong',
  'live.sets.current': 'Hiệp hiện tại',
  'live.sets.notDone': 'Chưa xong',
  'live.sets.repsValue': '{reps} lần',
  'live.sets.weightValue': '{weight} kg',

  'live.remaining.closeAria': 'Đóng danh sách bài tập',
  'live.remaining.title': 'Phần còn lại của buổi tập',
  'live.remaining.titleWithCount': 'Phần còn lại của buổi tập ({count})',
  'live.remaining.setsDone': 'đã xong {done}/{total}',

  'live.log.aria': 'Ghi lại hiệp này (không bắt buộc)',
  'live.log.seconds': 'Giây',
  'live.log.reps': 'Lần',
  'live.log.weight': 'Kg',
  'live.log.addSet': 'Thêm một hiệp nữa cho bài tập này',

  'swap.closeAria': 'Đóng danh sách bài thay thế',
  'swap.title': 'Bài tập thay thế',
  'swap.sameSlot': 'Cùng vị trí',
  'swap.sameSlotWithMuscle': 'Cùng vị trí · {muscle}',
  'swap.loggedNotice': {
    one: 'Đã ghi {count} hiệp ở đây. Những hiệp đó vẫn được tính cho bài hiện tại, các hiệp còn lại sẽ chuyển sang bài bạn chọn.',
    other:
      'Đã ghi {count} hiệp ở đây. Những hiệp đó vẫn được tính cho bài hiện tại, các hiệp còn lại sẽ chuyển sang bài bạn chọn.',
  },
  'swap.sameTargetArea': 'Cùng vùng cơ mục tiêu',
  'swap.fromLibrary':
    'Giáo án của bạn không ghi bài thay thế cho vị trí này, nên đây là các bài gần nhất trong thư viện. Chúng giữ nguyên số hiệp và số lần của vị trí này.',

  'unfinished.eyebrow': 'Buổi tập dang dở',
  'unfinished.title': 'Bạn có một buổi tập chưa hoàn thành.',
  'unfinished.standalone': 'Buổi tập độc lập',
  'unfinished.summary': '{name} - đã xong {done}/{total} hiệp.',
  'unfinished.summaryWithStart': '{name} - đã xong {done}/{total} hiệp, bắt đầu lúc {started}.',
  'unfinished.continue': 'Tiếp tục buổi tập',
  'unfinished.discard': 'Huỷ buổi tập',
  'unfinished.workoutFallback': 'Buổi tập',

  'finish.title': 'Đã tập xong',
  'finish.savedLine': '{name} · đã lưu',
  'finish.exercises': 'bài tập',
  'finish.sets': 'hiệp',
  'finish.time': 'thời gian',
  'finish.durationMinutes': '{minutes} phút',
  'finish.durationHours': '{hours} giờ {minutes} phút',

  'target.reps': '{reps} lần',
  'target.controlledWork': 'thực hiện có kiểm soát',

  'guidance.programWeek': 'Tuần {week} của giáo án. Hãy theo đúng số hiệp và mức độ gắng sức.',
  'guidance.weekPhase': 'Tuần {week} — {phase}: {guidance}',
  'guidance.priority': 'Ưu tiên: {value}',
  'guidance.restriction': 'Hạn chế: {value}',
} as const

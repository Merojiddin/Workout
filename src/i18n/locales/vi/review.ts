/**
 * Weekly Review: the page, its cards, and every sentence the review engine
 * writes -- the score message, muscle-volume notes, next-week focus, warnings
 * and the coach's closing paragraph.
 */
export const reviewMessages = {
  'review.eyebrow': 'Tổng kết tuần',
  'review.title': 'Tổng kết tuần',
  'review.subtitle':
    'Xem lại việc tập luyện, thay đổi cơ thể, dinh dưỡng và trọng tâm tuần tới cho {program}.',
  'review.print': 'In bản tổng kết tuần',
  'review.weekSelector': 'Chọn tuần',
  'review.previous': 'Tuần trước',
  'review.next': 'Tuần sau',
  'review.weekRange': '{start} - {end}',

  'review.missingTitle': 'Thiếu dữ liệu trên máy',
  'review.missingCopy':
    'Hãy hoàn thành các buổi tập và ghi chép để bản tổng kết này đầy đủ hơn.',
  'review.missingCopyDemo':
    'Hãy hoàn thành các buổi tập và ghi chép để bản tổng kết đầy đủ hơn, hoặc tải dữ liệu mẫu.',
  'review.demoWorkouts': 'Thêm buổi tập mẫu',
  'review.demoCheckIns': 'Thêm lần đo cơ thể mẫu',
  'review.demoNutrition': 'Thêm nhật ký dinh dưỡng mẫu',

  'review.score.eyebrow': 'Điểm tuần',
  'review.score.outOf': '/100',
  'review.score.breakdownAria': 'Chi tiết điểm',
  'review.score.workouts': 'Buổi tập {value}/40',
  'review.score.nutrition': 'Dinh dưỡng {value}/25',
  'review.score.checkIn': 'Đo cơ thể {value}/10',
  'review.score.absPosture': 'Bụng/Tư thế {value}/15',
  'review.score.strength': 'Sức mạnh {value}/10',
  'review.score.excellent': 'Xuất sắc',
  'review.score.good': 'Tốt',
  'review.score.average': 'Trung bình',
  'review.score.poor': 'Chưa đều đặn',
  'review.score.unlock':
    'Hãy bắt đầu ghi lại buổi tập, dinh dưỡng và lần đo để mở khoá bản tổng kết.',
  'review.score.sentence': 'Một tuần {label}. {details}',
  'review.score.chestBackStrong': 'Khối lượng tập ngực và lưng đều tốt.',
  'review.score.chestLow': 'Khối lượng tập ngực còn thấp.',
  'review.score.nutritionInconsistent': 'Việc theo dõi dinh dưỡng chưa đều đặn.',
  'review.score.proteinSolid': 'Mục tiêu đạm được duy trì tốt.',
  'review.score.checkInMissing': 'Còn thiếu lần đo cơ thể.',

  'review.summaryAria': 'Tóm tắt mức hoàn thành buổi tập',
  'review.scheduledWorkouts': 'Buổi tập theo lịch',
  'review.targetWorkouts': 'Mục tiêu: {count} buổi · {standalone}',
  'review.standaloneCount': {
    one: 'đã hoàn thành {count} buổi độc lập',
    other: 'đã hoàn thành {count} buổi độc lập',
  },
  'review.totalSets': 'Tổng số hiệp',
  'review.exercisesCompleted': {
    one: 'đã hoàn thành {count} bài tập',
    other: 'đã hoàn thành {count} bài tập',
  },
  'review.missed': 'Bỏ lỡ',
  'review.noMissedDays': 'Không bỏ lỡ ngày nào',
  'review.workoutTime': 'Thời gian tập',
  'review.workoutTimeSub': 'Tính từ giờ bắt đầu và kết thúc',
  'review.durationHours': '{hours} giờ {minutes} phút',
  'review.durationMinutes': '{minutes} phút',
  'review.missedDay': 'Ngày {day} {name}',

  'review.volume.eyebrow': 'Khối lượng theo nhóm cơ',
  'review.volume.title': 'Số hiệp đã hoàn thành theo nhóm cơ',
  'review.volume.empty':
    'Chưa có hiệp nào hoàn thành. Hãy tập xong một buổi để xem khối lượng theo nhóm cơ.',
  'review.volume.sets': { one: '{count} hiệp', other: '{count} hiệp' },
  'review.volume.sessions': { one: '{count} buổi', other: '{count} buổi' },
  'review.volume.notScheduled': '{muscle} không được xếp lịch riêng trong giáo án này.',
  'review.volume.onTarget': 'Phần {muscle} đang đúng mục tiêu của giáo án hiện tại.',
  'review.volume.belowTarget': 'Phần {muscle} đang thấp hơn lịch của giáo án hiện tại.',

  'review.nutrition.eyebrow': 'Tóm tắt dinh dưỡng',
  'review.nutrition.title': 'Đạm, creatine, nước',
  'review.nutrition.empty': 'Tuần này chưa có nhật ký dinh dưỡng.',
  'review.nutrition.avgProtein': 'Đạm trung bình',
  'review.nutrition.avgProteinValue': '{value} g',
  'review.nutrition.perLoggedDay': 'Mỗi ngày có ghi chép',
  'review.nutrition.proteinTargetDays': 'Số ngày đạt mục tiêu đạm',
  'review.nutrition.proteinRange': '{min}-{max} g/ngày',
  'review.nutrition.avgWater': 'Nước trung bình',
  'review.nutrition.avgWaterValue': '{value} L',
  'review.nutrition.waterTarget': 'Mục tiêu 2-3 L/ngày',
  'review.nutrition.creatineDays': 'Số ngày dùng creatine',
  'review.nutrition.creatineTarget': 'Mỗi ngày 3-5 g',
  'review.nutrition.wheyDays': 'Số ngày dùng whey',
  'review.nutrition.wheyUsed': 'Đã dùng whey',
  'review.nutrition.avgCalories': 'Calo trung bình',
  'review.nutrition.estimate': 'Ước tính',
  'review.nutrition.seafoodMeals': 'Bữa hải sản',
  'review.nutrition.oysterMeals': 'Bữa có hàu',
  'review.nutrition.thisWeek': 'Tuần này',
  'review.nutrition.avgCoffee': 'Cà phê trung bình',
  'review.nutrition.cupsPerDay': 'Ly/ngày',
  'review.nutrition.proteinLow': 'Lượng đạm quá thấp để tăng cơ.',
  'review.nutrition.proteinGood': 'Mục tiêu đạm đạt tốt.',
  'review.nutrition.proteinHigh': 'Lượng đạm khá cao. Hãy kiểm soát calo.',
  'review.nutrition.creatineGood': 'Dùng creatine đều đặn.',
  'review.nutrition.waterLow': 'Lượng nước uống còn thấp.',

  'review.strength.eyebrow': 'Tiến bộ sức mạnh',
  'review.strength.title': 'Các bài quan trọng',
  'review.strength.exercise': 'Bài tập',
  'review.strength.thisWeek': 'Tuần này',
  'review.strength.previousWeek': 'Tuần trước',
  'review.strength.change': 'Thay đổi',
  'review.strength.status': 'Trạng thái',
  'review.strength.noData': 'Chưa có dữ liệu',
  'review.strength.new': 'Mới',
  'review.strength.improved': 'tiến bộ',
  'review.strength.same': 'giữ nguyên',
  'review.strength.decreased': 'giảm sút',
  'review.strength.noDataStatus': 'chưa có dữ liệu',
  'review.strength.bestWeight': '{weight} kg x {reps}',
  'review.strength.bestReps': '{reps} lần',
  'review.strength.changeKg': '{value} kg',
  'review.strength.changeReps': '{value} lần',

  'review.body.eyebrow': 'Tiến độ cơ thể',
  'review.body.title': 'So sánh với lần đo gần nhất',
  'review.body.noPrevious': 'Chưa có giá trị trước đó',
  'review.body.vsPrevious': '{change} so với lần trước',
  'review.body.noCheckIn':
    'Tuần này chưa có lần đo cơ thể. Hãy thêm một lần để theo dõi thay đổi.',
  'review.body.recomp': 'Dấu hiệu tái cấu trúc cơ thể tốt.',
  'review.body.tooAggressive':
    'Việc tăng cơ có thể đang quá nhanh. Hãy kiểm soát calo.',
  'review.body.waistDown': 'Vòng eo đang giảm. Hãy giữ sức mạnh ổn định.',
  'review.body.firstCheckIn': 'Đây là lần đo đầu tiên trong khoảng so sánh.',
  'review.body.armsAverage': 'Vòng tay trung bình',
  'review.body.absRating': 'Điểm cơ bụng',

  'review.focus.eyebrow': 'Trọng tâm tuần tới',
  'review.focus.title': 'Việc cần làm',
  'review.focus.completeDay': 'Hoàn thành Ngày {day} — {name}.',
  'review.focus.completeDayWithFocus': 'Hoàn thành Ngày {day} — {name} ({focus}).',
  'review.focus.scheduledCore':
    'Hoàn thành phần cơ lõi/tư thế theo lịch: {names}.',
  'review.focus.programCore':
    'Hoàn thành phần cơ lõi và tư thế theo lịch của giáo án hiện tại.',
  'review.focus.chestWork':
    'Hoàn thành phần ngực còn lại của giáo án hiện tại với các hiệp chuẩn.',
  'review.focus.protein': 'Đạt mục tiêu đạm ít nhất 5 ngày.',
  'review.focus.creatine': 'Uống creatine mỗi ngày.',
  'review.focus.legs': 'Đừng bỏ ngày chân trong tuần tới.',
  'review.focus.rebuild': 'Xây lại {exercise} trước khi tăng tải.',
  'review.focus.progress': 'Tăng tiến {exercise}: {target}.',
  'review.focus.cleanForm':
    'Chỉ tăng tiến sau khi hoàn thành mọi hiệp được chỉ định với kỹ thuật chuẩn.',
  'review.focus.checkIn': 'Thêm một lần đo cơ thể cho tuần này.',
  'review.focus.consistent': 'Giữ nhịp tập đều đặn và ghi lại mọi buổi tập.',
  'review.focus.water': 'Uống 2-3 L nước mỗi ngày.',

  'review.warnings.eyebrow': 'Cảnh báo',
  'review.warnings.title': 'Hãy xử lý những điều này trước',
  'review.warnings.pain': 'Đã ghi nhận cơn đau. Đừng tăng tải khi còn đau.',
  'review.warnings.rpe':
    'RPE quá cao quá thường xuyên. Hãy chừa lại 1-2 lần trong khả năng.',
  'review.warnings.chestVolume':
    'Khối lượng tập ngực rất cao. Hãy để ý mỏi vai.',
  'review.warnings.restDay':
    'Có buổi tập được ghi vào ngày nghỉ theo lịch {day} — {name}. Hãy bảo vệ quá trình hồi phục trừ khi bạn cố ý làm vậy.',
  'review.warnings.legs': 'Chưa tập chân buổi nào. Đừng bỏ ngày chân.',
  'review.warnings.backVolume':
    'Bạn tập ngực rất nhiều nhưng chưa ghi đủ phần lưng. Hãy giữ khối lượng lưng cao để bảo vệ vai.',
  'review.warnings.proteinLow':
    'Lượng đạm thấp. Hãy nhắm ít nhất {grams} g mỗi ngày.',
  'review.warnings.waterLow':
    'Uống ít nước. Điều này có thể ảnh hưởng tới tập luyện và hồi phục.',
  'review.warnings.noCheckIn': 'Tuần này chưa có lần đo cơ thể.',
  'review.warnings.postureSkipped': 'Đã bỏ qua các bài tư thế.',
  'review.warnings.underEating':
    'Vòng eo giảm nhưng sức mạnh cũng giảm. Có thể bạn đang ăn thiếu.',
  'review.warnings.waistUp':
    'Vòng eo tăng lên. Hãy giảm bớt đồ ăn vặt hoặc các loại hạt.',

  'review.conclusion.eyebrow': 'Kết luận của huấn luyện viên',
  'review.conclusion.title': 'Định hướng tuần tới',
  'review.conclusion.sentence':
    '{training} {volume} {nutrition} {body} Tuần tới: {next}',
  'review.conclusion.consistencyStrong': 'Nhịp tập tuần này rất đều.',
  'review.conclusion.consistencyCount':
    'Nhịp tập tuần này là {completed}/{target} buổi.',
  'review.conclusion.volumeBalanced': 'Khối lượng ngực và lưng khá cân bằng.',
  'review.conclusion.chestStrong':
    'Khối lượng ngực tốt; hãy giữ khối lượng lưng cao tương ứng.',
  'review.conclusion.volumeDefault':
    'Tuần tới hãy hoàn thành khối lượng tập theo lịch của giáo án hiện tại.',
  'review.conclusion.proteinGood': 'Việc nạp đạm khá đều đặn.',
  'review.conclusion.proteinInconsistent': 'Việc theo dõi đạm chưa đều đặn.',
  'review.conclusion.bodyTracked': 'Hướng thay đổi cơ thể đang được theo dõi.',
  'review.conclusion.bodyMissing': 'Còn thiếu lần đo cơ thể.',
  'review.conclusion.defaultNext':
    'Tuần tới, hãy ghi lại mọi buổi tập và uống 2-3 L nước mỗi ngày.',

  'muscle.Chest': 'Ngực',
  'muscle.Back': 'Lưng',
  'muscle.Shoulders': 'Vai',
  'muscle.Arms': 'Tay',
  'muscle.Legs': 'Chân',
  'muscle.Abs': 'Bụng',
  'muscle.Posture': 'Tư thế',
  'muscle.Cardio': 'Cardio',
} as const

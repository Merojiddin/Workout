/**
 * Weekly Plan.
 *
 * The program's own words -- day names, phase names, guidance lines, rule
 * text -- come from the JSON that was installed and are shown as written.
 * Only the labels the app puts around them are translated here.
 */
export const planMessages = {
  'plan.eyebrow': 'Lịch tập tuần',
  'plan.splitTag': 'Lịch tập chia {days} ngày',
  'plan.versionTag': 'Phiên bản {version}',
  'plan.weeksTag': { one: '{count} tuần', other: '{count} tuần' },
  'plan.modifiedTag': 'Đã chỉnh sửa sau khi cài đặt',
  'plan.goals': 'Mục tiêu:',
  'plan.print': 'In lịch tập tuần',
  'plan.changeProgram': 'Đổi giáo án',
  'plan.schedule': 'Lịch tập',
  'plan.scheduleSummary': '{sessions} · {rest}',
  'plan.scheduledSessions': {
    one: '{count} buổi theo lịch',
    other: '{count} buổi theo lịch',
  },
  'plan.restDays': { one: '{count} ngày nghỉ', other: '{count} ngày nghỉ' },

  'plan.progressionEyebrow': 'Lộ trình giáo án',
  'plan.progressionTitle': 'Các giai đoạn tập trong {weeks} tuần',
  'plan.progressionTitleGeneric': 'Các giai đoạn tập',
  'plan.volume': 'Khối lượng:',
  'plan.effort': 'Mức gắng sức:',
  'plan.priorities': 'Ưu tiên',
  'plan.restrictions': 'Hạn chế',
  'plan.assessment': 'Đánh giá',

  'plan.rulesEyebrow': 'Cách dùng giáo án',
  'plan.rulesTitle': 'Nguyên tắc của giáo án',
  'plan.rules.effort': 'Mức gắng sức và RIR',
  'plan.rules.progression': 'Tăng tiến kép',
  'plan.rules.rest': 'Nghỉ giữa các hiệp',
  'plan.rules.substitutions': 'Thay thế bài tập',
  'plan.rules.returnAfterBreak': 'Quay lại sau khi nghỉ dài',
  'plan.rules.safety': 'An toàn',
  'plan.rules.optionalNeckWork': 'Bài cổ (không bắt buộc)',
  'plan.rules.posture': 'Tư thế và kiểm soát',

  'plan.standaloneEyebrow': 'Buổi tập không bắt buộc',
  'plan.standaloneTitle': 'Buổi tập độc lập',
  'plan.standaloneIntro':
    'Những buổi này nằm ngoài vòng lặp tuần thông thường, không thay thế và không làm tiến ngày tập theo lịch.',
  'plan.standaloneCard': 'Buổi tập độc lập',
  'plan.whenToUse': 'Khi nào dùng:',
  'plan.workoutRules': 'Nguyên tắc',

  'plan.optionalPrefix': 'Không bắt buộc · ',
  'plan.rirSuffix': 'RIR {value}',
  'plan.exerciseMeta': 'Nghỉ {seconds}s · {muscle} · {equipment}',
  'plan.muscleFallback': 'Khác',
  'plan.equipmentFallback': 'Không dụng cụ',
  'plan.home': 'Tại nhà',
  'plan.gym': 'Phòng gym',
  'plan.guidance': 'Hướng dẫn',
  'plan.phaseTargets': 'Chỉ định theo tuần',
  'plan.openGuideFor': 'Mở hướng dẫn kỹ thuật cho {name}',
  'plan.guide': 'Hướng dẫn',

  'plan.selectOne':
    'Chọn một bài từ vị trí này; đừng tập hết tất cả các phương án.',
  'plan.selectCount': 'Chọn {count} bài từ vị trí này.',
  'plan.optionalSlotPrefix': 'Vị trí không bắt buộc. ',

  'plan.setsTimes': '{count} hiệp',
  'plan.weeksNotSpecified': 'Chưa xác định tuần',
  'plan.weekSingle': 'Tuần {week}',
  'plan.weekRange': 'Tuần {from}-{to}',
  'plan.weekList': 'Tuần {weeks}',
} as const

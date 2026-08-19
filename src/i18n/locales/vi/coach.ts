/**
 * Progression advice: the suggestion the app makes after a logged session,
 * and the static "how to progress this kind of movement" list in the library.
 */
export const coachMessages = {
  'coach.noData.title': 'Chưa có dữ liệu',
  'coach.noData.message':
    'Hãy tập bài này một lần để nhận được lời khuyên tăng tiến.',
  'coach.noData.target': 'Ghi lại buổi tập đầu tiên của bạn',
  'coach.noData.reason': 'Chưa tìm thấy dữ liệu buổi tập nào trước đó.',

  'coach.unknownTarget.title': 'Chưa rõ khoảng số lần',
  'coach.unknownTarget.message':
    'Hãy thêm khoảng số lần hoặc thời lượng cho bài này trước khi dùng lời khuyên tăng tiến.',
  'coach.unknownTarget.target': 'Đặt số lần hoặc thời lượng trong trình sửa giáo án',
  'coach.unknownTarget.reason':
    'Thiếu dữ liệu mục tiêu nên việc tăng tải đang tạm dừng.',

  'coach.duration.title': 'Giữ nguyên thời lượng',
  'coach.duration.message':
    'Hãy giữ đúng thời lượng mục tiêu với mức gắng sức có kiểm soát.',
  'coach.duration.target': 'Lặp lại đúng thời lượng mục tiêu',
  'coach.duration.reason':
    'Các bài tính giờ được tách riêng khỏi cách tăng tiến theo số lần.',

  'coach.formWarning.title': 'Cảnh báo kỹ thuật',
  'coach.formWarning.message':
    'Bạn đã ghi nhận cơn đau ở bài này. Lần tới đừng tăng tải. Hãy dùng mức nhẹ hơn và kiểm tra lại kỹ thuật.',
  'coach.formWarning.target': 'Giảm tải, tập trung vào kỹ thuật',
  'coach.formWarning.reason': 'Đã có báo cáo đau - an toàn trước tăng tiến.',

  'coach.increase.title': 'Tăng tải',
  'coach.increase.reason':
    'Tất cả các hiệp đều đạt số lần mục tiêu với mức gắng sức kiểm soát được.',
  'coach.increase.dumbbell.message':
    'Bạn đã đạt mức trên của khoảng số lần ở mọi hiệp. Lần tới hãy lên cỡ tạ đơn kế tiếp.',
  'coach.increase.dumbbell.target': 'Lên cỡ tạ đơn kế tiếp',
  'coach.increase.bodyweight.message':
    'Bạn đã đạt mức trên của khoảng ở mọi hiệp. Hãy thêm tạ trong ba lô, làm chậm nhịp, hoặc thử biến thể khó hơn.',
  'coach.increase.bodyweight.target': 'Thêm tạ ba lô hoặc biến thể khó hơn',
  'coach.increase.abs.title': 'Tăng tiến bài bụng',
  'coach.increase.abs.message':
    'Đã đạt số lần tối đa ở mọi hiệp. Hãy thêm số lần, thêm thời gian, hoặc làm chậm nhịp. Giữ tải nhẹ để bảo vệ tư thế.',
  'coach.increase.abs.target': 'Thêm số lần / thời gian / nhịp chậm hơn',
  'coach.increase.abs.reason':
    'Đạt số lần tối đa với kiểm soát tốt - chưa cần tải nặng.',
  'coach.increase.default.message':
    'Bạn đã đạt mức trên của khoảng số lần ở tất cả các hiệp. Lần tới hãy tăng mức tạ nhỏ nhất có thể.',
  'coach.increase.default.target': 'Tăng mức tạ nhỏ nhất có thể',

  'coach.keep.title': 'Giữ nguyên mức tạ',
  'coach.keep.bodyweight.message':
    'Lần tới giữ nguyên cách tập - cố thêm 1 lần chuẩn ở mỗi hiệp.',
  'coach.keep.bodyweight.target': 'Giữ nguyên tải, tổng cộng thêm 1 lần',
  'coach.keep.bodyweight.reason':
    'Bạn đang tiến bộ nhưng chưa chạm mức trên của khoảng.',
  'coach.keep.abs.title': 'Giữ nguyên',
  'coach.keep.abs.message':
    'Giữ nguyên độ khó - lần tới thêm 1 lần hoặc vài giây.',
  'coach.keep.abs.target': 'Thêm 1 lần hoặc vài giây',
  'coach.keep.abs.reason':
    'Bài cơ lõi tiến bộ qua số lần, thời gian và nhịp độ.',
  'coach.keep.default.message':
    'Giữ nguyên mức tạ và cố thêm 1 lần ở buổi tập tới.',
  'coach.keep.default.target': 'Giữ nguyên mức tạ, tổng cộng thêm 1 lần',
  'coach.keep.default.reason':
    'Bạn đang tiến bộ nhưng chưa chạm mức trên của khoảng số lần.',

  'coach.reduce.title': 'Giảm tải',
  'coach.reduce.reason': 'Buổi vừa rồi quá nặng so với khoảng mục tiêu.',
  'coach.reduce.rpe.message':
    'Lần trước bạn đã quá sát ngưỡng lực kiệt. Buổi tới hãy giữ nguyên hoặc giảm tải.',
  'coach.reduce.rpe.target': 'Giảm tải 5-10%',
  'coach.reduce.rpe.reason':
    'RPE trung bình chạm 10 - hãy chừa lại một hai lần trong khả năng.',
  'coach.reduce.bodyweight.message':
    'Số lần tụt dưới mục tiêu. Hãy bỏ bớt tạ trong ba lô hoặc dùng biến thể dễ hơn.',
  'coach.reduce.bodyweight.target': 'Biến thể dễ hơn hoặc bớt tạ',
  'coach.reduce.abs.title': 'Giảm độ khó',
  'coach.reduce.abs.message':
    'Số lần tụt dưới mục tiêu. Hãy giảm độ khó và xây lại những lần thực hiện chuẩn.',
  'coach.reduce.abs.target': 'Biến thể dễ hơn, xây lại số lần',
  'coach.reduce.default.message':
    'Số lần của bạn tụt dưới khoảng mục tiêu hoặc RPE quá cao. Hãy giảm mức tạ một chút.',
  'coach.reduce.default.target': 'Giảm tải 5-10%',

  'coach.posture.easeTitle': 'Giảm nhịp lại',
  'coach.posture.easeMessage':
    'Hãy chậm lại và tập trung vào kiểm soát. Giữ lồng ngực hạ xuống và giảm độ khó.',
  'coach.posture.easeTarget': 'Thực hiện chậm hơn, biến thể dễ hơn',
  'coach.posture.easeReason':
    'Với bài tư thế, kiểm soát quan trọng hơn mức tải.',
  'coach.posture.buildTitle': 'Xây dựng khả năng kiểm soát',
  'coach.posture.buildMessage':
    'Cải thiện độ kiểm soát và đều đặn. Hãy thêm số lần hoặc làm chậm nhịp - giữ tải nhẹ.',
  'coach.posture.buildTarget': 'Thêm số lần / chậm nhịp, giữ đều đặn',
  'coach.posture.buildReason':
    'Bài tư thế tiến bộ nhờ kiểm soát chứ không nhờ tải nặng.',

  'coach.cardio.holdTitle': 'Giữ nguyên cardio',
  'coach.cardio.holdMessage':
    'Hãy giữ nguyên nhịp này và để thể lực ổn định lại trước khi tăng thời gian.',
  'coach.cardio.holdTarget': 'Giữ nguyên thời lượng và độ dốc',
  'coach.cardio.holdReason': 'Mức gắng sức buổi trước đã khá cao.',
  'coach.cardio.progressTitle': 'Tăng tiến cardio',
  'coach.cardio.progressMessage':
    'Buổi đi bộ diễn ra nhẹ nhàng. Hãy thêm 5 phút hoặc tăng nhẹ độ dốc. Tránh chạy để bảo vệ ống chân.',
  'coach.cardio.progressTarget': 'Thêm 5 phút hoặc tăng nhẹ độ dốc',
  'coach.cardio.progressReason': 'Bạn hoàn thành buổi cardio một cách thoải mái.',

  'coach.summary.reps': '{reps} lần',
  'coach.summary.weight': '@ {weight} kg',
  'coach.summary.rpe': ' · RPE {rpe}',
  'coach.summary.logged': 'Đã ghi lại',

  'advice.duration.1': 'Giữ đúng thời lượng mục tiêu với mức gắng sức có kiểm soát',
  'advice.duration.2': 'Giữ động tác hoặc nhịp ổn định trước khi tăng độ khó',
  'advice.duration.3': 'Dùng RPE và ghi chú về cơn đau để định hướng buổi sau',
  'advice.duration.4': 'Giảm thời lượng hoặc tải nếu kỹ thuật đi xuống',

  'advice.dumbbell.1': 'Trước hết hãy đạt mức trên của khoảng số lần ở mọi hiệp',
  'advice.dumbbell.2': 'Sau đó lên cỡ tạ đơn kế tiếp và xây lại số lần',
  'advice.dumbbell.3': 'Giữ RPE quanh 8-9 - chừa lại 1-2 lần trong khả năng',
  'advice.dumbbell.4': 'Ghi lại mọi cơn đau và giảm tải nếu xuất hiện',

  'advice.weighted.1': 'Trước hết hãy đạt mức trên của khoảng số lần ở mọi hiệp',
  'advice.weighted.2':
    'Sau đó tăng mức tạ nhỏ nhất có thể và xây lại số lần của bạn',
  'advice.weighted.3': 'Giữ RPE quanh 8-9 - đừng gắng đến lực kiệt',
  'advice.weighted.4':
    'Giữ lồng ngực hạ xuống và siết cơ lõi; giảm tải nếu lưng bị ưỡn',

  'advice.bodyweight.1': 'Trước hết hãy đạt đủ số lần chuẩn tối đa ở mọi hiệp',
  'advice.bodyweight.2': 'Sau đó thêm tạ trong ba lô hoặc chọn biến thể khó hơn',
  'advice.bodyweight.3': 'Làm chậm nhịp trước khi tăng tải',
  'advice.bodyweight.4': 'Nếu lưng dưới bị ưỡn, hãy giảm tải và chỉnh lại tư thế',

  'advice.abs.1': 'Thêm số lần hoặc thời gian trước khi thêm bất kỳ mức tải nào',
  'advice.abs.2': 'Làm chậm nhịp để tăng độ khó',
  'advice.abs.3': 'Giữ lồng ngực hạ xuống và đừng kéo vào cổ',
  'advice.abs.4': 'Chỉ thêm tải nhẹ khi kỹ thuật đã hoàn chỉnh',

  'advice.posture.1': 'Đừng cố nâng nặng ở nhóm bài này',
  'advice.posture.2': 'Tiến bộ bằng kiểm soát, nhịp chậm và sự đều đặn',
  'advice.posture.3': 'Giữ lồng ngực hạ xuống và siết nhẹ cơ mông',
  'advice.posture.4': 'Chất lượng quan trọng hơn số lượng ở mỗi lần thực hiện',

  'advice.cardio.1': 'Thêm 5 phút trước khi tăng cường độ',
  'advice.cardio.2': 'Dùng độ dốc thay vì chạy để bảo vệ ống chân',
  'advice.cardio.3': 'Giữ mức gắng sức đủ nhẹ để vẫn nói chuyện được',
  'advice.cardio.4': 'Dừng lại nếu ống chân bắt đầu đau nhức',
} as const

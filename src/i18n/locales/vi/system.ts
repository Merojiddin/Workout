/**
 * App-wide system surfaces: the crash screen, offline banner, PWA install
 * prompt, notification centre and the reminders it lists.
 */
export const systemMessages = {
  'boundary.eyebrow': 'An toàn ứng dụng',
  'boundary.title': 'Đã xảy ra lỗi',
  'boundary.copy':
    'Ứng dụng gặp lỗi. Dữ liệu đã lưu của bạn vẫn an toàn.',
  'boundary.reload': 'Tải lại ứng dụng',
  'boundary.goHome': 'Về Buổi tập hôm nay',
  'boundary.exportBackup': 'Xuất bản sao lưu',
  'boundary.technicalDetails': 'Chi tiết kỹ thuật',
  'boundary.productionHint':
    'Chi tiết được ẩn ở bản phát hành. Hãy dùng nút bên dưới để sao chép toàn bộ lỗi cho báo cáo.',
  'boundary.copyError': 'Sao chép chi tiết lỗi',

  'toast.genericError': 'Đã xảy ra lỗi. Dữ liệu của bạn vẫn an toàn.',

  'loading.page': 'Đang tải trang...',

  'lazy.failed':
    'Không tải được trang này. Hãy kiểm tra kết nối rồi tải lại.',
  'lazy.reload': 'Tải lại',

  'offline.banner':
    'Bạn đang ngoại tuyến. Nhật ký tập luyện sẽ được lưu trên máy và đồng bộ sau.',
  'offline.backOnline': 'Đã kết nối lại.',

  'pwa.install': 'Cài đặt ứng dụng',
  'pwa.iosHint':
    'Để cài đặt: chạm Chia sẻ, rồi chọn Thêm vào màn hình chính.',

  'notify.open': 'Mở nhắc nhở',
  'notify.title': 'Nhắc nhở',
  'notify.listAria': 'Danh sách nhắc nhở',
  'notify.activeCount': { one: '{count} đang hoạt động', other: '{count} đang hoạt động' },
  'notify.empty': 'Không có nhắc nhở nào',
  'notify.justNow': 'Vừa xong',
  'notify.status.inAppOnly': 'Chỉ trong ứng dụng',
  'notify.status.browserOn': 'Đã bật trên trình duyệt',
  'notify.status.blocked': 'Bị chặn',
  'notify.empty.unsupported':
    'Trình duyệt này không hỗ trợ thông báo. Nhắc nhở trong ứng dụng vẫn hoạt động.',
  'notify.empty.enabled': 'Thông báo trình duyệt đã được bật.',
  'notify.empty.blocked': 'Thông báo đang bị chặn trong cài đặt trình duyệt.',
  'notify.empty.disabled':
    'Hãy bật thông báo trình duyệt trong phần Cài đặt nhắc nhở.',
  'notify.category.workout': 'Tập luyện',
  'notify.category.supplement': 'Thực phẩm bổ sung',
  'notify.category.nutrition': 'Dinh dưỡng',
  'notify.category.body': 'Cơ thể',
  'notify.category.safety': 'An toàn',
  'notify.category.system': 'Hệ thống',

  'reminder.workout.title': 'Nhắc nhở tập luyện',
  'reminder.workout.message':
    'Buổi tập hôm nay là Ngày {day} - {name}. Bắt đầu khi bạn sẵn sàng.',
  'reminder.creatine.title': 'Nhắc nhở creatine',
  'reminder.creatine.message':
    'Hôm nay chưa ghi nhận creatine monohydrate. Hãy uống 3-5 g nếu bạn chưa dùng.',
  'reminder.protein.title': 'Nhắc nhở đạm',
  'reminder.protein.message':
    'Lượng đạm đang dưới mục tiêu. Hôm nay hãy nhắm {min}-{max} g.',
  'reminder.water.title': 'Nhắc nhở uống nước',
  'reminder.water.message':
    'Hôm nay bạn uống ít nước. Hãy uống thêm, nhất là khi đang dùng creatine.',
  'reminder.bodyCheckIn.title': 'Nhắc nhở đo cơ thể',
  'reminder.bodyCheckIn.message':
    'Tuần này chưa có lần đo cơ thể. Hãy ghi cân nặng, vòng eo, ngực, vai và chụp ảnh.',
  'reminder.weeklyReview.title': 'Nhắc nhở tổng kết tuần',
  'reminder.weeklyReview.message':
    'Xem lại buổi tập, dinh dưỡng, tiến độ cơ thể và trọng tâm tuần tới.',
  'reminder.unfinished.title': 'Buổi tập dang dở',
  'reminder.unfinished.message':
    'Bạn có một buổi tập chưa hoàn thành. Hãy tiếp tục hoặc huỷ nó.',
} as const

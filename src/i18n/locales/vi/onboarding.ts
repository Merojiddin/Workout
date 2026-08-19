/** The two first-run screens: adding a program, then the short profile step. */
export const onboardingMessages = {
  'setup.step1': 'Bước 1/2',
  'setup.step2': 'Bước 2/2',

  'setup.program.title': 'Thêm giáo án tập của bạn',
  'setup.program.subtitle':
    'Ứng dụng này không kèm sẵn giáo án nào, và không bao giờ hiển thị giáo án của người khác. Hãy tải lên tệp giáo án của riêng bạn để bắt đầu - nó chỉ thuộc về tài khoản của bạn.',
  'setup.program.chooseFile': 'Chọn tệp giáo án',
  'setup.program.loaded': 'Đã tải {name}',
  'setup.program.readFailed': 'Không đọc được "{name}". Hãy thử chọn lại tệp.',
  'setup.program.pasteInstead': 'Hoặc dán JSON vào đây',
  'setup.program.pasteHint':
    'Giáo án của bạn đang ở dạng văn bản thuần? Hãy sao chép lời nhắc này vào ChatGPT (hoặc bất kỳ AI chat nào) kèm giáo án của bạn, rồi tải lên hoặc dán đoạn JSON nhận được.',
  'setup.program.copyPrompt': 'Sao chép lời nhắc AI',
  'setup.program.copyManual': 'Nhấn Ctrl/Cmd+C',
  'setup.program.looksGood': '{name} hợp lệ - {days} ngày.',
  'setup.program.unusable': 'Giáo án này chưa dùng được.',
  'setup.program.offline':
    'Bạn đang ngoại tuyến. Hãy kết nối lại để hoàn tất việc cài đặt giáo án.',
  'setup.program.installing': 'Đang thiết lập...',
  'setup.program.install': 'Dùng giáo án này',

  'setup.profile.title': 'Đôi nét về bạn',
  'setup.profile.subtitle':
    'Trang Theo dõi cơ thể và bản kế hoạch in ra dùng những số liệu này để thể hiện tiến độ so với mục tiêu. Không có gì ở đây được chia sẻ, và bạn có thể sửa hoặc bổ sung bất cứ lúc nào trong Cài đặt › Hồ sơ.',
  'setup.profile.namePlaceholder': 'Chúng tôi nên gọi bạn là gì?',
  'setup.profile.height': 'Chiều cao',
  'setup.profile.currentWeight': 'Cân nặng hiện tại',
  'setup.profile.goalWeightFrom': 'Cân nặng mục tiêu từ',
  'setup.profile.goalWeightTo': 'Cân nặng mục tiêu đến',
  'setup.profile.fieldWithUnit': '{label} ({unit})',
  'setup.profile.saveAndContinue': 'Lưu và tiếp tục',
  'setup.profile.skip': 'Bỏ qua bây giờ',
} as const

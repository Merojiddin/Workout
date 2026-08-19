/** Sign in, register, password reset, and the auth gate's loading state. */
export const authMessages = {
  'auth.loadingSession': 'Đang tải phiên đăng nhập của bạn...',

  'auth.email': 'Email',
  'auth.password': 'Mật khẩu',
  'auth.name': 'Tên',
  'auth.confirmPassword': 'Xác nhận mật khẩu',
  'auth.newPassword': 'Mật khẩu mới',
  'auth.confirmNewPassword': 'Xác nhận mật khẩu mới',

  'auth.login.title': 'Chào mừng trở lại',
  'auth.login.subtitle': 'Đăng nhập để đồng bộ dữ liệu tập luyện lên đám mây.',
  'auth.login.submit': 'Đăng nhập',
  'auth.login.submitting': 'Đang đăng nhập...',
  'auth.login.failed': 'Không đăng nhập được.',
  'auth.login.forgot': 'Quên mật khẩu?',
  'auth.login.newHere': 'Bạn mới dùng lần đầu?',
  'auth.login.createAccount': 'Tạo tài khoản',

  'auth.register.title': 'Tạo tài khoản của bạn',
  'auth.register.subtitle': 'Dữ liệu tập luyện của bạn, được sao lưu và đồng bộ.',
  'auth.register.submit': 'Đăng ký',
  'auth.register.submitting': 'Đang tạo...',
  'auth.register.failed': 'Không tạo được tài khoản.',
  'auth.register.tooShort': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'auth.register.mismatch': 'Hai mật khẩu không khớp nhau.',
  'auth.register.confirmEmail':
    'Đã tạo tài khoản. Hãy kiểm tra email để xác nhận, sau đó đăng nhập.',
  'auth.register.haveAccount': 'Đã có tài khoản?',

  'auth.forgot.title': 'Đặt lại mật khẩu',
  'auth.forgot.subtitle':
    'Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.',
  'auth.forgot.submit': 'Gửi liên kết đặt lại',
  'auth.forgot.submitting': 'Đang gửi...',
  'auth.forgot.failed': 'Không gửi được liên kết đặt lại.',
  'auth.forgot.sent':
    'Nếu email đó tồn tại, liên kết đặt lại mật khẩu đang được gửi đi.',

  'auth.update.title': 'Chọn mật khẩu mới',
  'auth.update.subtitle':
    'Đặt mật khẩu mới cho tài khoản của bạn, rồi tiếp tục tập luyện.',
  'auth.update.submit': 'Cập nhật mật khẩu',
  'auth.update.submitting': 'Đang lưu...',
  'auth.update.failed': 'Không cập nhật được mật khẩu.',
  'auth.update.tooShort': 'Hãy dùng ít nhất {count} ký tự.',
  'auth.update.mismatch': 'Hai mật khẩu không khớp nhau.',
  'auth.update.done': 'Đã cập nhật mật khẩu.',

  'auth.backToSignIn': 'Quay lại đăng nhập',
} as const

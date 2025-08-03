const StatusCodeMessages = {
  // Standard HTTP status codes
  200: "Thành công",
  201: "Tạo mới thành công",
  400: "Yêu cầu không hợp lệ",
  401: "Không có quyền truy cập",
  403: "Bị cấm truy cập",
  404: "Không tìm thấy",
  429: "Quá nhiều yêu cầu",
  500: "Lỗi máy chủ nội bộ",

  // Authentication errors
  4001: "Email đã tồn tại",
  4002: "Tên đăng nhập đã tồn tại",
  4003: "Email hoặc mật khẩu không đúng",
  4004: "Tài khoản đã bị khóa tạm thời",
  4005: "Mật khẩu hiện tại không đúng",
  4006: "OTP không hợp lệ hoặc đã hết hạn",
  4007: "Số lần nhập OTP vượt quá giới hạn. Vui lòng thử lại sau",
  4008: "Refresh token không hợp lệ hoặc đã hết hạn",
  4009: "Không tìm thấy người dùng",
  4010: "Email không tồn tại trong hệ thống",

  // Validation errors
  4011: "Dữ liệu yêu cầu không hợp lệ",

  // File handling errors
  5001: "Lỗi chuyển đổi hình ảnh",
  5002: "Lỗi khi lưu file",
  5003: "Tải file lên thất bại",
  5004: "Kích thước file vượt quá giới hạn cho phép",
  5005: "Loại file không hợp lệ",

  // Email errors
  5006: "Gửi email thất bại",
};

export default StatusCodeMessages;

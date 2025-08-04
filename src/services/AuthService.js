import instance from "../config/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

// Helper function to handle API errors
const handleApiError = (
  error,
  defaultMessage = "Có lỗi xảy ra, vui lòng thử lại"
) => {
  const errorMessage = error.response?.data?.message || defaultMessage;
  const vietnameseMessage =
    getVietnameseMessage(error.response?.data?.errorCode) || errorMessage;
  toast.error(vietnameseMessage);
  if (error.response?.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
  throw new Error(vietnameseMessage);
};

// Refresh Token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw new Error("Không tìm thấy refresh token trong localStorage");
    }

    const response = await instance.post("/api/auth/refresh-token", {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return response.data.data;
  } catch (error) {
    handleApiError(error, "Không thể làm mới token, vui lòng đăng nhập lại");
  }
};

// Register
export const register = async (userData) => {
  try {
    const response = await instance.post("/api/auth/register", userData);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Đăng ký thất bại, vui lòng kiểm tra lại thông tin");
  }
};

// Login
export const login = async (loginData) => {
  try {
    const response = await instance.post("/api/auth/login", loginData);
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data.data;
  } catch (error) {
    handleApiError(
      error,
      "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin"
    );
  }
};

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await instance.post("/api/auth/forgot-password", {
      email,
    });
    toast.success("OTP đã được gửi đến email của bạn");
    return response.data;
  } catch (error) {
    handleApiError(error, "Gửi yêu cầu đặt lại mật khẩu thất bại");
  }
};

// Reset Password
export const resetPassword = async (resetData) => {
  try {
    const response = await instance.post("/api/auth/reset-password", resetData);
    toast.success("Đặt lại mật khẩu thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Đặt lại mật khẩu thất bại");
  }
};

// Request Change Password OTP
export const requestChangePasswordOtp = async () => {
  try {
    const response = await instance.post(
      "/api/auth/request-change-password-otp"
    );
    toast.success("OTP thay đổi mật khẩu đã được gửi đến email của bạn");
    return response.data;
  } catch (error) {
    handleApiError(error, "Gửi yêu cầu OTP thất bại");
  }
};

// Change Password
export const changePassword = async (changePasswordData) => {
  try {
    const response = await instance.post(
      "/api/auth/change-password",
      changePasswordData
    );
    toast.success("Thay đổi mật khẩu thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Thay đổi mật khẩu thất bại");
  }
};

// Logout
export const logout = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await instance.post(
      "/api/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return response.data;
  } catch (error) {
    handleApiError(error, "Đăng xuất thất bại");
  }
};

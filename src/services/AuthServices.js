import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

//hàm chạy local
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  const user = getCurrentUser();
  return !!(token && user);
};

export const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw new Error("Không tìm thấy refresh token trong localStorage");
    }

    const response = await instance.post("/auth/refresh-token", {
      refreshToken,
    });
    const data = response.data;
    if (data?.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Làm mới token") ||
        "Làm mới token không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error("Lỗi làm mới token:", error.message, "| Mã lỗi:", code);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw new Error(
      getVietnameseMessage(code, "Làm mới token") ||
        "Làm mới token không thành công"
    );
  }
};

export const register = async (userData) => {
  try {
    const response = await instance.post("/auth/register", {
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
      password: userData.password,
    });
    const data = response.data;
    if (data?.statusCode === 201) {
      return {
        success: true,
        data: data.data,
        message: getVietnameseMessage(data.statusCode) || "Đăng ký thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Đăng ký") ||
        "Đăng ký không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Đăng ký") || "Đăng ký không thành công"
    );
  }
};

export const login = async (credentials) => {
  try {
    const response = await instance.post("/auth/login", {
      username: credentials.username,
      password: credentials.password,
    });
    const data = response.data;
    if (data?.data?.accessToken) {
      console.log("Response từ login:", data);
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode) || "Đăng nhập thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Đăng nhập") ||
        "Đăng nhập không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Đăng nhập") || "Đăng nhập không thành công"
    );
  }
};

export const logout = async () => {
  try {
    await instance.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Đăng xuất") || "Đăng xuất không thành công"
    );
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await instance.post("/auth/forgot-password", { email });
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message: data.message || "Yêu cầu đặt lại mật khẩu đã được gửi",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Đặt lại mật khẩu") ||
        "Yêu cầu đặt lại mật khẩu không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Đặt lại mật khẩu") ||
        "Yêu cầu đặt lại mật khẩu không thành công"
    );
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await instance.post("/auth/reset-password", {
      email: resetData.email,
      otp: resetData.otp,
      newPassword: resetData.newPassword,
    });
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message: data.message || "Đặt lại mật khẩu thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Đặt lại mật khẩu") ||
        "Đặt lại mật khẩu không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Đặt lại mật khẩu") ||
        "Đặt lại mật khẩu không thành công"
    );
  }
};

export const requestChangePasswordOtp = async () => {
  try {
    const response = await instance.post("/auth/request-change-password-otp");
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message: data.message || "OTP đổi mật khẩu đã được gửi",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Yêu cầu OTP") ||
        "Yêu cầu OTP không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Yêu cầu OTP") ||
        "Yêu cầu OTP không thành công"
    );
  }
};

export const changePassword = async (changeData) => {
  try {
    const response = await instance.post("/auth/change-password", {
      currentPassword: changeData.currentPassword,
      newPassword: changeData.newPassword,
      otp: changeData.otp,
    });
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message: data.message || "Đổi mật khẩu thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Đổi mật khẩu") ||
        "Đổi mật khẩu không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Đổi mật khẩu") ||
        "Đổi mật khẩu không thành công"
    );
  }
};

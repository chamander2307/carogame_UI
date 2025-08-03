import instance from '../config/axios';

const AuthServices = {
  // Đăng ký - Backend: POST /api/auth/register
  register: async (userData) => {
    try {
      const response = await instance.post('/auth/register', userData);

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối server',
        data: null
      };
    }
  },

  // Đăng nhập - Backend: POST /api/auth/login
  login: async (username, password) => {
    try {
      const response = await instance.post('/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        // Lưu token vào localStorage - Backend trả về accessToken và refreshToken
        if (response.data.data.accessToken) {
          localStorage.setItem('token', response.data.data.accessToken);
        }
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return {
          success: true,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Đăng nhập thất bại'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối server'
      };
    }
  },

  // Quên mật khẩu - Backend: POST /api/auth/forgot-password
  forgotPassword: async (email) => {
    try {
      const response = await instance.post('/auth/forgot-password', { email });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối server'
      };
    }
  },

  // Reset mật khẩu - Backend: POST /api/auth/reset-password
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await instance.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối server'
      };
    }
  },

  // Đổi mật khẩu - Backend: POST /api/auth/change-password
  changePassword: async (currentPassword, newPassword, otp) => {
    try {
      const response = await instance.post('/auth/change-password', { 
        currentPassword, 
        newPassword,
        otp
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi đổi mật khẩu'
      };
    }
  },

  // Yêu cầu OTP để đổi mật khẩu - Backend: POST /api/auth/request-change-password-otp
  requestChangePasswordOtp: async () => {
    try {
      const response = await instance.post('/auth/request-change-password-otp');

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi yêu cầu OTP'
      };
    }
  },

  // Utility methods (không gọi API)
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export default AuthServices;

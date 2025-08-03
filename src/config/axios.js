import axios from "axios";

// Tạo instance riêng cho refresh token để tránh circular call
const refreshTokenInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token) {
      try {
        const { jwtDecode } = require("jwt-decode");
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Nếu token đã hết hạn hoặc sắp hết hạn (còn < 5 phút)
        if (decoded.exp <= currentTime + 300) {
          console.log("Token expired or expiring soon, attempting refresh");

          if (refreshToken) {
            try {
              // Gọi API refresh token bằng instance riêng
              const response = await refreshTokenInstance.post(
                "/auth/refresh-token",
                {
                  refreshToken: refreshToken,
                }
              );

              if (response.data.success) {
                const { accessToken, refreshToken: newRefreshToken } =
                  response.data.data;
                localStorage.setItem("token", accessToken);

                if (newRefreshToken) {
                  localStorage.setItem("refreshToken", newRefreshToken);
                }

                console.log(
                  "Token refreshed successfully in request interceptor"
                );
                config.headers.Authorization = `Bearer ${accessToken}`;
                return config;
              }
            } catch (refreshError) {
              console.error(
                "Failed to refresh token in request interceptor:",
                refreshError
              );
            }
          }

          // Nếu refresh thất bại hoặc không có refresh token
          console.log("Token refresh failed, clearing auth data");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          // Redirect về login nếu đang ở protected route
          const currentPath = window.location.pathname;
          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/",
          ];
          if (!publicPaths.includes(currentPath)) {
            window.location.href = "/login";
          }

          return Promise.reject(new Error("Token expired and refresh failed"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error checking token in request interceptor:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý 401 Unauthorized - token invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("401 Unauthorized - Attempting token refresh");

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Gọi API refresh token bằng instance riêng
          const response = await refreshTokenInstance.post(
            "/auth/refresh-token",
            {
              refreshToken: refreshToken,
            }
          );

          if (response.data.success) {
            // Lưu token mới
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;
            localStorage.setItem("token", accessToken);

            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Cập nhật header authorization cho request gốc
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            console.log(
              "Token refreshed successfully, retrying original request"
            );

            // Thử lại request gốc với token mới
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      }

      // Nếu refresh thất bại hoặc không có refresh token
      console.log("Token refresh failed, clearing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Redirect về login nếu đang ở protected route
      const currentPath = window.location.pathname;
      const publicPaths = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/",
      ];

      if (!publicPaths.includes(currentPath)) {
        console.log("Redirecting to login due to failed token refresh");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // Log API errors (không phải 401)
    if (error.response?.status !== 401) {
      console.error(`API Error for ${error.config?.url}:`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
export { refreshTokenInstance };

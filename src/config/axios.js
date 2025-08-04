import axios from "axios";

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
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken) {
      try {
        const { jwtDecode } = require("jwt-decode");
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp <= currentTime + 300) {
          if (refreshToken) {
            const response = await refreshTokenInstance.post(
              "/auth/refresh-token",
              {
                refreshToken,
              }
            );
            if (response.data.success) {
              const { accessToken, refreshToken: newRefreshToken } =
                response.data.data;
              localStorage.setItem("accessToken", accessToken);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }
              config.headers.Authorization = `Bearer ${accessToken}`;
              return config;
            }
          }
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/",
          ];
          if (!publicPaths.includes(window.location.pathname)) {
            window.location.href = "/login";
          }
          return Promise.reject(
            new Error("Token hết hạn và không thể làm mới")
          );
        }
        config.headers.Authorization = `Bearer ${accessToken}`;
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await refreshTokenInstance.post(
            "/auth/refresh-token",
            {
              refreshToken,
            }
          );
          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;
            localStorage.setItem("accessToken", accessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Không xóa token ngay, để UserContext xử lý nếu cần
        }
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      const publicPaths = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/",
      ];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default instance;
export { refreshTokenInstance };

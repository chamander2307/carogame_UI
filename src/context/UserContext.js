import React, { createContext, useEffect, useState } from "react";
import { getUserProfile } from "../services/UserProfileService";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import {
  refreshToken as authRefreshToken,
  logout as authLogout,
} from "../services/AuthService";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect triggered in UserProvider");
    const init = async () => {
      const possibleAccessKeys = [
        "accessToken",
        "AccessToken",
        "TOKEN",
        "token",
      ];
      let accessToken = null;
      for (const key of possibleAccessKeys) {
        accessToken = localStorage.getItem(key);
        if (accessToken) {
          console.log(`Found accessToken under key: ${key}`);
          break;
        }
      }

      const refreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      console.log("Raw accessToken value:", accessToken);
      console.log("Raw refreshToken value:", refreshToken);
      console.log("Raw storedUser value:", storedUser);

      console.log("Init UserContext - Checking stored tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasStoredUser: !!storedUser,
      });

      if (!accessToken) {
        console.log("No access token found, user not logged in");
        setLoading(false);
        return;
      }

      try {
        if (!accessToken.startsWith("eyJ")) {
          console.error("Invalid JWT format:", accessToken);
          throw new Error("Token không phải là JWT hợp lệ");
        }

        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        const timeToExpire = decoded.exp - currentTime;

        console.log("Token info:", {
          exp: decoded.exp,
          currentTime: currentTime,
          timeToExpire: timeToExpire,
          isExpired: timeToExpire <= 0,
          isNearExpiration: timeToExpire < 300,
          provider: decoded.provider,
        });

        if (timeToExpire <= 0 || timeToExpire < 300) {
          console.log(
            "Token expired or near expiration, attempting refresh..."
          );
          if (refreshToken) {
            try {
              const refreshResponse = await authRefreshToken();
              console.log("Refresh response:", refreshResponse);
              accessToken = localStorage.getItem("accessToken");
              console.log("New accessToken after refresh:", accessToken);
            } catch (refreshError) {
              console.error(
                "Failed to refresh token:",
                refreshError.response?.data || refreshError.message
              );
              toast.error(
                getVietnameseMessage(401, "Làm mới token") ||
                  "Token hết hạn và không thể làm mới"
              );
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              setLoading(false);
              return;
            }
          } else {
            console.log("No refresh token available, clearing auth data");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setLoading(false);
            return;
          }
        }

        const isGoogleAccount = decoded.provider === "google";
        console.log("Attempting to fetch user profile...");
        const profileResponse = await getUserProfile();
        console.log(
          "Profile response:",
          JSON.stringify(profileResponse, null, 2)
        );

        const profileData = profileResponse.data || profileResponse;
        if (!profileData.id) {
          throw new Error(
            getVietnameseMessage(
              profileResponse.statusCode,
              "Lấy thông tin hồ sơ"
            ) ||
              profileResponse.message ||
              "Không thể lấy thông tin hồ sơ"
          );
        }

        const avatarUrl = profileData.avatarUrl
          ? `http://localhost:8080${profileData.avatarUrl}`
          : null;

        const userData = {
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          displayName: profileData.displayName,
          avatarUrl: avatarUrl,
          createdAt: profileData.createdAt,
          isGoogleAccount,
        };

        const currentStoredUser = storedUser ? JSON.parse(storedUser) : null;
        if (
          !currentStoredUser ||
          JSON.stringify(currentStoredUser) !== JSON.stringify(userData)
        ) {
          console.log("Updating stored user data");
          localStorage.setItem("user", JSON.stringify(userData));
        }

        setUser(userData);
        setIsLogin(true);
        console.log("User successfully restored from token");
      } catch (err) {
        console.error("Error restoring user session:", {
          message: err.message,
          status: err.response?.status,
          errorCode: err.response?.data?.errorCode,
          responseData: err.response?.data,
          stack: err.stack,
        });

        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Token invalid, clearing auth data");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
          setIsLogin(false);

          const currentPath = window.location.pathname;
          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/",
          ];
          if (!publicPaths.includes(currentPath)) {
            console.log("Redirecting to login from protected route");
            window.location.href = "/login";
          }
        } else {
          console.log(
            "Network/server error, keeping tokens but setting offline mode"
          );
          setUser(null);
          setIsLogin(false);
          toast.error(
            getVietnameseMessage(
              err.response?.data?.statusCode,
              "Khôi phục phiên người dùng"
            ) ||
              err.response?.data?.message ||
              "Không thể khôi phục phiên người dùng"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const logout = () => {
    console.log("Logging out user");
    authLogout();
    setUser(null);
    setIsLogin(false);
    window.location.href = "/login";
  };

  const handleLoginSuccess = async (authData) => {
    console.log("Handling login success", authData);
    try {
      if (authData.user) {
        localStorage.setItem("accessToken", authData.accessToken);
        localStorage.setItem("refreshToken", authData.refreshToken);

        const profileResponse = await getUserProfile();
        if (!profileResponse) {
          throw new Error(
            getVietnameseMessage(
              profileResponse.statusCode,
              "Lấy thông tin hồ sơ"
            ) ||
              profileResponse.message ||
              "Không thể lấy thông tin hồ sơ"
          );
        }

        const profileData = profileResponse;
        const avatarUrl = profileData.avatarUrl
          ? `http://localhost:8080${profileData.avatarUrl}`
          : null;

        const userData = {
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          displayName: profileData.displayName,
          avatarUrl: avatarUrl,
          createdAt: profileData.createdAt,
          isGoogleAccount: authData.user.provider === "google",
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLogin(true);
        console.log("Login success - user state updated");
        toast.success(
          getVietnameseMessage(200, "Đăng nhập") || "Đăng nhập thành công"
        );
        return true;
      } else {
        throw new Error("Dữ liệu người dùng không hợp lệ");
      }
    } catch (error) {
      console.error("Error handling login success:", error);
      toast.error(
        getVietnameseMessage(500, "Xử lý đăng nhập") || "Lỗi xử lý đăng nhập"
      );
      return false;
    }
  };

  const checkAuthStatus = () => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Checking auth status, accessToken:", accessToken);
    if (!accessToken) return false;

    try {
      const decoded = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  };

  const refreshUserProfile = async () => {
    try {
      console.log("Refreshing user profile...");
      const profileResponse = await getUserProfile();

      if (!profileResponse) {
        throw new Error(
          getVietnameseMessage(profileResponse.statusCode, "Làm mới hồ sơ") ||
            profileResponse.message ||
            "Không thể làm mới hồ sơ"
        );
      }

      const profileData = profileResponse;
      const avatarUrl = profileData.avatarUrl
        ? `http://localhost:8080${profileData.avatarUrl}`
        : null;

      const userData = {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        displayName: profileData.displayName,
        avatarUrl: avatarUrl,
        createdAt: profileData.createdAt,
        isGoogleAccount: user?.isGoogleAccount || false,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User profile refreshed successfully");
      toast.success(
        getVietnameseMessage(200, "Làm mới hồ sơ") || "Làm mới hồ sơ thành công"
      );
      return profileResponse;
    } catch (error) {
      console.error("Error refreshing profile:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Làm mới hồ sơ"
        ) ||
          error.response?.data?.message ||
          "Làm mới hồ sơ không thành công"
      );
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLogin,
        loading,
        setUser,
        setIsLogin,
        logout,
        refreshUserProfile,
        handleLoginSuccess,
        checkAuthStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

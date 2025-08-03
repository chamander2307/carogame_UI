import React, { createContext, useEffect, useState } from "react";
import AuthServices from "../services/AuthServices";
import UserProfileService from "../services/UserProfileService";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      console.log("Init UserContext - Checking stored tokens:", {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        hasStoredUser: !!storedUser,
      });

      if (!token) {
        console.log("No token found, user not logged in");
        setLoading(false);
        return;
      }

      try {
        // Decode token to check expiration and provider
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        console.log("Token info:", {
          exp: decoded.exp,
          currentTime: currentTime,
          isExpired: decoded.exp < currentTime,
          provider: decoded.provider,
        });

        // Handle expired token
        if (decoded.exp < currentTime) {
          console.log("Token expired, attempting refresh...");
          if (refreshToken) {
            try {
              const refreshResponse = await AuthServices.refreshToken(
                refreshToken
              );
              if (refreshResponse.success) {
                console.log("Token refreshed successfully during init");
                // Token đã được cập nhật trong AuthServices.refreshToken
                // Tiếp tục với flow bình thường để lấy profile
              } else {
                throw new Error(
                  refreshResponse.message || "Token refresh failed"
                );
              }
            } catch (refreshError) {
              console.error("Failed to refresh token:", refreshError);
              toast.error(
                getVietnameseMessage(401, "Làm mới token") ||
                  "Token hết hạn và không thể làm mới"
              );
              AuthServices.clearAuthData();
              setLoading(false);
              return;
            }
          } else {
            console.log("No refresh token available, clearing auth data");
            AuthServices.clearAuthData();
            setLoading(false);
            return;
          }
        }

        const isGoogleAccount = decoded.provider === "google";

        // Fetch user profile using UserProfileService
        const profileResponse = await UserProfileService.getUserProfile();

        if (!profileResponse.success) {
          throw new Error(
            getVietnameseMessage(
              profileResponse.statusCode,
              "Lấy thông tin hồ sơ"
            ) ||
              profileResponse.message ||
              "Không thể lấy thông tin hồ sơ"
          );
        }

        const profileData = profileResponse.data; // Maps to UserProfileResponse DTO
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
          fullName: profileData.displayName,
        };

        // Update stored user data if different
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
        // Tắt toast notification để tránh spam khi page reload
        // toast.success(
        //   getVietnameseMessage(200, "Khôi phục phiên người dùng") ||
        //     "Khôi phục phiên người dùng thành công"
        // );
      } catch (err) {
        console.error("Error restoring user session:", {
          message: err.message,
          status: err.response?.status,
          errorCode: err.response?.data?.errorCode,
        });

        // Handle invalid token (401/403)
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Token invalid, clearing auth data");
          AuthServices.clearAuthData();
          setUser(null);
          setIsLogin(false);

          // Redirect to login if on a protected route
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
          // Network or server error
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
    AuthServices.clearAuthData();
    setUser(null);
    setIsLogin(false);
    toast.success(
      getVietnameseMessage(200, "Đăng xuất") || "Đăng xuất thành công"
    );
    window.location.href = "/login";
  };

  const handleLoginSuccess = (authData) => {
    console.log("Handling login success", authData);

    try {
      // authData follows AuthResponse DTO: { accessToken, refreshToken, tokenType, expiresIn, user }
      if (authData.data?.user) {
        const userData = {
          id: authData.data.user.id,
          username: authData.data.user.username,
          email: authData.data.user.email,
          displayName: authData.data.user.displayName,
          avatarUrl: authData.data.user.avatarUrl
            ? `http://localhost:8080${authData.data.user.avatarUrl}`
            : null,
          createdAt: authData.data.user.createdAt,
          fullName: authData.data.user.displayName,
          isGoogleAccount: authData.data.user.provider === "google",
        };

        setUser(userData);
        setIsLogin(true);
        localStorage.setItem("user", JSON.stringify(userData));

        console.log("Login success - user state updated");
        toast.success(
          getVietnameseMessage(200, "Đăng nhập") ||
            authData.message ||
            "Đăng nhập thành công"
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
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return AuthServices.isAuthenticated() && decoded.exp > currentTime;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  };

  const refreshUserProfile = async () => {
    try {
      const profileResponse = await UserProfileService.getUserProfile();

      if (!profileResponse.success) {
        throw new Error(
          getVietnameseMessage(profileResponse.statusCode, "Làm mới hồ sơ") ||
            profileResponse.message ||
            "Không thể làm mới hồ sơ"
        );
      }

      const profileData = profileResponse.data; // Maps to UserProfileResponse DTO
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
        fullName: profileData.displayName,
        isGoogleAccount: user?.isGoogleAccount || false,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("User profile refreshed successfully");
      toast.success(
        getVietnameseMessage(200, "Làm mới hồ sơ") ||
          profileResponse.message ||
          "Làm mới hồ sơ thành công"
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

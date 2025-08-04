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
    const init = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        const timeToExpire = decoded.exp - currentTime;

        // Nếu token còn hợp lệ và có storedUser, dùng nó
        if (timeToExpire > 300 && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLogin(true);
          setLoading(false);
          return;
        }

        // Gọi getUserProfile, để interceptor xử lý refresh nếu cần
        const profileResponse = await getUserProfile();
        const profileData = profileResponse.data || profileResponse;

        if (!profileData.id) {
          throw new Error(
            getVietnameseMessage(
              profileResponse.statusCode,
              "Lấy thông tin hồ sơ"
            ) || "Không thể lấy thông tin hồ sơ"
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
          avatarUrl,
          createdAt: profileData.createdAt,
          isGoogleAccount: decoded.provider === "google",
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLogin(true);
      } catch (err) {
        // Không xóa token, để interceptor xử lý lỗi 401
        setUser(null);
        setIsLogin(false);
        toast.error(
          getVietnameseMessage(
            err.response?.data?.statusCode,
            "Khôi phục phiên"
          ) || "Không thể khôi phục phiên người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
    setIsLogin(false);
    window.location.href = "/login";
    toast.success("Đăng xuất thành công");
  };

  const handleLoginSuccess = async (authData) => {
    try {
      if (authData.user) {
        localStorage.setItem("accessToken", authData.accessToken);
        localStorage.setItem("refreshToken", authData.refreshToken);

        const profileResponse = await getUserProfile();
        const profileData = profileResponse.data || profileResponse;

        if (!profileData.id) {
          throw new Error(
            getVietnameseMessage(
              profileResponse.statusCode,
              "Lấy thông tin hồ sơ"
            ) || "Không thể lấy thông tin hồ sơ"
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
          avatarUrl,
          createdAt: profileData.createdAt,
          isGoogleAccount: authData.user.provider === "google",
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLogin(true);
        toast.success("Đăng nhập thành công");
        return true;
      }
      throw new Error("Dữ liệu người dùng không hợp lệ");
    } catch (error) {
      toast.error("Lỗi xử lý đăng nhập");
      return false;
    }
  };

  const checkAuthStatus = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return false;

    try {
      const decoded = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const refreshUserProfile = async () => {
    try {
      const profileResponse = await getUserProfile();
      const profileData = profileResponse.data || profileResponse;

      if (!profileData.id) {
        throw new Error(
          getVietnameseMessage(profileResponse.statusCode, "Làm mới hồ sơ") ||
            "Không thể làm mới hồ sơ"
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
        avatarUrl,
        createdAt: profileData.createdAt,
        isGoogleAccount: user?.isGoogleAccount || false,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Làm mới hồ sơ thành công");
      return profileResponse;
    } catch (error) {
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Làm mới hồ sơ"
        ) || "Làm mới hồ sơ không thành công"
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

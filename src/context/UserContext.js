import React, { createContext, useEffect, useState } from "react";
import { getUserProfile } from "../services/ProfileServices";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No token found, user not logged in");
        setLoading(false);
        return;
      }

      try {
        console.log("Decoding token...");
        const decoded = jwtDecode(token);
        const isGoogleAccount = decoded.provider === "google";

        const profileResponse = await getUserProfile();
        const profileData = profileResponse.data;

        // Tạo full avatar URL từ relative path
        const avatarUrl = profileData.avatarUrl
          ? `http://localhost:8080${profileData.avatarUrl}`
          : null;

        setUser({
          ...profileData,
          isGoogleAccount,
          fullName: profileData.displayName,
          avatarUrl: avatarUrl,
        });
        setIsLogin(true);
      } catch (err) {
        console.error("Error fetching profile or decoding token:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        localStorage.removeItem("accessToken");
        setUser(null);
        setIsLogin(false);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const logout = () => {
    console.log("Logging out user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsLogin(false);
    window.location.href = "/login";
  };

  const refreshUserProfile = async () => {
    try {
      const profileResponse = await getUserProfile();
      const profileData = profileResponse.data;

      // Tạo full avatar URL từ relative path
      const avatarUrl = profileData.avatarUrl
        ? `http://localhost:8080${profileData.avatarUrl}`
        : null;

      setUser((prev) => ({
        ...prev,
        ...profileData,
        fullName: profileData.displayName,
        avatarUrl: avatarUrl,
      }));

      return profileResponse;
    } catch (error) {
      console.error("Error refreshing profile:", error);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

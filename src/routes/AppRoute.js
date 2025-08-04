import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "../pages/home/home";
import LoginPage from "../pages/auth/Login/Login";
import RegisterPage from "../pages/auth/Register/Register";
import ForgotPasswordPage from "../pages/auth/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "../pages/auth/ResetPassWord/ResetPassword";
import LobbyPage from "../pages/lobby/LobbyPage";
import GamePage from "../pages/game/GamePage"; // Ensure this points to the correct component
import ProfilePage from "../pages/user/Profile/profile";
import HistoryPage from "../pages/history/History";
import FriendsPage from "../pages/friends/Friend";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/lobby" element={<LobbyPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/friends" element={<FriendsPage />} />
    </Routes>
  );
};

export default AppRoutes;

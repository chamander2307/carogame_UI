import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Context
import { UserProvider } from "./context/UserContext";

// Components
import Header from "./components/common/Header";

// Pages
import HomePage from "./pages/home/index";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import LobbyPage from "./pages/lobby/index";
import ProfilePage from "./pages/profile/index";
import HistoryPage from "./pages/history/index";
import FriendsPage from "./pages/friends/index";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/friends" element={<FriendsPage />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

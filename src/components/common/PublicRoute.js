import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const PublicRoute = ({ children }) => {
  const { isLogin, loading, checkAuthStatus } = useContext(UserContext);

  // Nếu đang loading, hiển thị loading spinner
  if (loading) {
    return (
      <div
        className="loading-spinner"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Đang tải...
      </div>
    );
  }

  // Nếu đã đăng nhập và token còn valid, redirect về lobby
  if (isLogin && checkAuthStatus()) {
    console.log("User already authenticated, redirecting to lobby");
    return <Navigate to="/lobby" replace />;
  }

  return children;
};

export default PublicRoute;

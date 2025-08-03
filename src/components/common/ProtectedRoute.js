import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
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

  // Kiểm tra auth status
  if (!isLogin || !checkAuthStatus()) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

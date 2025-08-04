import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../../services/AuthService"; // Import đúng hàm
import { UserContext } from "../../../context/UserContext";
import AuthLayout from "../../../components/auth/AuthLayout";
import { toast } from "react-toastify";
import "./Login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLoginSuccess } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Username validation
    if (
      !formData.username ||
      formData.username.length < 3 ||
      formData.username.length > 50
    ) {
      toast.error("Tên đăng nhập phải từ 3-50 ký tự!");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới!");
      return false;
    }

    // Password validation
    if (
      !formData.password ||
      formData.password.length < 8 ||
      formData.password.length > 30
    ) {
      toast.error("Mật khẩu phải từ 8-30 ký tự!");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Gọi login với object loginData
      const loginData = {
        username: formData.username,
        password: formData.password,
      };
      const data = await login(loginData);

      // Sử dụng handleLoginSuccess từ UserContext
      const loginSuccess = handleLoginSuccess(data);

      if (!loginSuccess) {
        throw new Error("Không thể cập nhật thông tin người dùng");
      }

      console.log("Login successful:", data);
      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate("/lobby");
    } catch (error) {
      toast.error(error.message || "Đăng nhập không thành công", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" image="/images/caro-bg.jpg">
      <p className="auth__slogan">Chào mừng đến với trò chơi Caro</p>
      <form className="auth__form" onSubmit={handleLogin}>
        <div className="input-icon">
          <i className="fa fa-user" />
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="auth__input"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
            minLength={3}
            maxLength={50}
            pattern="^[a-zA-Z0-9_]+$"
            title="Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới (3-50 ký tự)"
          />
        </div>
        <div className="input-icon">
          <i className="fa fa-lock" />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            className="auth__input"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
            minLength={8}
            maxLength={30}
            title="Mật khẩu phải từ 8-30 ký tự"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <div className="auth__extra">
        <Link to="/forgot-password">Quên mật khẩu?</Link>
        <br />
        <span>Chưa có tài khoản? </span>
        <Link to="/register">Đăng ký ngay</Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

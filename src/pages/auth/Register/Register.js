import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import AuthServices from "../../../services/AuthServices";
import AuthLayout from "../../../components/auth/AuthLayout";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // Username validation (theo UserCreation DTO)
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ!");
      return false;
    }

    // Password validation (theo UserCreation DTO)
    if (
      !formData.password ||
      formData.password.length < 8 ||
      formData.password.length > 30
    ) {
      toast.error("Mật khẩu phải từ 8-30 ký tự!");
      return false;
    }

    // Display name validation
    if (!formData.displayName || formData.displayName.trim().length === 0) {
      toast.error("Tên hiển thị không được để trống!");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Gọi AuthServices.register với userData
      const data = await AuthServices.register({
        username: formData.username,
        email: formData.email,
        displayName: formData.displayName,
        password: formData.password,
      });

      if (data.success) {
        toast.success(data.message || "Đăng ký thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message || "Đăng ký không thành công", {
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
    <AuthLayout title="Đăng ký" image="/images/caro-bg.jpg">
      <p className="auth__slogan">Tạo tài khoản để bắt đầu chơi Caro</p>
      <form className="auth__form" onSubmit={handleRegister}>
        <div className="input-icon">
          <i className="fa fa-user" />
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="auth__input"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={3}
            maxLength={50}
            pattern="^[a-zA-Z0-9_]+$"
            title="Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới (3-50 ký tự)"
          />
        </div>
        <div className="input-icon">
          <i className="fa fa-user-circle" />
          <input
            type="text"
            name="displayName"
            placeholder="Tên hiển thị"
            className="auth__input"
            value={formData.displayName}
            onChange={handleChange}
            required
            disabled={loading}
            title="Tên hiển thị của bạn"
          />
        </div>
        <div className="input-icon">
          <i className="fa fa-envelope" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="auth__input"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            title="Địa chỉ email hợp lệ"
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
            onChange={handleChange}
            required
            disabled={loading}
            minLength={8}
            maxLength={30}
            title="Mật khẩu phải từ 8-30 ký tự"
          />
        </div>
        <div className="input-icon">
          <i className="fa fa-lock" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="auth__input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            title="Nhập lại mật khẩu để xác nhận"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
      <div className="auth__extra">
        <span>Đã có tài khoản? </span>
        <a href="/login">Đăng nhập ngay</a>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

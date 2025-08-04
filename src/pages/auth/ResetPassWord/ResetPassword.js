import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../../services/AuthService"; // Import đúng hàm
import { toast } from "react-toastify";
import AuthLayout from "../../../components/auth/AuthLayout";
import "./ResetPassword.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Nếu không có email từ forgot password page, redirect về forgot password
    if (!formData.email) {
      navigate("/forgot-password");
    }
  }, [formData.email, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ!");
      return false;
    }

    // OTP validation
    if (!formData.otp || !/^\d{6}$/.test(formData.otp)) {
      toast.error("OTP phải là 6 chữ số!");
      return false;
    }

    // Password validation
    if (
      !formData.newPassword ||
      formData.newPassword.length < 8 ||
      formData.newPassword.length > 30
    ) {
      toast.error("Mật khẩu mới phải từ 8-30 ký tự!");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Gọi resetPassword với object resetData
      const resetData = {
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp,
        newPassword: formData.newPassword,
      };
      const result = await resetPassword(resetData); // Sửa từ AuthServices thành resetPassword

      if (result.success) {
        toast.success(result.message || "Đặt lại mật khẩu thành công!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      image="/meo-va-chien-thuat-choi-co-caro-hieu-qua-439d.jpg"
    >
      <p className="auth__slogan">Nhập mã OTP và mật khẩu mới</p>
      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="input-icon">
          <i className="fa fa-envelope" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="auth__input"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            title="Địa chỉ email"
          />
        </div>

        <div className="input-icon">
          <i className="fa fa-key" />
          <input
            type="text"
            name="otp"
            placeholder="Mã OTP (6 chữ số)"
            className="auth__input"
            value={formData.otp}
            onChange={handleInputChange}
            maxLength="6"
            pattern="\d{6}"
            required
            disabled={loading}
            title="Mã OTP 6 chữ số"
          />
        </div>

        <div className="input-icon">
          <i className="fa fa-lock" />
          <input
            type="password"
            name="newPassword"
            placeholder="Mật khẩu mới"
            className="auth__input"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
            minLength={8}
            maxLength={30}
            title="Mật khẩu mới (8-30 ký tự)"
          />
        </div>

        <div className="input-icon">
          <i className="fa fa-lock" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu mới"
            className="auth__input"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
            title="Nhập lại mật khẩu mới"
          />
        </div>

        <button type="submit" className="auth__submit-btn" disabled={loading}>
          {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </button>

        <div className="auth__extra">
          <Link to="/login">Quay lại đăng nhập</Link>
          <br />
          <Link to="/forgot-password">Gửi lại mã OTP</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../services/AuthServices";
import { toast } from "react-toastify";
import AuthLayout from "../../components/auth/AuthLayout";
import "./ResetPassword.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.otp.trim()) {
      newErrors.otp = "Mã OTP không được để trống";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "Mã OTP phải là 6 chữ số";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });

      if (result.success) {
        toast.success("Đặt lại mật khẩu thành công!");
        navigate("/login");
      } else {
        if (result.statusCode === 400) {
          if (result.message.includes("OTP")) {
            setErrors({ otp: "Mã OTP không hợp lệ hoặc đã hết hạn" });
          } else {
            toast.error(result.message);
          }
        } else {
          toast.error(result.message || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);

      if (error.statusCode === 400) {
        if (error.message.includes("OTP")) {
          setErrors({ otp: "Mã OTP không hợp lệ hoặc đã hết hạn" });
        } else if (error.data && typeof error.data === "object") {
          setErrors(error.data);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
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
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            name="email"
            className={`auth__input ${errors.email ? "error" : ""}`}
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>
        {errors.email && <span className="error-message">{errors.email}</span>}

        <div className="input-icon">
          <i className="fas fa-key"></i>
          <input
            type="text"
            name="otp"
            className={`auth__input ${errors.otp ? "error" : ""}`}
            placeholder="Mã OTP (6 chữ số)"
            value={formData.otp}
            onChange={handleInputChange}
            disabled={isSubmitting}
            maxLength={6}
            autoComplete="one-time-code"
          />
        </div>
        {errors.otp && <span className="error-message">{errors.otp}</span>}

        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            name="newPassword"
            className={`auth__input ${errors.newPassword ? "error" : ""}`}
            placeholder="Mật khẩu mới"
            value={formData.newPassword}
            onChange={handleInputChange}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>
        {errors.newPassword && (
          <span className="error-message">{errors.newPassword}</span>
        )}

        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            name="confirmPassword"
            className={`auth__input ${errors.confirmPassword ? "error" : ""}`}
            placeholder="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth__submit-btn"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Đang xử lý...
            </>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </button>

        <div className="auth__extra">
          <Link to="/forgot-password">Gửi lại mã OTP</Link>
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

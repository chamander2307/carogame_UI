import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/AuthServices";
import { toast } from "react-toastify";
import AuthLayout from "../../components/auth/AuthLayout";
import "./ForgotPassword.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      const result = await forgotPassword(formData.email.trim().toLowerCase());

      if (result.success) {
        setIsSuccess(true);
        toast.success("Mã OTP đã được gửi đến email của bạn!");
      } else {
        if (result.statusCode === 404) {
          setErrors({ email: "Không tìm thấy tài khoản với email này" });
        } else if (result.statusCode === 429) {
          toast.error("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
        } else {
          toast.error(result.message || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.statusCode === 404) {
        setErrors({ email: "Không tìm thấy tài khoản với email này" });
      } else if (error.statusCode === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.");
      } else {
        toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    navigate("/reset-password", {
      state: { email: formData.email },
    });
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      image="/meo-va-chien-thuat-choi-co-caro-hieu-qua-439d.jpg"
    >
      {!isSuccess ? (
        <>
          <p className="auth__slogan">
            Nhập email để nhận mã OTP khôi phục mật khẩu
          </p>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="input-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                className={`auth__input ${errors.email ? "error" : ""}`}
                placeholder="Email đã đăng ký"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth__submit-btn"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang gửi...
                </>
              ) : (
                "Gửi mã OTP"
              )}
            </button>

            <div className="auth__extra">
              <Link to="/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        </>
      ) : (
        <div className="success-message">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h3>Đã gửi mã OTP!</h3>
          <p>
            Chúng tôi đã gửi mã OTP đến email <strong>{formData.email}</strong>.
            Vui lòng kiểm tra email và nhập mã để đặt lại mật khẩu.
          </p>
          <p className="note">Mã OTP có hiệu lực trong 15 phút.</p>

          <div className="success-actions">
            <button onClick={handleResetPassword} className="auth__submit-btn">
              Nhập mã OTP
            </button>
            <Link to="/login" className="back-link">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

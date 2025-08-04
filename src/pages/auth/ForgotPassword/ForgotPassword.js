import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../services/AuthService"; // Import đúng hàm
import { toast } from "react-toastify";
import AuthLayout from "../../../components/auth/AuthLayout";
import "./ForgotPassword.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      // Gọi forgotPassword với object { email }
      const result = await forgotPassword(email.trim().toLowerCase());

      setIsSuccess(true);
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      // Không cần kiểm tra result.success vì AuthService.js đã xử lý toast
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate("/reset-password", {
      state: { email: email },
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
              <i className="fa fa-envelope" />
              <input
                type="email"
                placeholder="Nhập địa chỉ email"
                className="auth__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                title="Địa chỉ email hợp lệ"
              />
            </div>

            <button
              type="submit"
              className="auth__submit-btn"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>

            <div className="auth__extra">
              <Link to="/login">Quay lại đăng nhập</Link>
              <br />
              <span>Chưa có tài khoản? </span>
              <Link to="/register">Đăng ký ngay</Link>
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
            Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>. Vui lòng
            kiểm tra email và nhập mã để đặt lại mật khẩu.
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

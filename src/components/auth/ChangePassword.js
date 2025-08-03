import React, { useState } from "react";
import AuthServices from "../../services/AuthServices";
import { toast } from "react-toastify";
import "./ChangePassword.css";

const ChangePassword = ({ onCancel, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: password form, 2: otp form
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }

    if (!formData.newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    if (formData.newPassword.length < 8 || formData.newPassword.length > 30) {
      toast.error("Mật khẩu mới phải từ 8-30 ký tự!");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      toast.error(
        "Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!"
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại!");
      return;
    }

    setLoading(true);
    try {
      // Gửi OTP
      const result = await AuthServices.requestChangePasswordOtp();
      toast.success(result.message || "OTP đã được gửi đến email của bạn!");
      setStep(2);
    } catch (error) {
      toast.error(error.message || "Không thể gửi OTP. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp.trim()) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }

    if (!/^\d{6}$/.test(formData.otp)) {
      toast.error("OTP phải là 6 chữ số!");
      return;
    }

    setLoading(true);
    try {
      // Gọi AuthServices.changePassword
      const result = await AuthServices.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.otp
      );

      toast.success(result.message || "Đổi mật khẩu thành công!");
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!");
      // Reset OTP field on error
      setFormData((prev) => ({ ...prev, otp: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setFormData((prev) => ({ ...prev, otp: "" }));
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      otp: "",
    });
    setStep(1);
    onCancel?.();
  };

  return (
    <div className="change-password-component">
      <div className="change-password-header">
        <h3>Đổi mật khẩu</h3>
        <div className="step-indicator">
          <span
            className={`step ${
              step === 1 ? "active" : step > 1 ? "completed" : ""
            }`}
          >
            1. Mật khẩu
          </span>
          <span className={`step ${step === 2 ? "active" : ""}`}>
            2. Xác thực OTP
          </span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới *</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu mới (8-30 ký tự)"
              disabled={loading}
              required
              minLength={8}
              maxLength={30}
            />
            <small className="password-hint">
              Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="btn-cancel"
            >
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-next">
              {loading ? "Đang gửi OTP..." : "Tiếp tục"}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="otp-form">
          <div className="otp-info">
            <p>
              Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email và
              nhập mã để hoàn tất việc đổi mật khẩu.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="otp">Mã OTP *</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Nhập mã OTP 6 chữ số"
              disabled={loading}
              required
              maxLength={6}
              pattern="\d{6}"
              autoFocus
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="btn-back"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="btn-cancel"
            >
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;

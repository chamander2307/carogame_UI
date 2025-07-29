import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { register as registerService } from "../../services/AuthServices";
import { UserContext } from "../../context/UserContext";
import AuthLayout from "../../components/auth/AuthLayout";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const data = await registerService({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });
      if (data === null) {
        throw new Error("Đăng ký không thành công");
      }

      // Auto login after successful registration
      login({
        userId: data.userId,
        fullName: data.fullName || formData.fullName,
        avatarUrl: data.avatarUrl || null,
      });

      toast.success("Đăng ký thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate("/lobby");
    } catch (error) {
      toast.error(error.message || "Đăng ký không thành công", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
          />
        </div>
        <button type="submit">Đăng ký</button>
      </form>
      <div className="auth__extra">
        <span>Đã có tài khoản? </span>
        <a href="/login">Đăng nhập ngay</a>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

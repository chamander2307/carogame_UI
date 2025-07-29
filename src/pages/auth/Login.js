import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login as loginService } from "../../services/AuthServices";
import { UserContext } from "../../context/UserContext";
import AuthLayout from "../../components/auth/AuthLayout";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginService({
        username: username,
        password: password,
      });

      if (!data.success) {
        throw new Error(data.message || "Đăng nhập không thành công");
      }

      // Gọi hàm login từ UserContext
      const result = await login({
        username: username,
        password: password,
      });

      if (result.success) {
        console.log("Data login returned:", data);
        navigate("/lobby");
      }
    } catch (error) {
      toast.error(error.message || "Đăng nhập không thành công", {
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
    <AuthLayout title="Đăng nhập" image="/images/caro-bg.jpg">
      <p className="auth__slogan">Chào mừng đến với trò chơi Caro</p>
      <form className="auth__form" onSubmit={handleLogin}>
        <div className="input-icon">
          <i className="fa fa-user" />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="auth__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-icon">
          <i className="fa fa-lock" />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <div className="auth__extra">
        <a href="#">Quên mật khẩu?</a>
        <br />
        <span>Chưa có tài khoản? </span>
        <a href="/register">Đăng ký ngay</a>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

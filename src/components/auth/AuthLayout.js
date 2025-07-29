import React from "react";
import "./AuthLayout.css";
import Logo from "./Logo.js";

const AuthLayout = ({ children, title, image }) => {
  return (
    <>
      <div className="auth auth--split">
        <div
          className="auth__left"
          style={{
            backgroundImage: `url("https://vietadsgroup.vn/manager/uploads/post/co-caro-la-gi-tim-hieu-ve-co-caro-la-gi-.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "60%",
            height: "100vh",
          }}
        ></div>

        <div className="auth__right" style={{ width: "40%" }}>
          <div className="auth__form-box">
            <div className="auth__logo-wrapper">
              <Logo />
            </div>
            {title && <h2 className="auth__title">{title}</h2>}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;

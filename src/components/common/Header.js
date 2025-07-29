import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { UserContext } from "../../context/UserContext";

const Header = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const userRef = useRef();

  const { isLogin, user, logout } = useContext(UserContext);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/antorgree.svg" alt="Logo" className="logo-img" />
            <span className="logo-text">CARO GAME</span>
          </Link>

          <nav className={`nav-combined ${isNavOpen ? "active" : ""}`}>
            <Link to="/lobby" className="nav-item">
              Phòng chơi
            </Link>
            <Link to="/players" className="nav-item">
              Người chơi
            </Link>
            <Link to="/history" className="nav-item">
              Lịch sử
            </Link>
            <Link to="/friends" className="nav-item">
              Bạn bè
            </Link>
          </nav>
        </div>

        <div className="account-area">
          {isLogin ? (
            <div
              className="user-info"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              ref={userRef}
            >
              <div className="user-avatar">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="user-avatar-img"
                  />
                ) : (
                  <span className="user-avatar-placeholder">
                    {getInitial(user.fullName)}
                  </span>
                )}
              </div>
              <span className="username">{user.fullName}</span>
              {showUserDropdown && (
                <div className="dropdown-menu user-dropdown">
                  <Link to="/profile">Tài khoản</Link>
                  <Link to="/friends">Bạn bè</Link>
                  <Link to="/history">Lịch sử trận đấu</Link>
                  <button onClick={logout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register" style={{ marginLeft: 12 }}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        <div className="hamburger" onClick={toggleNav}>
          ☰
        </div>
      </div>
    </header>
  );
};

export default Header;

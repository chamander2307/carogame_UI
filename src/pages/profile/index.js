import React, { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "./index.css";

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    avatar: user?.avatarUrl || "",
  });

  const [stats] = useState({
    gamesPlayed: 45,
    gamesWon: 32,
    gamesLost: 11,
    gamesDraw: 2,
    winRate: 71,
    longestWinStreak: 8,
    favoriteOpponent: "ProGamer123",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Logic cập nhật profile sẽ được implement sau
    console.log("Updating profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      avatar: user?.avatarUrl || "",
    });
    setIsEditing(false);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Tài khoản của tôi</h1>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="avatar-section">
              <div className="user-avatar-large">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" />
                ) : (
                  <span className="avatar-placeholder">
                    {getInitial(formData.fullName)}
                  </span>
                )}
              </div>
              {isEditing && (
                <button className="btn-change-avatar">Đổi ảnh đại diện</button>
              )}
            </div>

            <div className="profile-info">
              {!isEditing ? (
                <div className="info-display">
                  <div className="info-item">
                    <label>Tên đầy đủ:</label>
                    <span>{formData.fullName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{formData.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Tên đăng nhập:</label>
                    <span>{user?.username}</span>
                  </div>
                  <div className="profile-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setIsEditing(true)}
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="info-form">
                  <div className="form-group">
                    <label>Tên đầy đủ:</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>URL ảnh đại diện:</label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={handleCancel}>
                      Hủy
                    </button>
                    <button type="submit" className="btn-primary">
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="stats-card">
            <h2>Thống kê trò chơi</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.gamesPlayed}</div>
                <div className="stat-label">Trận đã chơi</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.gamesWon}</div>
                <div className="stat-label">Trận thắng</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.gamesLost}</div>
                <div className="stat-label">Trận thua</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.gamesDraw}</div>
                <div className="stat-label">Trận hòa</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.winRate}%</div>
                <div className="stat-label">Tỉ lệ thắng</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.longestWinStreak}</div>
                <div className="stat-label">Chuỗi thắng dài nhất</div>
              </div>
            </div>
          </div>

          <div className="achievements-card">
            <h2>Thành tích</h2>
            <div className="achievements-list">
              <div className="achievement-item">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-info">
                  <h4>Người mới</h4>
                  <p>Chơi trận đấu đầu tiên</p>
                </div>
                <div className="achievement-status completed">✓</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">🔥</div>
                <div className="achievement-info">
                  <h4>Chuỗi thắng</h4>
                  <p>Thắng 5 trận liên tiếp</p>
                </div>
                <div className="achievement-status completed">✓</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon">💯</div>
                <div className="achievement-info">
                  <h4>Thế kỷ</h4>
                  <p>Chơi 100 trận đấu</p>
                </div>
                <div className="achievement-status pending">45/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../../../context/UserContext";
import { updateProfile, updateAvatar } from "../../../services/ProfileServices";
import ChangePassword from "../../../components/auth/ChangePassword";
import { toast } from "react-toastify";
import "./index.css";

const ProfilePage = () => {
  const { user, refreshUserProfile } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    displayName: user?.displayName || user?.fullName || "",
    email: user?.email || "",
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

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        displayName: user.displayName || user.fullName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatar(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form according to UpdateProfileRequest DTO
      if (!formData.username.trim()) {
        toast.error("Tên đăng nhập không được để trống");
        return;
      }
      if (formData.username.length < 3 || formData.username.length > 50) {
        toast.error("Tên đăng nhập phải từ 3-50 ký tự");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        toast.error("Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới");
        return;
      }
      if (formData.displayName && formData.displayName.length > 50) {
        toast.error("Tên hiển thị tối đa 50 ký tự");
        return;
      }

      // Call updateProfile with UpdateProfileRequest DTO format
      const result = await updateProfile({
        username: formData.username.trim(),
        displayName: formData.displayName.trim() || null,
      });

      toast.success(result.message || "Cập nhật thông tin thành công!");
      await refreshUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) {
      toast.error("Vui lòng chọn ảnh trước");
      return;
    }

    setAvatarLoading(true);
    try {
      const result = await updateAvatar(selectedAvatar);
      toast.success(result.message || "Cập nhật ảnh đại diện thành công!");
      setSelectedAvatar(null);
      await refreshUserProfile();
    } catch (error) {
      console.error("Upload avatar error:", error);
      toast.error(error.message || "Cập nhật ảnh đại diện thất bại");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || "",
        displayName: user.displayName || user.fullName || "",
        email: user.email || "",
      });
    }
    setSelectedAvatar(null);
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
              <div className="user-avatar-large" onClick={handleAvatarClick}>
                {selectedAvatar || user?.avatarUrl ? (
                  <img
                    src={
                      selectedAvatar
                        ? URL.createObjectURL(selectedAvatar)
                        : user?.avatarUrl
                    }
                    alt="Avatar"
                  />
                ) : (
                  <span className="avatar-placeholder">
                    {getInitial(formData.displayName || formData.username)}
                  </span>
                )}
                <div className="avatar-overlay">
                  <span>Thay đổi ảnh</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div className="avatar-actions">
                <button
                  type="button"
                  className="btn-change-avatar"
                  onClick={handleAvatarClick}
                  disabled={avatarLoading}
                >
                  Chọn ảnh mới
                </button>
                {selectedAvatar && (
                  <button
                    type="button"
                    className="btn-upload-avatar"
                    onClick={handleAvatarUpload}
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? "Đang tải..." : "Cập nhật ảnh"}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-info">
              {!isEditing ? (
                <div className="info-display">
                  <div className="info-item">
                    <label>Tên hiển thị:</label>
                    <span>{formData.displayName || "Chưa cập nhật"}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{formData.email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="info-item">
                    <label>Tên đăng nhập:</label>
                    <span>{formData.username || "Chưa cập nhật"}</span>
                  </div>
                  <div className="profile-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setIsEditing(true)}
                      disabled={isChangingPassword}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="btn-change-password"
                      onClick={() => setIsChangingPassword(true)}
                      disabled={isEditing}
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="info-form">
                  <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đăng nhập"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên hiển thị:</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder="Nhập tên hiển thị"
                      disabled={loading}
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
                      placeholder="Nhập email"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password Change Section */}
            {isChangingPassword && (
              <ChangePassword
                onSuccess={() => setIsChangingPassword(false)}
                onCancel={() => setIsChangingPassword(false)}
              />
            )}
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
                <div className="achievement-icon"></div>
                <div className="achievement-info">
                  <h4>Người mới</h4>
                  <p>Chơi trận đấu đầu tiên</p>
                </div>
                <div className="achievement-status completed">✓</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon"></div>
                <div className="achievement-info">
                  <h4>Chuỗi thắng</h4>
                  <p>Thắng 5 trận liên tiếp</p>
                </div>
                <div className="achievement-status completed">✓</div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon"></div>
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

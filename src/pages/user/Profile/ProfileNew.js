import React, { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../../../context/UserContext.js";
import {
  updateProfile,
  uploadAvatar,
  updateProfileWithAvatar,
} from "../../../services/UserProfileService.js";
import { getUserGameStatistics } from "../../../services/GameStatisticsService.js";
import ChangePassword from "../../../components/auth/ChangePassword.js";
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
    displayName: user?.displayName || "",
    email: user?.email || "",
  });

  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    winRate: 0,
    bestWinStreak: 0,
  });

  useEffect(() => {
    if (user) {
      console.log("User data:", user); // Debug user.avatarUrl
      setFormData({
        username: user.username || "",
        displayName: user.displayName || "",
        email: user.email || "",
      });
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await getUserGameStatistics();
      console.log("User stats response:", response); // Debug API response
      setStats({
        totalGamesPlayed: response.totalGamesPlayed || 0,
        totalWins: response.totalWins || 0,
        totalLosses: response.totalLosses || 0,
        totalDraws: response.totalDraws || 0,
        winRate: response.winRate || 0,
        bestWinStreak: response.bestWinStreak || 0,
      });
    } catch (error) {
      console.error("Failed to load user stats:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(error.message || "Không thể tải thống kê người dùng");
    }
  };

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

      let result;
      if (selectedAvatar) {
        result = await updateProfileWithAvatar(
          {
            username: formData.username.trim(),
            displayName: formData.displayName.trim() || null,
          },
          selectedAvatar
        );
      } else {
        result = await updateProfile({
          username: formData.username.trim(),
          displayName: formData.displayName.trim() || null,
        });
      }

      await refreshUserProfile();
      setIsEditing(false);
      setSelectedAvatar(null);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Update profile error:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
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
      const result = await uploadAvatar(selectedAvatar);
      await refreshUserProfile();
      setSelectedAvatar(null);
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      console.error("Upload avatar error:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(error.message || "Cập nhật ảnh đại diện thất bại");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || "",
        displayName: user.displayName || "",
        email: user.email || "",
      });
    }
    setSelectedAvatar(null);
    setIsEditing(false);
  };

  const normalizeAvatarUrl = (avatarUrl) => {
    if (!avatarUrl || avatarUrl === "null" || avatarUrl.trim() === "") {
      console.warn("Invalid avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
    if (avatarUrl.startsWith("/")) {
      return `http://localhost:8080${avatarUrl}`;
    }
    try {
      new URL(avatarUrl);
      return avatarUrl;
    } catch (e) {
      console.warn("Invalid absolute avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
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
                        : normalizeAvatarUrl(user?.avatarUrl)
                    }
                    alt="Avatar"
                    onError={(e) => {
                      console.warn(
                        `Failed to load avatar for ${
                          user?.username || "user"
                        }:`,
                        user?.avatarUrl
                      );
                      e.target.src = "/default-avatar.png";
                    }}
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
                      disabled={isChangingPassword || loading}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="btn-change-password"
                      onClick={() => setIsChangingPassword(true)}
                      disabled={isEditing || loading}
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
                      disabled
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

            {isChangingPassword && (
              <ChangePassword
                onSuccess={() => {
                  setIsChangingPassword(false);
                  toast.success("Đổi mật khẩu thành công");
                }}
                onCancel={() => setIsChangingPassword(false)}
              />
            )}
          </div>

          <div className="stats-card">
            <h2>Thống kê trò chơi</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.totalGamesPlayed}</div>
                <div className="stat-label">Trận đã chơi</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalWins}</div>
                <div className="stat-label">Trận thắng</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalLosses}</div>
                <div className="stat-label">Trận thua</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalDraws}</div>
                <div className="stat-label">Trận hòa</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.winRate}%</div>
                <div className="stat-label">Tỉ lệ thắng</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.bestWinStreak}</div>
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
                <div className="achievement-status completed">
                  {stats.totalGamesPlayed > 0 ? "✓" : "Chưa đạt"}
                </div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon"></div>
                <div className="achievement-info">
                  <h4>Chuỗi thắng</h4>
                  <p>Thắng 5 trận liên tiếp</p>
                </div>
                <div className="achievement-status completed">
                  {stats.bestWinStreak >= 5 ? "✓" : "Chưa đạt"}
                </div>
              </div>
              <div className="achievement-item">
                <div className="achievement-icon"></div>
                <div className="achievement-info">
                  <h4>Thế kỷ</h4>
                  <p>Chơi 100 trận đấu</p>
                </div>
                <div className="achievement-status pending">
                  {stats.totalGamesPlayed >= 100
                    ? "✓"
                    : `${stats.totalGamesPlayed}/100`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

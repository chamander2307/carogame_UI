import React, { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../../../context/UserContext";
import UserProfileService from "../../../services/UserProfileService";
import StatisticsService from "../../../services/StatisticsService";
import ChangePassword from "../../../components/auth/ChangePassword";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../../../constants/VietNameseStatus";
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

  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    winRate: 0,
    bestWinStreak: 0,
    favoriteOpponent: "N/A",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        displayName: user.displayName || user.fullName || "",
        email: user.email || "",
      });

      // Load user statistics from StatisticsService
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await StatisticsService.getUserStats();
      if (response.success && response.data) {
        setStats({
          totalGamesPlayed: response.data.totalGamesPlayed || 0,
          totalWins: response.data.totalWins || 0,
          totalLosses: response.data.totalLosses || 0,
          totalDraws: response.data.totalDraws || 0,
          winRate: response.data.winRate || 0,
          bestWinStreak: response.data.bestWinStreak || 0,
          favoriteOpponent: response.data.favoriteOpponent || "N/A",
        });
        toast.success(
          getVietnameseMessage(response.statusCode, "Lấy thống kê") ||
            response.message ||
            "Lấy thống kê người dùng thành công"
        );
      } else {
        throw new Error(
          getVietnameseMessage(response.statusCode, "Lấy thống kê") ||
            response.message ||
            "Không thể tải thống kê người dùng"
        );
      }
    } catch (error) {
      console.error("Failed to load user stats:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Lấy thống kê"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể tải thống kê người dùng"
      );
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
      // Validate form based on typical backend constraints
      if (!formData.username.trim()) {
        toast.error(
          getVietnameseMessage(400, "Cập nhật hồ sơ") ||
            "Tên đăng nhập không được để trống"
        );
        return;
      }
      if (formData.username.length < 3 || formData.username.length > 20) {
        toast.error(
          getVietnameseMessage(400, "Cập nhật hồ sơ") ||
            "Tên đăng nhập phải từ 3-20 ký tự"
        );
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        toast.error(
          getVietnameseMessage(400, "Cập nhật hồ sơ") ||
            "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"
        );
        return;
      }
      if (formData.displayName && formData.displayName.length > 50) {
        toast.error(
          getVietnameseMessage(400, "Cập nhật hồ sơ") ||
            "Tên hiển thị tối đa 50 ký tự"
        );
        return;
      }

      // Update profile using UserProfileService
      const result = await UserProfileService.updateProfile({
        username: formData.username.trim(),
        displayName: formData.displayName.trim() || null,
      });

      if (result.success) {
        toast.success(
          getVietnameseMessage(result.statusCode, "Cập nhật hồ sơ") ||
            result.message ||
            "Cập nhật thông tin thành công!"
        );
        await refreshUserProfile();
        setIsEditing(false);
      } else {
        throw new Error(
          getVietnameseMessage(result.statusCode, "Cập nhật hồ sơ") ||
            result.message ||
            "Cập nhật thông tin thất bại"
        );
      }
    } catch (error) {
      console.error("Update profile error:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Cập nhật hồ sơ"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Cập nhật thông tin thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) {
      toast.error(
        getVietnameseMessage(400, "Tải lên avatar") || "Vui lòng chọn ảnh trước"
      );
      return;
    }

    setAvatarLoading(true);
    try {
      const result = await UserProfileService.uploadAvatar(selectedAvatar);
      if (result.success) {
        toast.success(
          getVietnameseMessage(result.statusCode, "Tải lên avatar") ||
            result.message ||
            "Cập nhật ảnh đại diện thành công!"
        );
        setSelectedAvatar(null);
        await refreshUserProfile();
      } else {
        throw new Error(
          getVietnameseMessage(result.statusCode, "Tải lên avatar") ||
            result.message ||
            "Cập nhật ảnh đại diện thất bại"
        );
      }
    } catch (error) {
      console.error("Upload avatar error:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Tải lên avatar"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Cập nhật ảnh đại diện thất bại"
      );
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
                onSuccess={() => setIsChangingPassword(false)}
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

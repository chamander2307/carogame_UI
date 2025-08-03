import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const getUserProfile = async () => {
  try {
    const response = await instance.get("/user-profile");
    const data = response.data;
    if (data?.data) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode) || "Lấy thông tin thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy thông tin") ||
        "Lấy thông tin không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Lấy thông tin") ||
        "Lấy thông tin không thành công"
    );
  }
};

// Update profile theo UpdateProfileRequest DTO
export const updateProfile = async (profileData) => {
  try {
    // Validate username (required)
    if (!profileData.username || profileData.username.trim().length === 0) {
      throw new Error("Username is required");
    }

    const username = profileData.username.trim();
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error(
        "Username can only contain letters, numbers and underscores"
      );
    }

    // Validate displayName (optional)
    const displayName = profileData.displayName
      ? profileData.displayName.trim()
      : null;
    if (displayName && displayName.length > 50) {
      throw new Error("Display name cannot exceed 50 characters");
    }

    // Gửi theo UpdateProfileRequest DTO format
    const requestData = {
      username: username,
      displayName: displayName || null,
    };

    const response = await instance.put("/user-profile", requestData);
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Cập nhật thông tin") ||
          "Cập nhật thông tin thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Cập nhật thông tin") ||
        "Cập nhật thông tin không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Cập nhật thông tin") ||
        "Cập nhật thông tin không thành công"
    );
  }
};

// Update display name only - endpoint doesn't exist in backend
// Use updateProfile() instead for all profile updates
export const updateDisplayName = async (displayName) => {
  console.warn(
    "updateDisplayName() endpoint /user-profile/display-name doesn't exist in backend"
  );
  console.info("Use updateProfile() method instead for updating display name");

  // Redirect to updateProfile method
  return updateProfile({ displayName });
};

// Update avatar - endpoint doesn't exist in backend
export const updateAvatar = async (avatarFile) => {
  console.warn(
    "updateAvatar() endpoint /user-profile/avatar doesn't exist in backend UserProfileController"
  );
  throw new Error(
    "Avatar upload functionality not available - endpoint not implemented in backend"
  );
};

// Default export with all profile functions
const ProfileService = {
  getUserProfile,
  updateProfile,
  updateDisplayName,
  updateAvatar,
};

export default ProfileService;

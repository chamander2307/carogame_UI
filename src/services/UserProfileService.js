import instance from "../config/axios";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

// Helper function to handle API errors
const handleApiError = (
  error,
  defaultMessage = "Có lỗi xảy ra, vui lòng thử lại"
) => {
  const errorMessage = error.response?.data?.message || defaultMessage;
  const vietnameseMessage =
    getVietnameseMessage(error.response?.data?.errorCode) || errorMessage;
  toast.error(vietnameseMessage);
  if (error.response?.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
  throw new Error(vietnameseMessage);
};

// Get User Profile
export const getUserProfile = async () => {
  try {
    const response = await instance.get("/user-profile");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Không thể lấy thông tin hồ sơ người dùng");
  }
};

// Update Profile
export const updateProfile = async (profileData) => {
  try {
    const response = await instance.put("/user-profile", profileData);
    toast.success("Cập nhật hồ sơ thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Cập nhật hồ sơ thất bại");
  }
};

// Upload Avatar
export const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const response = await instance.post("/user-profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Tải ảnh đại diện thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tải ảnh đại diện thất bại");
  }
};

// Update Profile and Avatar
export const updateProfileWithAvatar = async (profileData, avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("request", JSON.stringify(profileData));
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    const response = await instance.put("/user-profile/complete", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Cập nhật hồ sơ và ảnh đại diện thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Cập nhật hồ sơ và ảnh đại diện thất bại");
  }
};

import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

const UserProfileService = {
  // Get current user profile
  getUserProfile: async () => {
    try {
      const response = await instance.get("/user-profile");
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy thông tin hồ sơ") ||
            data.message ||
            "Lấy thông tin hồ sơ thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy thông tin hồ sơ") ||
          data.message ||
          "Lấy thông tin hồ sơ không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy thông tin hồ sơ:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy thông tin hồ sơ") ||
          error.response?.data?.message ||
          "Lấy thông tin hồ sơ không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy thông tin hồ sơ") ||
          error.response?.data?.message ||
          "Lấy thông tin hồ sơ không thành công"
      );
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await instance.put("/user-profile", profileData);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Cập nhật hồ sơ") ||
            data.message ||
            "Cập nhật hồ sơ thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Cập nhật hồ sơ") ||
          data.message ||
          "Cập nhật hồ sơ không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi cập nhật hồ sơ:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Cập nhật hồ sơ") ||
          error.response?.data?.message ||
          "Cập nhật hồ sơ không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Cập nhật hồ sơ") ||
          error.response?.data?.message ||
          "Cập nhật hồ sơ không thành công"
      );
    }
  },

  // Upload avatar
  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await instance.post("/user-profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Tải lên avatar") ||
            data.message ||
            "Tải lên avatar thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Tải lên avatar") ||
          data.message ||
          "Tải lên avatar không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi tải lên avatar:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Tải lên avatar") ||
          error.response?.data?.message ||
          "Tải lên avatar không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Tải lên avatar") ||
          error.response?.data?.message ||
          "Tải lên avatar không thành công"
      );
    }
  },

  // Update profile and avatar together
  updateCompleteProfile: async (profileData, avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("profileData", JSON.stringify(profileData));
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const response = await instance.put("/user-profile/complete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(
              data.statusCode,
              "Cập nhật hồ sơ hoàn chỉnh"
            ) ||
            data.message ||
            "Cập nhật hồ sơ hoàn chỉnh thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Cập nhật hồ sơ hoàn chỉnh") ||
          data.message ||
          "Cập nhật hồ sơ hoàn chỉnh không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi cập nhật hồ sơ hoàn chỉnh:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Cập nhật hồ sơ hoàn chỉnh") ||
          error.response?.data?.message ||
          "Cập nhật hồ sơ hoàn chỉnh không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Cập nhật hồ sơ hoàn chỉnh") ||
          error.response?.data?.message ||
          "Cập nhật hồ sơ hoàn chỉnh không thành công"
      );
    }
  },
};

export default UserProfileService;

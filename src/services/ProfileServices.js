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
    // Gửi theo UpdateProfileRequest DTO format
    const requestData = {
      username: profileData.username,
      displayName: profileData.displayName,
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

// Update display name only theo UserProfileUpdateRequest DTO
export const updateDisplayName = async (displayName) => {
  try {
    // Gửi theo UserProfileUpdateRequest DTO format
    const requestData = {
      displayName: displayName,
    };

    const response = await instance.put(
      "/user-profile/display-name",
      requestData
    );
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Cập nhật tên hiển thị") ||
          "Cập nhật tên hiển thị thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Cập nhật tên hiển thị") ||
        "Cập nhật tên hiển thị không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Cập nhật tên hiển thị") ||
        "Cập nhật tên hiển thị không thành công"
    );
  }
};

// Update avatar - separate endpoint
export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await instance.post("/user-profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Cập nhật avatar") ||
          "Cập nhật avatar thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Cập nhật avatar") ||
        "Cập nhật avatar không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Cập nhật avatar") ||
        "Cập nhật avatar không thành công"
    );
  }
};

import instance from "../config/axios";

export const getUserProfile = async () => {
  try {
    const response = await instance.get("/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await instance.put("/profile", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await instance.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfileComplete = async (profileData, avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("username", profileData.username);
    if (profileData.displayName) {
      formData.append("displayName", profileData.displayName);
    }
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const response = await instance.put("/profile/complete", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

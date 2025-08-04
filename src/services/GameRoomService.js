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

  // Don't show toast for 401 errors - let axios interceptor handle them
  if (error.response?.status !== 401) {
    toast.error(vietnameseMessage);
  }

  // Don't automatically redirect on 401 - let axios interceptor handle token refresh
  // Only the interceptor should decide when to actually logout
  throw new Error(vietnameseMessage);
};

// Create Room
export const createRoom = async (roomData) => {
  try {
    const response = await instance.post("/rooms", roomData);
    toast.success("Tạo phòng thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tạo phòng thất bại");
  }
};

// Quick Play
export const quickPlay = async () => {
  try {
    const response = await instance.post("/rooms/quick-play");
    toast.success("Tham gia phòng nhanh thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tham gia phòng nhanh thất bại");
  }
};

// Get Room Details
export const getRoomDetails = async (roomId) => {
  try {
    const response = await instance.get(`/rooms/${roomId}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy thông tin phòng thất bại");
  }
};

// Get Public Rooms
export const getPublicRooms = async (
  page = 0,
  size = 20,
  sortDirection = "desc"
) => {
  try {
    const response = await instance.get(
      `/rooms/public?page=${page}&size=${size}&sortDirection=${sortDirection}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy danh sách phòng công khai thất bại");
  }
};

// Get User Rooms
export const getUserRooms = async (
  page = 0,
  size = 20,
  sortDirection = "desc"
) => {
  try {
    const response = await instance.get(
      `/rooms/user-rooms?page=${page}&size=${size}&sortDirection=${sortDirection}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy danh sách phòng của người dùng thất bại");
  }
};

// Get Current Room
export const getCurrentRoom = async () => {
  try {
    const response = await instance.get("/rooms/current");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy thông tin phòng hiện tại thất bại");
  }
};

// Invite Friend
export const inviteFriend = async (roomId, friendUserId) => {
  try {
    const response = await instance.post(`/rooms/${roomId}/invite`, {
      friendUserId,
    });
    toast.success("Gửi lời mời bạn bè thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Gửi lời mời bạn bè thất bại");
  }
};

// Get User Game History
export const getUserGameHistory = async (
  page = 0,
  size = 20,
  sortDirection = "desc"
) => {
  try {
    const response = await instance.get(
      `/rooms/history?page=${page}&size=${size}&sortDirection=${sortDirection}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy lịch sử game thất bại");
  }
};

// Join Room by Code
export const joinRoomByCode = async (joinCode) => {
  try {
    const response = await instance.post("/rooms/join-by-code", {
      joinCode,
    });
    toast.success("Tham gia phòng bằng mã thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tham gia phòng bằng mã thất bại");
  }
};

// Join Room by ID
export const joinRoomById = async (roomId) => {
  try {
    const response = await instance.post(`/rooms/${roomId}/join`);
    toast.success("Tham gia phòng thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tham gia phòng thất bại");
  }
};

// Leave Room
export const leaveRoom = async (roomId) => {
  try {
    const response = await instance.post(`/rooms/${roomId}/leave`);
    toast.success("Rời phòng thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Rời phòng thất bại");
  }
};

// Find Room by Code
export const findRoomByCode = async (joinCode) => {
  try {
    const response = await instance.get(`/rooms/find-by-code/${joinCode}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tìm phòng bằng mã thất bại");
  }
};

// Create Rematch
export const createRematch = async (roomId) => {
  try {
    const response = await instance.post(`/rooms/${roomId}/rematch`);
    toast.success("Tạo phòng tái đấu thành công");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tạo phòng tái đấu thất bại");
  }
};

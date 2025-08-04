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

// Search Users
export const searchUsers = async (searchTerm) => {
  try {
    const response = await instance.post("/friends/search", { searchTerm });
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Tìm kiếm người dùng thất bại");
  }
};

// Send Friend Request
export const sendFriendRequest = async (userId) => {
  try {
    const response = await instance.post(`/friends/${userId}/request`);
    toast.success("Gửi lời mời kết bạn thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Gửi lời mời kết bạn thất bại");
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (userId) => {
  try {
    const response = await instance.post(`/friends/${userId}/accept`);
    toast.success("Chấp nhận lời mời kết bạn thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Chấp nhận lời mời kết bạn thất bại");
  }
};

// Reject Friend Request
export const rejectFriendRequest = async (userId) => {
  try {
    const response = await instance.post(`/friends/${userId}/reject`);
    toast.success("Từ chối lời mời kết bạn thành công");
    return response.data;
  } catch (error) {
    handleApiError(error, "Từ chối lời mời kết bạn thất bại");
  }
};

// Get Friends List
export const getFriendsList = async () => {
  try {
    const response = await instance.get("/friends");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy danh sách bạn bè thất bại");
  }
};

// Get Pending Friend Requests
export const getPendingFriendRequests = async () => {
  try {
    const response = await instance.get("/friends/requests/received");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy danh sách lời mời kết bạn thất bại");
  }
};

// Get Sent Friend Requests
export const getSentFriendRequests = async () => {
  try {
    const response = await instance.get("/friends/requests/sent");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy danh sách lời mời đã gửi thất bại");
  }
};

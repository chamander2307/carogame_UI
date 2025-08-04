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

// Get User Game Statistics
export const getUserGameStatistics = async () => {
  try {
    const response = await instance.get("/statistics/my-stats");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy thống kê game thất bại");
  }
};

// Get User Game Statistics by ID
export const getUserGameStatisticsById = async (userId) => {
  try {
    const response = await instance.get(`/statistics/user/${userId}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy thống kê game của người dùng thất bại");
  }
};

// Get Game Replay
export const getGameReplay = async (gameId) => {
  try {
    const response = await instance.get(`/statistics/replay/${gameId}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy dữ liệu phát lại game thất bại");
  }
};

// Get User Game History
export const getUserGameReplays = async (
  page = 0,
  size = 10,
  sortDirection = "desc"
) => {
  try {
    const response = await instance.get(
      `/statistics/my-history?page=${page}&size=${size}&sortDirection=${sortDirection}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy lịch sử game thất bại");
  }
};

// Get Top Players
export const getTopPlayers = async (limit = 10, page = 0, size = 10) => {
  try {
    const response = await instance.get(
      `/statistics/leaderboard?limit=${limit}&page=${page}&size=${size}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy bảng xếp hạng thất bại");
  }
};

// Get User Ranking
export const getUserRanking = async () => {
  try {
    const response = await instance.get("/statistics/my-ranking");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy thứ hạng người dùng thất bại");
  }
};

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

// Make Move
export const makeMove = async (roomId, moveData) => {
  try {
    const response = await instance.post(`/v1/games/${roomId}/moves`, moveData);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Thực hiện nước đi thất bại");
  }
};

// Get Current Board
export const getCurrentBoard = async (roomId) => {
  try {
    const response = await instance.get(`/v1/games/${roomId}/board`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy trạng thái bàn cờ thất bại");
  }
};

// Get Player Symbol
export const getPlayerSymbol = async (roomId) => {
  try {
    const response = await instance.get(`/v1/games/${roomId}/player-symbol`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Lấy biểu tượng người chơi thất bại");
  }
};

import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

const StatisticsService = {
  getUserGameHistory: async (page = 0, size = 20, sortDirection = "desc") => {
    try {
      const response = await instance.get(
        `/statistics/my-history?page=${page}&size=${size}&sortDirection=${sortDirection}`
      );
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy lịch sử game") ||
            data.message ||
            "Lấy lịch sử game thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy lịch sử game") ||
          data.message ||
          "Lấy lịch sử game không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi lấy lịch sử game:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Lấy lịch sử game") ||
          error.response?.data?.message ||
          "Lấy lịch sử game không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy lịch sử game") ||
          error.response?.data?.message ||
          "Lấy lịch sử game không thành công"
      );
    }
  },

  getGameReplay: async (gameId) => {
    try {
      const response = await instance.get(`/statistics/replay/${gameId}`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy replay game") ||
            data.message ||
            "Lấy replay game thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy replay game") ||
          data.message ||
          "Lấy replay game không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi lấy replay game:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Lấy replay game") ||
          error.response?.data?.message ||
          "Lấy replay game không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy replay game") ||
          error.response?.data?.message ||
          "Lấy replay game không thành công"
      );
    }
  },

  getUserStats: async (userId = null) => {
    try {
      const url = userId
        ? `/statistics/user/${userId}`
        : "/statistics/my-stats";
      const response = await instance.get(url);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy thống kê") ||
            data.message ||
            "Lấy thống kê thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy thống kê") ||
          data.message ||
          "Lấy thống kê không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi lấy thống kê:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Lấy thống kê") ||
          error.response?.data?.message ||
          "Lấy thống kê không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy thống kê") ||
          error.response?.data?.message ||
          "Lấy thống kê không thành công"
      );
    }
  },

  getTopPlayers: async (limit = 10, page = 0, size = 10) => {
    try {
      const response = await instance.get(
        `/statistics/leaderboard?limit=${limit}&page=${page}&size=${size}`
      );
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy bảng xếp hạng") ||
            data.message ||
            "Lấy bảng xếp hạng thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy bảng xếp hạng") ||
          data.message ||
          "Lấy bảng xếp hạng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi lấy bảng xếp hạng:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Lấy bảng xếp hạng") ||
          error.response?.data?.message ||
          "Lấy bảng xếp hạng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy bảng xếp hạng") ||
          error.response?.data?.message ||
          "Lấy bảng xếp hạng không thành công"
      );
    }
  },

  getUserRanking: async () => {
    try {
      const response = await instance.get("/statistics/my-ranking");
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy xếp hạng") ||
            data.message ||
            "Lấy xếp hạng thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy xếp hạng") ||
          data.message ||
          "Lấy xếp hạng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi lấy xếp hạng:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Lấy xếp hạng") ||
          error.response?.data?.message ||
          "Lấy xếp hạng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy xếp hạng") ||
          error.response?.data?.message ||
          "Lấy xếp hạng không thành công"
      );
    }
  },
};

export default StatisticsService;

import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

const RoomService = {
  createRoom: async (roomData) => {
    try {
      const response = await instance.post("/rooms", roomData);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Tạo phòng") ||
            data.message ||
            "Tạo phòng thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Tạo phòng") ||
          data.message ||
          "Tạo phòng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi tạo phòng:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Tạo phòng") ||
          error.response?.data?.message ||
          "Tạo phòng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Tạo phòng") ||
          error.response?.data?.message ||
          "Tạo phòng không thành công"
      );
    }
  },

  quickPlay: async () => {
    try {
      const response = await instance.post("/rooms/quick-play");
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Chơi nhanh") ||
            data.message ||
            "Chơi nhanh thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Chơi nhanh") ||
          data.message ||
          "Chơi nhanh không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi chơi nhanh:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Chơi nhanh") ||
          error.response?.data?.message ||
          "Chơi nhanh không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Chơi nhanh") ||
          error.response?.data?.message ||
          "Chơi nhanh không thành công"
      );
    }
  },

  getRoomDetails: async (roomId) => {
    try {
      const response = await instance.get(`/rooms/${roomId}`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy thông tin phòng") ||
            data.message ||
            "Lấy thông tin phòng thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy thông tin phòng") ||
          data.message ||
          "Lấy thông tin phòng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy thông tin phòng:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy thông tin phòng") ||
          error.response?.data?.message ||
          "Lấy thông tin phòng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy thông tin phòng") ||
          error.response?.data?.message ||
          "Lấy thông tin phòng không thành công"
      );
    }
  },

  getPublicRooms: async (page = 0, size = 20, sort = "createdAt,desc") => {
    try {
      const response = await instance.get(
        `/rooms/public?page=${page}&size=${size}&sort=${sort}`
      );
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(
              data.statusCode,
              "Lấy danh sách phòng công khai"
            ) ||
            data.message ||
            "Lấy danh sách phòng công khai thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(
          data.statusCode,
          "Lấy danh sách phòng công khai"
        ) ||
          data.message ||
          "Lấy danh sách phòng công khai không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy danh sách phòng công khai:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy danh sách phòng công khai") ||
          error.response?.data?.message ||
          "Lấy danh sách phòng công khai không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy danh sách phòng công khai") ||
          error.response?.data?.message ||
          "Lấy danh sách phòng công khai không thành công"
      );
    }
  },

  getUserRooms: async (page = 0, size = 20, sort = "createdAt,desc") => {
    try {
      const response = await instance.get(
        `/rooms/user-rooms?page=${page}&size=${size}&sort=${sort}`
      );
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(
              data.statusCode,
              "Lấy danh sách phòng của người dùng"
            ) ||
            data.message ||
            "Lấy danh sách phòng của người dùng thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(
          data.statusCode,
          "Lấy danh sách phòng của người dùng"
        ) ||
          data.message ||
          "Lấy danh sách phòng của người dùng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy danh sách phòng của người dùng:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy danh sách phòng của người dùng") ||
          error.response?.data?.message ||
          "Lấy danh sách phòng của người dùng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy danh sách phòng của người dùng") ||
          error.response?.data?.message ||
          "Lấy danh sách phòng của người dùng không thành công"
      );
    }
  },

  getCurrentRoom: async () => {
    try {
      const response = await instance.get("/rooms/current");
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy phòng hiện tại") ||
            data.message ||
            "Lấy phòng hiện tại thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy phòng hiện tại") ||
          data.message ||
          "Lấy phòng hiện tại không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy phòng hiện tại:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy phòng hiện tại") ||
          error.response?.data?.message ||
          "Lấy phòng hiện tại không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy phòng hiện tại") ||
          error.response?.data?.message ||
          "Lấy phòng hiện tại không thành công"
      );
    }
  },

  inviteFriend: async (roomId, friendId) => {
    try {
      const response = await instance.post(`/rooms/${roomId}/invite`, {
        friendId,
      });
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Mời bạn") ||
            data.message ||
            "Mời bạn thành công",
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Mời bạn") ||
          data.message ||
          "Mời bạn không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi mời bạn:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Mời bạn") ||
          error.response?.data?.message ||
          "Mời bạn không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Mời bạn") ||
          error.response?.data?.message ||
          "Mời bạn không thành công"
      );
    }
  },

  joinRoomByCode: async (joinCode) => {
    try {
      const response = await instance.post("/rooms/join-by-code", { joinCode });
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Tham gia phòng bằng mã") ||
            data.message ||
            "Tham gia phòng bằng mã thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Tham gia phòng bằng mã") ||
          data.message ||
          "Tham gia phòng bằng mã không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi tham gia phòng bằng mã:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Tham gia phòng bằng mã") ||
          error.response?.data?.message ||
          "Tham gia phòng bằng mã không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Tham gia phòng bằng mã") ||
          error.response?.data?.message ||
          "Tham gia phòng bằng mã không thành công"
      );
    }
  },

  joinRoomById: async (roomId) => {
    try {
      const response = await instance.post(`/rooms/${roomId}/join`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Tham gia phòng") ||
            data.message ||
            "Tham gia phòng thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Tham gia phòng") ||
          data.message ||
          "Tham gia phòng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi tham gia phòng:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Tham gia phòng") ||
          error.response?.data?.message ||
          "Tham gia phòng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Tham gia phòng") ||
          error.response?.data?.message ||
          "Tham gia phòng không thành công"
      );
    }
  },

  leaveRoom: async (roomId) => {
    try {
      const response = await instance.post(`/rooms/${roomId}/leave`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Rời phòng") ||
            data.message ||
            "Rời phòng thành công",
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Rời phòng") ||
          data.message ||
          "Rời phòng không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi rời phòng:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Rời phòng") ||
          error.response?.data?.message ||
          "Rời phòng không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Rời phòng") ||
          error.response?.data?.message ||
          "Rời phòng không thành công"
      );
    }
  },

  findRoomByCode: async (joinCode) => {
    try {
      const response = await instance.get(`/rooms/find-by-code/${joinCode}`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Tìm phòng bằng mã") ||
            data.message ||
            "Tìm phòng bằng mã thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Tìm phòng bằng mã") ||
          data.message ||
          "Tìm phòng bằng mã không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi tìm phòng bằng mã:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Tìm phòng bằng mã") ||
          error.response?.data?.message ||
          "Tìm phòng bằng mã không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Tìm phòng bằng mã") ||
          error.response?.data?.message ||
          "Tìm phòng bằng mã không thành công"
      );
    }
  },

  createRematch: async (roomId) => {
    try {
      const response = await instance.post(`/rooms/${roomId}/rematch`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Tạo phòng tái đấu") ||
            data.message ||
            "Tạo phòng tái đấu thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Tạo phòng tái đấu") ||
          data.message ||
          "Tạo phòng tái đấu không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi tạo phòng tái đấu:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Tạo phòng tái đấu") ||
          error.response?.data?.message ||
          "Tạo phòng tái đấu không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Tạo phòng tái đấu") ||
          error.response?.data?.message ||
          "Tạo phòng tái đấu không thành công"
      );
    }
  },
};

export default RoomService;

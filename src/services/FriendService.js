import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

export const searchUsers = async (searchTerm) => {
  try {
    const response = await instance.post("/friends/search", { searchTerm });
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(data.statusCode, "Tìm kiếm người dùng") ||
          data.message ||
          "Tìm kiếm người dùng thành công",
        data: data.data || [],
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Tìm kiếm người dùng") ||
        data.message ||
        "Tìm kiếm người dùng không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error("Lỗi tìm kiếm người dùng:", error.message, "| Mã lỗi:", code);
    toast.error(
      getVietnameseMessage(code, "Tìm kiếm người dùng") ||
        error.response?.data?.message ||
        "Tìm kiếm người dùng không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Tìm kiếm người dùng") ||
        error.response?.data?.message ||
        "Tìm kiếm người dùng không thành công"
    );
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const response = await instance.post(`/friends/request/${userId}`);
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(data.statusCode, "Gửi lời mời kết bạn") ||
          data.message ||
          "Gửi lời mời kết bạn thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Gửi lời mời kết bạn") ||
        data.message ||
        "Gửi lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error("Lỗi gửi lời mời kết bạn:", error.message, "| Mã lỗi:", code);
    toast.error(
      getVietnameseMessage(code, "Gửi lời mời kết bạn") ||
        error.response?.data?.message ||
        "Gửi lời mời kết bạn không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Gửi lời mời kết bạn") ||
        error.response?.data?.message ||
        "Gửi lời mời kết bạn không thành công"
    );
  }
};

export const acceptFriendRequest = async (userId) => {
  try {
    const response = await instance.post(`/friends/accept/${userId}`);
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(data.statusCode, "Chấp nhận lời mời kết bạn") ||
          data.message ||
          "Chấp nhận lời mời kết bạn thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Chấp nhận lời mời kết bạn") ||
        data.message ||
        "Chấp nhận lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error(
      "Lỗi chấp nhận lời mời kết bạn:",
      error.message,
      "| Mã lỗi:",
      code
    );
    toast.error(
      getVietnameseMessage(code, "Chấp nhận lời mời kết bạn") ||
        error.response?.data?.message ||
        "Chấp nhận lời mời kết bạn không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Chấp nhận lời mời kết bạn") ||
        error.response?.data?.message ||
        "Chấp nhận lời mời kết bạn không thành công"
    );
  }
};

export const rejectFriendRequest = async (userId) => {
  try {
    const response = await instance.post(`/friends/reject/${userId}`);
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(data.statusCode, "Từ chối lời mời kết bạn") ||
          data.message ||
          "Từ chối lời mời kết bạn thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Từ chối lời mời kết bạn") ||
        data.message ||
        "Từ chối lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error(
      "Lỗi từ chối lời mời kết bạn:",
      error.message,
      "| Mã lỗi:",
      code
    );
    toast.error(
      getVietnameseMessage(code, "Từ chối lời mời kết bạn") ||
        error.response?.data?.message ||
        "Từ chối lời mời kết bạn không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Từ chối lời mời kết bạn") ||
        error.response?.data?.message ||
        "Từ chối lời mời kết bạn không thành công"
    );
  }
};

export const getFriendsList = async () => {
  try {
    const response = await instance.get("/friends");
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(data.statusCode, "Lấy danh sách bạn bè") ||
          data.message ||
          "Lấy danh sách bạn bè thành công",
        data: data.data || [],
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy danh sách bạn bè") ||
        data.message ||
        "Lấy danh sách bạn bè không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error(
      "Lỗi lấy danh sách bạn bè:",
      error.message,
      "| Mã lỗi:",
      code
    );
    toast.error(
      getVietnameseMessage(code, "Lấy danh sách bạn bè") ||
        error.response?.data?.message ||
        "Lấy danh sách bạn bè không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách bạn bè") ||
        error.response?.data?.message ||
        "Lấy danh sách bạn bè không thành công"
    );
  }
};

export const getPendingFriendRequests = async () => {
  try {
    const response = await instance.get("/friends/requests/received");
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(
            data.statusCode,
            "Lấy danh sách lời mời kết bạn"
          ) ||
          data.message ||
          "Lấy danh sách lời mời kết bạn thành công",
        data: data.data || [],
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy danh sách lời mời kết bạn") ||
        data.message ||
        "Lấy danh sách lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error(
      "Lỗi lấy danh sách lời mời kết bạn:",
      error.message,
      "| Mã lỗi:",
      code
    );
    toast.error(
      getVietnameseMessage(code, "Lấy danh sách lời mời kết bạn") ||
        error.response?.data?.message ||
        "Lấy danh sách lời mời kết bạn không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách lời mời kết bạn") ||
        error.response?.data?.message ||
        "Lấy danh sách lời mời kết bạn không thành công"
    );
  }
};

export const getSentFriendRequests = async () => {
  try {
    const response = await instance.get("/friends/requests/sent");
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(
            data.statusCode,
            "Lấy danh sách lời mời đã gửi"
          ) ||
          data.message ||
          "Lấy danh sách lời mời đã gửi thành công",
        data: data.data || [],
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy danh sách lời mời đã gửi") ||
        data.message ||
        "Lấy danh sách lời mời đã gửi không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error(
      "Lỗi lấy danh sách lời mời đã gửi:",
      error.message,
      "| Mã lỗi:",
      code
    );
    toast.error(
      getVietnameseMessage(code, "Lấy danh sách lời mời đã gửi") ||
        error.response?.data?.message ||
        "Lấy danh sách lời mời đã gửi không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách lời mời đã gửi") ||
        error.response?.data?.message ||
        "Lấy danh sách lời mời đã gửi không thành công"
    );
  }
};

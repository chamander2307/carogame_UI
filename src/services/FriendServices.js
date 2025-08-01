import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

// Friend Management Services
export const getFriendsList = async () => {
  try {
    const response = await instance.get("/friends");
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Lấy danh sách bạn bè") ||
          "Lấy danh sách bạn bè thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy danh sách bạn bè") ||
        "Lấy danh sách bạn bè không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách bạn bè") ||
        "Lấy danh sách bạn bè không thành công"
    );
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const response = await instance.post("/friends/request", { userId });
    const data = response.data;
    if (data?.success || data?.statusCode === 200 || data?.statusCode === 201) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Gửi lời mời kết bạn") ||
          "Gửi lời mời kết bạn thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Gửi lời mời kết bạn") ||
        "Gửi lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Gửi lời mời kết bạn") ||
        "Gửi lời mời kết bạn không thành công"
    );
  }
};

export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await instance.put(`/friends/accept/${requestId}`);
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Chấp nhận lời mời") ||
          "Chấp nhận lời mời kết bạn thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Chấp nhận lời mời") ||
        "Chấp nhận lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Chấp nhận lời mời") ||
        "Chấp nhận lời mời kết bạn không thành công"
    );
  }
};

export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await instance.put(`/friends/reject/${requestId}`);
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Từ chối lời mời") ||
          "Từ chối lời mời kết bạn thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Từ chối lời mời") ||
        "Từ chối lời mời kết bạn không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Từ chối lời mời") ||
        "Từ chối lời mời kết bạn không thành công"
    );
  }
};

export const removeFriend = async (friendId) => {
  try {
    const response = await instance.delete(`/friends/${friendId}`);
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Xóa bạn bè") ||
          "Xóa bạn bè thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Xóa bạn bè") ||
        "Xóa bạn bè không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Xóa bạn bè") || "Xóa bạn bè không thành công"
    );
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await instance.get("/friends/pending");
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Lấy lời mời chờ") ||
          "Lấy danh sách lời mời chờ thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy lời mời chờ") ||
        "Lấy danh sách lời mời chờ không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Lấy lời mời chờ") ||
        "Lấy danh sách lời mời chờ không thành công"
    );
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const response = await instance.get(
      `/users/search?q=${encodeURIComponent(searchTerm)}`
    );
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Tìm kiếm người dùng") ||
          "Tìm kiếm người dùng thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Tìm kiếm người dùng") ||
        "Tìm kiếm người dùng không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Tìm kiếm người dùng") ||
        "Tìm kiếm người dùng không thành công"
    );
  }
};

// Online Status Services
export const getFriendsOnlineStatus = async () => {
  try {
    const response = await instance.get("/online-status/friends");
    const data = response.data;
    if (data?.success || data?.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message:
          getVietnameseMessage(data.statusCode, "Lấy trạng thái online") ||
          "Lấy trạng thái online thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy trạng thái online") ||
        "Lấy trạng thái online không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    throw new Error(
      getVietnameseMessage(code, "Lấy trạng thái online") ||
        "Lấy trạng thái online không thành công"
    );
  }
};

// Backward compatibility - keep old function name
export const getOnlineFriends = getFriendsOnlineStatus;

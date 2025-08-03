import axios from "../config/axios";

/**
 * Friend Service - Handles friend management and social features
 * Based on backend FriendController endpoints
 */
class FriendService {
  /**
   * Get friend list for current user
   * Backend: Uses getFriendsList() from FriendServiceImpl
   * Note: Need to find the correct endpoint path for this
   * @returns {Promise<Object>} API response with friend list
   */
  async getFriends() {
    try {
      // Backend has getFriendsList() method but need to find the endpoint
      // For now, use online status as it includes friend data
      const response = await this.getFriendsOnlineStatus();
      if (response.success) {
        // Map online friends to standard friend format
        const mappedData = response.data.map((friend) => ({
          id: friend.userId,
          userId: friend.userId,
          username: friend.displayName,
          displayName: friend.displayName,
          avatar: friend.avatarUrl,
          avatarUrl: friend.avatarUrl,
          friendshipStatus: "FRIENDS",
          status: "ACCEPTED",
          isOnline: friend.status,
          createdAt: new Date().toISOString(),
        }));

        return {
          success: true,
          data: mappedData,
          message: "Lấy danh sách bạn bè thành công",
        };
      }
      return response;
    } catch (error) {
      console.error("Failed to get friends:", error);
      return {
        success: false,
        data: [],
        message: "Không thể tải danh sách bạn bè",
      };
    }
  }

  /**
   * Search users by username or display name
   * Backend: POST /api/friends/search
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} API response with search results
   */
  async searchUsers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return {
          success: false,
          data: [],
          message: "Vui lòng nhập từ khóa tìm kiếm",
        };
      }

      const response = await axios.post("/friends/search", {
        searchTerm: searchTerm.trim(),
      });

      // Map backend UserSearchResponseDto to UI expected format
      const mappedData = (response.data.data || []).map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        canSendRequest: user.canSendRequest,
        friendshipStatus: user.relationshipStatus?.toUpperCase() || "NONE",
        relationshipStatus: user.relationshipStatus,
        isOnline: false, // Not provided in search results
      }));

      return {
        success: true,
        data: mappedData,
        message: response.data.message || "Tìm kiếm thành công",
      };
    } catch (error) {
      console.error("Failed to search users:", error);
      return {
        success: false,
        data: [],
        message: "Không thể tìm kiếm người dùng",
      };
    }
  }

  /**
   * Send friend request
   * Backend: POST /api/friends/request/{userId}
   * @param {number} userId - Target user ID
   * @returns {Promise<Object>} API response
   */
  async sendFriendRequest(userId) {
    try {
      if (!userId || userId <= 0) {
        throw new Error("ID người dùng không hợp lệ");
      }

      const response = await axios.post(`/friends/request/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Đã gửi lời mời kết bạn",
      };
    } catch (error) {
      console.error("Failed to send friend request:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get pending friend requests (received)
   * Backend: Uses getPendingFriendRequests() from FriendServiceImpl
   * Need to find the correct endpoint for this
   * @returns {Promise<Object>} API response with pending requests
   */
  async getFriendRequests() {
    try {
      // Backend has getPendingFriendRequests() method, need to find endpoint
      // Trying common patterns
      const response = await axios.get("/friends/requests/received");

      // Map backend FriendResponseDto to UI expected format
      const mappedData = (response.data.data || []).map((request) => ({
        id: request.userId,
        userId: request.userId,
        username: request.username,
        displayName: request.displayName,
        avatar: request.avatarUrl,
        avatarUrl: request.avatarUrl,
        friendshipStatus: "PENDING",
        status: request.status,
        isOnline: request.isOnline || false,
        createdAt: request.createdAt,
      }));

      return {
        success: true,
        data: mappedData,
        message: response.data.message || "Lấy lời mời thành công",
      };
    } catch (error) {
      console.error("Failed to get friend requests:", error);
      return {
        success: false,
        data: [],
        message: "Không thể tải lời mời kết bạn",
      };
    }
  }

  /**
   * Get sent friend requests
   * Backend: Uses getSentFriendRequests() from FriendServiceImpl
   * @returns {Promise<Object>} API response with sent requests
   */
  async getSentRequests() {
    try {
      const response = await axios.get("/friends/requests/sent");

      // Map backend FriendResponseDto to UI expected format
      const mappedData = (response.data.data || []).map((request) => ({
        id: request.userId,
        userId: request.userId,
        username: request.username,
        displayName: request.displayName,
        avatar: request.avatarUrl,
        avatarUrl: request.avatarUrl,
        friendshipStatus: "PENDING",
        status: request.status,
        isOnline: request.isOnline || false,
        createdAt: request.createdAt,
      }));

      return {
        success: true,
        data: mappedData,
        message: response.data.message || "Lấy lời mời đã gửi thành công",
      };
    } catch (error) {
      console.error("Failed to get sent requests:", error);
      return {
        success: false,
        data: [],
        message: "Không thể tải lời mời đã gửi",
      };
    }
  }

  /**
   * Accept friend request
   * Backend: POST /api/friends/accept/{userId}
   * @param {number} userId - User ID to accept
   * @returns {Promise<Object>} API response
   */
  async acceptFriendRequest(userId) {
    try {
      const response = await axios.post(`/friends/accept/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Đã chấp nhận lời mời kết bạn",
      };
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Reject friend request
   * Backend: Uses rejectFriendRequest() from FriendServiceImpl
   * Need to find the correct endpoint for this
   * @param {number} userId - User ID to reject
   * @returns {Promise<Object>} API response
   */
  async rejectFriendRequest(userId) {
    try {
      const response = await axios.post(`/friends/reject/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Đã từ chối lời mời kết bạn",
      };
    } catch (error) {
      console.error("Failed to reject friend request:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get friends' online status
   * Backend: GET /api/online-status/friends
   * @returns {Promise<Object>} API response with friends' online status
   */
  async getFriendsOnlineStatus() {
    try {
      const response = await axios.get("/online-status/friends");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || "Lấy trạng thái online thành công",
      };
    } catch (error) {
      console.error("Failed to get friends online status:", error);
      return {
        success: false,
        data: [],
        message: "Không thể tải trạng thái online",
      };
    }
  }

  /**
   * Handle API errors with Vietnamese messages
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleApiError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          return new Error(message || "Dữ liệu không hợp lệ");
        case 401:
          return new Error("Bạn cần đăng nhập để thực hiện thao tác này");
        case 403:
          return new Error("Bạn không có quyền thực hiện thao tác này");
        case 404:
          return new Error("Không tìm thấy người dùng hoặc yêu cầu");
        case 409:
          return new Error(message || "Yêu cầu kết bạn đã tồn tại");
        default:
          return new Error(message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    }
    return new Error(error.message || "Có lỗi xảy ra");
  }
}

export default new FriendService();

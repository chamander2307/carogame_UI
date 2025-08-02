import axios from "../config/axios";

/**
 * Game Room Service - Handles room creation, joining, leaving
 * Based on backend GameRoomController endpoints
 */
class GameRoomService {
  /**
   * Create a new game room
   * Backend: POST /api/rooms
   * @param {Object} roomData - Room creation data {name, isPrivate}
   * @returns {Promise<Object>} API response with room details
   */
  async createRoom(roomData) {
    try {
      const response = await axios.post("/rooms", {
        name: roomData.name,
        isPrivate: roomData.isPrivate || false,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Tạo phòng thành công",
      };
    } catch (error) {
      console.error("Failed to create room:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Quick play - Find or create a public room
   * Backend: POST /api/rooms/quick-play
   * @returns {Promise<Object>} Room data for quick play
   */
  async quickPlay() {
    try {
      const response = await axios.post("/rooms/quick-play");
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Tìm phòng thành công",
      };
    } catch (error) {
      console.error("Failed to quick play:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Join room by ID (for public rooms)
   * Backend: POST /api/rooms/{roomId}/join
   * @param {number} roomId - Room ID to join
   * @returns {Promise<Object>} Room details after joining
   */
  async joinRoom(roomId) {
    try {
      const response = await axios.post(`/rooms/${roomId}/join`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Tham gia phòng thành công",
      };
    } catch (error) {
      console.error("Failed to join room:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Join room by join code (for private rooms)
   * Backend: POST /api/rooms/join-by-code
   * @param {string} joinCode - 4-character join code
   * @returns {Promise<Object>} Room details after joining
   */
  async joinRoomByCode(joinCode) {
    try {
      const response = await axios.post("/rooms/join-by-code", {
        joinCode: joinCode,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Tham gia phòng thành công",
      };
    } catch (error) {
      console.error("Failed to join room by code:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Leave a room
   * Backend: DELETE /api/rooms/{roomId}/leave
   * @param {number} roomId - Room ID to leave
   * @returns {Promise<Object>} Success response
   */
  async leaveRoom(roomId) {
    try {
      const response = await axios.delete(`/rooms/${roomId}/leave`);
      return {
        success: true,
        message: response.data.message || "Rời phòng thành công",
      };
    } catch (error) {
      console.error("Failed to leave room:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Surrender game
   * Backend: POST /api/rooms/{roomId}/surrender
   * @param {number} roomId - Room ID to surrender in
   * @returns {Promise<Object>} Success response
   */
  async surrenderGame(roomId) {
    try {
      const response = await axios.post(`/rooms/${roomId}/surrender`);
      return {
        success: true,
        message: response.data.message || "Đầu hàng thành công",
      };
    } catch (error) {
      console.error("Failed to surrender game:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create rematch
   * Backend: POST /api/rooms/{roomId}/rematch
   * @param {number} roomId - Old room ID to create rematch from
   * @returns {Promise<Object>} New room details for rematch
   */
  async createRematch(roomId) {
    try {
      const response = await axios.post(`/rooms/${roomId}/rematch`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Tạo trận đấu lại thành công",
      };
    } catch (error) {
      console.error("Failed to create rematch:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Invite friend to room
   * Backend: POST /api/rooms/{roomId}/invite
   * @param {number} roomId - Room ID to invite to
   * @param {number} friendUserId - Friend's user ID to invite
   * @returns {Promise<Object>} Success response
   */
  async inviteFriend(roomId, friendUserId) {
    try {
      const response = await axios.post(`/rooms/${roomId}/invite`, {
        friendUserId: friendUserId,
      });
      return {
        success: true,
        message: response.data.message || "Gửi lời mời thành công",
      };
    } catch (error) {
      console.error("Failed to invite friend:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get room details by ID
   * Backend: GET /api/rooms/{roomId}
   * @param {number} roomId - Room ID
   * @returns {Promise<Object>} Room details
   */
  async getRoomDetails(roomId) {
    try {
      const response = await axios.get(`/rooms/${roomId}`);

      // Map backend GameRoomResponse to UI expected format
      const roomData = response.data.data;
      const mappedData = {
        ...roomData,
        // Ensure players are properly mapped
        players: (roomData.players || []).map((playerResponse) => ({
          ...playerResponse.player, // UserSummaryResponse
          isHost: playerResponse.isHost,
          joinTime: playerResponse.joinTime,
          isOnline: playerResponse.isOnline,
          readyState: playerResponse.readyState,
          gameResult: playerResponse.gameResult,
          acceptedRematch: playerResponse.acceptedRematch,
          hasLeft: playerResponse.hasLeft,
          leftAt: playerResponse.leftAt,
        })),
      };

      return {
        success: true,
        data: mappedData,
        message: response.data.message || "Lấy thông tin phòng thành công",
      };
    } catch (error) {
      console.error("Failed to get room details:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get list of public rooms with pagination
   * Backend: GET /api/rooms/public
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated public rooms
   */
  async getPublicRooms(params = {}) {
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 20,
        sort: params.sort || "createdAt",
        direction: params.direction || "DESC",
      };

      const response = await axios.get("/rooms/public", {
        params: queryParams,
      });

      // Map backend PublicRoomResponse list to UI expected format
      const responseData = response.data.data;
      const mappedData = {
        ...responseData,
        content: (responseData.content || []).map((room) => ({
          id: room.id,
          name: room.name,
          status: room.status,
          createdBy: room.createdByName,
          createdByName: room.createdByName,
          createdAt: room.createdAt,
          currentPlayerCount: room.currentPlayerCount,
          maxPlayers: room.maxPlayers,
          isJoinable: room.isJoinable,
        })),
      };

      return {
        success: true,
        data: mappedData,
        message: response.data.message || "Lấy danh sách phòng thành công",
      };
    } catch (error) {
      console.error("Failed to get public rooms:", error);
      return {
        success: false,
        data: { content: [], totalPages: 0 },
        message: "Không thể tải danh sách phòng",
      };
    }
  }

  /**
   * Get user's rooms with pagination
   * Backend: GET /api/rooms/user-rooms
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated user rooms
   */
  async getUserRooms(params = {}) {
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 20,
        sort: params.sort || "createdAt",
        direction: params.direction || "DESC",
      };

      const response = await axios.get("/rooms/user-rooms", {
        params: queryParams,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Lấy phòng của người dùng thành công",
      };
    } catch (error) {
      console.error("Failed to get user rooms:", error);
      return {
        success: false,
        data: { content: [], totalPages: 0 },
        message: "Không thể tải phòng của người dùng",
      };
    }
  }

  /**
   * Get game history with pagination
   * Backend: GET /api/rooms/history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated game history
   */
  async getGameHistory(params = {}) {
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || "gameEndedAt",
        direction: params.direction || "DESC",
      };

      // Add filter parameters if provided
      if (params.result && params.result !== "all") {
        queryParams.result = params.result.toUpperCase();
      }

      const response = await axios.get("/rooms/history", {
        params: queryParams,
      });

      // Map backend GameHistoryResponse to UI expected format
      const responseData = response.data.data;
      const mappedData = {
        ...responseData,
        content: (responseData.content || []).map((game) => ({
          id: game.id,
          gameId: game.id,
          roomId: game.roomId,
          roomName: game.roomName,
          opponent: game.isWinner ? game.loserName : game.winnerName,
          opponentName: game.isWinner ? game.loserName : game.winnerName,
          opponentAvatar: game.isWinner ? game.loserAvatar : game.winnerAvatar,
          result: game.isWinner ? "WIN" : game.winnerId ? "LOSE" : "DRAW",
          date: game.gameEndedAt || game.gameStartedAt,
          createdAt: game.gameEndedAt || game.gameStartedAt,
          duration: game.gameDurationMinutes
            ? `${game.gameDurationMinutes} phút`
            : "N/A",
          moves: 0, // Not provided in GameHistoryResponse
          totalMoves: 0,
          endReason: game.endReason || "5 liên tiếp",
          winCondition: game.endReason || "5 liên tiếp",
          gameStartedAt: game.gameStartedAt,
          gameEndedAt: game.gameEndedAt,
        })),
      };

      return {
        success: true,
        data: mappedData,
        message: response.data.message || "Lấy lịch sử trận đấu thành công",
      };
    } catch (error) {
      console.error("Failed to get game history:", error);
      return {
        success: false,
        data: { content: [], totalPages: 0, totalElements: 0 },
        message: "Không thể tải lịch sử trận đấu",
      };
    }
  }

  /**
   * Get current user's room
   * Note: This endpoint may not exist in backend GameRoomController
   * @deprecated Endpoint /api/rooms/current may not be available
   * @returns {Promise<Object>} Current room data
   */
  async getCurrentRoom() {
    console.warn(
      "getCurrentRoom() endpoint may not exist in backend - use getRoomDetails() with known roomId instead"
    );
    return {
      success: false,
      data: null,
      message: "Current room endpoint not available - use alternative methods",
    };
  }

  /**
   * Join an existing room
   * Note: Room joining should be done via WebSocket using GameWebSocketService.joinRoom()
   * @deprecated Use GameWebSocketService.joinRoom() instead
   * @param {number} roomId - Room ID to join
   * @returns {Promise<Object>} Join room result
   */
  async joinRoom(roomId) {
    console.warn(
      "GameRoomService.joinRoom() is deprecated - use GameWebSocketService.joinRoom() instead"
    );
    throw new Error(
      "Use GameWebSocketService.joinRoom() for real-time room joining"
    );
  }

  /**
   * Leave current room
   * Note: Room leaving should be done via WebSocket using GameWebSocketService.leaveRoom()
   * @deprecated Use GameWebSocketService.leaveRoom() instead
   * @param {number} roomId - Room ID to leave
   * @returns {Promise<Object>} Leave room result
   */
  async leaveRoom(roomId) {
    console.warn(
      "GameRoomService.leaveRoom() is deprecated - use GameWebSocketService.leaveRoom() instead"
    );
    throw new Error(
      "Use GameWebSocketService.leaveRoom() for real-time room leaving"
    );
  }

  /**
   * Alias for getRoomDetails - for backward compatibility with GameBoard components
   * @param {number} roomId - Room ID
   * @returns {Promise<Object>} Room details
   */
  async getRoomDetail(roomId) {
    return this.getRoomDetails(roomId);
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
          return new Error("Không tìm thấy phòng");
        case 4026:
          return new Error("Bạn đã ở trong phòng khác");
        case 4017:
          return new Error("Không tìm thấy phòng");
        default:
          return new Error(message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    }
    return new Error(error.message || "Có lỗi xảy ra");
  }
}

export default new GameRoomService();

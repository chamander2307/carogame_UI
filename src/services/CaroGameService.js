import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { makeGameMoveWS, getBoardStateWS } from "./WebSocketService";

// Enhanced error handling function from HTML logic
const handleApiError = (
  error,
  defaultMessage = "Có lỗi xảy ra, vui lòng thử lại"
) => {
  const errorMessage = error.response?.data?.message || defaultMessage;
  const vietnameseMessage =
    getVietnameseMessage(error.response?.data?.errorCode) || errorMessage;
  console.error("API Error:", vietnameseMessage);
  if (error.response?.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
  throw new Error(vietnameseMessage);
};

// Enhanced Move function with comprehensive error handling from HTML pattern
export const makeMove = async (roomId, moveData, useWebSocket = false) => {
  try {
    console.log("=== CaroGameService MOVE DEBUG ===");
    console.log(`Making move for room ${roomId}:`, moveData);
    console.log(`Using ${useWebSocket ? "WebSocket" : "REST API"}`);

    if (useWebSocket) {
      // Send via WebSocket - Backend expects xPosition and yPosition
      const wsData = {
        xPosition: moveData.x,
        yPosition: moveData.y,
      };
      console.log("Converting move data for WebSocket:");
      console.log("  Input data:", moveData);
      console.log("  Converted to:", wsData);
      console.log("Calling makeGameMoveWS...");

      await makeGameMoveWS(roomId, wsData);
      console.log("Move sent successfully via WebSocket");
      console.log("=============================");
      return { success: true, message: "Move sent via WebSocket" };
    } else {
      // Send via REST API - Backend expects xPosition and yPosition
      const apiData = {
        xPosition: moveData.x,
        yPosition: moveData.y,
      };
      console.log("Converting move data for REST API:");
      console.log("  Input data:", moveData);
      console.log("  Converted to:", apiData);
      console.log("  API endpoint: /api/v1/games/" + roomId + "/moves");

      // Pre-check: Verify game is active before making move
      try {
        console.log("Pre-checking game status...");
        const gameActiveCheck = await isGameActive(roomId);
        console.log("Game active status:", gameActiveCheck);
      } catch (checkError) {
        console.warn("Could not verify game status:", checkError.message);
      }

      const response = await instance.post(
        `/v1/games/${roomId}/moves`,
        apiData
      );
      console.log("Move sent successfully via REST API:", response.data);
      console.log("=============================");
      return response.data.data;
    }
  } catch (error) {
    console.error("=== CaroGameService MOVE ERROR ===");
    console.error("Move failed:", error);

    // Enhanced error logging from HTML pattern
    if (error.response) {
      console.error(
        "Error response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
      console.error("Full error response:", error.response);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    // Check for specific game state error
    if (error.message && error.message.includes("not currently active")) {
      console.error("Game is not in active state. Cannot make moves.");
      console.error("Suggestion: Check if game has been started properly.");
    }

    console.error("===============================");
    handleApiError(error, "Move execution failed");
  }
};

// Enhanced Board fetching from HTML logic
export const getCurrentBoard = async (roomId) => {
  try {
    console.log(`Fetching board for room ${roomId}`);
    const response = await instance.get(`/v1/games/${roomId}/board`);
    console.log("Board fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch board:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    // Return empty board instead of throwing error
    return Array(15)
      .fill()
      .map(() => Array(15).fill(0));
  }
};

// Enhanced Player Symbol retrieval from HTML logic
export const getPlayerSymbol = async (roomId) => {
  try {
    console.log(`Fetching player symbol for room ${roomId}`);
    const response = await instance.get(`/v1/games/${roomId}/player-symbol`);
    console.log("Player symbol fetched:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch player symbol:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    handleApiError(error, "Player symbol retrieval failed");
  }
};

// Enhanced Room Info retrieval from HTML pattern
export const getRoomInfo = async (roomId) => {
  try {
    console.log(`Fetching room info for room ${roomId}`);
    const response = await instance.get(`/v1/rooms/${roomId}`);
    console.log("Room info fetched:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch room info:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    handleApiError(error, "Room info retrieval failed");
  }
};

// Enhanced Game status checking from HTML logic
export const isGameActive = async (roomId) => {
  try {
    const roomInfo = await getRoomInfo(roomId);
    const isActive = roomInfo.gameState === "IN_PROGRESS";
    console.log(`Game active status for room ${roomId}:`, isActive);
    return isActive;
  } catch (error) {
    console.error("Failed to check game status:", error);
    return false;
  }
};

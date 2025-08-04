import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
let stompClient = null;

const handleWebSocketError = (
  error,
  defaultMessage = "Có lỗi WebSocket xảy ra, vui lòng thử lại"
) => {
  const errorMessage = error.message || defaultMessage;
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const connectWebSocket = (onMessageReceived, onError) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    handleWebSocketError(
      new Error("Không tìm thấy access token"),
      "Vui lòng đăng nhập lại"
    );
    return;
  }

  const socket = new SockJS("/ws");
  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: { Authorization: `Bearer ${accessToken}` },
    onConnect: () => {
      console.log("WebSocket connected");
    },
    onStompError: (frame) => {
      onError?.(frame);
      handleWebSocketError(new Error(frame.body), "Lỗi kết nối WebSocket");
    },
  });

  stompClient.activate();
};

// Subscribe to Room Updates
export const subscribeToRoomUpdates = (roomId, onMessageReceived) => {
  try {
    if (!stompClient || !stompClient.connected) {
      connectWebSocket(onMessageReceived, (error) =>
        handleWebSocketError(error)
      );
    }
    stompClient.subscribe(`/topic/room/${roomId}/updates`, (message) => {
      onMessageReceived(JSON.parse(message.body));
    });
  } catch (error) {
    handleWebSocketError(error, "Đăng ký cập nhật phòng thất bại");
  }
};

// Subscribe to Game Moves
export const subscribeToGameMoves = (roomId, onMessageReceived) => {
  try {
    if (!stompClient || !stompClient.connected) {
      connectWebSocket(onMessageReceived, (error) =>
        handleWebSocketError(error)
      );
    }
    stompClient.subscribe(`/topic/game/${roomId}/move`, (message) => {
      onMessageReceived(JSON.parse(message.body));
    });
  } catch (error) {
    handleWebSocketError(error, "Đăng ký cập nhật nước đi thất bại");
  }
};

// Subscribe to Game End
export const subscribeToGameEnd = (roomId, onMessageReceived) => {
  try {
    if (!stompClient || !stompClient.connected) {
      connectWebSocket(onMessageReceived, (error) =>
        handleWebSocketError(error)
      );
    }
    stompClient.subscribe(`/topic/game/${roomId}/end`, (message) => {
      onMessageReceived(JSON.parse(message.body));
    });
  } catch (error) {
    handleWebSocketError(error, "Đăng ký cập nhật kết thúc game thất bại");
  }
};

// Subscribe to Room Chat
export const subscribeToRoomChat = (roomId, onMessageReceived) => {
  try {
    if (!stompClient || !stompClient.connected) {
      connectWebSocket(onMessageReceived, (error) =>
        handleWebSocketError(error)
      );
    }
    stompClient.subscribe(`/topic/room/${roomId}/chat`, (message) => {
      onMessageReceived(JSON.parse(message.body));
    });
  } catch (error) {
    handleWebSocketError(error, "Đăng ký cập nhật trò chuyện thất bại");
  }
};

// Send Chat Message
export const sendChatMessage = async (roomId, messageData) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({
      destination: `/app/room/${roomId}/chat`,
      body: JSON.stringify(messageData),
    });
  } catch (error) {
    handleWebSocketError(error, "Gửi tin nhắn trò chuyện thất bại");
  }
};

// Join Room via WebSocket
export const joinRoomWS = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/join` });
  } catch (error) {
    handleWebSocketError(error, "Tham gia phòng qua WebSocket thất bại");
  }
};

// Leave Room via WebSocket
export const leaveRoomWS = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/leave` });
  } catch (error) {
    handleWebSocketError(error, "Rời phòng qua WebSocket thất bại");
  }
};

// Mark Player Ready
export const markPlayerReady = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/ready` });
  } catch (error) {
    handleWebSocketError(error, "Đánh dấu sẵn sàng thất bại");
  }
};

// Start Game
export const startGame = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/start` });
  } catch (error) {
    handleWebSocketError(error, "Bắt đầu game thất bại");
  }
};

// Get Room Status
export const getRoomStatus = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/status` });
  } catch (error) {
    handleWebSocketError(error, "Lấy trạng thái phòng thất bại");
  }
};

// Surrender Game
export const surrenderGame = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/surrender` });
  } catch (error) {
    handleWebSocketError(error, "Đầu hàng thất bại");
  }
};

// Request Rematch
export const requestRematch = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/rematch/request` });
  } catch (error) {
    handleWebSocketError(error, "Yêu cầu tái đấu thất bại");
  }
};

// Accept Rematch
export const acceptRematch = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/rematch/accept` });
  } catch (error) {
    handleWebSocketError(error, "Chấp nhận tái đấu thất bại");
  }
};

// Complete Game
export const completeGame = async (roomId, gameResult) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({
      destination: `/app/room/${roomId}/complete`,
      body: JSON.stringify(gameResult),
    });
  } catch (error) {
    handleWebSocketError(error, "Kết thúc game thất bại");
  }
};

// Make Game Move via WebSocket
export const makeGameMoveWS = async (roomId, moveData) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({
      destination: `/app/game/${roomId}/move`,
      body: JSON.stringify(moveData),
    });
  } catch (error) {
    handleWebSocketError(error, "Thực hiện nước đi qua WebSocket thất bại");
  }
};

// Get Board State via WebSocket
export const getBoardStateWS = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket chưa được kết nối");
    }
    stompClient.publish({ destination: `/app/game/${roomId}/board` });
  } catch (error) {
    handleWebSocketError(error, "Lấy trạng thái bàn cờ qua WebSocket thất bại");
  }
};

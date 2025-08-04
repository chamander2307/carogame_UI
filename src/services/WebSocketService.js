import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let isConnecting = false;
let isConnected = false;

const handleWebSocketError = (
  error,
  defaultMessage = "WebSocket error occurred, please try again"
) => {
  const errorMessage = error.message || defaultMessage;
  console.error("WebSocket Error:", errorMessage);
  throw new Error(errorMessage);
};

// Test WebSocket endpoints to find the correct one - Enhanced from HTML logic
export const testWebSocketEndpoints = async () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    console.log("No access token found");
    return null;
  }

  console.log("Testing WebSocket endpoints...");

  // Test 1: Check if server is running
  try {
    console.log("Testing server health...");
    const healthResponse = await fetch(
      "http://localhost:8080/actuator/health",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (healthResponse.ok) {
      console.log("Server is running and healthy");
    } else {
      console.log("Server responded but not healthy:", healthResponse.status);
    }
  } catch (error) {
    console.log("Server health check failed:", error.message);
    console.log(
      "Server might not be running. Please start the Spring Boot application."
    );
    return null;
  }

  // Test 2: Check SockJS info endpoint
  try {
    console.log("Testing SockJS info endpoint...");
    const sockjsResponse = await fetch("http://localhost:8080/ws-sockjs/info", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (sockjsResponse.ok) {
      const info = await sockjsResponse.json();
      console.log("SockJS endpoint is available:", info);
      return "http://localhost:8080/ws-sockjs";
    } else {
      console.log("SockJS info endpoint failed:", sockjsResponse.status);
    }
  } catch (error) {
    console.log("SockJS info endpoint error:", error.message);
  }

  // Test 3: Check WebSocket endpoint with actual connection
  try {
    console.log("Testing direct WebSocket connection...");
    const wsUrl = `ws://localhost:8080/ws?token=Bearer ${encodeURIComponent(
      accessToken
    )}`;

    // Create WebSocket test connection
    return new Promise((resolve) => {
      const testWs = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        testWs.close();
        console.log("WebSocket test connection timeout");
        resolve(null);
      }, 5000);

      testWs.onopen = () => {
        clearTimeout(timeout);
        testWs.close();
        console.log("Direct WebSocket endpoint is working");
        resolve("ws://localhost:8080/ws");
      };

      testWs.onerror = (error) => {
        clearTimeout(timeout);
        console.log("Direct WebSocket test failed:", error);
        resolve(null);
      };
    });
  } catch (error) {
    console.log("WebSocket test error:", error.message);
  }

  console.log("No working WebSocket endpoints found");
  return null;
};

// Initialize WebSocket connection - Enhanced from HTML logic
export const initializeWebSocket = () => {
  return new Promise((resolve, reject) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      const error = new Error("Access token not found. Please login again!");
      reject(error);
      return;
    }

    if (isConnected && stompClient?.connected) {
      resolve(stompClient);
      return;
    }

    if (isConnecting) {
      // Wait for current connection attempt
      const checkConnection = setInterval(() => {
        if (isConnected && stompClient?.connected) {
          clearInterval(checkConnection);
          resolve(stompClient);
        } else if (!isConnecting) {
          clearInterval(checkConnection);
          reject(new Error("Connection failed"));
        }
      }, 100);
      return;
    }

    isConnecting = true;

    try {
      // Spring Boot WebSocket endpoint with JWT token
      const wsUrl = `ws://localhost:8080/ws?token=Bearer ${encodeURIComponent(
        accessToken
      )}`;
      console.log(
        "Connecting to WebSocket with token:",
        wsUrl.substring(0, 50) + "..."
      );

      stompClient = new Client({
        brokerURL: wsUrl,
        // No connectHeaders needed as token is sent via URL
        onConnect: (frame) => {
          console.log("WebSocket connected successfully!", frame);
          isConnected = true;
          isConnecting = false;
          resolve(stompClient);
        },
        onStompError: (frame) => {
          console.error("STOMP Error:", frame);
          isConnected = false;
          isConnecting = false;
          // Try fallback with SockJS
          console.log("Trying SockJS fallback...");
          tryInitializeWithSockJS(accessToken).then(resolve).catch(reject);
        },
        onWebSocketError: (error) => {
          console.error("WebSocket Error:", error);
          isConnected = false;
          isConnecting = false;
          // Try fallback with SockJS
          console.log("Trying SockJS fallback...");
          tryInitializeWithSockJS(accessToken).then(resolve).catch(reject);
        },
        onDisconnect: () => {
          console.log("WebSocket disconnected");
          isConnected = false;
          isConnecting = false;
        },
        debug: (str) => {
          console.log("WebSocket Debug:", str);
        },
      });

      stompClient.activate();
    } catch (error) {
      isConnecting = false;
      console.error("Failed to initialize WebSocket:", error);
      // Try fallback with SockJS
      console.log("Trying SockJS fallback...");
      tryInitializeWithSockJS(accessToken).then(resolve).catch(reject);
    }
  });
};

// Enhanced SockJS fallback function from HTML logic
const tryInitializeWithSockJS = (accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      // SockJS endpoint with token parameter
      const sockjsUrl = `http://localhost:8080/ws-sockjs?token=Bearer ${encodeURIComponent(
        accessToken
      )}`;
      console.log("Connecting to SockJS:", sockjsUrl.substring(0, 50) + "...");

      const socket = new SockJS(sockjsUrl);

      stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: (frame) => {
          console.log("SockJS connected successfully!", frame);
          isConnected = true;
          isConnecting = false;
          resolve(stompClient);
        },
        onStompError: (frame) => {
          console.error("SockJS STOMP Error:", frame);
          isConnected = false;
          isConnecting = false;
          const error = new Error(
            `SockJS STOMP Error: ${frame.body || "Connection failed"}`
          );
          reject(error);
        },
        onWebSocketError: (error) => {
          console.error("SockJS WebSocket Error:", error);
          isConnected = false;
          isConnecting = false;
          reject(error);
        },
        onDisconnect: () => {
          console.log("SockJS disconnected");
          isConnected = false;
          isConnecting = false;
        },
        debug: (str) => {
          console.log("SockJS Debug:", str);
        },
      });

      stompClient.activate();
    } catch (error) {
      isConnecting = false;
      console.error("Failed to initialize SockJS:", error);
      reject(error);
    }
  });
};

// Check if WebSocket is connected
export const isWebSocketConnected = () => {
  return isConnected && stompClient?.connected;
};

// Subscribe to Room Updates
export const subscribeToRoomUpdates = async (roomId, onMessageReceived) => {
  try {
    if (!isWebSocketConnected()) {
      await initializeWebSocket();
    }

    // CORRECT: Backend broadcasts to /topic/room/{roomId}/updates
    const subscription = stompClient.subscribe(
      `/topic/room/${roomId}/updates`,
      (message) => {
        console.log("=== WEBSOCKET MESSAGE RECEIVED ===");
        console.log("Raw message body:", message.body);
        console.log("Message headers:", message.headers);

        try {
          const data = JSON.parse(message.body);
          console.log("Parsed data:", JSON.stringify(data, null, 2));
          console.log("Update type:", data.updateType);
          console.log("Game state:", data.gameState);

          if (data.updateType === "GAME_STARTED") {
            console.log("GAME_STARTED MESSAGE DETECTED!");
            console.log("Game state in message:", data.gameState);
          }

          console.log("Calling onMessageReceived with:", data);
          onMessageReceived(data);
          console.log("onMessageReceived called successfully");
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          console.error("Raw message was:", message.body);
        }

        console.log("=== END WEBSOCKET MESSAGE ===");
      }
    );

    console.log(
      `Successfully subscribed to room ${roomId} updates via /topic/room/${roomId}/updates`
    );
    console.log("Subscription object:", subscription);
    console.log("STOMP client connected:", stompClient.connected);
    console.log("STOMP client state:", stompClient.state);
    return subscription;
  } catch (error) {
    handleWebSocketError(error, "Room update subscription failed");
  }
};

// Subscribe to Game Moves
export const subscribeToGameMoves = async (roomId, onMessageReceived) => {
  try {
    if (!isWebSocketConnected()) {
      await initializeWebSocket();
    }

    const subscription = stompClient.subscribe(
      `/topic/game/${roomId}/move`,
      (message) => {
        console.log("=== GAME MOVE MESSAGE RECEIVED ===");
        console.log("Raw message body:", message.body);
        console.log("Message headers:", message.headers);
        console.log("Subscription topic:", `/topic/game/${roomId}/move`);
        
        try {
          const data = JSON.parse(message.body);
          console.log("Parsed game move data:", JSON.stringify(data, null, 2));
          console.log("Move data keys:", Object.keys(data));
          console.log("Calling onMessageReceived with:", data);
          onMessageReceived(data);
          console.log("onMessageReceived called successfully");
        } catch (error) {
          console.error("Error parsing game move message:", error);
          console.error("Raw message was:", message.body);
        }
        
        console.log("=== END GAME MOVE MESSAGE ===");
      }
    );

    console.log(`Successfully subscribed to game ${roomId} moves via /topic/game/${roomId}/move`);
    console.log("Game move subscription object:", subscription);
    return subscription;
  } catch (error) {
    handleWebSocketError(error, "Game move subscription failed");
  }
};

// Subscribe to Game End
export const subscribeToGameEnd = async (roomId, onMessageReceived) => {
  try {
    if (!isWebSocketConnected()) {
      await initializeWebSocket();
    }

    const subscription = stompClient.subscribe(
      `/topic/game/${roomId}/end`,
      (message) => {
        const data = JSON.parse(message.body);
        console.log("Game end received:", data);
        onMessageReceived(data);
      }
    );

    console.log(`Subscribed to game ${roomId} end`);
    return subscription;
  } catch (error) {
    handleWebSocketError(error, "Game end subscription failed");
  }
};

// Subscribe to Room Chat
export const subscribeToRoomChat = async (roomId, onMessageReceived) => {
  try {
    if (!isWebSocketConnected()) {
      await initializeWebSocket();
    }

    const subscription = stompClient.subscribe(
      `/topic/room/${roomId}/chat`,
      (message) => {
        const data = JSON.parse(message.body);
        console.log("Chat message received:", data);
        onMessageReceived(data);
      }
    );

    console.log(`Subscribed to room ${roomId} chat`);
    return subscription;
  } catch (error) {
    handleWebSocketError(error, "Chat subscription failed");
  }
};

// Send Chat Message
export const sendChatMessage = async (roomId, messageData) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({
      destination: `/app/room/${roomId}/chat`,
      body: JSON.stringify(messageData),
    });
  } catch (error) {
    handleWebSocketError(error, "Chat message sending failed");
  }
};

// Join Room via WebSocket
export const joinRoomWS = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/join` });
  } catch (error) {
    handleWebSocketError(error, "Room join via WebSocket failed");
  }
};

// Leave Room via WebSocket
export const leaveRoomWS = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/leave` });
  } catch (error) {
    handleWebSocketError(error, "Room leave via WebSocket failed");
  }
};

// Mark Player Ready
export const markPlayerReady = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/ready` });
  } catch (error) {
    handleWebSocketError(error, "Mark player ready failed");
  }
};

// Start Game
export const startGame = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/start` });
  } catch (error) {
    handleWebSocketError(error, "Start game failed");
  }
};

// Get Room Status
export const getRoomStatus = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/status` });
  } catch (error) {
    handleWebSocketError(error, "Get room status failed");
  }
};

// Surrender Game
export const surrenderGame = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/surrender` });
  } catch (error) {
    handleWebSocketError(error, "Surrender game failed");
  }
};

// Request Rematch
export const requestRematch = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/rematch/request` });
  } catch (error) {
    handleWebSocketError(error, "Request rematch failed");
  }
};

// Accept Rematch
export const acceptRematch = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/room/${roomId}/rematch/accept` });
  } catch (error) {
    handleWebSocketError(error, "Accept rematch failed");
  }
};

// Complete Game
export const completeGame = async (roomId, gameResult) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({
      destination: `/app/room/${roomId}/complete`,
      body: JSON.stringify(gameResult),
    });
  } catch (error) {
    handleWebSocketError(error, "Complete game failed");
  }
};

// Make Game Move via WebSocket - Fixed to send correct data format with detailed logging
export const makeGameMoveWS = async (roomId, moveData) => {
  try {
    console.log("=== WebSocket MOVE DEBUG ===");
    console.log("Room ID (raw):", roomId, "Type:", typeof roomId);
    console.log("Input moveData:", moveData);
    console.log("STOMP client connected:", stompClient?.connected);
    console.log("STOMP client state:", stompClient?.state);

    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }

    // Ensure correct data format for backend
    const formattedMoveData = {
      xPosition: parseInt(moveData.xPosition, 10),
      yPosition: parseInt(moveData.yPosition, 10),
    };
    
    // Validate move data
    if (isNaN(formattedMoveData.xPosition) || isNaN(formattedMoveData.yPosition)) {
      throw new Error(`Invalid move coordinates: xPosition=${moveData.xPosition}, yPosition=${moveData.yPosition}`);
    }
    
    if (formattedMoveData.xPosition < 0 || formattedMoveData.xPosition >= 15 || 
        formattedMoveData.yPosition < 0 || formattedMoveData.yPosition >= 15) {
      throw new Error(`Move coordinates out of bounds: (${formattedMoveData.xPosition}, ${formattedMoveData.yPosition})`);
    }

    // Ensure roomId is a number for backend compatibility
    const numericRoomId = parseInt(roomId, 10);
    if (isNaN(numericRoomId)) {
      throw new Error(`Invalid room ID: ${roomId}`);
    }

    console.log("Formatted move data for backend:", formattedMoveData);
    console.log("Numeric room ID:", numericRoomId);
    console.log("Destination:", `/app/game/${numericRoomId}/move`);

    const messageBody = JSON.stringify(formattedMoveData);
    console.log("Message body to send:", messageBody);

    stompClient.publish({
      destination: `/app/game/${numericRoomId}/move`,
      body: messageBody,
    });

    console.log("WebSocket message sent successfully!");
    console.log("=========================");
  } catch (error) {
    console.error("=== WebSocket MOVE ERROR ===");
    console.error("Error details:", error);
    console.error("========================");
    handleWebSocketError(error, "WebSocket game move failed");
    throw error; // Re-throw để GameActionService có thể handle
  }
};

// Get Board State via WebSocket
export const getBoardStateWS = async (roomId) => {
  try {
    if (!stompClient || !stompClient.connected) {
      throw new Error("WebSocket not connected");
    }
    stompClient.publish({ destination: `/app/game/${roomId}/board` });
  } catch (error) {
    handleWebSocketError(error, "WebSocket board state request failed");
  }
};

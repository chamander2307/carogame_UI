// Game WebSocket Service
// Handles real-time game communications via WebSocket
// Based on backend GameRoomWebSocketController endpoints

import { ServiceConfig, ServiceErrors } from "./ServiceConfig";
import { serviceEventEmitter, ServiceEvents } from "./ServiceEvents";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

class GameWebSocketService {
  constructor() {
    this.stompClient = null;
    this.socket = null;
    this.isConnectedState = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = ServiceConfig.WEBSOCKET.MAX_RECONNECT_ATTEMPTS;
    this.reconnectDelay = ServiceConfig.WEBSOCKET.RECONNECT_DELAY;
    this.currentRoomSubscriptions = new Map(); // Track room-specific subscriptions
  }

  /**
   * Connect to WebSocket server using SockJS and STOMP
   * Backend endpoint: /ws
   */
  connect() {
    if (this.isConnectedState) {
      console.log("GameWebSocketService: Already connected");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Create SockJS connection
        this.socket = new SockJS(`${ServiceConfig.WS_BASE_URL}/ws`);
        this.stompClient = Stomp.over(this.socket);

        // Configure STOMP
        this.stompClient.configure({
          debug: (str) => console.log("STOMP Debug:", str),
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: ServiceConfig.WEBSOCKET.HEARTBEAT_INCOMING,
          heartbeatOutgoing: ServiceConfig.WEBSOCKET.HEARTBEAT_OUTGOING,
        });

        // Connect
        this.stompClient.activate({
          onConnect: () => {
            console.log("GameWebSocketService: Connected successfully");
            this.isConnectedState = true;
            this.reconnectAttempts = 0;
            serviceEventEmitter.emit(ServiceEvents.WS_CONNECTED);
            resolve();
          },
          onStompError: (frame) => {
            console.error("GameWebSocketService STOMP error:", frame);
            this.isConnectedState = false;
            serviceEventEmitter.emit(ServiceEvents.WS_ERROR, frame);
            reject(new Error(frame.body));
          },
          onWebSocketClose: () => {
            console.log("GameWebSocketService: WebSocket closed");
            this.isConnectedState = false;
            this.handleReconnect();
            serviceEventEmitter.emit(ServiceEvents.WS_DISCONNECTED);
          },
          onWebSocketError: (event) => {
            console.error("GameWebSocketService WebSocket error:", event);
            this.isConnectedState = false;
            serviceEventEmitter.emit(ServiceEvents.WS_ERROR, event);
            reject(event);
          },
        });
      } catch (error) {
        console.error("GameWebSocketService connection error:", error);
        this.isConnectedState = false;
        serviceEventEmitter.emit(ServiceEvents.WS_ERROR, error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    try {
      console.log("GameWebSocketService: Disconnecting...");

      // Unsubscribe from all rooms
      this.currentRoomSubscriptions.forEach((subscription) => {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
      });
      this.currentRoomSubscriptions.clear();

      // Deactivate STOMP client
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.deactivate();
      }

      this.isConnectedState = false;
      this.subscriptions.clear();
      serviceEventEmitter.emit(ServiceEvents.WS_DISCONNECTED);
    } catch (error) {
      console.error("GameWebSocketService disconnect error:", error);
    }
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("GameWebSocketService: Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `GameWebSocketService: Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    setTimeout(() => {
      serviceEventEmitter.emit(ServiceEvents.WS_RECONNECTING);
      this.connect().catch(() => {
        console.log("GameWebSocketService: Reconnection failed");
      });
    }, this.reconnectDelay);
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.isConnectedState;
  }

  /**
   * Join a game room via WebSocket
   * Backend endpoint: /app/room/{roomId}/join
   * @param {string|number} roomId - Room ID to join
   */
  joinRoom(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(`GameWebSocketService: Joining room ${roomId}`);

      // Send join message to backend
      this.stompClient.publish({
        destination: `/app/room/${roomId}/join`,
        body: JSON.stringify({}),
      });

      serviceEventEmitter.emit(ServiceEvents.ROOM_JOINED, { roomId });
      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService joinRoom error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Leave a game room via WebSocket
   * Backend endpoint: /app/room/{roomId}/leave
   * @param {string|number} roomId - Room ID to leave
   */
  leaveRoom(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(`GameWebSocketService: Leaving room ${roomId}`);

      // Send leave message to backend
      this.stompClient.publish({
        destination: `/app/room/${roomId}/leave`,
        body: JSON.stringify({}),
      });

      this.unsubscribeFromRoom(roomId);
      serviceEventEmitter.emit(ServiceEvents.ROOM_LEFT, { roomId });
      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService leaveRoom error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Subscribe to room events
   * Backend topics: /topic/room/{roomId}/updates, /topic/room/{roomId}/chat
   * @param {string|number} roomId - Room ID to subscribe to
   * @param {Object} callbacks - Event callbacks
   */
  subscribeToRoom(roomId, callbacks = {}) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(`GameWebSocketService: Subscribing to room ${roomId}`);

      // Store callbacks
      this.subscriptions.set(roomId, callbacks);

      // Subscribe to room updates
      const updateSubscription = this.stompClient.subscribe(
        `/topic/room/${roomId}/updates`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("Room update received:", data);

            // Handle different types of room updates based on backend RoomUpdateMessage
            if (callbacks.onRoomUpdate) {
              callbacks.onRoomUpdate(data);
            }

            // Handle specific update types
            switch (data.updateType) {
              case ServiceConfig.ROOM_UPDATE_TYPES.PLAYER_JOINED:
                if (callbacks.onPlayerJoined) callbacks.onPlayerJoined(data);
                serviceEventEmitter.emit(ServiceEvents.ROOM_PLAYER_JOINED, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.PLAYER_LEFT:
                if (callbacks.onPlayerLeft) callbacks.onPlayerLeft(data);
                serviceEventEmitter.emit(ServiceEvents.ROOM_PLAYER_LEFT, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.PLAYER_READY:
                if (callbacks.onPlayerReady) callbacks.onPlayerReady(data);
                serviceEventEmitter.emit(ServiceEvents.ROOM_PLAYER_READY, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.GAME_STARTED:
                if (callbacks.onGameStarted) callbacks.onGameStarted(data);
                serviceEventEmitter.emit(ServiceEvents.GAME_STARTED, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.GAME_ENDED:
                if (callbacks.onGameEnded) callbacks.onGameEnded(data);
                serviceEventEmitter.emit(ServiceEvents.GAME_ENDED, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.REMATCH_REQUESTED:
                if (callbacks.onRematchRequested) callbacks.onRematchRequested(data);
                serviceEventEmitter.emit(ServiceEvents.REMATCH_REQUESTED, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.REMATCH_ACCEPTED:
                if (callbacks.onRematchAccepted) callbacks.onRematchAccepted(data);
                serviceEventEmitter.emit(ServiceEvents.REMATCH_ACCEPTED, data);
                break;
                
              case ServiceConfig.ROOM_UPDATE_TYPES.ROOM_STATUS_CHANGED:
                if (callbacks.onRoomStatusChanged) callbacks.onRoomStatusChanged(data);
                serviceEventEmitter.emit(ServiceEvents.ROOM_STATUS_CHANGED, data);
                break;
                
              default:
                console.log('Unhandled room update type:', data.updateType);
            }

            // Legacy support for old callback names
            if (data.gameState && callbacks.onGameStateChange) {
              callbacks.onGameStateChange(data.gameState);
            }

            if (data.rematchState && callbacks.onRematchUpdate) {
              callbacks.onRematchUpdate(data);
            }

            // Handle player ready state changes (legacy support)
            if (
              data.readyPlayersCount !== undefined &&
              callbacks.onPlayerReady
            ) {
              callbacks.onPlayerReady(data);
            }
          } catch (error) {
            console.error("Error parsing room update message:", error);
          }
        }
      );

      // Subscribe to chat messages
      const chatSubscription = this.stompClient.subscribe(
        `/topic/room/${roomId}/chat`,
        (message) => {
          try {
            const chatMessage = JSON.parse(message.body);
            console.log("Chat message received:", chatMessage);

            if (callbacks.onChatMessage) {
              callbacks.onChatMessage(chatMessage);
            }
          } catch (error) {
            console.error("Error parsing chat message:", error);
          }
        }
      );

      // Store subscriptions for cleanup
      this.currentRoomSubscriptions.set(
        `${roomId}_updates`,
        updateSubscription
      );
      this.currentRoomSubscriptions.set(`${roomId}_chat`, chatSubscription);

      // Call onSubscribe callback
      if (callbacks.onSubscribe) {
        callbacks.onSubscribe();
      }

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService subscribeToRoom error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Unsubscribe from room events
   * @param {string|number} roomId - Room ID to unsubscribe from
   */
  unsubscribeFromRoom(roomId) {
    try {
      console.log(`GameWebSocketService: Unsubscribing from room ${roomId}`);

      // Unsubscribe from room updates
      const updateSubscription = this.currentRoomSubscriptions.get(
        `${roomId}_updates`
      );
      if (updateSubscription && updateSubscription.unsubscribe) {
        updateSubscription.unsubscribe();
        this.currentRoomSubscriptions.delete(`${roomId}_updates`);
      }

      // Unsubscribe from chat
      const chatSubscription = this.currentRoomSubscriptions.get(
        `${roomId}_chat`
      );
      if (chatSubscription && chatSubscription.unsubscribe) {
        chatSubscription.unsubscribe();
        this.currentRoomSubscriptions.delete(`${roomId}_chat`);
      }

      // Remove stored callbacks
      this.subscriptions.delete(roomId);
    } catch (error) {
      console.error("GameWebSocketService unsubscribeFromRoom error:", error);
    }
  }

  /**
   * Send chat message
   * Backend endpoint: /app/room/{roomId}/chat
   * @param {string|number} roomId - Room ID
   * @param {string} message - Chat message
   */
  sendChatMessage(roomId, message) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(
        `GameWebSocketService: Sending chat message in room ${roomId}: ${message}`
      );

      this.stompClient.publish({
        destination: `/app/room/${roomId}/chat`,
        body: JSON.stringify({
          content: message.trim(),
        }),
      });

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService sendChatMessage error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Set player ready state
   * Backend endpoint: /app/room/{roomId}/ready
   * @param {string|number} roomId - Room ID
   */
  setPlayerReady(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(
        `GameWebSocketService: Setting player ready in room ${roomId}`
      );

      this.stompClient.publish({
        destination: `/app/room/${roomId}/ready`,
        body: JSON.stringify({}),
      });

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService setPlayerReady error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Start game (deprecated - use ready system instead)
   * Backend endpoint: /app/room/{roomId}/start
   * @param {string|number} roomId - Room ID
   * @deprecated Use setPlayerReady instead
   */
  startGame(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(
        `GameWebSocketService: Starting game in room ${roomId} (deprecated)`
      );

      this.stompClient.publish({
        destination: `/app/room/${roomId}/start`,
        body: JSON.stringify({}),
      });

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService startGame error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Get room status
   * Backend endpoint: /app/room/{roomId}/status
   * @param {string|number} roomId - Room ID
   */
  getRoomStatus(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(
        `GameWebSocketService: Getting room status for room ${roomId}`
      );

      this.stompClient.publish({
        destination: `/app/room/${roomId}/status`,
        body: JSON.stringify({}),
      });

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService getRoomStatus error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Surrender game
   * Backend endpoint: /app/room/{roomId}/surrender
   * @param {string|number} roomId - Room ID
   */
  surrenderGame(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(`GameWebSocketService: Surrendering game in room ${roomId}`);

      this.stompClient.publish({
        destination: `/app/room/${roomId}/surrender`,
        body: JSON.stringify({}),
      });

      serviceEventEmitter.emit(ServiceEvents.GAME_ENDED, {
        roomId,
        result: "SURRENDER",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService surrenderGame error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Request rematch
   * Backend endpoint: /app/room/{roomId}/rematch/request
   * @param {string|number} roomId - Room ID
   */
  requestRematch(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(`GameWebSocketService: Requesting rematch in room ${roomId}`);

      this.stompClient.publish({
        destination: `/app/room/${roomId}/rematch/request`,
        body: JSON.stringify({}),
      });

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService requestRematch error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Accept rematch
   * Backend endpoint: /app/room/{roomId}/rematch/accept
   * @param {string|number} roomId - Room ID
   */
  acceptRematch(roomId) {
    if (!this.isConnected()) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    try {
      console.log(`GameWebSocketService: Accepting rematch in room ${roomId}`);

      this.stompClient.publish({
        destination: `/app/room/${roomId}/rematch/accept`,
        body: JSON.stringify({}),
      });

      return Promise.resolve();
    } catch (error) {
      console.error("GameWebSocketService acceptRematch error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Get current subscriptions
   * @returns {Map} Current subscriptions
   */
  getSubscriptions() {
    return this.subscriptions;
  }

  /**
   * Subscribe to user-specific notifications (friend invitations, etc.)
   * Backend topic: /user/queue/notifications
   * @param {Function} onNotification - Callback for notifications
   */
  subscribeToUserNotifications(onNotification) {
    if (!this.isConnected()) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    try {
      console.log('GameWebSocketService: Subscribing to user notifications');
      
      const notificationSubscription = this.stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log('Notification received:', notification);
          
          if (onNotification) {
            onNotification(notification);
          }
          
          // Emit specific events based on notification type
          if (notification.type === 'ROOM_INVITATION') {
            serviceEventEmitter.emit(ServiceEvents.ROOM_INVITATION, notification);
          }
          
          serviceEventEmitter.emit(ServiceEvents.NOTIFICATION_RECEIVED, notification);
        } catch (error) {
          console.error('Error parsing notification message:', error);
        }
      });

      // Store subscription for cleanup
      this.currentRoomSubscriptions.set('user_notifications', notificationSubscription);
      return Promise.resolve();
    } catch (error) {
      console.error('GameWebSocketService subscribeToUserNotifications error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Unsubscribe from user notifications
   */
  unsubscribeFromUserNotifications() {
    try {
      const notificationSubscription = this.currentRoomSubscriptions.get('user_notifications');
      if (notificationSubscription && notificationSubscription.unsubscribe) {
        notificationSubscription.unsubscribe();
        this.currentRoomSubscriptions.delete('user_notifications');
      }
    } catch (error) {
      console.error('GameWebSocketService unsubscribeFromUserNotifications error:', error);
    }
  }

  /**
   * Send a test ping message (for development)
   * Backend endpoint: /app/ping
   * @param {string} message - Test message
   */
  sendPing(message = 'Hello Server!') {
    if (!this.isConnected()) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    try {
      console.log('GameWebSocketService: Sending ping message');
      
      this.stompClient.publish({
        destination: '/app/ping',
        body: message
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('GameWebSocketService sendPing error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Subscribe to ping/pong testing (for development)
   * Backend topic: /topic/pong
   * @param {Function} onPong - Callback for pong responses
   */
  subscribeToPong(onPong) {
    if (!this.isConnected()) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    try {
      console.log('GameWebSocketService: Subscribing to pong');
      
      const pongSubscription = this.stompClient.subscribe('/topic/pong', (message) => {
        try {
          console.log('Pong received:', message.body);
          if (onPong) {
            onPong(message.body);
          }
        } catch (error) {
          console.error('Error handling pong message:', error);
        }
      });

      this.currentRoomSubscriptions.set('ping_pong', pongSubscription);
      return Promise.resolve();
    } catch (error) {
      console.error('GameWebSocketService subscribeToPong error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Get connection status info
   * @returns {Object} Connection status and info
   */
  getConnectionInfo() {
    return {
      isConnected: this.isConnectedState,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      activeSubscriptions: Array.from(this.currentRoomSubscriptions.keys()),
      stompClientConnected: this.stompClient ? this.stompClient.connected : false
    };
  }
}

// Export singleton instance
const gameWebSocketService = new GameWebSocketService();
export default gameWebSocketService;

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT access token
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS(
          `http://localhost:8080/ws?token=Bearer ${token}`
        );

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log("STOMP Debug:", str);
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
          console.log("WebSocket connected:", frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(frame);
        };

        this.client.onDisconnect = (frame) => {
          console.log("WebSocket disconnected:", frame);
          this.isConnected = false;
          this.subscriptions.clear();
        };

        this.client.onStompError = (frame) => {
          console.error("STOMP error:", frame.headers["message"]);
          console.error("Error details:", frame.body);
          reject(new Error(frame.headers["message"]));
        };

        this.client.onWebSocketError = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.client.activate();
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  /**
   * Subscribe to a topic
   * @param {string} topic - Topic to subscribe to
   * @param {function} callback - Callback function for messages
   * @returns {string} - Subscription ID
   */
  subscribe(topic, callback) {
    if (!this.isConnected || !this.client) {
      throw new Error("WebSocket not connected");
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing message:", error);
        callback({ error: "Failed to parse message", raw: message.body });
      }
    });

    this.subscriptions.set(topic, subscription);
    return subscription.id;
  }

  /**
   * Unsubscribe from a topic
   * @param {string} topic - Topic to unsubscribe from
   */
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  /**
   * Send message to server
   * @param {string} destination - Destination endpoint
   * @param {object} body - Message body
   * @param {object} headers - Additional headers
   */
  send(destination, body = {}, headers = {}) {
    if (!this.isConnected || !this.client) {
      throw new Error("WebSocket not connected");
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  isConnectedToServer() {
    return this.isConnected && this.client && this.client.connected;
  }
}

// Export singleton instance
export default new WebSocketService();

// Service Event System
// Event emitter for cross-service communication

// Service event emitter for cross-service communication
class ServiceEventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(data));
  }

  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}

export const serviceEventEmitter = new ServiceEventEmitter();

// Service events constants
export const ServiceEvents = {
  // Authentication events
  USER_LOGIN: "user:login",
  USER_LOGOUT: "user:logout",
  USER_PROFILE_UPDATE: "user:profile:update",

  // Game events
  GAME_STARTED: "game:started",
  GAME_ENDED: "game:ended",
  GAME_MOVE: "game:move",
  GAME_ERROR: "game:error",
  GAME_STATE_CHANGED: "game:state:changed",
  GAME_RESULT: "game:result",

  // Room events  
  ROOM_JOINED: "room:joined",
  ROOM_LEFT: "room:left",
  ROOM_UPDATE: "room:update",
  ROOM_STATUS_CHANGED: "room:status:changed",
  ROOM_PLAYER_JOINED: "room:player:joined",
  ROOM_PLAYER_LEFT: "room:player:left",
  ROOM_PLAYER_READY: "room:player:ready",
  ROOM_CHAT_MESSAGE: "room:chat:message",
  ROOM_INVITATION: "room:invitation",

  // Rematch events
  REMATCH_REQUESTED: "rematch:requested",
  REMATCH_ACCEPTED: "rematch:accepted",
  REMATCH_CREATED: "rematch:created",

  // Friend events
  FRIEND_REQUEST_RECEIVED: "friend:request:received",
  FRIEND_REQUEST_ACCEPTED: "friend:request:accepted",
  FRIEND_ONLINE: "friend:online",
  FRIEND_OFFLINE: "friend:offline",

  // Notification events
  NOTIFICATION_RECEIVED: "notification:received",
  NOTIFICATION_READ: "notification:read",

  // WebSocket events
  WS_CONNECTED: "ws:connected",
  WS_DISCONNECTED: "ws:disconnected",
  WS_ERROR: "ws:error",
  WS_RECONNECTING: "ws:reconnecting",
};

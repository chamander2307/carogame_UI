// Service Configuration Constants
// Centralized configuration for all services

export const ServiceConfig = {
  // API Base URLs (configured in axios.js)
  API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  WS_BASE_URL: process.env.REACT_APP_WS_URL || "http://localhost:8080",

  // WebSocket endpoints
  WS_ENDPOINTS: {
    CONNECT: "/ws",
    ROOM_TOPIC: "/topic/room",
    USER_QUEUE: "/user/queue",
    APP_DESTINATION: "/app",
  },

  // Service response status codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
    MAX_SIZE: 100,
  },

  // Game constants (from backend)
  GAME: {
    BOARD_SIZE: 15,
    WIN_CONDITION: 5,
    MAX_GAME_TIME: 3600, // 1 hour in seconds
    MOVE_TIMEOUT: 30, // 30 seconds per move
    MAX_CHAT_MESSAGE_LENGTH: 500,
    MIN_ROOM_NAME_LENGTH: 3,
    MAX_ROOM_NAME_LENGTH: 100,
    JOIN_CODE_PATTERN: "^[A-Z0-9]{4}$", // 4 alphanumeric characters
  },

  // Game State enum (from backend GameState.java)
  GAME_STATE: {
    WAITING_FOR_PLAYERS: "WAITING_FOR_PLAYERS",
    WAITING_FOR_READY: "WAITING_FOR_READY", 
    READY_TO_START: "READY_TO_START",
    IN_PROGRESS: "IN_PROGRESS",
    FINISHED: "FINISHED",
    ENDED_BY_SURRENDER: "ENDED_BY_SURRENDER",
    ENDED_BY_LEAVE: "ENDED_BY_LEAVE"
  },

  // Room Status enum (from backend RoomStatus.java)
  ROOM_STATUS: {
    WAITING: "WAITING",
    PLAYING: "PLAYING", 
    FINISHED: "FINISHED"
  },

  // Player Ready State enum (from backend PlayerReadyState.java)
  PLAYER_READY_STATE: {
    NOT_READY: "NOT_READY",
    READY: "READY",
    IN_GAME: "IN_GAME"
  },

  // Rematch State enum (from backend RematchState.java)
  REMATCH_STATE: {
    NONE: "NONE",
    REQUESTED: "REQUESTED",
    BOTH_ACCEPTED: "BOTH_ACCEPTED", 
    CREATED: "CREATED"
  },

  // Game Result enum (from backend GameResult.java)
  GAME_RESULT: {
    X_WIN: "X_WIN",
    O_WIN: "O_WIN", 
    DRAW: "DRAW",
    ONGOING: "ONGOING",
    WIN: "WIN",
    LOSE: "LOSE",
    NONE: "NONE"
  },

  // WebSocket message types for room updates
  ROOM_UPDATE_TYPES: {
    PLAYER_JOINED: "PLAYER_JOINED",
    PLAYER_LEFT: "PLAYER_LEFT",
    PLAYER_READY: "PLAYER_READY",
    GAME_STARTED: "GAME_STARTED",
    GAME_ENDED: "GAME_ENDED",
    REMATCH_REQUESTED: "REMATCH_REQUESTED",
    REMATCH_ACCEPTED: "REMATCH_ACCEPTED",
    ROOM_STATUS_CHANGED: "ROOM_STATUS_CHANGED"
  },

  // Notification types
  NOTIFICATION_TYPES: {
    SYSTEM: "SYSTEM",
    GAME_INVITE: "GAME_INVITE",
    FRIEND_REQUEST: "FRIEND_REQUEST",
    GAME_RESULT: "GAME_RESULT",
    ACHIEVEMENT: "ACHIEVEMENT",
    UPDATE: "UPDATE",
    PROMOTION: "PROMOTION",
    WARNING: "WARNING",
    INFO: "INFO",
  },

  // WebSocket reconnection settings
  WEBSOCKET: {
    RECONNECT_DELAY: 3000,
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INCOMING: 4000,
    HEARTBEAT_OUTGOING: 4000,
  },
};

// Service error types
export const ServiceErrors = {
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFLICT_ERROR: "CONFLICT_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  WEBSOCKET_ERROR: "WEBSOCKET_ERROR",
  GAME_ERROR: "GAME_ERROR",
};

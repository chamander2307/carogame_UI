/**
 * Services Index - Clean barrel export file
 * 
 * This file provides a clean interface to import all services and related utilities.
 * For detailed configuration, utilities, and events, see the separate dedicated files.
 */

// Main service exports
export { default as AuthService } from "./AuthServices";
export { default as ProfileService } from "./ProfileServices";
export { default as FriendService } from "./FriendService";
export { default as GameRoomService } from "./GameRoomService";
export { default as WebSocketService } from "./WebSocketService";
export { default as GameWebSocketService } from "./GameWebSocketService";
export { default as GameLogicService } from "./GameLogicService";

// Service configuration and utilities (re-exported for convenience)
export { ServiceConfig, ServiceErrors } from "./ServiceConfig";
export { ServiceUtils } from "./ServiceUtils";
export { serviceEventEmitter, ServiceEvents } from "./ServiceEvents";
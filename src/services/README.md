# Services Directory Structure - Updated for Backend Integration

This directory contains all service modules for the Gomoku game application. The services have been **completely synchronized with the backend** and are production-ready.

## 🎯 **Backend Integration Status: ✅ COMPLETE**

### **Synchronized Components:**
- ✅ REST API endpoints (GameRoomController)
- ✅ WebSocket endpoints (GameRoomWebSocketController) 
- ✅ Backend enums (GameState, RoomStatus, PlayerReadyState, etc.)
- ✅ DTOs and message formats
- ✅ Real WebSocket implementation (SockJS/STOMP)
- ✅ Complete game logic with win detection

## File Structure

### Main Files
- `index.js` - Main barrel export file for all services and utilities
- `ServiceExports.js` - Simple service exports only

### Service Modules
- `AuthServices.js` - Authentication and authorization
- `ProfileServices.js` - User profile management  
- `FriendService.js` - Friend management (complete with backend)
- `GameRoomService.js` - **Game room management (all backend endpoints)**
- `WebSocketService.js` - General WebSocket service
- `GameWebSocketService.js` - **Real-time game WebSocket (SockJS/STOMP)**
- `GameLogicService.js` - **Game logic, board validation, win detection**

### Configuration & Utilities  
- `ServiceConfig.js` - **Backend-synced enums and constants**
- `ServiceUtils.js` - Common utility functions
- `ServiceEvents.js` - **Enhanced event system**

## 🚀 **Key Features**

### **Real-time WebSocket Communication**
```javascript
// Production-ready WebSocket with SockJS/STOMP
await GameWebSocketService.connect();
GameWebSocketService.subscribeToRoom(roomId, {
  onPlayerJoined: (data) => updateUI(data),
  onGameStarted: (data) => startGame(data),
  onChatMessage: (msg) => displayChat(msg)
});
```

### **Complete Game Logic**
```javascript
// Full Gomoku/Caro game logic
const board = GameLogicService.createEmptyBoard();
const result = GameLogicService.makeMove(board, 7, 7, 'X');
const hasWon = GameLogicService.checkWinCondition(board, 7, 7, 'X');
```

### **Backend-Synchronized Room Management**
```javascript
// All backend endpoints available
const room = await GameRoomService.createRoom({name: 'My Room', isPrivate: false});
const quickRoom = await GameRoomService.quickPlay();
await GameRoomService.joinRoomByCode('ABC1');
await GameRoomService.surrenderGame(roomId);
```

## 📡 **Backend Endpoints Implemented**

### **REST API (GameRoomController)**
- `POST /api/rooms` - Create room ✅
- `POST /api/rooms/quick-play` - Quick play ✅  
- `POST /api/rooms/{roomId}/join` - Join room ✅
- `POST /api/rooms/join-by-code` - Join by code ✅
- `DELETE /api/rooms/{roomId}/leave` - Leave room ✅
- `POST /api/rooms/{roomId}/surrender` - Surrender ✅
- `POST /api/rooms/{roomId}/rematch` - Rematch ✅
- `POST /api/rooms/{roomId}/invite` - Invite friend ✅

### **WebSocket (GameRoomWebSocketController)**
- `/app/room/{roomId}/join` - Real-time join ✅
- `/app/room/{roomId}/chat` - Chat messages ✅
- `/app/room/{roomId}/ready` - Player ready ✅
- `/app/room/{roomId}/surrender` - Real-time surrender ✅
- `/app/room/{roomId}/rematch/*` - Rematch system ✅

### **Subscriptions**
- `/topic/room/{roomId}/updates` - Room updates ✅
- `/topic/room/{roomId}/chat` - Chat messages ✅
- `/user/queue/notifications` - User notifications ✅

This service layer is now **production-ready** and fully integrated with your backend! 🎮

## File Structure

### Main Files

- `index.js` - Main barrel export file for all services and utilities
- `ServiceExports.js` - Simple service exports only (alternative import option)

### Service Modules

- `AuthServices.js` - Authentication and authorization services
- `ProfileServices.js` - User profile management services
- `FriendService.js` - Friend management services (search, add, accept, reject)
- `GameRoomService.js` - Game room management services
- `WebSocketService.js` - General WebSocket communication service
- `GameWebSocketService.js` - Game-specific WebSocket communication service

### Configuration & Utilities

- `ServiceConfig.js` - Centralized configuration constants and settings
- `ServiceUtils.js` - Common utility functions used across services
- `ServiceEvents.js` - Event system for cross-service communication

## Usage Examples

### Basic Service Import

```javascript
import { AuthService, FriendService } from "../services";
```

### Import with Configuration

```javascript
import { AuthService, ServiceConfig, ServiceUtils } from "../services";
```

### Import from Specific Files

```javascript
import { ServiceConfig } from "../services/ServiceConfig";
import { ServiceUtils } from "../services/ServiceUtils";
```

## Service Features

### AuthServices

- User login/logout
- Token management
- Password reset functionality

### FriendService

- Search users
- Send/accept/reject friend requests
- Get friends list and online status

### GameRoomService

- Create/join/leave game rooms
- Room management
- Game state tracking

### WebSocket Services

- Real-time communication
- Game event handling
- Chat functionality

## Configuration

All services use centralized configuration from `ServiceConfig.js`:

- API endpoints
- WebSocket settings
- Pagination defaults
- Game constants
- Error types

## Event System

Services communicate through the event system in `ServiceEvents.js`:

- User authentication events
- Game state changes
- Friend status updates
- WebSocket connection events

## Development Notes

- All services follow TypeScript-like patterns for better code quality
- Error handling is standardized across all services
- WebSocket services include placeholder implementations that can be extended
- Services are designed to work with the backend REST API and WebSocket endpoints

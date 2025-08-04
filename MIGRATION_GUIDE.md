# 🔄 Migration Guide - From Legacy to Clean Architecture

## 📋 Tổng quan thay đổi

Dự án Caro Game đã được refactor hoàn toàn theo Clean Architecture và SOLID principles. Hướng dẫn này sẽ giúp bạn hiểu các thay đổi và cách sử dụng kiến trúc mới.

## 🗂️ Cấu trúc file mới

### Các file đã được tạo mới:

```
src/
├── services/
│   ├── GameStateService.js          ✨ MỚI - Quản lý state game
│   ├── WebSocketEventHandler.js     ✨ MỚI - Xử lý WebSocket events  
│   └── GameActionService.js         ✨ MỚI - Thực hiện game actions
├── hooks/
│   ├── useGameLogic.js              ✨ MỚI - Logic game chính
│   └── useChatManager.js            ✨ MỚI - Quản lý chat
└── pages/game/
    ├── GamePage.js                  🔄 REFACTORED - Clean UI
    └── GamePage_old.js              📁 BACKUP - File cũ
```

### Các file hiện có được cải thiện:

```
src/services/
├── WebSocketService.js              🔄 ENHANCED - Tối ưu WebSocket
├── CaroGameService.js               🔄 ENHANCED - Cải thiện API calls
└── GameStatisticsService.js         ✅ UNCHANGED - Giữ nguyên
```

## 🚀 Cách sử dụng kiến trúc mới

### 1. **Sử dụng Game Logic Hook**

```javascript
// ❌ Cách cũ - Phức tạp và khó maintain
const GamePage = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [gameStatus, setGameStatus] = useState("waiting");
  const [playerSymbol, setPlayerSymbol] = useState("");
  // ... 20+ state variables
  
  useEffect(() => {
    // 100+ lines of WebSocket setup
  }, []);
  
  const handleMove = async (row, col) => {
    // 50+ lines of validation, API calls, state updates
  };
  
  // ... 10+ handler functions
};

// ✅ Cách mới - Clean và đơn giản
const GamePage = () => {
  const [roomId, setRoomId] = useState(null);
  
  const {
    gameState,           // Tất cả state game trong 1 object
    wsConnected,
    makeMove,           // Chỉ 1 function call
    markPlayerReady,
    surrenderGame,
    // ... tất cả actions sẵn sàng
  } = useGameLogic(roomId, user);
  
  const handleMove = async (row, col) => {
    const result = await makeMove(row, col);
    if (!result.success) {
      toast.warn(result.reason);
    }
  };
};
```

### 2. **Sử dụng Chat Manager**

```javascript
// ❌ Cách cũ - Trộn logic chat với game logic
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState("");

useEffect(() => {
  // WebSocket chat setup mixed with game setup
}, []);

// ✅ Cách mới - Tách biệt chat logic
const {
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
} = useChatManager(webSocketEventHandler);
```

### 3. **Sử dụng Game State Service**

```javascript
// ❌ Cách cũ - Direct state mutation
setBoard(newBoard);
setGameStatus("playing");
setPlayerSymbol("X");

// ✅ Cách mới - Centralized state management với validation
import { gameStateService } from '../services/GameStateService';

gameStateService.setBoard(newBoard);      // Auto validation
gameStateService.setGameStatus("playing"); // Type checking
gameStateService.setPlayerSymbol("X");     // Enum validation
```

## 🔧 API Changes

### Game Actions

```javascript
// ❌ Cách cũ - Direct service calls
import { makeMove as apiMakeMove } from '../services/CaroGameService';
import { makeGameMoveWS } from '../services/WebSocketService';

// Phải tự handle strategy và fallback
const makeMove = async (row, col) => {
  try {
    if (useWebSocket) {
      await makeGameMoveWS(roomId, { xPosition: row, yPosition: col });
    } else {
      await apiMakeMove(roomId, { x: row, y: col });
    }
  } catch (error) {
    // Manual error handling và rollback
  }
};

// ✅ Cách mới - Unified interface
const { makeMove } = useGameLogic(roomId, user);

// Auto strategy selection, validation, error handling, rollback
const result = await makeMove(row, col);
```

### WebSocket Events

```javascript
// ❌ Cách cũ - Manual subscription management
useEffect(() => {
  const roomSub = subscribeToRoomUpdates(roomId, handleRoomUpdate);
  const moveSub = subscribeToGameMoves(roomId, handleGameMove);
  const endSub = subscribeToGameEnd(roomId, handleGameEnd);
  const chatSub = subscribeToRoomChat(roomId, handleChat);
  
  return () => {
    roomSub?.unsubscribe();
    moveSub?.unsubscribe();
    endSub?.unsubscribe();
    chatSub?.unsubscribe();
  };
}, [roomId]);

// ✅ Cách mới - Auto managed subscriptions
const { webSocketEventHandler } = useGameLogic(roomId, user);

// Subscriptions are auto managed, just add custom handlers if needed
webSocketEventHandler.addRoomUpdateHandler(customHandler);
```

## 🎨 UI Components Changes

### State Access

```javascript
// ❌ Cách cũ - Multiple state variables
<div>
  Player: {playerSymbol} 
  Status: {gameStatus}
  Turn: {currentTurn}
  Ready: {isPlayerReady}
</div>

// ✅ Cách mới - Single state object
<div>
  Player: {gameState.playerSymbol}
  Status: {gameState.gameStatus} 
  Turn: {gameState.currentTurn}
  Ready: {gameState.isPlayerReady}
</div>
```

### Event Handlers

```javascript
// ❌ Cách cũ - Complex handlers
const handleMove = useCallback(async (row, col) => {
  if (isMakingMove || gameStatus !== "playing" || /* ... 10+ conditions */) {
    return;
  }
  
  setIsMakingMove(true);
  try {
    // Optimistic update
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = playerSymbol === "X" ? 1 : 2;
    setBoard(newBoard);
    
    // API call
    const response = await makeMove(roomId, { x: row, y: col });
    
    // Validate response
    if (response.board) {
      setBoard(response.board);
    }
    // ... more complex logic
  } catch (error) {
    // Manual rollback
  } finally {
    setIsMakingMove(false);
  }
}, [/* 10+ dependencies */]);

// ✅ Cách mới - Simple delegation
const handleMove = async (row, col) => {
  try {
    const result = await makeMove(row, col);
    if (!result.success) {
      toast.warn(result.reason);
    }
  } catch (error) {
    toast.error("Xử lý nước đi thất bại!");
  }
};
```

## 🔍 Debugging và Monitoring

### Game State Debugging

```javascript
// ❌ Cách cũ - Scattered console.logs
console.log("Board:", board);
console.log("Status:", gameStatus);
console.log("Symbol:", playerSymbol);

// ✅ Cách mới - Centralized debugging
import { gameStateService } from '../services/GameStateService';

// Xem toàn bộ state
console.log("Full Game State:", gameStateService.getState());

// Debug specific validation
const validation = gameStateService.validateMove(row, col);
console.log("Move validation:", validation);
```

### Error Tracking

```javascript
// ❌ Cách cũ - Inconsistent error handling
catch (error) {
  console.error("Some error:", error);
  toast.error("Something went wrong");
}

// ✅ Cách mới - Structured error handling
catch (error) {
  // Services automatically handle Vietnamese error messages
  // Automatic token refresh on 401
  // Consistent error logging format
}
```

## 📊 Performance Improvements

### State Updates

```javascript
// ❌ Cách cũ - Multiple re-renders
setBoard(newBoard);        // Re-render 1
setGameStatus("playing");  // Re-render 2  
setCurrentTurn("O");       // Re-render 3
setIsMakingMove(false);    // Re-render 4

// ✅ Cách mới - Batched updates
gameStateService.setBoard(newBoard);
gameStateService.setGameStatus("playing");
gameStateService.setCurrentTurn("O");
gameStateService.setMakingMove(false);
// Only 1 re-render thanks to observer pattern
```

### Memory Management

```javascript
// ❌ Cách cũ - Memory leaks possible
const [chatMessages, setChatMessages] = useState([]);

// Messages keep growing forever
setChatMessages(prev => [...prev, newMessage]);

// ✅ Cách mới - Auto memory management
const { chatMessages } = useChatManager(webSocketEventHandler);

// Automatically limits to last 50 messages
// Auto cleanup on unmount
```

## 🧪 Testing Strategy

### Service Testing

```javascript
// ✅ Test services independently
import { GameStateService } from '../services/GameStateService';

describe('GameStateService', () => {
  let service;
  
  beforeEach(() => {
    service = new GameStateService();
  });
  
  it('should validate board correctly', () => {
    const validBoard = service.createEmptyBoard();
    expect(service.validateBoard(validBoard)).toBe(true);
    
    const invalidBoard = Array(10).fill([]);
    expect(service.validateBoard(invalidBoard)).toBe(false);
  });
});
```

### Hook Testing

```javascript
// ✅ Test hooks with mock services
import { renderHook } from '@testing-library/react-hooks';
import { useGameLogic } from '../hooks/useGameLogic';

// Mock services
jest.mock('../services/GameStateService');

test('should handle move correctly', async () => {
  const { result } = renderHook(() => useGameLogic('room123', mockUser));
  
  await act(async () => {
    const moveResult = await result.current.makeMove(0, 0);
    expect(moveResult.success).toBe(true);
  });
});
```

## 🚨 Breaking Changes

### Import Changes

```javascript
// ❌ Cũ - Direct service imports  
import { makeMove } from '../services/CaroGameService';
import { initializeWebSocket } from '../services/WebSocketService';

// ✅ Mới - Hook imports
import { useGameLogic } from '../hooks/useGameLogic';
import { useChatManager } from '../hooks/useChatManager';
```

### Props Changes

```javascript
// ❌ Cũ - Many individual props
<GameBoard 
  board={board}
  gameStatus={gameStatus}
  playerSymbol={playerSymbol}
  currentTurn={currentTurn}
  isMakingMove={isMakingMove}
  onMove={handleMove}
/>

// ✅ Mới - Single game state object
<GameBoard 
  gameState={gameState}
  onMove={handleMove}
/>
```

## 📚 Migration Steps

### Step 1: Update Imports
```bash
# Replace old imports with new hook imports
```

### Step 2: Replace State Management
```javascript
// Replace multiple useState with useGameLogic hook
const { gameState, makeMove, ... } = useGameLogic(roomId, user);
```

### Step 3: Simplify Event Handlers
```javascript
// Replace complex handlers with simple delegations
const handleMove = async (row, col) => {
  const result = await makeMove(row, col);
  // Handle result
};
```

### Step 4: Update UI References
```javascript
// Replace direct state references with gameState object
{gameState.playerSymbol} instead of {playerSymbol}
```

### Step 5: Test Integration
```bash
# Test all game functions to ensure they work correctly
npm start
```

## 🎯 Next Steps

Với kiến trúc mới, bạn có thể dễ dàng:

1. **Thêm Game Modes Mới**
   - Implement strategy pattern trong GameActionService
   - Thêm validation rules mới trong GameStateService

2. **Tích Hợp AI**
   - Tạo AIOpponentService extends GameActionService  
   - Implement AI strategy pattern

3. **Thêm Replay System**
   - Extend GameStateService với history tracking
   - Tạo ReplayManager service

4. **Performance Optimization**
   - Implement memoization trong services
   - Add caching layer

5. **Real-time Features**
   - Extend WebSocketEventHandler với new events
   - Add presence/typing indicators

## 🤝 Support

Nếu gặp vấn đề trong quá trình migration, hãy:

1. Kiểm tra file backup `GamePage_old.js`
2. Xem documentation trong `CLEAN_ARCHITECTURE_DOCS.md`  
3. Debug với `gameStateService.getState()`
4. Kiểm tra console logs của services

Kiến trúc mới đã sẵn sàng cho production và future scaling! 🚀

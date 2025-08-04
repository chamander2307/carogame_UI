import { toast } from "react-toastify";
import {
  initializeWebSocket,
  isWebSocketConnected,
  subscribeToRoomUpdates,
  subscribeToRoomChat,
  subscribeToGameMoves,
  subscribeToGameEnd,
  markPlayerReady,
  leaveRoomWS,
  surrenderGame,
  requestRematch,
  acceptRematch,
  sendChatMessage,
  joinRoomWS,
} from "./WebSocketService";

/**
 * WebSocketEventHandler - Single Responsibility: Xử lý các event từ WebSocket
 * Tuân thủ Open/Closed Principle - có thể mở rộng thêm handler mới
 */
export class WebSocketEventHandler {
  constructor(gameStateService, gameActionService = null) {
    this.gameStateService = gameStateService;
    this.gameActionService = gameActionService; // Add reference to GameActionService
    this.subscriptions = new Map();
    this.chatMessageHandlers = new Set();
    this.roomUpdateHandlers = new Set();
    this.gameMoveHandlers = new Set();
    this.gameEndHandlers = new Set();
    
    // Store current user info for turn management
    this.currentUserId = null;
  }

    // Set user ID for this event handler instance
  setCurrentUserId(userId) {
    this.currentUserId = userId;
  }

  // Observer pattern cho các loại event khác nhau
  addChatMessageHandler(handler) {
    this.chatMessageHandlers.add(handler);
    return () => this.chatMessageHandlers.delete(handler);
  }

  addRoomUpdateHandler(handler) {
    this.roomUpdateHandlers.add(handler);
    return () => this.roomUpdateHandlers.delete(handler);
  }

  addGameMoveHandler(handler) {
    this.gameMoveHandlers.add(handler);
    return () => this.gameMoveHandlers.delete(handler);
  }

  addGameEndHandler(handler) {
    this.gameEndHandlers.add(handler);
    return () => this.gameEndHandlers.delete(handler);
  }

  // Khởi tạo WebSocket connection
  async initializeConnection() {
    try {
      await initializeWebSocket();
      return true;
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      toast.error("Kết nối WebSocket thất bại!");
      return false;
    }
  }

  // Subscribe to all game events cho một room
  async subscribeToGameEvents(roomId) {
    try {
      if (!isWebSocketConnected()) {
        throw new Error("WebSocket not connected");
      }

      // Subscribe to room updates
      const roomSub = await subscribeToRoomUpdates(roomId, (message) => {
        this.handleRoomUpdate(message);
      });

      // Subscribe to game moves
      const moveSub = await subscribeToGameMoves(roomId, (move) => {
        this.handleGameMove(move);
      });

      // Subscribe to game end
      const endSub = await subscribeToGameEnd(roomId, (endData) => {
        this.handleGameEnd(endData);
      });

      // Subscribe to chat
      const chatSub = await subscribeToRoomChat(roomId, (chatMessage) => {
        this.handleChatMessage(chatMessage);
      });

      // Store subscriptions
      this.subscriptions.set('room', roomSub);
      this.subscriptions.set('move', moveSub);
      this.subscriptions.set('end', endSub);
      this.subscriptions.set('chat', chatSub);

      // Join room via WebSocket
      await joinRoomWS(roomId);

      console.log(`Successfully subscribed to all events for room ${roomId}`);
      return true;
    } catch (error) {
      console.error("Error subscribing to game events:", error);
      toast.error("Đăng ký sự kiện game thất bại!");
      return false;
    }
  }

  // Xử lý room update events theo WebSocket API spec
  handleRoomUpdate(message) {
    try {
      // Parse message if it's a string
      let eventData = message;
      if (typeof message === 'string') {
        try {
          eventData = JSON.parse(message);
        } catch (e) {
          console.warn("Failed to parse room update:", message);
          return;
        }
      }

      // Handle different event types according to API documentation
      const eventType = eventData.type || eventData.updateType;
      const data = eventData.data || eventData;

      console.log("Processing room update - eventType:", eventType, "data:", data);

      switch (eventType) {
        case "GAME_STARTED":
          this.handleGameStarted(data);
          break;
          
        case "GAME_ENDED":
          this.handleGameEnded(data);
          break;
          
        case "PLAYER_JOINED":
          this.handlePlayerJoined(data);
          break;
          
        case "PLAYER_LEFT":
          this.handlePlayerLeft(data);
          break;
          
        case "PLAYER_READY":
          this.handlePlayerReady(data);
          break;
          
        case "REMATCH_REQUESTED":
          this.handleRematchRequested(data);
          break;
          
        case "REMATCH_ACCEPTED":
          this.handleRematchAccepted(data);
          break;
          
        case "REMATCH_CREATED":
          this.handleRematchCreated(data);
          break;

        case "ROOM_UPDATED":
          this.handleRoomUpdated(data);
          break;

        default:
          console.log("Unhandled room update type:", eventType, data);
      }

      // Notify registered handlers
      this.roomUpdateHandlers.forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          console.error("Error in room update handler:", error);
        }
      });

    } catch (error) {
      console.error("Error processing room update:", error);
      toast.error("Lỗi xử lý cập nhật phòng!");
    }
  }

  // Separate handlers for each event type according to API spec
  handleGameStarted(data) {
    // Set game status to playing when game starts
    this.gameStateService.setGameStatus("playing");
    
    // Reset making move flag
    this.gameStateService.setMakingMove(false);
    
    console.log("Game started with data:", data);
    
    // Initialize player symbols and turns according to API spec
    if (data?.players && Array.isArray(data.players)) {
      // Find current player in the players array
      const currentPlayer = data.players.find(p => p.id === this.currentUserId);
      if (currentPlayer && currentPlayer.symbol) {
        // Initialize player symbol and turn properly
        this.gameStateService.setPlayerSymbol(currentPlayer.symbol);
        
        // X always goes first according to game rules
        this.gameStateService.setCurrentTurn("X");
        
        // Check if it's my turn
        const isMyTurn = currentPlayer.symbol === "X";
        console.log("Game started - Player symbol:", currentPlayer.symbol, "Is my turn:", isMyTurn);
      }
    } else {
      // Fallback: If no player data, keep current symbol and set turn to X
      console.log("Game started - No player data, using fallback. Current symbol:", this.gameStateService.getState().playerSymbol);
      this.gameStateService.setCurrentTurn("X");
    }
    
    toast.success("Game đã bắt đầu!");
  }

  handleGameEnded(data) {
    this.gameStateService.setGameStatus("ended");
    this.gameStateService.setMakingMove(false);
    
    if (data?.gameResult) {
      switch (data.gameResult) {
        case "WIN":
          if (data.winnerId === this.currentUserId) {
            toast.success("🎉 Bạn đã thắng!");
          } else {
            toast.info("😔 Bạn đã thua!");
          }
          break;
        case "DRAW":
          toast.info("🤝 Game hòa!");
          break;
        case "SURRENDER":
          if (data.winnerId === this.currentUserId) {
            toast.success("🎉 Đối thủ đã đầu hàng - Bạn thắng!");
          } else {
            toast.info("😔 Bạn đã đầu hàng!");
          }
          break;
        default:
          toast.info("Game đã kết thúc!");
      }
    } else {
      toast.info("Game đã kết thúc!");
    }
  }

  handlePlayerJoined(data) {
    if (data?.playerName) {
      toast.info(`${data.playerName} đã tham gia phòng!`);
    } else {
      toast.info("Có người chơi mới tham gia!");
    }
  }

  handlePlayerLeft(data) {
    if (data?.playerName) {
      toast.warning(`${data.playerName} đã rời phòng!`);
    } else {
      toast.warning("Có người chơi đã rời phòng!");
    }
  }

  handlePlayerReady(data) {
    // Only show notification for other players
    if (data?.playerId !== this.currentUserId) {
      const playerName = data?.playerName || "Đối thủ";
      toast.info(`${playerName} đã sẵn sàng!`);
    }
  }

  handleRematchRequested(data) {
    const requesterName = data?.requesterName || "Đối thủ";
    toast.info(`${requesterName} muốn tái đấu!`);
  }

  handleRematchAccepted(data) {
    toast.success("Tái đấu được chấp nhận!");
  }

  handleRematchCreated(data) {
    if (data?.newRoomId) {
      toast.success(`Phòng tái đấu mới được tạo: ${data.newRoomId}`);
      // The navigation logic should be handled at component level
    } else {
      toast.success("Phòng tái đấu mới đã được tạo!");
    }
  }

  handleRoomUpdated(data) {
    // Handle general room updates
    console.log("Room updated:", data);
  }

  // Xử lý game move events theo WebSocket API spec
  handleGameMove(move) {
    console.log("=== HANDLEGAMEMOVE START ===");
    console.log("Raw move data received:", move);
    console.log("typeof move:", typeof move);
    
    try {
      // Parse move data if it's a string
      let moveData = move;
      if (typeof move === 'string') {
        try {
          moveData = JSON.parse(move);
          console.log("Parsed move data:", moveData);
        } catch (e) {
          console.warn("Failed to parse move data:", move);
          return;
        }
      }

      // Backend returns lowercase 'xposition' and 'yposition' according to API spec
      const xPosition = moveData.xposition || moveData.xPosition;
      const yPosition = moveData.yposition || moveData.yPosition;
      const playerSymbol = moveData.playerSymbol;
      
      console.log("Extracted coordinates:", { xPosition, yPosition, playerSymbol });
      console.log("Current user ID:", this.currentUserId);
      console.log("Move player ID:", moveData.playerId);
      
      // Validate move data
      if (xPosition === undefined || yPosition === undefined || !playerSymbol) {
        console.error("Invalid move data - missing required fields:", moveData);
        toast.error("Dữ liệu nước đi không hợp lệ!");
        return;
      }

      // Update board state based on server response (override optimistic update)
      console.log("=== BOARD UPDATE START ===");
      const currentBoard = this.gameStateService.getState().board;
      console.log("Current board before update:", currentBoard);
      
      if (moveData.board && this.gameStateService.validateBoard(moveData.board)) {
        // Use server board if provided (most reliable)
        console.log("Using server board:", moveData.board);
        this.gameStateService.setBoard(moveData.board);
        console.log("Board updated from server");
      } else {
        // Fallback: update locally based on move coordinates
        console.log("Fallback: updating board locally");
        this.gameStateService.updateBoard(xPosition, yPosition, playerSymbol);
        console.log(`Updated board at (${xPosition}, ${yPosition}) with ${playerSymbol}`);
      }
      
      const updatedBoard = this.gameStateService.getState().board;
      console.log("Board after update:", updatedBoard);
      console.log("=== BOARD UPDATE END ===");

      // Update turn management based on server response
      this.updateTurnFromServer(moveData);

      // Always reset making move flag when server responds
      this.gameStateService.setMakingMove(false);
      console.log("Making move flag reset to false");

      // Check for game end conditions
      this.checkGameEndFromMove(moveData);

      // Notify registered handlers
      console.log("=== NOTIFYING HANDLERS ===");
      console.log("Number of game move handlers:", this.gameMoveHandlers.size);
      
      this.gameMoveHandlers.forEach((handler, index) => {
        try {
          console.log(`Calling handler ${index + 1} with moveData:`, moveData);
          handler(moveData);
          console.log(`Handler ${index + 1} completed successfully`);
        } catch (error) {
          console.error(`Error in game move handler ${index + 1}:`, error);
        }
      });
      
      console.log("=== HANDLERS NOTIFIED ===");
      console.log("=== HANDLEGAMEMOVE END ===");

    } catch (error) {
      console.error("Error processing game move:", error);
      this.gameStateService.setMakingMove(false); // Reset flag on error
      toast.error("Lỗi xử lý nước đi!");
    }
  }

  // Update turn management from server response
  updateTurnFromServer(moveData) {
    const gameState = this.gameStateService.getState();
    
    // Initialize player symbol if not set
    if (!gameState.playerSymbol) {
      this.initializePlayerSymbolFromMove(moveData);
    }

    // Update current turn based on server response
    if (moveData.nextTurnPlayerId) {
      const isMyTurn = (moveData.nextTurnPlayerId === this.currentUserId);
      const updatedGameState = this.gameStateService.getState();
      
      if (isMyTurn) {
        this.gameStateService.setCurrentTurn(updatedGameState.playerSymbol);
      } else {
        const opponentSymbol = updatedGameState.playerSymbol === "X" ? "O" : "X";
        this.gameStateService.setCurrentTurn(opponentSymbol);
      }
    } else {
      // Fallback: alternate turn
      const nextTurn = moveData.playerSymbol === "X" ? "O" : "X";
      this.gameStateService.setCurrentTurn(nextTurn);
    }
  }

  // Initialize player symbol from move data
  initializePlayerSymbolFromMove(moveData) {
    console.log("=== INITIALIZING PLAYER SYMBOL ===");
    console.log("Move player ID:", moveData.playerId);
    console.log("Current user ID:", this.currentUserId);
    console.log("Move player symbol:", moveData.playerSymbol);
    
    if (moveData.playerId === this.currentUserId) {
      // This move was made by me, so I have the same symbol
      console.log("This is my move - setting my symbol to:", moveData.playerSymbol);
      this.gameStateService.setPlayerSymbol(moveData.playerSymbol);
    } else {
      // This move was made by opponent, so I have the opposite symbol
      const mySymbol = moveData.playerSymbol === "X" ? "O" : "X";
      console.log("This is opponent's move - setting my symbol to:", mySymbol);
      this.gameStateService.setPlayerSymbol(mySymbol);
    }
    
    console.log("=== END PLAYER SYMBOL INIT ===");
  }

  // Check for game end conditions from move data
  checkGameEndFromMove(moveData) {
    const isGameEnded = 
      moveData.gameState === "ENDED" || 
      moveData.gameState === "FINISHED" || 
      moveData.gameResult !== "ONGOING";

    if (isGameEnded) {
      this.gameStateService.setGameStatus("ended");
      
      // Show appropriate game result message
      if (moveData.gameResult && moveData.gameResult !== "ONGOING") {
        this.showGameResult(moveData);
      }
    }
  }

  // Show game result message
  showGameResult(moveData) {
    switch (moveData.gameResult) {
      case "WIN":
        if (moveData.winnerId === this.currentUserId) {
          toast.success("🎉 Bạn đã thắng!");
        } else {
          toast.info("😔 Bạn đã thua!");
        }
        break;
      case "DRAW":
        toast.info("🤝 Game hòa!");
        break;
      case "SURRENDER":
        if (moveData.winnerId === this.currentUserId) {
          toast.success("🎉 Đối thủ đã đầu hàng - Bạn thắng!");
        } else {
          toast.info("😔 Bạn đã đầu hàng!");
        }
        break;
      default:
        toast.info(`Game kết thúc: ${moveData.gameResult}`);
    }
  }

  // Xử lý game end events
  handleGameEnd(endData) {
    console.log("Game end received:", endData);
    
    try {
      this.gameStateService.setGameStatus("ended");
      this.gameStateService.setMakingMove(false);

      if (endData.winner) {
        toast.success(`Người thắng: ${endData.winner}`);
      } else if (endData.result === "DRAW") {
        toast.info("Game hòa!");
      } else {
        toast.info("Game đã kết thúc!");
      }

      // Notify registered handlers
      this.gameEndHandlers.forEach(handler => {
        try {
          handler(endData);
        } catch (error) {
          console.error("Error in game end handler:", error);
        }
      });

    } catch (error) {
      console.error("Error processing game end:", error);
      toast.error("Lỗi xử lý kết thúc game!");
    }
  }

  // Xử lý chat messages
  handleChatMessage(chatMessage) {
    console.log("Chat message received:", chatMessage);
    
    try {
      // Parse the message data according to backend format
      let messageData = null;
      
      if (typeof chatMessage === 'string') {
        try {
          messageData = JSON.parse(chatMessage);
        } catch (e) {
          console.warn("Failed to parse chat message as JSON:", chatMessage);
          return;
        }
      } else {
        messageData = chatMessage;
      }

      // Extract sender and content based on backend response format
      let sender, content;
      
      if (messageData.data) {
        // Format: { data: { sender: "username", content: "message" } }
        sender = messageData.data.sender || messageData.data.senderName || "Anonymous";
        content = messageData.data.content || messageData.data.message || "";
      } else if (messageData.sender && messageData.content) {
        // Direct format: { sender: "username", content: "message" }
        sender = messageData.sender;
        content = messageData.content;
      } else if (messageData.senderName && messageData.content) {
        // Alternative format: { senderName: "username", content: "message" }
        sender = messageData.senderName;
        content = messageData.content;
      } else {
        console.warn("Unknown chat message format:", messageData);
        return;
      }

      // Ensure sender is always a string
      if (typeof sender === 'object') {
        sender = sender?.username || sender?.displayName || sender?.name || "Anonymous";
      }

      if (!content || !content.trim()) {
        console.warn("Empty chat message content:", messageData);
        return;
      }

      // Notify registered handlers with normalized data
      this.chatMessageHandlers.forEach(handler => {
        try {
          handler({ sender, content, timestamp: new Date() });
        } catch (error) {
          console.error("Error in chat message handler:", error);
        }
      });

    } catch (error) {
      console.error("Error processing chat message:", error);
    }
  }

  // Game action methods
  async markPlayerReady(roomId) {
    try {
      await markPlayerReady(roomId);
      this.gameStateService.setPlayerReady(true);
      toast.success("Bạn đã sẵn sàng!");
      return true;
    } catch (error) {
      console.error("Error marking ready:", error);
      toast.error("Đánh dấu sẵn sàng thất bại!");
      return false;
    }
  }

  async surrenderGame(roomId) {
    try {
      await surrenderGame(roomId);
      this.gameStateService.setGameStatus("ended");
      toast.info("Bạn đã đầu hàng!");
      return true;
    } catch (error) {
      console.error("Error surrendering:", error);
      toast.error("Đầu hàng thất bại!");
      return false;
    }
  }

  async requestRematch(roomId) {
    try {
      await requestRematch(roomId);
      toast.success("Yêu cầu tái đấu đã được gửi!");
      return true;
    } catch (error) {
      console.error("Error requesting rematch:", error);
      toast.error("Yêu cầu tái đấu thất bại!");
      return false;
    }
  }

  async acceptRematch(roomId) {
    try {
      await acceptRematch(roomId);
      this.gameStateService.resetGame();
      toast.success("Đã chấp nhận tái đấu!");
      return true;
    } catch (error) {
      console.error("Error accepting rematch:", error);
      toast.error("Chấp nhận tái đấu thất bại!");
      return false;
    }
  }

  async leaveRoom(roomId) {
    try {
      await leaveRoomWS(roomId);
      this.cleanup();
      toast.info("Bạn đã rời phòng!");
      return true;
    } catch (error) {
      console.error("Error leaving room:", error);
      toast.error("Rời phòng thất bại!");
      return false;
    }
  }

  async sendChatMessage(roomId, messageData) {
    try {
      if (!isWebSocketConnected()) {
        toast.warn("WebSocket chưa kết nối!");
        return false;
      }

      await sendChatMessage(roomId, messageData);
      return true;
    } catch (error) {
      console.error("Error sending chat:", error);
      toast.error("Gửi tin nhắn thất bại!");
      return false;
    }
  }

  // Cleanup subscriptions
  cleanup() {
    this.subscriptions.forEach((subscription, key) => {
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error(`Error unsubscribing from ${key}:`, error);
      }
    });
    
    this.subscriptions.clear();
    this.chatMessageHandlers.clear();
    this.roomUpdateHandlers.clear();
    this.gameMoveHandlers.clear();
    this.gameEndHandlers.clear();
  }

  // Get connection status
  isConnected() {
    return isWebSocketConnected();
  }
}

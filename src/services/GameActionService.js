import { toast } from "react-toastify";
import {
  makeMove as apiMakeMove,
  getCurrentBoard,
  getPlayerSymbol,
  getRoomInfo,
} from "./CaroGameService";
import { makeGameMoveWS, isWebSocketConnected } from "./WebSocketService";

/**
 * GameActionService - Single Responsibility: Xử lý các hành động game
 * Tuân thủ Strategy Pattern cho việc chọn API hoặc WebSocket
 */
export class GameActionService {
  constructor(gameStateService, webSocketEventHandler = null) {
    this.gameStateService = gameStateService;
    this.webSocketEventHandler = webSocketEventHandler;
    this.preferWebSocket = true; // Strategy: ưu tiên WebSocket
  }

  // Set WebSocket event handler (for delayed initialization)
  setWebSocketEventHandler(webSocketEventHandler) {
    this.webSocketEventHandler = webSocketEventHandler;
  }

  // Strategy Pattern: chọn method gửi move
  setMoveStrategy(useWebSocket = true) {
    this.preferWebSocket = useWebSocket;
  }

    // Template Method Pattern: quá trình thực hiện move
  async makeMove(roomId, row, col) {
    console.log(`makeMove called: row=${row}, col=${col}, roomId=${roomId}`);
    
    // Get current game state
    const gameState = this.gameStateService.getState();
    console.log('Current game state:', {
      gameStatus: gameState.gameStatus,
      playerSymbol: gameState.playerSymbol,
      currentTurn: gameState.currentTurn,
      isMakingMove: gameState.isMakingMove,
      boardCell: gameState.board[row]?.[col]
    });

    // Validation step
    const validation = this.gameStateService.validateMove(row, col);
    if (!validation.isValid) {
      console.warn("Move validation failed:", validation.reason);
      toast.warn(validation.reason);
      return { success: false, reason: validation.reason };
    }

    try {
      // Set making move flag to prevent double clicks (like in HTML)
      this.gameStateService.setMakingMove(true);
      console.log("Making move flag set to true");

      // Execute move based on strategy (prefer WebSocket like HTML)
      const result = await this.executeMoveStrategy(roomId, row, col);

      if (result.success) {
        // Don't update board locally - let WebSocket event handle it (like in HTML)
        // This prevents desync issues between clients
        console.log(`Move sent successfully: (${row}, ${col}) via ${result.method}`);
        return { success: true, data: result.data };
      } else {
        // Reset making move flag on failure
        this.gameStateService.setMakingMove(false);
        console.error("Move failed:", result.reason);
        return { success: false, reason: result.reason };
      }

    } catch (error) {
      // Reset making move flag on error
      this.gameStateService.setMakingMove(false);
      console.error("Move error:", error);
      return { success: false, reason: error.message };
    }
  }

  // Strategy implementation
  async executeMoveStrategy(roomId, row, col) {
    if (this.preferWebSocket && this.webSocketEventHandler.isConnected()) {
      return await this.executeMoveViaWebSocket(roomId, row, col);
    } else {
      return await this.executeMoveViaAPI(roomId, row, col);
    }
  }

  async executeMoveViaWebSocket(roomId, row, col) {
    try {
      console.log("=== SENDING WEBSOCKET MOVE ===");
      console.log(`Room ID: ${roomId}, Row: ${row}, Col: ${col}`);
      console.log("WebSocket connection status:", isWebSocketConnected());
      
      // OPTIMISTIC UPDATE: Update board immediately for better UX
      const currentState = this.gameStateService.getState();
      const playerSymbol = currentState.playerSymbol;
      
      console.log("=== OPTIMISTIC UPDATE ===");
      console.log("Player symbol:", playerSymbol);
      console.log("Updating board at position:", row, col);
      
      // Create optimistic board update
      const currentBoard = currentState.board;
      const optimisticBoard = currentBoard.map((boardRow, i) =>
        boardRow.map((cell, j) => {
          if (i === row && j === col) {
            return playerSymbol === "X" ? 1 : 2;
          }
          return cell;
        })
      );
      
      // Apply optimistic update
      this.gameStateService.setBoard(optimisticBoard);
      console.log("Optimistic board update applied");
      console.log("=== END OPTIMISTIC UPDATE ===");
      
      // Format according to backend API (same as HTML)
      const moveData = {
        xPosition: row,  // row is xPosition in backend
        yPosition: col,  // col is yPosition in backend
      };
      
      console.log("Move data being sent:", moveData);
      console.log("Destination topic:", `/app/game/${roomId}/move`);
      
      await makeGameMoveWS(roomId, moveData);
      
      console.log("WebSocket move sent successfully");
      console.log("Now waiting for server response...");
      
      // OPTIMISTIC TURN UPDATE: Switch turn immediately for better UX
      console.log("=== OPTIMISTIC TURN UPDATE ===");
      const nextTurn = playerSymbol === "X" ? "O" : "X";
      console.log("Current turn:", currentState.currentTurn);
      console.log("Next turn (optimistic):", nextTurn);
      this.gameStateService.setCurrentTurn(nextTurn);
      console.log("Optimistic turn update applied");
      console.log("=== END OPTIMISTIC TURN UPDATE ===");
      
      // Reset making move flag immediately after successful send for better UX
      // Server response will still update the state if needed
      console.log("=== IMMEDIATE FLAG RESET ===");
      console.log("Resetting makingMove flag immediately after successful send");
      this.gameStateService.setMakingMove(false);
      console.log("Flag reset for immediate next move capability");
      console.log("=== END IMMEDIATE FLAG RESET ===");
      
      // Add a shorter timeout fallback to reset flag if no response received
      // This prevents the flag from staying true indefinitely
      setTimeout(() => {
        const currentState = this.gameStateService.getState();
        if (currentState.isMakingMove) {
          console.warn("=== TIMEOUT FALLBACK: Resetting making move flag ===");
          console.warn("No WebSocket response received within 2 seconds");
          console.warn("This might happen if server doesn't echo back moves to sender");
          this.gameStateService.setMakingMove(false);
          console.warn("Flag reset by timeout fallback");
        }
      }, 2000); // Reduced to 2 second timeout
      
      console.log("==============================");
      
      return { 
        success: true, 
        message: "Move sent via WebSocket",
        method: "websocket" 
      };
    } catch (error) {
      console.error("=== WEBSOCKET MOVE SEND FAILED ===");
      console.error("Error details:", error);
      console.error("===============================");
      return { 
        success: false, 
        reason: "WebSocket move failed: " + error.message 
      };
    }
  }

  async executeMoveViaAPI(roomId, row, col) {
    try {
      const response = await apiMakeMove(roomId, { x: row, y: col }, false);
      
      console.log("Move sent successfully via REST API");
      return { 
        success: true, 
        data: response,
        message: "Move sent via API",
        method: "api" 
      };
    } catch (error) {
      console.error("API move failed:", error);
      return { 
        success: false, 
        reason: "API move failed: " + error.message 
      };
    }
  }

  // Update game state từ response của move
  updateGameStateFromMoveResponse(moveData) {
    if (!moveData) return;

    // Update board if provided
    if (moveData.board && this.gameStateService.validateBoard(moveData.board)) {
      this.gameStateService.setBoard(moveData.board);
    }

    // Update turn
    if (moveData.nextTurnPlayerId) {
      // Đảo ngược turn sau mỗi move
      const currentTurn = this.gameStateService.getState().currentTurn;
      const nextTurn = currentTurn === "X" ? "O" : "X";
      this.gameStateService.setCurrentTurn(nextTurn);
    }

    // Update game status
    if (moveData.gameState === "ENDED") {
      this.gameStateService.setGameStatus("ended");
      if (moveData.gameResult) {
        toast.info(`Trò chơi kết thúc: ${moveData.gameResult}`);
      }
    }

    // Validate move coordinates
    if (moveData.xPosition !== undefined && moveData.yPosition !== undefined) {
      console.log(`Move confirmed at (${moveData.xPosition}, ${moveData.yPosition})`);
    }

  // Stop making move flag
  this.gameStateService.setMakingMove(false);
}

// Ensure player symbol is set - call this when needed
async ensurePlayerSymbol(roomId) {
  const currentState = this.gameStateService.getState();
  if (!currentState.playerSymbol) {
    console.log("PlayerSymbol not set, fetching from server...");
    try {
      const symbol = await getPlayerSymbol(roomId);
      if (symbol) {
        console.log("Fetched player symbol:", symbol);
        this.gameStateService.setPlayerSymbol(symbol);
        return symbol;
      }
    } catch (error) {
      console.error("Failed to fetch player symbol:", error);
    }
  }
  return currentState.playerSymbol;
}

// HTML LOGIC: Get player symbol and set initial turn (like getPlayerSymbolAndSetTurn)
async getPlayerSymbolAndSetTurn(roomId) {
  console.log("=== GET PLAYER SYMBOL AND SET TURN ===");
  
  try {
    const symbol = await this.ensurePlayerSymbol(roomId);
    if (symbol) {
      // HTML LOGIC: X typically goes first
      const isMyTurn = (symbol === "X");
      const initialTurn = "X"; // X always goes first
      
      console.log("My symbol:", symbol);
      console.log("Initial turn calculation - X goes first:", initialTurn);
      console.log("Is my turn initially:", isMyTurn);
      
      this.gameStateService.setCurrentTurn(initialTurn);
      
      console.log("=== SYMBOL AND TURN SET ===");
      return { symbol, isMyTurn, currentTurn: initialTurn };
    }
  } catch (error) {
    console.error("Error in getPlayerSymbolAndSetTurn:", error);
  }
  
  return null;
}  // Load initial game data
  async loadInitialGameData(roomId) {
    try {
      console.log(`Loading initial game data for room ${roomId}`);

      // Force reset any pending move flags when loading initial data
      this.gameStateService.forceResetMakingMove();

      // Parallel fetch of game data
      const [boardData, playerSymbol, roomInfo] = await Promise.allSettled([
        getCurrentBoard(roomId),
        getPlayerSymbol(roomId),
        getRoomInfo(roomId),
      ]);

      // Process board data
      if (boardData.status === 'fulfilled' && boardData.value) {
        if (this.gameStateService.validateBoard(boardData.value)) {
          this.gameStateService.setBoard(boardData.value);
        } else {
          console.warn("Invalid board data received, using empty board");
          this.gameStateService.setBoard(this.gameStateService.createEmptyBoard());
        }
      } else {
        console.warn("Failed to fetch board data:", boardData.reason);
        this.gameStateService.setBoard(this.gameStateService.createEmptyBoard());
      }

      // Process player symbol
      if (playerSymbol.status === 'fulfilled' && playerSymbol.value) {
        console.log("=== PLAYER SYMBOL RESTORE ===");
        console.log("Fetched player symbol:", playerSymbol.value);
        this.gameStateService.setPlayerSymbol(playerSymbol.value);
        console.log("Player symbol set successfully");
        console.log("=== END PLAYER SYMBOL RESTORE ===");
      } else {
        console.warn("Failed to fetch player symbol:", playerSymbol.reason);
        console.log("Using fallback player symbol: X");
        this.gameStateService.setPlayerSymbol("X"); // Default fallback
      }

      // Process room info
      if (roomInfo.status === 'fulfilled' && roomInfo.value) {
        this.gameStateService.setRoomInfo(roomInfo.value);
        
        // Set game status based on room state
        const gameStatus = roomInfo.value.gameState === "IN_PROGRESS" ? "playing" : "waiting";
        this.gameStateService.setGameStatus(gameStatus);
        
        console.log("=== ROOM INFO RESTORE DEBUG ===");
        console.log("Room gameState:", roomInfo.value.gameState);
        console.log("Room status:", roomInfo.value.status);
        console.log("Setting gameStatus to:", gameStatus);
        console.log("Room players:", roomInfo.value.players);
        console.log("Room currentPlayerCount:", roomInfo.value.currentPlayerCount);
        console.log("Room maxPlayers:", roomInfo.value.maxPlayers);
        console.log("Room canMarkReady:", roomInfo.value.canMarkReady);
        console.log("Full room info:", roomInfo.value);

        // Set player ready status
        const user = this.gameStateService.getState().playerInfo;
        console.log("=== PLAYER READY STATUS DEBUG ===");
        console.log("Current user:", user);
        console.log("Room players:", roomInfo.value.players);
        
        if (user && roomInfo.value.players) {
          const playerInRoom = roomInfo.value.players.find(p => p.userId === user.id);
          console.log("Player found in room:", playerInRoom);
          console.log("Player ready status:", playerInRoom?.ready);
          
          // CRITICAL: For 2-step ready system, ensure ready state is correct
          let playerReady = playerInRoom?.ready || false;
          
          // If room is waiting for players and canMarkReady is false, keep ready false
          if (gameStatus === "waiting" && roomInfo.value.canMarkReady === false) {
            console.log("Room is waiting but canMarkReady=false, forcing ready=false");
            playerReady = false;
          }
          
          this.gameStateService.setPlayerReady(playerReady);
          console.log("Final set player ready to:", playerReady);
        } else {
          console.log("No user or no players in room, defaulting to not ready");
          this.gameStateService.setPlayerReady(false);
        }
        console.log("=== END PLAYER READY STATUS DEBUG ===");
        
        // CRITICAL: Initialize current turn if game is playing
        if (gameStatus === "playing") {
          console.log("Game is playing, initializing turn...");
          const currentState = this.gameStateService.getState();
          
          if (currentState.playerSymbol) {
            // HTML LOGIC: X goes first, so if I'm X, it's my turn initially
            const isMyTurnInitially = (currentState.playerSymbol === "X");
            
            if (isMyTurnInitially) {
              console.log("I am X, so it's my turn initially");
              this.gameStateService.setCurrentTurn("X");
            } else {
              console.log("I am O, X goes first, so checking board state...");
              
              // Check board state to determine actual current turn
              const board = currentState.board;
              let xCount = 0, oCount = 0;
              
              for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                  if (board[i][j] === 1) xCount++;
                  if (board[i][j] === 2) oCount++;
                }
              }
              
              // X goes first, so if equal counts, it's O's turn. If X has more, it's O's turn.
              const isXTurn = xCount === oCount;
              const currentTurn = isXTurn ? "X" : "O";
              
              console.log("Board analysis - X count:", xCount, "O count:", oCount);
              console.log("Calculated current turn:", currentTurn);
              
              this.gameStateService.setCurrentTurn(currentTurn);
            }
            
            console.log("My symbol:", currentState.playerSymbol);
            console.log("Final current turn:", this.gameStateService.getState().currentTurn);
          } else {
            console.warn("PlayerSymbol not set, cannot determine turn");
          }
        }
        
        console.log("=== END ROOM INFO RESTORE ===");
      } else {
        console.warn("Failed to fetch room info:", roomInfo.reason);
      }

      console.log("Initial game data loaded successfully");
      return true;

    } catch (error) {
      console.error("Failed to load initial game data:", error);
      toast.error("Không thể tải dữ liệu game ban đầu!");
      return false;
    }
  }

  // Refresh current board state
  async refreshBoard(roomId) {
    try {
      const boardData = await getCurrentBoard(roomId);
      if (this.gameStateService.validateBoard(boardData)) {
        this.gameStateService.setBoard(boardData);
        return true;
      } else {
        console.warn("Invalid board data received during refresh");
        return false;
      }
    } catch (error) {
      console.error("Failed to refresh board:", error);
      return false;
    }
  }

  // Sync game state with server
  async syncGameState(roomId) {
    try {
      console.log("Syncing game state with server...");
      
      const [roomInfo, boardData] = await Promise.allSettled([
        getRoomInfo(roomId),
        getCurrentBoard(roomId),
      ]);

      let syncSuccess = true;

      // Sync room info
      if (roomInfo.status === 'fulfilled') {
        this.gameStateService.setRoomInfo(roomInfo.value);
        
        const gameStatus = roomInfo.value.gameState === "IN_PROGRESS" ? "playing" : "waiting";
        this.gameStateService.setGameStatus(gameStatus);
      } else {
        console.warn("Failed to sync room info:", roomInfo.reason);
        syncSuccess = false;
      }

      // Sync board data
      if (boardData.status === 'fulfilled' && this.gameStateService.validateBoard(boardData.value)) {
        this.gameStateService.setBoard(boardData.value);
      } else {
        console.warn("Failed to sync board data:", boardData.reason?.message || boardData.reason);
        syncSuccess = false;
      }

      if (syncSuccess) {
        console.log("Game state synced successfully");
      } else {
        console.warn("Game state sync completed with warnings");
      }

      return syncSuccess;

    } catch (error) {
      console.error("Failed to sync game state:", error);
      return false;
    }
  }
}

/**
 * GameStateService - Single Responsibility: Quản lý trạng thái game
 * Tuân thủ Single Responsibility Principle
 */
export class GameStateService {
  constructor() {
    this.gameState = {
      roomId: null,
      board: this.createEmptyBoard(),
      playerSymbol: "",
      currentTurn: "X",
      gameStatus: "waiting",
      isPlayerReady: false,
      isMakingMove: false, // Always initialize as false
      playerInfo: null,
      roomInfo: null,
    };
    
    this.listeners = new Set();
    
    // Ensure making move flag is always false on initialization
    console.log("GameStateService initialized with isMakingMove:", this.gameState.isMakingMove);
  }

  // Factory method để tạo board trống
  createEmptyBoard() {
    return Array(15)
      .fill()
      .map(() => Array(15).fill(0));
  }

  // Observer pattern để thông báo thay đổi state
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners about state changes
  notifyListeners() {
    console.log("=== GameStateService: Notifying Listeners ===");
    console.log("Number of listeners:", this.listeners.size);
    console.log("Current game state:", JSON.stringify(this.gameState, null, 2));
    console.log("Current board state:", this.gameState.board);
    
    this.listeners.forEach((listener, index) => {
      try {
        console.log(`Calling listener ${index + 1}`);
        listener(this.gameState);
        console.log(`Listener ${index + 1} called successfully`);
      } catch (error) {
        console.error(`Error in listener ${index + 1}:`, error);
      }
    });
    
    console.log("=== End Listener Notifications ===");
  }

  // State setters với validation
  setRoomId(roomId) {
    if (typeof roomId !== 'string' && typeof roomId !== 'number') {
      throw new Error('Room ID must be string or number');
    }
    this.gameState.roomId = roomId;
    this.notifyListeners();
  }

  setBoard(board) {
    if (!this.validateBoard(board)) {
      throw new Error('Invalid board format');
    }
    // Create new object references for React change detection
    this.gameState = {
      ...this.gameState,
      board: board.map(row => [...row]) // Deep clone the board
    };
    this.notifyListeners();
  }

  // Update a single cell on the board
  updateBoard(row, col, playerSymbol) {
    if (row < 0 || row >= 15 || col < 0 || col >= 15) {
      throw new Error('Invalid board coordinates');
    }
    
    const cellValue = playerSymbol === "X" ? 1 : playerSymbol === "O" ? 2 : 0;
    
    // Create a new board array to maintain immutability
    const newBoard = this.gameState.board.map((boardRow, i) =>
      boardRow.map((cell, j) => {
        if (i === row && j === col) {
          return cellValue;
        }
        return cell;
      })
    );
    
    // Create new object references for React change detection
    this.gameState = {
      ...this.gameState,
      board: newBoard
    };
    this.notifyListeners();
  }

  setPlayerSymbol(symbol) {
    if (!['X', 'O', ''].includes(symbol)) {
      throw new Error('Invalid player symbol');
    }
    this.gameState = { ...this.gameState, playerSymbol: symbol };
    this.notifyListeners();
  }

  setCurrentTurn(turn) {
    if (!['X', 'O'].includes(turn)) {
      throw new Error('Invalid turn symbol');
    }
    this.gameState = { ...this.gameState, currentTurn: turn };
    this.notifyListeners();
  }

  setGameStatus(status) {
    const validStatuses = ['waiting', 'starting', 'playing', 'ended'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid game status');
    }
    this.gameState = { ...this.gameState, gameStatus: status };
    this.notifyListeners();
  }

  setPlayerReady(isReady) {
    this.gameState = { ...this.gameState, isPlayerReady: Boolean(isReady) };
    this.notifyListeners();
  }

  setMakingMove(isMaking) {
    console.log(`=== MAKING MOVE FLAG UPDATE ===`);
    console.log(`Previous value: ${this.gameState.isMakingMove}`);
    console.log(`New value: ${Boolean(isMaking)}`);
    
    this.gameState.isMakingMove = Boolean(isMaking);
    
    console.log(`Flag updated to: ${this.gameState.isMakingMove}`);
    console.log(`=== END FLAG UPDATE ===`);
    
    this.notifyListeners();
  }

  // Force reset making move flag (useful after refresh or errors)
  forceResetMakingMove() {
    console.log("=== FORCE RESETTING MAKING MOVE FLAG ===");
    console.log("Previous flag value:", this.gameState.isMakingMove);
    
    this.gameState.isMakingMove = false;
    
    console.log("Flag force reset to:", this.gameState.isMakingMove);
    console.log("=== END FORCE RESET ===");
    
    this.notifyListeners();
  }

  setPlayerInfo(playerInfo) {
    this.gameState.playerInfo = playerInfo;
    this.notifyListeners();
  }

  setRoomInfo(roomInfo) {
    this.gameState.roomInfo = roomInfo;
    this.notifyListeners();
  }

  // Validation methods
  validateBoard(board) {
    return (
      Array.isArray(board) &&
      board.length === 15 &&
      board.every(row => 
        Array.isArray(row) &&
        row.length === 15 &&
        row.every(cell => [0, 1, 2].includes(cell))
      )
    );
  }

  validateMove(row, col) {
    const { board, gameStatus, playerSymbol, currentTurn, isMakingMove } = this.gameState;
    
    return {
      isValid: (
        !isMakingMove &&
        gameStatus === "playing" &&
        playerSymbol === currentTurn &&
        board[row] &&
        board[row][col] === 0 &&
        row >= 0 &&
        row < 15 &&
        col >= 0 &&
        col < 15
      ),
      reason: this.getMoveValidationReason(row, col)
    };
  }

  getMoveValidationReason(row, col) {
    const { board, gameStatus, playerSymbol, currentTurn, isMakingMove } = this.gameState;
    
    if (isMakingMove) return "Đang xử lý nước đi trước đó...";
    if (gameStatus !== "playing") return "Game chưa bắt đầu hoặc đã kết thúc";
    if (playerSymbol !== currentTurn) return "Không phải lượt của bạn";
    if (row < 0 || row >= 15 || col < 0 || col >= 15) return "Vị trí không hợp lệ";
    if (board[row] && board[row][col] !== 0) return "Ô này đã có quân cờ";
    return "Nước đi hợp lệ";
  }

  // Utility methods
  getState() {
    return { ...this.gameState };
  }

  resetGame() {
    this.gameState = {
      ...this.gameState,
      board: this.createEmptyBoard(),
      gameStatus: "waiting",
      isPlayerReady: false,
      isMakingMove: false,
      currentTurn: "X",
    };
    this.notifyListeners();
  }

  resetToInitial() {
    this.gameState = {
      roomId: null,
      board: this.createEmptyBoard(),
      playerSymbol: "",
      currentTurn: "X",
      gameStatus: "waiting",
      isPlayerReady: false,
      isMakingMove: false,
      playerInfo: null,
      roomInfo: null,
    };
    this.notifyListeners();
  }

  // Optimistic update for moves
  makeOptimisticMove(row, col) {
    const { board, playerSymbol } = this.gameState;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = playerSymbol === "X" ? 1 : 2;
    
    this.setBoard(newBoard);
    this.setCurrentTurn(playerSymbol === "X" ? "O" : "X");
    this.setMakingMove(true);
    
    return newBoard;
  }

  // Revert optimistic update
  revertOptimisticMove(originalBoard, originalTurn) {
    this.setBoard(originalBoard);
    this.setCurrentTurn(originalTurn);
    this.setMakingMove(false);
  }
}

// Singleton instance
export const gameStateService = new GameStateService();

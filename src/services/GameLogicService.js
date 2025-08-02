// Game Logic Service
// Handles game moves, board state, and game rules
// Based on backend game logic and enums

import { ServiceConfig } from './ServiceConfig';
import { ServiceUtils } from './ServiceUtils';

class GameLogicService {
  constructor() {
    this.boardSize = ServiceConfig.GAME.BOARD_SIZE;
    this.winCondition = ServiceConfig.GAME.WIN_CONDITION;
  }

  /**
   * Create empty game board
   * @returns {Array} Empty board matrix
   */
  createEmptyBoard() {
    return Array(this.boardSize).fill(null).map(() => 
      Array(this.boardSize).fill(null)
    );
  }

  /**
   * Validate move coordinates
   * @param {number} row - Row coordinate (0-indexed)
   * @param {number} col - Column coordinate (0-indexed)
   * @param {Array} board - Current board state
   * @returns {boolean} True if move is valid
   */
  validateMove(row, col, board) {
    // Check bounds
    if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
      return false;
    }

    // Check if cell is empty
    if (board[row][col] !== null) {
      return false;
    }

    return true;
  }

  /**
   * Make a move on the board
   * @param {Array} board - Current board state
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @param {string} player - Player symbol ('X' or 'O')
   * @returns {Object} Updated board and move result
   */
  makeMove(board, row, col, player) {
    if (!this.validateMove(row, col, board)) {
      throw new Error('Invalid move');
    }

    // Create new board with the move
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;

    // Check for win condition
    const gameResult = this.checkGameResult(newBoard, row, col, player);

    return {
      board: newBoard,
      gameResult,
      lastMove: { row, col, player }
    };
  }

  /**
   * Check game result after a move
   * @param {Array} board - Current board state
   * @param {number} lastRow - Last move row
   * @param {number} lastCol - Last move column
   * @param {string} player - Player who made the last move
   * @returns {string} Game result from ServiceConfig.GAME_RESULT
   */
  checkGameResult(board, lastRow, lastCol, player) {
    // Check if the last move resulted in a win
    if (this.checkWinCondition(board, lastRow, lastCol, player)) {
      return player === 'X' ? ServiceConfig.GAME_RESULT.X_WIN : ServiceConfig.GAME_RESULT.O_WIN;
    }

    // Check for draw (board full)
    if (this.isBoardFull(board)) {
      return ServiceConfig.GAME_RESULT.DRAW;
    }

    return ServiceConfig.GAME_RESULT.ONGOING;
  }

  /**
   * Check if a player has won from the last move position
   * @param {Array} board - Current board state
   * @param {number} row - Last move row
   * @param {number} col - Last move column
   * @param {string} player - Player symbol
   * @returns {boolean} True if player has won
   */
  checkWinCondition(board, row, col, player) {
    // Directions: horizontal, vertical, diagonal1, diagonal2
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1]   // diagonal /
    ];

    for (const [dRow, dCol] of directions) {
      let count = 1; // Count the current move

      // Check in positive direction
      let r = row + dRow;
      let c = col + dCol;
      while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && board[r][c] === player) {
        count++;
        r += dRow;
        c += dCol;
      }

      // Check in negative direction
      r = row - dRow;
      c = col - dCol;
      while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && board[r][c] === player) {
        count++;
        r -= dRow;
        c -= dCol;
      }

      if (count >= this.winCondition) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if board is full (for draw condition)
   * @param {Array} board - Current board state
   * @returns {boolean} True if board is full
   */
  isBoardFull(board) {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get all possible moves
   * @param {Array} board - Current board state
   * @returns {Array} Array of {row, col} coordinates for valid moves
   */
  getPossibleMoves(board) {
    const moves = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] === null) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  }

  /**
   * Convert board position to display notation (A1, B2, etc.)
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {string} Display notation
   */
  positionToNotation(row, col) {
    const colLetter = String.fromCharCode(65 + col); // A, B, C, ...
    const rowNumber = row + 1; // 1, 2, 3, ...
    return `${colLetter}${rowNumber}`;
  }

  /**
   * Convert display notation to board position
   * @param {string} notation - Display notation (e.g., "A1")
   * @returns {Object} {row, col} coordinates
   */
  notationToPosition(notation) {
    if (!notation || notation.length < 2) {
      throw new Error('Invalid notation format');
    }

    const colLetter = notation.charAt(0).toUpperCase();
    const rowNumber = parseInt(notation.slice(1));

    const col = colLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, ...
    const row = rowNumber - 1; // 1=0, 2=1, 3=2, ...

    if (col < 0 || col >= this.boardSize || row < 0 || row >= this.boardSize) {
      throw new Error('Position out of bounds');
    }

    return { row, col };
  }

  /**
   * Get game statistics for a completed game
   * @param {Array} board - Final board state
   * @param {Array} moveHistory - History of moves
   * @returns {Object} Game statistics
   */
  getGameStats(board, moveHistory = []) {
    const totalMoves = moveHistory.length;
    const xMoves = moveHistory.filter(move => move.player === 'X').length;
    const oMoves = moveHistory.filter(move => move.player === 'O').length;

    return {
      totalMoves,
      xMoves,
      oMoves,
      boardFilled: this.isBoardFull(board),
      gameLength: moveHistory.length > 0 ? 
        ServiceUtils.getTimeDifferenceInMinutes(
          moveHistory[0].timestamp,
          moveHistory[moveHistory.length - 1].timestamp
        ) : 0
    };
  }

  /**
   * Create game state object for saving/loading
   * @param {Array} board - Current board state
   * @param {string} currentPlayer - Current player ('X' or 'O')
   * @param {Array} moveHistory - History of moves
   * @param {string} gameResult - Current game result
   * @returns {Object} Complete game state
   */
  createGameState(board, currentPlayer, moveHistory = [], gameResult = ServiceConfig.GAME_RESULT.ONGOING) {
    return {
      board,
      currentPlayer,
      moveHistory,
      gameResult,
      boardSize: this.boardSize,
      winCondition: this.winCondition,
      timestamp: new Date().toISOString(),
      stats: this.getGameStats(board, moveHistory)
    };
  }
}

// Export singleton instance
const gameLogicService = new GameLogicService();
export default gameLogicService;

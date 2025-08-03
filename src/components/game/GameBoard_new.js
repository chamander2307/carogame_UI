import React, { useState, useCallback, useEffect } from "react";
import GameStats from "./GameStats";
import "./GameBoard.css";

const BOARD_SIZE = 15;
const EMPTY = 0;
const PLAYER_X = 1;
const PLAYER_O = 2;

const GameBoard = () => {
  const [board, setBoard] = useState(() =>
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(EMPTY))
  );
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_X);
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && gameStatus === "playing") {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameStatus]);

  // Kiểm tra thắng thua
  const checkWin = useCallback((board, row, col, player) => {
    const directions = [
      [0, 1], // Ngang
      [1, 0], // Dọc
      [1, 1], // Chéo chính
      [1, -1], // Chéo phụ
    ];

    for (let [dx, dy] of directions) {
      let count = 1;
      let line = [[row, col]];

      // Kiểm tra về phía trước
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow >= 0 &&
          newRow < BOARD_SIZE &&
          newCol >= 0 &&
          newCol < BOARD_SIZE &&
          board[newRow][newCol] === player
        ) {
          count++;
          line.push([newRow, newCol]);
        } else {
          break;
        }
      }

      // Kiểm tra về phía sau
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow >= 0 &&
          newRow < BOARD_SIZE &&
          newCol >= 0 &&
          newCol < BOARD_SIZE &&
          board[newRow][newCol] === player
        ) {
          count++;
          line.unshift([newRow, newCol]);
        } else {
          break;
        }
      }

      if (count >= 5) {
        return line;
      }
    }
    return null;
  }, []);

  // Xử lý click vào ô
  const handleCellClick = useCallback(
    (row, col) => {
      if (board[row][col] !== EMPTY || gameStatus !== "playing") {
        return;
      }

      // Bắt đầu game nếu đây là nước đi đầu tiên
      if (!gameStarted) {
        setGameStarted(true);
      }

      const newBoard = board.map((row) => [...row]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);

      // Thêm vào lịch sử
      setMoveHistory((prev) => [...prev, { row, col, player: currentPlayer }]);

      // Kiểm tra thắng
      const winLine = checkWin(newBoard, row, col, currentPlayer);
      if (winLine) {
        setGameStatus("won");
        setWinner(currentPlayer);
        setWinningLine(winLine);
      } else {
        // Kiểm tra hòa
        const isBoardFull = newBoard.every((row) =>
          row.every((cell) => cell !== EMPTY)
        );
        if (isBoardFull) {
          setGameStatus("draw");
        } else {
          setCurrentPlayer(currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
        }
      }
    },
    [board, currentPlayer, gameStatus, checkWin, gameStarted]
  );

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(EMPTY))
    );
    setCurrentPlayer(PLAYER_X);
    setGameStatus("playing");
    setWinner(null);
    setWinningLine([]);
    setMoveHistory([]);
    setGameTime(0);
    setGameStarted(false);
  }, []);

  // Undo move
  const undoMove = useCallback(() => {
    if (moveHistory.length === 0 || gameStatus !== "playing") return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = board.map((row) => [...row]);
    newBoard[lastMove.row][lastMove.col] = EMPTY;

    setBoard(newBoard);
    setMoveHistory((prev) => prev.slice(0, -1));
    setCurrentPlayer(currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
  }, [board, currentPlayer, gameStatus, moveHistory]);

  // Kiểm tra ô có trong đường thắng không
  const isWinningCell = (row, col) => {
    return winningLine.some(([r, c]) => r === row && c === col);
  };

  const getPlayerSymbol = (player) => {
    if (player === PLAYER_X) return "×";
    if (player === PLAYER_O) return "○";
    return "";
  };

  const getPlayerName = (player) => {
    if (player === PLAYER_X) return "Người chơi X";
    if (player === PLAYER_O) return "Người chơi O";
    return "";
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Cờ Caro</h1>
        <div className="game-info">
          {gameStatus === "playing" && (
            <p className="current-player">
              Lượt của:{" "}
              <span
                className={`player-${currentPlayer === PLAYER_X ? "x" : "o"}`}
              >
                {getPlayerName(currentPlayer)}
              </span>
            </p>
          )}
          {gameStatus === "won" && (
            <p className="game-result winner">
              {getPlayerName(winner)} đã thắng!
            </p>
          )}
          {gameStatus === "draw" && (
            <p className="game-result draw">Trận đấu hòa!</p>
          )}
        </div>
      </div>

      <div className="game-content">
        <div className="game-controls">
          <button onClick={resetGame} className="btn btn-primary">
            🔄 Chơi lại
          </button>
          <button
            onClick={undoMove}
            className="btn btn-secondary"
            disabled={moveHistory.length === 0 || gameStatus !== "playing"}
          >
            ↶ Hoàn tác
          </button>
        </div>

        <div className="game-main">
          <div className="board-container">
            <div className="board">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${
                      cell !== EMPTY
                        ? `player-${cell === PLAYER_X ? "x" : "o"}`
                        : ""
                    } ${isWinningCell(rowIndex, colIndex) ? "winning" : ""}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {getPlayerSymbol(cell)}
                  </div>
                ))
              )}
            </div>
          </div>

          <GameStats
            currentPlayer={currentPlayer}
            moveHistory={moveHistory}
            gameStatus={gameStatus}
            winner={winner}
            gameTime={gameTime}
            playerXName="Người chơi X"
            playerOName="Người chơi O"
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;

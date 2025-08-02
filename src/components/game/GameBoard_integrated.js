import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { GameRoomService, GameWebSocketService } from "../../services";
import { toast } from "react-toastify";
import "./GameBoard.css";

const BOARD_SIZE = 15;
const EMPTY = null;
const PLAYER_X = "black";
const PLAYER_O = "white";

const GameBoard = () => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);

  // Game state
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(EMPTY))
  );
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_X);
  const [gameStatus, setGameStatus] = useState("waiting"); // waiting, playing, won, draw
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Room and player state
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Load initial data and setup WebSocket
  useEffect(() => {
    if (roomId && user) {
      loadGameState();
      setupWebSocketConnection();
    }

    return () => {
      // Cleanup WebSocket when component unmounts
      if (roomId) {
        GameWebSocketService.unsubscribeFromRoom(roomId);
      }
    };
  }, [roomId, user]);

  const loadGameState = async () => {
    try {
      // Load room details
      const roomResponse = await GameRoomService.getRoomDetails(roomId);
      if (roomResponse.success && roomResponse.data) {
        setRoomData(roomResponse.data);
        setPlayers(roomResponse.data.players || []);

        // Check if game is in progress
        if (roomResponse.data.gameId) {
          const gameResponse = await GameRoomService.getRoomDetail(
            roomResponse.data.gameId
          );
          if (gameResponse.success && gameResponse.data) {
            loadGameFromData(gameResponse.data);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
      toast.error("Không thể tải trạng thái game");
    }
  };

  const loadGameFromData = (game) => {
    try {
      // Update board state from game data
      if (game.moves && game.moves.length > 0) {
        const newBoard = Array(BOARD_SIZE)
          .fill(null)
          .map(() => Array(BOARD_SIZE).fill(EMPTY));
        game.moves.forEach((move, index) => {
          const playerSymbol = index % 2 === 0 ? PLAYER_X : PLAYER_O;
          newBoard[move.row][move.col] = playerSymbol;
        });
        setBoard(newBoard);
        setMoveHistory(game.moves);
        setCurrentPlayer(game.moves.length % 2 === 0 ? PLAYER_X : PLAYER_O);
      }

      if (game.status === "FINISHED") {
        setGameStatus("won");
        setWinner(game.winnerId);
      } else if (game.status === "IN_PROGRESS") {
        setGameStatus("playing");
        setGameStarted(true);
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
  };

  const setupWebSocketConnection = () => {
    GameWebSocketService.subscribeToRoom(roomId, {
      onRoomUpdate: (message) => {
        console.log("Room update:", message);
        handleRoomUpdate(message);
      },
      onChatMessage: (message) => {
        console.log("Chat message:", message);
        setChatMessages((prev) => [...prev, message]);
      },
      onGameMove: (move) => {
        console.log("Game move:", move);
        handleOpponentMove(move);
      },
      onNotification: (notification) => {
        console.log("Notification:", notification);
        toast.info(notification.message);
      },
    });
  };

  const handleRoomUpdate = (message) => {
    switch (message.updateType) {
      case "PLAYER_JOINED":
        loadRoomDetails();
        break;
      case "PLAYER_LEFT":
        loadRoomDetails();
        break;
      case "GAME_STARTED":
        setGameStatus("playing");
        setGameStarted(true);
        break;
      case "GAME_ENDED":
        setGameStatus("won");
        break;
      default:
        break;
    }
  };

  const loadRoomDetails = async () => {
    try {
      const response = await GameRoomService.getRoomDetails(roomId);
      if (response.success && response.data) {
        setRoomData(response.data);
        setPlayers(response.data.players || []);
      }
    } catch (error) {
      console.error("Failed to reload room details:", error);
    }
  };

  const handleOpponentMove = (move) => {
    if (move.playerId !== user.id) {
      makeMove(move.row, move.col, false); // false = don't send to server
    }
  };

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
    async (row, col) => {
      if (board[row][col] !== EMPTY || gameStatus !== "playing") {
        return;
      }

      // Check if it's player's turn
      const playerIndex = players.findIndex((p) => p.id === user.id);
      const isPlayerTurn = moveHistory.length % 2 === playerIndex;

      if (!isPlayerTurn) {
        toast.warning("Chưa đến lượt của bạn!");
        return;
      }

      try {
        // Send move through WebSocket
        await GameWebSocketService.makeMove(roomId, row, col);

        // Local move will be handled by WebSocket response
      } catch (error) {
        console.error("Failed to make move:", error);
        toast.error("Không thể thực hiện nước đi");
      }
    },
    [board, gameStatus, roomId, players, user.id, moveHistory]
  );

  // Make move (called from WebSocket or local)
  const makeMove = useCallback(
    (row, col, sendToServer = true) => {
      if (board[row][col] !== EMPTY || gameStatus !== "playing") {
        return;
      }

      // Bắt đầu game nếu đây là nước đi đầu tiên
      if (!gameStarted) {
        setGameStarted(true);
      }

      const newBoard = board.map((row) => [...row]);
      const movePlayer = moveHistory.length % 2 === 0 ? PLAYER_X : PLAYER_O;
      newBoard[row][col] = movePlayer;
      setBoard(newBoard);

      // Thêm vào lịch sử
      const newMove = { row, col, player: movePlayer };
      setMoveHistory((prev) => [...prev, newMove]);

      // Kiểm tra thắng
      const winLine = checkWin(newBoard, row, col, movePlayer);
      if (winLine) {
        setGameStatus("won");
        setWinner(movePlayer);
        setWinningLine(winLine);

        // Send game end to server
        if (sendToServer && GameWebSocketService.isConnected()) {
          GameWebSocketService.endGame(roomId, "WIN", user.id);
        }
      } else {
        // Kiểm tra hòa
        const isBoardFull = newBoard.every((row) =>
          row.every((cell) => cell !== EMPTY)
        );
        if (isBoardFull) {
          setGameStatus("draw");

          // Send game end to server
          if (sendToServer && GameWebSocketService.isConnected()) {
            GameWebSocketService.endGame(roomId, "DRAW", null);
          }
        } else {
          setCurrentPlayer(movePlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
        }
      }
    },
    [board, gameStatus, checkWin, gameStarted, moveHistory, roomId, user.id]
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

  // Chat functions
  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await GameWebSocketService.sendChatMessage(roomId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send chat message:", error);
      toast.error("Không thể gửi tin nhắn");
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Leave game
  const handleLeaveGame = async () => {
    if (window.confirm("Bạn có chắc chắn muốn rời khỏi phòng?")) {
      try {
        await GameRoomService.leaveRoom(roomId);
        GameWebSocketService.unsubscribeFromRoom(roomId);
        // Navigate back to lobby or dashboard
        window.history.back();
      } catch (error) {
        console.error("Failed to leave room:", error);
        toast.error("Không thể rời khỏi phòng");
      }
    }
  };

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
        <div className="room-info">
          <h1>Phòng: {roomData?.name || roomId}</h1>
          <div className="players-info">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`player-info ${
                  player.id === user.id ? "current-user" : ""
                }`}
              >
                <span className="player-symbol">{index === 0 ? "×" : "○"}</span>
                <span className="player-name">{player.name}</span>
                {player.id === user.id && (
                  <span className="you-badge">(Bạn)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="game-controls">
          <button className="control-btn leave-btn" onClick={handleLeaveGame}>
            Rời phòng
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className="game-left">
          <div className="game-info">
            <div className="current-turn">
              {gameStatus === "playing" && (
                <>
                  <span>Lượt: </span>
                  <span className={`player ${currentPlayer}`}>
                    {getPlayerSymbol(currentPlayer)}{" "}
                    {getPlayerName(currentPlayer)}
                  </span>
                </>
              )}
              {gameStatus === "won" && (
                <span className="winner">
                  🎉 {getPlayerName(winner)} thắng!
                </span>
              )}
              {gameStatus === "draw" && <span className="draw">🤝 Hòa!</span>}
            </div>

            <div className="game-timer">
              ⏱️ {Math.floor(gameTime / 60)}:
              {(gameTime % 60).toString().padStart(2, "0")}
            </div>

            <div className="move-counter">
              📊 Số nước đi: {moveHistory.length}
            </div>
          </div>

          <div className="game-board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`board-cell ${
                      cell !== EMPTY ? `occupied ${cell}` : ""
                    } ${isWinningCell(rowIndex, colIndex) ? "winning" : ""}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {getPlayerSymbol(cell)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="game-actions">
            <button
              className="action-btn"
              onClick={resetGame}
              disabled={gameStatus === "playing"}
            >
              🔄 Chơi lại
            </button>
            <button
              className="action-btn"
              onClick={undoMove}
              disabled={moveHistory.length === 0 || gameStatus !== "playing"}
            >
              ⏪ Hoàn tác
            </button>
          </div>
        </div>

        <div className="game-right">
          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-header">
              <h3>💬 Trò chuyện</h3>
            </div>

            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    message.senderId === user.id
                      ? "own-message"
                      : "other-message"
                  }`}
                >
                  <div className="message-sender">{message.senderName}</div>
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Nhập tin nhắn..."
                className="message-input"
              />
              <button
                onClick={sendChatMessage}
                className="send-btn"
                disabled={!newMessage.trim()}
              >
                Gửi
              </button>
            </div>
          </div>

          {/* Move History */}
          <div className="move-history">
            <h3>📋 Lịch sử nước đi</h3>
            <div className="history-list">
              {moveHistory.map((move, index) => (
                <div key={index} className="history-item">
                  <span className="move-number">{index + 1}.</span>
                  <span className={`move-player ${move.player}`}>
                    {getPlayerSymbol(move.player)}
                  </span>
                  <span className="move-position">
                    ({String.fromCharCode(65 + move.col)}
                    {move.row + 1})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;

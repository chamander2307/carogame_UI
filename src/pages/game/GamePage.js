import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import {
  initializeWebSocket,
  isWebSocketConnected,
  joinRoomWS,
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
  makeGameMoveWS,
} from "../../services/WebSocketService";
import {
  makeMove,
  getCurrentBoard,
  getPlayerSymbol,
  getRoomInfo,
} from "../../services/CaroGameService";
import { toast } from "react-toastify";
import "./index.css";

const GamePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Core game state
  const [roomId, setRoomId] = useState(null);
  const [board, setBoard] = useState(
    Array(15)
      .fill()
      .map(() => Array(15).fill(0))
  );
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [currentTurn, setCurrentTurn] = useState("X");
  const [gameStatus, setGameStatus] = useState("waiting");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isMakingMove, setIsMakingMove] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Extract roomId from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdFromUrl = params.get("roomId");

    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    } else {
      console.error("No room ID found. Redirecting to lobby.");
      toast.error("Không tìm thấy ID phòng. Chuyển hướng về lobby!");
      navigate("/lobby");
    }
  }, [location, navigate]);

  // Monitor WebSocket connection
  useEffect(() => {
    const checkConnection = setInterval(() => {
      setWsConnected(isWebSocketConnected());
    }, 1000);
    return () => clearInterval(checkConnection);
  }, []);

  // Initialize game and WebSocket subscriptions
  useEffect(() => {
    if (!roomId || !user) return;

    const initGame = async () => {
      try {
        setIsConnecting(true);
        // Initialize WebSocket
        await initializeWebSocket();
        setWsConnected(true);
        setIsConnecting(false);

        // Join room
        await joinRoomWS(roomId);

        // Fetch initial game data
        try {
          const [boardData, symbol, roomInfo] = await Promise.all([
            getCurrentBoard(roomId).catch(() =>
              Array(15)
                .fill()
                .map(() => Array(15).fill(0))
            ),
            getPlayerSymbol(roomId).catch(() => "X"),
            getRoomInfo(roomId),
          ]);

          // Validate board data
          if (
            !boardData ||
            boardData.length !== 15 ||
            boardData[0].length !== 15
          ) {
            console.error("Invalid board size received:", boardData);
            toast.error("Dữ liệu bàn cờ không hợp lệ!");
            setBoard(
              Array(15)
                .fill()
                .map(() => Array(15).fill(0))
            );
          } else {
            setBoard(boardData);
          }

          setPlayerSymbol(symbol);
          setGameStatus(
            roomInfo.gameState === "IN_PROGRESS" ? "playing" : "waiting"
          );
          setIsPlayerReady(
            roomInfo.players?.some((p) => p.userId === user.id && p.ready) ||
              false
          );
        } catch (error) {
          console.error("Initial data fetch failed:", error);
          toast.error("Không thể tải dữ liệu game ban đầu.");
        }

        // Set up WebSocket subscriptions
        const roomSub = await subscribeToRoomUpdates(
          roomId,
          async (message) => {
            try {
              if (message.updateType === "GAME_STARTED") {
                // Fetch critical game data on game start
                try {
                  const [boardData, symbol, roomInfo] = await Promise.all([
                    getCurrentBoard(roomId).catch(() =>
                      Array(15)
                        .fill()
                        .map(() => Array(15).fill(0))
                    ),
                    getPlayerSymbol(roomId).catch(() => playerSymbol || "X"),
                    getRoomInfo(roomId).catch(() => ({})),
                  ]);

                  if (
                    boardData &&
                    boardData.length === 15 &&
                    boardData[0].length === 15
                  ) {
                    setBoard(boardData);
                  } else {
                    console.error(
                      "Invalid board size on game start:",
                      boardData
                    );
                    setBoard(
                      message.board &&
                        message.board.length === 15 &&
                        message.board[0].length === 15
                        ? message.board
                        : Array(15)
                            .fill()
                            .map(() => Array(15).fill(0))
                    );
                  }

                  setPlayerSymbol(symbol);
                  setGameStatus("playing");
                  setCurrentTurn(message.currentTurn || "X");
                  setIsPlayerReady(
                    roomInfo.players?.some(
                      (p) => p.userId === user.id && p.ready
                    ) || true
                  );
                  toast.success("Trò chơi đã bắt đầu!");
                } catch (error) {
                  console.error("Failed to fetch game data on start:", error);
                  toast.error("Không thể tải dữ liệu game. Vui lòng thử lại!");
                }
              } else if (message.updateType === "PLAYER_READY") {
                setIsPlayerReady(
                  message.playerId === user.id || message.readyCount > 0
                );
                if (message.readyCount === 2) {
                  setGameStatus("starting");
                  setTimeout(() => setGameStatus("playing"), 1000);
                }
              } else if (message.updateType === "GAME_ENDED") {
                setGameStatus("ended");
                toast.info(
                  `Trò chơi đã kết thúc: ${message.outcome || "Không xác định"}`
                );
              }
              if (message.currentTurn) {
                setCurrentTurn(message.currentTurn);
              }
            } catch (error) {
              console.error("Error processing room update:", error);
              toast.error("Lỗi xử lý cập nhật phòng!");
            }
          }
        );

        const moveSub = await subscribeToGameMoves(roomId, (move) => {
          try {
            if (move.xPosition !== undefined && move.yPosition !== undefined) {
              const {
                xPosition,
                yPosition,
                playerSymbol: moveSymbol,
                board: newBoard,
              } = move;
              if (
                newBoard &&
                newBoard.length === 15 &&
                newBoard[0].length === 15
              ) {
                setBoard(newBoard);
              } else {
                // Fallback to updating board locally if server board is invalid
                setBoard((prevBoard) =>
                  prevBoard.map((row, i) =>
                    row.map((cell, j) =>
                      i === xPosition && j === yPosition
                        ? moveSymbol === "X"
                          ? 1
                          : 2
                        : cell
                    )
                  )
                );
              }
              setCurrentTurn(
                move.nextTurnPlayerId
                  ? move.moveNumber % 2 === 0
                    ? "O"
                    : "X"
                  : moveSymbol === "X"
                  ? "O"
                  : "X"
              );
            } else {
              console.error("Invalid move data:", move);
              toast.error("Dữ liệu nước đi không hợp lệ!");
            }
          } catch (error) {
            console.error("Error processing move:", error);
            toast.error("Lỗi xử lý nước đi!");
          }
        });

        const endSub = await subscribeToGameEnd(roomId, (result) => {
          try {
            setGameStatus("ended");
            toast.info(
              `Trò chơi kết thúc: ${result.outcome || "Không xác định"}`
            );
          } catch (error) {
            console.error("Error processing game end:", error);
            toast.error("Lỗi xử lý kết thúc game!");
          }
        });

        const chatSub = await subscribeToRoomChat(roomId, (message) => {
          try {
            setChatMessages((prev) => [...prev, message]);
          } catch (error) {
            console.error("Error processing chat message:", error);
            toast.error("Lỗi xử lý tin nhắn chat!");
          }
        });

        setSubscriptions([roomSub, moveSub, endSub, chatSub]);
      } catch (error) {
        console.error("Game initialization failed:", error);
        setWsConnected(false);
        setIsConnecting(false);
        toast.error("Không thể khởi tạo game. Vui lòng thử lại!");
      }
    };

    initGame();

    return () => {
      subscriptions.forEach((sub) => sub?.unsubscribe?.());
      leaveRoomWS(roomId).catch((error) =>
        console.error("Error leaving room:", error)
      );
    };
  }, [roomId, user]);

  // Handle player move
  const handleMove = useCallback(
    async (row, col) => {
      if (
        isMakingMove ||
        gameStatus !== "playing" ||
        playerSymbol !== currentTurn ||
        board[row][col] !== 0 ||
        row < 0 ||
        row >= 15 ||
        col < 0 ||
        col >= 15
      ) {
        toast.warn("Nước đi không hợp lệ!");
        return;
      }

      setIsMakingMove(true);
      try {
        // Optimistic update
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = playerSymbol === "X" ? 1 : 2;
        setBoard(newBoard);
        setCurrentTurn(playerSymbol === "X" ? "O" : "X");

        const response = await makeMove(roomId, { x: row, y: col }, true);
        // Validate server response
        if (
          response.board &&
          response.board.length === 15 &&
          response.board[0].length === 15
        ) {
          setBoard(response.board);
        } else {
          console.error("Invalid board size in move response:", response.board);
          toast.warn("Dữ liệu bàn cờ từ server không hợp lệ");
        }
        if (response.xPosition !== row || response.yPosition !== col) {
          console.error("Move coordinates mismatch:", response);
          toast.warn("Tọa độ nước đi không khớp");
        }
        if (response.gameState === "ENDED") {
          setGameStatus("ended");
          toast.info(
            `Trò chơi kết thúc: ${response.gameResult || "Không xác định"}`
          );
        }
      } catch (error) {
        console.error("Move failed:", error);
        // Revert optimistic update instead of making another API call
        const revertedBoard = board.map((r) => [...r]);
        revertedBoard[row][col] = 0; // Revert the move
        setBoard(revertedBoard);
        setCurrentTurn(playerSymbol); // Revert turn
        toast.error("Nước đi thất bại!");
      } finally {
        setIsMakingMove(false);
      }
    },
    [board, gameStatus, playerSymbol, currentTurn, roomId, isMakingMove]
  );

  // Handle sending chat message
  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || !isWebSocketConnected()) {
      toast.warn("Vui lòng nhập tin nhắn và kiểm tra kết nối!");
      return;
    }
    try {
      await sendChatMessage(roomId, {
        content: chatInput,
        sender: user?.username || "Anonymous",
      });
      setChatInput("");
    } catch (error) {
      console.error("Error sending chat:", error);
      toast.error("Gửi tin nhắn thất bại!");
    }
  }, [chatInput, roomId, user]);

  // Handle marking player ready
  const handleMarkReady = async () => {
    try {
      await markPlayerReady(roomId);
      setIsPlayerReady(true);
      toast.success("Bạn đã sẵn sàng!");
    } catch (error) {
      console.error("Error marking ready:", error);
      toast.error("Đánh dấu sẵn sàng thất bại!");
    }
  };

  // Handle surrendering the game
  const handleSurrender = async () => {
    try {
      await surrenderGame(roomId);
      setGameStatus("ended");
      toast.info("Bạn đã đầu hàng!");
      navigate("/lobby");
    } catch (error) {
      console.error("Error surrendering:", error);
      toast.error("Đầu hàng thất bại!");
    }
  };

  // Handle rematch request
  const handleRequestRematch = async () => {
    try {
      await requestRematch(roomId);
      toast.success("Yêu cầu tái đấu đã được gửi!");
    } catch (error) {
      console.error("Error requesting rematch:", error);
      toast.error("Yêu cầu tái đấu thất bại!");
    }
  };

  // Handle accepting rematch
  const handleAcceptRematch = async () => {
    try {
      await acceptRematch(roomId);
      setGameStatus("waiting");
      setBoard(
        Array(15)
          .fill()
          .map(() => Array(15).fill(0))
      );
      setIsPlayerReady(false);
      toast.success("Đã chấp nhận tái đấu!");
    } catch (error) {
      console.error("Error accepting rematch:", error);
      toast.error("Chấp nhận tái đấu thất bại!");
    }
  };

  // Handle leaving room
  const handleLeaveRoom = async () => {
    try {
      await leaveRoomWS(roomId);
      toast.info("Bạn đã rời phòng!");
      navigate("/lobby");
    } catch (error) {
      console.error("Error leaving room:", error);
      toast.error("Rời phòng thất bại!");
    }
  };

  // Render game board
  const renderBoard = () => {
    return (
      <div className="game-board">
        {Array.from({ length: 15 }).map((_, row) => (
          <div key={row} className="board-row">
            {Array.from({ length: 15 }).map((_, col) => (
              <div
                key={`${row}-${col}`}
                className={`board-cell ${board[row][col] ? "filled" : ""} ${
                  gameStatus === "playing" &&
                  !isMakingMove &&
                  board[row][col] === 0 &&
                  playerSymbol === currentTurn
                    ? "hoverable"
                    : ""
                } ${isMakingMove ? "disabled" : ""}`}
                onClick={() => handleMove(row, col)}
                style={{
                  cursor:
                    isMakingMove ||
                    gameStatus !== "playing" ||
                    board[row][col] !== 0 ||
                    playerSymbol !== currentTurn
                      ? "default"
                      : "pointer",
                  opacity: isMakingMove ? 0.6 : 1,
                }}
              >
                {board[row][col] === 1 ? "X" : board[row][col] === 2 ? "O" : ""}
              </div>
            ))}
          </div>
        ))}
        {isMakingMove && (
          <div
            className="making-move-overlay"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              zIndex: 1000,
            }}
          >
            Đang xử lý nước đi...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-page">
      <div className="game-container">
        {/* Left Panel: Game Controls */}
        <div className="left-panel panel">
          <div className="form-section">
            <h3>🔗 Kết nối</h3>
            <div className="status-display">Phòng: #{roomId || "N/A"}</div>
            <div className="status-display">
              Người chơi: {user?.username || "Anonymous"}
            </div>
            <div
              className={`status-display ${
                wsConnected ? "status-connected" : "status-disconnected"
              }`}
            >
              WebSocket:{" "}
              {wsConnected
                ? "Connected"
                : isConnecting
                ? "Connecting..."
                : "Disconnected"}
            </div>
          </div>
          <div className="form-section">
            <h3>🎮 Điều khiển Game</h3>
            {gameStatus === "waiting" && !isPlayerReady && (
              <button
                className="btn-ready btn-success"
                onClick={handleMarkReady}
                disabled={isConnecting}
              >
                ✅ Đánh dấu sẵn sàng
              </button>
            )}
            {gameStatus === "waiting" && isPlayerReady && (
              <div className="status-ready">
                Bạn đã sẵn sàng! Đang chờ đối thủ...
              </div>
            )}
            {gameStatus === "starting" && (
              <div className="status-starting">Trò chơi đang bắt đầu...</div>
            )}
            {gameStatus === "playing" && (
              <button
                className="btn-surrender btn-danger"
                onClick={handleSurrender}
              >
                🏳️ Đầu hàng
              </button>
            )}
            {gameStatus === "ended" && (
              <>
                <button
                  className="btn-new-game btn-success"
                  onClick={handleRequestRematch}
                >
                  🔄 Yêu cầu tái đấu
                </button>
                <button
                  className="btn-accept btn-success"
                  onClick={handleAcceptRematch}
                >
                  ✅ Chấp nhận tái đấu
                </button>
              </>
            )}
            <button className="btn-leave btn-warning" onClick={handleLeaveRoom}>
              🚪 Thoát phòng
            </button>
          </div>
          <div className="form-section">
            <h3>👥 Trạng thái người chơi</h3>
            <div className="player-status">
              <div
                className={`player-card ${
                  playerSymbol === currentTurn ? "active" : ""
                }`}
              >
                <div>Bạn ({playerSymbol || "?"})</div>
                <div>{isPlayerReady ? "Sẵn sàng" : "Chưa sẵn sàng"}</div>
              </div>
              <div className="player-card">
                <div>Đối thủ</div>
                <div>
                  {gameStatus === "playing" && playerSymbol !== currentTurn
                    ? "Đang đi..."
                    : "Đang chờ..."}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Center Panel: Game Board */}
        <div className="center-panel panel">
          <div className="game-board-container">
            <div className="game-info-display">
              <h2>🎯 Caro Game - Room #{roomId}</h2>
              <p>
                Trạng thái:{" "}
                {gameStatus === "waiting"
                  ? "Đang chờ"
                  : gameStatus === "starting"
                  ? "Đang bắt đầu"
                  : gameStatus === "playing"
                  ? "Đang chơi"
                  : "Kết thúc"}
              </p>
              {gameStatus === "playing" && (
                <p>
                  Lượt: {playerSymbol === currentTurn ? "Của bạn" : "Đối thủ"}
                </p>
              )}
            </div>
            {renderBoard()}
          </div>
        </div>
        {/* Right Panel: Chat */}
        <div className="right-panel panel">
          <div className="form-section">
            <h3>💬 Game Chat ({chatMessages.length})</h3>
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.slice(-8).map((msg, index) => (
                  <div key={index} className="message">
                    <strong>{msg.sender}:</strong> {msg.content}
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div className="no-messages">Chưa có tin nhắn nào</div>
                )}
              </div>
              <div className="chat-input-container">
                <input
                  className="chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Nhập tin nhắn..."
                  disabled={gameStatus === "ended" || !user || !wsConnected}
                  maxLength={100}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSendChat}
                  disabled={
                    !chatInput.trim() ||
                    gameStatus === "ended" ||
                    !user ||
                    !wsConnected
                  }
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;

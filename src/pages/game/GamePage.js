import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useGameLogic } from "../../hooks/useGameLogic";
import { useChatManager } from "../../hooks/useChatManager";
import { toast } from "react-toastify";
import "./index.css";

const GamePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract roomId from URL
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdFromUrl = params.get("roomId");

    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    } else {
      toast.error("Room ID không hợp lệ!");
      navigate("/lobby");
    }
  }, [location, navigate]);

  // Initialize game logic with clean architecture
  const {
    gameState,
    wsConnected,
    isConnecting,
    connectionError,
    makeMove,
    markPlayerReady,
    surrenderGame,
    requestRematch,
    acceptRematch,
    leaveRoom,
    webSocketEventHandler,
  } = useGameLogic(roomId, user);

  // Initialize chat manager
  const {
    chatMessages,
    chatInput,
    setChatInput,
    sendChatMessage: sendChat,
  } = useChatManager(webSocketEventHandler);

  // Show connection error if any
  useEffect(() => {
    if (connectionError) {
      toast.error(connectionError);
    }
  }, [connectionError]);

  // Debug game state on every render - CRITICAL for debugging real-time updates
  useEffect(() => {
    console.log("=== GAMEPAGE STATE UPDATE ===");
    console.log("Game Status:", gameState.gameStatus);
    console.log("Player Symbol:", gameState.playerSymbol);
    console.log("Current Turn:", gameState.currentTurn);
    console.log("Board moves count:", gameState.board.flat().filter(cell => cell !== 0).length);
    console.log("React render timestamp:", Date.now());
    console.log("=== END GAMEPAGE UPDATE ===");
  }); // No dependency array - logs every render

  // Debug game state on every render - CRITICAL for debugging real-time updates
  useEffect(() => {
    console.log("=== GAMEPAGE STATE UPDATE ===");
    console.log("Game Status:", gameState.gameStatus);
    console.log("Player Symbol:", gameState.playerSymbol);
    console.log("Current Turn:", gameState.currentTurn);
    console.log("Board moves count:", gameState.board.flat().filter(cell => cell !== 0).length);
    console.log("React render timestamp:", Date.now());
    console.log("=== END GAMEPAGE UPDATE ===");
  }); // No dependency array - logs every render

  // Handle player move with clean error handling

  const handleMove = async (row, col) => {
    console.log("=== CELL CLICK DEBUG ===");
    console.log("Cell clicked:", row, col);
    console.log("Current game state:", gameState);
    console.log("PlayerSymbol:", gameState.playerSymbol);
    console.log("CurrentTurn:", gameState.currentTurn);
    console.log("GameStatus:", gameState.gameStatus);
    console.log("Is my turn check:", gameState.playerSymbol === gameState.currentTurn);
    console.log("HTML LOGIC CHECK:");
    console.log("- My symbol:", gameState.playerSymbol);
    console.log("- Current turn:", gameState.currentTurn);
    console.log("- Should be my turn:", gameState.playerSymbol === gameState.currentTurn);
    console.log("Cell empty check:", gameState.board[row]?.[col] === 0);
    console.log("Making move flag:", gameState.isMakingMove);
    console.log("========================");
    
    if (gameState.gameStatus !== "playing") {
      console.warn("Move rejected: game not playing");
      toast.warn("Game chưa bắt đầu hoặc đã kết thúc!");
      return;
    }
    
    if (gameState.playerSymbol !== gameState.currentTurn) {
      console.warn("Move rejected: not your turn");
      toast.warn("Không phải lượt của bạn!");
      return;
    }
    
    if (gameState.board[row]?.[col] !== 0) {
      console.warn("Move rejected: cell not empty");
      toast.warn("Ô này đã có quân cờ!");
      return;
    }

    try {
      console.log(`Attempting to make move at (${row}, ${col})`);
      const result = await makeMove(row, col);
      
      if (result.success) {
        console.log("Move successful:", result);
      } else {
        console.warn("Move failed:", result.reason);
        toast.warn(result.reason);
      }
    } catch (error) {
      console.error("Move handling failed:", error);
      toast.error("Xử lý nước đi thất bại!");
    }
  };

  // Handle sending chat message
  const handleSendChat = async () => {
    try {
      await sendChat(roomId, user);
    } catch (error) {
      console.error("Chat sending failed:", error);
      toast.error("Gửi tin nhắn thất bại!");
    }
  };

  // Handle marking player ready
  const handleMarkReady = async () => {
    try {
      await markPlayerReady();
    } catch (error) {
      console.error("Mark ready failed:", error);
      toast.error("Đánh dấu sẵn sàng thất bại!");
    }
  };

  // Handle surrendering the game
  const handleSurrender = async () => {
    try {
      await surrenderGame();
    } catch (error) {
      console.error("Surrender failed:", error);
      toast.error("Đầu hàng thất bại!");
    }
  };

  // Handle rematch request
  const handleRequestRematch = async () => {
    try {
      await requestRematch();
    } catch (error) {
      console.error("Rematch request failed:", error);
      toast.error("Yêu cầu tái đấu thất bại!");
    }
  };

  // Handle accepting rematch
  const handleAcceptRematch = async () => {
    try {
      await acceptRematch();
    } catch (error) {
      console.error("Accept rematch failed:", error);
      toast.error("Chấp nhận tái đấu thất bại!");
    }
  };

  // Handle leaving room
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
    } catch (error) {
      console.error("Leave room failed:", error);
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
                className={`board-cell ${gameState.board[row][col] ? "filled" : ""} ${
                  gameState.gameStatus === "playing" &&
                  !gameState.isMakingMove &&
                  gameState.board[row][col] === 0 &&
                  gameState.playerSymbol === gameState.currentTurn
                    ? "hoverable"
                    : ""
                } ${gameState.isMakingMove ? "disabled" : ""}`}
                onClick={() => handleMove(row, col)}
                style={{
                  cursor:
                    gameState.isMakingMove ||
                    gameState.gameStatus !== "playing" ||
                    gameState.board[row][col] !== 0 ||
                    gameState.playerSymbol !== gameState.currentTurn
                      ? "default"
                      : "pointer",
                  opacity: gameState.isMakingMove ? 0.6 : 1,
                }}
              >
                {gameState.board[row][col] === 1 ? "X" : gameState.board[row][col] === 2 ? "O" : ""}
              </div>
            ))}
          </div>
        ))}
        {gameState.isMakingMove && (
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
            {gameState.gameStatus === "waiting" && !gameState.isPlayerReady && (
              <button
                className="btn-ready btn-success"
                onClick={handleMarkReady}
                disabled={isConnecting}
              >
                ✅ Đánh dấu sẵn sàng
              </button>
            )}
            {gameState.gameStatus === "waiting" && gameState.isPlayerReady && (
              <div className="status-ready">
                Bạn đã sẵn sàng! Đang chờ đối thủ...
              </div>
            )}
            {gameState.gameStatus === "starting" && (
              <div className="status-starting">Trò chơi đang bắt đầu...</div>
            )}
            {gameState.gameStatus === "playing" && (
              <button
                className="btn-surrender btn-danger"
                onClick={handleSurrender}
              >
                🏳️ Đầu hàng
              </button>
            )}
            {gameState.gameStatus === "ended" && (
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
                  gameState.playerSymbol === gameState.currentTurn ? "active" : ""
                }`}
              >
                <div>Bạn ({gameState.playerSymbol || "?"})</div>
                <div>{gameState.isPlayerReady ? "Sẵn sàng" : "Chưa sẵn sàng"}</div>
              </div>
              <div className="player-card">
                <div>Đối thủ</div>
                <div>
                  {gameState.gameStatus === "playing" && gameState.playerSymbol !== gameState.currentTurn
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
                {gameState.gameStatus === "waiting"
                  ? "Đang chờ"
                  : gameState.gameStatus === "starting"
                  ? "Đang bắt đầu"
                  : gameState.gameStatus === "playing"
                  ? "Đang chơi"
                  : "Kết thúc"}
              </p>
              {gameState.gameStatus === "playing" && (
                <p>
                  Lượt: {gameState.playerSymbol === gameState.currentTurn ? "Của bạn" : "Đối thủ"}
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
                    <strong>{typeof msg.sender === 'string' ? msg.sender : msg.sender?.username || msg.sender?.displayName || 'Unknown'}:</strong> {msg.content}
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
                  disabled={gameState.gameStatus === "ended" || !user || !wsConnected}
                  maxLength={100}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSendChat}
                  disabled={
                    !chatInput.trim() ||
                    gameState.gameStatus === "ended" ||
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

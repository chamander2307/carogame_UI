import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import RoomService from "../../services/RoomService";
import GameCoreService from "../../services/GameCoreService";
import { toast } from "react-toastify";
import "./index.css";

const GamePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(UserContext);

  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState("WAITING_FOR_PLAYERS");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 for X, 2 for O
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Create empty board function
  const createEmptyBoard = () => {
    return Array(15)
      .fill(null)
      .map(() => Array(15).fill(null));
  };

  // Check for winning condition
  const checkWinner = (board, row, col, player) => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1],  // diagonal /
    ];

    for (let [dx, dy] of directions) {
      let count = 1;
      
      // Check in positive direction
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
            board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      // Check in negative direction
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
            board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 5) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const id = searchParams.get("roomId");
    if (id) {
      setRoomId(id);
      initializeGame(id);
    } else {
      toast.error("Không tìm thấy ID phòng");
      navigate("/lobby");
    }
  }, [searchParams, navigate]);

  const initializeGame = async (roomId) => {
    try {
      setLoading(true);

      // Load room details
      await loadRoomDetails(roomId);

      // Create empty board
      const emptyBoard = createEmptyBoard();
      setBoard(emptyBoard);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      toast.error("Không thể khởi tạo game: " + error.message);
      navigate("/lobby");
    } finally {
      setLoading(false);
    }
  };

  const loadRoomDetails = async (roomId) => {
    try {
      const response = await RoomService.getRoomDetails(roomId);
      if (response && response.success && response.data) {
        setRoomData(response.data);
        setPlayers(response.data.players || []);
        setGameState(response.data.gameState || "WAITING_FOR_PLAYERS");
        setGameStarted(response.data.gameState === "IN_PROGRESS");
      } else {
        // If room service fails, create mock data
        setRoomData({
          id: roomId,
          name: "Game Room " + roomId,
          gameState: "WAITING_FOR_PLAYERS",
        });
        setPlayers([
          {
            id: user?.id || 1,
            username: user?.username || "Player 1",
            isHost: true,
            readyState: "READY",
            isOnline: true,
            symbol: "X"
          },
          {
            id: 2,
            username: "Player 2",
            isHost: false,
            readyState: "READY", 
            isOnline: true,
            symbol: "O"
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to load room details:", error);
      // Create mock data on error
      setRoomData({
        id: roomId,
        name: "Game Room " + roomId,
        gameState: "WAITING_FOR_PLAYERS",
      });
      setPlayers([
        {
          id: user?.id || 1,
          username: user?.username || "Player 1",
          isHost: true,
          readyState: "READY",
          isOnline: true,
          symbol: "X"
        },
        {
          id: 2,
          username: "Player 2",
          isHost: false,
          readyState: "READY",
          isOnline: true,
          symbol: "O"
        }
      ]);
    }
  };

  const makeMove = async (row, col) => {
    if (!gameStarted || board[row][col] !== null || winner) {
      return;
    }

    if (players.length < 2) {
      toast.warning("Cần 2 người chơi để bắt đầu!");
      return;
    }

    try {
      // Make move on the board locally first
      const newBoard = [...board];
      const playerSymbol = currentPlayer === 1 ? "X" : "O";
      newBoard[row][col] = playerSymbol;
      setBoard(newBoard);

      // Add to game history
      const moveInfo = {
        player: currentPlayer,
        symbol: playerSymbol,
        position: [row, col],
        timestamp: new Date().toLocaleTimeString()
      };
      setGameHistory(prev => [...prev, moveInfo]);

      // Check for winner
      if (checkWinner(newBoard, row, col, playerSymbol)) {
        setWinner(currentPlayer);
        setGameState("FINISHED");
        const winnerName = currentPlayer === 1 ? "Người chơi X" : "Người chơi O";
        toast.success(`🎉 ${winnerName} đã thắng!`);
        
        // Add winner message to chat
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: "system",
          message: `🎉 ${winnerName} đã thắng cuộc!`,
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }

      // Check for draw (board full)
      if (newBoard.every(row => row.every(cell => cell !== null))) {
        setGameState("FINISHED");
        toast.info("🤝 Hòa cờ!");
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: "system", 
          message: "🤝 Trận đấu hòa!",
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }

      // Try to make move via service
      try {
        await GameCoreService.makeMove(roomId, col, row);
      } catch (serviceError) {
        console.log("Service call failed, but move is displayed locally");
      }

      // Switch turn
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setIsMyTurn(!isMyTurn);
      
      // Chỉ hiện toast cho việc thắng/hòa, không hiện cho mỗi nước đi thông thường
      // toast.success(`Đã đánh ${playerSymbol} tại (${row + 1}, ${col + 1})`);
    } catch (error) {
      console.error("Failed to make move:", error);
      toast.error("Không thể thực hiện nước đi");
    }
  };

  const startGame = () => {
    if (players.length < 2) {
      toast.warning("Cần ít nhất 2 người chơi để bắt đầu!");
      return;
    }
    
    setGameStarted(true);
    setGameState("IN_PROGRESS");
    setIsMyTurn(true);
    setCurrentPlayer(1);
    setWinner(null);
    setGameHistory([]);
    
    // Reset board
    setBoard(createEmptyBoard());
    
    toast.success("🚀 Game đã bắt đầu! Người chơi X đi trước!");
    
    // Add start message to chat
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: "system",
      message: "🚀 Trận đấu bắt đầu! Người chơi X đi trước!",
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const resetGame = () => {
    if (window.confirm("Bạn có chắc chắn muốn bắt đầu lại?")) {
      setBoard(createEmptyBoard());
      setGameStarted(false);
      setGameState("WAITING_FOR_PLAYERS");
      setIsMyTurn(false);
      setCurrentPlayer(1);
      setWinner(null);
      setGameHistory([]);
      toast.info("Đã reset game!");
      
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        type: "system",
        message: "🔄 Game đã được reset!",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        type: "user",
        playerName: user?.username || "Người chơi",
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const leaveRoom = () => {
    if (window.confirm("Bạn có chắc chắn muốn rời khỏi phòng?")) {
      navigate("/lobby");
    }
  };

  if (loading) {
    return (
      <div className="game-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <h1>🎮 {roomData?.name || "Game Caro"}</h1>
          <div className="game-info">
            <span>Phòng: #{roomId}</span>
            <span className={`status-${gameState.toLowerCase()}`}>
              {gameState === "WAITING_FOR_PLAYERS" && "⏳ Chờ người chơi"}
              {gameState === "IN_PROGRESS" && "🎯 Đang chơi"}
              {gameState === "FINISHED" && "🏁 Kết thúc"}
            </span>
            {gameStarted && !winner && (
              <span className="turn-indicator">
                Lượt: {currentPlayer === 1 ? "❌ Player X" : "⭕ Player O"}
              </span>
            )}
            {winner && (
              <span className="winner-indicator">
                🏆 Thắng: {winner === 1 ? "Player X" : "Player O"}
              </span>
            )}
          </div>
          <button className="btn-leave" onClick={leaveRoom}>
            🚪 Rời phòng
          </button>
        </div>

        <div className="game-content">
          {/* Game Board */}
          <div className="game-board-section">
            <div className="game-board">
              {board.map((row, i) => (
                <div key={i} className="board-row">
                  {row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`board-cell ${cell ? "filled" : ""} ${
                      gameStarted && !winner && !cell ? "hoverable" : ""
                    }`}
                    onClick={() => makeMove(i, j)}
                    title={`Vị trí (${i + 1}, ${j + 1})`}
                  >
                    {cell === "X" ? "❌" : cell === "O" ? "⭕" : ""}
                  </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Game Controls */}
            <div className="game-controls">
              {!gameStarted && players.length >= 2 && (
                <button className="btn-ready" onClick={startGame}>
                  🚀 Bắt đầu Game
                </button>
              )}
              {!gameStarted && players.length < 2 && (
                <div className="waiting-message">
                  ⏳ Đang chờ người chơi thứ 2...
                </div>
              )}
              {gameStarted && !winner && (
                <button className="btn-surrender" onClick={resetGame}>
                  🔄 Chơi lại
                </button>
              )}
              {winner && (
                <button className="btn-new-game" onClick={resetGame}>
                  � Game mới
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="game-sidebar">
            {/* Players */}
            <div className="players-section">
              <h3>Người chơi ({players.length}/2)</h3>
              <div className="players-list">
                {players.map((player, index) => (
                  <div key={player.id} className={`player-item ${currentPlayer === index + 1 && gameStarted ? 'active-player' : ''}`}>
                    <div className="player-info">
                      <span className="player-symbol">{player.symbol}</span>
                      <span className="player-name">{player.username}</span>
                      {player.isHost && <span className="host-badge">👑</span>}
                    </div>
                    <div className="player-status">
                      {gameStarted ? (currentPlayer === index + 1 ? "🎯" : "⏳") : "✅"}
                      {player.isOnline ? "🟢" : "🔴"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game History */}
            <div className="history-section">
              <h3>Lịch sử đánh ({gameHistory.length} nước)</h3>
              <div className="history-list">
                {gameHistory.slice(-5).map((move, index) => (
                  <div key={index} className="history-item">
                    <span className="move-player">{move.symbol}</span>
                    <span className="move-position">({move.position[0] + 1}, {move.position[1] + 1})</span>
                    <span className="move-time">{move.timestamp}</span>
                  </div>
                ))}
                {gameHistory.length === 0 && (
                  <div className="no-history">Chưa có nước đi nào</div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="chat-section">
              <h3>Chat ({chatMessages.length})</h3>
              <div className="chat-messages">
                {chatMessages.slice(-8).map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.type}`}>
                    {msg.type === "user" && (
                      <div className="message-header">
                        <span className="message-author">{msg.playerName}</span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                    )}
                    <div className="message-content">{msg.message}</div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div className="no-messages">Chưa có tin nhắn nào</div>
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  maxLength={100}
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()}>
                  📤
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

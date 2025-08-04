import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import {
  joinRoomWS,
  subscribeToRoomUpdates,
  subscribeToRoomChat,
  subscribeToGameMoves,
  subscribeToGameEnd,
  markPlayerReady,
  startGame,
  leaveRoomWS,
  surrenderGame,
  requestRematch,
  acceptRematch,
  sendChatMessage,
} from "../../services/WebsocketService";
import {
  makeMove,
  getCurrentBoard,
  getPlayerSymbol,
} from "../../services/CaroGameService";
import { toast } from "react-toastify";
import "./GamePage.css";

const GamePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [roomId, setRoomId] = useState(null);
  const [board, setBoard] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Extract roomId from URL query params or state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdFromUrl = params.get("roomId");
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    } else {
      toast.error("Không tìm thấy ID phòng. Vui lòng tham gia phòng trước!");
      navigate("/lobby");
    }
  }, [location, navigate]);

  // Initialize WebSocket subscriptions and fetch initial game state
  useEffect(() => {
    if (!roomId || !user) return;

    const initGame = async () => {
      try {
        // Join room via WebSocket
        await joinRoomWS(roomId);

        // Fetch initial board state
        const boardData = await getCurrentBoard(roomId);
        setBoard(boardData);

        // Fetch player symbol
        const symbol = await getPlayerSymbol(roomId);
        setPlayerSymbol(symbol);

        // Subscribe to room updates
        subscribeToRoomUpdates(roomId, (message) => {
          console.log("Room update:", message);
          setGameStatus(message.status || "waiting");
        });

        // Subscribe to game moves
        subscribeToGameMoves(roomId, async (move) => {
          console.log("Move received:", move);
          setCurrentTurn(move.nextTurn);
          const updatedBoard = await getCurrentBoard(roomId);
          setBoard(updatedBoard);
        });

        // Subscribe to game end
        subscribeToGameEnd(roomId, (result) => {
          console.log("Game ended:", result);
          setGameStatus("ended");
          toast.info(
            `Trò chơi kết thúc! Kết quả: ${result.outcome || "Không xác định"}`
          );
          if (result.winner) {
            toast.success(`Người thắng: ${result.winner}`);
          }
        });

        // Subscribe to room chat
        subscribeToRoomChat(roomId, (message) => {
          setChatMessages((prev) => [...prev, message]);
        });

        // Mark player as ready
        await markPlayerReady(roomId);
      } catch (error) {
        console.error("Error initializing game:", error);
        toast.error(error.message || "Không thể khởi tạo trò chơi!");
      }
    };

    initGame();

    // Cleanup WebSocket subscriptions on unmount
    return () => {
      if (roomId) {
        leaveRoomWS(roomId).catch((error) =>
          console.error("Error leaving room:", error)
        );
      }
    };
  }, [roomId, user]);

  // Handle player move
  const handleMove = async (x, y) => {
    if (gameStatus !== "playing" || playerSymbol !== currentTurn) {
      toast.error("Không phải lượt của bạn hoặc trò chơi chưa bắt đầu!");
      return;
    }

    try {
      await makeMove(roomId, { x, y });
      const updatedBoard = await getCurrentBoard(roomId);
      setBoard(updatedBoard);
    } catch (error) {
      console.error("Error making move:", error);
      toast.error(error.message || "Không thể thực hiện nước đi!");
    }
  };

  // Handle sending chat message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      await sendChatMessage(roomId, {
        content: chatInput,
        sender: user?.username || "Anonymous",
      });
      setChatInput("");
    } catch (error) {
      console.error("Error sending chat:", error);
      toast.error(error.message || "Không thể gửi tin nhắn!");
    }
  };

  // Handle starting the game
  const handleStartGame = async () => {
    try {
      await startGame(roomId);
      setGameStatus("playing");
      toast.success("Trò chơi đã bắt đầu!");
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error(error.message || "Không thể bắt đầu trò chơi!");
    }
  };

  // Handle surrendering the game
  const handleSurrender = async () => {
    try {
      await surrenderGame(roomId);
      toast.info("Bạn đã đầu hàng!");
      navigate("/lobby");
    } catch (error) {
      console.error("Error surrendering:", error);
      toast.error(error.message || "Không thể đầu hàng!");
    }
  };

  // Handle rematch request
  const handleRequestRematch = async () => {
    try {
      await requestRematch(roomId);
      toast.success("Yêu cầu tái đấu đã được gửi!");
    } catch (error) {
      console.error("Error requesting rematch:", error);
      toast.error(error.message || "Không thể yêu cầu tái đấu!");
    }
  };

  // Handle accepting rematch
  const handleAcceptRematch = async () => {
    try {
      await acceptRematch(roomId);
      toast.success("Đã chấp nhận tái đấu!");
      setGameStatus("waiting");
      setBoard(null);
    } catch (error) {
      console.error("Error accepting rematch:", error);
      toast.error(error.message || "Không thể chấp nhận tái đấu!");
    }
  };

  // Render the game board
  const renderBoard = () => {
    if (!board) return <p>Đang tải bàn cờ...</p>;

    const size = board.length || 20; // Default to 20x20 if not specified
    return (
      <div className="game-board">
        {Array.from({ length: size }).map((_, row) => (
          <div key={row} className="board-row">
            {Array.from({ length: size }).map((_, col) => (
              <button
                key={`${row}-${col}`}
                className="board-cell"
                onClick={() => handleMove(row, col)}
                disabled={gameStatus !== "playing" || board[row][col] !== null}
              >
                {board[row][col] || ""}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="game-page">
      <h1>Trò chơi Caro</h1>
      <div className="game-container">
        <div className="game-info">
          <p>Phòng: {roomId || "N/A"}</p>
          <p>Biểu tượng của bạn: {playerSymbol || "N/A"}</p>
          <p>Trạng thái: {gameStatus}</p>
          <p>Lượt hiện tại: {currentTurn || "N/A"}</p>
          <div className="game-actions">
            {gameStatus === "waiting" && (
              <button onClick={handleStartGame} disabled={!roomId}>
                Bắt đầu trò chơi
              </button>
            )}
            {gameStatus === "playing" && (
              <button onClick={handleSurrender}>Đầu hàng</button>
            )}
            {gameStatus === "ended" && (
              <>
                <button onClick={handleRequestRematch}>Yêu cầu tái đấu</button>
                <button onClick={handleAcceptRematch}>Chấp nhận tái đấu</button>
              </>
            )}
            <button onClick={() => navigate("/lobby")}>Rời phòng</button>
          </div>
        </div>
        <div className="game-board-container">{renderBoard()}</div>
        <div className="game-chat">
          <h3>Trò chuyện</h3>
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.sender}:</strong> {msg.content}
              </p>
            ))}
          </div>
          <form onSubmit={handleSendChat}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={gameStatus === "ended" || !user}
            />
            <button type="submit" disabled={gameStatus === "ended" || !user}>
              Gửi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GamePage;

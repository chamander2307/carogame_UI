import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import GameCoreService from "../../services/GameCoreService";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../../constants/VietNameseStatus";
import "./index.css";

const GamePage = () => {
  const { user } = useContext(UserContext);
  const [board, setBoard] = useState([]);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("roomId");
    if (id) {
      setRoomId(id);
      loadBoard(id);
    }
  }, []);

  const loadBoard = async (roomId) => {
    try {
      const response = await GameCoreService.getCurrentBoard(roomId);
      if (response.success && response.data) {
        setBoard(response.data);
      } else {
        throw new Error(response.message || "Không thể tải bàn cờ");
      }
    } catch (error) {
      console.error("Failed to load board:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Lấy trạng thái bàn cờ"
        ) ||
          error.message ||
          "Không thể tải bàn cờ"
      );
    }
  };

  return (
    <div className="game-page">
      <h1>Game Caro</h1>
      {/* Example board rendering */}
      <div className="game-board">
        {board.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((cell, j) => (
              <div key={`${i}-${j}`} className="board-cell">
                {cell || ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePage;

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./GameLobby.css";

const GameLobby = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: "Phòng Newbie",
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      host: "Player1",
      difficulty: "Dễ",
    },
    {
      id: 2,
      name: "Phòng Pro",
      players: 2,
      maxPlayers: 2,
      status: "playing",
      host: "MasterX",
      difficulty: "Khó",
    },
    {
      id: 3,
      name: "Phòng Thường",
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      host: "CoolGamer",
      difficulty: "Trung bình",
    },
  ]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Trung bình");

  const handleJoinRoom = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.status === "waiting" && room.players < room.maxPlayers) {
      // Cập nhật số người chơi
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? {
                ...r,
                players: r.players + 1,
                status: r.players + 1 >= r.maxPlayers ? "playing" : "waiting",
              }
            : r
        )
      );
      // Chuyển đến trang game
      navigate("/game");
    }
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;

    const newRoom = {
      id: rooms.length + 1,
      name: newRoomName,
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      host: user?.username || "Guest",
      difficulty: selectedDifficulty,
    };

    setRooms((prev) => [...prev, newRoom]);
    setNewRoomName("");
    setShowCreateRoom(false);
    // Chuyển đến trang game
    navigate("/game");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "#10b981";
      case "playing":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting":
        return "Đang chờ";
      case "playing":
        return "Đang chơi";
      default:
        return "Không xác định";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Dễ":
        return "#10b981";
      case "Trung bình":
        return "#f59e0b";
      case "Khó":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <h1>Sảnh Game Cờ Caro</h1>
        <p>Chọn phòng để tham gia hoặc tạo phòng mới</p>
      </div>

      <div className="lobby-actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateRoom(true)}
        >
          Tạo phòng mới
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/game")}>
          Chơi ngay
        </button>
      </div>

      {showCreateRoom && (
        <div className="create-room-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tạo phòng mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateRoom(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên phòng:</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Nhập tên phòng..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Độ khó:</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="form-select"
                >
                  <option value="Dễ">Dễ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Khó">Khó</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateRoom(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
              >
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rooms-container">
        <h2>Danh sách phòng</h2>
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>{room.name}</h3>
                <span
                  className="room-status"
                  style={{ backgroundColor: getStatusColor(room.status) }}
                >
                  {getStatusText(room.status)}
                </span>
              </div>

              <div className="room-info">
                <div className="info-item">
                  <span className="label">Chủ phòng:</span>
                  <span className="value">{room.host}</span>
                </div>
                <div className="info-item">
                  <span className="label">Người chơi:</span>
                  <span className="value">
                    {room.players}/{room.maxPlayers}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Độ khó:</span>
                  <span
                    className="value difficulty"
                    style={{ color: getDifficultyColor(room.difficulty) }}
                  >
                    {room.difficulty}
                  </span>
                </div>
              </div>

              <div className="room-actions">
                {room.status === "waiting" && room.players < room.maxPlayers ? (
                  <button
                    className="btn btn-join"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Tham gia
                  </button>
                ) : (
                  <button className="btn btn-disabled" disabled>
                    {room.status === "playing" ? "Đang chơi" : "Đầy"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {rooms.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>Chưa có phòng nào</h3>
          <p>Hãy tạo phòng đầu tiên để bắt đầu chơi!</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateRoom(true)}
          >
            Tạo phòng ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default GameLobby;

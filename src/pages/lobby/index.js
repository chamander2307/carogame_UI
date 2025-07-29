import React, { useState, useEffect } from "react";
import "./index.css";

const LobbyPage = () => {
  const [rooms, setRooms] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    isPrivate: false,
    password: "",
  });

  // Mock data cho rooms
  useEffect(() => {
    const mockRooms = [
      {
        id: 1,
        name: "Phòng chơi chill",
        players: 1,
        maxPlayers: 2,
        isPrivate: false,
        status: "waiting",
        host: "Player1",
      },
      {
        id: 2,
        name: "Cao thủ only",
        players: 2,
        maxPlayers: 2,
        isPrivate: false,
        status: "playing",
        host: "ProGamer",
      },
      {
        id: 3,
        name: "Phòng riêng",
        players: 1,
        maxPlayers: 2,
        isPrivate: true,
        status: "waiting",
        host: "SecretPlayer",
      },
    ];
    setRooms(mockRooms);
  }, []);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    // Logic tạo phòng sẽ được implement sau
    console.log("Creating room:", newRoom);
    setShowCreateRoom(false);
    setNewRoom({ name: "", isPrivate: false, password: "" });
  };

  const handleJoinRoom = (roomId) => {
    console.log("Joining room:", roomId);
    // Logic tham gia phòng sẽ được implement sau
  };

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>Phòng chơi</h1>
          <button
            className="btn-create-room"
            onClick={() => setShowCreateRoom(true)}
          >
            Tạo phòng mới
          </button>
        </div>

        <div className="lobby-content">
          <div className="rooms-section">
            <h2>Danh sách phòng</h2>
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room.id} className={`room-card ${room.status}`}>
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    {room.isPrivate && (
                      <span className="private-badge">🔒</span>
                    )}
                  </div>
                  <div className="room-info">
                    <p>Host: {room.host}</p>
                    <p>
                      Người chơi: {room.players}/{room.maxPlayers}
                    </p>
                    <p>
                      Trạng thái:
                      <span className={`status ${room.status}`}>
                        {room.status === "waiting" ? "Đang chờ" : "Đang chơi"}
                      </span>
                    </p>
                  </div>
                  <div className="room-actions">
                    <button
                      className="btn-join"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={
                        room.status === "playing" ||
                        room.players >= room.maxPlayers
                      }
                    >
                      {room.status === "playing" ? "Đang chơi" : "Tham gia"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="online-players">
            <h3>Người chơi online</h3>
            <div className="players-list">
              <div className="player-item">
                <div className="player-avatar">P1</div>
                <span>Player1</span>
                <span className="status online">Online</span>
              </div>
              <div className="player-item">
                <div className="player-avatar">PG</div>
                <span>ProGamer</span>
                <span className="status online">Online</span>
              </div>
              <div className="player-item">
                <div className="player-avatar">SP</div>
                <span>SecretPlayer</span>
                <span className="status online">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Tạo phòng mới</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateRoom(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateRoom} className="create-room-form">
                <div className="form-group">
                  <label>Tên phòng</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, name: e.target.value })
                    }
                    placeholder="Nhập tên phòng"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newRoom.isPrivate}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, isPrivate: e.target.checked })
                      }
                    />
                    Phòng riêng tư
                  </label>
                </div>
                {newRoom.isPrivate && (
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      value={newRoom.password}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, password: e.target.value })
                      }
                      placeholder="Nhập mật khẩu phòng"
                    />
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Tạo phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;

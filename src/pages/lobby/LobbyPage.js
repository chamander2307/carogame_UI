import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import {
  getPublicRooms,
  createRoom,
  joinRoomByCode,
  joinRoomById,
  quickPlay,
  getUserRooms,
  leaveRoom,
} from "../../services/GameRoomService";
import { logout } from "../../services/AuthService";
import "./LobbyPage.css";

const LobbyPage = () => {
  const navigate = useNavigate();
  const { user, checkAuthStatus } = useContext(UserContext);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [checkedExistingRoom, setCheckedExistingRoom] = useState(false);

  const loadRooms = async (showNotification = true) => {
    try {
      setLoading(true);
      const response = await getPublicRooms();
      if (Array.isArray(response.content)) {
        setRooms(response.content);
      } else {
        setRooms([]);
        if (showNotification) {
          console.error("Dữ liệu phòng không hợp lệ");
        }
      }
    } catch (error) {
      setRooms([]);
      if (showNotification) {
        console.error("Không thể tải danh sách phòng:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAndJoinExistingRoom = async () => {
    if (checkedExistingRoom) return;
    setCheckedExistingRoom(true);
    try {
      const userRoomsResponse = await getUserRooms();
      const userRooms = userRoomsResponse.content || [];
      if (userRooms.length > 0) {
        const roomId = userRooms[0].id;
        try {
          const joinResponse = await joinRoomById(roomId);
          navigate(`/game?roomId=${roomId}`);
        } catch (error) {
          if (error.response?.data?.errorCode === "ALREADY_IN_ROOM") {
            navigate(`/game?roomId=${roomId}`);
          } else {
            // Gọi leave room nếu không join được
            try {
              await leaveRoom(roomId);
              console.log("Đã rời phòng hiện tại");
              loadRooms(false);
            } catch (leaveError) {
              console.error("Không thể rời phòng:", leaveError);
              loadRooms(false);
            }
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Không thể kiểm tra phòng hiện tại:", error);
      return false;
    }
  };

  const createRoomHandler = async () => {
    if (!newRoomName.trim()) {
      console.warn("Vui lòng nhập tên phòng");
      return;
    }
    if (newRoomName.length < 3 || newRoomName.length > 100) {
      console.warn("Tên phòng phải từ 3 đến 100 ký tự");
      return;
    }

    try {
      const response = await createRoom({
        name: newRoomName.trim(),
        isPrivate,
      });
      setShowCreateModal(false);
      setNewRoomName("");
      setIsPrivate(false);
      navigate(`/game?roomId=${response.id}`);
    } catch (error) {
      console.error("Không thể tạo phòng:", error);
    }
  };

  const joinRoom = async (roomId, isPrivate = false) => {
    try {
      let response;
      if (isPrivate) {
        const joinCode = prompt(
          "Nhập mã tham gia phòng (4 ký tự chữ hoặc số):"
        );
        if (!joinCode) return;
        if (!/^[a-zA-Z0-9]{4}$/.test(joinCode)) {
          console.warn("Mã tham gia phải là 4 ký tự chữ hoặc số");
          return;
        }
        response = await joinRoomByCode(joinCode);
      } else {
        response = await joinRoomById(roomId);
      }
      navigate(`/game?roomId=${response.id || roomId}`);
    } catch (error) {
      console.error("Không thể vào phòng:", error);
    }
  };

  const handleQuickPlay = async () => {
    try {
      const response = await quickPlay();
      navigate(`/game?roomId=${response.id}`);
    } catch (error) {
      console.error("Không thể tham gia chơi nhanh:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  useEffect(() => {
    if (!user || !checkAuthStatus()) {
      navigate("/login");
      return;
    }
    const handleExistingRoom = async () => {
      const hasExistingRoom = await checkAndJoinExistingRoom();
      if (!hasExistingRoom) {
        loadRooms(true);
      }
    };
    handleExistingRoom();
    const interval = setInterval(() => loadRooms(false), 10000);
    return () => clearInterval(interval);
  }, [user, navigate, checkAuthStatus]);

  if (!user || !checkAuthStatus()) {
    return <div>Đang chuyển hướng...</div>;
  }

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>🎮 Lobby Game Caro</h1>
          <div className="user-info">
            <span>Xin chào, {user.username}!</span>
            <button className="btn-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="lobby-actions">
          <button
            className="btn-create-room"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo phòng mới
          </button>
          <button
            className="btn-refresh"
            onClick={() => loadRooms(true)}
            disabled={loading}
          >
            🔄 Làm mới
          </button>
          <button className="btn-quick-play" onClick={handleQuickPlay}>
            ⚡ Chơi nhanh
          </button>
        </div>

        <div className="rooms-section">
          <div className="rooms-header">
            <h2>Danh sách phòng ({rooms.length})</h2>
            <button
              className="btn-refresh"
              onClick={() => loadRooms(true)}
              disabled={loading}
            >
              🔄 Làm mới
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Đang tải danh sách phòng...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="empty-rooms">
              <p>🏠 Chưa có phòng nào. Hãy tạo phòng đầu tiên!</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    {room.isPrivate && (
                      <span className="password-icon">🔒</span>
                    )}
                  </div>

                  <div className="room-info">
                    <div className="players-count">
                      👥 {room.currentPlayerCount || 0}/2
                    </div>
                    <div className="room-status">
                      {room.status === "WAITING"
                        ? "⏳ Đang chờ"
                        : room.status === "PLAYING"
                        ? "🎮 Đang chơi"
                        : "✅ Sẵn sàng"}
                    </div>
                  </div>

                  <div className="room-players">
                    {room.players && room.players.length > 0 ? (
                      room.players.map((player) => (
                        <span key={player.userId} className="player-tag">
                          {player.displayName || player.username}
                        </span>
                      ))
                    ) : (
                      <span className="no-players">Chưa có người chơi</span>
                    )}
                  </div>

                  <button
                    className="btn-join-room"
                    onClick={() => joinRoom(room.id, room.isPrivate)}
                    disabled={
                      room.status === "PLAYING" || room.currentPlayerCount >= 2
                    }
                  >
                    {room.status === "PLAYING"
                      ? "Đang chơi"
                      : room.currentPlayerCount >= 2
                      ? "Phòng đầy"
                      : "Vào phòng"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Tạo phòng mới</h2>

            <div className="form-group">
              <label>Tên phòng:</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Nhập tên phòng..."
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Phòng riêng tư (yêu cầu mã tham gia)
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoomName("");
                  setIsPrivate(false);
                }}
              >
                Hủy
              </button>
              <button className="btn-create" onClick={createRoomHandler}>
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;

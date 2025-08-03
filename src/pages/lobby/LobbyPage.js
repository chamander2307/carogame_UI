import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import RoomService from "../../services/RoomService";
import AuthServices from "../../services/AuthServices";
import { toast } from "react-toastify";
import "./LobbyPage.css";

const LobbyPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Load danh sách phòng công khai
  const loadRooms = async (showNotification = true) => {
    try {
      setLoading(true);
      const response = await RoomService.getPublicRooms();
      console.log("Response from getPublicRooms:", response);
      if (response && response.success && Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        console.warn("Response data is not an array:", response?.data);
        setRooms([]);
        if (response && response.message && showNotification) {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
      setRooms([]);
      if (showNotification) {
        toast.error(
          error.message || "Lỗi kết nối, không thể tải danh sách phòng"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Tạo phòng mới
  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Vui lòng nhập tên phòng");
      return;
    }
    if (newRoomName.length < 3 || newRoomName.length > 100) {
      toast.error("Tên phòng phải từ 3 đến 100 ký tự");
      return;
    }

    try {
      const response = await RoomService.createRoom({
        name: newRoomName.trim(),
        isPrivate,
      });

      if (response && response.success && response.data) {
        toast.success(response.message || "Tạo phòng thành công!");
        setShowCreateModal(false);
        setNewRoomName("");
        setIsPrivate(false);
        navigate(`/game?roomId=${response.data.id}`);
      } else {
        toast.error(response?.message || "Không thể tạo phòng");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error(error.message || "Lỗi kết nối, không thể tạo phòng");
    }
  };

  // Tham gia phòng
  const joinRoom = async (roomId, isPrivate = false) => {
    try {
      let joinCode = null;
      if (isPrivate) {
        joinCode = prompt("Nhập mã tham gia phòng (4 ký tự chữ hoặc số):");
        if (!joinCode) return;
        if (!/^[a-zA-Z0-9]{4}$/.test(joinCode)) {
          toast.error("Mã tham gia phải là 4 ký tự chữ hoặc số");
          return;
        }
      }

      const response = isPrivate
        ? await RoomService.joinRoomByCode(joinCode)
        : await RoomService.joinRoomById(roomId);

      if (response && response.success && response.data) {
        toast.success(response.message || "Vào phòng thành công!");
        navigate(`/game?roomId=${response.data.id || roomId}`);
      } else {
        toast.error(response?.message || "Không thể vào phòng");
      }
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error(error.message || "Lỗi kết nối, không thể vào phòng");
    }
  };

  const handleQuickPlay = async () => {
    try {
      const response = await RoomService.quickPlay();
      if (response && response.success && response.data) {
        toast.success(response.message || "Tham gia chơi nhanh thành công!");
        navigate(`/game?roomId=${response.data.id}`);
      } else {
        toast.error(response?.message || "Không thể tham gia chơi nhanh");
      }
    } catch (error) {
      console.error("Failed to quick play:", error);
      toast.error(
        error.message || "Lỗi kết nối, không thể tham gia chơi nhanh"
      );
    }
  };

  useEffect(() => {
    if (!user || !AuthServices.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Load rooms lần đầu với notification
    loadRooms(true);

    // Tắt auto-refresh để tránh spam API calls
    // User có thể click nút "Làm mới" để update manual
    // const interval = setInterval(() => loadRooms(false), 30000);
    // return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user || !AuthServices.isAuthenticated()) {
    return <div>Đang chuyển hướng...</div>;
  }

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        {/* Header */}
        <div className="lobby-header">
          <h1>🎮 Lobby Game Caro</h1>
          <div className="user-info">
            <span>Xin chào, {user?.username || "Guest"}!</span>
            <button
              className="btn-logout"
              onClick={() => {
                AuthServices.clearAuthData();
                toast.success("Đăng xuất thành công!");
                navigate("/login");
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="lobby-actions">
          <button
            className="btn-create-room"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo phòng mới
          </button>
          <button
            className="btn-refresh"
            onClick={loadRooms}
            disabled={loading}
          >
            🔄 Làm mới
          </button>
          <button className="btn-quick-play" onClick={handleQuickPlay}>
            ⚡ Chơi nhanh
          </button>
        </div>

        {/* Room List */}
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
              {Array.isArray(rooms) &&
                rooms.map((room) => (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <h3>{room.name}</h3>
                      {room.isPrivate && (
                        <span className="password-icon">🔒</span>
                      )}
                    </div>

                    <div className="room-info">
                      <div className="players-count">
                        👥 {room.currentPlayers || 0}/{room.maxPlayers || 2}
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
                          <span key={player.id} className="player-tag">
                            {player.username}
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
                        room.status === "PLAYING" ||
                        room.currentPlayers >= room.maxPlayers
                      }
                    >
                      {room.status === "PLAYING"
                        ? "Đang chơi"
                        : room.currentPlayers >= room.maxPlayers
                        ? "Phòng đầy"
                        : "Vào phòng"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
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
              <button className="btn-create" onClick={createRoom}>
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

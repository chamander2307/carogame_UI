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
import { toast } from "react-toastify";
const LobbyPage = () => {
  const navigate = useNavigate();
  const { user, checkAuthStatus } = useContext(UserContext);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [checkedExistingRoom, setCheckedExistingRoom] = useState(false);

  // Normalize avatar URLs
  const normalizeAvatarUrl = (avatarUrl) => {
    if (!avatarUrl || avatarUrl === "null" || avatarUrl.trim() === "") {
      console.warn("Invalid avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
    if (avatarUrl.startsWith("/")) {
      return `http://localhost:8080${avatarUrl}`;
    }
    try {
      new URL(avatarUrl);
      return avatarUrl;
    } catch (e) {
      console.warn("Invalid absolute avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await getPublicRooms();
      console.log("Response from getPublicRooms:", response);
      if (Array.isArray(response.content)) {
        setRooms(response.content);
      } else {
        console.warn("Response content is not an array:", response.content);
        setRooms([]);
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
      setRooms([]);
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
          toast.success("Vào phòng thành công!");
          navigate(`/game?roomId=${roomId}`);
        } catch (error) {
          if (error.response?.data?.errorCode === "ALREADY_IN_ROOM") {
            navigate(`/game?roomId=${roomId}`);
          } else {
            try {
              await leaveRoom(roomId);
              console.log("Đã rời phòng hiện tại");
              loadRooms();
            } catch (leaveError) {
              console.error("Không thể rời phòng:", leaveError);
              loadRooms();
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
      toast.error("Vui lòng nhập tên phòng");
      return;
    }
    if (newRoomName.length < 3 || newRoomName.length > 100) {
      toast.error("Tên phòng phải từ 3 đến 100 ký tự");
      return;
    }

    try {
      // Check auth status before making the call
      if (!checkAuthStatus()) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      const response = await createRoom({
        name: newRoomName.trim(),
        isPrivate,
      });
      toast.success("Tạo phòng thành công!");
      setShowCreateModal(false);
      setNewRoomName("");
      setIsPrivate(false);
      navigate(`/game?roomId=${response.id}`);
    } catch (error) {
      console.error("Không thể tạo phòng:", error);
      
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else {
        toast.error("Không thể tạo phòng. Vui lòng thử lại!");
      }
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
          toast.error("Mã tham gia phải là 4 ký tự chữ hoặc số");
          return;
        }
        response = await joinRoomByCode(joinCode);
      } else {
        response = await joinRoomById(roomId);
      }
      toast.success("Vào phòng thành công!");
      navigate(`/game?roomId=${response.id || roomId}`);
    } catch (error) {
      console.error("Không thể vào phòng:", error);
    }
  };

  const handleQuickPlay = async () => {
    try {
      // Check auth status before making the call
      if (!checkAuthStatus()) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      const response = await quickPlay();
      toast.success("Tham gia chơi nhanh thành công!");
      navigate(`/game?roomId=${response.id}`);
    } catch (error) {
      console.error("Không thể tham gia chơi nhanh:", error);
      
      // Check if it's an auth error
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else {
        toast.error("Không thể tham gia chơi nhanh. Vui lòng thử lại!");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  useEffect(() => {
    if (!user || !checkAuthStatus()) {
      console.warn("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    const handleExistingRoom = async () => {
      const hasExistingRoom = await checkAndJoinExistingRoom();
      if (!hasExistingRoom) {
        loadRooms();
      }
    };
    handleExistingRoom();
    const interval = setInterval(() => loadRooms(), 10000);
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
            onClick={() => loadRooms()}
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
              onClick={() => loadRooms()}
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
                        <div key={player.userId} className="player-info">
                          <div className="player-avatar">
                            <img
                              src={normalizeAvatarUrl(player.avatarUrl)}
                              alt={player.displayName || player.username}
                              onError={(e) => {
                                console.warn(
                                  `Failed to load avatar for ${
                                    player.displayName || player.username
                                  }:`,
                                  player.avatarUrl
                                );
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          </div>
                          <span className="player-tag">
                            {player.displayName || player.username}
                          </span>
                        </div>
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

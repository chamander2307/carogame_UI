import React, { useState } from "react";
import "./index.css";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const [friends] = useState([
    {
      id: 1,
      username: "ProGamer123",
      isOnline: true,
      lastSeen: null,
      gamesPlayed: 15,
      avatar: null,
    },
    {
      id: 2,
      username: "ChessLover",
      isOnline: false,
      lastSeen: "2 giờ trước",
      gamesPlayed: 8,
      avatar: null,
    },
    {
      id: 3,
      username: "GameMaster",
      isOnline: true,
      lastSeen: null,
      gamesPlayed: 23,
      avatar: null,
    },
  ]);

  const [friendRequests] = useState([
    {
      id: 1,
      username: "NewPlayer99",
      sentAt: "1 ngày trước",
      avatar: null,
    },
    {
      id: 2,
      username: "StrategicMind",
      sentAt: "3 ngày trước",
      avatar: null,
    },
  ]);

  const [sentRequests] = useState([
    {
      id: 1,
      username: "CoolPlayer",
      sentAt: "2 ngày trước",
      avatar: null,
    },
  ]);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const handleInviteToGame = (friendId) => {
    console.log("Inviting friend to game:", friendId);
    // Logic mời chơi sẽ được implement sau
  };

  const handleRemoveFriend = (friendId) => {
    console.log("Removing friend:", friendId);
    // Logic xóa bạn sẽ được implement sau
  };

  const handleAcceptRequest = (requestId) => {
    console.log("Accepting friend request:", requestId);
    // Logic chấp nhận lời mời sẽ được implement sau
  };

  const handleDeclineRequest = (requestId) => {
    console.log("Declining friend request:", requestId);
    // Logic từ chối lời mời sẽ được implement sau
  };

  const handleCancelRequest = (requestId) => {
    console.log("Canceling sent request:", requestId);
    // Logic hủy lời mời đã gửi sẽ được implement sau
  };

  const handleAddFriend = () => {
    if (searchTerm.trim()) {
      console.log("Sending friend request to:", searchTerm);
      setSearchTerm("");
      // Logic gửi lời mời kết bạn sẽ được implement sau
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-container">
        <div className="friends-header">
          <h1>Bạn bè</h1>
          <div className="add-friend-section">
            <input
              type="text"
              placeholder="Nhập tên người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-friend-input"
              onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
            />
            <button
              className="btn-add-friend"
              onClick={handleAddFriend}
              disabled={!searchTerm.trim()}
            >
              Thêm bạn
            </button>
          </div>
        </div>

        <div className="friends-tabs">
          <button
            className={`tab ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            Bạn bè ({friends.length})
          </button>
          <button
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Lời mời ({friendRequests.length})
          </button>
          <button
            className={`tab ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Đã gửi ({sentRequests.length})
          </button>
        </div>

        <div className="friends-content">
          {activeTab === "friends" && (
            <div className="friends-list">
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {filteredFriends.length === 0 ? (
                <div className="no-friends">
                  <p>Không tìm thấy bạn bè nào.</p>
                </div>
              ) : (
                <div className="friends-grid">
                  {filteredFriends.map((friend) => (
                    <div key={friend.id} className="friend-card">
                      <div className="friend-info">
                        <div className="friend-avatar">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt="Avatar" />
                          ) : (
                            <span>{getInitial(friend.username)}</span>
                          )}
                          <div
                            className={`status-indicator ${
                              friend.isOnline ? "online" : "offline"
                            }`}
                          ></div>
                        </div>
                        <div className="friend-details">
                          <h3>{friend.username}</h3>
                          <p className="status">
                            {friend.isOnline
                              ? "Đang online"
                              : `Offline - ${friend.lastSeen}`}
                          </p>
                          <p className="games-count">
                            {friend.gamesPlayed} trận đã chơi
                          </p>
                        </div>
                      </div>
                      <div className="friend-actions">
                        <button
                          className="btn-invite"
                          onClick={() => handleInviteToGame(friend.id)}
                          disabled={!friend.isOnline}
                        >
                          Mời chơi
                        </button>
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveFriend(friend.id)}
                        >
                          Xóa bạn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="requests-list">
              {friendRequests.length === 0 ? (
                <div className="no-requests">
                  <p>Không có lời mời kết bạn nào.</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="request-card">
                      <div className="request-info">
                        <div className="request-avatar">
                          {request.avatar ? (
                            <img src={request.avatar} alt="Avatar" />
                          ) : (
                            <span>{getInitial(request.username)}</span>
                          )}
                        </div>
                        <div className="request-details">
                          <h3>{request.username}</h3>
                          <p>Gửi lời mời {request.sentAt}</p>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Chấp nhận
                        </button>
                        <button
                          className="btn-decline"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="sent-list">
              {sentRequests.length === 0 ? (
                <div className="no-sent">
                  <p>Bạn chưa gửi lời mời nào.</p>
                </div>
              ) : (
                <div className="sent-grid">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="sent-card">
                      <div className="sent-info">
                        <div className="sent-avatar">
                          {request.avatar ? (
                            <img src={request.avatar} alt="Avatar" />
                          ) : (
                            <span>{getInitial(request.username)}</span>
                          )}
                        </div>
                        <div className="sent-details">
                          <h3>{request.username}</h3>
                          <p>Đã gửi {request.sentAt}</p>
                        </div>
                      </div>
                      <div className="sent-actions">
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          Hủy lời mời
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;

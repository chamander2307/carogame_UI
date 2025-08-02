import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { FriendService } from "../../services";
import { toast } from "react-toastify";
import "./index.css";

const FriendsPage = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("friends");
  const [loading, setLoading] = useState(false);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Online status state
  const [friendsOnlineStatus, setFriendsOnlineStatus] = useState([]);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
      loadSentRequests();
      loadFriendsOnlineStatus();
    }
  }, [user]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await FriendService.getFriends();
      if (response.success && response.data) {
        setFriends(response.data);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
      toast.error("Không thể tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await FriendService.getFriendRequests();
      if (response.success && response.data) {
        setFriendRequests(response.data);
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await FriendService.getSentRequests();
      if (response.success && response.data) {
        setSentRequests(response.data);
      }
    } catch (error) {
      console.error("Failed to load sent requests:", error);
    }
  };

  // Load friends' online status (only working friend-related endpoint)
  const loadFriendsOnlineStatus = async () => {
    try {
      const response = await FriendService.getFriendsOnlineStatus();
      if (response.success && response.data) {
        setFriendsOnlineStatus(response.data);
      }
    } catch (error) {
      console.error("Failed to load friends online status:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await FriendService.searchUsers(searchQuery.trim());
      if (response.success && response.data) {
        setSearchResults(response.data);
        toast.success(`Tìm thấy ${response.data.length} người dùng`);
      } else {
        setSearchResults([]);
        toast.info("Không tìm thấy người dùng nào");
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Không thể tìm kiếm người dùng");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      const response = await FriendService.sendFriendRequest(userId);
      if (response.success) {
        toast.success("Đã gửi lời mời kết bạn");
        loadSentRequests();
        // Update search results to reflect sent request
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, friendshipStatus: "PENDING" } : user
          )
        );
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const response = await FriendService.acceptFriendRequest(requestId);
      if (response.success) {
        toast.success("Đã chấp nhận lời mời kết bạn");
        loadFriends();
        loadFriendRequests();
        loadFriendsOnlineStatus();
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      const response = await FriendService.rejectFriendRequest(requestId);
      if (response.success) {
        toast.success("Đã từ chối lời mời kết bạn");
        loadFriendRequests();
      }
    } catch (error) {
      console.error("Failed to reject friend request:", error);
      toast.error("Không thể từ chối lời mời kết bạn");
    }
  };

  const handleCancelSentRequest = async (requestId) => {
    try {
      const response = await FriendService.rejectFriendRequest(requestId);
      if (response.success) {
        toast.success("Đã hủy lời mời kết bạn");
        loadSentRequests();
      }
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
      toast.error("Không thể hủy lời mời kết bạn");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bạn bè này?")) {
      try {
        // Use reject endpoint to remove friend
        const response = await FriendService.rejectFriendRequest(friendId);
        if (response.success) {
          toast.success("Đã xóa bạn bè");
          loadFriends();
          loadFriendsOnlineStatus();
        }
      } catch (error) {
        console.error("Failed to remove friend:", error);
        toast.error("Không thể xóa bạn bè");
      }
    }
  };

  const refreshOnlineStatus = () => {
    loadFriendsOnlineStatus();
    toast.info("Đã làm mới trạng thái online");
  };

  const getFriendshipButtonText = (user) => {
    switch (user.friendshipStatus) {
      case "FRIENDS":
        return "Đã là bạn bè";
      case "PENDING":
        return "Đã gửi lời mời";
      case "BLOCKED":
        return "Đã chặn";
      default:
        return "Kết bạn";
    }
  };

  const canSendFriendRequest = (targetUser) => {
    return (
      targetUser.id !== user?.id &&
      targetUser.friendshipStatus !== "FRIENDS" &&
      targetUser.friendshipStatus !== "PENDING" &&
      targetUser.friendshipStatus !== "BLOCKED" &&
      targetUser.canSendRequest !== false
    );
  };

  const UserCard = ({ user, showActions = true, actionType = "send" }) => (
    <div className="user-card">
      <div className="user-avatar">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.displayName || user.username}
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <span
          className={`status-indicator ${user.isOnline ? "online" : "offline"}`}
        ></span>
      </div>

      <div className="user-info">
        <h4>{user.displayName || user.username}</h4>
        <p>@{user.username}</p>
        <span className={`status-text ${user.isOnline ? "online" : "offline"}`}>
          {user.isOnline ? "Đang online" : "Offline"}
        </span>
        {user.relationshipStatus && (
          <p className="relationship-status">
            {user.relationshipStatus === "none" && "Chưa là bạn bè"}
            {user.relationshipStatus === "friends" && "Đã là bạn bè"}
            {user.relationshipStatus === "pending" && "Đang chờ phản hồi"}
          </p>
        )}
      </div>

      {showActions && (
        <div className="user-actions">
          {actionType === "send" && canSendFriendRequest(user) && (
            <button
              className="btn-primary"
              onClick={() => handleSendFriendRequest(user.id)}
            >
              Kết bạn
            </button>
          )}

          {actionType === "accept" && (
            <>
              <button
                className="btn-success"
                onClick={() => handleAcceptFriendRequest(user.userId)}
              >
                Chấp nhận
              </button>
              <button
                className="btn-danger"
                onClick={() => handleRejectFriendRequest(user.userId)}
              >
                Từ chối
              </button>
            </>
          )}

          {actionType === "cancel" && (
            <button
              className="btn-warning"
              onClick={() => handleCancelSentRequest(user.userId)}
            >
              Hủy lời mời
            </button>
          )}

          {actionType === "friend" && (
            <>
              <button className="btn-secondary">Nhắn tin</button>
              <button
                className="btn-danger"
                onClick={() => handleRemoveFriend(user.userId)}
              >
                Xóa bạn
              </button>
            </>
          )}

          {actionType === "online" && (
            <button className="btn-secondary" disabled>
              Đang online
            </button>
          )}

          {!canSendFriendRequest(user) && actionType === "send" && (
            <button className="btn-disabled" disabled>
              {getFriendshipButtonText(user)}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="friends-page">
      <div className="friends-container">
        <div className="friends-header">
          <h1>Bạn bè</h1>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="search-input"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="search-btn"
              >
                {isSearching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Kết quả tìm kiếm ({searchResults.length})</h3>
                <div className="users-list">
                  {searchResults.map((user) => (
                    <UserCard key={user.id} user={user} actionType="send" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
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
          <button
            className={`tab ${activeTab === "online" ? "active" : ""}`}
            onClick={() => setActiveTab("online")}
          >
            Bạn bè online ({friendsOnlineStatus.length})
            <button
              className="refresh-btn"
              onClick={(e) => {
                e.stopPropagation();
                refreshOnlineStatus();
              }}
              title="Làm mới trạng thái online"
            >
              🔄
            </button>
          </button>
        </div>

        {/* Tab Content */}
        <div className="friends-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : (
            <>
              {activeTab === "friends" && (
                <div className="friends-list">
                  {friends.length === 0 ? (
                    <div className="empty-state">
                      <p>Bạn chưa có bạn bè nào</p>
                      <p>Hãy tìm kiếm và kết bạn với những người khác!</p>
                    </div>
                  ) : (
                    <div className="users-list">
                      {friends.map((friend) => (
                        <UserCard
                          key={friend.userId}
                          user={friend}
                          actionType="friend"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "requests" && (
                <div className="requests-list">
                  {friendRequests.length === 0 ? (
                    <div className="empty-state">
                      <p>Không có lời mời kết bạn nào</p>
                    </div>
                  ) : (
                    <div className="users-list">
                      {friendRequests.map((request) => (
                        <UserCard
                          key={request.userId}
                          user={request}
                          actionType="accept"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "sent" && (
                <div className="sent-list">
                  {sentRequests.length === 0 ? (
                    <div className="empty-state">
                      <p>Không có lời mời nào đã gửi</p>
                    </div>
                  ) : (
                    <div className="users-list">
                      {sentRequests.map((request) => (
                        <UserCard
                          key={request.userId}
                          user={request}
                          actionType="cancel"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "online" && (
                <div className="online-friends-list">
                  {friendsOnlineStatus.length === 0 ? (
                    <div className="empty-state">
                      <p>Không có bạn bè nào đang online</p>
                      <p>Hoặc bạn chưa có bạn bè nào</p>
                    </div>
                  ) : (
                    <div className="users-list">
                      {friendsOnlineStatus.map((friend) => (
                        <UserCard
                          key={friend.userId}
                          user={{
                            id: friend.userId,
                            userId: friend.userId,
                            username: friend.displayName,
                            displayName: friend.displayName,
                            avatar: friend.avatarUrl,
                            isOnline: friend.status,
                          }}
                          actionType="online"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import {
  getFriendsList,
  getPendingFriendRequests,
  getSentFriendRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../services/FriendService";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../../constants/VietNameseStatus";
import "./index.css";

const FriendsPage = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("friends");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
      loadSentRequests();
    }
  }, [user]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriendsList();
      if (response.success && response.data) {
        setFriends(response.data);
        toast.success(
          getVietnameseMessage(response.statusCode, "Lấy danh sách bạn bè") ||
            response.message ||
            "Tải danh sách bạn bè thành công"
        );
      } else {
        throw new Error(
          getVietnameseMessage(response.statusCode, "Lấy danh sách bạn bè") ||
            response.message ||
            "Không thể tải danh sách bạn bè"
        );
      }
    } catch (error) {
      console.error("Failed to load friends:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Lấy danh sách bạn bè"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách bạn bè"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await getPendingFriendRequests();
      if (response.success && response.data) {
        setFriendRequests(response.data);
        toast.success(
          getVietnameseMessage(
            response.statusCode,
            "Lấy danh sách lời mời kết bạn"
          ) ||
            response.message ||
            "Tải danh sách lời mời kết bạn thành công"
        );
      } else {
        throw new Error(
          getVietnameseMessage(
            response.statusCode,
            "Lấy danh sách lời mời kết bạn"
          ) ||
            response.message ||
            "Không thể tải danh sách lời mời kết bạn"
        );
      }
    } catch (error) {
      console.error("Failed to load friend requests:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Lấy danh sách lời mời kết bạn"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách lời mời kết bạn"
      );
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await getSentFriendRequests();
      if (response.success && response.data) {
        setSentRequests(response.data);
        toast.success(
          getVietnameseMessage(
            response.statusCode,
            "Lấy danh sách lời mời đã gửi"
          ) ||
            response.message ||
            "Tải danh sách lời mời đã gửi thành công"
        );
      } else {
        throw new Error(
          getVietnameseMessage(
            response.statusCode,
            "Lấy danh sách lời mời đã gửi"
          ) ||
            response.message ||
            "Không thể tải danh sách lời mời đã gửi"
        );
      }
    } catch (error) {
      console.error("Failed to load sent requests:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Lấy danh sách lời mời đã gửi"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách lời mời đã gửi"
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await searchUsers(searchQuery.trim());
      if (response.success && response.data) {
        setSearchResults(response.data);
        toast.success(
          getVietnameseMessage(response.statusCode, "Tìm kiếm người dùng") ||
            response.message ||
            `Tìm thấy ${response.data.length} người dùng`
        );
      } else {
        setSearchResults([]);
        toast.info(
          getVietnameseMessage(response.statusCode, "Tìm kiếm người dùng") ||
            response.message ||
            "Không tìm thấy người dùng nào"
        );
      }
    } catch (error) {
      console.error("Search failed:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Tìm kiếm người dùng"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể tìm kiếm người dùng"
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      const response = await sendFriendRequest(userId);
      if (response.success) {
        toast.success(
          getVietnameseMessage(response.statusCode, "Gửi lời mời kết bạn") ||
            response.message ||
            "Đã gửi lời mời kết bạn"
        );
        loadSentRequests();
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, friendshipStatus: "PENDING" } : user
          )
        );
      } else {
        throw new Error(
          getVietnameseMessage(response.statusCode, "Gửi lời mời kết bạn") ||
            response.message ||
            "Không thể gửi lời mời kết bạn"
        );
      }
    } catch (error) {
      console.error("Failed to send friend request:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Gửi lời mời kết bạn"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể gửi lời mời kết bạn"
      );
    }
  };

  const handleAcceptFriendRequest = async (userId) => {
    try {
      const response = await acceptFriendRequest(userId);
      if (response.success) {
        toast.success(
          getVietnameseMessage(
            response.statusCode,
            "Chấp nhận lời mời kết bạn"
          ) ||
            response.message ||
            "Đã chấp nhận lời mời kết bạn"
        );
        loadFriends();
        loadFriendRequests();
      } else {
        throw new Error(
          getVietnameseMessage(
            response.statusCode,
            "Chấp nhận lời mời kết bạn"
          ) ||
            response.message ||
            "Không thể chấp nhận lời mời kết bạn"
        );
      }
    } catch (error) {
      console.error("Failed to accept friend request:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Chấp nhận lời mời kết bạn"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể chấp nhận lời mời kết bạn"
      );
    }
  };

  const handleRejectFriendRequest = async (userId) => {
    try {
      const response = await rejectFriendRequest(userId);
      if (response.success) {
        toast.success(
          getVietnameseMessage(
            response.statusCode,
            "Từ chối lời mời kết bạn"
          ) ||
            response.message ||
            "Đã từ chối lời mời kết bạn"
        );
        loadFriendRequests();
      } else {
        throw new Error(
          getVietnameseMessage(
            response.statusCode,
            "Từ chối lời mời kết bạn"
          ) ||
            response.message ||
            "Không thể từ chối lời mời kết bạn"
        );
      }
    } catch (error) {
      console.error("Failed to reject friend request:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(
        getVietnameseMessage(
          error.response?.data?.statusCode,
          "Từ chối lời mời kết bạn"
        ) ||
          error.response?.data?.message ||
          error.message ||
          "Không thể từ chối lời mời kết bạn"
      );
    }
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
      targetUser.friendshipStatus !== "BLOCKED"
    );
  };

  const UserCard = ({ user, showActions = true, actionType = "send" }) => (
    <div className="user-card">
      <div className="user-avatar">
        <img
          src={user.avatarUrl || "/default-avatar.png"}
          alt={user.displayName || user.username}
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
      </div>

      <div className="user-info">
        <h4>{user.displayName || user.username}</h4>
        <p>@{user.username}</p>
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
                onClick={() => handleAcceptFriendRequest(user.id)}
              >
                Chấp nhận
              </button>
              <button
                className="btn-danger"
                onClick={() => handleRejectFriendRequest(user.id)}
              >
                Từ chối
              </button>
            </>
          )}

          {actionType === "friend" && (
            <button className="btn-secondary" disabled>
              Nhắn tin
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
                          key={friend.id}
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
                          key={request.id}
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
                          key={request.id}
                          user={request}
                          showActions={false} // Không có action cancel
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

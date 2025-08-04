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
      const data = await getFriendsList();
      setFriends(data || []);
    } catch (error) {
      console.error("Failed to load friends:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(error.message || "Không thể tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const data = await getPendingFriendRequests();
      setFriendRequests(data || []);
      console.log("Pending friend requests:", data);
    } catch (error) {
      console.error("Failed to load friend requests:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(error.message || "Không thể tải danh sách lời mời kết bạn");
    }
  };

  const loadSentRequests = async () => {
    try {
      const data = await getSentFriendRequests();
      setSentRequests(data || []);
    } catch (error) {
      console.error("Failed to load sent requests:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(error.message || "Không thể tải danh sách lời mời đã gửi");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const data = await searchUsers(searchQuery.trim());
      setSearchResults(data || []);
      if (data.length === 0) {
        toast.info("Không tìm thấy người dùng nào");
      }
    } catch (error) {
      console.error("Search failed:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
      toast.error(error.message || "Không thể tìm kiếm người dùng");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    if (!userId) {
      toast.error("ID người dùng không hợp lệ");
      console.error("Invalid userId in handleSendFriendRequest:", userId);
      return;
    }
    try {
      const response = await sendFriendRequest(userId);
      if (response.success) {
        toast.success("Đã gửi lời mời kết bạn");
        loadSentRequests();
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, relationshipStatus: "PENDING" }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Failed to send friend request:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
        userId,
      });
      toast.error(error.message || "Không thể gửi lời mời kết bạn");
    }
  };

  const handleAcceptFriendRequest = async (userId) => {
    if (!userId) {
      toast.error("ID người dùng không hợp lệ");
      console.error("Invalid userId in handleAcceptFriendRequest:", userId);
      return;
    }
    try {
      const response = await acceptFriendRequest(userId);
      if (response.success) {
        toast.success("Đã chấp nhận lời mời kết bạn");
        loadFriends();
        loadFriendRequests();
      }
    } catch (error) {
      console.error("Failed to accept friend request:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
        userId,
      });
      toast.error(error.message || "Không thể chấp nhận lời mời kết bạn");
    }
  };

  const handleRejectFriendRequest = async (userId) => {
    if (!userId) {
      toast.error("ID người dùng không hợp lệ");
      console.error("Invalid userId in handleRejectFriendRequest:", userId);
      return;
    }
    try {
      const response = await rejectFriendRequest(userId);
      if (response.success) {
        toast.success("Đã từ chối lời mời kết bạn");
        loadFriendRequests();
      }
    } catch (error) {
      console.error("Failed to reject friend request:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
        userId,
      });
      toast.error(error.message || "Không thể từ chối lời mời kết bạn");
    }
  };

  const getFriendshipButtonText = (user) => {
    const status = user.relationshipStatus || user.status;
    switch (status) {
      case "ACCEPTED":
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
      targetUser.canSendRequest !== false &&
      targetUser.relationshipStatus !== "FRIENDS" &&
      targetUser.relationshipStatus !== "ACCEPTED" &&
      targetUser.relationshipStatus !== "PENDING" &&
      targetUser.relationshipStatus !== "BLOCKED"
    );
  };

  const normalizeAvatarUrl = (avatarUrl) => {
    if (!avatarUrl || avatarUrl === "null" || avatarUrl.trim() === "") {
      console.warn("Invalid avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
    // Prepend backend base URL for relative paths
    if (avatarUrl.startsWith("/")) {
      return `http://localhost:8080${avatarUrl}`;
    }
    // Validate absolute URLs
    try {
      new URL(avatarUrl);
      return avatarUrl;
    } catch (e) {
      console.warn("Invalid absolute avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
  };

  const UserCard = ({ user, showActions = true, actionType = "send" }) => {
    console.log(`UserCard avatarUrl for ${user.username}:`, user.avatarUrl);
    return (
      <div className="friend-card">
        <div className="friend-info">
          <div className="friend-avatar">
            <img
              src={normalizeAvatarUrl(user.avatarUrl)}
              alt={user.displayName || user.username}
              onError={(e) => {
                console.warn(
                  `Failed to load avatar for ${user.username}:`,
                  user.avatarUrl
                );
                e.target.src = "/default-avatar.png";
              }}
            />
            {user.isOnline && <div className="status-indicator online"></div>}
            {!user.isOnline && <div className="status-indicator offline"></div>}
          </div>
          <div className="friend-details">
            <h3>{user.displayName || user.username}</h3>
            <p>@{user.username}</p>
          </div>
        </div>

        {showActions && (
          <div className="friend-actions">
            {actionType === "send" && canSendFriendRequest(user) && (
              <button
                className="btn-invite"
                onClick={() => handleSendFriendRequest(user.id)}
              >
                Kết bạn
              </button>
            )}

            {actionType === "accept" && (
              <>
                <button
                  className="btn-accept"
                  onClick={() => handleAcceptFriendRequest(user.userId)}
                >
                  Chấp nhận
                </button>
                <button
                  className="btn-decline"
                  onClick={() => handleRejectFriendRequest(user.userId)}
                >
                  Từ chối
                </button>
              </>
            )}

            {actionType === "friend" && (
              <button className="btn-invite" disabled>
                Nhắn tin
              </button>
            )}

            {!canSendFriendRequest(user) && actionType === "send" && (
              <button className="btn-invite" disabled>
                {getFriendshipButtonText(user)}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
                className="btn-add-friend"
              >
                {isSearching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Kết quả tìm kiếm ({searchResults.length})</h3>
                <div className="friends-grid">
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
                    <div className="no-friends">
                      <p>Bạn chưa có bạn bè nào</p>
                      <p>Hãy tìm kiếm và kết bạn với những người khác!</p>
                    </div>
                  ) : (
                    <div className="friends-grid">
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
                    <div className="no-requests">
                      <p>Không có lời mời kết bạn nào</p>
                    </div>
                  ) : (
                    <div className="requests-grid">
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
                    <div className="no-sent">
                      <p>Không có lời mời nào đã gửi</p>
                    </div>
                  ) : (
                    <div className="sent-grid">
                      {sentRequests.map((request) => (
                        <UserCard
                          key={request.userId}
                          user={request}
                          showActions={false}
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

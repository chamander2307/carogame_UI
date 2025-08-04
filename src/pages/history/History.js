import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import {
  getUserGameStatistics,
  getUserGameReplays,
  getGameReplay,
} from "../../services/GameStatisticsService";
import { toast } from "react-toastify";
import { getVietnameseMessage } from "../../constants/VietNameseStatus";
import "./index.css";

const HistoryPage = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [userStats, setUserStats] = useState({
    totalGamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    winRate: 0,
  });

  useEffect(() => {
    if (!user) {
      console.warn("User is null or undefined, skipping API calls");
      return;
    }
    console.log("User data:", user); // Debug user object
    loadGameHistory();
    loadUserStats();
  }, [user, currentPage]);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      console.log("Calling /api/statistics/my-history with params:", {
        page: currentPage,
        size: 10,
        sortDirection: "desc",
      });
      const response = await getUserGameReplays(currentPage, 10, "desc");
      console.log("Game history response:", response);
      const games = response.content || [];
      const pages = response.totalPages || 0;
      console.log("Parsed games:", games, "Total pages:", pages);
      setGameHistory(games);
      setTotalPages(pages);
    } catch (error) {
      console.error("Failed to load game history:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await getUserGameStatistics();
      console.log("User stats response:", response);
      setUserStats({
        totalGamesPlayed: response.totalGamesPlayed || 0,
        totalWins: response.totalWins || 0,
        totalLosses: response.totalLosses || 0,
        totalDraws: response.totalDraws || 0,
        winRate: response.winRate || 0,
      });
    } catch (error) {
      console.error("Failed to load user stats:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
      });
    }
  };

  const getResultText = (result) => {
    switch (result?.toLowerCase()) {
      case "win":
        return "Thắng";
      case "lose":
        return "Thua";
      case "draw":
        return "Hòa";
      default:
        return result || "N/A";
    }
  };

  const getResultClass = (result) => {
    const resultLower = result?.toLowerCase();
    return `result ${resultLower}`;
  };

  const formatDuration = (durationMinutes) => {
    if (!durationMinutes) return "N/A";
    const minutes = Math.floor(durationMinutes);
    const seconds = Math.round((durationMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.warn("Invalid date format:", dateString);
      return dateString;
    }
  };

  const normalizeAvatarUrl = (avatarUrl) => {
    if (!avatarUrl || avatarUrl === "null" || avatarUrl.trim() === "") {
      console.warn("Invalid avatarUrl, using default:", avatarUrl);
      return "/default-avatar.png";
    }
    // Handle relative paths
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

  const handleViewGame = async (gameId) => {
    if (!gameId) {
      toast.error("ID trận đấu không hợp lệ");
      console.error("Invalid gameId:", gameId);
      return;
    }
    try {
      const response = await getGameReplay(gameId);
      console.log("Game replay:", response);
      toast.info("Tính năng xem lại trận đấu sẽ được cập nhật sớm");
    } catch (error) {
      console.error("Failed to load game replay:", {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.errorCode,
        gameId,
      });
      toast.error(error.message || "Có lỗi xảy ra khi tải replay trận đấu");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const StatCard = ({ title, value, className = "" }) => (
    <div className={`stat-card ${className}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1>Lịch sử trận đấu</h1>
          <div className="history-stats">
            <StatCard
              title="Tổng trận"
              value={userStats.totalGamesPlayed}
              className="total"
            />
            <StatCard
              title="Thắng"
              value={userStats.totalWins}
              className="wins"
            />
            <StatCard
              title="Thua"
              value={userStats.totalLosses}
              className="losses"
            />
            <StatCard
              title="Hòa"
              value={userStats.totalDraws}
              className="draws"
            />
            <StatCard
              title="Tỷ lệ thắng"
              value={`${(userStats.winRate || 0).toFixed(1)}%`}
              className="winrate"
            />
          </div>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải lịch sử trận đấu...</p>
            </div>
          ) : gameHistory.length === 0 ? (
            <div className="no-games">
              <p>Không có trận đấu nào được tìm thấy</p>
            </div>
          ) : (
            <>
              <div className="games-list">
                <div className="games-table">
                  <div className="table-header">
                    <span className="col-opponent">Đối thủ</span>
                    <span className="col-result">Kết quả</span>
                    <span className="col-duration">Thời gian</span>
                    <span className="col-moves">Số nước</span>
                    <span className="col-date">Ngày</span>
                    <span className="col-action">Hành động</span>
                  </div>
                  {gameHistory.map((game) => (
                    <div key={game.gameId} className="table-row">
                      <div className="col-opponent">
                        <div className="opponent-info">
                          <div className="opponent-avatar">
                            <img
                              src={normalizeAvatarUrl(game.opponentAvatar)}
                              alt={game.opponentName || "Unknown"}
                              onError={(e) => {
                                console.warn(
                                  `Failed to load avatar for ${
                                    game.opponentName || "Unknown"
                                  }:`,
                                  game.opponentAvatar
                                );
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          </div>
                          <span>{game.opponentName || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="col-result">
                        <span className={getResultClass(game.gameResult)}>
                          {getResultText(game.gameResult)}
                        </span>
                      </div>
                      <div className="col-duration">
                        {formatDuration(game.gameDurationMinutes)}
                      </div>
                      <div className="col-moves">{game.totalMoves || 0}</div>
                      <div className="col-date">
                        {formatDate(game.gameEndTime)}
                      </div>
                      <div className="col-action">
                        <button
                          className="btn-view"
                          onClick={() => handleViewGame(game.gameId)}
                        >
                          Xem lại
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 0}
                    onClick={handlePreviousPage}
                  >
                    ← Trước
                  </button>
                  <span className="page-info">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={currentPage >= totalPages - 1}
                    onClick={handleNextPage}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;

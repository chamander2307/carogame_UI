import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import {
  getUserGameStatistics,
  getUserGameReplays,
  getGameReplay,
} from "../../services/GameStatisticsService";
import { toast } from "react-toastify";
import "./index.css";

const HistoryPage = () => {
  const { user } = useContext(UserContext);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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
    if (!user) return;
    loadGameHistory();
    loadUserStats();
  }, [user, currentPage]);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      const response = await getUserGameReplays(currentPage, 10, "desc");
      setGameHistory(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Failed to load game history:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải lịch sử trận đấu");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await getUserGameStatistics();
      setUserStats({
        totalGamesPlayed: response.totalGamesPlayed || 0,
        totalWins: response.totalWins || 0,
        totalLosses: response.totalLosses || 0,
        totalDraws: response.totalDraws || 0,
        winRate: response.winRate || 0,
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải thống kê người dùng");
    }
  };

  const filteredGames = gameHistory.filter((game) => {
    if (filter !== "all" && game.gameResult?.toLowerCase() !== filter) {
      return false;
    }
    if (!searchTerm) return true;
    const opponent = game.opponentName || "";
    return opponent.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return dateString;
    }
  };

  const handleViewGame = async (gameId) => {
    try {
      const response = await getGameReplay(gameId);
      console.log("Game replay:", response);
      toast.info("Tính năng xem lại trận đấu sẽ được cập nhật sớm");
    } catch (error) {
      console.error("Failed to load game replay:", error);
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
      <div className="stat-title">{title}</div>
    </div>
  );

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1>Lịch sử trận đấu</h1>

          {/* User Statistics */}
          <div className="user-stats">
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

        <div className="history-filters">
          <div className="filter-group">
            <label>Lọc theo kết quả:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="win">Thắng</option>
              <option value="lose">Thua</option>
              <option value="draw">Hòa</option>
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Tìm kiếm đối thủ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải lịch sử trận đấu...</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="no-games">
              <p>Không có trận đấu nào được tìm thấy</p>
            </div>
          ) : (
            <>
              <div className="games-list">
                {filteredGames.map((game) => (
                  <div key={game.gameId} className="game-item">
                    <div className="game-info">
                      <div className="opponent-info">
                        <span className="opponent-name">
                          {game.opponentName || "Unknown"}
                        </span>
                        <span className={getResultClass(game.gameResult)}>
                          {getResultText(game.gameResult)}
                        </span>
                      </div>
                      <div className="game-details">
                        <span className="duration">
                          ⏱️ {formatDuration(game.gameDurationMinutes)}
                        </span>
                        <span className="moves">
                          🎯 {game.totalMoves || 0} nước
                        </span>
                        <span className="date">
                          📅 {formatDate(game.gameEndTime)}
                        </span>
                        <span className="win-condition">
                          🏆 {game.endReason || "N/A"}
                        </span>
                      </div>
                    </div>
                    <button
                      className="view-game-btn"
                      onClick={() => handleViewGame(game.gameId)}
                    >
                      Xem lại
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
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

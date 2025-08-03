import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { GameRoomService } from "../../services";
import { toast } from "react-toastify";
import "./index.css";

const HistoryPage = () => {
  const { user } = useContext(UserContext);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Real data from GameRoomService
  const [gameHistory, setGameHistory] = useState([]);
  const [userStats, setUserStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
  });

  useEffect(() => {
    loadGameHistory();
    loadUserStats();
  }, [currentPage, filter]);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 10,
        sort: "gameEndedAt",
        direction: "desc",
      };

      // Apply filter if not 'all'
      if (filter !== "all") {
        params.result = filter;
      }

      const response = await GameRoomService.getGameHistory(params);
      console.log(response);
      if (response.success && response.data) {
        const historyData = response.data;
        setGameHistory(historyData.content || []);
        setTotalPages(historyData.totalPages || 0);
      } else {
        toast.error("Không thể tải lịch sử trận đấu");
      }
    } catch (error) {
      console.error("Failed to load game history:", error);
      toast.error("Có lỗi xảy ra khi tải lịch sử trận đấu");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get game history to calculate stats
      const response = await GameRoomService.getGameHistory({
        page: 0,
        size: 1000, // Get all games for stats calculation
      });

      if (response.success && response.data) {
        const games = response.data.content || [];
        const totalGames = games.length;
        const wins = games.filter((game) => game.result === "WIN").length;
        const losses = games.filter((game) => game.result === "LOSE").length;
        const draws = games.filter((game) => game.result === "DRAW").length;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        setUserStats({
          totalGames,
          wins,
          losses,
          draws,
          winRate,
        });
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const filteredGames = gameHistory.filter((game) => {
    if (!searchTerm) return true;
    const opponent = game.opponent || game.opponentName || "";
    return opponent.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getResultText = (result) => {
    switch (result) {
      case "WIN":
      case "win":
        return "Thắng";
      case "LOSE":
      case "lose":
        return "Thua";
      case "DRAW":
      case "draw":
        return "Hòa";
      default:
        return result;
    }
  };

  const getResultClass = (result) => {
    const resultLower = result?.toLowerCase();
    return `result ${resultLower}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    if (typeof duration === "string" && duration.includes(":")) {
      return duration;
    }
    // Convert seconds to mm:ss format
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
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
      const response = await GameRoomService.getRoomDetail(gameId);
      if (response.success && response.data) {
        // Open game replay modal or navigate to game detail page
        console.log("Game detail:", response.data);
        toast.info("Tính năng xem lại trận đấu sẽ được cập nhật sớm");
      } else {
        toast.error("Không thể tải chi tiết trận đấu");
      }
    } catch (error) {
      console.error("Failed to load game detail:", error);
      toast.error("Có lỗi xảy ra khi tải chi tiết trận đấu");
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
              value={userStats.totalGames}
              className="total"
            />
            <StatCard title="Thắng" value={userStats.wins} className="wins" />
            <StatCard
              title="Thua"
              value={userStats.losses}
              className="losses"
            />
            <StatCard title="Hòa" value={userStats.draws} className="draws" />
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
                  <div key={game.id || game.gameId} className="game-item">
                    <div className="game-info">
                      <div className="opponent-info">
                        <span className="opponent-name">
                          {game.opponent || game.opponentName || "Unknown"}
                        </span>
                        <span className={getResultClass(game.result)}>
                          {getResultText(game.result)}
                        </span>
                      </div>
                      <div className="game-details">
                        <span className="duration">
                          ⏱️ {formatDuration(game.duration)}
                        </span>
                        <span className="moves">
                          🎯 {game.moves || game.totalMoves || 0} nước
                        </span>
                        <span className="date">
                          📅 {formatDate(game.date || game.createdAt)}
                        </span>
                        <span className="win-condition">
                          🏆{" "}
                          {game.winCondition || game.endReason || "5 liên tiếp"}
                        </span>
                      </div>
                    </div>
                    <button
                      className="view-game-btn"
                      onClick={() => handleViewGame(game.id || game.gameId)}
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

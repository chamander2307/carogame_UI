import React, { useState } from "react";
import "./index.css";

const HistoryPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data cho lịch sử trận đấu
  const [gameHistory] = useState([
    {
      id: 1,
      opponent: "ProGamer123",
      result: "win",
      duration: "15:30",
      date: "2025-01-27",
      moves: 42,
      winCondition: "5 in row",
    },
    {
      id: 2,
      opponent: "ChessLover",
      result: "lose",
      duration: "22:15",
      date: "2025-01-26",
      moves: 67,
      winCondition: "5 in row",
    },
    {
      id: 3,
      opponent: "GameMaster",
      result: "draw",
      duration: "45:20",
      date: "2025-01-25",
      moves: 225,
      winCondition: "board full",
    },
    {
      id: 4,
      opponent: "NewPlayer99",
      result: "win",
      duration: "8:45",
      date: "2025-01-24",
      moves: 28,
      winCondition: "5 in row",
    },
    {
      id: 5,
      opponent: "StrategicMind",
      result: "win",
      duration: "18:30",
      date: "2025-01-23",
      moves: 55,
      winCondition: "5 in row",
    },
  ]);

  const filteredGames = gameHistory.filter((game) => {
    const matchesFilter = filter === "all" || game.result === filter;
    const matchesSearch = game.opponent
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getResultText = (result) => {
    switch (result) {
      case "win":
        return "Thắng";
      case "lose":
        return "Thua";
      case "draw":
        return "Hòa";
      default:
        return result;
    }
  };

  const getResultClass = (result) => {
    return `result ${result}`;
  };

  const handleViewGame = (gameId) => {
    console.log("Viewing game:", gameId);
    // Logic xem lại trận đấu sẽ được implement sau
  };

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1>Lịch sử trận đấu</h1>
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

        <div className="history-stats">
          <div className="stat-card">
            <div className="stat-value">
              {gameHistory.filter((g) => g.result === "win").length}
            </div>
            <div className="stat-label">Trận thắng</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {gameHistory.filter((g) => g.result === "lose").length}
            </div>
            <div className="stat-label">Trận thua</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {gameHistory.filter((g) => g.result === "draw").length}
            </div>
            <div className="stat-label">Trận hòa</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {Math.round(
                (gameHistory.filter((g) => g.result === "win").length /
                  gameHistory.length) *
                  100
              )}
              %
            </div>
            <div className="stat-label">Tỉ lệ thắng</div>
          </div>
        </div>

        <div className="games-list">
          {filteredGames.length === 0 ? (
            <div className="no-games">
              <p>Không tìm thấy trận đấu nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="games-table">
              <div className="table-header">
                <div className="col-opponent">Đối thủ</div>
                <div className="col-result">Kết quả</div>
                <div className="col-duration">Thời gian</div>
                <div className="col-moves">Số nước</div>
                <div className="col-date">Ngày chơi</div>
                <div className="col-actions">Hành động</div>
              </div>
              {filteredGames.map((game) => (
                <div key={game.id} className="table-row">
                  <div className="col-opponent">
                    <div className="opponent-info">
                      <div className="opponent-avatar">
                        {game.opponent.charAt(0).toUpperCase()}
                      </div>
                      <span>{game.opponent}</span>
                    </div>
                  </div>
                  <div className="col-result">
                    <span className={getResultClass(game.result)}>
                      {getResultText(game.result)}
                    </span>
                  </div>
                  <div className="col-duration">{game.duration}</div>
                  <div className="col-moves">{game.moves}</div>
                  <div className="col-date">
                    {new Date(game.date).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-view"
                      onClick={() => handleViewGame(game.id)}
                    >
                      Xem lại
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;

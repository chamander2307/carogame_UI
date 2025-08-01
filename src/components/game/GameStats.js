import React from "react";
import "./GameStats.css";

const GameStats = ({
  currentPlayer,
  moveHistory,
  gameStatus,
  winner,
  gameTime,
  playerXName = "Người chơi X",
  playerOName = "Người chơi O",
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPlayerStats = (player) => {
    const moves = moveHistory.filter((move) => move.player === player);
    return {
      moveCount: moves.length,
      lastMove: moves[moves.length - 1] || null,
    };
  };

  const playerXStats = getPlayerStats(1);
  const playerOStats = getPlayerStats(2);

  return (
    <div className="game-stats-panel">
      <div className="stats-header">
        <h3>Thống kê trận đấu</h3>
        {gameTime !== undefined && (
          <div className="game-timer">{formatTime(gameTime)}</div>
        )}
      </div>

      <div className="players-stats">
        <div
          className={`player-stat ${currentPlayer === 1 ? "active" : ""} ${
            winner === 1 ? "winner" : ""
          }`}
        >
          <div className="player-header">
            <div className="player-symbol x">×</div>
            <div className="player-info">
              <h4>{playerXName}</h4>
              <span className="player-role">Người chơi X</span>
            </div>
          </div>
          <div className="player-moves">
            <div className="move-count">
              <span className="label">Số nước đã đi:</span>
              <span className="value">{playerXStats.moveCount}</span>
            </div>
            {playerXStats.lastMove && (
              <div className="last-move">
                <span className="label">Nước cuối:</span>
                <span className="value">
                  ({playerXStats.lastMove.row + 1},{" "}
                  {playerXStats.lastMove.col + 1})
                </span>
              </div>
            )}
          </div>
          {winner === 1 && <div className="winner-badge">Chiến thắng!</div>}
        </div>

        <div className="vs-divider">VS</div>

        <div
          className={`player-stat ${currentPlayer === 2 ? "active" : ""} ${
            winner === 2 ? "winner" : ""
          }`}
        >
          <div className="player-header">
            <div className="player-symbol o">○</div>
            <div className="player-info">
              <h4>{playerOName}</h4>
              <span className="player-role">Người chơi O</span>
            </div>
          </div>
          <div className="player-moves">
            <div className="move-count">
              <span className="label">Số nước đã đi:</span>
              <span className="value">{playerOStats.moveCount}</span>
            </div>
            {playerOStats.lastMove && (
              <div className="last-move">
                <span className="label">Nước cuối:</span>
                <span className="value">
                  ({playerOStats.lastMove.row + 1},{" "}
                  {playerOStats.lastMove.col + 1})
                </span>
              </div>
            )}
          </div>
          {winner === 2 && <div className="winner-badge">Chiến thắng!</div>}
        </div>
      </div>

      <div className="game-info">
        <div className="info-item">
          <span className="label">Tổng số nước:</span>
          <span className="value">{moveHistory.length}</span>
        </div>
        <div className="info-item">
          <span className="label">Trạng thái:</span>
          <span className={`value status ${gameStatus}`}>
            {gameStatus === "playing" && "Đang chơi"}
            {gameStatus === "won" && "Đã kết thúc"}
            {gameStatus === "draw" && "Hòa"}
          </span>
        </div>
        {gameStatus === "playing" && (
          <div className="current-turn">
            <span className="label">Lượt của:</span>
            <span
              className={`value turn-indicator ${
                currentPlayer === 1 ? "x" : "o"
              }`}
            >
              {currentPlayer === 1 ? playerXName : playerOName}
            </span>
          </div>
        )}
      </div>

      {moveHistory.length > 0 && (
        <div className="move-history">
          <h4>📝 Lịch sử nước đi</h4>
          <div className="history-list">
            {moveHistory.slice(-5).map((move, index) => (
              <div
                key={moveHistory.length - 5 + index}
                className="history-item"
              >
                <span className="move-number">
                  {moveHistory.length - 5 + index + 1}.
                </span>
                <span
                  className={`move-symbol ${move.player === 1 ? "x" : "o"}`}
                >
                  {move.player === 1 ? "×" : "○"}
                </span>
                <span className="move-position">
                  ({move.row + 1}, {move.col + 1})
                </span>
              </div>
            ))}
            {moveHistory.length > 5 && (
              <div className="history-more">
                ... và {moveHistory.length - 5} nước trước đó
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;

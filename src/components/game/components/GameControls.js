import React, { memo } from "react";
import "./GameControls.css";

/**
 * Game Controls Component
 * Action buttons for game management
 */
const GameControls = memo(
  ({
    gameState,
    roomId,
    onSurrender,
    onRequestRematch,
    onAcceptRematch,
    onShowHistory,
    onShowSettings,
    disabled = false,
  }) => {
    /**
     * Check if surrender is available
     */
    const canSurrender = () => {
      return gameState.gameStatus === "playing" && !disabled;
    };

    /**
     * Check if rematch is available
     */
    const canRequestRematch = () => {
      return gameState.gameStatus === "finished" && !disabled;
    };

    /**
     * Handle surrender with confirmation
     */
    const handleSurrender = () => {
      if (!canSurrender()) return;

      const confirmed = window.confirm(
        "Bạn có chắc muốn đầu hàng? Trận đấu sẽ kết thúc và bạn sẽ thua."
      );

      if (confirmed && onSurrender) {
        onSurrender();
      }
    };

    /**
     * Handle rematch request
     */
    const handleRequestRematch = () => {
      if (!canRequestRematch()) return;

      if (onRequestRematch) {
        onRequestRematch();
      }
    };

    return (
      <div className="game-controls">
        <div className="controls-header">
          <h3>Điều khiển</h3>
        </div>

        <div className="controls-grid">
          {/* Game Actions */}
          <div className="control-section">
            <h4>Trận đấu</h4>

            {/* Surrender Button */}
            <button
              className="btn btn-danger control-btn"
              onClick={handleSurrender}
              disabled={!canSurrender()}
              title={
                canSurrender()
                  ? "Đầu hàng và kết thúc trận đấu"
                  : "Không thể đầu hàng lúc này"
              }
            >
              <span className="btn-icon">🏳️</span>
              <span>Đầu hàng</span>
            </button>

            {/* Rematch Button */}
            <button
              className="btn btn-warning control-btn"
              onClick={handleRequestRematch}
              disabled={!canRequestRematch()}
              title={
                canRequestRematch()
                  ? "Yêu cầu chơi lại"
                  : "Chỉ có thể yêu cầu chơi lại sau khi trận đấu kết thúc"
              }
            >
              <span className="btn-icon">🔄</span>
              <span>Chơi lại</span>
            </button>
          </div>

          {/* Info Actions */}
          <div className="control-section">
            <h4>Thông tin</h4>

            {/* Game History Button */}
            <button
              className="btn btn-secondary control-btn"
              onClick={onShowHistory}
              disabled={disabled}
              title="Xem lịch sử nước đi"
            >
              <span className="btn-icon">📋</span>
              <span>Lịch sử</span>
            </button>

            {/* Settings Button */}
            <button
              className="btn btn-secondary control-btn"
              onClick={onShowSettings}
              disabled={disabled}
              title="Cài đặt game"
            >
              <span className="btn-icon">⚙️</span>
              <span>Cài đặt</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="control-section">
            <h4>Thống kê</h4>

            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Nước đi:</span>
                <span className="stat-value">{gameState.moveCount || 0}</span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Trạng thái:</span>
                <span className={`stat-value status-${gameState.gameStatus}`}>
                  {gameState.gameStatus === "waiting" && "Chờ"}
                  {gameState.gameStatus === "playing" && "Đang chơi"}
                  {gameState.gameStatus === "finished" && "Kết thúc"}
                </span>
              </div>

              {gameState.winner && (
                <div className="stat-item">
                  <span className="stat-label">Kết quả:</span>
                  <span className="stat-value">
                    {gameState.winner === "DRAW"
                      ? "Hòa"
                      : `Người thắng: ${gameState.winner}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Room Actions */}
          <div className="control-section">
            <h4>Phòng</h4>

            {/* Leave Room Button */}
            <button
              className="btn btn-secondary control-btn"
              onClick={() => {
                const confirmed = window.confirm("Bạn có chắc muốn rời phòng?");
                if (confirmed) {
                  window.history.back();
                }
              }}
              disabled={disabled}
              title="Rời khỏi phòng"
            >
              <span className="btn-icon">🚪</span>
              <span>Rời phòng</span>
            </button>

            {/* Copy Room ID */}
            <button
              className="btn btn-secondary control-btn"
              onClick={() => {
                navigator.clipboard.writeText(roomId?.toString() || "");
                // You might want to show a toast notification here
              }}
              disabled={disabled}
              title="Sao chép ID phòng"
            >
              <span className="btn-icon">📋</span>
              <span>Sao chép ID</span>
            </button>
          </div>
        </div>

        {/* Game Status Indicator */}
        <div className="status-indicator-panel">
          <div className="status-row">
            <span className="status-label">Kết nối:</span>
            <div className="connection-status online">
              <div className="status-dot"></div>
              <span>Đã kết nối</span>
            </div>
          </div>

          {gameState.gameStatus === "playing" && (
            <div className="status-row">
              <span className="status-label">Lượt:</span>
              <div className="turn-status">
                {gameState.isMyTurn ? (
                  <span className="my-turn">🎯 Lượt của bạn</span>
                ) : (
                  <span className="opponent-turn">⏳ Chờ đối thủ</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

GameControls.displayName = "GameControls";

export default GameControls;

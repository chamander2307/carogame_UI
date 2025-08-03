import React, { memo } from "react";
import "./GameTimer.css";

/**
 * Game Timer Component
 * Shows game duration and player timers
 */
const GameTimer = memo(
  ({
    gameTimer = { minutes: 0, seconds: 0 },
    playerTimers = {},
    currentPlayer,
    gameStatus,
    showPlayerTimers = true,
  }) => {
    /**
     * Format time to MM:SS
     */
    const formatTime = (minutes, seconds) => {
      const m = Math.floor(minutes || 0);
      const s = Math.floor(seconds || 0);
      return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    };

    /**
     * Get timer class based on remaining time
     */
    const getTimerClass = (minutes, seconds) => {
      const totalSeconds = (minutes || 0) * 60 + (seconds || 0);

      if (totalSeconds <= 30) return "timer-critical";
      if (totalSeconds <= 60) return "timer-warning";
      if (totalSeconds <= 180) return "timer-low";
      return "timer-normal";
    };

    /**
     * Check if it's a player's turn
     */
    const isPlayerTurn = (playerSymbol) => {
      return gameStatus === "playing" && currentPlayer === playerSymbol;
    };

    const PLAYER_X = 1;
    const PLAYER_O = 2;

    return (
      <div className="game-timer">
        {/* Game Duration */}
        <div className="game-duration">
          <div className="timer-label">Thời gian trận đấu</div>
          <div className="main-timer">
            {formatTime(gameTimer.minutes, gameTimer.seconds)}
          </div>
          <div className="timer-status">
            {gameStatus === "waiting" && (
              <span className="status-waiting">Chờ bắt đầu</span>
            )}
            {gameStatus === "playing" && (
              <span className="status-playing">Đang diễn ra</span>
            )}
            {gameStatus === "finished" && (
              <span className="status-finished">Đã kết thúc</span>
            )}
          </div>
        </div>

        {/* Player Timers */}
        {showPlayerTimers && (
          <div className="player-timers">
            {/* Player X Timer */}
            <div
              className={`player-timer player-x ${
                isPlayerTurn(PLAYER_X) ? "active-turn" : ""
              }`}
            >
              <div className="player-symbol">
                <svg viewBox="0 0 24 24" className="symbol-icon">
                  <path d="M18.36 6.64a1 1 0 0 1 0 1.41L13.41 13l4.95 4.95a1 1 0 1 1-1.41 1.41L12 14.41l-4.95 4.95a1 1 0 0 1-1.41-1.41L10.59 13 5.64 8.05a1 1 0 0 1 1.41-1.41L12 11.59l4.95-4.95a1 1 0 0 1 1.41 0z" />
                </svg>
              </div>
              <div className="timer-info">
                <div className="timer-label">Người chơi X</div>
                <div
                  className={`player-time ${getTimerClass(
                    playerTimers[PLAYER_X]?.minutes,
                    playerTimers[PLAYER_X]?.seconds
                  )}`}
                >
                  {formatTime(
                    playerTimers[PLAYER_X]?.minutes,
                    playerTimers[PLAYER_X]?.seconds
                  )}
                </div>
              </div>
              {isPlayerTurn(PLAYER_X) && (
                <div className="turn-indicator">
                  <div className="turn-pulse"></div>
                </div>
              )}
            </div>

            {/* Timer Divider */}
            <div className="timer-divider">
              <div className="divider-line"></div>
              <div className="divider-dot"></div>
              <div className="divider-line"></div>
            </div>

            {/* Player O Timer */}
            <div
              className={`player-timer player-o ${
                isPlayerTurn(PLAYER_O) ? "active-turn" : ""
              }`}
            >
              <div className="player-symbol">
                <svg viewBox="0 0 24 24" className="symbol-icon">
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="timer-info">
                <div className="timer-label">Người chơi O</div>
                <div
                  className={`player-time ${getTimerClass(
                    playerTimers[PLAYER_O]?.minutes,
                    playerTimers[PLAYER_O]?.seconds
                  )}`}
                >
                  {formatTime(
                    playerTimers[PLAYER_O]?.minutes,
                    playerTimers[PLAYER_O]?.seconds
                  )}
                </div>
              </div>
              {isPlayerTurn(PLAYER_O) && (
                <div className="turn-indicator">
                  <div className="turn-pulse"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="timer-actions">
          {gameStatus === "playing" && (
            <div className="current-turn">
              {currentPlayer === PLAYER_X ? "Lượt: X" : "Lượt: O"}
            </div>
          )}
        </div>
      </div>
    );
  }
);

GameTimer.displayName = "GameTimer";

export default GameTimer;

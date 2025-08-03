import React, { memo } from "react";
import "./PlayerPanel.css";

const PLAYER_X = 1;
const PLAYER_O = 2;

/**
 * Player Panel Component
 * Shows player information, avatars, and game status
 */
const PlayerPanel = memo(
  ({
    players = [],
    currentUser,
    myPlayerSymbol,
    currentPlayer,
    gameStatus,
  }) => {
    /**
     * Get player display data
     */
    const getPlayerData = (player, symbol) => {
      const isCurrentPlayer = currentPlayer === symbol;
      const isMe = player?.id === currentUser?.id;
      const isMySymbol = symbol === myPlayerSymbol;

      return {
        player,
        symbol,
        isCurrentPlayer,
        isMe,
        isMySymbol,
        symbolDisplay: symbol === PLAYER_X ? "X" : "O",
        name: player?.username || player?.name || "Đang chờ...",
        avatar: player?.avatar || "/default-avatar.png",
        isOnline: player?.isOnline !== false,
        isReady: player?.readyState === "READY",
        rating: player?.rating || 0,
      };
    };

    // Find players by symbol
    const playerX = players.find(
      (p) =>
        p.symbol === "X" ||
        (myPlayerSymbol === PLAYER_X && p.id === currentUser?.id) ||
        (myPlayerSymbol === PLAYER_O && p.id !== currentUser?.id)
    );

    const playerO = players.find(
      (p) =>
        p.symbol === "O" ||
        (myPlayerSymbol === PLAYER_O && p.id === currentUser?.id) ||
        (myPlayerSymbol === PLAYER_X && p.id !== currentUser?.id)
    );

    const playerXData = getPlayerData(playerX, PLAYER_X);
    const playerOData = getPlayerData(playerO, PLAYER_O);

    /**
     * Render player card
     */
    const renderPlayerCard = (playerData) => {
      const {
        player,
        symbol,
        isCurrentPlayer,
        isMe,
        // isMySymbol, // TODO: Use for additional player info display
        // symbolDisplay, // TODO: Use for symbol rendering
        name,
        avatar,
        isOnline,
        isReady,
        rating,
      } = playerData;

      const cardClasses = [
        "player-card",
        symbol === PLAYER_X ? "player-x" : "player-o",
        isCurrentPlayer && gameStatus === "playing" ? "current-turn" : "",
        isMe ? "my-player" : "",
        !player ? "empty-slot" : "",
        !isOnline ? "offline" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div key={symbol} className={cardClasses}>
          {/* Player Symbol */}
          <div className="player-symbol">
            <div
              className={`symbol-display ${
                symbol === PLAYER_X ? "symbol-x" : "symbol-o"
              }`}
            >
              {symbol === PLAYER_X ? (
                <svg viewBox="0 0 24 24" className="symbol-icon">
                  <path d="M18.36 6.64a1 1 0 0 1 0 1.41L13.41 13l4.95 4.95a1 1 0 1 1-1.41 1.41L12 14.41l-4.95 4.95a1 1 0 0 1-1.41-1.41L10.59 13 5.64 8.05a1 1 0 0 1 1.41-1.41L12 11.59l4.95-4.95a1 1 0 0 1 1.41 0z" />
                </svg>
              ) : (
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
              )}
            </div>
          </div>

          {/* Player Avatar */}
          <div className="player-avatar">
            <img
              src={avatar}
              alt={name}
              className="avatar-image"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />

            {/* Online/Offline Indicator */}
            <div
              className={`status-indicator ${isOnline ? "online" : "offline"}`}
            />

            {/* Current Turn Indicator */}
            {isCurrentPlayer && gameStatus === "playing" && (
              <div className="turn-indicator">
                <div className="turn-pulse" />
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="player-info">
            <div className="player-name">
              {name}
              {isMe && <span className="me-badge">Bạn</span>}
            </div>

            {player && (
              <div className="player-details">
                <div className="player-rating">⭐ {rating}</div>

                {gameStatus === "waiting" && (
                  <div
                    className={`ready-status ${
                      isReady ? "ready" : "not-ready"
                    }`}
                  >
                    {isReady ? "✓ Sẵn sàng" : "⏳ Chờ..."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Turn Label */}
          {isCurrentPlayer && gameStatus === "playing" && (
            <div className="turn-label">Lượt của {isMe ? "bạn" : name}</div>
          )}
        </div>
      );
    };

    return (
      <div className="player-panel">
        <div className="panel-header">
          <h3>Người chơi</h3>
          <div className="game-mode">Gomoku</div>
        </div>

        <div className="players-container">
          {renderPlayerCard(playerXData)}

          <div className="vs-divider">
            <span>VS</span>
          </div>

          {renderPlayerCard(playerOData)}
        </div>

        {/* Game Status */}
        <div className="game-status-info">
          {gameStatus === "waiting" && (
            <div className="status-waiting">
              <div className="status-icon">⏳</div>
              <span>Đang chờ người chơi...</span>
            </div>
          )}

          {gameStatus === "playing" && (
            <div className="status-playing">
              <div className="status-icon">🎮</div>
              <span>Trận đấu đang diễn ra</span>
            </div>
          )}

          {gameStatus === "finished" && (
            <div className="status-finished">
              <div className="status-icon">🏁</div>
              <span>Trận đấu kết thúc</span>
            </div>
          )}
        </div>

        {/* Next Game Hint */}
        {gameStatus === "playing" && myPlayerSymbol && (
          <div className="next-turn-hint">
            {currentPlayer === myPlayerSymbol ? (
              <span className="my-turn">💡 Đến lượt bạn!</span>
            ) : (
              <span className="opponent-turn">⏰ Chờ đối thủ...</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

PlayerPanel.displayName = "PlayerPanel";

export default PlayerPanel;

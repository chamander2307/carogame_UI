import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  RotateCcw,
  Play,
  Download,
  Eye,
} from "lucide-react";
import "./GameHistory.css";

const GameHistory = ({
  moves = [],
  currentMoveIndex = -1,
  onJumpToMove,
  onReviewMode,
  isReviewMode = false,
  gameId = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);
  const historyRef = useRef(null);
  const moveRefs = useRef([]);

  // Auto-scroll to current move
  useEffect(() => {
    if (currentMoveIndex >= 0 && moveRefs.current[currentMoveIndex]) {
      moveRefs.current[currentMoveIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentMoveIndex]);

  // Format move notation
  const formatMove = (move, index) => {
    const colLetter = String.fromCharCode(65 + move.col); // A-O
    const rowNumber = move.row + 1; // 1-15
    return `${index + 1}. ${colLetter}${rowNumber}`;
  };

  // Get move description
  const getMoveDescription = (move, index) => {
    if (index === 0) return "Opening move";
    if (move.isWinningMove) return "Winning move!";
    if (move.threatsCreated > 0)
      return `Created ${move.threatsCreated} threat(s)`;
    if (move.threatsBlocked > 0)
      return `Blocked ${move.threatsBlocked} threat(s)`;
    return move.player === "X" ? "Black move" : "White move";
  };

  // Group moves by pairs (for display)
  const groupedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      blackMove: moves[i],
      whiteMove: moves[i + 1] || null,
      blackIndex: i,
      whiteIndex: i + 1,
    });
  }

  const handleMoveClick = (moveIndex) => {
    setSelectedMove(moveIndex);
    if (onJumpToMove) {
      onJumpToMove(moveIndex);
    }
  };

  const handleReviewToggle = () => {
    if (onReviewMode) {
      onReviewMode(!isReviewMode);
    }
  };

  const exportGameHistory = () => {
    const gameData = {
      gameId,
      timestamp: new Date().toISOString(),
      moves: moves.map((move, index) => ({
        moveNumber: index + 1,
        player: move.player,
        position: formatMove(move, index),
        row: move.row,
        col: move.col,
        timestamp: move.timestamp || new Date().toISOString(),
      })),
      totalMoves: moves.length,
      result: moves[moves.length - 1]?.isWinningMove
        ? `${moves[moves.length - 1].player} wins`
        : "In progress",
    };

    const blob = new Blob([JSON.stringify(gameData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gomoku-game-${gameId || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`game-history ${isExpanded ? "expanded" : "collapsed"}`}>
      {/* Header */}
      <div
        className="history-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-content">
          <History className="history-icon" size={16} />
          <span className="header-title">Game History</span>
          <span className="move-count">({moves.length} moves)</span>
        </div>
        <div className="header-actions">
          {moves.length > 0 && (
            <>
              <button
                className="action-btn review-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewToggle();
                }}
                title={isReviewMode ? "Exit Review Mode" : "Enter Review Mode"}
              >
                {isReviewMode ? <Play size={14} /> : <Eye size={14} />}
              </button>
              <button
                className="action-btn export-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  exportGameHistory();
                }}
                title="Export Game History"
              >
                <Download size={14} />
              </button>
            </>
          )}
          <button className="expand-btn">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* History Content */}
      {isExpanded && (
        <div className="history-content" ref={historyRef}>
          {moves.length === 0 ? (
            <div className="empty-history">
              <History className="empty-icon" size={24} />
              <p>No moves yet</p>
              <span>Game history will appear here</span>
            </div>
          ) : (
            <div className="moves-container">
              {/* Column Headers */}
              <div className="move-headers">
                <div className="move-number-header">#</div>
                <div className="player-header">Black</div>
                <div className="player-header">White</div>
              </div>

              {/* Move Rows */}
              <div className="moves-list">
                {groupedMoves.map((group) => (
                  <div key={group.moveNumber} className="move-row">
                    <div className="move-number">{group.moveNumber}</div>

                    {/* Black Move */}
                    <div
                      ref={(el) => (moveRefs.current[group.blackIndex] = el)}
                      className={`move-cell black-move ${
                        currentMoveIndex === group.blackIndex
                          ? "current-move"
                          : ""
                      } ${
                        selectedMove === group.blackIndex ? "selected-move" : ""
                      }`}
                      onClick={() => handleMoveClick(group.blackIndex)}
                    >
                      <div className="move-notation">
                        {formatMove(group.blackMove, group.blackIndex)}
                      </div>
                      <div className="move-description">
                        {getMoveDescription(group.blackMove, group.blackIndex)}
                      </div>
                      {group.blackMove.isWinningMove && (
                        <div className="winning-indicator">★</div>
                      )}
                    </div>

                    {/* White Move */}
                    <div
                      ref={(el) =>
                        group.whiteMove &&
                        (moveRefs.current[group.whiteIndex] = el)
                      }
                      className={`move-cell white-move ${
                        group.whiteMove ? "" : "empty-move"
                      } ${
                        currentMoveIndex === group.whiteIndex
                          ? "current-move"
                          : ""
                      } ${
                        selectedMove === group.whiteIndex ? "selected-move" : ""
                      }`}
                      onClick={() =>
                        group.whiteMove && handleMoveClick(group.whiteIndex)
                      }
                    >
                      {group.whiteMove ? (
                        <>
                          <div className="move-notation">
                            {formatMove(group.whiteMove, group.whiteIndex)}
                          </div>
                          <div className="move-description">
                            {getMoveDescription(
                              group.whiteMove,
                              group.whiteIndex
                            )}
                          </div>
                          {group.whiteMove.isWinningMove && (
                            <div className="winning-indicator">★</div>
                          )}
                        </>
                      ) : (
                        <div className="empty-placeholder">-</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Mode Controls */}
              {isReviewMode && moves.length > 0 && (
                <div className="review-controls">
                  <button
                    className="review-btn"
                    onClick={() => handleMoveClick(-1)}
                    disabled={currentMoveIndex <= -1}
                  >
                    <RotateCcw size={14} />
                    Start
                  </button>
                  <button
                    className="review-btn"
                    onClick={() => handleMoveClick(currentMoveIndex - 1)}
                    disabled={currentMoveIndex <= 0}
                  >
                    ← Previous
                  </button>
                  <span className="move-indicator">
                    Move {currentMoveIndex + 1} of {moves.length}
                  </span>
                  <button
                    className="review-btn"
                    onClick={() => handleMoveClick(currentMoveIndex + 1)}
                    disabled={currentMoveIndex >= moves.length - 1}
                  >
                    Next →
                  </button>
                  <button
                    className="review-btn"
                    onClick={() => handleMoveClick(moves.length - 1)}
                    disabled={currentMoveIndex >= moves.length - 1}
                  >
                    <Play size={14} />
                    End
                  </button>
                </div>
              )}

              {/* Game Statistics */}
              {moves.length > 0 && (
                <div className="game-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Moves:</span>
                    <span className="stat-value">{moves.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Current Turn:</span>
                    <span className="stat-value">
                      {moves.length % 2 === 0 ? "Black" : "White"}
                    </span>
                  </div>
                  {moves.some((move) => move.timestamp) && (
                    <div className="stat-item">
                      <span className="stat-label">Game Duration:</span>
                      <span className="stat-value">
                        {(() => {
                          const firstMove = moves.find((m) => m.timestamp);
                          const lastMove = moves
                            .slice()
                            .reverse()
                            .find((m) => m.timestamp);
                          if (firstMove && lastMove) {
                            const duration =
                              new Date(lastMove.timestamp) -
                              new Date(firstMove.timestamp);
                            const minutes = Math.floor(duration / 60000);
                            const seconds = Math.floor(
                              (duration % 60000) / 1000
                            );
                            return `${minutes}:${seconds
                              .toString()
                              .padStart(2, "0")}`;
                          }
                          return "N/A";
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GameHistory);

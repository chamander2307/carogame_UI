import React, { memo, useCallback, useMemo } from "react";
import "./GameBoardGrid.css";

const BOARD_SIZE = 15;
const EMPTY = 0;
const PLAYER_X = 1;
// const PLAYER_O = 2; // TODO: Use for player O display

/**
 * Game Board Grid Component
 * Optimized for performance with React.memo and useMemo
 */
const GameBoardGrid = memo(
  ({
    board,
    onCellClick,
    onCellHover,
    selectedCell,
    hoveredCell,
    lastMove,
    winningLine = [],
    canMakeMove,
    animationsEnabled = true,
    boardSize = BOARD_SIZE,
  }) => {
    /**
     * Handle cell click with validation
     */
    const handleCellClick = useCallback(
      (row, col) => {
        if (canMakeMove(row, col)) {
          onCellClick(row, col);
        }
      },
      [canMakeMove, onCellClick]
    );

    /**
     * Handle cell hover
     */
    const handleCellHover = useCallback(
      (row, col) => {
        if (onCellHover) {
          onCellHover({ row, col });
        }
      },
      [onCellHover]
    );

    /**
     * Handle cell leave
     */
    const handleCellLeave = useCallback(() => {
      if (onCellHover) {
        onCellHover(null);
      }
    }, [onCellHover]);

    /**
     * Check if cell is in winning line
     */
    const isWinningCell = useCallback(
      (row, col) => {
        return winningLine.some((cell) => cell.row === row && cell.col === col);
      },
      [winningLine]
    );

    /**
     * Check if cell is the last move
     */
    const isLastMove = useCallback(
      (row, col) => {
        return lastMove && lastMove.row === row && lastMove.col === col;
      },
      [lastMove]
    );

    /**
     * Check if cell is hovered
     */
    const isHovered = useCallback(
      (row, col) => {
        return (
          hoveredCell && hoveredCell.row === row && hoveredCell.col === col
        );
      },
      [hoveredCell]
    );

    /**
     * Check if cell is selected
     */
    const isSelected = useCallback(
      (row, col) => {
        return (
          selectedCell && selectedCell.row === row && selectedCell.col === col
        );
      },
      [selectedCell]
    );

    /**
     * Get cell CSS classes
     */
    const getCellClasses = useCallback(
      (row, col, cellValue) => {
        const classes = ["board-cell"];

        if (cellValue !== EMPTY) {
          classes.push(cellValue === PLAYER_X ? "player-x" : "player-o");
        }

        if (isWinningCell(row, col)) {
          classes.push("winning-cell");
        }

        if (isLastMove(row, col)) {
          classes.push("last-move");
        }

        if (isHovered(row, col) && cellValue === EMPTY) {
          classes.push("hovered");
        }

        if (isSelected(row, col)) {
          classes.push("selected");
        }

        if (cellValue === EMPTY && canMakeMove(row, col)) {
          classes.push("playable");
        }

        if (animationsEnabled) {
          classes.push("animated");
        }

        return classes.join(" ");
      },
      [
        isWinningCell,
        isLastMove,
        isHovered,
        isSelected,
        canMakeMove,
        animationsEnabled,
      ]
    );

    /**
     * Render game piece
     */
    const renderPiece = useCallback((cellValue, row, col) => {
      if (cellValue === EMPTY) {
        return null;
      }

      const isX = cellValue === PLAYER_X;
      const pieceClass = `game-piece ${isX ? "piece-x" : "piece-o"}`;

      return (
        <div className={pieceClass}>
          {isX ? (
            <svg className="piece-svg" viewBox="0 0 24 24">
              <path d="M18.36 6.64a1 1 0 0 1 0 1.41L13.41 13l4.95 4.95a1 1 0 1 1-1.41 1.41L12 14.41l-4.95 4.95a1 1 0 0 1-1.41-1.41L10.59 13 5.64 8.05a1 1 0 0 1 1.41-1.41L12 11.59l4.95-4.95a1 1 0 0 1 1.41 0z" />
            </svg>
          ) : (
            <svg className="piece-svg" viewBox="0 0 24 24">
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
      );
    }, []);

    /**
     * Generate board coordinates labels
     */
    const columnLabels = useMemo(
      () =>
        Array.from({ length: boardSize }, (_, i) =>
          String.fromCharCode(65 + i)
        ),
      [boardSize]
    );

    const rowLabels = useMemo(
      () => Array.from({ length: boardSize }, (_, i) => i + 1),
      [boardSize]
    );

    return (
      <div className="game-board-container">
        {/* Column Labels (Top) */}
        <div className="board-labels board-labels-top">
          <div className="label-corner"></div>
          {columnLabels.map((label) => (
            <div key={label} className="board-label">
              {label}
            </div>
          ))}
          <div className="label-corner"></div>
        </div>

        {/* Main Board with Row Labels */}
        <div className="board-with-labels">
          {/* Left Row Labels */}
          <div className="board-labels board-labels-left">
            {rowLabels.map((label) => (
              <div key={label} className="board-label">
                {label}
              </div>
            ))}
          </div>

          {/* Game Board */}
          <div
            className="game-board"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
              gridTemplateRows: `repeat(${boardSize}, 1fr)`,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClasses(rowIndex, colIndex, cell)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                  onMouseLeave={handleCellLeave}
                  data-row={rowIndex}
                  data-col={colIndex}
                  data-coordinate={`${columnLabels[colIndex]}${rowIndex + 1}`}
                >
                  {/* Board intersection dot */}
                  <div className="intersection-dot" />

                  {/* Game piece */}
                  {renderPiece(cell, rowIndex, colIndex)}

                  {/* Hover preview for empty cells */}
                  {cell === EMPTY &&
                    isHovered(rowIndex, colIndex) &&
                    canMakeMove(rowIndex, colIndex) && (
                      <div className="hover-preview">
                        {renderPiece(PLAYER_X, rowIndex, colIndex)}{" "}
                        {/* Preview current player's piece */}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>

          {/* Right Row Labels */}
          <div className="board-labels board-labels-right">
            {rowLabels.map((label) => (
              <div key={label} className="board-label">
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Column Labels (Bottom) */}
        <div className="board-labels board-labels-bottom">
          <div className="label-corner"></div>
          {columnLabels.map((label) => (
            <div key={label} className="board-label">
              {label}
            </div>
          ))}
          <div className="label-corner"></div>
        </div>

        {/* Board Statistics Overlay */}
        <div className="board-overlay">
          <div className="board-stats">
            <span className="stat">
              <span className="stat-label">Nước đi:</span>
              <span className="stat-value">
                {board.flat().filter((cell) => cell !== EMPTY).length}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
);

GameBoardGrid.displayName = "GameBoardGrid";

export default GameBoardGrid;

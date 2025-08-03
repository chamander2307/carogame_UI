import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import GameRoomService from "../../services/GameRoomService";
import GameWebSocketService from "../../services/GameWebSocketService";
import CaroGameService from "../../services/CaroGameService";
import { toast } from "react-toastify";
import GameBoardGrid from "./components/GameBoardGrid";
import PlayerPanel from "./components/PlayerPanel";
import GameChat from "./components/GameChat";
import GameControls from "./components/GameControls";
import GameTimer from "./components/GameTimer";
import GameHistory from "./components/GameHistory";
import "./GameInterface.css";

const BOARD_SIZE = 15;
const EMPTY = 0;
const PLAYER_X = 1;
const PLAYER_O = 2;

/**
 * Modern Game Interface Component
 * Redesigned with clean, responsive layout and better UX
 */
const GameInterface = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const gameInterfaceRef = useRef(null);

  // Core game state
  const [gameState, setGameState] = useState({
    board: Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(EMPTY)),
    currentPlayer: PLAYER_X,
    gameStatus: "waiting", // waiting, playing, finished
    winner: null,
    winningLine: [],
    isMyTurn: false,
    moveCount: 0,
    lastMove: null,
  });

  // Room and player state
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myPlayerSymbol, setMyPlayerSymbol] = useState(null);
  const [opponentPlayer, setOpponentPlayer] = useState(null);

  // Game features state
  const [chatMessages, setChatMessages] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // UI state
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled] = useState(true); // TODO: Add setSoundEnabled for settings
  const [animationsEnabled] = useState(true); // TODO: Add setAnimationsEnabled for settings

  // Timer state
  const [gameTimer] = useState({ minutes: 0, seconds: 0 }); // TODO: Add setGameTimer for timer updates
  const [playerTimers] = useState({
    // TODO: Add setPlayerTimers for timer updates
    [PLAYER_X]: { minutes: 15, seconds: 0 },
    [PLAYER_O]: { minutes: 15, seconds: 0 },
  });

  /**
   * Load room data and players
   */
  const loadRoomData = useCallback(async () => {
    try {
      const response = await GameRoomService.getRoomDetails(roomId);
      if (response.success) {
        setRoomData(response.data);
        setPlayers(response.data.players || []);

        // Set opponent player
        const opponent = response.data.players?.find((p) => p.id !== user.id);
        setOpponentPlayer(opponent);
      }
    } catch (error) {
      console.error("Failed to load room data:", error);
      throw error;
    }
  }, [roomId, user.id]);

  /**
   * Load current game board state
   */
  const loadGameBoard = useCallback(async () => {
    try {
      const response = await CaroGameService.getCurrentBoard(roomId);
      if (response.success && response.data) {
        setGameState((prev) => ({
          ...prev,
          board: response.data,
          gameStatus: "playing",
        }));
      }
    } catch (error) {
      console.error("Failed to load game board:", error);
      // Continue with empty board
    }
  }, [roomId]);

  /**
   * Load player symbol (X or O)
   */
  const loadPlayerSymbol = useCallback(async () => {
    try {
      const response = await CaroGameService.getPlayerSymbol(roomId);
      if (response.success) {
        const symbol = response.data === "X" ? PLAYER_X : PLAYER_O;
        setMyPlayerSymbol(symbol);

        // Set initial turn
        setGameState((prev) => ({
          ...prev,
          isMyTurn: symbol === PLAYER_X, // X always goes first
        }));
      }
    } catch (error) {
      console.error("Failed to load player symbol:", error);
      // Continue without player symbol for now
    }
  }, [roomId]);

  /**
   * Initialize game data and WebSocket connection
   */
  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load room data
      await loadRoomData();

      // Setup WebSocket connection
      await setupWebSocketConnection();

      // Load player symbol
      await loadPlayerSymbol();

      // Load game board if game is in progress
      await loadGameBoard();

      setConnectionStatus("connected");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      toast.error("Không thể tải game. Vui lòng thử lại.");
      setConnectionStatus("error");
      setIsLoading(false);
    }
  }, [
    roomId,
    loadRoomData,
    setupWebSocketConnection,
    loadPlayerSymbol,
    loadGameBoard,
  ]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (roomId) {
      GameWebSocketService.unsubscribeFromRoom(roomId);
      GameWebSocketService.unsubscribeFromGameMoves(roomId);
    }
  }, [roomId]);

  /**
   * Initialize game interface
   */
  useEffect(() => {
    if (!roomId || !user) {
      navigate("/lobby");
      return;
    }

    initializeGame();

    return () => {
      cleanup();
    };
  }, [roomId, user, navigate, initializeGame, cleanup]);

  /**
   * Setup WebSocket connection and subscriptions
   */
  const setupWebSocketConnection = useCallback(async () => {
    try {
      // Connect to WebSocket if not connected
      if (!GameWebSocketService.isConnected()) {
        await GameWebSocketService.connect();
      }

      // Subscribe to room updates
      await GameWebSocketService.subscribeToRoom(roomId, {
        onRoomUpdate: handleRoomUpdate,
        onGameStarted: handleGameStarted,
        onGameEnded: handleGameEnded,
        onPlayerJoined: handlePlayerJoined,
        onPlayerLeft: handlePlayerLeft,
        onPlayerReady: handlePlayerReady,
        onChatMessage: handleChatMessage,
        onRematchRequested: handleRematchRequested,
        onRematchAccepted: handleRematchAccepted,
      });

      // Subscribe to game moves
      await GameWebSocketService.subscribeToGameMoves(roomId, handleGameMove);
    } catch (error) {
      console.error("Failed to setup WebSocket:", error);
      throw error;
    }
  }, [roomId]); // Will add other dependencies after handlers are defined

  /**
   * Check if a move can be made
   */
  const canMakeMove = useCallback(
    (row, col) => {
      return (
        gameState.gameStatus === "playing" &&
        gameState.isMyTurn &&
        gameState.board[row][col] === EMPTY &&
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
      );
    },
    [gameState]
  );

  /**
   * Handle cell click - make a move
   */
  const handleCellClick = useCallback(
    async (row, col) => {
      // Validate move
      if (!canMakeMove(row, col)) {
        return;
      }

      try {
        // Optimistic UI update
        const newBoard = gameState.board.map((r) => [...r]);
        newBoard[row][col] = myPlayerSymbol;

        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          isMyTurn: false,
          lastMove: { row, col, player: myPlayerSymbol },
          moveCount: prev.moveCount + 1,
        }));

        // Send move via WebSocket for real-time update
        await GameWebSocketService.sendGameMove(roomId, {
          xPosition: col,
          yPosition: row,
        });

        // Also send via REST API as backup
        await CaroGameService.makeMove(roomId, {
          xPosition: col,
          yPosition: row,
        });

        // Play sound effect
        if (soundEnabled) {
          playMoveSound();
        }

        // Add to game history
        addToGameHistory({
          move: gameState.moveCount + 1,
          player: myPlayerSymbol,
          position: `${String.fromCharCode(65 + col)}${row + 1}`,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to make move:", error);
        toast.error("Không thể thực hiện nước đi. Vui lòng thử lại.");

        // Revert optimistic update
        await loadGameBoard();
      }
    },
    [
      gameState,
      myPlayerSymbol,
      roomId,
      soundEnabled,
      canMakeMove,
      loadGameBoard,
    ]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle game end
   */
  const handleGameEnd = useCallback(
    (result) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "finished",
        winner: result.winner,
        winningLine: result.winningLine || [],
      }));

      // Show result notification
      if (result.winner === "DRAW") {
        toast.info("Trận đấu hòa!");
      } else {
        const isWinner =
          result.winner === (myPlayerSymbol === PLAYER_X ? "X" : "O");
        if (isWinner) {
          toast.success("Chúc mừng! Bạn đã thắng!");
        } else {
          toast.error("Bạn đã thua. Chúc bạn may mắn lần sau!");
        }
      }

      // Play sound effect
      if (soundEnabled) {
        playGameEndSound(
          result.winner === (myPlayerSymbol === PLAYER_X ? "X" : "O")
        );
      }
    },
    [myPlayerSymbol, soundEnabled]
  );

  /**
   * Handle WebSocket game move received
   */
  const handleGameMove = useCallback(
    (moveResponse) => {
      console.log("Game move received:", moveResponse);

      // Update board with the move
      if (moveResponse.board) {
        setGameState((prev) => ({
          ...prev,
          board: moveResponse.board,
          currentPlayer: moveResponse.nextPlayer === "X" ? PLAYER_X : PLAYER_O,
          isMyTurn:
            (moveResponse.nextPlayer === "X" ? PLAYER_X : PLAYER_O) ===
            myPlayerSymbol,
          lastMove: {
            row: moveResponse.yPosition,
            col: moveResponse.xPosition,
            player: moveResponse.player === "X" ? PLAYER_X : PLAYER_O,
          },
          moveCount: moveResponse.moveNumber || prev.moveCount,
        }));
      }

      // Check for game end
      if (moveResponse.gameEnded) {
        handleGameEnd(moveResponse);
      }

      // Play sound for opponent moves
      if (
        soundEnabled &&
        moveResponse.player !== (myPlayerSymbol === PLAYER_X ? "X" : "O")
      ) {
        playMoveSound();
      }
    },
    [myPlayerSymbol, soundEnabled, handleGameEnd]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle room updates
   */
  const handleRoomUpdate = useCallback((update) => {
    console.log("Room update received:", update);

    if (update.roomData) {
      setRoomData(update.roomData);
      setPlayers(update.roomData.players || []);
    }
  }, []);

  /**
   * Handle game started
   */
  const handleGameStarted = useCallback(
    (data) => {
      console.log("Game started:", data);

      setGameState((prev) => ({
        ...prev,
        gameStatus: "playing",
        isMyTurn: myPlayerSymbol === PLAYER_X,
      }));

      toast.success("Trận đấu bắt đầu!");

      if (soundEnabled) {
        playGameStartSound();
      }
    },
    [myPlayerSymbol, soundEnabled]
  );

  /**
   * Handle game ended
   */
  const handleGameEnded = useCallback(
    (data) => {
      console.log("Game ended:", data);
      handleGameEnd(data);
    },
    [handleGameEnd]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle player events
   */
  const handlePlayerJoined = useCallback((data) => {
    toast.info(`${data.playerName} đã tham gia phòng`);
  }, []);

  const handlePlayerLeft = useCallback((data) => {
    toast.warning(`${data.playerName} đã rời phòng`);
  }, []);

  const handlePlayerReady = useCallback((data) => {
    toast.info(`${data.playerName} đã sẵn sàng`);
  }, []);

  /**
   * Handle chat message
   */
  const handleChatMessage = useCallback((message) => {
    setChatMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Handle rematch events
   */
  const handleRematchRequested = useCallback((data) => {
    toast.info(`${data.playerName} muốn chơi lại`);
  }, []);

  const handleRematchAccepted = useCallback((data) => {
    toast.success("Cả hai người chơi đồng ý chơi lại!");
  }, []);

  /**
   * Sound effects
   */
  const playMoveSound = () => {
    // Implement move sound effect
    const audio = new Audio("/sounds/move.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const playGameStartSound = () => {
    const audio = new Audio("/sounds/game-start.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  const playGameEndSound = (isWinner) => {
    const audio = new Audio(
      isWinner ? "/sounds/victory.mp3" : "/sounds/defeat.mp3"
    );
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  /**
   * Game history management
   */
  const addToGameHistory = (move) => {
    setGameHistory((prev) => [...prev, move]);
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="game-interface loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải game...</p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (connectionStatus === "error") {
    return (
      <div className="game-interface error">
        <div className="error-message">
          <h2>Lỗi kết nối</h2>
          <p>Không thể kết nối đến game. Vui lòng thử lại.</p>
          <button onClick={initializeGame} className="btn btn-primary">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-interface" ref={gameInterfaceRef}>
      {/* Game Header */}
      <div className="game-header">
        <div className="room-info">
          <h1>{roomData?.name || `Phòng ${roomId}`}</h1>
          <div className="game-status">
            {gameState.gameStatus === "waiting" && (
              <span className="status waiting">Đang chờ...</span>
            )}
            {gameState.gameStatus === "playing" && (
              <span className="status playing">Đang chơi</span>
            )}
            {gameState.gameStatus === "finished" && (
              <span className="status finished">Kết thúc</span>
            )}
          </div>
        </div>

        <GameTimer
          gameTimer={gameTimer}
          playerTimers={playerTimers}
          currentPlayer={gameState.currentPlayer}
          gameStatus={gameState.gameStatus}
        />
      </div>

      {/* Main Game Area */}
      <div className="game-main">
        {/* Left Panel */}
        <div className="game-left-panel">
          <PlayerPanel
            players={players}
            currentUser={user}
            myPlayerSymbol={myPlayerSymbol}
            currentPlayer={gameState.currentPlayer}
            gameStatus={gameState.gameStatus}
          />

          <GameControls
            gameState={gameState}
            roomId={roomId}
            onSurrender={() => GameWebSocketService.surrenderGame(roomId)}
            onRequestRematch={() => GameWebSocketService.requestRematch(roomId)}
            onAcceptRematch={() => GameWebSocketService.acceptRematch(roomId)}
            onShowHistory={() => setShowHistory(true)}
            onShowSettings={() => setShowSettings(true)}
          />
        </div>

        {/* Game Board */}
        <div className="game-center">
          <GameBoardGrid
            board={gameState.board}
            onCellClick={handleCellClick}
            onCellHover={setHoveredCell}
            selectedCell={selectedCell}
            hoveredCell={hoveredCell}
            lastMove={gameState.lastMove}
            winningLine={gameState.winningLine}
            canMakeMove={canMakeMove}
            animationsEnabled={animationsEnabled}
            boardSize={BOARD_SIZE}
          />
        </div>

        {/* Right Panel */}
        <div className="game-right-panel">
          <GameChat
            messages={chatMessages}
            onSendMessage={(message) =>
              GameWebSocketService.sendChatMessage(roomId, message)
            }
            currentUser={user}
          />
        </div>
      </div>

      {/* Game History Modal */}
      {showHistory && (
        <GameHistory
          history={gameHistory}
          onClose={() => setShowHistory(false)}
          gameState={gameState}
        />
      )}
    </div>
  );
};

export default GameInterface;

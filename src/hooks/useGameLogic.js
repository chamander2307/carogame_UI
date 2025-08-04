import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { flushSync } from "react-dom";
import { gameStateService } from "../services/GameStateService";
import { WebSocketEventHandler } from "../services/WebSocketEventHandler";
import { GameActionService } from "../services/GameActionService";

/**
 * Custom hook cho Game Logic - Facade Pattern
 * Tuân thủ Single Responsibility: Quản lý toàn bộ logic game
 */
export const useGameLogic = (roomId, user) => {
  const navigate = useNavigate();
  
  // Services initialization (Dependency Injection)
  const gameActionService = useRef(new GameActionService(gameStateService));
  const webSocketEventHandler = useRef(new WebSocketEventHandler(gameStateService, gameActionService.current));
  
  // Update GameActionService with WebSocketEventHandler reference
  useEffect(() => {
    gameActionService.current.setWebSocketEventHandler(webSocketEventHandler.current);
  }, []);
  
  // Set user information for turn management
  useEffect(() => {
    if (user) {
      webSocketEventHandler.current.setCurrentUserId(user.id);
    }
  }, [user]);
  
  // Local state for UI
  const [gameState, setGameState] = useState(gameStateService.getState());
  const [wsConnected, setWsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Subscribe to game state changes
  useEffect(() => {
    console.log("=== useGameLogic: Setting up GameStateService subscription ===");
    
    const unsubscribe = gameStateService.subscribe((newState) => {
      console.log("=== useGameLogic: Received GameState Update ===");
      console.log("New state board:", newState.board);
      console.log("Full new state:", newState);
      
      // Force synchronous render to fix real-time update issue
      flushSync(() => {
        setGameState(newState);
      });
      
      console.log("setGameState called with flushSync - forcing immediate render");
      console.log("=== End GameState Update ===");
    });

    console.log("GameStateService subscription setup complete");
    return unsubscribe;
  }, []);

  // Monitor WebSocket connection
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const connected = webSocketEventHandler.current.isConnected();
      setWsConnected(connected);
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  // Handle room update events với navigation logic
  useEffect(() => {
    const unsubscribe = webSocketEventHandler.current.addRoomUpdateHandler((message) => {
      // Handle rematch room creation
      if (message.type === "REMATCH_CREATED" && message.data?.newRoomId) {
        const newRoomId = message.data.newRoomId;
        toast.success(`Chuyển đến phòng tái đấu: ${newRoomId}`);
        
        // Navigate to new room
        setTimeout(() => {
          navigate(`/game?roomId=${newRoomId}`);
        }, 1500);
      }
    });

    return unsubscribe;
  }, [navigate]);

  // Initialize game when roomId changes
  useEffect(() => {
    if (!roomId || !user) return;

    const initializeGame = async () => {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        // Force reset any pending move flags from previous session
        gameStateService.forceResetMakingMove();
        
        // CRITICAL: Force reset ready status when joining new room
        console.log("=== FORCE RESET READY STATUS ===");
        gameStateService.setPlayerReady(false);
        console.log("Player ready reset to false for new room");
        console.log("=== END RESET READY STATUS ===");
        
        // Set room ID in game state
        gameStateService.setRoomId(roomId);
        gameStateService.setPlayerInfo(user);

        // Initialize WebSocket connection
        const wsConnected = await webSocketEventHandler.current.initializeConnection();
        if (!wsConnected) {
          setConnectionError("Không thể kết nối WebSocket");
          return;
        }

        // Subscribe to game events
        const subscribed = await webSocketEventHandler.current.subscribeToGameEvents(roomId);
        if (!subscribed) {
          setConnectionError("Không thể đăng ký sự kiện game");
          return;
        }

        // Load initial game data
        console.log("=== LOADING INITIAL GAME DATA ON MOUNT ===");
        console.log("Room ID:", roomId);
        console.log("User:", user);
        
        await gameActionService.current.loadInitialGameData(roomId);
        
        // HTML LOGIC: If game is playing, call getPlayerSymbolAndSetTurn
        const initialState = gameStateService.getState();
        if (initialState.gameStatus === "playing") {
          console.log("Game is playing, calling getPlayerSymbolAndSetTurn...");
          await gameActionService.current.getPlayerSymbolAndSetTurn(roomId);
        }
        
        const finalState = gameStateService.getState();
        console.log("=== FINAL STATE AFTER LOAD ===");
        console.log("Game Status:", finalState.gameStatus);
        console.log("Player Symbol:", finalState.playerSymbol);
        console.log("Current Turn:", finalState.currentTurn);
        console.log("Board non-empty cells:", finalState.board.flat().filter(cell => cell !== 0).length);
        console.log("=== END INITIAL LOAD ===");

        toast.success("Kết nối game thành công!");

      } catch (error) {
        console.error("Game initialization failed:", error);
        setConnectionError("Khởi tạo game thất bại: " + error.message);
        toast.error("Khởi tạo game thất bại!");
      } finally {
        setIsConnecting(false);
      }
    };

    initializeGame();

    // Cleanup on unmount
    const wsHandler = webSocketEventHandler.current;
    return () => {
      wsHandler.cleanup();
    };
  }, [roomId, user]);

  // Game action methods
  const makeMove = useCallback(async (row, col) => {
    return await gameActionService.current.makeMove(roomId, row, col);
  }, [roomId]);

  const markPlayerReady = useCallback(async () => {
    return await webSocketEventHandler.current.markPlayerReady(roomId);
  }, [roomId]);

  const surrenderGame = useCallback(async () => {
    const success = await webSocketEventHandler.current.surrenderGame(roomId);
    if (success) {
      setTimeout(() => navigate("/lobby"), 1500);
    }
    return success;
  }, [roomId, navigate]);

  const requestRematch = useCallback(async () => {
    return await webSocketEventHandler.current.requestRematch(roomId);
  }, [roomId]);

  const acceptRematch = useCallback(async () => {
    return await webSocketEventHandler.current.acceptRematch(roomId);
  }, [roomId]);

  const leaveRoom = useCallback(async () => {
    const success = await webSocketEventHandler.current.leaveRoom(roomId);
    if (success) {
      setTimeout(() => navigate("/lobby"), 1000);
    }
    return success;
  }, [roomId, navigate]);

  const sendChatMessage = useCallback(async (messageData) => {
    return await webSocketEventHandler.current.sendChatMessage(roomId, messageData);
  }, [roomId]);

  // Utility methods
  const syncGameState = useCallback(async () => {
    return await gameActionService.current.syncGameState(roomId);
  }, [roomId]);

  const refreshBoard = useCallback(async () => {
    return await gameActionService.current.refreshBoard(roomId);
  }, [roomId]);

  const resetGame = useCallback(() => {
    gameStateService.resetGame();
  }, []);

  // Game state getters
  const getGameState = useCallback(() => {
    return gameStateService.getState();
  }, []);

  const validateMove = useCallback((row, col) => {
    return gameStateService.validateMove(row, col);
  }, []);

  return {
    // Game state
    gameState,
    wsConnected,
    isConnecting,
    connectionError,

    // Game actions
    makeMove,
    markPlayerReady,
    surrenderGame,
    requestRematch,
    acceptRematch,
    leaveRoom,
    sendChatMessage,

    // Utility methods
    syncGameState,
    refreshBoard,
    resetGame,
    getGameState,
    validateMove,

    // WebSocket event handler for chat
    webSocketEventHandler: webSocketEventHandler.current,
  };
};

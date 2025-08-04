// Trong phần <script> của complete-caro-game-interface.html
let gameStatus = "waiting";

function connectWebSocket() {
  const accessToken = localStorage.getItem("accessToken");
  const socket = new WebSocket(
    `ws://localhost:8080/ws?token=Bearer ${encodeURIComponent(accessToken)}`
  );

  socket.onopen = () => {
    document.getElementById("wsStatus").textContent = "Connected";
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.updateType === "GAME_STARTED") {
      gameStatus = "playing";
      document.getElementById("gameBoard").innerHTML = renderBoard(
        message.board
      );
      document.getElementById("gameStatus").textContent = "Đang chơi";
    } else if (message.updateType === "PLAYER_READY") {
      updatePlayerStatus(message.readyCount);
    } else if (message.updateType === "GAME_ENDED") {
      gameStatus = "ended";
      document.getElementById("gameStatus").textContent = "Kết thúc";
    }
  };

  socket.onerror = () => {
    document.getElementById("wsStatus").textContent = "Disconnected";
  };
}

function fetchRoomInfo(roomId) {
  fetch(`/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.data.gameState === "IN_PROGRESS") {
        gameStatus = "playing";
        document.getElementById("gameStatus").textContent = "Đang chơi";
      }
    })
    .catch((error) => console.error("Lấy thông tin phòng thất bại:", error));
}

import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

const GameCoreService = {
  makeMove: async (roomId, xPosition, yPosition) => {
    try {
      const response = await instance.post(`/v1/games/${roomId}/moves`, {
        xPosition,
        yPosition,
      });
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Thực hiện nước đi") ||
            data.message ||
            "Thực hiện nước đi thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Thực hiện nước đi") ||
          data.message ||
          "Thực hiện nước đi không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error("Lỗi thực hiện nước đi:", error.message, "| Mã lỗi:", code);
      toast.error(
        getVietnameseMessage(code, "Thực hiện nước đi") ||
          error.response?.data?.message ||
          "Thực hiện nước đi không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Thực hiện nước đi") ||
          error.response?.data?.message ||
          "Thực hiện nước đi không thành công"
      );
    }
  },

  getCurrentBoard: async (roomId) => {
    try {
      const response = await instance.get(`/v1/games/${roomId}/board`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy trạng thái bàn cờ") ||
            data.message ||
            "Lấy trạng thái bàn cờ thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy trạng thái bàn cờ") ||
          data.message ||
          "Lấy trạng thái bàn cờ không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy trạng thái bàn cờ:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy trạng thái bàn cờ") ||
          error.response?.data?.message ||
          "Lấy trạng thái bàn cờ không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy trạng thái bàn cờ") ||
          error.response?.data?.message ||
          "Lấy trạng thái bàn cờ không thành công"
      );
    }
  },

  getPlayerSymbol: async (roomId) => {
    try {
      const response = await instance.get(`/v1/games/${roomId}/player-symbol`);
      const data = response.data;
      if (data?.success) {
        return {
          success: true,
          message:
            getVietnameseMessage(data.statusCode, "Lấy ký hiệu người chơi") ||
            data.message ||
            "Lấy ký hiệu người chơi thành công",
          data: data.data,
        };
      }
      throw new Error(
        getVietnameseMessage(data.statusCode, "Lấy ký hiệu người chơi") ||
          data.message ||
          "Lấy ký hiệu người chơi không thành công"
      );
    } catch (error) {
      const code = error.response?.data?.statusCode;
      console.error(
        "Lỗi lấy ký hiệu người chơi:",
        error.message,
        "| Mã lỗi:",
        code
      );
      toast.error(
        getVietnameseMessage(code, "Lấy ký hiệu người chơi") ||
          error.response?.data?.message ||
          "Lấy ký hiệu người chơi không thành công"
      );
      throw new Error(
        getVietnameseMessage(code, "Lấy ký hiệu người chơi") ||
          error.response?.data?.message ||
          "Lấy ký hiệu người chơi không thành công"
      );
    }
  },

  checkWinCondition: (board, x, y, playerSymbol, winCondition = 5) => {
    try {
      const directions = [
        [0, 1], // Ngang
        [1, 0], // Dọc
        [1, 1], // Chéo chính
        [1, -1], // Chéo phụ
      ];
      const rows = board.length;
      const cols = board[0].length;

      for (const [dx, dy] of directions) {
        let count = 1;
        for (let i = 1; i <= winCondition - 1; i++) {
          const nx = x + i * dx;
          const ny = y + i * dy;
          if (
            nx >= 0 &&
            nx < rows &&
            ny >= 0 &&
            ny < cols &&
            board[nx][ny] === playerSymbol
          ) {
            count++;
          } else {
            break;
          }
        }
        for (let i = 1; i <= winCondition - 1; i++) {
          const nx = x - i * dx;
          const ny = y - i * dy;
          if (
            nx >= 0 &&
            nx < rows &&
            ny >= 0 &&
            ny < cols &&
            board[nx][ny] === playerSymbol
          ) {
            count++;
          } else {
            break;
          }
        }
        if (count >= winCondition) {
          console.log("Người chơi chiến thắng:", playerSymbol);
          toast.success(
            getVietnameseMessage(200, "Kiểm tra chiến thắng") ||
              `Người chơi ${playerSymbol} chiến thắng`
          );
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Lỗi kiểm tra điều kiện chiến thắng:", error.message);
      toast.error(
        getVietnameseMessage(500, "Kiểm tra chiến thắng") ||
          "Kiểm tra điều kiện chiến thắng không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Kiểm tra chiến thắng") ||
          "Kiểm tra điều kiện chiến thắng không thành công"
      );
    }
  },

  checkDrawCondition: (board) => {
    try {
      const isFull = board.every((row) => row.every((cell) => cell !== null));
      if (isFull) {
        console.log("Trò chơi hòa");
        toast.info(getVietnameseMessage(200, "Kiểm tra hòa") || "Trò chơi hòa");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi kiểm tra hòa:", error.message);
      toast.error(
        getVietnameseMessage(500, "Kiểm tra hòa") ||
          "Kiểm tra hòa không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Kiểm tra hòa") ||
          "Kiểm tra hòa không thành công"
      );
    }
  },

  makeLocalMove: (board, x, y, playerSymbol) => {
    try {
      if (board[x][y] !== null) {
        throw new Error("Ô đã được đánh");
      }
      board[x][y] = playerSymbol;
      console.log(
        `Nước đi cục bộ tại (${x}, ${y}) bởi ${playerSymbol} thành công`
      );
      toast.success(
        getVietnameseMessage(200, "Thực hiện nước đi cục bộ") ||
          "Thực hiện nước đi cục bộ thành công"
      );
      return board;
    } catch (error) {
      console.error("Lỗi thực hiện nước đi cục bộ:", error.message);
      toast.error(
        getVietnameseMessage(500, "Thực hiện nước đi cục bộ") ||
          "Thực hiện nước đi cục bộ không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Thực hiện nước đi cục bộ") ||
          "Thực hiện nước đi cục bộ không thành công"
      );
    }
  },

  initializeBoard: (rows = 15, cols = 15) => {
    try {
      const board = Array(rows)
        .fill()
        .map(() => Array(cols).fill(null));
      console.log("Khởi tạo bàn cờ thành công");
      toast.success(
        getVietnameseMessage(200, "Khởi tạo bàn cờ") ||
          "Khởi tạo bàn cờ thành công"
      );
      return board;
    } catch (error) {
      console.error("Lỗi khởi tạo bàn cờ:", error.message);
      toast.error(
        getVietnameseMessage(500, "Khởi tạo bàn cờ") ||
          "Khởi tạo bàn cờ không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Khởi tạo bàn cờ") ||
          "Khởi tạo bàn cờ không thành công"
      );
    }
  },
};

export default GameCoreService;

import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

const DevWebSocketService = {
  stompClient: null,
  socket: null,
  isConnected: false,

  connect: async () => {
    try {
      DevWebSocketService.socket = new SockJS("http://localhost:8080/ws");
      DevWebSocketService.stompClient = Stomp.over(DevWebSocketService.socket);

      return new Promise((resolve, reject) => {
        DevWebSocketService.stompClient.connect(
          {},
          () => {
            DevWebSocketService.isConnected = true;
            console.log("Kết nối WebSocket thành công");
            toast.success(
              getVietnameseMessage(200, "Kết nối WebSocket") ||
                "Kết nối WebSocket thành công"
            );
            resolve();
          },
          (error) => {
            DevWebSocketService.isConnected = false;
            console.error("Lỗi kết nối WebSocket:", error);
            toast.error(
              getVietnameseMessage(500, "Kết nối WebSocket") ||
                "Kết nối WebSocket không thành công"
            );
            reject(
              new Error(
                getVietnameseMessage(500, "Kết nối WebSocket") ||
                  "Kết nối WebSocket không thành công"
              )
            );
          }
        );
      });
    } catch (error) {
      console.error("Lỗi kết nối WebSocket:", error.message);
      toast.error(
        getVietnameseMessage(500, "Kết nối WebSocket") ||
          "Kết nối WebSocket không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Kết nối WebSocket") ||
          "Kết nối WebSocket không thành công"
      );
    }
  },

  disconnect: () => {
    try {
      if (DevWebSocketService.stompClient && DevWebSocketService.isConnected) {
        DevWebSocketService.stompClient.disconnect();
        DevWebSocketService.isConnected = false;
        console.log("Ngắt kết nối WebSocket thành công");
        toast.success(
          getVietnameseMessage(200, "Ngắt kết nối WebSocket") ||
            "Ngắt kết nối WebSocket thành công"
        );
      } else {
        throw new Error("WebSocket chưa được kết nối");
      }
    } catch (error) {
      console.error("Lỗi ngắt kết nối WebSocket:", error.message);
      toast.error(
        getVietnameseMessage(500, "Ngắt kết nối WebSocket") ||
          "Ngắt kết nối WebSocket không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Ngắt kết nối WebSocket") ||
          "Ngắt kết nối WebSocket không thành công"
      );
    }
  },

  sendPing: (message = "Xin chào Server!") => {
    try {
      if (!DevWebSocketService.isConnected) {
        throw new Error("WebSocket chưa được kết nối");
      }
      DevWebSocketService.stompClient.send("/app/ping", {}, message);
      console.log("Gửi ping thành công:", message);
      toast.success(
        getVietnameseMessage(200, "Gửi ping") || "Gửi ping thành công"
      );
    } catch (error) {
      console.error("Lỗi gửi ping:", error.message);
      toast.error(
        getVietnameseMessage(500, "Gửi ping") || "Gửi ping không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Gửi ping") || "Gửi ping không thành công"
      );
    }
  },

  subscribeToPong: (onPongReceived) => {
    try {
      if (!DevWebSocketService.isConnected) {
        throw new Error("WebSocket chưa được kết nối");
      }
      return DevWebSocketService.stompClient.subscribe(
        "/topic/pong",
        (message) => {
          try {
            const pongMessage = message.body;
            console.log("Nhận được pong:", pongMessage);
            toast.success(
              getVietnameseMessage(200, "Nhận pong") || "Nhận pong thành công"
            );
            if (onPongReceived) {
              onPongReceived(pongMessage);
            }
          } catch (error) {
            console.error("Lỗi xử lý pong:", error.message);
            toast.error(
              getVietnameseMessage(500, "Nhận pong") ||
                "Nhận pong không thành công"
            );
          }
        }
      );
    } catch (error) {
      console.error("Lỗi subscribe pong:", error.message);
      toast.error(
        getVietnameseMessage(500, "Subscribe pong") ||
          "Subscribe pong không thành công"
      );
      throw new Error(
        getVietnameseMessage(500, "Subscribe pong") ||
          "Subscribe pong không thành công"
      );
    }
  },

  isWebSocketConnected: () => {
    return DevWebSocketService.isConnected;
  },
};

export default DevWebSocketService;

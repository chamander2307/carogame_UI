import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Custom hook để quản lý chat messages
 * Tuân thủ Single Responsibility Principle
 */
export const useChatManager = (webSocketEventHandler) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Thêm chat message mới
  const addChatMessage = useCallback((sender, content, timestamp = new Date()) => {
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID generation
      sender,
      content,
      timestamp,
    };

    setChatMessages(prev => {
      // Keep only last 50 messages for performance
      const updatedMessages = [...prev, newMessage];
      return updatedMessages.slice(-50);
    });
  }, []);

  // Gửi chat message
  const sendChatMessage = useCallback(async (roomId, user) => {
    if (!chatInput.trim()) {
      toast.warn("Vui lòng nhập tin nhắn!");
      return false;
    }

    if (!webSocketEventHandler.isConnected()) {
      toast.warn("WebSocket chưa kết nối!");
      return false;
    }

    try {
      const messageData = {
        content: chatInput.trim(),
        sender: typeof user === 'string' ? user : (user?.username || user?.displayName || user?.name || "Anonymous"),
      };

      const success = await webSocketEventHandler.sendChatMessage(roomId, messageData);
      
      if (success) {
        // Clear input immediately for better UX
        setChatInput("");
        // Don't add locally - let WebSocket echo handle it to avoid duplicates
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error sending chat message:", error);
      toast.error("Gửi tin nhắn thất bại!");
      return false;
    }
  }, [chatInput, webSocketEventHandler]);

  // Handle incoming chat messages from WebSocket
  useEffect(() => {
    const unsubscribe = webSocketEventHandler.addChatMessageHandler((chatMessage) => {
      // WebSocketEventHandler now sends normalized format: { sender, content, timestamp }
      if (chatMessage.sender && chatMessage.content) {
        // Ensure sender is always a string
        const senderName = typeof chatMessage.sender === 'string' 
          ? chatMessage.sender 
          : chatMessage.sender?.username || chatMessage.sender?.displayName || 'Anonymous';
        
        addChatMessage(senderName, chatMessage.content, chatMessage.timestamp);
      } else {
        console.warn("Invalid chat message format:", chatMessage);
      }
    });

    return unsubscribe;
  }, [webSocketEventHandler, addChatMessage]);

  // Clear chat messages
  const clearChatMessages = useCallback(() => {
    setChatMessages([]);
  }, []);

  return {
    chatMessages,
    chatInput,
    setChatInput,
    sendChatMessage,
    addChatMessage,
    clearChatMessages,
  };
};

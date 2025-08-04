import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import "./GameChat.css";

/**
 * Game Chat Component
 * Real-time chat for game rooms
 */
const GameChat = memo(
  ({
    messages = [],
    onSendMessage,
    currentUser,
    maxMessages = 100,
    placeholder = "Nhập tin nhắn...",
  }) => {
    const [newMessage, setNewMessage] = useState("");
    const [isExpanded, setIsExpanded] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    /**
     * Auto-scroll to bottom when new messages arrive
     */
    useEffect(() => {
      if (messagesEndRef.current && isExpanded) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, isExpanded]);

    /**
     * Handle send message
     */
    const handleSendMessage = useCallback(
      (e) => {
        e.preventDefault();

        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage || !onSendMessage) {
          return;
        }

        // Send message
        onSendMessage(trimmedMessage);

        // Clear input
        setNewMessage("");

        // Focus back to input
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      [newMessage, onSendMessage]
    );

    /**
     * Handle input change
     */
    const handleInputChange = useCallback((e) => {
      setNewMessage(e.target.value);
    }, []);

    /**
     * Handle key press
     */
    const handleKeyPress = useCallback(
      (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage(e);
        }
      },
      [handleSendMessage]
    );

    /**
     * Toggle chat expanded/collapsed
     */
    const toggleExpanded = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    /**
     * Format message timestamp
     */
    const formatTimestamp = useCallback((timestamp) => {
      if (!timestamp) return "";

      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleString("vi-VN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }, []);

    /**
     * Check if message is from current user
     */
    const isMyMessage = useCallback(
      (message) => {
        return (
          message.senderId === currentUser?.id ||
          message.senderName === currentUser?.username ||
          message.senderName === currentUser?.name
        );
      },
      [currentUser]
    );

    /**
     * Get message type class
     */
    const getMessageTypeClass = useCallback(
      (message) => {
        if (message.type === "SYSTEM") return "system-message";
        if (isMyMessage(message)) return "my-message";
        return "other-message";
      },
      [isMyMessage]
    );

    /**
     * Render message item
     */
    const renderMessage = useCallback(
      (message, index) => {
        const isMe = isMyMessage(message);
        const isSystem = message.type === "SYSTEM";
        const messageClass = getMessageTypeClass(message);

        // Group consecutive messages from same user
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage =
          index < messages.length - 1 ? messages[index + 1] : null;

        const isFirstInGroup =
          !prevMessage ||
          prevMessage.senderId !== message.senderId ||
          prevMessage.type !== message.type;

        const isLastInGroup =
          !nextMessage ||
          nextMessage.senderId !== message.senderId ||
          nextMessage.type !== message.type;

        if (isSystem) {
          return (
            <div
              key={message.id || index}
              className="message-item system-message"
            >
              <div className="system-content">
                <span className="system-icon">ℹ️</span>
                <span className="system-text">{message.content}</span>
                <span className="message-time">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={message.id || index}
            className={`message-item ${messageClass} ${
              isFirstInGroup ? "first-in-group" : ""
            } ${isLastInGroup ? "last-in-group" : ""}`}
          >
            {/* Avatar (only show for first message in group from others) */}
            {!isMe && isFirstInGroup && (
              <div className="message-avatar">
                <img
                  src={message.senderAvatar || "/default-avatar.png"}
                  alt={typeof message.senderName === 'string' 
                    ? message.senderName 
                    : message.senderName?.username || message.senderName?.displayName || 'User'
                  }
                  className="avatar-image"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </div>
            )}

            <div className="message-content">
              {/* Sender name (only show for first message in group from others) */}
              {!isMe && isFirstInGroup && (
                <div className="message-sender">
                  {typeof message.senderName === 'string' 
                    ? message.senderName 
                    : message.senderName?.username || message.senderName?.displayName || 'Unknown'
                  }
                </div>
              )}

              {/* Message bubble */}
              <div className="message-bubble">
                <div className="message-text">{message.content}</div>

                {/* Message time (show on hover or for last message in group) */}
                <div className="message-time">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        );
      },
      [messages, isMyMessage, getMessageTypeClass, formatTimestamp]
    );

    /**
     * Get message count text
     */
    const getMessageCountText = () => {
      const count = messages.length;
      if (count === 0) return "Chưa có tin nhắn";
      return `${count} tin nhắn`;
    };

    return (
      <div className={`game-chat ${isExpanded ? "expanded" : "collapsed"}`}>
        {/* Chat Header */}
        <div className="chat-header" onClick={toggleExpanded}>
          <div className="chat-title">
            <span className="chat-icon">💬</span>
            <span>Trò chuyện</span>
          </div>

          <div className="chat-controls">
            <span className="message-count">{getMessageCountText()}</span>
            <button className="toggle-button" type="button">
              {isExpanded ? "▼" : "▲"}
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {isExpanded && (
          <div className="chat-body">
            {/* Messages Container */}
            <div
              className="messages-container custom-scrollbar"
              ref={messagesContainerRef}
            >
              {messages.length === 0 ? (
                <div className="empty-messages">
                  <div className="empty-icon">💭</div>
                  <div className="empty-text">
                    <p>Chưa có tin nhắn nào</p>
                    <p>Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                </div>
              ) : (
                <div className="messages-list">
                  {messages
                    .slice(-maxMessages)
                    .map((message, index) => renderMessage(message, index))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <div className="input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="message-input"
                  maxLength={500}
                  disabled={!onSendMessage}
                />

                <button
                  type="submit"
                  className="send-button"
                  disabled={!newMessage.trim() || !onSendMessage}
                >
                  <svg className="send-icon" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </button>
              </div>

              {/* Character count */}
              {newMessage.length > 400 && (
                <div className="character-count">{newMessage.length}/500</div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }
);

GameChat.displayName = "GameChat";

export default GameChat;

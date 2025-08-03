// Service Utility Functions
// Common utility functions used across services

import { ServiceConfig } from "./ServiceConfig";

export const ServiceUtils = {
  /**
   * Format error message for user display
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  formatErrorMessage(error) {
    if (error.response) {
      return error.response.data?.message || "Có lỗi xảy ra từ máy chủ";
    } else if (error.request) {
      return "Không thể kết nối đến máy chủ";
    } else {
      return error.message || "Có lỗi không xác định xảy ra";
    }
  },

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @returns {Object} Validated parameters
   */
  validatePagination(params = {}) {
    return {
      page: Math.max(
        0,
        parseInt(params.page) || ServiceConfig.PAGINATION.DEFAULT_PAGE
      ),
      size: Math.min(
        ServiceConfig.PAGINATION.MAX_SIZE,
        Math.max(
          1,
          parseInt(params.size) || ServiceConfig.PAGINATION.DEFAULT_SIZE
        )
      ),
    };
  },

  /**
   * Validate game move coordinates
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if valid
   */
  validateGameMove(row, col) {
    return (
      typeof row === "number" &&
      typeof col === "number" &&
      row >= 0 &&
      row < ServiceConfig.GAME.BOARD_SIZE &&
      col >= 0 &&
      col < ServiceConfig.GAME.BOARD_SIZE
    );
  },

  /**
   * Check if user ID is valid
   * @param {number} userId - User ID to validate
   * @returns {boolean} True if valid
   */
  validateUserId(userId) {
    return typeof userId === "number" && userId > 0;
  },

  /**
   * Sanitize string input
   * @param {string} input - Input string
   * @param {number} maxLength - Maximum length
   * @returns {string} Sanitized string
   */
  sanitizeString(input, maxLength = 255) {
    if (typeof input !== "string") return "";
    return input.trim().substring(0, maxLength);
  },

  /**
   * Create debounced function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Format timestamp for display
   * @param {string|Date} timestamp - Timestamp to format
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN");
  },

  /**
   * Calculate time difference in minutes
   * @param {string|Date} startTime - Start timestamp
   * @param {string|Date} endTime - End timestamp
   * @returns {number} Difference in minutes
   */
  getTimeDifferenceInMinutes(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / (1000 * 60));
  },
};

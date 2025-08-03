// Debug helper cho token persistence
// Thêm vào console để test

window.debugAuth = {
  // Kiểm tra trạng thái auth hiện tại
  checkStatus: () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");

    console.log("=== AUTH STATUS ===");
    console.log("Has token:", !!token);
    console.log("Has refresh token:", !!refreshToken);
    console.log("Has user data:", !!user);

    if (token) {
      try {
        const { jwtDecode } = require("jwt-decode");
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const isValid = decoded.exp > currentTime;

        console.log("Token info:");
        console.log("- Expires at:", new Date(decoded.exp * 1000));
        console.log("- Is valid:", isValid);
        console.log(
          "- Time until expiry:",
          Math.round((decoded.exp - currentTime) / 60),
          "minutes"
        );
        console.log("- Provider:", decoded.provider);
      } catch (e) {
        console.log("Error decoding token:", e);
      }
    }

    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log("User data:", userData);
      } catch (e) {
        console.log("Error parsing user data:", e);
      }
    }

    console.log("==================");
  },

  // Clear tất cả auth data
  clearAll: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    console.log("All auth data cleared");
  },

  // Simulate token expiry
  expireToken: () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Tạo token expired (đặt exp về quá khứ)
      try {
        const { jwtDecode } = require("jwt-decode");
        const decoded = jwtDecode(token);
        const expiredDecoded = {
          ...decoded,
          exp: Math.floor(Date.now() / 1000) - 3600,
        };

        // Không thể tạo lại JWT từ decoded data, chỉ log
        console.log(
          "Token would be expired. Current exp:",
          new Date(decoded.exp * 1000)
        );
        console.log(
          "To test expiry, wait for natural expiration or clear tokens"
        );
      } catch (e) {
        console.log("Error:", e);
      }
    }
  },
};

console.log(
  "Auth debug tools loaded. Use window.debugAuth.checkStatus() to check auth status"
);

export default window.debugAuth;

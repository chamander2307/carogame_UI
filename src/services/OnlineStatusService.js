import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

export const getFriendsOnlineStatus = async () => {
  try {
    const response = await instance.get("/online-status/friends");
    const data = response.data;
    if (data?.success) {
      return {
        success: true,
        message:
          getVietnameseMessage(data.statusCode, "Lấy trạng thái online") ||
          data.message ||
          "Lấy trạng thái online thành công",
        data: data.data || [],
      };
    }
    throw new Error(
      getVietnameseMessage(data.statusCode, "Lấy trạng thái online") ||
        data.message ||
        "Lấy trạng thái online không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.statusCode;
    console.error(
      "Lỗi lấy trạng thái online:",
      error.message,
      "| Mã lỗi:",
      code
    );
    toast.error(
      getVietnameseMessage(code, "Lấy trạng thái online") ||
        error.response?.data?.message ||
        "Lấy trạng thái online không thành công"
    );
    throw new Error(
      getVietnameseMessage(code, "Lấy trạng thái online") ||
        error.response?.data?.message ||
        "Lấy trạng thái online không thành công"
    );
  }
};

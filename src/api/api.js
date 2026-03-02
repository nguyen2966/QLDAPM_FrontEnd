import axiosInstance from "./axiosInstance.js";

export const API = {
  auth: {
    register: (data) => axiosInstance.post("/auth/register", data),
    login: (data) => axiosInstance.post("/auth/login", data),
    loginSocial: (token, provider) => axiosInstance.post("/auth/social-login", { provider, token }),
    refreshToken: () => axiosInstance.post("/auth/refresh-token")
  },
  test: {
    testHealth: () => axiosInstance.get("/test")
  },
  user: {
    /**
     * Lấy thông tin chi tiết User kèm Profile (MOCK DATA)
     * - Trả về cấu trúc lồng nhau y hệt Backend (Prisma).
     * - Mẹo test: Truyền userId chẵn (2,4) sẽ ra Organizer, lẻ (1,3) sẽ ra Customer.
     */
    getUserById: (userId) => axiosInstance.get(`/users/${userId}`),

    /**
     * Cập nhật thông tin User & Profile (MOCK DATA)
     * - Nhận vào data cập nhật và gộp (merge) với mock data cũ để mô phỏng thành công.
     */
    updateUser: (userId, updateData) => axiosInstance.put(`/users/${userId}`,updateData)
    },
  events: {

  }
}
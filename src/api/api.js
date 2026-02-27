import axiosInstance from "./axiosInstance.js";

export const API = {
  auth: {
    register: (data) => axiosInstance.post("/auth/register", data),
    login: (data) => axiosInstance.post("/auth/login", data),
    loginSocial: (token, provider) => axiosInstance.post("/auth/social-login", { provider, token }),
    refreshToken: () => axiosInstance.post("/auth/refresh-token")
  },
  user: {
    /**
     * Lấy thông tin chi tiết User kèm Profile (MOCK DATA)
     * - Trả về cấu trúc lồng nhau y hệt Backend (Prisma).
     * - Mẹo test: Truyền userId chẵn (2,4) sẽ ra Organizer, lẻ (1,3) sẽ ra Customer.
     */
    getUserById: (userId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const isOrganizer = parseInt(userId) % 2 === 0;

          // Cấu trúc dữ liệu chuẩn khớp với schema.prisma [cite: 3, 4]
          const mockData = {
            userId: parseInt(userId),
            email: isOrganizer ? "organizer@example.com" : "customer@example.com",
            name: isOrganizer ? "Công ty Sự kiện ABC" : "Nguyễn Văn Khách",
            phoneNumber: "0901234567",
            role: isOrganizer ? "ORGANIZER" : "CUSTOMER",
            isProfileComplete: true,
            createdAt: "2026-02-27T10:00:00.000Z",

            // Nested object 
            customer: isOrganizer ? null : {
              userId: parseInt(userId)
            },
            organizer: isOrganizer ? {
              userId: parseInt(userId),
              taxCode: "0123456789", // [cite: 7]
              websiteUrl: "https://abc-events.com",
              businessLicenseUrl: "https://example.com/license.pdf"
            } : null
          };

          // Axios response wrapper
          resolve({
            data: {
              message: "Lấy thông tin người dùng thành công (MOCK)",
              data: mockData
            }
          });
        }, 500); // Giả lập chờ API 500ms
      });
    },

    /**
     * Cập nhật thông tin User & Profile (MOCK DATA)
     * - Nhận vào data cập nhật và gộp (merge) với mock data cũ để mô phỏng thành công.
     */
    updateUser: (userId, updateData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const isOrganizer = parseInt(userId) % 2 === 0;

          // Merge dữ liệu update từ form FE gửi lên với dữ liệu gốc
          const mockUpdatedData = {
            userId: parseInt(userId),
            email: "updated@example.com", // Giả sử email ko cho sửa
            name: updateData.name || (isOrganizer ? "Công ty Sự kiện ABC" : "Nguyễn Văn Khách"),
            phoneNumber: updateData.phoneNumber || "0901234567",
            role: isOrganizer ? "ORGANIZER" : "CUSTOMER",
            isProfileComplete: updateData.isProfileComplete !== undefined ? updateData.isProfileComplete : true,
            createdAt: "2026-02-27T10:00:00.000Z",

            customer: isOrganizer ? null : {
              userId: parseInt(userId)
            },
            organizer: isOrganizer ? {
              userId: parseInt(userId),
              taxCode: updateData.taxCode || "0123456789", // [cite: 7]
              websiteUrl: updateData.websiteUrl || "https://abc-events.com",
              businessLicenseUrl: updateData.businessLicenseUrl || "https://example.com/license.pdf"
            } : null
          };

          resolve({
            data: {
              message: "Cập nhật thông tin thành công (MOCK)",
              data: mockUpdatedData
            }
          });
        }, 600); // Giả lập chờ lưu DB 600ms
      });
    }
  },
  events: {

  }
}
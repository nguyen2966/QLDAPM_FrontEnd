import axiosInstance from "./axiosInstance.js";

export const API = {
  auth: {
    register: (data) => axiosInstance.post("/auth/register", data),
    login: (data) => axiosInstance.post("/auth/login", data),
    loginSocial: (token, provider) => axiosInstance.post("/auth/social-login", { provider, token }),
    refreshToken: () => axiosInstance.post("/auth/refresh-token"),
    logout: () => axiosInstance.delete("/auth/delete-token"),
  },

  test: {
    testHealth: () => axiosInstance.get("/test"),
  },

  user: {
    getUserById: (userId) => axiosInstance.get(`/users/${userId}`),
    updateUser: (userId, updateData) => axiosInstance.put(`/users/${userId}`, updateData),
  },

  event: {
    // ── PUBLIC ──────────────────────────────────────────────────
    // GET /event — Danh sách sự kiện (APPROVED / IN_PROGRESS)
    getAll: () =>
      axiosInstance.get("/event"),

    // GET /event/:id — Chi tiết 1 sự kiện
    getById: (eventId) =>
      axiosInstance.get(`/event/${eventId}`),

    // ── ORGANIZER DASHBOARD ─────────────────────────────────────
    // GET /event/my-event — Danh sách event của NTC đang đăng nhập
    getMyEvents: () =>
      axiosInstance.get("/event/my-event"),

    // GET /event/my-event/:id — Chi tiết 1 event của NTC
    getMyEventById: (eventId) =>
      axiosInstance.get(`/event/my-event/${eventId}`),

    // ── WIZARD — BƯỚC 1 ─────────────────────────────────────────
    // POST /event/my-event — Tạo thông tin cơ bản (multipart/form-data)
    // data phải là FormData (đã append các field + file ảnh)
    createBasicInfo: (formData) =>
      axiosInstance.post("/event/my-event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    // ── WIZARD — BƯỚC 2 ─────────────────────────────────────────
    // POST /event/my-event/:id/ticket-classes — Tạo hạng vé
    // data: { ticketClasses: [{ className, price, quota, color, type }] }
    createTicketClasses: (eventId, data) =>
      axiosInstance.post(`/event/my-event/${eventId}/ticket-classes`, data),

    // GET /event/my-event/:id/ticket-classes — Lấy danh sách hạng vé (sau Bước 2, trước Bước 3)
    getTicketClasses: (eventId) =>
      axiosInstance.get(`/event/my-event/${eventId}/ticket-classes`),

    // ── WIZARD — BƯỚC 3 ─────────────────────────────────────────
    // POST /event/my-event/:id/layout — Lưu sơ đồ ghế + sinh ghế vật lý
    // data: { canvas: {...}, seatLayout: [...] }
    createLayout: (eventId, data) =>
      axiosInstance.post(`/event/my-event/${eventId}/layout`, data),

    // ── UPDATE / CANCEL ─────────────────────────────────────────
    // PUT /event/my-event/:id — Cập nhật thông tin hoặc hủy mềm { status: "CANCELLED" }
    update: (eventId, data) =>
      axiosInstance.put(`/event/my-event/${eventId}`, data),
  },

  venue: {
    // GET /venues — Danh sách địa điểm dùng cho Dropdown Bước 1
    // Truy cập kết quả: const venues = response.data.data
    getAllVenues: () => axiosInstance.get("/venues"),
  },
};
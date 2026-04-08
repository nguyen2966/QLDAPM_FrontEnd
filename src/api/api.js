import axiosInstance from "./axiosInstance.js";

export const API = {
  auth: {
    register: (data) => axiosInstance.post("/auth/register", data),
    login: (data) => axiosInstance.post("/auth/login", data),
    loginSocial: (token, provider) =>
      axiosInstance.post("/auth/social-login", { provider, token }),
    refreshToken: () => axiosInstance.post("/auth/refresh-token"),
    logout: () => axiosInstance.delete("/auth/delete-token"),
  },

  test: {
    testHealth: () => axiosInstance.get("/test"),
  },

  user: {
    getUserById: (userId) => axiosInstance.get(`/users/${userId}`),
    updateUser: (userId, updateData) =>
      axiosInstance.put(`/users/${userId}`, updateData,{
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  event: {
    getAll: () => axiosInstance.get("/event"),
    getVenues: () => axiosInstance.get("/event/venues"),
    getById: (eventId) => axiosInstance.get(`/event/${eventId}`),

    getMyEvents: () => axiosInstance.get("/event/my-event"),
    getMyEventById: (eventId) => axiosInstance.get(`/event/my-event/${eventId}`),

    createBasicInfo: (formData) =>
      axiosInstance.post("/event/my-event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    createTicketClasses: (eventId, ticketClasses) =>
      axiosInstance.post(`/event/my-event/${eventId}/ticket-classes`, ticketClasses),

    update: (eventId, data) =>
      axiosInstance.put(`/event/my-event/${eventId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },}),

    editTicketClasses: (eventId, ticketClasses) => 
      axiosInstance.put(`/event/my-event/${eventId}/ticket-classes`, ticketClasses),

    getTicketClasses: (eventId) =>
      axiosInstance.get(`/event/my-event/${eventId}/ticket-classes`),

    createLayout: (eventId, data) =>
      axiosInstance.post(`/event/my-event/${eventId}/layout`, data),

    update: (eventId, data) =>
      axiosInstance.put(`/event/my-event/${eventId}`, data),

    getMyOrderCustomer: () => axiosInstance.get("/event/my-tickets"),
  },

  order: {
    createOrder: (seatIds) => axiosInstance.post('/orders/create', seatIds),
    updateOrder: (orderId, seatIds) => axiosInstance.put(`/orders/${orderId}`, seatIds),
    confirmPayment: (orderId,seatIds)=> axiosInstance.post(`/orders/${orderId}/confirm-payment`,seatIds),
    getOrder: () => axiosInstance.get('/orders'),
    getOrderDetails: (orderId) => axiosInstance.get(`/orders/${orderId}`)
  },

  payment: {
    // Thêm các trường fullName, email, phone vào payload gửi lên
    createLinkMomo: (orderId, seatIds, amount, customerInfo) => 
      axiosInstance.post(`/payment/momo-link`, { 
        orderId, 
        seatIds, 
        amount, 
        fullName: customerInfo.fullName,
        email: customerInfo.email,
        phone: customerInfo.phone
      }),

    freePay: (orderId, seatIds, customerInfo) => 
      axiosInstance.post(`/payment/free-payment`, { 
        orderId, 
        seatIds,
        fullName: customerInfo.fullName,
        email: customerInfo.email,
        phone: customerInfo.phone
      }),
  },

  QR: {
    getQRToken: (ticketCode) => axiosInstance.get(`/qr-token?ticketCode=${ticketCode}`),
  },

  ticket: {
    getInfo: (ticketCode) => axiosInstance.get(`/ticket/info?ticketCode=${ticketCode}`),
  },

  admin: {
    //Sau khi hiện thực các API backend thì thêm vào đây
  }
};
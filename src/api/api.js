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
      axiosInstance.put(`/users/${userId}`, updateData),
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

    getTicketClasses: (eventId) =>
      axiosInstance.get(`/event/my-event/${eventId}/ticket-classes`),

    createLayout: (eventId, data) =>
      axiosInstance.post(`/event/my-event/${eventId}/layout`, data),

    update: (eventId, data) =>
      axiosInstance.put(`/event/my-event/${eventId}`, data),
  },

  order: {
    createOrder: (seatIds) => axiosInstance.post('/orders/create', seatIds),
    confirmPayment: (orderId,seatIds)=> axiosInstance.post(`/orders/${orderId}/confirm-payment`,seatIds)
  }
};
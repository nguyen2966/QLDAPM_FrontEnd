import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Gửi cookie refreshToken tự động
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm set/xóa Authorization header
export const setAuthHeader = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// ─── Interceptor xử lý 401 (accessToken hết hạn) ───────────────────────────
let isRefreshing = false;
// Hàng đợi các request bị 401 trong khi đang refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response, // Thành công → trả thẳng

  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401 và chưa retry lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu chính request refresh-token cũng bị 401 → logout hẳn
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        setAuthHeader(null);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang refresh rồi → đưa vào hàng đợi, chờ token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh-token (dùng cookie httpOnly, không cần truyền token)
        const { data } = await axiosInstance.post("/auth/refresh-token");
        const newAccessToken = data.data.accessToken;

        setAuthHeader(newAccessToken);
        processQueue(null, newAccessToken);

        // Retry request gốc với token mới
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → xóa token, chuyển về login
        processQueue(refreshError, null);
        setAuthHeader(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
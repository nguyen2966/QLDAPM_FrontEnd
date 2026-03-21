import axios from "axios";
import { EnvVariables } from "../env/env.js";

const axiosInstance = axios.create({
  baseURL: EnvVariables.BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthHeader = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshUrl = originalRequest.url?.includes("/auth/refresh-token");

    // ── Xử lý lỗi từ chính request refresh-token ──────────────────────────
    if (isRefreshUrl) {
      setAuthHeader(null);
      if (status === 403) {
        // refreshToken hết hạn → bắt buộc đăng nhập lại
        window.location.href = "/login";
      }
      // status 401: không có token → user chưa đăng nhập, AuthProvider tự xử lý
      // Không redirect ở đây để AuthProvider catch được và setLoading(false) bình thường
      return Promise.reject(error);
    }

    // ── accessToken hết hạn (403) → thử refresh ───────────────────────────
    if (status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const { data } = await axiosInstance.post("/auth/refresh-token");
        const newAccessToken = data.data.accessToken;

        setAuthHeader(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refresh-token hết hạn → guard ở trên đã redirect /login
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
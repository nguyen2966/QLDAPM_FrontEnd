import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

//Ham de set access token vao header http
export const setAuthHeader = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;
import axiosInstance from "./axiosInstance.js";

export const API = {
  auth: {
    register: (data) => axiosInstance.post("/auth/register",data),
    login: (data) => axiosInstance.post("/auth/login",data),
    loginSocial: (token,provider) => axiosInstance.post("/auth/social-login",{provider,token}),
    refreshToken: () => axiosInstance.post("/auth/refresh-token")
  },
  user:{

  },
  events:{

  }
}
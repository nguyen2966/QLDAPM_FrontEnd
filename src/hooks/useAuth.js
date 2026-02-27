import { useContext } from "react";
import { AuthContext } from "../context/Auth/AuthContext.js";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Kiểm tra an toàn: Nếu gọi useAuth bên ngoài AuthProvider sẽ báo lỗi ngay
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
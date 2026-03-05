import { useContext } from "react";
import { DataContext } from "../context/Data/DataContext.js";

export const useData = () => {
  const context = useContext(DataContext);
  
  // Kiểm tra an toàn: Nếu gọi useData bên ngoài DataProvider sẽ báo lỗi ngay
  if (!context) {
    throw new Error("useData must be used within an AuthProvider");
  }
  
  return context;
};
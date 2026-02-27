import "./UserPage.css"
import { useAuth } from "../../hooks/useAuth.js"
import { API } from "../../api/api.js";

export function UserPage(){
  // Khi đăng nhập xong, app đã lưu biến user chứa các thông tin cơ 
  // bản như userId, email ... vào state, ta chỉ cần lấy ra dùng
  // biến user này chỉ có ý nghĩa để lưu userId và phân quyền trên react app chứ ko có ý nghĩa chứa thông tin thật sự như userInfo dc lấy bằng api
  const { user } = useAuth();

  // viết hàm gọi api để lấy user info và lưu vào state của page này
  // viết hàm gọi api để chỉnh sửa user info
  

  return (
    <div className="user-info-page">
      <h2>Hello, {user?.name || user?.email}!</h2>
    </div>
  );
} 
import { Link } from "react-router-dom"

export const AdminPanel = () => {
  return (
    <div>
      Welcome to Admin Panel
      <br />

      <Link to="/admin/organizer-approve">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Chuyển đến trang duyệt nhà tổ chức
        </button>
      </Link>

      <br />

      <Link to="/admin/event">
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          Chuyển đến trang duyệt sự kiện
        </button>
      </Link>

      <br />
      <Link to="/admin/user">
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
          Chuyển đến trang quản lý người dùng hệ thống
        </button>
      </Link>

    </div>
  )
}
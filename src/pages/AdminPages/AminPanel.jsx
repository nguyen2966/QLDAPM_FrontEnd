import { Link } from "react-router-dom";

export const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bảng điều khiển Quản trị
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Chào mừng bạn quay trở lại. Vui lòng chọn một chức năng bên dưới để tiếp tục công việc.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Duyệt nhà tổ chức */}
          <Link 
            to="/admin/organizer-approve" 
            className="group block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-red-200 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
              Duyệt nhà tổ chức
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Xem xét, kiểm tra thông tin và phê duyệt tài khoản cho các nhà tổ chức sự kiện mới trên hệ thống.
            </p>
          </Link>

          {/* 2. Duyệt sự kiện */}
          <Link 
            to="/admin/event" 
            className="group block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-red-200 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
              Duyệt sự kiện
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Quản lý danh sách các sự kiện đang chờ duyệt, kiểm duyệt nội dung và quyết định cấp phép xuất bản.
            </p>
          </Link>

          {/* 3. Quản lý người dùng */}
          <Link 
            to="/admin/user" 
            className="group block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-red-200 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
              Quản lý người dùng
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Theo dõi danh sách khách hàng và nhà tổ chức, xem chi tiết lịch sử hoạt động và xử lý khóa/mở khóa tài khoản.
            </p>
          </Link>

        </div>
        
      </div>
    </div>
  );
};

export default AdminPanel;
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import LockAccountModal from "./components/LockAccountModal";
import { API } from "../../../api/api";
import { toast } from "react-toastify";
import UnlockAccountModal from "./components/UnlockAccountModal";

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-10 h-10 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
  </div>
);

/* ─── Empty state ────────────────────────────────────────────────────────── */
const EmptyState = () => (
  <tr>
    <td colSpan={7}>
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg
          className="w-16 h-16 mb-4 text-red-100"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <p className="text-sm font-semibold text-gray-500">Không tìm thấy người dùng nào</p>
        <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc tìm kiếm của bạn</p>
      </div>
    </td>
  </tr>
);

const roleMap = {
  CUSTOMER: "Khách hàng",
  ORGANIZER: "Nhà tổ chức",
};

export const AdminUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters State
  const [totalItem, setTotalItem] = useState(0);
  const [totalOrganizers, setTotalOrganizers] = useState(0);
  const [totalLocked, setTotalLocked] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  
  const [lockUser, setLockUser] = useState(null);
  const [unlockUser, setUnlockUser] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalItem / pageSize));

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Gọi API thực tế, bạn có thể cần truyền thêm `pageSize` vào API nếu BE có hỗ trợ
      let res;
      if(search == "" && role == "") {
        res = await API.admin.getUsers({ page, pageSize });
      } else if (role == "") {
        res = await API.admin.getUsers({ page, pageSize, search });
      } else if (search == "") {
        res = await API.admin.getUsers({ page, pageSize, role });
      } else {
        res = await API.admin.getUsers({ page, pageSize, role, search });
      }
      const data = res.data.data;
      setUsers(data.items || []);
      setTotalItem(data.totalItem || 0);
      
      // Giả sử API trả về các thông số này, nếu không bạn cần gọi API thống kê riêng
      const totalOrg = users.filter((u) => u.role === "ORGANIZER").length
      const totalLock = users.filter((u) => u.isDeleted === 1).length
      console.log(totalOrg, totalLock);
      setTotalOrganizers(totalOrg);
      setTotalLocked(totalLock);
      
    } catch (err) {
        toast.error("Lỗi khi tải danh sách người dùng!")
      console.error("Lỗi khi tải danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleLock = async (userId, reason) => {
    try {
      const res = await API.admin.disableUser(userId, reason || "Vi phạm điều khoản sử dụng");
      setLockUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnLock = async (userId, reason) => {
    try {
      const res = await API.admin.enableUser(userId, reason || "Tài khoản đã được hợp lệ");
      setUnlockUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetail = (user) => {
    if (user.role === "CUSTOMER") {
      navigate(`/admin/customer/${user.userId}`);
    } else {
      navigate(`/admin/organizer/${user.userId}`);
    }
  };

  const getStatusLabel = (user) => {
    if (user.isDeleted === 1) return "Bị khóa";
    if (user.role === "ORGANIZER" && user.isProfileComplete === false) return "Chờ duyệt";
    return "Hoạt động";
  };

  const getStatusBadgeColor = (statusText) => {
    switch (statusText) {
      case "Hoạt động": return "bg-green-100 text-green-700 border-green-200";
      case "Bị khóa": return "bg-red-100 text-red-700 border-red-200";
      case "Chờ duyệt": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/admin" className="text-gray-400 hover:text-red-700 transition-colors">
            Quản trị viên
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-red-700 font-medium">Quản lý người dùng</span>
        </nav>

        {/* Heading */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý người dùng</h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý danh sách khách hàng và nhà tổ chức trên hệ thống
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
            <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalItem}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
            <p className="text-sm font-medium text-gray-500">Tổng nhà tổ chức</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{totalOrganizers || "Chưa có thông tin"}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
            <p className="text-sm font-medium text-gray-500">Tài khoản bị khóa</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalLocked || "Chưa có thông tin"}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm tên người dùng, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition"
              />
            </div>

            {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-600 bg-white transition min-w-[150px]"
            >
              <option value="">Tất cả vai trò</option>
              <option value="CUSTOMER">Khách hàng</option>
              <option value="ORGANIZER">Nhà tổ chức</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-600 bg-white transition min-w-[160px]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Bị khóa</option>
            </select>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* ── Table Section ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table top bar */}
          <div className="px-6 py-3 bg-red-700 flex items-center justify-between">
            <span className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Danh sách tài khoản
            </span>
            {!loading && (
              <span className="text-red-200 text-xs font-medium">
                Tổng số: {totalItem}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-red-50">
                  {["STT", "Thông tin người dùng", "Liên hệ", "Vai trò", "Trạng thái", "Thao tác"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <EmptyState />
                ) : (
                  users.map((user, idx) => {
                    const statusText = getStatusLabel(user);
                    return (
                      <tr key={user.userId} className="hover:bg-red-50/60 transition-colors group">
                        {/* STT */}
                        <td className="px-6 py-4 text-sm text-gray-400 font-medium w-12">
                          {(page - 1) * pageSize + idx + 1}
                        </td>

                        {/* Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700 font-bold text-sm">
                              {user.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{user.phoneNumber || "Chưa cập nhật SDT"}</p>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                            {roleMap[user.role] || user.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(statusText)}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(user)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                            >
                              Chi tiết
                            </button>
                            {statusText !== "Bị khóa" ? (
                              <button
                                onClick={() => setLockUser(user)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-all shadow-sm"
                              >
                                Khóa
                              </button>
                            ): (
                                <button
                                onClick={() => setUnlockUser(user)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-all shadow-sm"
                              >
                                Mở khóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          {!loading && users.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1); // Reset to first page when changing page size
                  }}
                  className="px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-700 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-500">người dùng trên trang</span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &laquo; Trước
                </button>
                
                {generatePageNumbers().map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 py-1.5 text-sm rounded-md border transition-colors ${
                      page === num 
                        ? "bg-red-700 text-white border-red-700 font-semibold" 
                        : "bg-white text-gray-600 border-gray-200 hover:text-red-700 hover:border-red-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {lockUser && (
        <LockAccountModal
          user={lockUser}
          onConfirm={() => handleLock(lockUser.userId)}
          onCancel={() => setLockUser(null)}
        />
      )}

      {unlockUser && 
        <UnlockAccountModal
          user={unlockUser}
          onConfirm={() => handleUnLock(unlockUser.userId)}
          onCancel={() => setUnlockUser(null)}
        />
      }
    </div>
  );
};

export default AdminUserList;
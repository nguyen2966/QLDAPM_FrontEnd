import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

export const AdminOrganizerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.admin.getOrganizerInformation(id);
      setData(res.data?.data || res.data);
    } catch (err) {
      toast.error("Gặp lỗi trong quá trình lấy thông tin người tổ chức!.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleLock = async (userId, reason) => {
    try {
      await API.admin.disableUser(
        userId,
        reason || "Vi phạm điều khoản sử dụng",
      );
      toast.success("Đã khóa người tổ chức này thành công.");
      setShowLock(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlock = async (userId, reason) => {
    try {
      await API.admin.enableUser(
        userId,
        reason || "Người dùng đã được chứng thực.",
      );
      toast.success("Mở khóa người tổ chức này thành công.");
      setShowUnlock(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          <Spinner />
        </main>
      </div>
    );
  }

  if (!data || !data.organizerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans items-center justify-center">
        <p className="text-gray-500 font-medium">
          Không tìm thấy thông tin nhà tổ chức.
        </p>
        <Link to="/admin/user" className="mt-4 text-red-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const user = data.organizerInfo;
  const events = data.eventHistory || [];

  const statusMap = {
    APPROVED: "Đã duyệt",
    PENDING: "Chờ duyệt",
    REJECTED: "Bị từ chối",
  };

  const getEventStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link
            to="/admin"
            className="text-gray-400 hover:text-red-700 transition-colors"
          >
            Quản trị viên
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            to="/admin/user"
            className="text-gray-400 hover:text-red-700 transition-colors"
          >
            Quản lý người dùng
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-red-700 font-medium">Chi tiết nhà tổ chức</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left Column: Profile Card ── */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">
                Hồ sơ tài khoản
              </h2>

              <div className="flex flex-col items-center mb-6 text-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border border-gray-200 mb-3 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                    {info.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  Nhà tổ chức
                </span>
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Email liên hệ</p>
                  <p className="font-medium text-gray-900 break-all">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Số điện thoại</p>
                  <p className="font-medium text-gray-900">
                    {user.phoneNumber || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Trạng thái</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${user.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Giấy phép</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${user.isApproved ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                    >
                      {user.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  user.isActive ? setShowLock(true) : setShowUnlock(true)
                }
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 border ${
                  user.isActive
                    ? "bg-white text-red-700 border-red-300 hover:bg-red-50"
                    : "bg-white text-green-700 border-green-300 hover:bg-green-50"
                }`}
              >
                {user.isActive ? "KHÓA TÀI KHOẢN" : "MỞ KHÓA TÀI KHOẢN"}
              </button>
            </div>
          </div>

          {/* ── Right Column: Stats & Events ── */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng sự kiện đã tạo
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {user.totalEvent || 0}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng sự kiện đã được duyệt
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {user.totalApprovedEvent || 0}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng sự kiện chờ duyệt
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {user.totalPendingEvent || 0}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng sự kiện bị từ chối
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {user.totalCanceledEvent === 0
                    ? events.filter((e) => e.status == "REJECTED").length
                    : user.totalCanceledEvent}
                </p>
              </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Lịch sử sự kiện
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                        Tên sự kiện
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                        Thời gian & Địa điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider text-center">
                        Tình trạng vé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider text-center">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.map((event, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-red-50/50 transition-colors group"
                      >
                        {/* Event Name */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2">
                            {event.eventName}
                          </p>
                        </td>

                        {/* Date & Location */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(event.dateToStart).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p
                            className="text-xs text-gray-500 mt-1 truncate max-w-[200px]"
                            title={event.address}
                          >
                            {event.address}
                          </p>
                        </td>

                        {/* Tickets Info */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center text-sm">
                            <span className="font-semibold text-gray-900">
                              {event.bookedTickets}
                            </span>
                            <span className="text-xs text-gray-400 border-t border-gray-200 px-2 mt-0.5 pt-0.5">
                              Tổng:{" "}
                              {(event.bookedTickets || 0) +
                                (event.availableTickets || 0)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getEventStatusBadge(event.status)}`}
                          >
                            {statusMap[event.status] || event.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {events.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-sm text-gray-500">
                            Nhà tổ chức này chưa tạo sự kiện nào.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Khóa / Mở khóa tài khoản */}
      {showLock && user && (
        <LockAccountModal
          user={{
            userId: id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
          }}
          onConfirm={handleLock}
          onCancel={() => setShowLock(false)}
        />
      )}

      {showUnlock && user && (
        <UnlockAccountModal
          user={{
            userId: id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
          }}
          onConfirm={handleUnlock}
          onCancel={() => setShowUnlock(false)}
        />
      )}
    </div>
  );
};

export default AdminOrganizerDetail;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LockAccountModal from "./components/LockAccountModal";
import UnlockAccountModal from "./components/UnlockAccountModal";
import { API } from "../../../api/api";
import { toast } from "react-toastify";

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-10 h-10 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
  </div>
);

const fmtCurrency = (amount) => {
  const num = Number(amount);
  return isNaN(num) || num === 0
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(num);
};

export const AdminCustomerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLock, setShowLock] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.admin.getCustomerInfo(id);
      setData(res.data?.data || res.data);
    } catch (err) {
      toast.error("Gặp lỗi khi tải thông tin khách hàng!");
      console.error("Lỗi khi tải thông tin khách hàng:", err);
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
      setShowLock(false);
      toast.success("Khóa tài khoản khách hàng thành công.");
      fetchData(); // Refresh data sau khi khóa/mở khóa
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlock = async (userId, reason) => {
    try {
      await API.admin.enableUser(
        userId,
        reason || "Vi phạm điều khoản sử dụng",
      );
      setShowUnlock(false);
      toast.success("Mở khóa tài khoản khách hàng thành công.");
      fetchData(); // Refresh data sau khi khóa/mở khóa
    } catch (err) {
      console.error(err);
    }
  };

  const info = data?.customerInfo;
  const historyEvents = data?.historyTickets || [];

  // Tính toán thống kê vé từ mảng historyTickets
  const allTickets = historyEvents.flatMap((event) => event.tickets || []);
  const totalBought = allTickets.flat().length;
  const usedCount = allTickets.filter((t) => t.status === "USED").length;
  const activeCount = allTickets.flat().filter(
    (t) => t.status === "ACTIVE" || t.status === "USED",
  ).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        <Spinner />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="max-w-7xl mx-auto w-full px-6 py-8 text-center">
        <p className="text-gray-500 font-medium">
          Không tìm thấy thông tin khách hàng.
        </p>
        <Link to="/admin/user" className="mt-4 text-red-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-4 font-sans">
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
        <span className="text-red-700 font-medium">Chi tiết khách hàng</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left Column: Profile Card ── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">
              Hồ sơ tài khoản
            </h2>

            <div className="flex flex-col items-center mb-6 text-center">
              {info.avatarUrl ? (
                <img
                  src={info.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border border-gray-200 mb-3 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                  {info.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900">{info.name}</h3>
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                Khách hàng
              </span>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Email liên hệ</p>
                <p className="font-medium text-gray-900 break-all">
                  {info.email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Số điện thoại</p>
                <p className="font-medium text-gray-900">
                  {info.phoneNumber || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Ngày tạo tài khoản</p>
                <p className="font-medium text-gray-900">
                  {info.createdAt
                    ? new Date(info.createdAt).toLocaleDateString("vi-VN")
                    : "—"}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-gray-500 text-xs mb-2">
                  Trạng thái tài khoản
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${info.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                >
                  {info.isActive ? "Đang hoạt động" : "Bị khóa"}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() =>
                info.isActive ? setShowLock(true) : setShowUnlock(true)
              }
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 border ${
                info.isActive
                  ? "bg-white text-red-700 border-red-300 hover:bg-red-50"
                  : "bg-white text-green-700 border-green-300 hover:bg-green-50"
              }`}
            >
              {info.isActive ? "KHÓA TÀI KHOẢN" : "MỞ KHÓA TÀI KHOẢN"}
            </button>
          </div>
        </div>

        {/* ── Right Column: Tickets & History ── */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng vé đã mua
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalBought}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vé chưa sử dụng
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vé đã sử dụng
              </p>
              <p className="text-2xl font-bold text-gray-400 mt-1">
                {usedCount}
              </p>
            </div>
          </div>

          {/* Purchased Tickets Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Danh sách sự kiện đã tham gia
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
                      Ngày tổ chức
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-red-700 uppercase tracking-wider">
                      Số vé
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-red-700 uppercase tracking-wider">
                      Tổng giá tiền
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-red-700 uppercase tracking-wider">
                      Trạng thái vé
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyEvents.map((event, i) => {
                    const ticketCount = event.tickets?.flat().length || 0;
                    const hasActiveTicket = event.tickets?.flat().some(
                      (tk) => tk.status === "ACTIVE",
                    );

                    return (
                      <tr
                        key={i}
                        className="hover:bg-red-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {event.eventName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(event.dateToStart).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                          {ticketCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                          {fmtCurrency(event.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              hasActiveTicket
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {hasActiveTicket
                              ? "Còn hiệu lực"
                              : "Đã sử dụng hết"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {historyEvents.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        Khách hàng này chưa mua vé nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Check-in History Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Lịch sử sử dụng vé (Check-in)
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
                      Mã vé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                      Thời điểm Check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyEvents.flatMap((event) =>
                    event.tickets
                      ?.filter((tk) => tk.status === "USED")
                      .map((tk, j) => (
                        <tr
                          key={`${event.eventName}-${j}`}
                          className="hover:bg-red-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {event.eventName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200">
                              {tk.ticketCode || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-700">
                            {tk.checkedInAt
                              ? new Date(tk.checkedInAt).toLocaleString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  },
                                )
                              : "Đã xác nhận"}
                          </td>
                        </tr>
                      )),
                  )}

                  {/* Render empty state nếu không có vé nào có trạng thái USED */}
                  {usedCount === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        Khách hàng này chưa check-in vé nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Khóa / Mở khóa tài khoản */}
      {showLock && info && (
        <LockAccountModal
          user={{
            userId: id,
            name: info.name,
            email: info.email,
            phoneNumber: info.phoneNumber,
            isActive: info.isActive,
          }}
          onConfirm={handleLock}
          onCancel={() => setShowLock(false)}
        />
      )}

      {showUnlock && info && (
        <UnlockAccountModal
          user={{
            userId: id,
            name: info.name,
            email: info.email,
            phoneNumber: info.phoneNumber,
            isActive: info.isActive,
          }}
          onConfirm={handleUnlock}
          onCancel={() => setShowUnlock(false)}
        />
      )}
    </div>
  );
};

export default AdminCustomerDetail;

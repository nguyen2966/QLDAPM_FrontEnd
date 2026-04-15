import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LockAccountModal from "./components/LockAccountModal";
import { API } from "../../../api/api";

const AdminOrganizerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [showLock, setShowLock] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getUserHistory(id, "all");
      if (res.status === "success") setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleLock = async (userId) => {
    try {
      await disableUser(userId);
      setShowLock(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const user = data?.user;
  const events = data?.history?.events || [];

  const totalCreated = events.length;
  const approved = events.filter((e) => e.status === "APPROVED").length;
  const pending = events.filter((e) => e.status === "PENDING").length;
  const rejected = events.filter((e) => e.status === "REJECTED").length;

  const statusMap = {
    APPROVED: "Đã duyệt",
    PENDING: "Chờ duyệt",
    REJECTED: "Bị từ chối",
  };

  if (!user) {
    return (
      <div>
        <p className="py-10 text-center text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        Quản trị viên / Quản lí người dùng / Chi tiết khách hàng
      </p>

      <div className="flex gap-8">
        {/* Left: Profile */}
        <div className="w-72 shrink-0 rounded border border-border p-6">
          <p className="mb-1 text-xs text-muted-foreground">Thông tin khách hàng</p>
          <p className="mb-4 text-xs text-muted-foreground">Hồ sơ tài khoản</p>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Số điện thoại</p>
              <p className="font-medium text-foreground">{user.phoneNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vai trò</p>
              <span className="inline-block rounded border border-border px-2 py-0.5 text-foreground">
                Nhà tổ chức
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <span className="inline-block rounded border border-border px-2 py-0.5 text-foreground">
                {user.isActive ? "Đang hoạt động" : "Bị khóa"}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Trạng thái giấy phép</p>
              <span className="inline-block rounded border border-border px-2 py-0.5 text-foreground">
                {user.isApproved ? "Đã duyệt" : "Chờ duyệt"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLock(true)}
            className="w-full rounded border border-foreground px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            KHÓA TÀI KHOẢN
          </button>
        </div>

        {/* Right: Events */}
        <div className="flex-1">
          {/* Stats */}
          <div className="mb-6 flex gap-4">
            <div className="rounded border border-border px-5 py-3 text-sm">
              <p className="text-muted-foreground">Tổng sự kiện đã tạo</p>
              <p className="text-lg font-bold text-foreground">{totalCreated}</p>
            </div>
            <div className="rounded border border-border px-5 py-3 text-sm">
              <p className="text-muted-foreground">Tổng sự kiện đã duyệt</p>
              <p className="text-lg font-bold text-foreground">{approved}</p>
            </div>
            <div className="rounded border border-border px-5 py-3 text-sm">
              <p className="text-muted-foreground">Tổng sự kiện chờ duyệt</p>
              <p className="text-lg font-bold text-foreground">{pending}</p>
            </div>
            <div className="rounded border border-border px-5 py-3 text-sm">
              <p className="text-muted-foreground">Tổng sự kiện bị từ chối</p>
              <p className="text-lg font-bold text-foreground">{rejected}</p>
            </div>
          </div>

          {/* Events table */}
          <div className="rounded border border-border">
            <h3 className="border-b border-border px-4 py-3 text-center text-sm font-bold uppercase text-foreground">
              Danh sách sự kiện đã tạo
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium text-foreground">Tên sự kiện</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Thời gian tổ chức</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Địa điểm</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Trạng thái</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Vé đã bán</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.eventId} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground">{event.eventName}</td>
                    <td className="px-4 py-3 text-foreground">
                      {new Date(event.eventDate).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-foreground">-</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded border border-border px-2 py-0.5 text-xs text-foreground">
                        {statusMap[event.status] || event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{event.totalTicketsSold}</td>
                    <td className="px-4 py-3">
                      <button className="rounded bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showLock && user && (
        <LockAccountModal
          user={{ userId: id, name: user.name, email: user.email, phoneNumber: user.phoneNumber }}
          onConfirm={handleLock}
          onCancel={() => setShowLock(false)}
        />
      )}
    </div>
  );
};

export default AdminOrganizerDetail;

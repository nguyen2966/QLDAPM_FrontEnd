import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../api/api";
import { AdminRejectModal } from "./components/AdminRejectModal";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const fmtCurrency = (amount) => {
  const num = Number(amount);
  return isNaN(num) || num === 0
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(num);
};

/* ─── Section wrapper ────────────────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
      <h3 className="text-sm font-bold text-gray-700 tracking-wide">{title}</h3>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

/* ─── Ticket card ────────────────────────────────────────────────────────── */
const TicketCard = ({ ticket }) => {
  const numPrice = Number(ticket.price);
  const isFree = isNaN(numPrice) || numPrice === 0;

  return (
    <div
      className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all relative overflow-hidden"
      style={{
        borderLeftColor: ticket.color || "#e5e7eb",
        borderLeftWidth: "4px",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-gray-900">
          {ticket.className ?? "Loại vé"}
        </p>
        <span
          className={`text-sm font-extrabold flex-shrink-0 ${isFree ? "text-green-600" : "text-red-700"}`}
        >
          {fmtCurrency(ticket.price)}
        </span>
      </div>
      {ticket.type && (
        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
          {ticket.type === "SEATED" ? "GHẾ NGỒI" : "ĐỨNG"}
        </span>
      )}
      {ticket.description && (
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
          {ticket.description}
        </p>
      )}
      {ticket.quota != null && (
        <p className="text-xs text-gray-400 mt-2">
          Số lượng: {ticket.quota} vé
        </p>
      )}
    </div>
  );
};

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center items-center py-40">
    <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export const EventApprovalDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /* ── Fetch event detail ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.admin.getEvent(eventId);
        console.log("Event Data:", res.data.data);
        setEvent(res.data.data);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ??
            err.message ??
            "Không thể tải thông tin sự kiện.",
          { duration: 4000 },
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  /* ── Approve ── */
  const confirmApprove = async () => {
    setApproving(true);
    setShowApprove(false); // Đóng modal trước khi chạy
    try {
      await API.admin.approveEvent(eventId);
      toast.success("Sự kiện đã được duyệt thành công!");
      navigate("/admin/event");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Duyệt thất bại.");
    } finally {
      setApproving(false);
    }
  };

  const handleApproveClick = () => {
    setShowApprove(true); // Chỉ mở Modal chứ chưa gọi API
  };

  /* ── Render ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans gap-4">
        <p className="text-gray-500 text-sm">Không tìm thấy sự kiện.</p>
        <Link
          to="/admin/event"
          className="text-red-700 text-sm font-semibold hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const tickets = event.ticketClasses ?? [];
  const terms = [
    "Người tham gia phải trên 16 tuổi (trẻ em dưới 16 tuổi cần có người giám hộ đi theo)",
    "Không được mang theo vũ khí, các vật sắc nhọn vào sự kiện",
    "Mỗi vé chỉ được sử dụng một lần",
    "Vé sau khi mua sẽ không được hoàn trả, trừ khi nhà tổ chức hủy sự kiện",
    "Nhà tổ chức có quyền từ chối vào cổng đối với các khách không tuân thủ quy định và an ninh",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            to="/admin"
            className="text-gray-400 hover:text-red-700 transition-colors"
          >
            Quản trị viên
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            to="/admin/event"
            className="text-gray-400 hover:text-red-700 transition-colors"
          >
            Duyệt sự kiện
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-red-700 font-medium truncate max-w-[200px]">
            {event.eventName}
          </span>
        </nav>

        {/* ── Hero banner ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-md">
          <div className="absolute top-4 right-4 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                             bg-amber-100/90 backdrop-blur-sm text-amber-700 border border-amber-300 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
              Chờ duyệt
            </span>
          </div>

          {event.eventImgUrl ? (
            <img
              src={event.eventImgUrl}
              alt={event.eventName}
              className="w-full h-60 object-cover"
            />
          ) : (
            <div className="w-full h-60 bg-gradient-to-br from-red-700 via-red-600 to-red-900 flex items-center justify-center">
              <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
                Ảnh sự kiện
              </p>
            </div>
          )}
        </div>

        {/* Event title row */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {event.eventName}
          </h1>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {fmt(event.dateToStart)}
            <svg
              className="w-4 h-4 text-red-500 ml-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {event.venue
              ? `${event.venue.venueName} - ${event.venue.address}`
              : "Chưa cập nhật địa điểm"}
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column (main) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin chung */}
            <Section title="Thông tin chung của sự kiện">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Tên sự kiện", value: event.eventName },
                  { label: "Thể loại", value: event.genre ?? "—" },
                  {
                    label: "Ngày diễn ra",
                    value: fmt(event.timeToStart || event.dateToStart),
                  },
                  {
                    label: "Thời lượng",
                    value: event.duration ? `${event.duration} phút` : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="col-span-2 sm:col-span-1">
                    <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                      {label}
                    </dt>
                    <dd className="text-sm text-gray-800 font-semibold leading-snug">
                      {value}
                    </dd>
                  </div>
                ))}
                <div className="col-span-2 sm:col-span-4 mt-2 border-t pt-3">
                  <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Địa điểm tổ chức
                  </dt>
                  <dd className="text-sm text-gray-800 font-semibold leading-snug">
                    {event.venue
                      ? `${event.venue.venueName} (${event.venue.address}) - Sức chứa: ${event.venue.capacity} người`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </Section>

            {/* Thông tin nhà tổ chức */}
            <Section title="Thông tin nhà tổ chức">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-700 font-black text-lg">
                    {event.organizerName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 mb-4">
                    <div>
                      <dt className="text-xs text-gray-400">Họ và tên</dt>
                      <dd className="text-sm font-semibold text-gray-800 mt-0.5">
                        {event.organizerName ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Email</dt>
                      <dd className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                        {event.organizerEmail ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Số điện thoại</dt>
                      <dd className="text-sm font-semibold text-gray-800 mt-0.5">
                        {event.organizerNumber ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Section>

            {/* Chi tiết sự kiện */}
            <Section title="Chi tiết sự kiện">
              <div className="relative">
                <p
                  className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap transition-all ${
                    expanded ? "" : "line-clamp-4"
                  }`}
                >
                  {event.description ?? "Không có mô tả."}
                </p>
                {!expanded && (event.description?.length ?? 0) > 200 && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              {(event.description?.length ?? 0) > 200 && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="mt-3 text-xs font-semibold text-red-700 hover:underline flex items-center gap-1"
                >
                  {expanded ? "Thu gọn ▲" : "Xem chi tiết ▼"}
                </button>
              )}
            </Section>

            {/* Điều khoản */}
            <Section title="Điều khoản tham gia sự kiện">
              <ul className="space-y-2">
                {terms.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-600"
                  >
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* ── Right column: Ticket classes ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 tracking-wide">
                  Hạng vé sự kiện
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Chưa có hạng vé.
                  </p>
                ) : (
                  tickets.map((tc, i) => (
                    <TicketCard key={tc.ticketClassId ?? i} ticket={tc} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
          <button
            onClick={() => setShowReject(true)}
            className="px-8 py-3 text-sm font-bold text-red-700 border-2 border-red-600
                       rounded-xl hover:bg-red-50 active:bg-red-100
                       transition-all active:scale-95 shadow-sm"
          >
            Từ chối sự kiện
          </button>

          <button
            onClick={handleApproveClick}
            disabled={approving}
            className="px-8 py-3 text-sm font-bold text-white bg-red-700
                       hover:bg-red-800 active:bg-red-900
                       rounded-xl transition-all active:scale-95
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center gap-2 shadow-md shadow-red-200"
          >
            {approving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Duyệt sự kiện
              </>
            )}
          </button>
        </div>
      </main>

      {/* ── Reject Modal ── */}
      <AdminRejectModal
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        onSuccess={() => navigate("/admin/event")}
        eventId={eventId}
        eventName={event.eventName}
        organizerName={event.organizerName}
      />

      {showApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xác nhận duyệt
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn phê duyệt sự kiện{" "}
              <strong>{event.eventName}</strong> này không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprove(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Xác nhận Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

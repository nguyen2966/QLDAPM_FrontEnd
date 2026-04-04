import { useEffect, useState } from "react";
import "./MyEventPage.css";
import { API } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { EventCard } from "./components/EventCard";

const MOCK_RESPONSE = {
  status: "success",
  data: {
    stats: {
      totalRevenue: 12502400,
      revenueGrowth: 0,
      totalSold: 8,
      totalQuota: 449,
      activeCount: 1,
      fillRate: 2,
    },
    alerts: [],
    events: [
      {
        eventId: 13,
        eventCode: "#EVN013-26",
        eventName: "Neon Lights Night: Electric Summer 2026",
        eventImgUrl:
          "https://res.cloudinary.com/dphfbhmyo/image/upload/v1774366292/events/d31fsiayajdnymnsjf33.jpg",
        dateToStart: "2026-07-15T00:00:00.000Z",
        timeToStart: "2026-07-15T12:00:00.000Z",
        venue: {
          venueName: "Sân vận động quốc gia Mỹ Đình",
          address: "1 Lê Đức Thọ, Mỹ Đình, Nam Từ Liêm, Hà Nội",
        },
        status: "APPROVED",
        ticketsSold: 8,
        totalQuota: 449,
        fillRate: 2,
        revenue: 12502400,
      },
    ],
  },
};

function formatCurrency(num) {
  return num.toLocaleString("vi-VN") + "đ";
}

function formatDateTime(dateStr, timeStr) {
  const time = new Date(timeStr);
  const date = new Date(dateStr);
  const h = time.getUTCHours().toString().padStart(2, "0");
  const m = time.getUTCMinutes().toString().padStart(2, "0");
  const d = date.getUTCDate();
  const mo = date.getUTCMonth() + 1;
  const y = date.getUTCFullYear();
  return `${h}:${m}, ${d} tháng ${mo}, ${y}`;
}

function getStatusLabel(status) {
  const map = {
    APPROVED: "Đã được duyệt",
    PENDING: "Chờ duyệt",
    CANCLED: "Đã hủy",
    ENDED: "Đã kết thúc",
    REJECTED: "Bị từ chối",
    "IN_PROGRESS" : "Đang diễn ra",

  };
  return map[status] || status;
}

function getStatusClass(status) {
  const map = {
    APPROVED: "status-active",
    PENDING: "status-pending",
    CANCLED: "status-cancelled",
    ENDED: "status-completed",
    REJECTED: "status-rejected",
    "IN_PROGRESS" : "status-inprogress",
  };
  return map[status] || "";
}

const STAT_ICONS = {
  revenue: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  tickets: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  ),
  active: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  fillRate: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export function MyEventPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchMyEventData = async () => {
      setLoading(true);

      try {
        const res = await API.event.getMyEvents();
        const data = res.data?.data;
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
    fetchMyEventData();
    // setTimeout(() => {
    //   setData(MOCK_RESPONSE.data);
    //   setLoading(false);
    // }, 400);
  }, []);

  if (loading) {
    return (
      <div className="me-page">
        <div className="me-loading">
          <div className="me-spinner" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  const { stats, alerts, events } = data;

  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      ev.eventName.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.venueName.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || ev.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCards = [
    {
      icon: STAT_ICONS.revenue,
      label: "Tổng doanh thu",
      value: formatCurrency(stats.totalRevenue),
      sub: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}% so với tháng trước` : stats.revenueGrowth < 0 ? `${stats.revenueGrowth}% so với tháng trước` : "Chưa có dữ liệu cho tháng trước",
    },
    {
      icon: STAT_ICONS.tickets,
      label: "Vé đã bán / Tổng vé",
      value: `${stats.totalSold.toLocaleString("vi-VN")} / ${stats.totalQuota.toLocaleString("vi-VN")}`,
      sub: stats.totalSold > 3/4*stats.totalQuota ? "Vé đang có hiệu suất tốt" : stats.totalSold > 1/4*stats.totalQuota ? "Vé đang bán ổn định" : "Vé chưa được bán chạy",
    },
    {
      icon: STAT_ICONS.active,
      label: "Sự kiện đang Active",
      value: stats.activeCount,
      sub: null,
    },
    {
      icon: STAT_ICONS.fillRate,
      label: "Tỷ lệ lấp đầy",
      value: `${stats.fillRate}%`,
      sub: "Trung bình trên tất cả sự kiện",
    },
  ];

  const STATUS_OPTIONS = [
    { key: "all", label: "Tất cả" },
    { key: "APPROVED", label: "Đã được duyệt" },
    { key: "IN_PROGRESS", label: "Đang diễn ra"},
    { key: "PENDING", label: "Chờ duyệt" },
    { key: "COMPLETED", label: "Đã kết thúc" },
    { key: "CANCLED", label: "Đã hủy" },
  ];

  return (
    <div className="me-page">
      {/* Breadcrumb */}
      {/* <div className="me-breadcrumb">
        <a href="/">Home</a>
      </div> */}

      {/* Top section: Stats + Alerts */}
      <div className="me-top">
        <div className="me-stats-section">
          <h2 className="me-section-title">Tổng quan chỉ số</h2>
          <div className="me-stats-grid">
            {statCards.map((card, i) => (
              <div className="me-stat-card" key={i}>
                <div className="me-stat-icon">{card.icon}</div>
                <span className="me-stat-label">{card.label}</span>
                <span className="me-stat-value">{card.value}</span>
                {card.sub && <span className="me-stat-sub">{card.sub}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="me-alerts-section">
          <h2 className="me-section-title">Cảnh báo gần đây</h2>
          {alerts.length === 0 ? (
            <div className="me-alerts-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Không có cảnh báo nào</span>
            </div>
          ) : (
            <div className="me-alerts-list">
              {alerts.map((alert, i) => (
                <div className="me-alert-item" key={i}>
                  <div className="me-alert-icon">⚠️</div>
                  <div>
                    <strong>{alert.title}</strong>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event list section */}
      <div className="me-events-section">
        <div className="me-events-header">
          <div>
            <h2 className="me-section-title">Danh sách Sự kiện</h2>
            <p className="me-section-desc">Quản lý và theo dõi tình trạng các sự kiện</p>
          </div>
          <button className="me-create-btn" onClick={() => navigate("/my-event/create")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tạo sự kiện mới
          </button>
        </div>

        {/* Toolbar */}
        <div className="me-toolbar">
          <div className="me-search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="me-filter-group">
            <div className="me-filter-btn-wrapper">
              <button
                className="me-filter-btn"
                onClick={() => setShowStatusDropdown((v) => !v)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Trạng thái
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {showStatusDropdown && (
                <div className="me-dropdown">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className={`me-dropdown-item ${statusFilter === opt.key ? "active" : ""}`}
                      onClick={() => {
                        setStatusFilter(opt.key);
                        setShowStatusDropdown(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="me-table-wrapper">
          <table className="me-table">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Thời gian &amp; Địa điểm</th>
                <th>Trạng thái</th>
                <th>Vé đã bán</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="me-table-empty">
                    Không tìm thấy sự kiện nào
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <EventCard
                    key={ev.eventId}
                    ev={ev}
                    formatDateTime={formatDateTime}
                    getStatusClass={getStatusClass}
                    getStatusLabel={getStatusLabel}
                    />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

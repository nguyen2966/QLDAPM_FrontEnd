import { useEffect, useState } from "react";
import { API } from "../../api/api.js";
import "./MyOrderPage.css";
import {useNavigate} from "react-router-dom";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "upcoming", label: "Sắp diễn ra" },
  { key: "past", label: "Đã qua" },
  { key: "cancelled", label: "Đã hủy" },
];

const MOCK_DATA = [
  {
    orderId: 12,
    totalAmount: "800000",
    numTicket: 2,
    status: "PAID",
    events: [
      {
        eventId: 3,
        eventName: "Summer Music Festival 2026",
        eventImgUrl: "",
        dateToStart: "2026-03-21T00:00:00.000Z",
        timeToStart: "2026-03-21T20:00:00.000Z",
        venue: { venueName: "SVĐ Thống Nhất", address: "TP.HCM" },
        tickets: [
          { ticketCode: "TK-ABC123", ticketStatus: "ACTIVE", seatName: "A1", ticketClass: { ticketClassId: 1, className: "Vé tiêu chuẩn", price: "200000" } },
          { ticketCode: "TK-ABC124", ticketStatus: "ACTIVE", seatName: "A2", ticketClass: { ticketClassId: 1, className: "Vé tiêu chuẩn", price: "200000" } },
          { ticketCode: "TK-ABC125", ticketStatus: "ACTIVE", seatName: "A2", ticketClass: { ticketClassId: 1, className: "Vé tiêu chuẩn", price: "200000" } },
          { ticketCode: "TK-VIP01", ticketStatus: "ACTIVE", seatName: "VIP-R1C1", ticketClass: { ticketClassId: 2, className: "Vé VIP", price: "400000" } },
          { ticketCode: "TK-VIP02", ticketStatus: "ACTIVE", seatName: "VIP-R1C2", ticketClass: { ticketClassId: 2, className: "Vé VIP", price: "400000" } },
        ],
      },
    ],
  },
  {
    orderId: 13,
    totalAmount: "800000",
    numTicket: 3,
    status: "PAID",
    events: [
      {
        eventId: 4,
        eventName: "Rock in Saigon 2026",
        eventImgUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
        dateToStart: "2026-03-21T00:00:00.000Z",
        timeToStart: "2026-03-21T20:00:00.000Z",
        venue: { venueName: "SVĐ Thống Nhất", address: "TP.HCM" },
        tickets: [
          { ticketCode: "TK-STD01", ticketStatus: "ACTIVE", seatName: "B1", ticketClass: { ticketClassId: 1, className: "Vé tiêu chuẩn", price: "200000" } },
          // { ticketCode: "TK-VIP03", ticketStatus: "ACTIVE", seatName: "VIP-R2C1", ticketClass: { ticketClassId: 2, className: "Vé VIP", price: "400000" } },
          // { ticketCode: "TK-VIP04", ticketStatus: "ACTIVE", seatName: "VIP-R2C2", ticketClass: { ticketClassId: 2, className: "Vé VIP", price: "400000" } },
        ],
      },
    ],
  },
];

function formatDateTime(dateStr, timeStr) {
  const date = new Date(dateStr);
  const time = new Date(timeStr);
  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const d = date.getDate();
  const mo = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${h}:${m}, ${d} tháng ${mo}, ${y}`;
}

function groupTicketsByClass(tickets) {
  const map = {};
  tickets.forEach((t) => {
    map[t.ticketClass.className] = (map[t.ticketClass.className] || 0) + 1;
  });
  return map;
}

function getUniqueTicketTags(tickets) {
  const seen = new Set();
  return tickets.filter((t) => {
    const key = `${t.ticketClass.className}-${t.ticketCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function MyOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [selectedTickets, setSelectedTickets] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      try {
        const res = await API.event.getMyOrderCustomer();
        const data = res.data?.data;
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
    fetchOrderDetails();
    // setTimeout(() => {
    //   setOrders(MOCK_DATA);
    //   setLoading(false);
    // }, 500);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.events.some((e) =>
      e.eventName.toLowerCase().includes(search.toLowerCase())
    );
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return order.events.some((e) => new Date(e.dateToStart) >= new Date());
    if (activeTab === "past") return order.events.every((e) => new Date(e.dateToStart) < new Date());
    if (activeTab === "cancelled") return order.status === "CANCELLED";
    return true;
  });

  const toggleTicket = (cardKey, ticketCode) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [cardKey]: prev[cardKey] === ticketCode ? null : ticketCode,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Gọi hàm thực hiện search tại đây
      setSearch(tempSearch);
    }
  };

  return (
    <div className="my-order-page">
      <div className="breadcrumb">
        <a href="/">Trang chủ</a>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Vé của tôi</span>
      </div>

      <h1 className="page-title">Vé của tôi</h1>

      <div className="page-header">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sự kiện"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onKeyDown = {handleKeyDown}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Đang tải đơn hàng...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 5v2m0 4v.01M12 19l-7-4V7l7-4 7 4v8z" />
            <path d="M20.5 16.5L22 22l-5.5-1.5L11 22l1.5-5.5L11 11l5.5 1.5L22 11l-1.5 5.5z" />
          </svg>
          <span>Không tìm thấy đơn hàng nào</span>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) =>
            order.events.map((event) => {
              const cardKey = `${order.orderId}-${event.eventId}`;
              const grouped = groupTicketsByClass(event.tickets);
              const tags = getUniqueTicketTags(event.tickets);

              return (
                <div className="order-card" key={cardKey}>
                  <div className="order-img">
                    {event.eventImgUrl ? (
                      <img src={event.eventImgUrl} alt={event.eventName} />
                    ) : (
                      <div className="img-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                    <div className="order-status-badge">
                      {order.status === "PAID" ? "Đã thanh toán" : order.status}
                    </div>
                  </div>

                  <div className="order-info">
                    <h3>{event.eventName}</h3>
                    <div className="order-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                      <span>{formatDateTime(event.dateToStart, event.timeToStart)}</span>
                    </div>
                    <div className="order-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>{event.venue.venueName}, {event.venue.address}</span>
                    </div>
                    <div className="ticket-summary">
                      <span className="ticket-type-label">Loại vé</span>
                      <div className="ticket-type-list">
                        {Object.entries(grouped).map(([name, count]) => (
                          <span className="ticket-type-chip" key={name}>{name} x{count}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ticket-tags">
                    <span className="ticket-tags-title">Chọn vé</span>
                    {tags.map((t) => (
                      <div
                        key={t.ticketCode}
                        className={`ticket-tag ${selectedTickets[cardKey] === t.ticketCode ? "selected" : ""}`}
                        onClick={() => toggleTicket(cardKey, t.ticketCode)}
                      >
                        <span className="tag-class">{t.ticketClass.className}</span>
                        <span className="tag-seat">#{t.seatName}</span>
                      </div>
                    ))}
                    <div className="ticket-hint">Chọn 1 vé để xem mã QR</div>
                  </div>

                  <div className="order-action">
                    <button
                        className={`detail-btn ${!selectedTickets[cardKey] ? 'disabled' : ''}`}
                        disabled={!selectedTickets[cardKey]}
                        onClick={() => navigate(`/user/my-tickets?ticketCode=${selectedTickets[cardKey]}`)}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// mockApi.js
// Bật mock: import "./mockApi.js" ở main.jsx / App.jsx
// Tắt mock: comment dòng trên lại khi dùng API thật
//
// npm install axios-mock-adapter

import MockAdapter from "axios-mock-adapter";
import axiosInstance from "./axiosInstance.js";

const mock = new MockAdapter(axiosInstance, { delayResponse: 400 });

// ════════════════════════════════════════════════════════════════
// HELPERS — khớp chính xác với sendSuccessRes của backend
//
// Backend trả về:
//   { status: "success", message, statusCode, data, timeStamp }
//
// Frontend truy cập: response.data.data
// ════════════════════════════════════════════════════════════════

const ok = (data, message = "Thành công", statusCode = 200) => [
  statusCode,
  {
    status: "success",
    message,
    statusCode,
    data,
    timeStamp: new Date().toISOString(),
  },
];

const created = (data, message = "Tạo thành công") => ok(data, message, 201);

const notFound = (message = "Không tìm thấy") => [
  404,
  { status: "error", message, statusCode: 404, data: null, timeStamp: new Date().toISOString() },
];

// ════════════════════════════════════════════════════════════════
// MOCK DATA — VENUES (15 địa điểm cho Dropdown Bước 1)
// ════════════════════════════════════════════════════════════════

const MOCK_VENUES = [
  { venueId: 1,  venueName: "Sân vận động Mỹ Đình",          address: "Mỹ Đình, Nam Từ Liêm, Hà Nội",                    capacity: 40000 },
  { venueId: 2,  venueName: "Nhà hát Lớn Hà Nội",            address: "1 Tràng Tiền, Hoàn Kiếm, Hà Nội",                capacity: 598   },
  { venueId: 3,  venueName: "Cung Văn hoá Hữu Nghị",         address: "91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",            capacity: 2500  },
  { venueId: 4,  venueName: "GEM Center",                     address: "8 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM",            capacity: 2000  },
  { venueId: 5,  venueName: "Nhà hát Hòa Bình",              address: "240 3 Tháng 2, Quận 10, TP.HCM",                  capacity: 2700  },
  { venueId: 6,  venueName: "Nhà thi đấu Phú Thọ",           address: "1 Lữ Gia, Quận 11, TP.HCM",                      capacity: 4000  },
  { venueId: 7,  venueName: "Sân khấu Trống Đồng",           address: "1 Công trường Lam Sơn, Quận 1, TP.HCM",           capacity: 800   },
  { venueId: 8,  venueName: "Sân vận động Thống Nhất",        address: "138 Đào Duy Từ, Quận 10, TP.HCM",                capacity: 15000 },
  { venueId: 9,  venueName: "Toà nhà Bitexco — The Summit",  address: "2 Hải Triều, Quận 1, TP.HCM",                    capacity: 500   },
  { venueId: 10, venueName: "Bãi biển Mỹ Khê",               address: "Mỹ Khê, Sơn Trà, Đà Nẵng",                       capacity: 20000 },
  { venueId: 11, venueName: "Trung tâm Hội nghị Đà Nẵng",    address: "271 Trần Phú, Hải Châu, Đà Nẵng",                capacity: 1500  },
  { venueId: 12, venueName: "Nhà hát Trưng Vương",           address: "3 Lê Duẩn, Hải Châu, Đà Nẵng",                   capacity: 1200  },
  { venueId: 13, venueName: "Vincom Arena Landmark 81",       address: "772 Điện Biên Phủ, Bình Thạnh, TP.HCM",          capacity: 3500  },
  { venueId: 14, venueName: "SECC — Trung tâm Hội chợ",      address: "799 Nguyễn Văn Linh, Quận 7, TP.HCM",            capacity: 10000 },
  { venueId: 15, venueName: "Cung thể thao Quần Ngựa",        address: "36 Kim Mã, Ba Đình, Hà Nội",                     capacity: 5000  },
];

// ════════════════════════════════════════════════════════════════
// MOCK DATA — EVENTS
// ════════════════════════════════════════════════════════════════

const MOCK_TICKET_CLASSES = [
  { ticketClassId: 1, eventId: 1, className: "VIP",           price: "2500000", quota: 50,  color: "#FFD700", type: "SEATED"   },
  { ticketClassId: 2, eventId: 1, className: "Premium",       price: "1500000", quota: 100, color: "#C0C0C0", type: "SEATED"   },
  { ticketClassId: 3, eventId: 1, className: "General",       price: "800000",  quota: 500, color: "#CD7F32", type: "SEATED"   },
  { ticketClassId: 4, eventId: 1, className: "Standing Zone", price: "400000",  quota: 300, color: "#4CAF50", type: "STANDING" },
];

const MOCK_EVENTS = [
  {
    eventId: 1,
    eventName: "Đêm Nhạc Trịnh — Cát Bụi Cuộc Đời",
    genre: "Âm nhạc",
    description: "Đêm nhạc tưởng nhớ nhạc sĩ Trịnh Công Sơn với sự tham gia của các ca sĩ hàng đầu Việt Nam.",
    eventImgUrl: "https://placehold.co/1200x630/1a1a2e/ffffff?text=Trinh+Cong+Son+Night",
    status: "APPROVED",
    dateToStart: "2025-08-15T00:00:00.000Z",
    timeToStart: "2025-08-15T19:30:00.000Z",
    timeToRelease: "2025-07-01T10:00:00.000Z",
    duration: "150",
    venueId: 2,
    venue: { venueId: 2, venueName: "Nhà hát Lớn Hà Nội", address: "1 Tràng Tiền, Hoàn Kiếm, Hà Nội" },
    organizer: { user: { name: "Công ty Giải trí Thanh Âm" } },
    ticketClasses: MOCK_TICKET_CLASSES,
  },
  {
    eventId: 2,
    eventName: "Ultra Beach Festival 2025",
    genre: "EDM",
    description: "Lễ hội âm nhạc điện tử ngoài trời quy mô lớn nhất miền Nam.",
    eventImgUrl: "https://placehold.co/1200x630/0f3460/e94560?text=Ultra+Beach+Festival",
    status: "APPROVED",
    dateToStart: "2025-09-20T00:00:00.000Z",
    timeToStart: "2025-09-20T15:00:00.000Z",
    timeToRelease: "2025-08-01T09:00:00.000Z",
    duration: "480",
    venueId: 10,
    venue: { venueId: 10, venueName: "Bãi biển Mỹ Khê", address: "Mỹ Khê, Sơn Trà, Đà Nẵng" },
    organizer: { user: { name: "LiveNation Vietnam" } },
    ticketClasses: [
      { ticketClassId: 5, eventId: 2, className: "Early Bird", price: "1200000", quota: 200, color: "#FF6B6B", type: "STANDING" },
      { ticketClassId: 6, eventId: 2, className: "General",    price: "1800000", quota: 800, color: "#4ECDC4", type: "STANDING" },
      { ticketClassId: 7, eventId: 2, className: "VIP Lounge", price: "4500000", quota: 80,  color: "#FFD700", type: "SEATED"   },
    ],
  },
  {
    eventId: 3,
    eventName: "Vietnam Startup Summit 2025",
    genre: "Hội thảo",
    description: "Hội nghị khởi nghiệp thường niên quy tụ hơn 200 startup và 50 quỹ đầu tư.",
    eventImgUrl: "https://placehold.co/1200x630/2d6a4f/ffffff?text=Vietnam+Startup+Summit",
    status: "IN_PROGRESS",
    dateToStart: "2025-07-10T00:00:00.000Z",
    timeToStart: "2025-07-10T08:00:00.000Z",
    timeToRelease: "2025-06-01T08:00:00.000Z",
    duration: "480",
    venueId: 4,
    venue: { venueId: 4, venueName: "GEM Center", address: "8 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM" },
    organizer: { user: { name: "Startup Vietnam Foundation" } },
    ticketClasses: [
      { ticketClassId: 8, eventId: 3, className: "Startup Pass",  price: "500000",  quota: 300, color: "#52B788", type: "SEATED" },
      { ticketClassId: 9, eventId: 3, className: "Investor Pass", price: "2000000", quota: 50,  color: "#1B4332", type: "SEATED" },
    ],
  },
  {
    eventId: 4,
    eventName: "Cirque Étoile — Gánh Xiếc Ngôi Sao",
    genre: "Nghệ thuật",
    description: "Đoàn xiếc nghệ thuật đến từ Pháp với màn trình diễn kết hợp xiếc, múa và âm nhạc cổ điển.",
    eventImgUrl: "https://placehold.co/1200x630/6a0572/ffd700?text=Cirque+Etoile",
    status: "APPROVED",
    dateToStart: "2025-10-05T00:00:00.000Z",
    timeToStart: "2025-10-05T20:00:00.000Z",
    timeToRelease: "2025-09-01T10:00:00.000Z",
    duration: "120",
    venueId: 5,
    venue: { venueId: 5, venueName: "Nhà hát Hòa Bình", address: "240 3 Tháng 2, Quận 10, TP.HCM" },
    organizer: { user: { name: "Artful Events Vietnam" } },
    ticketClasses: [
      { ticketClassId: 10, eventId: 4, className: "Hạng C", price: "600000",  quota: 400, color: "#C77DFF", type: "SEATED" },
      { ticketClassId: 11, eventId: 4, className: "Hạng B", price: "900000",  quota: 200, color: "#9D4EDD", type: "SEATED" },
      { ticketClassId: 12, eventId: 4, className: "Hạng A", price: "1400000", quota: 100, color: "#7B2FBE", type: "SEATED" },
    ],
  },
  {
    eventId: 5,
    eventName: "Hanoi Marathon 2025",
    genre: "Thể thao",
    description: "Giải marathon quốc tế thường niên của Thủ đô với cự ly 5km, 10km, 21km và 42km.",
    eventImgUrl: "https://placehold.co/1200x630/e63946/f1faee?text=Hanoi+Marathon+2025",
    status: "APPROVED",
    dateToStart: "2025-11-23T00:00:00.000Z",
    timeToStart: "2025-11-23T05:00:00.000Z",
    timeToRelease: "2025-10-01T08:00:00.000Z",
    duration: "360",
    venueId: 15,
    venue: { venueId: 15, venueName: "Cung thể thao Quần Ngựa", address: "36 Kim Mã, Ba Đình, Hà Nội" },
    organizer: { user: { name: "Vietnam Athletics Federation" } },
    ticketClasses: [
      { ticketClassId: 13, eventId: 5, className: "5km",  price: "300000", quota: 1000, color: "#06D6A0", type: "STANDING" },
      { ticketClassId: 14, eventId: 5, className: "10km", price: "450000", quota: 800,  color: "#118AB2", type: "STANDING" },
      { ticketClassId: 15, eventId: 5, className: "21km", price: "600000", quota: 500,  color: "#073B4C", type: "STANDING" },
      { ticketClassId: 16, eventId: 5, className: "42km", price: "800000", quota: 200,  color: "#EF476F", type: "STANDING" },
    ],
  },
];

const MOCK_MY_EVENTS = [
  { ...MOCK_EVENTS[0], status: "PENDING"  },
  { ...MOCK_EVENTS[1], status: "APPROVED" },
  {
    eventId: 6,
    eventName: "Workshop UI/UX Design Thinking",
    genre: "Giáo dục",
    eventImgUrl: "https://placehold.co/1200x630/264653/e9c46a?text=UX+Design+Workshop",
    status: "REJECTED",
    dateToStart: "2025-12-10T00:00:00.000Z",
    venue: { venueId: 9, venueName: "Toà nhà Bitexco — The Summit", address: "2 Hải Triều, Quận 1, TP.HCM" },
    organizer: { user: { name: "Công ty Giải trí Thanh Âm" } },
  },
];

// ════════════════════════════════════════════════════════════════
// MOCK HANDLERS
// ════════════════════════════════════════════════════════════════

// ── Venue ───────────────────────────────────────────────────────
mock.onGet("/venues").reply(() =>
  ok(MOCK_VENUES, "Lấy danh sách địa điểm thành công")
);

// ── Public events ───────────────────────────────────────────────
mock.onGet("/event").reply(() =>
  ok(MOCK_EVENTS, "Lấy danh sách event thành công")
);

// ── Organizer routes — cố định trước dynamic (:id) ─────────────
mock.onGet("/event/my-event").reply(() =>
  ok(MOCK_MY_EVENTS, "Lấy danh sách sự kiện của bạn thành công")
);

mock.onPost("/event/my-event").reply(() =>
  created(
    {
      eventId: 99,
      eventName: "Event mới (Mock)",
      genre: "Âm nhạc",
      status: "PENDING",
      organizerId: 1,
      venueId: 4,
      eventImgUrl: "https://placehold.co/1200x630/457b9d/ffffff?text=New+Event",
      dateToStart: "2025-12-01T00:00:00.000Z",
      timeToStart: "2025-12-01T19:00:00.000Z",
      timeToRelease: "2025-11-01T09:00:00.000Z",
      duration: "180",
      seatLayoutMap: null,
    },
    "Tạo thông tin cơ bản sự kiện thành công"
  )
);

// GET /event/my-event/:id
mock.onGet(/\/event\/my-event\/(\d+)$/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const event =
    MOCK_MY_EVENTS.find((e) => e.eventId === id) ||
    MOCK_EVENTS.find((e) => e.eventId === id);
  if (!event) return notFound("Không tìm thấy sự kiện");
  return ok({ ...event, seatLayoutMap: null }, "Lấy chi tiết sự kiện thành công");
});

// PUT /event/my-event/:id
mock.onPut(/\/event\/my-event\/(\d+)$/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const body = JSON.parse(config.data || "{}");
  const base = MOCK_MY_EVENTS.find((e) => e.eventId === id) || {};
  return ok({ ...base, ...body, eventId: id }, "Cập nhật sự kiện thành công");
});

// POST /event/my-event/:id/ticket-classes — Bước 2
mock.onPost(/\/event\/my-event\/(\d+)\/ticket-classes$/).reply(() =>
  created({ count: 4 }, "Tạo hạng vé thành công")
);

// GET /event/my-event/:id/ticket-classes
mock.onGet(/\/event\/my-event\/(\d+)\/ticket-classes$/).reply(() =>
  ok(MOCK_TICKET_CLASSES, "Lấy danh sách hạng vé thành công")
);

// POST /event/my-event/:id/layout — Bước 3
mock.onPost(/\/event\/my-event\/(\d+)\/layout$/).reply(() =>
  created({ seatsCreated: 150 }, "Lưu layout và tạo ghế thành công")
);

// GET /event/:id — public detail (đứng SAU tất cả /my-event routes)
mock.onGet(/\/event\/(\d+)$/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const event = MOCK_EVENTS.find((e) => e.eventId === id);
  if (!event) return notFound("Không tìm thấy sự kiện");
  return ok(event, "Lấy chi tiết sự kiện thành công");
});

// ── Passthrough — các API khác vẫn gọi thật ────────────────────
mock.onAny().passThrough();

export default mock;
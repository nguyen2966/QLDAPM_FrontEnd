const TICKET_TYPE_LABELS = {
  SEATED: "Ghế ngồi",
  STANDING: "Ghế đứng",
};

function dinhDangVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VNĐ`;
}

function dinhDangNgay(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function layDanhSachVeTheoLoai(ticketClasses = [], ticketType = "all") {
  if (!Array.isArray(ticketClasses)) return [];
  if (ticketType === "all") return ticketClasses;

  return ticketClasses.filter(
    (ticket) => String(ticket?.type || "").toUpperCase() === ticketType
  );
}

function layGiaThapNhatTheoLoai(ticketClasses = [], ticketType = "all") {
  const danhSachVe = layDanhSachVeTheoLoai(ticketClasses, ticketType);
  if (!danhSachVe.length) return 0;

  return Math.min(...danhSachVe.map((ticket) => Number(ticket?.price || 0)));
}

function layLoaiVeHienThi(ticketClasses = []) {
  if (!Array.isArray(ticketClasses) || ticketClasses.length === 0) {
    return "Chưa cập nhật";
  }

  const danhSachLoaiVe = [
    ...new Set(
      ticketClasses
        .map((ticket) => String(ticket?.type || "").toUpperCase())
        .filter(Boolean)
    ),
  ];

  return danhSachLoaiVe
    .map((type) => TICKET_TYPE_LABELS[type] || type)
    .join(" • ");
}

function AnhCard({ src, alt }) {
  if (!src) return null;
  return <img className="home-event-img__photo" src={src} alt={alt} />;
}

export function EventGrid({
  events,
  totalResults,
  currentPage,
  totalPages,
  onDatVe,
  selectedTicketType = "all",
}) {
  return (
    <section className="home-section">
      <div className="home-section__head">
        <h2 className="home-section__title">Khám phá sự kiện</h2>
        <div className="home-section__hint">
          Có {totalResults} kết quả • Trang {currentPage}/{totalPages}
        </div>
      </div>

      {!events.length ? (
        <div className="home-empty-state">Không tìm thấy sự kiện phù hợp.</div>
      ) : (
        <div className="home-grid">
          {events.map((event) => (
            <article key={event.eventId} className="home-card">
              <div className="home-event-img" aria-label={event.eventName} role="img">
                <AnhCard src={event.eventImgUrl} alt={`Ảnh sự kiện: ${event.eventName}`} />
              </div>

              <div className="home-card__body">
                <div className="home-card__top">
                  <h3 className="home-card__title">{event.eventName}</h3>
                  <div className="home-card__tag">{event.genre || "Sự kiện"}</div>
                </div>

                <div className="home-card__meta">

                  <div className="home-card__metaRow home-card__metaRow--ticket">
                    <span className="home-card__metaIcon" aria-hidden="true">
                      🎫
                    </span>
                    <span className="home-card__metaText">
                      {layLoaiVeHienThi(event.ticketClasses)}
                    </span>
                  </div>
                  
                  <div className="home-card__metaRow home-card__metaRow--date">
                    <span className="home-card__metaIcon" aria-hidden="true">
                      📅
                    </span>
                    <span className="home-card__metaText">
                      {dinhDangNgay(event.dateToStart)}
                    </span>
                  </div>

                  <div className="home-card__metaRow home-card__metaRow--venue">
                    <span className="home-card__metaIcon" aria-hidden="true">
                      📍
                    </span>
                    <span className="home-card__metaText">
                      {event.venue?.venueName || ""}
                    </span>
                  </div>


                </div>

                <div className="home-card__bottom">
                  <div className="home-card__price">
                    Từ{" "}
                    {dinhDangVND(
                      layGiaThapNhatTheoLoai(event.ticketClasses, selectedTicketType)
                    )}
                  </div>

                  <button
                    className="home-btn home-btn--primary home-card__cta"
                    type="button"
                    onClick={() => onDatVe(event)}
                  >
                    Đặt vé
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
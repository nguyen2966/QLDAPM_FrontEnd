import { useState } from "react";

function dinhDangVND(amount) {
  return `${Number(amount).toLocaleString("vi-VN")} VNĐ`;
}

function layGiaThapNhat(ticketClasses = []) {
  if (!ticketClasses.length) return 0;
  return Math.min(...ticketClasses.map((t) => Number(t.price)));
}

function dinhDangNgay(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function AnhCard({ src, alt, title }) {
  const [coLoiAnh, setCoLoiAnh] = useState(false);

  if (!src || coLoiAnh) {
    return <div className="home-event-img__fallback">{title || "Sự kiện"}</div>;
  }

  return (
    <img
      className="home-event-img__photo"
      src={src}
      alt={alt}
      onError={() => setCoLoiAnh(true)}
    />
  );
}

export function UpcomingEvents({ events }) {
  return (
    <section className="home-section" id="sap-dien-ra">
      <div className="home-section__head">
        <h2 className="home-section__title">Sự kiện sắp diễn ra</h2>
        <div className="home-section__hint">Lên kế hoạch sớm và săn vé ưu đãi</div>
      </div>

      <div className="home-upcoming">
        {events.map((ev) => (
          <div key={ev.eventId} className="home-upcoming__item">
            <div className="home-upcoming__left">
              <div className="home-upcoming__imgWrap">
                <div className="home-event-img" aria-label={ev.eventName} role="img">
                  <AnhCard src={ev.eventImgUrl} alt={`Ảnh sự kiện: ${ev.eventName}`} title={ev.eventName} />
                </div>
              </div>
            </div>
            <div className="home-upcoming__right">
              <div className="home-upcoming__name">{ev.eventName}</div>
              <div className="home-upcoming__meta">{dinhDangNgay(ev.dateToStart)}</div>
              <div className="home-upcoming__price">
                Từ {dinhDangVND(layGiaThapNhat(ev.ticketClasses))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
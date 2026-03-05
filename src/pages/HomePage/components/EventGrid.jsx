function dinhDangVND(amount) {
  return `${Number(amount).toLocaleString("vi-VN")} VNĐ`;
}

// Lấy giá thấp nhất trong ticketClasses, fallback về 0
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

function AnhCard({ src, alt }) {
  if (!src) return null;
  return <img className="home-event-img__photo" src={src} alt={alt} />;
}

export function EventGrid({ events, onDatVe }) {
  return (
    <section className="home-section" id="kham-pha">
      <div className="home-section__head">
        <h2 className="home-section__title">Khám phá sự kiện</h2>
        <div className="home-section__hint">Có {events.length} kết quả</div>
      </div>

      <div className="home-grid">
        {events.map((ev) => (
          <article key={ev.eventId} className="home-card">
            <div className="home-event-img" aria-label={ev.eventName} role="img">
              <AnhCard src={ev.eventImgUrl} alt={`Ảnh sự kiện: ${ev.eventName}`} />
            </div>

            <div className="home-card__body">
              <div className="home-card__top">
                <h3 className="home-card__title">{ev.eventName}</h3>
                <div className="home-card__tag">{ev.genre}</div>
              </div>

              <div className="home-card__meta">
                <div className="home-card__metaRow">
                  <span className="home-card__metaIcon" aria-hidden="true">📅</span>
                  <span className="home-card__metaText">{dinhDangNgay(ev.dateToStart)}</span>
                </div>
                <div className="home-card__metaRow">
                  <span className="home-card__metaIcon" aria-hidden="true">📍</span>
                  <span className="home-card__metaText">{ev.venue?.venueName}</span>
                </div>
              </div>

              <div className="home-card__bottom">
                <div className="home-card__price">
                  Từ {dinhDangVND(layGiaThapNhat(ev.ticketClasses))}
                </div>
                <button className="home-btn home-btn--primary" type="button" onClick={() => onDatVe(ev)}>
                  Đặt vé
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function dinhDangVND(amount) {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
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
          <article key={ev.id} className="home-card">
            <div className="home-event-img" aria-label={ev.name} role="img">
              <AnhCard src={ev.image} alt={`Ảnh sự kiện: ${ev.name}`} />
            </div>

            <div className="home-card__body">
              <div className="home-card__top">
                <h3 className="home-card__title">{ev.name}</h3>
                <div className="home-card__tag">{ev.category}</div>
              </div>

              <div className="home-card__meta">
                <div className="home-card__metaRow">
                  <span className="home-card__metaIcon" aria-hidden="true">📅</span>
                  <span className="home-card__metaText">{ev.date}</span>
                </div>
                <div className="home-card__metaRow">
                  <span className="home-card__metaIcon" aria-hidden="true">📍</span>
                  <span className="home-card__metaText">{ev.location}</span>
                </div>
              </div>

              <div className="home-card__bottom">
                <div className="home-card__price">{dinhDangVND(ev.price)}</div>
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
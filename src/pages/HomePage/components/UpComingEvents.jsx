function dinhDangVND(amount) {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

function AnhCard({ src, alt }) {
  if (!src) return null;
  return <img className="home-event-img__photo" src={src} alt={alt} />;
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
          <div key={ev.id} className="home-upcoming__item">
            <div className="home-upcoming__left">
              <div className="home-upcoming__imgWrap">
                <div className="home-event-img" aria-label={ev.name} role="img">
                  <AnhCard src={ev.image} alt={`Ảnh sự kiện: ${ev.name}`} />
                </div>
              </div>
            </div>
            <div className="home-upcoming__right">
              <div className="home-upcoming__name">{ev.name}</div>
              <div className="home-upcoming__meta">{ev.date}</div>
              <div className="home-upcoming__price">{dinhDangVND(ev.price)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
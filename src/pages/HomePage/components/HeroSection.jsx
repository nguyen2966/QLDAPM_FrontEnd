function dinhDangVND(amount) {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

export function HeroSection({ featured, onPrev, onNext, onExplore }) {
  return (
    <section className="home-hero">
      <div className="home-hero__text">
        <div className="home-hero__kicker">Sự kiện nổi bật</div>
        <h1 className="home-hero__title">{featured.name}</h1>
        <p className="home-hero__desc">{featured.description}</p>

        <div className="home-hero__meta">
          <div className="home-chip">📅 {featured.date}</div>
          <div className="home-chip">📍 {featured.location}</div>
          <div className="home-chip">💳 {dinhDangVND(featured.price)}</div>
        </div>

        <div className="home-hero__actions">
          <button className="home-btn home-btn--primary" type="button" onClick={onExplore}>
            Khám phá sự kiện
          </button>
          <button
            className="home-btn home-btn--ghost"
            type="button"
            onClick={() => alert("Demo: Trang chi tiết sự kiện sẽ làm sau.")}
          >
            Xem chi tiết
          </button>
        </div>
      </div>

      <div className="home-hero__media" aria-hidden="true">
        <div className="home-hero__image">
          <img className="home-hero__photo" src={featured.image} alt={`Ảnh sự kiện: ${featured.name}`} />
          <button type="button" className="home-hero__arrow home-hero__arrow--left" onClick={onPrev} aria-label="Sự kiện nổi bật trước">‹</button>
          <button type="button" className="home-hero__arrow home-hero__arrow--right" onClick={onNext} aria-label="Sự kiện nổi bật tiếp theo">›</button>
        </div>
      </div>
    </section>
  );
}
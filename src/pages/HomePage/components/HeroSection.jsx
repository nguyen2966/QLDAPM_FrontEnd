import moneyIcon from "../../../assets/money.png";
import locationIcon from "../../../assets/location.png";
import calendarIcon from "../../../assets/calendar.png";

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

export function HeroSection({ featured, onPrev, onNext, onDetail }) {
  return (
    <section className="home-hero">
      <div className="home-hero__text">
        <div className="home-hero__kicker">Sự kiện nổi bật</div>
        <h1 className="home-hero__title">{featured.eventName}</h1>
        <p className="home-hero__desc">{featured.description}</p>

        <div className="home-hero__meta">
          <div className="home-chip"><img src={calendarIcon}/> {dinhDangNgay(featured.dateToStart)}</div>
          <div className="home-chip"><img src={locationIcon}/> {featured.venue?.venueName}</div>
          <div className="home-chip">
            <img src={moneyIcon}/> Từ {dinhDangVND(layGiaThapNhat(featured.ticketClasses))}
          </div>
        </div>

        <div className="home-hero__actions">
          <button
            className="home-btn home-btn--primary"
            type="button"
            onClick={() => onDetail?.(featured)}
          >
            Chi tiết
          </button>
        </div>
      </div>

      <div className="home-hero__media" aria-hidden="true">
        <div className="home-hero__image">
          <img
            className="home-hero__photo"
            src={featured.eventImgUrl}
            alt={`Ảnh sự kiện: ${featured.eventName}`}
          />
          <button type="button" className="home-hero__arrow home-hero__arrow--left" onClick={onPrev} aria-label="Sự kiện nổi bật trước">‹</button>
          <button type="button" className="home-hero__arrow home-hero__arrow--right" onClick={onNext} aria-label="Sự kiện nổi bật tiếp theo">›</button>
        </div>
      </div>
    </section>
  );
}
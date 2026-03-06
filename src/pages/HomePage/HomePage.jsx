import "./HomePage.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { useData } from "../../hooks/useData.js";
import { HeroSection } from "./components/HeroSection.jsx";
import { UpcomingEvents } from "./components/UpComingEvents.jsx";

const EVENTS_PER_PAGE = 8;

const PRICE_OPTIONS = [
  { value: "all", label: "Tất cả mức giá" },
  { value: "under-500k", label: "Dưới 500.000 VNĐ" },
  { value: "500k-1m", label: "500.000 - 1.000.000 VNĐ" },
  { value: "1m-2m", label: "1.000.000 - 2.000.000 VNĐ" },
  { value: "over-2m", label: "Trên 2.000.000 VNĐ" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại vé" },
  { value: "SEATED", label: "Ghế ngồi" },
  { value: "STANDING", label: "Đứng" },
];

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function dinhDangVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} VNĐ`;
}

function layGiaThapNhat(ticketClasses = []) {
  if (!Array.isArray(ticketClasses) || ticketClasses.length === 0) return 0;
  return Math.min(...ticketClasses.map((ticket) => Number(ticket.price || 0)));
}

function dinhDangNgay(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function kiemTraKhoangGia(price, priceFilter) {
  if (priceFilter === "all") return true;

  switch (priceFilter) {
    case "under-500k":
      return price < 500000;
    case "500k-1m":
      return price >= 500000 && price <= 1000000;
    case "1m-2m":
      return price > 1000000 && price <= 2000000;
    case "over-2m":
      return price > 2000000;
    default:
      return true;
  }
}

function EventCard({ event, onDatVe }) {
  return (
    <article className="home-card">
      <div className="home-event-img" aria-label={event.eventName} role="img">
        {event.eventImgUrl ? (
          <img
            className="home-event-img__photo"
            src={event.eventImgUrl}
            alt={`Ảnh sự kiện: ${event.eventName}`}
          />
        ) : null}
      </div>

      <div className="home-card__body">
        <div className="home-card__top">
          <h3 className="home-card__title">{event.eventName}</h3>
          <div className="home-card__tag">{event.genre || "Sự kiện"}</div>
        </div>

        <div className="home-card__meta">
          <div className="home-card__metaRow home-card__metaRow--date">
            <span className="home-card__metaIcon" aria-hidden="true">
              📅
            </span>
            <span className="home-card__metaText">{dinhDangNgay(event.dateToStart)}</span>
          </div>

          <div className="home-card__metaRow home-card__metaRow--venue">
            <span className="home-card__metaIcon" aria-hidden="true">
              📍
            </span>
            <span className="home-card__metaText">{event.venue?.venueName || ""}</span>
          </div>
        </div>

        <div className="home-card__bottom">
          <div className="home-card__price">
            Từ {dinhDangVND(layGiaThapNhat(event.ticketClasses))}
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
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="home-pagination">
      <button
        className="home-pagination__btn"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Trước
      </button>

      <div className="home-pagination__numbers">
        {pages.map((page) => (
          <button
            key={page}
            className={`home-pagination__number ${page === currentPage ? "is-active" : ""}`}
            type="button"
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="home-pagination__btn"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau
      </button>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { events, loading, error } = useData();

  const [tuKhoa, setTuKhoa] = useState("");
  const [genre, setGenre] = useState("all");
  const [ngay, setNgay] = useState("");
  const [diaDiem, setDiaDiem] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ticketType, setTicketType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const cuonToi = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const header = document.querySelector(".home-header");
    const offset = (header?.offsetHeight || 0) + 12;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: "smooth",
    });
  };

  const featured = useMemo(() => {
    if (!events.length) return null;
    const safeIndex = ((featuredIndex % events.length) + events.length) % events.length;
    return events[safeIndex];
  }, [events, featuredIndex]);

  const danhSachDiaDiem = useMemo(() => {
    const allLocations = events
      .map((event) => event.venue?.venueName)
      .filter(Boolean);

    return ["all", ...new Set(allLocations)];
  }, [events]);

  const danhSachTheLoai = useMemo(() => {
    const allGenres = events.map((event) => event.genre).filter(Boolean);
    return ["all", ...new Set(allGenres)];
  }, [events]);

  const suKienLoc = useMemo(() => {
    const q = normalizeText(tuKhoa);

    return events.filter((event) => {
      const searchableText = normalizeText(
        [
          event.eventName,
          event.description,
          event.genre,
          event.venue?.venueName,
          event.organizer?.user?.name,
        ].join(" ")
      );

      const matchKeyword = !q || searchableText.includes(q);
      const matchGenre = genre === "all" || event.genre === genre;
      const matchDate = !ngay || event.dateToStart?.slice(0, 10) === ngay;
      const matchLocation = diaDiem === "all" || event.venue?.venueName === diaDiem;

      const ticketClasses = Array.isArray(event.ticketClasses) ? event.ticketClasses : [];

      const matchType =
        ticketType === "all" ||
        ticketClasses.some((ticket) => String(ticket.type).toUpperCase() === ticketType);

      const matchPrice =
        priceFilter === "all" ||
        ticketClasses.some((ticket) => kiemTraKhoangGia(Number(ticket.price || 0), priceFilter));

      return matchKeyword && matchGenre && matchDate && matchLocation && matchType && matchPrice;
    });
  }, [events, tuKhoa, genre, ngay, diaDiem, priceFilter, ticketType]);

  const suKienSapDienRa = useMemo(() => {
    const now = new Date();

    return [...events]
      .filter((event) => new Date(event.dateToStart) > now)
      .sort((a, b) => new Date(a.dateToStart) - new Date(b.dateToStart))
      .slice(0, 4);
  }, [events]);

  const totalPages = Math.max(1, Math.ceil(suKienLoc.length / EVENTS_PER_PAGE));
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const suKienPhanTrang = useMemo(() => {
    const start = (safeCurrentPage - 1) * EVENTS_PER_PAGE;
    const end = start + EVENTS_PER_PAGE;
    return suKienLoc.slice(start, end);
  }, [suKienLoc, safeCurrentPage]);

  const datVe = (event) => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    alert(`✅ Demo: Đặt vé thành công cho "${event.eventName}"`);
  };

  const handlePrevFeatured = () => {
    if (!events.length) return;
    setFeaturedIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNextFeatured = () => {
    if (!events.length) return;
    setFeaturedIndex((prev) => (prev + 1) % events.length);
  };

  const handleKeywordChange = (value) => {
    setTuKhoa(value);
    setCurrentPage(1);
  };

  const handleGenreChange = (value) => {
    setGenre(value);
    setCurrentPage(1);
  };

  const handleDateChange = (value) => {
    setNgay(value);
    setCurrentPage(1);
  };

  const handleLocationChange = (value) => {
    setDiaDiem(value);
    setCurrentPage(1);
  };

  const handlePriceChange = (value) => {
    setPriceFilter(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTicketType(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    cuonToi("kham-pha");
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    cuonToi("kham-pha");
  };

  const handleClearFilters = () => {
    setTuKhoa("");
    setGenre("all");
    setNgay("");
    setDiaDiem("all");
    setPriceFilter("all");
    setTicketType("all");
    setCurrentPage(1);
  };

  if (loading.events) {
    return <div className="home-page home-page__status">Đang tải sự kiện...</div>;
  }

  if (error) {
    return <div className="home-page home-page__status">{error}</div>;
  }

  return (
    <div className="home-page">
      <main className="home-main" id="trang-chu">
        {featured ? (
          <HeroSection
            featured={featured}
            onPrev={handlePrevFeatured}
            onNext={handleNextFeatured}
            onExplore={() => cuonToi("kham-pha")}
          />
        ) : null}

        <section className="home-search" aria-label="Tìm kiếm sự kiện">
          <div className="home-search__bar home-search__bar--wide">
            <input
              className="home-search__input"
              placeholder="Tìm theo tên hoặc từ khoá..."
              value={tuKhoa}
              onChange={(e) => handleKeywordChange(e.target.value)}
            />

            <select
              className="home-search__select"
              value={genre}
              onChange={(e) => handleGenreChange(e.target.value)}
            >
              {danhSachTheLoai.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Thể loại" : item}
                </option>
              ))}
            </select>

            <input
              className="home-search__date"
              type="date"
              value={ngay}
              onChange={(e) => handleDateChange(e.target.value)}
            />

            <select
              className="home-search__select"
              value={diaDiem}
              onChange={(e) => handleLocationChange(e.target.value)}
            >
              {danhSachDiaDiem.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Địa điểm" : item}
                </option>
              ))}
            </select>

            <button className="home-btn home-btn--primary" type="button" onClick={handleSearchClick}>
              Tìm kiếm
            </button>
          </div>
        </section>

        <div className="home-content">
          <aside className="home-sidebar" aria-label="Bộ lọc sự kiện">
            <div className="home-sidebar__section">
              <div className="home-sidebar__head">
                <h3 className="home-sidebar__title">Lọc theo giá vé</h3>
              </div>

              <div className="home-sidebar__options">
                {PRICE_OPTIONS.map((option) => (
                  <label key={option.value} className="home-sidebar__option">
                    <input
                      type="radio"
                      name="priceFilter"
                      value={option.value}
                      checked={priceFilter === option.value}
                      onChange={(e) => handlePriceChange(e.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="home-sidebar__section">
              <div className="home-sidebar__head">
                <h3 className="home-sidebar__title">Lọc theo loại vé</h3>
              </div>

              <div className="home-sidebar__options">
                {TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="home-sidebar__option">
                    <input
                      type="radio"
                      name="ticketType"
                      value={option.value}
                      checked={ticketType === option.value}
                      onChange={(e) => handleTypeChange(e.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="home-btn home-btn--ghost home-sidebar__clear" type="button" onClick={handleClearFilters}>
              Xoá bộ lọc
            </button>
          </aside>

          <div className="home-content__main">
            <section className="home-section" id="kham-pha">
              <div className="home-section__head">
                <h2 className="home-section__title">Khám phá sự kiện</h2>
                <div className="home-section__hint">
                  Có {suKienLoc.length} kết quả • Trang {safeCurrentPage}/{totalPages}
                </div>
              </div>

              {!suKienPhanTrang.length ? (
                <div className="home-empty-state">Không tìm thấy sự kiện phù hợp.</div>
              ) : (
                <div className="home-grid">
                  {suKienPhanTrang.map((event) => (
                    <EventCard key={event.eventId} event={event} onDatVe={datVe} />
                  ))}
                </div>
              )}

              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </section>

            <UpcomingEvents events={suKienSapDienRa} />
          </div>
        </div>
      </main>
    </div>
  );
}
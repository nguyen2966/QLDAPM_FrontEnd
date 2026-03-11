import "./HomePage.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API } from "../../api/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useData } from "../../hooks/useData.js";
import { HeroSection } from "./components/HeroSection.jsx";
import { UpcomingEvents } from "./components/UpComingEvents.jsx";
import { EventGrid } from "./components/EventGrid.jsx";
import { SideBar } from "./components/SideBar.jsx";

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
  { value: "STANDING", label: "Ghế đứng" },
];

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
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

function layNhanTrangThai(status) {
  const s = String(status || "").toUpperCase();

  switch (s) {
    case "PENDING":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "REJECTED":
      return "Bị từ chối";
    case "IN_PROGRESS":
      return "Đang mở bán";
    case "CANCELLED":
      return "Đã huỷ";
    default:
      return "Chưa cập nhật";
  }
}

function layClassTrangThai(status) {
  const s = String(status || "").toUpperCase();

  switch (s) {
    case "APPROVED":
      return "is-approved";
    case "PENDING":
      return "is-pending";
    case "REJECTED":
      return "is-rejected";
    case "IN_PROGRESS":
      return "is-progress";
    case "CANCELLED":
      return "is-cancelled";
    default:
      return "";
  }
}

function laPhanHoiThanhCong(response) {
  return response?.data?.status === "success";
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
  const { accessToken, user } = useAuth();
  const { events, loading, error } = useData();

  const isOrganizer = user?.role === "ORGANIZER";

  const [tuKhoa, setTuKhoa] = useState("");
  const [genre, setGenre] = useState("all");
  const [ngay, setNgay] = useState("");
  const [diaDiem, setDiaDiem] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ticketType, setTicketType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const [myEvents, setMyEvents] = useState([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);
  const [errorMyEvents, setErrorMyEvents] = useState("");

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

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!isOrganizer) {
        setMyEvents([]);
        return;
      }

      setLoadingMyEvents(true);
      setErrorMyEvents("");

      try {
        const response = await API.event.getMyEvents();

        if (!laPhanHoiThanhCong(response)) {
          setErrorMyEvents("Không thể tải danh sách sự kiện của bạn.");
          setMyEvents([]);
          return;
        }

        const myEventList = response?.data?.data || [];

        const myEventDetails = await Promise.all(
          myEventList.map(async (event) => {
            try {
              const detailResponse = await API.event.getMyEventById(event.eventId);

              if (laPhanHoiThanhCong(detailResponse)) {
                return detailResponse.data.data;
              }

              return event;
            } catch {
              return event;
            }
          })
        );

        setMyEvents(myEventDetails);
      } catch (err) {
        setErrorMyEvents(
          err?.response?.data?.message || "Không thể tải danh sách sự kiện của bạn."
        );
        setMyEvents([]);
      } finally {
        setLoadingMyEvents(false);
      }
    };

    fetchMyEvents();
  }, [isOrganizer]);

  const featured = useMemo(() => {
    if (!events.length) return null;
    const safeIndex = ((featuredIndex % events.length) + events.length) % events.length;
    return events[safeIndex];
  }, [events, featuredIndex]);

  const danhSachDiaDiem = useMemo(() => {
    const allLocations = events.map((event) => event.venue?.venueName).filter(Boolean);
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
      const ticketClassesTheoLoai = layDanhSachVeTheoLoai(ticketClasses, ticketType);

      const matchType =
        ticketType === "all"
          ? ticketClasses.length > 0
          : ticketClassesTheoLoai.length > 0;

      const giaDaiDien = layGiaThapNhatTheoLoai(ticketClasses, ticketType);
      const matchPrice =
        priceFilter === "all" || kiemTraKhoangGia(giaDaiDien, priceFilter);

      return (
        matchKeyword &&
        matchGenre &&
        matchDate &&
        matchLocation &&
        matchType &&
        matchPrice
      );
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

    navigate(`/${event.eventId}`);
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

  if (isOrganizer) {
    return (
      <div className="home-page">
        <main className="home-main" id="trang-chu">
          <section className="organizer-home">
            <div className="organizer-home__head">
              <div>
                <p className="organizer-home__eyebrow">KHU VỰC NHÀ TỔ CHỨC</p>
                <h1 className="organizer-home__title">Sự kiện của tôi</h1>

              </div>
            </div>

            {loadingMyEvents ? (
              <div className="home-page__status">Đang tải sự kiện của bạn...</div>
            ) : errorMyEvents ? (
              <div className="home-page__status">{errorMyEvents}</div>
            ) : !myEvents.length ? (
              <div className="organizer-empty">
                <h3>Bạn chưa có sự kiện nào</h3>
                <p>Hãy vào mục “Tạo sự kiện” trên thanh điều hướng để bắt đầu tạo sự kiện mới.</p>
              </div>
            ) : (
              <div className="organizer-grid">
                {myEvents.map((event) => (
                  <article key={event.eventId} className="organizer-card">
                    <div className="organizer-card__imageWrap">
                      {event.eventImgUrl ? (
                        <img
                          className="organizer-card__image"
                          src={event.eventImgUrl}
                          alt={`Ảnh sự kiện: ${event.eventName}`}
                        />
                      ) : (
                        <div className="organizer-card__image organizer-card__image--empty">
                          Không có ảnh
                        </div>
                      )}
                    </div>

                    <div className="organizer-card__body">
                      <div className="organizer-card__topRow">
                        <div className="organizer-card__genre">
                          {event.genre || "Sự kiện"}
                        </div>

                        <span className={`organizer-card__status ${layClassTrangThai(event.status)}`}>
                          {layNhanTrangThai(event.status)}
                        </span>
                      </div>

                      <h3 className="organizer-card__title">{event.eventName}</h3>

                      <div className="organizer-card__meta">
                        <div className="organizer-card__metaRow">
                          <span>📅</span>
                          <span>{dinhDangNgay(event.dateToStart)}</span>
                        </div>

                        <div className="organizer-card__metaRow">
                          <span>📍</span>
                          <span>{event.venue?.venueName || "Chưa có địa điểm"}</span>
                        </div>

                        <div className="organizer-card__metaRow">
                          <span>🎫</span>
                          <span>
                            {Array.isArray(event.ticketClasses)
                              ? `${event.ticketClasses.length} hạng vé`
                              : "Chưa có hạng vé"}
                          </span>
                        </div>

                        <div className="organizer-card__metaRow">
                          <span>💳</span>
                          <span>
                            Từ {dinhDangVND(layGiaThapNhatTheoLoai(event.ticketClasses || []))}
                          </span>
                        </div>
                      </div>

                      <div className="organizer-card__footer">
                        <button
                          type="button"
                          className="home-btn home-btn--primary organizer-card__editBtn"
                          onClick={() => alert(`Demo: Chỉnh sửa sự kiện "${event.eventName}"`)}
                        >
                          Chỉnh sửa sự kiện
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

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

            <button
              className="home-btn home-btn--primary"
              type="button"
              onClick={handleSearchClick}
            >
              Tìm kiếm
            </button>
          </div>
        </section>

        <div className="home-content">
          <SideBar
            priceFilter={priceFilter}
            setPriceFilter={handlePriceChange}
            ticketType={ticketType}
            setTicketType={handleTypeChange}
            priceOptions={PRICE_OPTIONS}
            typeOptions={TYPE_OPTIONS}
            onClearFilters={handleClearFilters}
          />

          <div className="home-content__main">
            <div id="kham-pha">
              <EventGrid
                events={suKienPhanTrang}
                totalResults={suKienLoc.length}
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onDatVe={datVe}
                selectedTicketType={ticketType}
              />
            </div>

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            <UpcomingEvents events={suKienSapDienRa} />
          </div>
        </div>
      </main>
    </div>
  );
}
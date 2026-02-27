import "./HomePage.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NavBar } from "../../components/NavBar/NavBar";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../hooks/useAuth.js";

import ImageEvent1 from "../../assets/Red.jpg";
import ImageEvent2 from "../../assets/Red.jpg";
import ImageEvent3 from "../../assets/Red.jpg";
import ImageEvent4 from "../../assets/Red.jpg";
import ImageEvent5 from "../../assets/Red.jpg";
import ImageEvent6 from "../../assets/Red.jpg";
import ImageEvent7 from "../../assets/Red.jpg";
import ImageEvent8 from "../../assets/Red.jpg";

import ImageEvent9 from "../../assets/Red.jpg";
import ImageEvent10 from "../../assets/Red.jpg";
import ImageEvent11 from "../../assets/Red.jpg";
import ImageEvent12 from "../../assets/Red.jpg";

const MOCK_EVENTS = [
  {
    id: "ev_001",
    name: "Đêm nhạc Trăng Đỏ",
    description: "Ban nhạc live + acoustic. Số lượng vé giới hạn, âm thanh chất lượng.",
    date: "2026-03-10",
    location: "TP. Hồ Chí Minh",
    price: 500000,
    category: "Âm nhạc",
    image: ImageEvent1,
  },
  {
    id: "ev_002",
    name: "Triển lãm Công nghệ & Nghệ thuật",
    description: "Gian hàng tương tác, demo AI và nhiều khu trải nghiệm sáng tạo.",
    date: "2026-03-15",
    location: "TP. Hồ Chí Minh",
    price: 350000,
    category: "Triển lãm",
    image: ImageEvent2,
  },
  {
    id: "ev_003",
    name: "Đêm hài độc thoại: Cười thả ga",
    description: "Một tối bùng nổ với nhiều nghệ sĩ hài.",
    date: "2026-03-18",
    location: "Hà Nội",
    price: 280000,
    category: "Giải trí",
    image: ImageEvent3,
  },
  {
    id: "ev_004",
    name: "Chạy bộ 5K cuối tuần",
    description: "Chạy vui, chill nhẹ và nhận bộ quà hoàn thành giới hạn.",
    date: "2026-03-22",
    location: "Đà Nẵng",
    price: 220000,
    category: "Thể thao",
    image: ImageEvent4,
  },
  {
    id: "ev_005",
    name: "Workshop nhảy K-pop",
    description: "Dành cho người mới. Học trọn một bài vũ đạo.",
    date: "2026-03-25",
    location: "TP. Hồ Chí Minh",
    price: 180000,
    category: "Workshop",
    image: ImageEvent5,
  },
  {
    id: "ev_006",
    name: "Lễ hội ẩm thực đường phố",
    description: "Hơn 40 gian hàng. Tinh hoa đồ ăn đường phố hội tụ.",
    date: "2026-03-28",
    location: "Hà Nội",
    price: 120000,
    category: "Ẩm thực",
    image: ImageEvent6,
  },
  {
    id: "ev_007",
    name: "Công chiếu phim Indie",
    description: "Chiếu ra mắt + giao lưu hỏi đáp với đạo diễn.",
    date: "2026-04-02",
    location: "Đà Nẵng",
    price: 260000,
    category: "Điện ảnh",
    image: ImageEvent7,
  },
  {
    id: "ev_008",
    name: "Gọi vốn & Kết nối khởi nghiệp",
    description: "Thuyết trình, kết nối và gặp gỡ cố vấn.",
    date: "2026-04-05",
    location: "TP. Hồ Chí Minh",
    price: 150000,
    category: "Kinh doanh",
    image: ImageEvent8,
  },
];

const SU_KIEN_SAP_DIEN_RA = [
  { id: "up_01", name: "Lễ hội pháo hoa", date: "2026-04-10", price: 500000, image: ImageEvent9 },
  { id: "up_02", name: "Workshop nhiếp ảnh", date: "2026-04-12", price: 320000, image: ImageEvent10 },
  { id: "up_03", name: "Đêm nhạc thiện nguyện", date: "2026-04-15", price: 400000, image: ImageEvent11 },
  { id: "up_04", name: "Tour chợ đêm", date: "2026-04-18", price: 190000, image: ImageEvent12 },
];

function dinhDangVND(amount) {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

function AnhCard({ src, alt }) {
  if (!src) return null;
  return <img className="home-event-img__photo" src={src} alt={alt} />;
}

export function HomePage() {
  const navigate = useNavigate();

  const { accessToken, user, logout } = useAuth();

  const [tuKhoa, setTuKhoa] = useState("");
  const [diaDiem, setDiaDiem] = useState("all");
  const [ngay, setNgay] = useState("");

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured = MOCK_EVENTS[featuredIndex] || MOCK_EVENTS[0];

  // ✅ cuộn tới section với offset theo chiều cao navbar (home-header)
  const cuonToi = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const header = document.querySelector(".home-header");
    const offset = (header?.offsetHeight || 0) + 12;

    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const danhSachDiaDiem = useMemo(() => {
    const set = new Set(MOCK_EVENTS.map((e) => e.location));
    return ["all", ...Array.from(set)];
  }, []);

  const suKienLoc = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();
    return MOCK_EVENTS.filter((e) => {
      const matchQ = !q || `${e.name} ${e.description}`.toLowerCase().includes(q);
      const matchLoc = diaDiem === "all" || e.location === diaDiem;
      const matchDate = !ngay || e.date === ngay;
      return matchQ && matchLoc && matchDate;
    });
  }, [tuKhoa, diaDiem, ngay]);

  const datVe = (event) => {
    if (!accessToken) return navigate("/login");
    alert(`✅ Demo: Đặt vé thành công cho “${event.name}”`);
  };

  const dangXuat = () => {
    logout();
    navigate("/login");
  };

  const truocDo = () => setFeaturedIndex((i) => (i - 1 + MOCK_EVENTS.length) % MOCK_EVENTS.length);
  const tiepTheo = () => setFeaturedIndex((i) => (i + 1) % MOCK_EVENTS.length);

  return (
    <div className="home-page">
      <NavBar token={accessToken} role={user.role} onLogout={dangXuat} />

      <main className="home-main" id="trang-chu">
        {/* HERO */}
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
              <button className="home-btn home-btn--primary" type="button" onClick={() => cuonToi("kham-pha")}>
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

          {/* BÊN PHẢI: ẢNH */}
          <div className="home-hero__media" aria-hidden="true">
            <div className="home-hero__image">
              <img className="home-hero__photo" src={featured.image} alt={`Ảnh sự kiện: ${featured.name}`} />

              <button
                type="button"
                className="home-hero__arrow home-hero__arrow--left"
                onClick={truocDo}
                aria-label="Sự kiện nổi bật trước"
              >
                ‹
              </button>

              <button
                type="button"
                className="home-hero__arrow home-hero__arrow--right"
                onClick={tiepTheo}
                aria-label="Sự kiện nổi bật tiếp theo"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="home-search" aria-label="Tìm kiếm sự kiện">
          <div className="home-search__bar">
            <div className="home-search__label">Bạn muốn tìm sự kiện nào?</div>

            <input
              className="home-search__input"
              placeholder="Tìm theo tên hoặc từ khoá..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />

            <input className="home-search__date" type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />

            <select className="home-search__select" value={diaDiem} onChange={(e) => setDiaDiem(e.target.value)}>
              {danhSachDiaDiem.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "Địa điểm" : loc}
                </option>
              ))}
            </select>

            <button className="home-btn home-btn--primary" type="button" onClick={() => cuonToi("kham-pha")}>
              Tìm kiếm
            </button>
          </div>
        </section>

        {/* DANH SÁCH SỰ KIỆN */}
        <section className="home-section" id="kham-pha">
          <div className="home-section__head">
            <h2 className="home-section__title">Khám phá sự kiện</h2>
            <div className="home-section__hint">Có {suKienLoc.length} kết quả</div>
          </div>

          <div className="home-grid">
            {suKienLoc.map((ev) => (
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
                      <span className="home-card__metaIcon" aria-hidden="true">
                        📅
                      </span>
                      <span className="home-card__metaText">{ev.date}</span>
                    </div>

                    <div className="home-card__metaRow">
                      <span className="home-card__metaIcon" aria-hidden="true">
                        📍
                      </span>
                      <span className="home-card__metaText">{ev.location}</span>
                    </div>
                  </div>

                  <div className="home-card__bottom">
                    <div className="home-card__price">{dinhDangVND(ev.price)}</div>
                    <button className="home-btn home-btn--primary" type="button" onClick={() => datVe(ev)}>
                      Đặt vé
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SẮP DIỄN RA */}
        <section className="home-section" id="sap-dien-ra">
          <div className="home-section__head">
            <h2 className="home-section__title">Sự kiện sắp diễn ra</h2>
            <div className="home-section__hint">Lên kế hoạch sớm và săn vé ưu đãi</div>
          </div>

          <div className="home-upcoming">
            {SU_KIEN_SAP_DIEN_RA.map((ev) => (
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
      </main>

      <Footer />
    </div>
  );
}
import "./HomePage.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NavBar } from "../../components/NavBar/NavBar";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../hooks/useAuth.js";

import { HeroSection } from "./components/HeroSection";
import { SearchBar } from "./components/SearchBar";
import { EventGrid } from "./components/EventGrid";
import { UpcomingEvents } from "./components/UpComingEvents.jsx";

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
  { id: "ev_001", name: "Đêm nhạc Trăng Đỏ", description: "Ban nhạc live + acoustic. Số lượng vé giới hạn, âm thanh chất lượng.", date: "2026-03-10", location: "TP. Hồ Chí Minh", price: 500000, category: "Âm nhạc", image: ImageEvent1 },
  { id: "ev_002", name: "Triển lãm Công nghệ & Nghệ thuật", description: "Gian hàng tương tác, demo AI và nhiều khu trải nghiệm sáng tạo.", date: "2026-03-15", location: "TP. Hồ Chí Minh", price: 350000, category: "Triển lãm", image: ImageEvent2 },
  { id: "ev_003", name: "Đêm hài độc thoại: Cười thả ga", description: "Một tối bùng nổ với nhiều nghệ sĩ hài.", date: "2026-03-18", location: "Hà Nội", price: 260000, category: "Giải trí", image: ImageEvent3 },
  { id: "ev_004", name: "Chạy bộ 5K cuối tuần", description: "Chạy vui, chill nhẹ và nhận bộ quà hoàn thành giới hạn.", date: "2026-03-22", location: "Đà Nẵng", price: 220000, category: "Thể thao", image: ImageEvent4 },
  { id: "ev_005", name: "Workshop nhảy K-pop", description: "Dành cho người mới. Học trọn một bài vũ đạo.", date: "2026-03-25", location: "TP. Hồ Chí Minh", price: 160000, category: "Workshop", image: ImageEvent5 },
  { id: "ev_006", name: "Lễ hội ẩm thực đường phố", description: "Hơn 40 gian hàng. Tinh hoa đồ ăn đường phố hội tụ.", date: "2026-03-28", location: "Hà Nội", price: 120000, category: "Ẩm thực", image: ImageEvent6 },
  { id: "ev_007", name: "Công chiếu phim Indie", description: "Chiếu ra mắt + giao lưu hỏi đáp với đạo diễn.", date: "2026-04-02", location: "Đà Nẵng", price: 260000, category: "Điện ảnh", image: ImageEvent7 },
  { id: "ev_008", name: "Gọi vốn & Kết nối khởi nghiệp", description: "Thuyết trình, kết nối và gặp gỡ cố vấn.", date: "2026-04-05", location: "TP. Hồ Chí Minh", price: 150000, category: "Kinh doanh", image: ImageEvent8 },
];

const SU_KIEN_SAP_DIEN_RA = [
  { id: "up_01", name: "Lễ hội pháo hoa", date: "2026-04-10", price: 500000, image: ImageEvent9 },
  { id: "up_02", name: "Workshop nhiếp ảnh", date: "2026-04-12", price: 320000, image: ImageEvent10 },
  { id: "up_03", name: "Đêm nhạc thiện nguyện", date: "2026-04-15", price: 400000, image: ImageEvent11 },
  { id: "up_04", name: "Tour chợ đêm", date: "2026-04-18", price: 170000, image: ImageEvent12 },
];

export function HomePage() {
  const navigate = useNavigate();
  const { accessToken, user, logout } = useAuth();

  const [tuKhoa, setTuKhoa] = useState("");
  const [diaDiem, setDiaDiem] = useState("all");
  const [ngay, setNgay] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featured = MOCK_EVENTS[featuredIndex] || MOCK_EVENTS[0];

  const cuonToi = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector(".home-header");
    const offset = (header?.offsetHeight || 0) + 12;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
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
    alert(`✅ Demo: Đặt vé thành công cho "${event.name}"`);
  };

  const dangXuat = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="home-page">
      <NavBar token={accessToken} role={user?.role || "customer"} onLogout={dangXuat} />

      <main className="home-main" id="trang-chu">
        <HeroSection
          featured={featured}
          onPrev={() => setFeaturedIndex((i) => (i - 1 + MOCK_EVENTS.length) % MOCK_EVENTS.length)}
          onNext={() => setFeaturedIndex((i) => (i + 1) % MOCK_EVENTS.length)}
          onExplore={() => cuonToi("kham-pha")}
        />

        <SearchBar
          tuKhoa={tuKhoa} setTuKhoa={setTuKhoa}
          ngay={ngay} setNgay={setNgay}
          diaDiem={diaDiem} setDiaDiem={setDiaDiem}
          danhSachDiaDiem={danhSachDiaDiem}
          onSearch={() => cuonToi("kham-pha")}
        />

        <EventGrid events={suKienLoc} onDatVe={datVe} />

        <UpcomingEvents events={SU_KIEN_SAP_DIEN_RA} />
      </main>

      <Footer />
    </div>
  );
}
import "./HomePage.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { useData } from "../../hooks/useData.js";

import { HeroSection } from "./components/HeroSection";
import { SearchBar } from "./components/SearchBar";
import { EventGrid } from "./components/EventGrid";
import { UpcomingEvents } from "./components/UpComingEvents.jsx";

export function HomePage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { events, loading } = useData(); // ← lấy từ DataContext, không dùng mock local

  const [tuKhoa, setTuKhoa] = useState("");
  const [diaDiem, setDiaDiem] = useState("all");
  const [ngay, setNgay] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featured = events[featuredIndex] || events[0];

  const cuonToi = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector(".home-header");
    const offset = (header?.offsetHeight || 0) + 12;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
  };

  // Danh sách địa điểm cho dropdown — lấy từ venue.venueName
  const danhSachDiaDiem = useMemo(() => {
    const set = new Set(events.map((e) => e.venue?.venueName).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [events]);

  // Filter — map lại đúng field của API
  const suKienLoc = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();
    return events.filter((e) => {
      const matchQ = !q || `${e.eventName} ${e.description}`.toLowerCase().includes(q);
      const matchLoc = diaDiem === "all" || e.venue?.venueName === diaDiem;
      // dateToStart là ISO string "2025-08-15T00:00:00.000Z" → cắt lấy phần date để so sánh
      const matchDate = !ngay || e.dateToStart?.slice(0, 10) === ngay;
      return matchQ && matchLoc && matchDate;
    });
  }, [tuKhoa, diaDiem, ngay, events]);

  // Upcoming = các event chưa diễn ra, lấy tối đa 4
  const suKienSapDienRa = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.dateToStart) > now)
      .slice(0, 4);
  }, [events]);

  const datVe = (event) => {
    if (!accessToken) return navigate("/login");
    alert(`✅ Demo: Đặt vé thành công cho "${event.eventName}"`);
  };

  if (loading.events) return <div className="home-page">Đang tải sự kiện...</div>;

  return (
    <div className="home-page">
      <main className="home-main" id="trang-chu">
        {featured && (
          <HeroSection
            featured={featured}
            onPrev={() => setFeaturedIndex((i) => (i - 1 + events.length) % events.length)}
            onNext={() => setFeaturedIndex((i) => (i + 1) % events.length)}
            onExplore={() => cuonToi("kham-pha")}
          />
        )}

        <SearchBar
          tuKhoa={tuKhoa} setTuKhoa={setTuKhoa}
          ngay={ngay} setNgay={setNgay}
          diaDiem={diaDiem} setDiaDiem={setDiaDiem}
          danhSachDiaDiem={danhSachDiaDiem}
          onSearch={() => cuonToi("kham-pha")}
        />

        <EventGrid events={suKienLoc} onDatVe={datVe} />

        <UpcomingEvents events={suKienSapDienRa} />
      </main>
    </div>
  );
}
import { useState } from "react";

export function SearchBar({
  tuKhoa,
  setTuKhoa,
  genre,
  setGenre,
  ngay,
  setNgay,
  diaDiem,
  setDiaDiem,
  danhSachDiaDiem,
  onSearch,
}) {
  const [isDateFieldActive, setIsDateFieldActive] = useState(false);

  return (
    <section className="home-search" aria-label="Tìm kiếm sự kiện">
      <div className="home-search__bar home-search__bar--wide">
        <div className="home-search__label">Bạn muốn tìm sự kiện nào?</div>

        <input
          className="home-search__input"
          placeholder="Tìm theo tên hoặc từ khoá..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />

        <input
          className="home-search__input"
          placeholder="Tìm theo thể loại..."
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />

        <input
          className="home-search__date"
          type={isDateFieldActive || ngay ? "date" : "text"}
          placeholder="Chọn ngày"
          value={ngay}
          onFocus={() => setIsDateFieldActive(true)}
          onBlur={() => {
            if (!ngay) setIsDateFieldActive(false);
          }}
          onChange={(e) => setNgay(e.target.value)}
        />

        <select
          className="home-search__select"
          value={diaDiem}
          onChange={(e) => setDiaDiem(e.target.value)}
        >
          {danhSachDiaDiem.map((loc) => (
            <option key={loc} value={loc}>
              {loc === "all" ? "Chọn địa điểm" : loc}
            </option>
          ))}
        </select>

        <button className="home-btn home-btn--primary" type="button" onClick={onSearch}>
          Tìm kiếm
        </button>
      </div>
    </section>
  );
}

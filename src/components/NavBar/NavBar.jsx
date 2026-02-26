import "./NavBar.css";

import bkLogo from "../../assets/bklogo.png";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

function tenVaiTro(role) {
  if (role === "admin") return "Quản trị";
  if (role === "organizer") return "Nhà tổ chức";
  return "Khách";
}

export function NavBar({ token, role, onLogout }) {
  const [moMenu, setMoMenu] = useState(false);
  const wrapRef = useRef(null);

  const nhanVaiTro = useMemo(() => tenVaiTro(role), [role]);

  // Đóng menu khi bấm ra ngoài + ESC
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setMoMenu(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMoMenu(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const chonMuc = (hanhDong) => {
    setMoMenu(false);
    hanhDong?.();
  };

  return (
    <header className="home-header">
      <div className="home-header__left">
        <Link to="/" className="home-brand">
          <img className="home-brand__logo" src={bkLogo} alt="EventPass" />
          <span className="home-brand__name">EventPass</span>
        </Link>

        <nav className="home-nav" aria-label="Điều hướng chính">
          <a className="home-nav__link" href="#kham-pha">
            Tìm sự kiện
          </a>
          <a className="home-nav__link" href="#trang-chu">
            Trang chủ
          </a>
          <a
            className="home-nav__link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Demo: Chức năng “Sự kiện của tôi” sẽ làm sau.");
            }}
          >
            Sự kiện của tôi
          </a>
          <a className="home-nav__link" href="#sap-dien-ra">
            Sắp diễn ra
          </a>
          <a
            className="home-nav__link"
            href="#tro-giup"
            onClick={(e) => {
              e.preventDefault();
              alert("Demo: Trợ giúp/FAQ sẽ làm sau.");
            }}
          >
            Trợ giúp
          </a>
        </nav>
      </div>

      <div className="home-header__right">
        {!token ? (
          <div className="home-auth">
            <Link className="home-btn home-btn--ghost" to="/login">
              Đăng nhập
            </Link>
            <Link className="home-btn home-btn--primary" to="/signup">
              Đăng ký
            </Link>
          </div>
        ) : (
          <div className="nav-userWrap" ref={wrapRef}>
            {/* Pill chỉ hiển thị trạng thái (KHÔNG CLICK) */}
            <div className="nav-rolePill" aria-label="Trạng thái tài khoản">
              <span className="nav-roleDot" aria-hidden="true" />
              <span className="nav-roleText">{nhanVaiTro}</span>

            </div>

            {/* ✅ Chỉ bấm ô tròn (avatar) mới mở menu */}
            <button
              type="button"
              className="nav-avatarBtn"
              onClick={() => setMoMenu((v) => !v)}
              aria-label="Mở menu tài khoản"
              aria-haspopup="menu"
              aria-expanded={moMenu}
            >
              <span className="nav-avatarStatus" aria-hidden="true" />
            </button>

            {moMenu ? (
              <div className="nav-menu" role="menu" aria-label="Menu tài khoản">
                <button
                  className="nav-menuItem"
                  type="button"
                  role="menuitem"
                  onClick={() => chonMuc(() => alert("Demo: Trang “Hồ sơ” sẽ làm sau."))}
                >
                  Hồ sơ
                </button>

                <button
                  className="nav-menuItem"
                  type="button"
                  role="menuitem"
                  onClick={() => chonMuc(() => alert("Demo: Trang “Sự kiện của tôi” sẽ làm sau."))}
                >
                  Sự kiện của tôi
                </button>

                <button
                  className="nav-menuItem"
                  type="button"
                  role="menuitem"
                  onClick={() => chonMuc(() => alert("Demo: Trang “Lịch sử vé” sẽ làm sau."))}
                >
                  Lịch sử vé
                </button>

                <button
                  className="nav-menuItem nav-menuItem--danger"
                  type="button"
                  role="menuitem"
                  onClick={() => chonMuc(onLogout)}
                >
                  Đăng xuất
                </button>

                <div className="nav-divider" />

                {role !== "organizer" ? (
                  <button
                    className="nav-menuItem"
                    type="button"
                    role="menuitem"
                    onClick={() => chonMuc(() => alert("Demo: Đăng ký làm Nhà tổ chức sẽ làm sau."))}
                  >
                    Đăng ký làm Nhà tổ chức
                  </button>
                ) : (
                  <div className="nav-menuHint">Bạn đang là Nhà tổ chức</div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
import "./NavBar.css";

import appLogo from "../../assets/app-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

function normalizeRole(role) {
  const r = String(role || "").trim().toLowerCase();

  if (
    r === "customer" ||
    r === "khachhang" ||
    r === "khách hàng" ||
    r === "khach"
  ) {
    return "customer";
  }

  if (
    r === "organizer" ||
    r === "nhatochuc" ||
    r === "nhà tổ chức"
  ) {
    return "organizer";
  }

  if (r === "admin" || r === "quantri" || r === "quản trị") {
    return "admin";
  }

  return "customer";
}

function tenVaiTro(role) {
  const rr = normalizeRole(role);
  if (rr === "admin") return "Quản trị";
  if (rr === "organizer") return "Nhà tổ chức";
  return "Khách hàng";
}

function getInitials(text) {
  const s = String(text || "").trim();
  if (!s) return "U";

  const parts = s.split(/\s+/).slice(0, 2);
  return (
    parts
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join("") || s[0].toUpperCase()
  );
}

export function NavBar({ token, role, onLogout, avatarUrl, displayName }) {
  const [moMenu, setMoMenu] = useState(false);
  const wrapRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const roleKey = useMemo(() => normalizeRole(role), [role]);
  const nhanVaiTro = useMemo(() => tenVaiTro(role), [role]);

  const anhDaiDien =
    avatarUrl ||
    authUser?.avatarUrl ||
    authUser?.picture ||
    authUser?.avatar ||
    authUser?.photoURL ||
    authUser?.imageUrl ||
    "";

  const tenHienThi =
    displayName || authUser?.name || authUser?.email || "Người dùng";

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
    if (typeof hanhDong === "function") hanhDong();
  };

  const veTrangChuRoiCuon = (id) => {
    const cuon = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(cuon, 120);
      setTimeout(cuon, 350);
      setTimeout(cuon, 700);
      return;
    }

    cuon();
  };

  const veTrangChu = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 120);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCustomerNav = () => (
    <nav className="home-nav" aria-label="Điều hướng khách hàng">
      <a
        className="home-nav__link"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          veTrangChu();
        }}
      >
        Trang chủ
      </a>

      <a
        className="home-nav__link"
        href="#kham-pha"
        onClick={(e) => {
          e.preventDefault();
          veTrangChuRoiCuon("kham-pha");
        }}
      >
        Khám phá sự kiện
      </a>

      <a
        className="home-nav__link"
        href="#sap-dien-ra"
        onClick={(e) => {
          e.preventDefault();
          veTrangChuRoiCuon("sap-dien-ra");
        }}
      >
        Sự kiện sắp diễn ra
      </a>

      {authUser && <Link className="home-nav__link" to="/order/my-order">
        Đơn hàng của tôi
      </Link>}
    </nav>
  );

  const renderOrganizerNav = () => (
    <nav className="home-nav" aria-label="Điều hướng nhà tổ chức">
      {/* <a
        className="home-nav__link"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          veTrangChu();
        }}
      >
        Trang chủ
      </a> */}

      <Link className="home-nav__link" to="/">
        Sự kiện của tôi
      </Link>

      <Link className="home-nav__link" to="/my-event/create">
        Tạo sự kiện
      </Link>

      {/* <Link className="home-nav__link" to="/my-event">
        Thống kê chi tiết
      </Link> */}

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
  );

  return (
    <header className="home-header">
      <div className="home-header__left">
        <Link to="/" className="home-brand">
          <img className="home-brand__logo" src={appLogo} alt="EventPass" />
        </Link>

        {!token
          ? renderCustomerNav()
          : roleKey === "organizer"
          ? renderOrganizerNav()
          : renderCustomerNav()}
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
            <div className="nav-rolePill" aria-label="Trạng thái tài khoản">
              <span className="nav-roleDot" aria-hidden="true" />
              <span className="nav-roleText">{nhanVaiTro}</span>
            </div>

            <button
              type="button"
              className="nav-avatarBtn"
              onClick={() => setMoMenu((v) => !v)}
              aria-label="Mở menu tài khoản"
              aria-haspopup="menu"
              aria-expanded={moMenu}
              title={tenHienThi}
            >
              {anhDaiDien ? (
                <img
                  className="nav-avatarImg"
                  src={anhDaiDien}
                  alt="Ảnh đại diện"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "";
                  }}
                />
              ) : (
                <span className="nav-avatarFallback">
                  {getInitials(tenHienThi)}
                </span>
              )}
              <span className="nav-avatarStatus" aria-hidden="true" />
            </button>

            {moMenu ? (
              <div className="nav-menu" role="menu" aria-label="Menu tài khoản">
                <Link
                  to="/user"
                  className="nav-menuItem"
                  role="menuitem"
                  onClick={() => setMoMenu(false)}
                >
                  Hồ sơ
                </Link>

                {roleKey === "customer" && (
                  <button
                    className="nav-menuItem"
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      chonMuc(() => alert("Demo: Trang “Lịch sử vé” sẽ làm sau."))
                    }
                  >
                    Lịch sử vé
                  </button>
                )}

                <button
                  className="nav-menuItem nav-menuItem--danger"
                  type="button"
                  role="menuitem"
                  onClick={() => chonMuc(onLogout)}
                >
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
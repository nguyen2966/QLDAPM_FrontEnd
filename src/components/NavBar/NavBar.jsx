// import "./NavBar.css";

// import bkLogo from "../../assets/bklogo.png";
// import { Link } from "react-router-dom";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { API } from "../../api/api.js";

// function tenVaiTro(role) {
//   if (role === "admin") return "Quản trị";
//   if (role === "organizer") return "Nhà tổ chức";
//   return "Khách";
// }

// export function NavBar({ token, role, onLogout }) {
//   const [moMenu, setMoMenu] = useState(false);
//   const wrapRef = useRef(null);

//   const nhanVaiTro = useMemo(() => tenVaiTro(role), [role]);

//   // Đóng menu khi bấm ra ngoài + ESC
//   useEffect(() => {
//     const onMouseDown = (e) => {
//       if (!wrapRef.current) return;
//       if (!wrapRef.current.contains(e.target)) setMoMenu(false);
//     };

//     const onKeyDown = (e) => {
//       if (e.key === "Escape") setMoMenu(false);
//     };

//     document.addEventListener("mousedown", onMouseDown);
//     document.addEventListener("keydown", onKeyDown);
//     return () => {
//       document.removeEventListener("mousedown", onMouseDown);
//       document.removeEventListener("keydown", onKeyDown);
//     };
//   }, []);

//   const chonMuc = (hanhDong) => {
//     setMoMenu(false);
//     if (typeof hanhDong === 'function') {
//     hanhDong();
//   }
//   };

//   return (
//     <header className="home-header">
//       <div className="home-header__left">
//         <button onClick={async ()=>{
//           try{
//              const testRes = await API.test.testHealth();
//              console.log(testRes)
//           } catch(err){
//             console.log(err);
//           } 
//         }}>
//           TEST
//         </button>
//         <Link to="/" className="home-brand">
//           <img className="home-brand__logo" src={bkLogo} alt="EventPass" />
//           <span className="home-brand__name">EventPass</span>
//         </Link>

//         <nav className="home-nav" aria-label="Điều hướng chính">
//           <a className="home-nav__link" href="#kham-pha">
//             Tìm sự kiện
//           </a>
//           <a className="home-nav__link" href="#trang-chu">
//             Trang chủ
//           </a>
//           <a
//             className="home-nav__link"
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               alert("Demo: Chức năng “Sự kiện của tôi” sẽ làm sau.");
//             }}
//           >
//             Sự kiện của tôi
//           </a>
//           <a className="home-nav__link" href="#sap-dien-ra">
//             Sắp diễn ra
//           </a>
//           <a
//             className="home-nav__link"
//             href="#tro-giup"
//             onClick={(e) => {
//               e.preventDefault();
//               alert("Demo: Trợ giúp/FAQ sẽ làm sau.");
//             }}
//           >
//             Trợ giúp
//           </a>
//         </nav>
//       </div>

//       <div className="home-header__right">
//         {!token ? (
//           <div className="home-auth">
//             <Link className="home-btn home-btn--ghost" to="/login">
//               Đăng nhập
//             </Link>
//             <Link className="home-btn home-btn--primary" to="/signup">
//               Đăng ký
//             </Link>
//           </div>
//         ) : (
//           <div className="nav-userWrap" ref={wrapRef}>
//             {/* Pill chỉ hiển thị trạng thái (KHÔNG CLICK) */}
//             <div className="nav-rolePill" aria-label="Trạng thái tài khoản">
//               <span className="nav-roleDot" aria-hidden="true" />
//               <span className="nav-roleText">{nhanVaiTro}</span>

//             </div>

//             {/* ✅ Chỉ bấm ô tròn (avatar) mới mở menu */}
//             <button
//               type="button"
//               className="nav-avatarBtn"
//               onClick={() => setMoMenu((v) => !v)}
//               aria-label="Mở menu tài khoản"
//               aria-haspopup="menu"
//               aria-expanded={moMenu}
//             >
//               <span className="nav-avatarStatus" aria-hidden="true" />
//             </button>

//             {moMenu ? (
//               <div className="nav-menu" role="menu" aria-label="Menu tài khoản">

//                 <Link
//                   to="/user"
//                   className="nav-menuItem"
//                   role="menuitem"
//                   onClick={chonMuc}>
//                     Hồ sơ
//                 </Link>

//                 <button
//                   className="nav-menuItem"
//                   type="button"
//                   role="menuitem"
//                   onClick={() => chonMuc(() => alert("Demo: Trang “Sự kiện của tôi” sẽ làm sau."))}
//                 >
//                   Sự kiện của tôi
//                 </button>

//                 <button
//                   className="nav-menuItem"
//                   type="button"
//                   role="menuitem"
//                   onClick={() => chonMuc(() => alert("Demo: Trang “Lịch sử vé” sẽ làm sau."))}
//                 >
//                   Lịch sử vé
//                 </button>

//                 <button
//                   className="nav-menuItem nav-menuItem--danger"
//                   type="button"
//                   role="menuitem"
//                   onClick={() => chonMuc(onLogout)}
//                 >
//                   Đăng xuất
//                 </button>

//                 <div className="nav-divider" />

//                 {role !== "organizer" ? (
//                   <button
//                     className="nav-menuItem"
//                     type="button"
//                     role="menuitem"
//                     onClick={() => chonMuc(() => alert("Demo: Đăng ký làm Nhà tổ chức sẽ làm sau."))}
//                   >
//                     Đăng ký làm Nhà tổ chức
//                   </button>
//                 ) : (
//                   <div className="nav-menuHint">Bạn đang là Nhà tổ chức</div>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }

import "./NavBar.css";

import bkLogo from "../../assets/bklogo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

function normalizeRole(role) {
  const r = String(role || "").trim().toLowerCase();
  // hỗ trợ cả uppercase từ backend: "CUSTOMER", "ORGANIZER", "ADMIN"
  if (r === "customer" || r === "khachhang" || r === "khách hàng" || r === "khach") return "customer";
  if (r === "organizer" || r === "nhatochuc" || r === "nhà tổ chức") return "organizer";
  if (r === "admin" || r === "quantri" || r === "quản trị") return "admin";
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
  return parts
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .join("") || s[0].toUpperCase();
}

export function NavBar({ token, role, onLogout, avatarUrl, displayName }) {
  const [moMenu, setMoMenu] = useState(false);
  const wrapRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const roleKey = useMemo(() => normalizeRole(role), [role]);
  const nhanVaiTro = useMemo(() => tenVaiTro(role), [role]);

  // ✅ Avatar: ưu tiên props, nếu không có thì lấy từ user đăng nhập (Google)
  const anhDaiDien =
    avatarUrl ||
    authUser?.avatarUrl ||
    authUser?.picture ||
    authUser?.avatar ||
    authUser?.photoURL ||
    authUser?.imageUrl ||
    "";

  const tenHienThi = displayName || authUser?.name || authUser?.email || "Người dùng";

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
    if (typeof hanhDong === "function") hanhDong();
  };

  // ✅ Về HomePage rồi scroll đến section
  const veTrangChuRoiCuon = (id) => {
    const cuon = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // nếu đang không ở HomePage thì navigate về "/" trước
    if (location.pathname !== "/") {
      navigate("/");
      // chờ HomePage render rồi cuộn (3 lần cho chắc)
      setTimeout(cuon, 120);
      setTimeout(cuon, 350);
      setTimeout(cuon, 700);
      return;
    }

    cuon();
  };

  // ✅ Trang chủ: về "/" + cuộn lên đầu
  const veTrangChu = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 120);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="home-header">
      <div className="home-header__left">
        <Link to="/" className="home-brand">
          <img className="home-brand__logo" src={bkLogo} alt="EventPass" />
          <span className="home-brand__name">EventPass</span>
        </Link>

        <nav className="home-nav" aria-label="Điều hướng chính">
          {/* ✅ Tìm sự kiện: về HomePage rồi cuộn tới #kham-pha */}
          <a
            className="home-nav__link"
            href="#kham-pha"
            onClick={(e) => {
              e.preventDefault();
              veTrangChuRoiCuon("kham-pha");
            }}
          >
            Tìm sự kiện
          </a>

          {/* ✅ Trang chủ: về HomePage */}
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
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Demo: Chức năng “Sự kiện của tôi” sẽ làm sau.");
            }}
          >
            Sự kiện của tôi
          </a>

          {/* ✅ Sắp diễn ra: về HomePage rồi cuộn tới #sap-dien-ra */}
          <a
            className="home-nav__link"
            href="#sap-dien-ra"
            onClick={(e) => {
              e.preventDefault();
              veTrangChuRoiCuon("sap-dien-ra");
            }}
          >
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

            {/* ✅ Nút tròn: hiển thị avatar Gmail nếu có */}
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
                    // nếu ảnh lỗi, xóa src để rớt về fallback
                    e.currentTarget.src = "";
                  }}
                />
              ) : (
                <span className="nav-avatarFallback">{getInitials(tenHienThi)}</span>
              )}
              <span className="nav-avatarStatus" aria-hidden="true" />
            </button>

            {moMenu ? (
              <div className="nav-menu" role="menu" aria-label="Menu tài khoản">
                <Link to="/user" className="nav-menuItem" role="menuitem" onClick={chonMuc}>
                  Hồ sơ
                </Link>

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

                {roleKey !== "organizer" ? (
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
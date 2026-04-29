import "./Footer.css";

export function Footer() {
  return (
    <footer className="home-footer" id="tro-giup">
      <div className="home-footer__inner">
        <div className="home-footer__brand">
          <div className="home-footer__brandName">EventPass</div>
          <div className="home-footer__desc">
            Nền tảng đặt vé — chọn chỗ theo thời gian thực và hỗ trợ soát vé thông minh.
          </div>
        </div>

        <div className="home-footer__col">
          <div className="home-footer__title">Liên hệ</div>
          <a className="home-footer__link" href="#" onClick={(e) => e.preventDefault()}>
            support@eventpass.vn
          </a>
          <a className="home-footer__link" href="#" onClick={(e) => e.preventDefault()}>
            (+84) 0700 000 000
          </a>
        </div>

        <div className="home-footer__col">
          <div className="home-footer__title">Giới thiệu</div>
          <a className="home-footer__link" href="#" onClick={(e) => e.preventDefault()}>
            Về chúng tôi
          </a>
          <a className="home-footer__link" href="#" onClick={(e) => e.preventDefault()}>
            Điều khoản & chính sách
          </a>
        </div>

        <div className="home-footer__col">
          <div className="home-footer__title">Kết nối</div>
          <div className="home-footer__social">
            <a className="home-footer__socialBtn" href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook">
              f
            </a>
            <a className="home-footer__socialBtn" href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
              ig
            </a>
            <a className="home-footer__socialBtn" href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn">
              in
            </a>
          </div>
        </div>
      </div>

      <div className="home-footer__bottom">
        <span>© {new Date().getFullYear()} EventPass</span>
        <span className="home-footer__mini">Mã QR động • Chọn chỗ realtime • Soát vé thông minh</span>
      </div>
    </footer>
  );
}
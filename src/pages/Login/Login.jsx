import "./Login.css";

import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

import Image from "../../assets/Red.jpg";

const DEMO_ACCOUNTS = {
  customer: { email: "customer@gmail.com", password: "12345678" },
  organizer: { email: "organizer@gmail.com", password: "123456789" },
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M44.5 20H24v8.5h11.8C34.1 34.1 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.5 0 6.5 1.3 8.9 3.4l6-6C35.2 5 29.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.2-2.7-.5-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7V11H7.1v3h2.5v8h3.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function NutMangXaHoi({ variant, label, onClick }) {
  const Icon = variant === "google" ? GoogleIcon : FacebookIcon;
  return (
    <button type="button" className={`login-social login-social--${variant}`} onClick={onClick}>
      <span className="login-social__icon" aria-hidden="true">
        <Icon />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function Login() {
  const navigate = useNavigate();

  // 2 chế độ login
  const [mode, setMode] = useState("customer"); // "customer" | "organizer"

  const [email, setEmail] = useState(localStorage.getItem("demo_email") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  // ✅ toggle hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  const tieuDe = "Chào mừng quay lại!";
  const moTa = useMemo(() => {
    return mode === "organizer" ? "Hãy tạo nên những sự kiện thật bùng nổ!" : "Đăng nhập để mở khóa trải nghiệm đặt vé!";
  }, [mode]);

  const nhanEmail = useMemo(() => {
    return mode === "organizer" ? "Email nhà tổ chức" : "Email";
  }, [mode]);

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setShowPassword(false);
    setError("");
    // Nếu muốn tự điền email theo mode thì mở dòng dưới:
    // setEmail(DEMO_ACCOUNTS[nextMode].email);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    const role = mode === "organizer" ? "organizer" : "customer";
    const expected = DEMO_ACCOUNTS[role];

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password;

    if (!inputEmail) return setError("Vui lòng nhập email.");
    if (!inputPass) return setError("Vui lòng nhập mật khẩu.");

    // ✅ Chỉ cho đăng nhập đúng 2 tài khoản demo theo role
    if (inputEmail !== expected.email || inputPass !== expected.password) {
      return setError("Sai email hoặc mật khẩu.");
    }

    // ✅ Login OK
    localStorage.setItem("demo_token", `demo_${role}_${Date.now()}`);
    localStorage.setItem("demo_role", role);

    if (remember) localStorage.setItem("demo_email", inputEmail);
    else localStorage.removeItem("demo_email");

    navigate("/");
  };

  const onSocial = (provider) => {
    // theo mockup: chỉ customer có social
    localStorage.setItem("demo_token", `demo_oauth_${provider}_${Date.now()}`);
    localStorage.setItem("demo_role", "customer");
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* CỘT TRÁI: FORM */}
        <div className="login-left">
          <div className="login-card">
            <h1 className="login-title">{tieuDe}</h1>
            <p className="login-subtitle">{moTa}</p>

            <form className="login-form" onSubmit={onSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">
                  {nhanEmail}
                </label>
                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  autoComplete="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">
                  Mật khẩu
                </label>

                <div className="login-passWrap">
                  <input
                    id="login-password"
                    className="login-input login-input--pass"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="login-row">
                <label className="login-remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {error ? <div className="login-error">{error}</div> : null}

              <button type="submit" className="login-btn login-btn--primary">
                Đăng nhập
              </button>
            </form>

            <div className="login-divider">
              <span>Hoặc</span>
            </div>

            {/* NÚT CHUYỂN CHẾ ĐỘ */}
            {mode === "customer" ? (
              <>
                <button type="button" className="login-btn login-btn--outline" onClick={() => handleSwitchMode("organizer")}>
                  Đăng nhập với tư cách Nhà tổ chức
                </button>

                {/* Customer có social */}
                <div className="login-socials">
                  <NutMangXaHoi variant="google" label="Tiếp tục với Google" onClick={() => onSocial("google")} />
                  <NutMangXaHoi variant="facebook" label="Tiếp tục với Facebook" onClick={() => onSocial("facebook")} />
                </div>
              </>
            ) : (
              <>
                <button type="button" className="login-btn login-btn--outline" onClick={() => handleSwitchMode("customer")}>
                  Đăng nhập với tư cách Khách hàng
                </button>
              </>
            )}

            <div className="login-footer">
              <span>Chưa có tài khoản?</span>
              <Link to="/signup" className="login-footer__link">
                Đăng ký tại đây
              </Link>
            </div>


          </div>
        </div>

        {/* CỘT PHẢI: ẢNH */}
        <div className="login-right" aria-hidden="true">
          <img className="login-right__img" src={Image} alt="" />
        </div>
      </div>
    </div>
  );
}
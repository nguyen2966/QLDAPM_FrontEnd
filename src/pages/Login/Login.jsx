import "./Login.css";

import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

import Image from "../../assets/Red.jpg";
import { API } from "../../api/api.js";
import { useAuth } from "../../hooks/useAuth.js";


// ─── Icon components ──────────────────────────────────────────────────────────
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

function NutMangXaHoi({ variant, label, onClick, disabled }) {
  const Icon = variant === "google" ? GoogleIcon : FacebookIcon;
  return (
    <button
      type="button"
      className={`login-social login-social--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="login-social__icon" aria-hidden="true">
        <Icon />
      </span>
      <span>{label}</span>
    </button>
  );
}

// ─── Login Component ──────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const { handleLoginData } = useAuth();

  const [mode, setMode] = useState("customer"); // "customer" | "organizer"

  const [email, setEmail] = useState(localStorage.getItem("demo_email") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const moTa = useMemo(() =>
    mode === "organizer"
      ? "Hãy tạo nên những sự kiện thật bùng nổ!"
      : "Đăng nhập để mở khóa trải nghiệm đặt vé!",
    [mode]
  );

  const nhanEmail = useMemo(() =>
    mode === "organizer" ? "Email nhà tổ chức" : "Email",
    [mode]
  );

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  // ─── Đăng nhập email/password ───────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return setError("Vui lòng nhập email.");
    if (!password) return setError("Vui lòng nhập mật khẩu.");

    setLoading(true);
    try {
      const { data } = await API.auth.login({ email: trimmedEmail, password });
      handleLoginData(data.data); // { user, accessToken }

      if (remember) localStorage.setItem("demo_email", trimmedEmail);
      else localStorage.removeItem("demo_email");

      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Social Login helpers ────────────────────────────────────────────────────
  const handleSocialLoginSuccess = async (token, provider) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await API.auth.loginSocial(token, provider);
      handleLoginData(data.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || `Đăng nhập ${provider} thất bại.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: ({ access_token }) => handleSocialLoginSuccess(access_token, "google"),
    onError: () => setError("Đăng nhập Google thất bại."),
  });

  // Facebook: dùng FB.login từ Facebook JS SDK (load sẵn trong index.html)
  const loginWithFacebook = () => {
    // console.log("window.FB:", window.FB);
    // console.log("window._fbInitialized:", window._fbInitialized);
    // console.log("FB.getAuthResponse:", window.FB?.getAuthResponse?.());

    if (!window._fbInitialized) {
      setError("Facebook SDK chưa sẵn sàng. Vui lòng thử lại.");
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          handleSocialLoginSuccess(response.authResponse.accessToken, "facebook");
        } else {
          setError("Đăng nhập Facebook bị hủy.");
        }
      },
      { scope: "email,public_profile" }
    );
  };



  return (
    <div className="login-page">
      <div className="login-shell">
        {/* CỘT TRÁI: FORM */}
        <div className="login-left">
          <div className="login-card">
            <h1 className="login-title">Chào mừng quay lại!</h1>
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? 
                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg> : 
                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>}
                  </button>
                </div>
              </div>

              <div className="login-row">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-btn login-btn--primary"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="login-divider">
              <span>Hoặc</span>
            </div>

            {mode === "customer" ? (
              <>
                {/* <button
                  type="button"
                  className="login-btn login-btn--outline"
                  onClick={() => handleSwitchMode("organizer")}
                  disabled={loading}
                >
                  Đăng nhập với tư cách Nhà tổ chức
                </button> */}

                {/* Social login chỉ dành cho customer */}
                <div className="login-socials">
                  <NutMangXaHoi
                    variant="google"
                    label="Tiếp tục với Google"
                    onClick={loginWithGoogle}
                    disabled={loading} />
                  <NutMangXaHoi
                    variant="facebook"
                    label="Tiếp tục với Facebook"
                    onClick={loginWithFacebook}
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                className="login-btn login-btn--outline"
                onClick={() => handleSwitchMode("customer")}
                disabled={loading}
              >
                Đăng nhập với tư cách Khách hàng
              </button>
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
import "./Signup.css";

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
      className={`signup-social signup-social--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="signup-social__icon" aria-hidden="true">
        <Icon />
      </span>
      <span>{label}</span>
    </button>
  );
}

// ─── Signup Component ─────────────────────────────────────────────────────────
export function Signup() {
  const navigate = useNavigate();
  const { handleLoginData } = useAuth();

  const [mode, setMode] = useState("customer");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Customer fields
  const [cEmail, setCEmail] = useState("");
  const [cName, setCName]   = useState("");
  const [cPass, setCPass]   = useState("");
  const [cPass2, setCPass2] = useState("");
  const [cPhone, setCPhone] = useState("");

  // Organizer fields
  const [oEmail, setOEmail] = useState("");
  const [oName, setOName]   = useState("");
  const [oPhone, setOPhone] = useState("");
  const [oPass, setOPass]   = useState("");
  const [oPass2, setOPass2] = useState("");
  const [oAgree, setOAgree] = useState(false);

  const title = useMemo(() =>
    mode === "organizer" ? "Đưa sự kiện của bạn đến gần hơn." : "Bắt đầu thôi!",
    [mode]
  );

  const subtitle = useMemo(() =>
    mode === "organizer"
      ? "Được hơn 5.000+ nhà tổ chức tin dùng"
      : "Mở ra thế giới giải trí chỉ với vài bước",
    [mode]
  );

  const validateEmail = (v) => /\S+@\S+\.\S+/.test(v);

  // ─── Đăng ký Customer ────────────────────────────────────────────────────────
  const onSubmitCustomer = async (e) => {
    e.preventDefault();
    setError("");

    if (!cEmail.trim())          return setError("Vui lòng nhập email.");
    if (!validateEmail(cEmail))  return setError("Email không đúng định dạng.");
    if (!cName.trim())           return setError("Vui lòng nhập tên.");
    if (!cPass)                  return setError("Vui lòng nhập mật khẩu.");
    if (cPass.length < 8)        return setError("Mật khẩu phải có ít nhất 8 ký tự.");
    if (cPass2 !== cPass)        return setError("Xác nhận mật khẩu không khớp.");

    setLoading(true);
    try {
      await API.auth.register({
        email:    cEmail.trim().toLowerCase(),
        password: cPass,
        name:     cName.trim(),
        phoneNumber:  cPhone,
        role:     "CUSTOMER",
      });

      // Đăng ký xong → tự đăng nhập luôn
      const { data } = await API.auth.login({
        email:    cEmail.trim().toLowerCase(),
        password: cPass,
      });
      handleLoginData(data.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Đăng ký Organizer ───────────────────────────────────────────────────────
  const onSubmitOrganizer = async (e) => {
    e.preventDefault();
    setError("");

    if (!oEmail.trim())          return setError("Vui lòng nhập email.");
    if (!validateEmail(oEmail))  return setError("Email không đúng định dạng.");
    if (!oName.trim())           return setError("Vui lòng nhập tên.");
    if (!oPhone.trim())          return setError("Vui lòng nhập số điện thoại.");
    if (!oPass)                  return setError("Vui lòng nhập mật khẩu.");
    if (oPass.length < 8)        return setError("Mật khẩu phải có ít nhất 8 ký tự.");
    if (oPass2 !== oPass)        return setError("Xác nhận mật khẩu không khớp.");
    if (!oAgree)                 return setError("Vui lòng đồng ý điều khoản.");

    setLoading(true);
    try {
      await API.auth.register({
        email:    oEmail.trim().toLowerCase(),
        password: oPass,
        name:     oName.trim(),
        phoneNumber:  oPhone,
        role:     "ORGANIZER",
      });

      // Đăng ký xong → tự đăng nhập luôn
      const { data } = await API.auth.login({
        email:    oEmail.trim().toLowerCase(),
        password: oPass,
      });
      handleLoginData(data.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Social Login (chỉ Customer) ─────────────────────────────────────────────
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
    onError:   () => setError("Đăng nhập Google thất bại."),
  });

  const loginWithFacebook = () => {
    if (!window.FB) {
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
    <div className="signup-page">
      <div className="signup-shell">
        {/* ẢNH BÊN TRÁI */}
        <div className="signup-left" aria-hidden="true">
          <img className="signup-left__img" src={Image} alt="" />
        </div>

        {/* FORM BÊN PHẢI */}
        <div className="signup-right">
          <div className="signup-card">
            {mode === "customer" ? (
              <button
                className="signup-switch signup-switch--right"
                type="button"
                onClick={() => { setMode("organizer"); setError(""); }}
                disabled={loading}
              >
                Đăng ký làm Nhà tổ chức &nbsp;›
              </button>
            ) : (
              <button
                className="signup-switch signup-switch--left"
                type="button"
                onClick={() => { setMode("customer"); setError(""); }}
                disabled={loading}
              >
                ‹&nbsp; Đăng ký khách hàng
              </button>
            )}

            <h1 className="signup-title">{title}</h1>
            <p className="signup-subtitle">{subtitle}</p>

            {mode === "customer" ? (
              <form className="signup-form" onSubmit={onSubmitCustomer}>
                <div className="signup-field">
                  <label className="signup-label" htmlFor="c-email">Email</label>
                  <input
                    id="c-email" className="signup-input" type="email"
                    placeholder="Nhập email" value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)} disabled={loading}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="c-name">Họ và tên</label>
                  <input
                    id="c-name" className="signup-input" type="text"
                    placeholder="Nhập họ và tên" value={cName}
                    onChange={(e) => setCName(e.target.value)} disabled={loading}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="c-phone">Số điện thoại</label>
                  <input
                    id="c-phone" className="signup-input" type="text"
                    placeholder="Nhập số điện thoại" value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)} disabled={loading}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="c-pass">Mật khẩu</label>
                  <input
                    id="c-pass" className="signup-input" type="password"
                    placeholder="Nhập mật khẩu" value={cPass}
                    onChange={(e) => setCPass(e.target.value)} disabled={loading}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="c-pass2">Xác nhận mật khẩu</label>
                  <input
                    id="c-pass2" className="signup-input" type="password"
                    placeholder="Nhập lại mật khẩu" value={cPass2}
                    onChange={(e) => setCPass2(e.target.value)} disabled={loading}
                  />
                </div>

                {error && <div className="signup-error">{error}</div>}

                <button type="submit" className="signup-btn" disabled={loading}>
                  {loading ? "Đang đăng ký..." : "Tiếp tục"}
                </button>

                <div className="signup-divider"><span>Hoặc</span></div>

                <div className="signup-socials">
                  <NutMangXaHoi variant="google"   label="Tiếp tục với Google"   onClick={loginWithGoogle}   disabled={loading} />
                  <NutMangXaHoi variant="facebook" label="Tiếp tục với Facebook" onClick={loginWithFacebook} disabled={loading} />
                </div>

                <div className="signup-footer">
                  <span>Đã có tài khoản?</span>
                  <Link className="signup-footer__link" to="/login">Đăng nhập</Link>
                </div>
              </form>
            ) : (
              <form className="signup-form" onSubmit={onSubmitOrganizer}>
                <div className="signup-field">
                  <label className="signup-label" htmlFor="o-email">Email</label>
                  <input
                    id="o-email" className="signup-input" type="email"
                    placeholder="Nhập email" value={oEmail}
                    onChange={(e) => setOEmail(e.target.value)} disabled={loading}
                  />
                </div>

                <div className="signup-grid2">
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="o-name">Họ và tên</label>
                    <input
                      id="o-name" className="signup-input" type="text"
                      placeholder="Nhập tên" value={oName}
                      onChange={(e) => setOName(e.target.value)} disabled={loading}
                    />
                  </div>
                  <div className="signup-field">
                    <label className="signup-label" htmlFor="o-phone">Số điện thoại</label>
                    <input
                      id="o-phone" className="signup-input" type="tel"
                      placeholder="Nhập SĐT" value={oPhone}
                      onChange={(e) => setOPhone(e.target.value)} disabled={loading}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="o-pass">Mật khẩu</label>
                  <input
                    id="o-pass" className="signup-input" type="password"
                    placeholder="Nhập mật khẩu" value={oPass}
                    onChange={(e) => setOPass(e.target.value)} disabled={loading}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="o-pass2">Xác nhận mật khẩu</label>
                  <input
                    id="o-pass2" className="signup-input" type="password"
                    placeholder="Nhập lại mật khẩu" value={oPass2}
                    onChange={(e) => setOPass2(e.target.value)} disabled={loading}
                  />
                </div>

                <label className="signup-agree">
                  <input
                    type="checkbox" checked={oAgree}
                    onChange={(e) => setOAgree(e.target.checked)} disabled={loading}
                  />
                  <span>Tôi đã đọc và đồng ý điều khoản &amp; chính sách</span>
                </label>

                {error && <div className="signup-error">{error}</div>}

                <button type="submit" className="signup-btn" disabled={loading}>
                  {loading ? "Đang đăng ký..." : "Tạo sự kiện đầu tiên"}
                </button>

                <div className="signup-footer">
                  <span>Đã có tài khoản?</span>
                  <Link className="signup-footer__link" to="/login">Đăng nhập</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
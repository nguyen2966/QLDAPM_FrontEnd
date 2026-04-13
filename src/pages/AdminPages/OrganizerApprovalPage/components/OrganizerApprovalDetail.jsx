import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ApproveOrRejectModal } from "./ApproveOrRejectModal";
import "../OrganizerApproval.css";
import { API } from "../../../../api/api";
import { toast } from "react-toastify";

/* ── Label hồ sơ hoàn chỉnh ── */
function ProfileBadge({ isProfileComplete }) {
  return (
    <span
      className={`oa-detail__badge ${
        isProfileComplete ? "oa-detail__badge--complete" : "oa-detail__badge--incomplete"
      }`}
    >
      {isProfileComplete ? "Đã hoàn chỉnh" : "Chưa hoàn chỉnh"}
    </span>
  );
}

export const OrganizerApprovalDetail = () => {
  const { userId }     = useParams();
  const { state }      = useLocation();   // { organizer } được truyền qua navigate
  const navigate       = useNavigate();

  /* Dữ liệu nhà tổ chức – ưu tiên từ location.state, fallback fetch */
  const [organizer, setOrganizer]     = useState(state?.organizer || null);
  const [loadingPage, setLoadingPage] = useState(!state?.organizer);
  const [pageError, setPageError]     = useState("");

  /* Modal */
  const [modalMode, setModalMode]     = useState(null); // "approve" | "reject" | null
  const [submitting, setSubmitting]   = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  };

  /* Nếu không có state thì tự fetch (deep link / refresh) */
  useEffect(() => {
    if (organizer) return;

    const fetchDetail = async () => {
      setLoadingPage(true);
      try {
        const res = await API.admin.getDisapprovedOrganizers();
        const data = res.data;

        if (data.status === "success") {
          const found = (data.data || []).find(
            (o) => String(o.userId) === String(userId)
          );
          if (found) {
            setOrganizer(found);
          } else {
            setPageError("Không tìm thấy nhà tổ chức này hoặc đã được xử lý.");
          }
        } else {
          toast.error("Gặp lỗi khi tải danh sách người dùng!");
          throw new Error(data.message);
        }
      } catch (err) {
        setPageError(err.message);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchDetail();
  }, [userId, organizer]);

  /* ── Phê duyệt ── */
  const handleApprove = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await API.admin.approvedOrganizer(organizer.userId)

      const data = res.data;

      if (data.status === "success") {
        toast.success("Nhà tổ chức #" + organizer.userId + " đã được phê duyệt thành công!. Đưa admin về trang quản lý.");
        setModalMode(null);
        setTimeout(() => navigate("/admin/organizer"), 3000);
      } else {
        toast.error("Phê duyệt cho nhà tổ chức này thất bại");
        throw new Error(data.message || "Phê duyệt thất bại.");
      }
    } catch (err) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      setModalMode(null);
    } finally {
      setSubmitting(false);
    }
  }, [organizer, navigate]);

  /* ── Từ chối (Hiện thời không có API phục vụ cho mục đích này)── */
  const handleReject = useCallback(async (reason) => {
    setSubmitting(true);
    try {
      /*
       * TODO: Khi backend cung cấp endpoint từ chối, thay thế block dưới:
       *
       * const res = await fetch(`${API_BASE}/admin/reject-organizer`, {
       *   method: "PUT",
       *   headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
       *   body: JSON.stringify({ organizerId: organizer.userId, reason }),
       * });
       */

      /* Tạm thời giả lập delay */
      await new Promise((r) => setTimeout(r, 800));

      showToast("Đã từ chối và ghi nhận lí do.", "success");
      setModalMode(null);
      setTimeout(() => navigate("/admin/organizers"), 1600);
    } catch (err) {
      showToast(err.message, "error");
      setModalMode(null);
    } finally {
      setSubmitting(false);
    }
  }, [organizer, navigate]);

  /* ── Phân tích URL giấy phép ── */
  const licenseUrl = organizer?.businessLicenseUrl || null; // websiteUrl tạm dùng, thay bằng field đúng khi có
  const licenseIsImage = licenseUrl && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(licenseUrl);
  const licenseIsPDF   = licenseUrl && /\.pdf(\?.*)?$/i.test(licenseUrl);

  const displayName  = organizer?.name    || `Nhà tổ chức #${organizer?.userId}`;
  const displayEmail = organizer?.email   || null;
  const displayPhone = organizer?.phone   || null;

  /* ── Loading / Error states ── */
  if (loadingPage) {
    return (
      <div className="oa-page">
        <div className="oa-empty">
          <div className="oa-empty__icon" style={{ fontSize: 36 }}>⏳</div>
          <p className="oa-empty__text">Đang tải thông tin…</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="oa-page">
        <div className="oa-empty">
          <div className="oa-empty__icon"><svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 20H22L12 2Z" fill="#e04848" stroke="#000" stroke-width="2"/>
  <line x1="12" y1="8" x2="12" y2="13" stroke="#000" stroke-width="2"/>
  <circle cx="12" cy="17" r="1.5" fill="#000"/>
</svg></div>
          <p className="oa-empty__text">{pageError}</p>
          <button
            className="home-btn home-btn--ghost"
            style={{ margin: "14px auto 0" }}
            onClick={() => navigate("/admin/organizers")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="oa-page">
      {/* Breadcrumb */}
      <nav className="oa-breadcrumb" aria-label="Breadcrumb">
        <a href="/admin">Quản trị viên</a>
        <span className="oa-breadcrumb__sep">|</span>
        <a href="/admin/organizer">Quản lí Nhà tổ chức</a>
        <span className="oa-breadcrumb__sep">|</span>
        <span className="oa-breadcrumb__current">Chi tiết giấy phép kinh doanh</span>
      </nav>

      <div className="oa-detail">
        {/* ── LEFT: Thông tin nhà tổ chức ── */}
        <aside className="oa-detail__left">
          <div className="oa-detail__info-card">
            <div className="oa-detail__info-head">
              <div>
                <h2 className="oa-detail__info-title">Thông tin nhà tổ chức</h2>
                <div className="oa-detail__info-sub">Hồ sơ doanh nghiệp</div>
              </div>
            </div>

            {/* Avatar + Tên */}
            <div className="oa-detail__avatar-row">
              <div className="oa-detail__avatar" aria-hidden="true">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <h3 className="oa-detail__organizer-name">{displayName}</h3>
            </div>

            {/* Chi tiết */}
            <div className="oa-detail__info-rows">
              {displayEmail && (
                <div className="oa-detail__info-row">
                  <span className="oa-detail__info-label">Email</span>
                  <span className="oa-detail__info-value">{displayEmail}</span>
                </div>
              )}

              {displayPhone && (
                <div className="oa-detail__info-row">
                  <span className="oa-detail__info-label">Số điện thoại</span>
                  <span className="oa-detail__info-value">{displayPhone}</span>
                </div>
              )}

              {organizer?.taxCode && (
                <div className="oa-detail__info-row">
                  <span className="oa-detail__info-label">Mã số thuế</span>
                  <span className="oa-detail__info-value">{organizer.taxCode}</span>
                </div>
              )}

              {organizer?.websiteUrl && (
                <div className="oa-detail__info-row">
                  <span className="oa-detail__info-label">Website</span>
                  <span className="oa-detail__info-value">
                    <a href={organizer.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {organizer.websiteUrl}
                    </a>
                  </span>
                </div>
              )}

              <div className="oa-detail__info-row">
                <span className="oa-detail__info-label">Hồ sơ</span>
                <ProfileBadge isProfileComplete={organizer?.businessLicenseUrl} />
              </div>

              <div className="oa-detail__info-row">
                <span className="oa-detail__info-label">Trạng thái</span>
                <span className="oa-detail__badge oa-detail__badge--incomplete">
                  Chờ phê duyệt
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: Giấy phép + Action ── */}
        <section className="oa-detail__right">
          {/* Tài liệu giấy phép */}
          <div className="oa-detail__doc-card">
            {/* Toolbar */}
            <div className="oa-detail__doc-toolbar">
              <div className="oa-detail__doc-name">
                <span className="oa-detail__doc-icon" aria-hidden="true">📄</span>
                Giấy phép kinh doanh
              </div>
              <div className="oa-detail__doc-actions">
                {licenseUrl && (
                  <>
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="oa-btn-doc"
                    >
                      Xem trước
                    </a>
                    <a
                      href={licenseUrl}
                      download
                      className="oa-btn-doc"
                    >
                      Tải xuống
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="oa-detail__doc-preview">
              {!licenseUrl ? (
                <div className="oa-detail__doc-placeholder">
                  <div className="oa-detail__doc-placeholder-icon" aria-hidden="true">🗂</div>
                  <p className="oa-detail__doc-placeholder-text">
                    Nhà tổ chức chưa tải lên giấy phép kinh doanh.
                  </p>
                </div>
              ) : licenseIsImage ? (
                <img
                  className="oa-detail__doc-img"
                  src={licenseUrl}
                  alt="Giấy phép kinh doanh"
                />
              ) : licenseIsPDF ? (
                <iframe
                  className="oa-detail__doc-iframe"
                  src={licenseUrl}
                  title="Giấy phép kinh doanh"
                />
              ) : (
                <div className="oa-detail__doc-placeholder">
                  <div className="oa-detail__doc-placeholder-icon" aria-hidden="true">📎</div>
                  <p className="oa-detail__doc-placeholder-text">
                    Không thể xem trước tệp này.{" "}
                    <a href={licenseUrl} target="_blank" rel="noopener noreferrer">
                      Mở trong tab mới
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="oa-detail__action-bar">
            {/* <button
              className="oa-btn-reject"
              type="button"
              onClick={() => setModalMode("reject")}
              disabled={submitting}
            >
              ✕ TỪ CHỐI
            </button> */}
            <button
              className="oa-btn-approve"
              type="button"
              onClick={() => setModalMode("approve")}
              disabled={submitting}
            >
              DUYỆT NHÀ TỔ CHỨC
            </button>
          </div>
        </section>
      </div>

      {/* Modal */}
      <ApproveOrRejectModal
        isOpen={modalMode !== null}
        mode={modalMode || "approve"}
        organizer={organizer}
        loading={submitting}
        onConfirm={modalMode === "approve" ? handleApprove : handleReject}
        onClose={() => !submitting && setModalMode(null)}
      />
    </div>
  );
}
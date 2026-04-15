import { useEffect, useRef, useState } from "react";

/**
 * ApproveOrRejectModal
 *
 * Props:
 *  - isOpen        {boolean}
 *  - mode          {"approve" | "reject"}
 *  - organizer     {object}  – dữ liệu nhà tổ chức hiện tại
 *  - loading       {boolean} – đang xử lý API
 *  - onConfirm     (reason?: string) => void
 *  - onClose       () => void
 */
export function ApproveOrRejectModal({
  isOpen,
  mode = "reject",
  organizer,
  loading = false,
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef(null);

  /* Reset mỗi khi mở lại modal */
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setTouched(false);
      /* Tự động focus textarea khi mode reject */
      if (mode === "reject") {
        setTimeout(() => textareaRef.current?.focus(), 80);
      }
    }
  }, [isOpen, mode]);

  /* Đóng bằng Escape */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isReject = mode === "reject";
  const reasonError = isReject && touched && reason.trim().length === 0;

  const handleConfirm = () => {
    if (isReject) {
      setTouched(true);
      if (reason.trim().length === 0) return;
    }
    onConfirm(isReject ? reason.trim() : undefined);
  };

  const displayName   = organizer?.name       || `Nhà tổ chức #${organizer?.userId}`;
  const displayEmail  = organizer?.email       || "—";
  const displayPhone  = organizer?.phone       || "—";
  const displayTax    = organizer?.taxCode     || "—";

  return (
    <div
      className="oa-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oa-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="oa-modal">
        {/* Header */}
        <div className="oa-modal__header">
          <h2 className="oa-modal__title" id="oa-modal-title">
            {isReject ? "TỪ CHỐI GIẤY PHÉP" : "XÁC NHẬN DUYỆT"}
          </h2>
          <button
            className="oa-modal__close"
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="oa-modal__body">
          {/* Thông tin nhà tổ chức */}
          <div className="oa-modal__organizer-info">
            <p className="oa-modal__organizer-name">{displayName}</p>
            <div className="oa-modal__organizer-detail">
              {displayEmail !== "—" && <div>Email: {displayEmail}</div>}
              {displayPhone !== "—" && <div>SĐT: {displayPhone}</div>}
              {displayTax  !== "—" && <div>Mã số thuế: {displayTax}</div>}
            </div>
          </div>

          {/* Lí do từ chối – chỉ hiện khi mode = reject */}
          {isReject && (
            <div className="oa-modal__field">
              <label className="oa-modal__label">
                Lí do từ chối
                <span className="oa-modal__required">*</span>
              </label>
              <textarea
                ref={textareaRef}
                className="oa-modal__textarea"
                placeholder="Vui lòng nhập lí do từ chối"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={loading}
              />
              {reasonError && (
                <p className="oa-modal__error">Vui lòng nhập lí do từ chối.</p>
              )}
            </div>
          )}

          {/* Xác nhận approve */}
          {!isReject && (
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.65)", lineHeight: 1.6 }}>
              Bạn có chắc chắn muốn <strong>phê duyệt</strong> nhà tổ chức{" "}
              <strong>{displayName}</strong>? Hành động này không thể hoàn tác.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="oa-modal__footer">
          <button
            className="oa-btn-cancel"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            HỦY
          </button>

          {isReject ? (
            <button
              className="oa-btn-confirm-reject"
              type="button"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Đang xử lý…" : "XÁC NHẬN TỪ CHỐI"}
            </button>
          ) : (
            <button
              className="oa-btn-approve"
              type="button"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Đang xử lý…" : "XÁC NHẬN DUYỆT"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
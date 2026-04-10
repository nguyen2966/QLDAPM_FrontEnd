import React, { useEffect, useRef, useState } from "react";
import "./EventDetailModal.css";
import { API } from "../../../../api/api.js";
import { toast } from "react-toastify";

function formatCurrency(num) {
  return Number(num).toLocaleString("vi-VN") + "đ";
}

function formatDateTime(dateStr, timeStr) {
  const time = new Date(timeStr);
  const date = new Date(dateStr);
  const h = time.getUTCHours().toString().padStart(2, "0");
  const m = time.getUTCMinutes().toString().padStart(2, "0");
  const d = date.getUTCDate();
  const mo = date.getUTCMonth() + 1;
  const y = date.getUTCFullYear();
  return `${h}:${m}, ${d} tháng ${mo}, ${y}`;
}

function formatDuration(minutes) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
}

/* ─── Edit permission logic ───────────────────────────── */
// PENDING      → can edit everything
// APPROVED / IN_PROGRESS → can only edit status
// ENDED / CANCLED / REJECTED → read-only
const EDIT_PERMISSION = {
  PENDING: "full",
  APPROVED: "status-only",
  IN_PROGRESS: "status-only",
  ENDED: "readonly",
  CANCLED: "readonly",
  REJECTED: "readonly",
};

const PERMISSION_NOTICE = {
  full: {
    cls: "notice-full",
    icon: "✏️",
    text: "Do đơn đang trong thời gian chờ, Bạn có thể chỉnh sửa toàn bộ thông tin sự kiện này.",
  },
  "status-only": {
    cls: "notice-status-only",
    icon: "⚠️",
    text: "Sự kiện đã được duyệt. Bạn chỉ có thể thay đổi trạng thái.",
  },
  readonly: {
    cls: "notice-readonly",
    icon: "🔒",
    text: "Sự kiện đã kết thúc / bị hủy / bị từ chối. Không thể chỉnh sửa.",
  },
};

const STATUS_OPTIONS = [
  { key: "APPROVED", label: "Đã được duyệt" },
  { key: "IN_PROGRESS", label: "Go Live sự kiện" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "ENDED", label: "Kết thúc" },
  { key: "CANCLED", label: "Hủy sự kiện" },
  { key: "REJECTED", label: "Bị từ chối" },
];

/* ─── Component ───────────────────────────────────────── */
export function EventDetailModal({ eventId, initialStatus, onClose, onSaved }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  // editable fields
  const [form, setForm] = useState({});
  const overlayRef = useRef(null);

  /* fetch */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.event.getMyEventById(eventId);
        if (!cancelled) {
          const d = res.data?.data;
          setDetail(d);
          setForm({
            eventName: d.eventName ?? "",
            genre: d.genre ?? "",
            description: d.description ?? "",
            status: d.status ?? initialStatus,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin sự kiện");
        if (!cancelled) onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  /* close on overlay click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (form.status === "CANCLED" || form.status === "ENDED") {
      setConfirmInput("");
      setConfirmOpen(true);
      return;
    }
    await doSave();
  };
  const doSave = async () => {
    setSaving(true);
    try {
      const permission = EDIT_PERMISSION[detail.status] ?? "readonly";
      if (permission === "full") {
        await API.event.update(eventId, form);
      } else if (permission === "status-only") {
        await API.event.update(eventId, { status: form.status });
      }
      toast.success("Cập nhật sự kiện thành công");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const permission = detail
    ? (EDIT_PERMISSION[detail.status] ?? "readonly")
    : null;
  const notice = permission ? PERMISSION_NOTICE[permission] : null;
  const canEdit = permission === "full" || permission === "status-only";

  return (
    <div className="edm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="edm-panel" role="dialog" aria-modal="true">
        {/* ── Header ── */}
        <div className="edm-header">
          <div className="edm-header-img">
            {detail?.eventImgUrl ? (
              <img src={detail.eventImgUrl} alt={detail.eventName} />
            ) : (
              <div className="edm-header-img-placeholder" />
            )}
          </div>
          <div className="edm-header-info">
            <div className="edm-header-top">
              <h2 className="edm-title">
                {detail?.eventName ?? "Chi tiết sự kiện"}
              </h2>
              <button className="edm-close" onClick={onClose} aria-label="Đóng">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="edm-meta-row">
              {detail?.genre && (
                <span className="edm-genre-tag">{detail.genre}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Permission notice ── */}
        {notice && (
          <div className={`edm-permission-notice ${notice.cls}`}>
            <span>{notice.icon}</span>
            <span>{notice.text}</span>
          </div>
        )}

        <div className="edm-divider" />

        {/* ── Body ── */}
        <div className="edm-body">
          {loading ? (
            <div className="edm-loading">
              <div className="edm-spinner" />
              <span>Đang tải thông tin...</span>
            </div>
          ) : (
            <>
              {/* ── Time & basic info ── */}
              <div>
                <p className="edm-section-label">Thông tin tổ chức</p>
                <div className="edm-info-grid">
                  <div className="edm-info-item">
                    <span className="edm-info-key">Thời gian diễn ra</span>
                    <span className="edm-info-val">
                      {formatDateTime(detail.dateToStart, detail.timeToStart)}
                    </span>
                  </div>
                  <div className="edm-info-item">
                    <span className="edm-info-key">Thời lượng</span>
                    <span className="edm-info-val">
                      {formatDuration(detail.duration)}
                    </span>
                  </div>
                  <div className="edm-info-item">
                    <span className="edm-info-key">Thời gian mở bán vé</span>
                    <span className="edm-info-val">
                      {detail.timeToRelease
                        ? formatDateTime(
                            detail.timeToRelease,
                            detail.timeToRelease,
                          )
                        : "—"}
                    </span>
                  </div>
                  <div className="edm-info-item">
                    <span className="edm-info-key">Mã sự kiện</span>
                    <span className="edm-info-val">
                      {detail.eventCode ??
                        `#EVN${String(detail.eventId).padStart(3, "0")}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Venue ── */}
              <div>
                <p className="edm-section-label">Địa điểm</p>
                <div className="edm-info-grid">
                  <div className="edm-info-item">
                    <span className="edm-info-key">Tên địa điểm</span>
                    <span className="edm-info-val">
                      {detail.venue?.venueName ?? "—"}
                    </span>
                  </div>
                  <div className="edm-info-item">
                    <span className="edm-info-key">Sức chứa</span>
                    <span className="edm-info-val">
                      {detail.venue?.capacity
                        ? detail.venue.capacity.toLocaleString("vi-VN") + " chỗ"
                        : "—"}
                    </span>
                  </div>
                  <div className="edm-info-item full-width">
                    <span className="edm-info-key">Địa chỉ</span>
                    <span className="edm-info-val">
                      {detail.venue?.address ?? "—"}
                      {detail.venue?.mapUrl && (
                        <>
                          {" · "}
                          <a
                            href={detail.venue.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem bản đồ ↗
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Ticket classes ── */}
              {detail.ticketClasses?.length > 0 && (
                <div>
                  <p className="edm-section-label">
                    Hạng vé ({detail.ticketClasses.length})
                  </p>
                  <div className="edm-tickets-list">
                    {detail.ticketClasses.map((tc) => (
                      <div className="edm-ticket-item" key={tc.ticketClassId}>
                        <div
                          className="edm-ticket-dot"
                          style={{
                            background: tc.color ?? "var(--me-red-500)",
                          }}
                        />
                        <div className="edm-ticket-info">
                          <div className="edm-ticket-name">{tc.className}</div>
                          <div className="edm-ticket-type">{tc.type}</div>
                        </div>
                        <div className="edm-ticket-right">
                          <div className="edm-ticket-price">
                            {formatCurrency(tc.price)}
                          </div>
                          <div className="edm-ticket-quota">
                            {tc.quota.toLocaleString("vi-VN")} vé
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Description ── */}
              {detail.description && (
                <div>
                  <p className="edm-section-label">Mô tả</p>
                  <p className="edm-description">{detail.description}</p>
                </div>
              )}

              {/* ── Edit section ── */}
              {editMode && (
                <div>
                  <p className="edm-section-label">Chỉnh sửa</p>

                  {permission === "full" && (
                    <div className="edm-edit-grid">
                      <div
                        className="edm-field-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label className="edm-field-label">Tên sự kiện</label>
                        <input
                          className="edm-field-input"
                          value={form.eventName}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              eventName: e.target.value,
                            }))
                          }
                          placeholder="Tên sự kiện"
                        />
                      </div>
                      <div className="edm-field-group">
                        <label className="edm-field-label">Thể loại</label>
                        <input
                          className="edm-field-input"
                          value={form.genre}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, genre: e.target.value }))
                          }
                          placeholder="VD: EDM, Pop, Rock..."
                        />
                      </div>
                      <div className="edm-field-group">
                        <label className="edm-field-label">Trạng thái</label>
                        <select
                          className="edm-status-select"
                          value={form.status}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, status: e.target.value }))
                          }
                        >
                          {STATUS_OPTIONS.filter((o) =>
                            ["PENDING", "CANCLED"].includes(o.key),
                          ).map((o) => (
                            <option key={o.key} value={o.key}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        className="edm-field-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label className="edm-field-label">Mô tả</label>
                        <textarea
                          className="edm-field-input edm-field-textarea"
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Mô tả sự kiện..."
                        />
                      </div>
                    </div>
                  )}

                  {permission === "status-only" && (
                    <div className="edm-field-group">
                      <label className="edm-field-label">Trạng thái</label>
                      <select
                        className="edm-status-select"
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value }))
                        }
                      >
                        {STATUS_OPTIONS.filter(o => ["APPROVED", "IN_PROGRESS", "ENDED", "CANCLED"].includes(o.key)).map((o) => (
                          <option key={o.key} value={o.key}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && (
          <div className="edm-footer">
            <button className="edm-btn edm-btn-ghost" onClick={onClose}>
              Đóng
            </button>
            {canEdit && !editMode && (
              <button
                className="edm-btn edm-btn-primary"
                onClick={() => setEditMode(true)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
                {permission === "status-only" ? "Đổi trạng thái" : "Chỉnh sửa"}
              </button>
            )}
            {canEdit && editMode && (
              <>
                <button
                  className="edm-btn edm-btn-ghost"
                  onClick={() => {
                    setForm({
                      eventName: detail.eventName ?? "",
                      genre: detail.genre ?? "",
                      description: detail.description ?? "",
                      status: detail.status ?? initialStatus,
                    });
                    setEditMode(false);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="edm-btn edm-btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {confirmOpen && (
        <div className="edm-overlay" style={{ zIndex: 1100 }}>
          <div className="edm-panel" style={{ maxWidth: 400 }}>
            <div className="edm-header">
              <div className="edm-header-info">
                <div className="edm-header-top">
                  <h2 className="edm-title" style={{ fontSize: 16 }}>
                    {form.status === "CANCLED"
                      ? "⚠️ Xác nhận hủy sự kiện"
                      : "⚠️ Xác nhận kết thúc sự kiện"}
                  </h2>
                  <button
                    className="edm-close"
                    onClick={() => setConfirmOpen(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="edm-body" style={{ gap: 14 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--me-muted)",
                  lineHeight: 1.6,
                }}
              >
                Hành động này{" "}
                <strong style={{ color: "var(--me-ink)" }}>
                  không thể hoàn tác
                </strong>
                . Nhập{" "}
                <strong style={{ color: "var(--me-red-600)" }}>XAC_NHAN</strong>{" "}
                vào ô bên dưới để tiếp tục.
              </p>
              <div className="edm-field-group">
                <label className="edm-field-label">Xác nhận</label>
                <input
                  className="edm-field-input"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Nhập XAC_NHAN"
                  autoFocus
                />
              </div>
            </div>
            <div className="edm-footer">
              <button
                className="edm-btn edm-btn-ghost"
                onClick={() => setConfirmOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="edm-btn edm-btn-primary"
                disabled={confirmInput !== "XAC_NHAN" || saving}
                onClick={async () => {
                  setConfirmOpen(false);
                  await doSave();
                }}
              >
                {saving ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

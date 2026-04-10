import React, { useState, useRef, useEffect } from "react";
import "./EventCard.css";
import { toast } from "react-toastify";
import { EventDetailModal } from "./EventDetailModal";

// Quy tắc chỉnh sửa theo trạng thái:
// PENDING      → chỉnh sửa toàn bộ
// APPROVED / IN_PROGRESS → chỉ đổi trạng thái
// ENDED / CANCLED / REJECTED → chỉ xem
const EDIT_PERMISSION = {
  PENDING:     "full",
  APPROVED:    "status-only",
  IN_PROGRESS: "status-only",
  ENDED:       "readonly",
  CANCLED:     "readonly",
  REJECTED:    "readonly",
};

export const EventCard = ({
  ev,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
  onRefresh, // optional: callback to refetch list after saving
}) => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalEditMode, setModalEditMode] = useState(false);

  const menuRef   = useRef(null);
  const buttonRef = useRef(null);

  const permission = EDIT_PERMISSION[ev.status] ?? "readonly";

  /* close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const openDetail = () => {
    setMenuOpen(false);
    setModalEditMode(false);
    setModalOpen(true);
  };

  const openEdit = () => {
    setMenuOpen(false);
    if (permission === "readonly") {
      toast.info("Sự kiện này không thể chỉnh sửa.");
      return;
    }
    setModalEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    toast.warn("Không khuyến khích xóa sự kiện.");
  };

  return (
    <>
      <tr>
        {/* ── Event name + thumbnail ── */}
        <td>
          <div className="me-event-cell">
            <div className="me-event-thumb">
              {ev.eventImgUrl ? (
                <img src={ev.eventImgUrl} alt={ev.eventName} />
              ) : (
                <div className="me-thumb-placeholder" />
              )}
            </div>
            <div>
              <div className="me-event-name">{ev.eventName}</div>
              <div className="me-event-code">ID: {ev.eventCode}</div>
            </div>
          </div>
        </td>

        {/* ── Venue & time ── */}
        <td>
          <div className="me-venue-cell">
            <div className="me-venue-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formatDateTime(ev.dateToStart, ev.timeToStart)}
            </div>
            <div className="me-venue-loc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {ev.venue.venueName}, {ev.venue.address}
            </div>
          </div>
        </td>

        {/* ── Status ── */}
        <td>
          <span className={`me-status-badge ${getStatusClass(ev.status)}`}>
            {getStatusLabel(ev.status)}
          </span>
        </td>

        {/* ── Tickets sold ── */}
        <td>
          <div className="me-sold-cell">
            <span className="me-sold-numbers">
              {ev.ticketsSold} / {ev.totalQuota}
            </span>
            <div className="me-progress-bar">
              <div
                className="me-progress-fill"
                style={{ width: `${Math.min(ev.fillRate, 100)}%` }}
              />
            </div>
          </div>
        </td>

        {/* ── Actions dropdown ── */}
        <td>
          <div className="me-row-action-wrapper">
            <button
              ref={buttonRef}
              className={`me-row-action ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Tùy chọn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5"  r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {menuOpen && (
              <div ref={menuRef} className="me-dropdown-menu">

                {/* Xem chi tiết — always available */}
                <button className="me-dropdown-item" onClick={openDetail}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Xem chi tiết
                </button>

                {/* Chỉnh sửa — shown only when not readonly */}
                {permission !== "readonly" && (
                  <button className="me-dropdown-item" onClick={openEdit}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                    </svg>
                    {permission === "status-only"
                      ? "Đổi trạng thái"
                      : "Chỉnh sửa sự kiện"}
                  </button>
                )}

                <div className="me-dropdown-divider" />

                {/* Xóa — always shown */}
                <button className="me-dropdown-item danger" onClick={handleDelete}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Xóa sự kiện
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* ── Detail / Edit Modal ── */}
      {modalOpen && (
        <EventDetailModal
          eventId={ev.eventId}
          initialStatus={ev.status}
          onClose={() => setModalOpen(false)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
};
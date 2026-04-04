import React, { useState, useRef, useEffect } from "react";
import "./EventCard.css";
import { toast } from "react-toastify";

export const EventCard = ({
  ev,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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

  const handleAction = (callback) => {
    setMenuOpen(false);
    if (callback) callback(ev);
  };

  return (
    <tr>
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
      <td>
        <div className="me-venue-cell">
          <div className="me-venue-time">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDateTime(ev.dateToStart, ev.timeToStart)}
          </div>
          <div className="me-venue-loc">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {ev.venue.venueName}, {ev.venue.address}
          </div>
        </div>
      </td>
      <td>
        <span className={`me-status-badge ${getStatusClass(ev.status)}`}>
          {getStatusLabel(ev.status)}
        </span>
      </td>
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
      <td>
        <div className="me-row-action-wrapper">
          <button
            ref={buttonRef}
            className={`me-row-action ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Tùy chọn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          {menuOpen && (
            <div ref={menuRef} className="me-dropdown-menu">
              <button
                className="me-dropdown-item"
                onClick={() => toast.success("Xem chi tiết")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Xem chi tiết
              </button>
              <button
                className="me-dropdown-item"
                onClick={() => toast.success("Chỉnh sửa sự kiện")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
                Chỉnh sửa sự kiện
              </button>
              <div className="me-dropdown-divider" />
              <button
                className="me-dropdown-item danger"
                onClick={() => toast.success("Xóa sự kiện")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
  );
};

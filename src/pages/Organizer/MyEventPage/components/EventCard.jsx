import React from "react";
import "./EventCard.css";

export const EventCard = ({ev, formatDateTime, getStatusClass, getStatusLabel}) => {
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
        <button className="me-row-action">
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
      </td>
    </tr>
  );
};

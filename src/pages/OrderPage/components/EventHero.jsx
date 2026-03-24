import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function getEventImageSrc(eventDetail) {
  const rawImageUrl = eventDetail?.eventImgUrl || "";
  if (!rawImageUrl) return "";

  if (/^https?:\/\//i.test(rawImageUrl)) return rawImageUrl;

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export function EventHero({ eventDetail }) {
  const eventImage = useMemo(() => getEventImageSrc(eventDetail), [eventDetail]);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [eventImage]);

  return (
    <section className="order-page__hero">
      <div className="order-page__hero-main">
        <div className="order-page__hero-copy">
          <p className="order-page__eyebrow">Đặt ghế thời gian thực</p>
          <h1>{eventDetail.eventName}</h1>
          <p className="order-page__meta">
            {eventDetail.venue?.venueName || "Đang cập nhật địa điểm"} -{" "}
            {formatDate(eventDetail.dateToStart)}
          </p>
        </div>

        <div className="order-page__hero-image-card">
          {eventImage && !imageError ? (
            <img
              src={eventImage}
              alt={eventDetail.eventName}
              className="order-page__hero-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="order-page__hero-image-placeholder">Ảnh sự kiện</div>
          )}
        </div>
      </div>
    </section>
  );
}
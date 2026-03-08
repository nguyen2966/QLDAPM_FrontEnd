import { useEffect, useMemo, useState } from "react";
import { API } from "../../../../api/api.js";
import { useData } from "../../../../hooks/useData.js";

const INITIAL_FORM = {
  eventName: "",
  genre: "",
  description: "",
  dateToStart: "",
  timeToStart: "",
  timeToRelease: "",
  duration: "",
  venueId: "",
};

function taoIsoNgay(dateValue) {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();
}

function taoIsoNgayGio(dateValue, timeValue) {
  if (!dateValue || !timeValue) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

function taoIsoTuDateTimeLocal(value) {
  if (!value) return "";
  return new Date(value).toISOString();
}

export const Step1BasicInfo = ({ onDone }) => {
  const { venues, loading, events } = useData();

  const [form, setForm] = useState(INITIAL_FORM);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (bannerPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  const genreOptions = useMemo(() => {
    const currentGenres = new Set(events.map((event) => event.genre).filter(Boolean));
    ["Âm nhạc", "EDM", "Hội thảo", "Nghệ thuật", "Thể thao", "Giáo dục", "Triển lãm"].forEach(
      (genre) => currentGenres.add(genre)
    );
    return Array.from(currentGenres);
  }, [events]);

  const selectedVenue = useMemo(
    () => venues.find((venue) => String(venue.venueId) === String(form.venueId)),
    [venues, form.venueId]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePickBanner = (event) => {
    const file = event.target.files?.[0] ?? null;
    setError("");

    if (bannerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }

    if (!file) {
      setBannerFile(null);
      setBannerPreview("");
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (bannerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }

    setForm(INITIAL_FORM);
    setBannerFile(null);
    setBannerPreview("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.eventName ||
      !form.genre ||
      !form.description ||
      !form.dateToStart ||
      !form.timeToStart ||
      !form.timeToRelease ||
      !form.duration ||
      !form.venueId
    ) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (!bannerFile) {
      setError("Backend bắt buộc phải có ảnh bìa sự kiện.");
      return;
    }

    const formData = new FormData();
    formData.append("eventName", form.eventName.trim());
    formData.append("genre", form.genre);
    formData.append("description", form.description.trim());
    formData.append("dateToStart", taoIsoNgay(form.dateToStart));
    formData.append("timeToStart", taoIsoNgayGio(form.dateToStart, form.timeToStart));
    formData.append("timeToRelease", taoIsoTuDateTimeLocal(form.timeToRelease));
    formData.append("duration", String(form.duration).trim());
    formData.append("venueId", String(form.venueId).trim());
    formData.append("eventImg", bannerFile);

    setSubmitting(true);
    setError("");

    try {
      const response = await API.event.createBasicInfo(formData);

      if (response.data?.status === "success") {
        onDone?.(response.data.data.eventId);
        return;
      }

      setError("Không thể tạo thông tin cơ bản cho sự kiện.");
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi gửi dữ liệu bước 1.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-event-form" onSubmit={handleSubmit}>
      <section className="create-event-section">
        <div className="create-event-section__title-wrap">
          <h3>Thông tin chung</h3>
          <p>Nhập tên sự kiện, thể loại và mô tả ngắn.</p>
        </div>

        <div className="create-event-grid create-event-grid--two">
          <label className="create-event-field create-event-field--wide">
            <span>Tên sự kiện</span>
            <input
              type="text"
              name="eventName"
              placeholder="Ví dụ: Concert mùa hè 2026"
              value={form.eventName}
              onChange={handleChange}
            />
          </label>

          <label className="create-event-field">
            <span>Thể loại</span>
            <select name="genre" value={form.genre} onChange={handleChange}>
              <option value="">Chọn thể loại</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label className="create-event-field create-event-field--full">
            <span>Mô tả sự kiện</span>
            <textarea
              name="description"
              rows="5"
              placeholder="Mô tả ngắn về nội dung sự kiện, đối tượng tham dự, điểm nổi bật..."
              value={form.description}
              onChange={handleChange}
            />
          </label>
        </div>
      </section>

      <section className="create-event-section">
        <div className="create-event-section__title-wrap">
          <h3>Thời gian và địa điểm</h3>
          <p>Backend hiện tại không có API `GET /venues`, nên địa điểm được gợi ý từ dữ liệu sự kiện đã có.</p>
        </div>

        <div className="create-event-grid create-event-grid--two">
          <label className="create-event-field">
            <span>Ngày diễn ra</span>
            <input
              type="date"
              name="dateToStart"
              value={form.dateToStart}
              onChange={handleChange}
            />
          </label>

          <label className="create-event-field">
            <span>Giờ bắt đầu</span>
            <input
              type="time"
              name="timeToStart"
              value={form.timeToStart}
              onChange={handleChange}
            />
          </label>

          <label className="create-event-field">
            <span>Thời điểm mở bán vé</span>
            <input
              type="datetime-local"
              name="timeToRelease"
              value={form.timeToRelease}
              onChange={handleChange}
            />
          </label>

          <label className="create-event-field">
            <span>Thời lượng (phút)</span>
            <input
              type="number"
              min="1"
              name="duration"
              placeholder="180"
              value={form.duration}
              onChange={handleChange}
            />
          </label>

          {venues.length > 0 ? (
            <label className="create-event-field create-event-field--full">
              <span>Địa điểm tổ chức</span>
              <select
                name="venueId"
                value={form.venueId}
                onChange={handleChange}
                disabled={loading.venues}
              >
                <option value="">
                  {loading.venues ? "Đang tải địa điểm..." : "Chọn địa điểm"}
                </option>
                {venues.map((venue) => (
                  <option key={venue.venueId} value={venue.venueId}>
                    {venue.venueName}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="create-event-field create-event-field--full">
              <span>Mã địa điểm (venueId)</span>
              <input
                type="number"
                min="1"
                name="venueId"
                placeholder="Nhập venueId"
                value={form.venueId}
                onChange={handleChange}
              />
            </label>
          )}
        </div>

        {selectedVenue ? (
          <div className="create-event-inline-note">
            <strong>{selectedVenue.venueName}</strong>
            <span>
              {selectedVenue.address}
              {selectedVenue.capacity
                ? ` • Sức chứa: ${Number(selectedVenue.capacity).toLocaleString("vi-VN")}`
                : ""}
            </span>
          </div>
        ) : null}
      </section>

      <section className="create-event-section">
        <div className="create-event-section__title-wrap">
          <h3>Ảnh bìa sự kiện</h3>
          <p>Ảnh bìa là bắt buộc vì backend sẽ kiểm tra `eventImgUrl` sau khi upload.</p>
        </div>

        <div className="create-event-upload">
          <label className="create-event-upload__dropzone">
            <input type="file" accept="image/*" onChange={handlePickBanner} />
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Xem trước ảnh bìa"
                className="create-event-upload__preview"
              />
            ) : (
              <div className="create-event-upload__placeholder">
                <span className="create-event-upload__icon">⇪</span>
                <strong>Tải ảnh bìa sự kiện</strong>
                <p>PNG, JPG hoặc WEBP</p>
              </div>
            )}
          </label>
        </div>
      </section>

      {error ? <p className="create-event-feedback create-event-feedback--error">{error}</p> : null}

      <div className="create-event-actions">
        <button
          type="button"
          className="create-event-button create-event-button--ghost"
          onClick={resetForm}
          disabled={submitting}
        >
          Làm lại
        </button>
        <button type="submit" className="create-event-button" disabled={submitting}>
          {submitting ? "Đang tạo..." : "Tiếp tục"}
        </button>
      </div>
    </form>
  );
};
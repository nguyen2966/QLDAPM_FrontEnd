import { useMemo, useState } from "react";
import { API } from "../../../../api/api.js";
import { useData } from "../../../../hooks/useData.js";
import { getEventGenreOptions } from "../../../../constants/eventGenres.js";

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

export const Step1BasicInfo = ({ 
  eventId, // Nhận eventId. Nếu có => Update (PUT)
  form, 
  setForm, 
  bannerFile, 
  setBannerFile, 
  bannerPreview, 
  setBannerPreview, 
  onDone 
}) => {
  const { venues, loading, events } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const genreOptions = useMemo(() => getEventGenreOptions(events), [events]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const timeToStart = new Date(taoIsoNgayGio(form.dateToStart, form.timeToStart));
    const timeToRelease = new Date(taoIsoTuDateTimeLocal(form.timeToRelease));
    const now = new Date();

    if (timeToRelease >= timeToStart) {
      setError("Thời điểm mở bán phải trước thời gian bắt đầu sự kiện.");
      return;
    }
    if (timeToStart <= now) {
      setError("Thời gian bắt đầu phải lớn hơn thời điểm hiện tại.");
      return;
    }
    if (timeToRelease <= now) {
      setError("Thời điểm mở bán phải ở tương lai.");
      return;
    }
    if (
      !form.eventName || !form.genre || !form.description ||
      !form.dateToStart || !form.timeToStart || !form.timeToRelease ||
      !form.duration || !form.venueId
    ) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    // Nếu chưa tạo (không có eventId) thì BẮT BUỘC phải có ảnh. 
    // Đã tạo rồi (có eventId) thì không up ảnh cũng không sao (dùng ảnh cũ).
    if (!eventId && !bannerFile) {
      setError("Backend bắt buộc phải có ảnh bìa sự kiện khi tạo mới.");
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
    
    // Chỉ đính kèm ảnh nếu người dùng có chọn ảnh (File)
    if (bannerFile) {
      formData.append("eventImg", bannerFile);
    }

    setSubmitting(true);
    setError("");

    try {
      if (eventId) {
        // --- CHẾ ĐỘ UPDATE (PUT) ---
        await API.event.update(eventId, formData);
        onDone?.(eventId); // Giữ nguyên eventId hiện tại chuyển qua bước 2
      } else {
        // --- CHẾ ĐỘ CREATE (POST) ---
        const response = await API.event.createBasicInfo(formData);
        if (response.data?.status === "success") {
          onDone?.(response.data.data.eventId); // Truyền eventId mới tạo qua bước 2
          return;
        }
        setError("Không thể tạo thông tin cơ bản cho sự kiện.");
      }
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
                disabled={loading.venues || (eventId && form.venueId)} // Nếu đã có Layout thì có thể bị backend chặn, cẩn thận
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
            <span>{selectedVenue.address}</span>
          </div>
        ) : null}
      </section>

      <section className="create-event-section">
        <div className="create-event-section__title-wrap">
          <h3>Ảnh bìa sự kiện</h3>
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
                <strong>{eventId ? "Tải ảnh bìa mới (Tùy chọn)" : "Tải ảnh bìa sự kiện"}</strong>
                <p>PNG, JPG hoặc WEBP</p>
              </div>
            )}
          </label>
        </div>
      </section>

      {error ? <p className="create-event-feedback create-event-feedback--error">{error}</p> : null}

      <div className="create-event-actions" style={{ justifyContent: "flex-end" }}>
        <button type="submit" className="create-event-button" disabled={submitting}>
          {submitting ? "Đang lưu..." : (eventId ? "Cập nhật & Tiếp tục" : "Tiếp tục")}
        </button>
      </div>
    </form>
  );
};
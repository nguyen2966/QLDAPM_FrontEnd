import { useMemo, useState } from "react";
import { API } from "../../../../api/api.js";

const EMPTY_CLASS = {
  className: "",
  description: "",
  color: "#6d4aff",
  type: "SEATED",
  quota: "",
  price: "",
};

function taoIdTam() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function nhanLoaiVe(type) {
  return type === "STANDING" ? "Ghế đứng" : "Ghế ngồi";
}

export const Step2TicketClasses = ({ eventId, onDone, onBack }) => {
  const [draft, setDraft] = useState(EMPTY_CLASS);
  const [ticketClasses, setTicketClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalQuota = useMemo(
    () => ticketClasses.reduce((sum, item) => sum + Number(item.quota || 0), 0),
    [ticketClasses]
  );

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTicketClass = () => {
    if (!draft.className.trim() || draft.price === "" || draft.quota === "") {
      setError("Vui lòng nhập đủ tên hạng vé, số lượng và giá bán.");
      return;
    }

    setTicketClasses((prev) => [
      ...prev,
      {
        id: taoIdTam(),
        className: draft.className.trim(),
        description: draft.description.trim(),
        color: draft.color,
        type: draft.type,
        quota: Number(draft.quota),
        price: Number(draft.price),
      },
    ]);

    setDraft(EMPTY_CLASS);
    setError("");
  };

  const handleRemoveTicketClass = (id) => {
    setTicketClasses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!eventId) {
      setError("Chưa có eventId từ bước 1.");
      return;
    }

    if (!ticketClasses.length) {
      setError("Bạn cần tạo ít nhất 1 hạng vé trước khi sang bước 3.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = ticketClasses.map(
        ({ className, description, color, type, quota, price }) => ({
          className,
          description,
          color,
          type,
          quota,
          price,
        })
      );

      const response = await API.event.createTicketClasses(eventId, payload);

      if (response.data?.status === "success") {
        onDone?.();
        return;
      }

      setError("Không thể lưu hạng vé.");
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi lưu bước 2.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-event-step2" onSubmit={handleSubmit}>
      <div className="create-event-step2__layout">
        <section className="create-event-section create-event-step2__form-box">
          <div className="create-event-section__title-wrap">
            <h3>Thêm hạng vé mới</h3>
            <p>Tạo từng hạng vé ở cột trái rồi kiểm tra lại ở bảng bên phải.</p>
          </div>

          <div className="create-event-grid">
            <label className="create-event-field">
              <span>Tên hạng vé</span>
              <input
                type="text"
                name="className"
                placeholder="VIP, Phổ thông..."
                value={draft.className}
                onChange={handleDraftChange}
              />
            </label>

            <label className="create-event-field create-event-field--full">
              <span>Mô tả hạng vé</span>
              <textarea
                name="description"
                rows="4"
                placeholder="Ví dụ: Khu vực gần sân khấu, lối vào riêng, tặng kèm nước uống..."
                value={draft.description}
                onChange={handleDraftChange}
              />
            </label>

            <label className="create-event-field">
              <span>Màu hiển thị</span>
              <div className="create-event-color-input">
                <input type="color" name="color" value={draft.color} onChange={handleDraftChange} />
                <input type="text" name="color" value={draft.color} onChange={handleDraftChange} />
              </div>
            </label>

            <label className="create-event-field">
              <span>Số lượng tối đa</span>
              <input
                type="number"
                min="1"
                name="quota"
                placeholder="100"
                value={draft.quota}
                onChange={handleDraftChange}
              />
            </label>

            <label className="create-event-field">
              <span>Loại vé</span>
              <select name="type" value={draft.type} onChange={handleDraftChange}>
                <option value="SEATED">Ghế ngồi</option>
                <option value="STANDING">Ghế đứng</option>
              </select>
            </label>

            <label className="create-event-field">
              <span>Giá bán</span>
              <input
                type="number"
                min="0"
                name="price"
                placeholder="1500000"
                value={draft.price}
                onChange={handleDraftChange}
              />
            </label>
          </div>

          <button
            type="button"
            className="create-event-button create-event-button--secondary create-event-button--full"
            onClick={handleAddTicketClass}
          >
            Thêm hạng vé
          </button>
        </section>

        <section className="create-event-section create-event-step2__table-box">
          <div className="create-event-section__title-wrap create-event-section__title-wrap--inline">
            <div>
              <h3>Danh sách hạng vé</h3>
              <p>
                {ticketClasses.length} hạng vé • Tổng quota: {totalQuota.toLocaleString("vi-VN")}
              </p>
            </div>
            <span className="create-event-badge">Sự kiện #{eventId}</span>
          </div>

          <div className="create-event-table-wrap">
            <table className="create-event-table">
              <thead>
                <tr>
                  <th>Tên hạng vé</th>
                  <th>Mô tả</th>
                  <th>Loại vé</th>
                  <th>Số lượng</th>
                  <th>Giá bán</th>
                  <th>Màu</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ticketClasses.length ? (
                  ticketClasses.map((item) => (
                    <tr key={item.id}>
                      <td>{item.className}</td>
                      <td>{item.description || "—"}</td>
                      <td>{nhanLoaiVe(item.type)}</td>
                      <td>{Number(item.quota).toLocaleString("vi-VN")}</td>
                      <td>{Number(item.price).toLocaleString("vi-VN")} VNĐ</td>
                      <td>
                        <span className="create-event-color-chip">
                          <span style={{ backgroundColor: item.color }} />
                          {item.color}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="create-event-icon-button"
                          onClick={() => handleRemoveTicketClass(item.id)}
                          aria-label={`Xóa ${item.className}`}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="create-event-table__empty">
                      Chưa có hạng vé nào. Hãy thêm dữ liệu từ biểu mẫu bên trái.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {error ? <p className="create-event-feedback create-event-feedback--error">{error}</p> : null}

      <div className="create-event-actions">
        <button
          type="button"
          className="create-event-button create-event-button--ghost"
          onClick={onBack}
          disabled={submitting}
        >
          Quay lại bước 1
        </button>
        <button type="submit" className="create-event-button" disabled={submitting}>
          {submitting ? "Đang lưu..." : "Tiếp tục"}
        </button>
      </div>
    </form>
  );
};

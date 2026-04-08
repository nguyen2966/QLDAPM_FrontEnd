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

// Hàm tạo ID tạm thời cho UI trước khi được lưu xuống DB
function taoIdTam() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function nhanLoaiVe(type) {
  return type === "STANDING" ? "Ghế đứng" : "Ghế ngồi";
}

export const Step2TicketClasses = ({
  eventId,
  ticketClasses,       // Nhận state từ CreateEventPage
  setTicketClasses,    // Nhận hàm set state từ CreateEventPage
  isSaved,             // Nhận cờ kiểm tra đã lưu lần đầu chưa
  setIsSaved,          // Nhận hàm set cờ
  onDone,
  onBack
}) => {
  const [draft, setDraft] = useState(EMPTY_CLASS);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(""); // Đổi tên từ error -> submitError cho rõ ràng

  const totalQuota = useMemo(
    () => ticketClasses.reduce((sum, item) => sum + Number(item.quota || 0), 0),
    [ticketClasses]
  );

  const validationErrors = useMemo(() => {
    const errors = {};

    // 1. Kiểm tra giá bán (>= 0)
    if (draft.price !== "") {
      const parsedPrice = Number(draft.price);
      if (parsedPrice < 0) {
        errors.price = "Giá vé không được là số âm (có thể nhập 0 nếu miễn phí).";
      }
    }

    // 2. Kiểm tra số lượng (> 0)
    if (draft.quota !== "") {
      const parsedQuota = Number(draft.quota);
      if (parsedQuota <= 0) {
        errors.quota = "Số lượng vé phải lớn hơn 0.";
      }
    }

    // 3. Kiểm tra trùng tên vé (Không phân biệt hoa/thường)
    if (draft.className.trim()) {
      const nameLower = draft.className.trim().toLowerCase();
      // Bỏ qua chính nó nếu đang ở chế độ sửa (editingId)
      const isDuplicate = ticketClasses.some(
        (item) => item.id !== editingId && item.className.toLowerCase() === nameLower
      );
      if (isDuplicate) {
        errors.className = "Tên hạng vé này đã tồn tại, vui lòng chọn tên khác.";
      }
    }

    return errors;
  }, [draft, ticketClasses, editingId]);

  // Kiểm tra xem form nháp (draft) hiện tại có lỗi validation nào không
  const hasValidationErrors = Object.keys(validationErrors).length > 0;


  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    setSubmitError(""); // Xóa lỗi chung khi người dùng bắt đầu sửa
  };

  const handleAddOrUpdateTicketClass = () => {
    // Chặn ngay nếu có lỗi real-time
    if (hasValidationErrors) {
      setSubmitError("Vui lòng sửa các lỗi bôi đỏ trước khi thêm hạng vé.");
      return;
    }

    if (!draft.className.trim() || draft.price === "" || draft.quota === "") {
      setSubmitError("Vui lòng nhập đủ tên hạng vé, số lượng và giá bán.");
      return;
    }

    if (editingId) {
      setTicketClasses((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                className: draft.className.trim(),
                description: draft.description.trim(),
                color: draft.color,
                type: draft.type,
                quota: Number(draft.quota),
                price: Number(draft.price),
              }
            : item
        )
      );
      setEditingId(null);
    } else {
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
    }

    setDraft(EMPTY_CLASS);
    setSubmitError("");
  };

  const handleEditClick = (item) => {
    setDraft({
      className: item.className,
      description: item.description || "",
      color: item.color,
      type: item.type,
      quota: item.quota,
      price: item.price,
    });
    setEditingId(item.id);
    setSubmitError("");
  };

  const handleCancelEdit = () => {
    setDraft(EMPTY_CLASS);
    setEditingId(null);
    setSubmitError("");
  };

  const handleRemoveTicketClass = (id) => {
    setTicketClasses((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!eventId) {
      setSubmitError("Chưa có eventId từ bước 1.");
      return;
    }

    if (!ticketClasses.length) {
      setSubmitError("Bạn cần tạo ít nhất 1 hạng vé trước khi sang bước 3.");
      return;
    }

    if (editingId) {
      setSubmitError("Vui lòng lưu hoàn tất hạng vé đang chỉnh sửa trước khi tiếp tục.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = ticketClasses.map(
        ({ id, className, description, color, type, quota, price }) => ({
          id, 
          className,
          description,
          color,
          type,
          quota,
          price,
        })
      );

      if (isSaved) {
        await API.event.editTicketClasses(eventId, payload);
      } else {
        await API.event.createTicketClasses(eventId, payload);
        setIsSaved(true); 
      }

      const fetchRes = await API.event.getTicketClasses(eventId);
      if (fetchRes.data?.data) {
        const dbTickets = fetchRes.data.data.map(item => ({
          ...item,
          id: item.ticketClassId || item.id
        }));
        setTicketClasses(dbTickets);
      }

      onDone?.(); 
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Có lỗi xảy ra khi lưu bước 2.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper render dòng cảnh báo lỗi
  const renderError = (msg) => {
    if (!msg) return null;
    return <span style={{ color: "#ff4d4f", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>{msg}</span>;
  };

  return (
    <form className="create-event-step2" onSubmit={handleSubmit}>
      <div className="create-event-step2__layout">
        <section className="create-event-section create-event-step2__form-box">
          <div className="create-event-section__title-wrap">
            <h3>{editingId ? "Cập nhật hạng vé" : "Thêm hạng vé mới"}</h3>
            <p>
              {editingId 
                ? "Chỉnh sửa thôngธ์ tin hạng vé và nhấn Cập nhật để lưu thay đổi." 
                : "Tạo từng hạng vé ở cột trái rồi kiểm tra lại ở bảng bên phải."}
            </p>
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
                style={{ borderColor: validationErrors.className ? "#ff4d4f" : undefined }}
              />
              {renderError(validationErrors.className)}
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
                name="quota"
                placeholder="100"
                value={draft.quota}
                onChange={handleDraftChange}
                style={{ borderColor: validationErrors.quota ? "#ff4d4f" : undefined }}
              />
              {renderError(validationErrors.quota)}
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
                name="price"
                placeholder="1500000"
                value={draft.price}
                onChange={handleDraftChange}
                style={{ borderColor: validationErrors.price ? "#ff4d4f" : undefined }}
              />
              {renderError(validationErrors.price)}
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              type="button"
              className="create-event-button create-event-button--secondary create-event-button--full"
              onClick={handleAddOrUpdateTicketClass}
              disabled={hasValidationErrors} // Khóa nút nếu có lỗi input
              style={{ opacity: hasValidationErrors ? 0.6 : 1, cursor: hasValidationErrors ? "not-allowed" : "pointer" }}
            >
              {editingId ? "Lưu thay đổi" : "Thêm hạng vé"}
            </button>
            {editingId && (
              <button
                type="button"
                className="create-event-button create-event-button--ghost"
                onClick={handleCancelEdit}
                style={{ padding: "0 24px" }}
              >
                Hủy
              </button>
            )}
          </div>
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
                  <th style={{ width: "80px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {ticketClasses.length ? (
                  ticketClasses.map((item) => (
                    <tr key={item.id} style={{ backgroundColor: editingId === item.id ? "rgba(109, 74, 255, 0.1)" : "transparent" }}>
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
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                          <button
                            type="button"
                            className="create-event-icon-button"
                            onClick={() => handleEditClick(item)}
                            title="Sửa"
                            style={{ opacity: 0.7 }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="create-event-icon-button"
                            onClick={() => handleRemoveTicketClass(item.id)}
                            title="Xóa"
                          >
                            ×
                          </button>
                        </div>
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

      {submitError ? <p className="create-event-feedback create-event-feedback--error">{submitError}</p> : null}

      <div className="create-event-actions">
        <button
          type="button"
          className="create-event-button create-event-button--ghost"
          onClick={onBack}
          disabled={submitting || editingId !== null} 
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
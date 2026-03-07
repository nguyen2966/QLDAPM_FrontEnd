import { useEffect, useMemo, useState } from "react";
import { API } from "../../../../api/api.js";

const CANVAS = {
  x: 0,
  y: 0,
  width: 1000,
  height: 620,
  stageLabel: "SÂN KHẤU",
};

const BLOCK_PRESETS = [
  { x: 8, y: 22, width: 24, height: 22 },
  { x: 38, y: 22, width: 24, height: 22 },
  { x: 68, y: 22, width: 24, height: 22 },
  { x: 20, y: 50, width: 24, height: 22 },
  { x: 50, y: 50, width: 24, height: 22 },
  { x: 12, y: 78, width: 76, height: 12 },
];

function laPhanHoiThanhCong(response) {
  return response?.data?.status === "success";
}

function taoTienToMaKhu(className = "") {
  const cleaned = String(className)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

  return cleaned || "KHU";
}

function layThongSoMacDinh(type, quota) {
  if (type === "STANDING") {
    return { rows: 0, cols: 0 };
  }

  const soLuong = Math.max(1, Number(quota || 60));
  const rows = Math.min(12, Math.max(4, Math.ceil(soLuong / 20)));
  const cols = Math.min(24, Math.max(6, Math.ceil(soLuong / rows)));

  return { rows, cols };
}

function buildDefaultBlocks(ticketClasses = []) {
  return ticketClasses.map((ticketClass, index) => {
    const preset = BLOCK_PRESETS[index] ?? {
      x: 10 + (index % 3) * 28,
      y: 22 + Math.floor(index / 3) * 26,
      width: 24,
      height: 22,
    };

    const kyTu = String.fromCharCode(65 + index);
    const macDinh = layThongSoMacDinh(ticketClass.type, ticketClass.quota);

    return {
      blockId: `${taoTienToMaKhu(ticketClass.className)}-${kyTu}`,
      blockName: `Khu ${kyTu}`,
      ticketClassId: ticketClass.ticketClassId,
      className: ticketClass.className,
      type: ticketClass.type,
      color: ticketClass.color,
      quota: Number(ticketClass.quota || 0),
      rows: macDinh.rows,
      cols: macDinh.cols,
      deletedSeats: [],
      ...preset,
    };
  });
}

function buildLayoutPayload(blocks) {
  return {
    canvas: {
      x: CANVAS.x,
      y: CANVAS.y,
      width: CANVAS.width,
      height: CANVAS.height,
    },
    seatLayout: blocks.map((block) => ({
      blockId: String(block.blockId || "").trim(),
      ticketClassId: Number(block.ticketClassId),
      rows: block.type === "STANDING" ? 0 : Number(block.rows || 0),
      cols: block.type === "STANDING" ? 0 : Number(block.cols || 0),
      deletedSeats: Array.isArray(block.deletedSeats) ? block.deletedSeats : [],
      position: {
        x: Math.round((Number(block.x || 0) / 100) * CANVAS.width),
        y: Math.round((Number(block.y || 0) / 100) * CANVAS.height),
        width: Math.round((Number(block.width || 0) / 100) * CANVAS.width),
        height: Math.round((Number(block.height || 0) / 100) * CANVAS.height),
      },
    })),
  };
}

function nhanLoaiVe(type) {
  return type === "STANDING" ? "Ghế đứng" : "Ghế ngồi";
}

export const Step3SeatLayout = ({ eventId, onDone, onBack }) => {
  const [ticketClasses, setTicketClasses] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTicketClasses = async () => {
      if (!eventId) {
        setError("Thiếu eventId để tải sơ đồ chỗ ngồi.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        const response = await API.event.getTicketClasses(eventId);

        if (laPhanHoiThanhCong(response)) {
          const fetchedTicketClasses = response.data.data ?? [];
          const defaultBlocks = buildDefaultBlocks(fetchedTicketClasses);

          setTicketClasses(fetchedTicketClasses);
          setBlocks(defaultBlocks);
          setSelectedBlockId(defaultBlocks[0]?.blockId ?? "");
          return;
        }

        setError("Không lấy được danh sách hạng vé cho bước 3.");
      } catch (err) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải hạng vé.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketClasses();
  }, [eventId]);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.blockId === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const handleBlockChange = (event) => {
    const { name, value } = event.target;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.blockId !== selectedBlockId) return block;

        if (name === "ticketClassId") {
          const nextTicketClass = ticketClasses.find(
            (ticketClass) => String(ticketClass.ticketClassId) === String(value)
          );

          if (!nextTicketClass) return block;

          const macDinh = layThongSoMacDinh(nextTicketClass.type, nextTicketClass.quota);

          return {
            ...block,
            ticketClassId: nextTicketClass.ticketClassId,
            className: nextTicketClass.className,
            type: nextTicketClass.type,
            color: nextTicketClass.color,
            quota: Number(nextTicketClass.quota || block.quota),
            rows:
              nextTicketClass.type === "STANDING"
                ? 0
                : Number(block.rows) > 0
                ? Number(block.rows)
                : macDinh.rows,
            cols:
              nextTicketClass.type === "STANDING"
                ? 0
                : Number(block.cols) > 0
                ? Number(block.cols)
                : macDinh.cols,
          };
        }

        const numericFields = new Set(["rows", "cols", "quota", "x", "y", "width", "height"]);
        return {
          ...block,
          [name]: numericFields.has(name) ? Number(value) : value,
        };
      })
    );
  };

  const handleResetLayout = () => {
    const defaultBlocks = buildDefaultBlocks(ticketClasses);
    setBlocks(defaultBlocks);
    setSelectedBlockId(defaultBlocks[0]?.blockId ?? "");
    setSuccessMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!blocks.length) {
      setError("Không có khu vực nào để lưu.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = buildLayoutPayload(blocks);
      const response = await API.event.createLayout(eventId, payload);

      if (laPhanHoiThanhCong(response)) {
        setSuccessMessage(
          `Đã lưu sơ đồ thành công • ${response.data.data?.seatsCreated ?? 0} ghế được tạo.`
        );
        onDone?.();
        return;
      }

      setError("Không thể lưu sơ đồ chỗ ngồi.");
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi lưu bước 3.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-event-step3" onSubmit={handleSubmit}>
      <div className="create-event-step3__toolbar">
        <div>
          <h3>Thiết lập sơ đồ chỗ ngồi</h3>
          <p>Bước này bắt buộc lấy `ticketClassId` thật từ API `/event/my-event/:id/ticket-classes`.</p>
        </div>

        <div className="create-event-step3__toolbar-actions">
          <button
            type="button"
            className="create-event-button create-event-button--secondary"
            onClick={handleResetLayout}
            disabled={loading || submitting}
          >
            Đặt lại sơ đồ
          </button>
          <button type="submit" className="create-event-button" disabled={loading || submitting}>
            {submitting ? "Đang lưu..." : "Lưu sơ đồ"}
          </button>
        </div>
      </div>

      {loading ? <p className="create-event-feedback">Đang tải hạng vé...</p> : null}
      {error ? <p className="create-event-feedback create-event-feedback--error">{error}</p> : null}
      {successMessage ? (
        <p className="create-event-feedback create-event-feedback--success">{successMessage}</p>
      ) : null}

      {!loading && !ticketClasses.length ? (
        <p className="create-event-feedback">Chưa có hạng vé nào. Hãy quay lại bước 2.</p>
      ) : null}

      {!loading && ticketClasses.length ? (
        <div className="create-event-step3__layout">
          <section className="create-event-canvas">
            <div className="create-event-canvas__stage">{CANVAS.stageLabel}</div>
            <div className="create-event-canvas__board">
              {blocks.map((block) => {
                const isActive = block.blockId === selectedBlockId;

                return (
                  <button
                    key={block.blockId}
                    type="button"
                    className={`create-event-canvas__block${isActive ? " is-active" : ""}`}
                    style={{
                      left: `${block.x}%`,
                      top: `${block.y}%`,
                      width: `${block.width}%`,
                      height: `${block.height}%`,
                      backgroundColor: block.color,
                    }}
                    onClick={() => setSelectedBlockId(block.blockId)}
                  >
                    <strong>{block.blockName}</strong>
                    <span>{block.className}</span>
                    <small>
                      {block.type === "STANDING"
                        ? `${Number(block.quota).toLocaleString("vi-VN")} người`
                        : `${block.rows} hàng × ${block.cols} ghế`}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="create-event-sidepanel">
            <section className="create-event-section">
              <div className="create-event-section__title-wrap">
                <h3>Tùy chỉnh khu vực</h3>
                <p>Chọn một khu trên sơ đồ để chỉnh nhanh.</p>
              </div>

              {selectedBlock ? (
                <div className="create-event-grid">
                  <label className="create-event-field">
                    <span>Tên khu</span>
                    <input
                      type="text"
                      name="blockName"
                      value={selectedBlock.blockName}
                      onChange={handleBlockChange}
                    />
                  </label>

                  <label className="create-event-field">
                    <span>Mã khu</span>
                    <input
                      type="text"
                      name="blockId"
                      value={selectedBlock.blockId}
                      onChange={handleBlockChange}
                    />
                  </label>

                  <label className="create-event-field">
                    <span>Hạng vé</span>
                    <select
                      name="ticketClassId"
                      value={selectedBlock.ticketClassId}
                      onChange={handleBlockChange}
                    >
                      {ticketClasses.map((ticketClass) => (
                        <option key={ticketClass.ticketClassId} value={ticketClass.ticketClassId}>
                          {ticketClass.className}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="create-event-field">
                    <span>Số lượng</span>
                    <input
                      type="number"
                      min="1"
                      name="quota"
                      value={selectedBlock.quota}
                      onChange={handleBlockChange}
                    />
                  </label>

                  {selectedBlock.type === "SEATED" ? (
                    <>
                      <label className="create-event-field">
                        <span>Số hàng</span>
                        <input
                          type="number"
                          min="1"
                          name="rows"
                          value={selectedBlock.rows}
                          onChange={handleBlockChange}
                        />
                      </label>

                      <label className="create-event-field">
                        <span>Số ghế mỗi hàng</span>
                        <input
                          type="number"
                          min="1"
                          name="cols"
                          value={selectedBlock.cols}
                          onChange={handleBlockChange}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
              ) : (
                <p className="create-event-feedback">Chọn một khu để chỉnh sửa.</p>
              )}
            </section>

            <section className="create-event-section">
              <div className="create-event-section__title-wrap">
                <h3>Chú thích hạng vé</h3>
                <p>Danh sách hạng vé được lấy trực tiếp từ backend.</p>
              </div>

              <div className="create-event-legend">
                {ticketClasses.map((ticketClass) => (
                  <div key={ticketClass.ticketClassId} className="create-event-legend__item">
                    <span style={{ backgroundColor: ticketClass.color }} />
                    <div>
                      <strong>{ticketClass.className}</strong>
                      <small>
                        #{ticketClass.ticketClassId} • {nhanLoaiVe(ticketClass.type)} •{" "}
                        {Number(ticketClass.price).toLocaleString("vi-VN")} VNĐ
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      <div className="create-event-actions">
        <button
          type="button"
          className="create-event-button create-event-button--ghost"
          onClick={onBack}
          disabled={loading || submitting}
        >
          Quay lại bước 2
        </button>
      </div>
    </form>
  );
};
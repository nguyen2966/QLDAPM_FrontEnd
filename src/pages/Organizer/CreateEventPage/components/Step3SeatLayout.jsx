import { useEffect, useMemo, useState } from "react";
import { API } from "../../../../api/api.js";

const CANVAS = {
  x: 0,
  y: 0,
  width: 1200,
  height: 780,
  stageLabel: "SÂN KHẤU",
};

const GRID_ROWS = 30;
const GRID_COLS = 40;
const GRID_CAPACITY = GRID_ROWS * GRID_COLS;

const SEAT_PRESETS = [
  { row: 4, col: 4, cols: 14 },
  { row: 4, col: 23, cols: 14 },
  { row: 17, col: 4, cols: 14 },
  { row: 17, col: 23, cols: 14 },
];

const STANDING_PRESETS = [
  { x: 6, y: 77, width: 18, height: 12 },
  { x: 28, y: 77, width: 18, height: 12 },
  { x: 50, y: 77, width: 18, height: 12 },
  { x: 72, y: 77, width: 18, height: 12 },
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

function seatKey(x, y) {
  return `${x}-${y}`;
}

function nhanLoaiVe(type) {
  return type === "STANDING" ? "Ghế đứng" : "Ghế ngồi";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSeatPoints(points = []) {
  const unique = new Map();

  for (const point of points) {
    const x = clamp(Number(point?.x || 0), 1, GRID_COLS);
    const y = clamp(Number(point?.y || 0), 1, GRID_ROWS);
    unique.set(seatKey(x, y), { x, y });
  }

  return Array.from(unique.values()).sort((a, b) => a.y - b.y || a.x - b.x);
}

function demSoGhe(block) {
  return block?.type === "SEATED" ? normalizeSeatPoints(block?.seatPoints).length : Number(block?.quota || 0);
}

function taoGheMacDinh(quota, index) {
  const soLuong = clamp(Number(quota || 0), 0, GRID_CAPACITY);
  if (!soLuong) return [];

  const preset = SEAT_PRESETS[index % SEAT_PRESETS.length] ?? {
    row: 4,
    col: 4,
    cols: 14,
  };

  const startRowShift = Math.floor(index / SEAT_PRESETS.length) * 2;
  const maxCols = clamp(Number(preset.cols || 14), 8, 18);
  const points = [];

  for (let i = 0; i < soLuong; i += 1) {
    const x = preset.col + (i % maxCols);
    const y = preset.row + startRowShift + Math.floor(i / maxCols);

    if (x > GRID_COLS || y > GRID_ROWS) break;
    points.push({ x, y });
  }

  return normalizeSeatPoints(points);
}

function buildDefaultBlocks(ticketClasses = []) {
  let standingIndex = 0;

  return ticketClasses.map((ticketClass, index) => {
    const kyTu = String.fromCharCode(65 + index);
    const isStanding = ticketClass.type === "STANDING";
    const standingPreset =
      STANDING_PRESETS[standingIndex++] ?? {
        x: 8 + (index % 3) * 24,
        y: 77,
        width: 18,
        height: 12,
      };

    return {
      blockId: `${taoTienToMaKhu(ticketClass.className)}-${kyTu}`,
      blockName: `Khu ${kyTu}`,
      ticketClassId: ticketClass.ticketClassId,
      className: ticketClass.className,
      type: ticketClass.type,
      color: ticketClass.color,
      price: Number(ticketClass.price || 0),
      quota: Number(ticketClass.quota || 0),
      seatPoints: isStanding ? [] : taoGheMacDinh(ticketClass.quota, index),
      zone: isStanding
        ? { ...standingPreset }
        : { x: 0, y: 0, width: 0, height: 0 },
    };
  });
}

function chuyenPxThanhPhanTram(value, fullSize) {
  if (!fullSize) return 0;
  return Math.round((Number(value || 0) / fullSize) * 1000) / 10;
}

function chuyenPhanTramThanhPx(value, fullSize) {
  return Math.round((Number(value || 0) / 100) * fullSize);
}

function taoGheTuLayoutCu(savedBlock) {
  const rows = Number(savedBlock?.rows || 0);
  const cols = Number(savedBlock?.cols || 0);

  if (!rows || !cols) return [];

  if (Array.isArray(savedBlock?.seats) && savedBlock.seats.length) {
    return normalizeSeatPoints(savedBlock.seats);
  }

  const deletedSet = new Set(
    Array.isArray(savedBlock?.deletedSeats)
      ? savedBlock.deletedSeats.map((seat) => `${seat.row}-${seat.col}`)
      : []
  );

  const cellWidth = CANVAS.width / GRID_COLS;
  const cellHeight = CANVAS.height / GRID_ROWS;
  const startCol = clamp(Math.floor(Number(savedBlock?.position?.x || 0) / cellWidth) + 1, 1, GRID_COLS);
  const startRow = clamp(Math.floor(Number(savedBlock?.position?.y || 0) / cellHeight) + 1, 1, GRID_ROWS);

  const seatPoints = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      if (deletedSet.has(`${row}-${col}`)) continue;

      const x = startCol + col - 1;
      const y = startRow + row - 1;
      if (x > GRID_COLS || y > GRID_ROWS) continue;

      seatPoints.push({ x, y });
    }
  }

  return normalizeSeatPoints(seatPoints);
}

function buildBlocksFromSavedLayout(ticketClasses = [], layoutPayload) {
  const defaultBlocks = buildDefaultBlocks(ticketClasses);
  const savedBlocks = Array.isArray(layoutPayload?.seatLayout) ? layoutPayload.seatLayout : [];

  return defaultBlocks.map((block, index) => {
    const savedBlock = savedBlocks.find(
      (item) => String(item.ticketClassId) === String(block.ticketClassId)
    );

    if (!savedBlock) return block;

    if (block.type === "STANDING") {
      return {
        ...block,
        blockId: savedBlock.blockId || block.blockId,
        blockName: savedBlock.blockName || block.blockName,
        zone: {
          x: chuyenPxThanhPhanTram(savedBlock?.position?.x, CANVAS.width),
          y: chuyenPxThanhPhanTram(savedBlock?.position?.y, CANVAS.height),
          width: chuyenPxThanhPhanTram(savedBlock?.position?.width, CANVAS.width),
          height: chuyenPxThanhPhanTram(savedBlock?.position?.height, CANVAS.height),
        },
      };
    }

    return {
      ...block,
      blockId: savedBlock.blockId || block.blockId,
      blockName: savedBlock.blockName || block.blockName,
      seatPoints: taoGheTuLayoutCu(savedBlock),
      zone: block.zone,
      defaultIndex: index,
    };
  });
}

function taoPayloadChoBlock(block) {
  if (block.type === "STANDING") {
    return {
      blockId: String(block.blockId || "").trim(),
      blockName: String(block.blockName || "").trim(),
      ticketClassId: Number(block.ticketClassId),
      rows: 0,
      cols: 0,
      deletedSeats: [],
      position: {
        x: chuyenPhanTramThanhPx(block.zone?.x, CANVAS.width),
        y: chuyenPhanTramThanhPx(block.zone?.y, CANVAS.height),
        width: chuyenPhanTramThanhPx(block.zone?.width, CANVAS.width),
        height: chuyenPhanTramThanhPx(block.zone?.height, CANVAS.height),
      },
    };
  }

  const seatPoints = normalizeSeatPoints(block.seatPoints);

  if (!seatPoints.length) {
    return {
      blockId: String(block.blockId || "").trim(),
      blockName: String(block.blockName || "").trim(),
      ticketClassId: Number(block.ticketClassId),
      rows: 0,
      cols: 0,
      deletedSeats: [],
      position: { x: 0, y: 0, width: 0, height: 0 },
      seats: [],
    };
  }

  const xs = seatPoints.map((point) => point.x);
  const ys = seatPoints.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rows = maxY - minY + 1;
  const cols = maxX - minX + 1;

  const occupied = new Set(seatPoints.map((point) => seatKey(point.x, point.y)));
  const deletedSeats = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const globalX = minX + col - 1;
      const globalY = minY + row - 1;

      if (!occupied.has(seatKey(globalX, globalY))) {
        deletedSeats.push({ row, col });
      }
    }
  }

  return {
    blockId: String(block.blockId || "").trim(),
    blockName: String(block.blockName || "").trim(),
    ticketClassId: Number(block.ticketClassId),
    rows,
    cols,
    deletedSeats,
    position: {
      x: Math.round(((minX - 1) / GRID_COLS) * CANVAS.width),
      y: Math.round(((minY - 1) / GRID_ROWS) * CANVAS.height),
      width: Math.round((cols / GRID_COLS) * CANVAS.width),
      height: Math.round((rows / GRID_ROWS) * CANVAS.height),
    },
    seats: seatPoints,
  };
}

function buildLayoutPayload(blocks) {
  return {
    canvas: {
      x: CANVAS.x,
      y: CANVAS.y,
      width: CANVAS.width,
      height: CANVAS.height,
    },
    grid: {
      rows: GRID_ROWS,
      cols: GRID_COLS,
      capacity: GRID_CAPACITY,
    },
    stage: {
      shape: "horizontal-rectangle",
      label: CANVAS.stageLabel,
    },
    seatLayout: blocks.map(taoPayloadChoBlock),
  };
}

export const Step3SeatLayout = ({ eventId, onDone, onBack }) => {
  const [ticketClasses, setTicketClasses] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [movingSeat, setMovingSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) {
        setError("Thiếu eventId để tải sơ đồ chỗ ngồi.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        const [ticketClassResponse, eventResponse] = await Promise.all([
          API.event.getTicketClasses(eventId),
          API.event.getMyEventById(eventId),
        ]);

        if (!laPhanHoiThanhCong(ticketClassResponse)) {
          setError("Không lấy được danh sách hạng vé cho bước 3.");
          setLoading(false);
          return;
        }

        const fetchedTicketClasses = ticketClassResponse.data.data ?? [];
        const savedLayout = eventResponse?.data?.data?.seatLayoutMap;
        const nextBlocks = savedLayout?.seatLayout?.length
          ? buildBlocksFromSavedLayout(fetchedTicketClasses, savedLayout)
          : buildDefaultBlocks(fetchedTicketClasses);

        setTicketClasses(fetchedTicketClasses);
        setBlocks(nextBlocks);
        setSelectedBlockId(nextBlocks[0]?.blockId ?? "");
      } catch (err) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải bước 3.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  useEffect(() => {
    setMovingSeat(null);
  }, [selectedBlockId]);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.blockId === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const occupiedMap = useMemo(() => {
    const map = new Map();

    blocks.forEach((block) => {
      if (block.type !== "SEATED") return;
      normalizeSeatPoints(block.seatPoints).forEach((point) => {
        map.set(seatKey(point.x, point.y), block.blockId);
      });
    });

    return map;
  }, [blocks]);

  const mismatchBlocks = useMemo(
    () =>
      blocks.filter(
        (block) => block.type === "SEATED" && demSoGhe(block) !== Number(block.quota || 0)
      ),
    [blocks]
  );

  const totalSeatedQuota = useMemo(
    () =>
      ticketClasses
        .filter((ticketClass) => ticketClass.type === "SEATED")
        .reduce((sum, ticketClass) => sum + Number(ticketClass.quota || 0), 0),
    [ticketClasses]
  );

  const selectedSeatCount = useMemo(() => demSoGhe(selectedBlock), [selectedBlock]);
  const overCapacity = totalSeatedQuota > GRID_CAPACITY;

  const updateSelectedBlock = (updater) => {
    setBlocks((prev) =>
      prev.map((block) => (block.blockId === selectedBlockId ? updater(block) : block))
    );
  };

  const handleBlockFieldChange = (event) => {
    const { name, value } = event.target;

    updateSelectedBlock((block) => {
      if (name === "ticketClassId") {
        const nextTicketClass = ticketClasses.find(
          (ticketClass) => String(ticketClass.ticketClassId) === String(value)
        );

        if (!nextTicketClass) return block;

        const nextType = nextTicketClass.type;
        const nextQuota = Number(nextTicketClass.quota || 0);
        const selectedIndex = Math.max(
          0,
          blocks.findIndex((item) => item.blockId === block.blockId)
        );

        return {
          ...block,
          ticketClassId: nextTicketClass.ticketClassId,
          className: nextTicketClass.className,
          type: nextType,
          color: nextTicketClass.color,
          price: Number(nextTicketClass.price || 0),
          quota: nextQuota,
          seatPoints:
            nextType === "SEATED"
              ? block.type === "SEATED" && block.seatPoints.length
                ? normalizeSeatPoints(block.seatPoints).slice(0, nextQuota)
                : taoGheMacDinh(nextQuota, selectedIndex)
              : [],
          zone:
            nextType === "STANDING"
              ? block.zone?.width
                ? block.zone
                : { x: 8, y: 77, width: 18, height: 12 }
              : { x: 0, y: 0, width: 0, height: 0 },
        };
      }

      return {
        ...block,
        [name]: value,
      };
    });
  };

  const handleStandingZoneChange = (event) => {
    const { name, value } = event.target;

    updateSelectedBlock((block) => ({
      ...block,
      zone: {
        ...block.zone,
        [name]: Number(value),
      },
    }));
  };

  const handleResetLayout = () => {
    const defaultBlocks = buildDefaultBlocks(ticketClasses);
    setBlocks(defaultBlocks);
    setSelectedBlockId(defaultBlocks[0]?.blockId ?? "");
    setMovingSeat(null);
    setSuccessMessage("");
    setError("");
  };

  const themGheVaoKhuDangChon = (x, y) => {
    if (!selectedBlock || selectedBlock.type !== "SEATED") return;

    const quota = Number(selectedBlock.quota || 0);
    if (selectedSeatCount >= quota) {
      setError(
        `Hạng vé ${selectedBlock.className} đã đủ ${quota.toLocaleString("vi-VN")} ghế nên không thể thêm ghế mới.`
      );
      return;
    }

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.blockId !== selectedBlockId) return block;
        return {
          ...block,
          seatPoints: normalizeSeatPoints([...(block.seatPoints || []), { x, y }]),
        };
      })
    );
    setError("");
  };

  const diChuyenGheDangChon = (targetX, targetY) => {
    if (!selectedBlock || selectedBlock.type !== "SEATED" || !movingSeat) return;

    if (movingSeat.x === targetX && movingSeat.y === targetY) {
      setMovingSeat(null);
      return;
    }

    if (occupiedMap.has(seatKey(targetX, targetY))) {
      setError("Ô này đã có ghế. Hãy chọn một ô trống khác để dời ghế.");
      return;
    }

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.blockId !== selectedBlockId) return block;

        return {
          ...block,
          seatPoints: normalizeSeatPoints(
            (block.seatPoints || []).map((point) =>
              point.x === movingSeat.x && point.y === movingSeat.y
                ? { x: targetX, y: targetY }
                : point
            )
          ),
        };
      })
    );

    setMovingSeat(null);
    setError("");
  };

  const handleSeatCellClick = (x, y) => {
    if (!selectedBlock || selectedBlock.type !== "SEATED") return;

    const ownerBlockId = occupiedMap.get(seatKey(x, y));

    if (ownerBlockId && ownerBlockId !== selectedBlockId) {
      setSelectedBlockId(ownerBlockId);
      setMovingSeat(null);
      return;
    }

    if (ownerBlockId === selectedBlockId) {
      setMovingSeat((prev) =>
        prev?.x === x && prev?.y === y
          ? null
          : {
              x,
              y,
            }
      );
      setError("");
      return;
    }

    if (movingSeat) {
      diChuyenGheDangChon(x, y);
      return;
    }

    themGheVaoKhuDangChon(x, y);
  };

  const handleAutoArrangeSelectedSeats = () => {
    if (!selectedBlock || selectedBlock.type !== "SEATED") return;

    const selectedIndex = Math.max(0, blocks.findIndex((block) => block.blockId === selectedBlock.blockId));
    updateSelectedBlock((block) => ({
      ...block,
      seatPoints: taoGheMacDinh(block.quota, selectedIndex),
    }));
    setMovingSeat(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!blocks.length) {
      setError("Không có khu vực nào để lưu.");
      return;
    }

    if (overCapacity) {
      setError(
        `Tổng quota ghế ngồi đang là ${totalSeatedQuota.toLocaleString("vi-VN")}, vượt quá sức chứa lưới 1.200 vị trí.`
      );
      return;
    }

    if (mismatchBlocks.length) {
      setError(
        `Số ghế thực tế phải khớp quota ở bước 2. Hiện đang lệch: ${mismatchBlocks
          .map((block) => block.className)
          .join(", ")}.`
      );
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
          <h3>Thiết lập sơ đồ chỗ ngồi cố định theo quota</h3>
          <p>
            Sân khấu được đặt theo dạng hình chữ nhật ngang. Lưới có {GRID_ROWS} hàng × {GRID_COLS} cột ={" "}
            {GRID_CAPACITY.toLocaleString("vi-VN")} vị trí.
          </p>
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
      {overCapacity ? (
        <p className="create-event-feedback create-event-feedback--error">
          Tổng quota ghế ngồi từ bước 2 đang vượt quá 1.200 vị trí. Hãy giảm quota trước khi lưu.
        </p>
      ) : null}

      {!loading && !ticketClasses.length ? (
        <p className="create-event-feedback">Chưa có hạng vé nào. Hãy quay lại bước 2.</p>
      ) : null}

      {!loading && ticketClasses.length ? (
        <div className="create-event-step3__layout">
          <section className="create-event-canvas">
            <div className="create-event-canvas__stage">{CANVAS.stageLabel}</div>

            <div className="create-event-step3__stats">
              <div className="create-event-step3__stat-card">
                <strong>{GRID_CAPACITY.toLocaleString("vi-VN")}</strong>
                <span>Tổng vị trí trên lưới</span>
              </div>
              <div className="create-event-step3__stat-card">
                <strong>{totalSeatedQuota.toLocaleString("vi-VN")}</strong>
                <span>Tổng quota ghế ngồi</span>
              </div>
              <div className="create-event-step3__stat-card">
                <strong>{(GRID_CAPACITY - totalSeatedQuota).toLocaleString("vi-VN")}</strong>
                <span>Vị trí còn trống</span>
              </div>
            </div>

            <div className="create-event-seat-editor">
              <div className="create-event-canvas__board create-event-canvas__board--grid">
                <div className="create-event-canvas__standing-layer">
                  {blocks
                    .filter((block) => block.type === "STANDING")
                    .map((block) => {
                      const isActive = block.blockId === selectedBlockId;
                      return (
                        <button
                          key={block.blockId}
                          type="button"
                          className={`create-event-canvas__standing-zone${isActive ? " is-active" : ""}`}
                          style={{
                            left: `${block.zone?.x || 0}%`,
                            top: `${block.zone?.y || 0}%`,
                            width: `${block.zone?.width || 0}%`,
                            height: `${block.zone?.height || 0}%`,
                            backgroundColor: block.color,
                          }}
                          onClick={() => setSelectedBlockId(block.blockId)}
                        >
                          <strong>{block.blockName}</strong>
                          <span>{block.className}</span>
                          <small>{Number(block.quota || 0).toLocaleString("vi-VN")} người</small>
                        </button>
                      );
                    })}
                </div>

                <div
                  className="create-event-seat-grid"
                  style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
                    const x = (index % GRID_COLS) + 1;
                    const y = Math.floor(index / GRID_COLS) + 1;
                    const key = seatKey(x, y);
                    const ownerBlockId = occupiedMap.get(key);
                    const ownerBlock = blocks.find((block) => block.blockId === ownerBlockId);
                    const isSelectedSeat = ownerBlockId && ownerBlockId === selectedBlockId;
                    const isMovingSeat = movingSeat?.x === x && movingSeat?.y === y;
                    const selectedBlockFull =
                      selectedBlock?.type === "SEATED" &&
                      selectedSeatCount >= Number(selectedBlock?.quota || 0);
                    const isLockedCell = !ownerBlockId && selectedBlockFull && !movingSeat;

                    return (
                      <button
                        key={key}
                        type="button"
                        className={`create-event-seat-cell${ownerBlockId ? " is-filled" : ""}${
                          isSelectedSeat ? " is-selected" : ""
                        }${isMovingSeat ? " is-moving" : ""}${isLockedCell ? " is-locked" : ""}`}
                        style={
                          ownerBlock
                            ? {
                                backgroundColor: ownerBlock.color,
                                borderColor: ownerBlock.color,
                              }
                            : undefined
                        }
                        title={`${x}, ${y}${ownerBlock ? ` • ${ownerBlock.className}` : ""}`}
                        onClick={() => handleSeatCellClick(x, y)}
                        disabled={selectedBlock?.type === "STANDING"}
                      >
                        <span className="sr-only">Ghế {x}-{y}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <aside className="create-event-sidepanel">
            <section className="create-event-section">
              <div className="create-event-section__title-wrap">
                <h3>Danh sách khu / hạng vé</h3>
                <p>Chọn khu cần chỉnh rồi bấm trực tiếp trên lưới để dời ghế hoặc thêm ghế còn thiếu.</p>
              </div>

              <div className="create-event-block-list">
                {blocks.map((block) => {
                  const isActive = block.blockId === selectedBlockId;
                  const seatCount = demSoGhe(block);
                  const isMismatch = block.type === "SEATED" && seatCount !== Number(block.quota || 0);

                  return (
                    <button
                      key={block.blockId}
                      type="button"
                      className={`create-event-block-card${isActive ? " is-active" : ""}${
                        isMismatch ? " is-warning" : ""
                      }`}
                      onClick={() => setSelectedBlockId(block.blockId)}
                    >
                      <span
                        className="create-event-block-card__dot"
                        style={{ backgroundColor: block.color }}
                      />
                      <div>
                        <strong>{block.className}</strong>
                        <small>
                          {block.type === "SEATED"
                            ? `${seatCount.toLocaleString("vi-VN")} / ${Number(block.quota || 0).toLocaleString(
                                "vi-VN"
                              )} ghế`
                            : `${Number(block.quota || 0).toLocaleString("vi-VN")} người`}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="create-event-section">
              <div className="create-event-section__title-wrap">
                <h3>Tùy chỉnh khu vực</h3>
                <p>
                  Hệ thống khóa số lượng ghế theo quota đã định ở bước 2. Khi khu đã đủ ghế, bạn chỉ có thể dời vị trí ghế.
                </p>
              </div>

              {selectedBlock ? (
                <>
                  <div className="create-event-grid">
                    <label className="create-event-field">
                      <span>Tên khu</span>
                      <input
                        type="text"
                        name="blockName"
                        value={selectedBlock.blockName}
                        onChange={handleBlockFieldChange}
                      />
                    </label>

                    <label className="create-event-field">
                      <span>Mã khu</span>
                      <input
                        type="text"
                        name="blockId"
                        value={selectedBlock.blockId}
                        onChange={handleBlockFieldChange}
                      />
                    </label>

                    <label className="create-event-field">
                      <span>Hạng vé</span>
                      <select
                        name="ticketClassId"
                        value={selectedBlock.ticketClassId}
                        onChange={handleBlockFieldChange}
                      >
                        {ticketClasses.map((ticketClass) => (
                          <option key={ticketClass.ticketClassId} value={ticketClass.ticketClassId}>
                            {ticketClass.className}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {selectedBlock.type === "SEATED" ? (
                    <>
                      <div className="create-event-inline-note create-event-inline-note--seat-stats">
                        <strong>
                          {selectedSeatCount.toLocaleString("vi-VN")} / {Number(selectedBlock.quota || 0).toLocaleString("vi-VN")} ghế
                        </strong>
                        <span>
                          Bấm một ghế của khu này để chọn dời, sau đó bấm vào ô trống mới. Khi còn thiếu ghế, bấm vào ô trống để thêm ghế.
                        </span>
                      </div>

                      {movingSeat ? (
                        <div className="create-event-inline-note create-event-inline-note--moving">
                          <strong>
                            Đang chọn ghế ({movingSeat.x}, {movingSeat.y})
                          </strong>
                          <span>Bấm vào một ô trống để chuyển ghế sang vị trí mới.</span>
                        </div>
                      ) : null}

                      <div className="create-event-step3__toolbar-actions">
                        <button
                          type="button"
                          className="create-event-button create-event-button--secondary"
                          onClick={handleAutoArrangeSelectedSeats}
                        >
                          Xếp lại theo quota
                        </button>
                        {movingSeat ? (
                          <button
                            type="button"
                            className="create-event-button create-event-button--ghost"
                            onClick={() => setMovingSeat(null)}
                          >
                            Bỏ chọn ghế đang dời
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div className="create-event-grid create-event-grid--two">
                      <label className="create-event-field">
                        <span>Tọa độ X (%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          name="x"
                          value={selectedBlock.zone?.x ?? 0}
                          onChange={handleStandingZoneChange}
                        />
                      </label>

                      <label className="create-event-field">
                        <span>Tọa độ Y (%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          name="y"
                          value={selectedBlock.zone?.y ?? 0}
                          onChange={handleStandingZoneChange}
                        />
                      </label>

                      <label className="create-event-field">
                        <span>Rộng (%)</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          name="width"
                          value={selectedBlock.zone?.width ?? 0}
                          onChange={handleStandingZoneChange}
                        />
                      </label>

                      <label className="create-event-field">
                        <span>Cao (%)</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          name="height"
                          value={selectedBlock.zone?.height ?? 0}
                          onChange={handleStandingZoneChange}
                        />
                      </label>
                    </div>
                  )}
                </>
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

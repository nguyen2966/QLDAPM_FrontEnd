import { useMemo } from "react";

const DEFAULT_GRID_ROWS = 25;
const DEFAULT_GRID_COLS = 40;
const CELL_SIZE = 18;
const CELL_GAP = 6;

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function seatKey(x, y) {
  return `${x}-${y}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getCanvasWidth(seatLayoutMap) {
  return Number(seatLayoutMap?.canvas?.width || 1200);
}

function getCanvasHeight(seatLayoutMap) {
  return Number(seatLayoutMap?.canvas?.height || 760);
}

function getGridRows(seatLayoutMap) {
  return Number(seatLayoutMap?.grid?.rows || DEFAULT_GRID_ROWS);
}

function getGridCols(seatLayoutMap) {
  return Number(seatLayoutMap?.grid?.cols || DEFAULT_GRID_COLS);
}

function getStageLabel(seatLayoutMap) {
  return seatLayoutMap?.stage?.label || "SÂN KHẤU";
}

function buildSeatPointsFromBlock(block, seatLayoutMap) {
  if (Array.isArray(block?.seats) && block.seats.length) {
    return block.seats.map((point) => ({
      x: Number(point.x),
      y: Number(point.y),
    }));
  }

  const rows = Number(block?.rows || 0);
  const cols = Number(block?.cols || 0);
  if (!rows || !cols) return [];

  const gridRows = getGridRows(seatLayoutMap);
  const gridCols = getGridCols(seatLayoutMap);
  const canvasWidth = getCanvasWidth(seatLayoutMap);
  const canvasHeight = getCanvasHeight(seatLayoutMap);
  const position = block?.position || {};

  const startCol = clamp(
    Math.round((Number(position.x || 0) / Math.max(canvasWidth, 1)) * gridCols) + 1,
    1,
    gridCols,
  );
  const startRow = clamp(
    Math.round((Number(position.y || 0) / Math.max(canvasHeight, 1)) * gridRows) + 1,
    1,
    gridRows,
  );

  const deletedSet = new Set(
    Array.isArray(block?.deletedSeats)
      ? block.deletedSeats.map((seat) => `${seat.row}-${seat.col}`)
      : [],
  );

  const points = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      if (deletedSet.has(`${row}-${col}`)) continue;
      points.push({
        x: startCol + col - 1,
        y: startRow + row - 1,
      });
    }
  }

  return points;
}

function getSeatDisplayState(seat, isSelected, isMyLockedSeat) {
  if (!seat) return "missing";
  if (isSelected) return "selected";

  if (isMyLockedSeat) return "available";

  return String(seat.status || "AVAILABLE").toLowerCase();
}

function getSeatTitle(seat, displayState) {
  if (!seat) return "Ô trống";

  const statusLabelMap = {
    available: "Còn trống",
    pending: "Đang giữ",
    booked: "Đã đặt",
    selected: "Đang chọn",
  };

  return `${seat.name} - ${statusLabelMap[displayState] || displayState} - ${seat.ticketClass?.className || "Không rõ hạng vé"}`;
}

function SeatCell({ seat, selectedIds, isMyLockedSeat, onSelect }) {
  if (!seat) {
    return <div className="order-seat-map__seat order-seat-map__seat--placeholder" aria-hidden="true" />;
  }

  const isSelected = selectedIds.has(seat.seatId);
  const displayState = getSeatDisplayState(seat, isSelected, isMyLockedSeat);
  const canClick = displayState === "available" || displayState === "selected";

  return (
    <button
      type="button"
      className={`order-seat-map__seat order-seat-map__seat--${displayState}`}
      style={
        displayState === "available"
          ? {
              backgroundColor: seat.ticketClass?.color || "#22c55e",
              borderColor: seat.ticketClass?.color || "#22c55e",
            }
          : undefined
      }
      title={getSeatTitle(seat, displayState)}
      aria-label={getSeatTitle(seat, displayState)}
      onClick={() => canClick && onSelect(seat)}
      disabled={!canClick}
    />
  );
}

export function SeatMap({
  seatLayoutMap,
  seats,
  ticketClasses,
  selectedIds,
  myLockedSeats,
  onSelect,
}) {
  const blocks = Array.isArray(seatLayoutMap?.seatLayout) ? seatLayoutMap.seatLayout : [];
  const gridRows = getGridRows(seatLayoutMap);
  const gridCols = getGridCols(seatLayoutMap);
  const stageLabel = getStageLabel(seatLayoutMap);

  const seatsByName = useMemo(() => {
    const map = new Map();

    for (const seat of seats || []) {
      map.set(seat.name, seat);
    }

    return map;
  }, [seats]);

  const ticketClassesById = useMemo(() => {
    const map = new Map();

    for (const ticketClass of ticketClasses || []) {
      map.set(Number(ticketClass.ticketClassId), ticketClass);
    }

    return map;
  }, [ticketClasses]);

  const gridSeatMap = useMemo(() => {
    const map = new Map();

    for (const block of blocks) {
      const seatPoints = buildSeatPointsFromBlock(block, seatLayoutMap);
      if (!seatPoints.length) continue;

      const minX = Math.min(...seatPoints.map((point) => Number(point.x)));
      const minY = Math.min(...seatPoints.map((point) => Number(point.y)));
      const ticketClass = ticketClassesById.get(Number(block.ticketClassId));

      for (const point of seatPoints) {
        const localRow = Number(point.y) - minY + 1;
        const localCol = Number(point.x) - minX + 1;
        const seatName = `${block.blockId}-R${localRow}C${localCol}`;
        const seat = seatsByName.get(seatName);

        map.set(seatKey(Number(point.x), Number(point.y)), {
          ...(seat || {}),
          name: seat?.name || seatName,
          seatId: seat?.seatId,
          status: seat?.status || "AVAILABLE",
          ticketClassId: seat?.ticketClassId || block.ticketClassId,
          ticketClass: seat?.ticketClass || ticketClass,
          blockId: block.blockId,
          blockName: block.blockName,
          x: Number(point.x),
          y: Number(point.y),
        });
      }
    }

    return map;
  }, [blocks, seatLayoutMap, seatsByName, ticketClassesById]);

  if (!blocks.length) {
    return (
      <div className="order-seat-map__empty">
        Sơ đồ ghế chưa được cấu hình cho sự kiện này.
      </div>
    );
  }

  return (
    <div className="order-seat-map">
      <div className="order-seat-map__legend">
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--available" />
          <span>Còn trống</span>
        </div>
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--pending" />
          <span>Đang giữ</span>
        </div>
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--booked" />
          <span>Đã đặt</span>
        </div>
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--selected" />
          <span>Đang chọn</span>
        </div>
      </div>

      <div className="order-seat-map__viewport">
        <div className="order-seat-map__ticket-strip">
          {(ticketClasses || []).map((ticketClass) => (
            <div
              key={ticketClass.ticketClassId}
              className="order-seat-map__ticket-strip-item"
            >
              <span
                className="order-seat-map__ticket-strip-dot"
                style={{ background: ticketClass.color || "#e2e8f0" }}
              />
              <div className="order-seat-map__ticket-strip-meta">
                <strong>{ticketClass.className}</strong>
                <span>{formatCurrency(ticketClass.price)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="order-seat-map__stage">{stageLabel}</div>

        <div className="order-seat-map__editor">
          <div className="order-seat-map__board">
            <div
              className="order-seat-map__grid"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE}px)`,
                gap: `${CELL_GAP}px`,
              }}
            >
              {Array.from({ length: gridRows * gridCols }, (_, index) => {
                const x = (index % gridCols) + 1;
                const y = Math.floor(index / gridCols) + 1;
                const seat = gridSeatMap.get(seatKey(x, y));

                return (
                  <SeatCell
                    key={seat?.seatId || `${x}-${y}`}
                    seat={seat}
                    selectedIds={selectedIds}
                    isMyLockedSeat={myLockedSeats ? myLockedSeats.has(seat?.seatId) : false}
                    onSelect={onSelect}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_CANVAS_WIDTH = 1200;
const DEFAULT_CANVAS_HEIGHT = 760;

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getCanvasWidth(seatLayoutMap) {
  return Number(
    seatLayoutMap?.canvasWidth ||
      seatLayoutMap?.canvas?.width ||
      DEFAULT_CANVAS_WIDTH,
  );
}

function getCanvasHeight(seatLayoutMap) {
  return Number(
    seatLayoutMap?.canvasHeight ||
      seatLayoutMap?.canvas?.height ||
      DEFAULT_CANVAS_HEIGHT,
  );
}

function getStageLabel(seatLayoutMap) {
  return seatLayoutMap?.stage?.label || "SAN KHAU";
}

function getBlockSize(block) {
  const position = block?.position || {};

  return {
    x: Number(position.x || 0),
    y: Number(position.y || 0),
    width: Number(position.width || position.w || 0),
    height: Number(position.height || position.h || 0),
  };
}

function getDisplayStatus(seat, isSelected) {
  if (!seat) return "MISSING";
  return isSelected ? "SELECTED" : seat.status;
}

function getSeatTone(seat, displayStatus) {
  const styleMap = {
    AVAILABLE: {
      background: seat?.ticketClass?.color || "#dbeafe",
      border: "1px solid rgba(15, 23, 42, 0.08)",
      cursor: "pointer",
    },
    PENDING: {
      background: "#94a3b8",
      border: "1px solid #94a3b8",
      cursor: "not-allowed",
    },
    BOOKED: {
      background: "#334155",
      border: "1px solid #334155",
      cursor: "not-allowed",
    },
    SELECTED: {
      background: "rgba(250, 204, 21, 0.15)",
      border: "2px solid #facc15",
      cursor: "pointer",
    },
    MISSING: {
      background: "transparent",
      border: "1px dashed rgba(148, 163, 184, 0.3)",
      cursor: "default",
    },
  };

  return styleMap[displayStatus] || styleMap.MISSING;
}

function SeatCell({ seat, isSelected, onSelect }) {
  if (!seat) {
    return <div className="order-seat-map__seat order-seat-map__seat--placeholder" aria-hidden="true" />;
  }

  const displayStatus = getDisplayStatus(seat, isSelected);
  const tone = getSeatTone(seat, displayStatus);
  const canClick = displayStatus === "AVAILABLE" || displayStatus === "SELECTED";

  return (
    <button
      type="button"
      className={`order-seat-map__seat order-seat-map__seat--${displayStatus.toLowerCase()}`}
      style={{
        background: tone.background,
        border: tone.border,
        cursor: tone.cursor,
      }}
      onClick={() => canClick && onSelect(seat)}
      disabled={!canClick}
      title={`${seat.name} - ${displayStatus} - ${seat.ticketClass?.className || "Khong ro hang ve"}`}
      aria-label={`${seat.name} - ${displayStatus}`}
    />
  );
}

function SeatBlock({ block, seatMap, selectedIds, onSelect, scale, ticketClassesById }) {
  const existingSet = useMemo(
    () => new Set((block?.seats || []).map(({ x, y }) => `${y}-${x}`)),
    [block?.seats],
  );

  const position = getBlockSize(block);
  const rows = Number(block?.rows || 0);
  const cols = Number(block?.cols || 0);
  const ticketClass =
    ticketClassesById.get(Number(block?.ticketClassId)) ||
    Object.values(seatMap).find((seat) => seat?.ticketClassId === Number(block?.ticketClassId))?.ticketClass;

  if (!rows || !cols) {
    return null;
  }

  const cells = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const key = `${row}-${col}`;

      if (!existingSet.has(key)) {
        cells.push(
          <div
            key={`${block.blockId}-${key}`}
            className="order-seat-map__seat order-seat-map__seat--placeholder"
            aria-hidden="true"
          />,
        );
        continue;
      }

      const seatName = `${block.blockId}-R${row}C${col}`;
      const seat = seatMap[seatName];

      cells.push(
        <SeatCell
          key={seat?.seatId || `${block.blockId}-${key}`}
          seat={seat}
          isSelected={selectedIds.has(seat?.seatId)}
          onSelect={onSelect}
        />,
      );
    }
  }

  const gap = Math.max(2, Math.round(6 * scale));

  return (
    <div
      className="order-seat-map__block"
      style={{
        left: position.x * scale,
        top: position.y * scale,
        width: position.width * scale,
        height: position.height * scale,
      }}
    >
      <div
        className="order-seat-map__block-label"
        style={{ borderColor: ticketClass?.color || "#fecdd3" }}
      >
        <strong>{block?.blockName || block?.blockId}</strong>
        <span>{ticketClass?.className || "Khong ro hang ve"}</span>
        {ticketClass?.price ? <small>{formatCurrency(ticketClass.price)}</small> : null}
      </div>

      <div
        className="order-seat-map__grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gap: `${gap}px`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}

export function SeatMap({
  seatLayoutMap,
  seats,
  ticketClasses,
  selectedIds,
  onSelect,
}) {
  const containerRef = useRef(null);
  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const updateSize = () => {
      setDisplayWidth(element.offsetWidth || 0);
    };

    updateSize();

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateSize);
      observer.observe(element);
    }

    window.addEventListener("resize", updateSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const canvasWidth = getCanvasWidth(seatLayoutMap);
  const canvasHeight = getCanvasHeight(seatLayoutMap);
  const stageLabel = getStageLabel(seatLayoutMap);
  const blocks = Array.isArray(seatLayoutMap?.seatLayout) ? seatLayoutMap.seatLayout : [];

  const scale = useMemo(() => {
    const baseWidth = displayWidth || canvasWidth;
    return Math.min(1, baseWidth / Math.max(canvasWidth, 1));
  }, [canvasWidth, displayWidth]);

  const boardHeight = canvasHeight * scale;
  const boardWidth = canvasWidth * scale;

  const seatMap = useMemo(() => {
    const map = {};
    for (const seat of seats || []) {
      map[seat.name] = seat;
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
          <span>Available</span>
        </div>
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--pending" />
          <span>Pending</span>
        </div>
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--booked" />
          <span>Booked</span>
        </div>
        <div className="order-seat-map__legend-item">
          <span className="order-seat-map__legend-swatch order-seat-map__legend-swatch--selected" />
          <span>Selected</span>
        </div>
      </div>

      <div className="order-seat-map__viewport" ref={containerRef}>
        <div className="order-seat-map__stage">{stageLabel}</div>

        <div
          className="order-seat-map__canvas"
          style={{ width: `${boardWidth}px`, height: `${boardHeight}px` }}
        >
          {blocks.map((block) => (
            <SeatBlock
              key={block.blockId}
              block={block}
              seatMap={seatMap}
              selectedIds={selectedIds}
              onSelect={onSelect}
              scale={scale}
              ticketClassesById={ticketClassesById}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { API } from "../../../../api/api.js";

// const CANVAS = {
//   x: 0,
//   y: 0,
//   width: 1200,
//   height: 760,
//   stageLabel: "SÂN KHẤU",
// };

// const GRID_ROWS = 25;
// const GRID_COLS = 40;
// const GRID_CAPACITY = GRID_ROWS * GRID_COLS; // 1000
// const BOARD_MARGIN = 1;
// const BLOCK_GAP = 2;
// const CELL_SIZE = 16;

// function laPhanHoiThanhCong(response) {
//   return response?.data?.status === "success";
// }

// function seatKey(x, y) {
//   return `${x}-${y}`;
// }

// function clamp(value, min, max) {
//   return Math.max(min, Math.min(max, value));
// }

// function nhanLoaiVe(type) {
//   return type === "STANDING" ? "Ghế đứng" : "Ghế ngồi";
// }

// function taoTienToMaKhu(className = "") {
//   const cleaned = String(className)
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-zA-Z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .toUpperCase();

//   return cleaned || "KHU";
// }

// function normalizeSeatPoints(points = []) {
//   const map = new Map();

//   points.forEach((point) => {
//     const x = clamp(Number(point?.x || 0), 1, GRID_COLS);
//     const y = clamp(Number(point?.y || 0), 1, GRID_ROWS);
//     map.set(seatKey(x, y), { x, y });
//   });

//   return Array.from(map.values()).sort((a, b) => a.y - b.y || a.x - b.x);
// }

// function demSoGhe(block) {
//   return normalizeSeatPoints(block?.seatPoints).length;
// }

// function taoPhanBoMacDinh(ticketClasses = []) {
//   let cursorX = BOARD_MARGIN + 1;
//   let cursorY = BOARD_MARGIN + 1;
//   let bandHeight = 0;

//   return ticketClasses.map((ticketClass, index) => {
//     const quota = clamp(Number(ticketClass.quota || 0), 0, GRID_CAPACITY);
//     const kyTu = String.fromCharCode(65 + index);
//     const points = [];

//     if (quota > 0) {
//       let cols = clamp(
//         Math.ceil(Math.sqrt(quota * 1.25)),
//         5,
//         Math.max(5, GRID_COLS - BOARD_MARGIN * 2)
//       );
//       let rows = Math.ceil(quota / cols);

//       if (cursorX + cols > GRID_COLS - BOARD_MARGIN + 1) {
//         cursorX = BOARD_MARGIN + 1;
//         cursorY += bandHeight + BLOCK_GAP;
//         bandHeight = 0;
//       }

//       if (cursorY + rows > GRID_ROWS - BOARD_MARGIN + 1) {
//         cursorX = BOARD_MARGIN + 1;
//         cursorY = BOARD_MARGIN + 1;
//         bandHeight = 0;
//         cols = Math.min(cols, GRID_COLS - BOARD_MARGIN * 2);
//         rows = Math.ceil(quota / Math.max(cols, 1));
//       }

//       for (let i = 0; i < quota; i += 1) {
//         const x = cursorX + (i % cols);
//         const y = cursorY + Math.floor(i / cols);

//         if (x > GRID_COLS - BOARD_MARGIN || y > GRID_ROWS - BOARD_MARGIN) break;
//         points.push({ x, y });
//       }

//       bandHeight = Math.max(bandHeight, rows);
//       cursorX += cols + BLOCK_GAP;
//     }

//     return {
//       blockId: `${taoTienToMaKhu(ticketClass.className)}-${kyTu}`,
//       blockName: `Khu ${kyTu}`,
//       ticketClassId: ticketClass.ticketClassId,
//       className: ticketClass.className,
//       type: ticketClass.type,
//       color: ticketClass.color,
//       price: Number(ticketClass.price || 0),
//       quota,
//       seatPoints: normalizeSeatPoints(points),
//       defaultIndex: index,
//     };
//   });
// }

// function taoGheTuLayoutDaLuu(savedBlock, layoutPayload) {
//   if (Array.isArray(savedBlock?.seats) && savedBlock.seats.length) {
//     return normalizeSeatPoints(savedBlock.seats);
//   }

//   const rows = Number(savedBlock?.rows || 0);
//   const cols = Number(savedBlock?.cols || 0);
//   if (!rows || !cols) return [];

//   const savedCanvasWidth = Number(layoutPayload?.canvas?.width || CANVAS.width);
//   const savedCanvasHeight = Number(layoutPayload?.canvas?.height || CANVAS.height);
//   const savedGridCols = Number(layoutPayload?.grid?.cols || GRID_COLS);
//   const savedGridRows = Number(layoutPayload?.grid?.rows || GRID_ROWS);

//   const deletedSet = new Set(
//     Array.isArray(savedBlock?.deletedSeats)
//       ? savedBlock.deletedSeats.map((seat) => `${seat.row}-${seat.col}`)
//       : []
//   );

//   const startCol = clamp(
//     Math.round((Number(savedBlock?.position?.x || 0) / Math.max(savedCanvasWidth, 1)) * savedGridCols) + 1,
//     1,
//     GRID_COLS
//   );

//   const startRow = clamp(
//     Math.round((Number(savedBlock?.position?.y || 0) / Math.max(savedCanvasHeight, 1)) * savedGridRows) + 1,
//     1,
//     GRID_ROWS
//   );

//   const points = [];

//   for (let row = 1; row <= rows; row += 1) {
//     for (let col = 1; col <= cols; col += 1) {
//       if (deletedSet.has(`${row}-${col}`)) continue;
//       const x = startCol + col - 1;
//       const y = startRow + row - 1;
//       if (x > GRID_COLS || y > GRID_ROWS) continue;
//       points.push({ x, y });
//     }
//   }

//   return normalizeSeatPoints(points);
// }

// function taoPayloadChoBlock(block) {
//   const seatPoints = normalizeSeatPoints(block.seatPoints);

//   if (!seatPoints.length) {
//     return {
//       blockId: String(block.blockId || "").trim(),
//       blockName: String(block.blockName || "").trim(),
//       ticketClassId: Number(block.ticketClassId),
//       type: block.type,
//       rows: 0,
//       cols: 0,
//       deletedSeats: [],
//       position: { x: 0, y: 0, width: 0, height: 0 },
//       seats: [],
//     };
//   }

//   const xs = seatPoints.map((point) => point.x);
//   const ys = seatPoints.map((point) => point.y);
//   const minX = Math.min(...xs);
//   const maxX = Math.max(...xs);
//   const minY = Math.min(...ys);
//   const maxY = Math.max(...ys);
//   const rows = maxY - minY + 1;
//   const cols = maxX - minX + 1;

//   const occupied = new Set(seatPoints.map((point) => seatKey(point.x, point.y)));
//   const deletedSeats = [];

//   for (let row = 1; row <= rows; row += 1) {
//     for (let col = 1; col <= cols; col += 1) {
//       const globalX = minX + col - 1;
//       const globalY = minY + row - 1;

//       if (!occupied.has(seatKey(globalX, globalY))) {
//         deletedSeats.push({ row, col });
//       }
//     }
//   }

//   return {
//     blockId: String(block.blockId || "").trim(),
//     blockName: String(block.blockName || "").trim(),
//     ticketClassId: Number(block.ticketClassId),
//     type: block.type,
//     rows,
//     cols,
//     deletedSeats,
//     position: {
//       x: Math.round(((minX - 1) / GRID_COLS) * CANVAS.width),
//       y: Math.round(((minY - 1) / GRID_ROWS) * CANVAS.height),
//       width: Math.round((cols / GRID_COLS) * CANVAS.width),
//       height: Math.round((rows / GRID_ROWS) * CANVAS.height),
//     },
//     seats: seatPoints,
//   };
// }

// function buildLayoutPayload(blocks) {
//   return {
//     canvas: {
//       x: CANVAS.x,
//       y: CANVAS.y,
//       width: CANVAS.width,
//       height: CANVAS.height,
//     },
//     grid: {
//       rows: GRID_ROWS,
//       cols: GRID_COLS,
//       capacity: GRID_CAPACITY,
//     },
//     stage: {
//       shape: "horizontal-rectangle",
//       label: CANVAS.stageLabel,
//     },
//     seatLayout: blocks.map(taoPayloadChoBlock),
//   };
// }

// function buildDefaultBlocks(ticketClasses = []) {
//   return taoPhanBoMacDinh(ticketClasses);
// }

// function buildBlocksFromSavedLayout(ticketClasses = [], layoutPayload) {
//   const defaultBlocks = buildDefaultBlocks(ticketClasses);
//   const savedBlocks = Array.isArray(layoutPayload?.seatLayout) ? layoutPayload.seatLayout : [];

//   return defaultBlocks.map((block, index) => {
//     const savedBlock = savedBlocks.find(
//       (item) => String(item.ticketClassId) === String(block.ticketClassId)
//     );

//     if (!savedBlock) return block;

//     const savedSeats = taoGheTuLayoutDaLuu(savedBlock, layoutPayload);

//     return {
//       ...block,
//       blockId: savedBlock.blockId || block.blockId,
//       blockName: savedBlock.blockName || block.blockName,
//       seatPoints: savedSeats.length
//         ? savedSeats.slice(0, Number(block.quota || 0))
//         : defaultBlocks[index]?.seatPoints || [],
//       defaultIndex: index,
//     };
//   });
// }

// function taoDanhSachOTrongKhung(selection, occupiedMap) {
//   if (!selection) return [];

//   const minX = Math.max(1, Math.min(selection.startX, selection.endX));
//   const maxX = Math.min(GRID_COLS, Math.max(selection.startX, selection.endX));
//   const minY = Math.max(1, Math.min(selection.startY, selection.endY));
//   const maxY = Math.min(GRID_ROWS, Math.max(selection.startY, selection.endY));

//   const cells = [];
//   for (let y = minY; y <= maxY; y += 1) {
//     for (let x = minX; x <= maxX; x += 1) {
//       if (!occupiedMap.has(seatKey(x, y))) {
//         cells.push({ x, y });
//       }
//     }
//   }

//   return cells;
// }

// export const Step3SeatLayout = ({ eventId, onDone, onBack }) => {
//   const [ticketClasses, setTicketClasses] = useState([]);
//   const [blocks, setBlocks] = useState([]);
//   const [selectedBlockId, setSelectedBlockId] = useState("");
//   const [movingSeat, setMovingSeat] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [drawSelection, setDrawSelection] = useState(null);
//   const [isDrawingArea, setIsDrawingArea] = useState(false);
//   const suppressMouseUpRef = useRef(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!eventId) {
//         setError("Thiếu mã sự kiện để tải sơ đồ chỗ ngồi.");
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError("");
//       setSuccessMessage("");

//       try {
//         const [ticketClassResponse, eventResponse] = await Promise.all([
//           API.event.getTicketClasses(eventId),
//           API.event.getMyEventById(eventId),
//         ]);

//         if (!laPhanHoiThanhCong(ticketClassResponse)) {
//           setError("Không lấy được danh sách hạng vé.");
//           setLoading(false);
//           return;
//         }

//         const fetchedTicketClasses = ticketClassResponse.data.data ?? [];
//         const savedLayout = eventResponse?.data?.data?.seatLayoutMap;
//         const nextBlocks = savedLayout?.seatLayout?.length
//           ? buildBlocksFromSavedLayout(fetchedTicketClasses, savedLayout)
//           : buildDefaultBlocks(fetchedTicketClasses);

//         setTicketClasses(fetchedTicketClasses);
//         setBlocks(nextBlocks);
//         setSelectedBlockId(nextBlocks[0]?.blockId ?? "");
//       } catch (err) {
//         setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải bước 3.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [eventId]);

//   useEffect(() => {
//     setMovingSeat(null);
//     setDrawSelection(null);
//     setIsDrawingArea(false);
//   }, [selectedBlockId]);

//   const selectedBlock = useMemo(
//     () => blocks.find((block) => block.blockId === selectedBlockId) ?? null,
//     [blocks, selectedBlockId]
//   );

//   const occupiedMap = useMemo(() => {
//     const map = new Map();
//     blocks.forEach((block) => {
//       normalizeSeatPoints(block.seatPoints).forEach((point) => {
//         map.set(seatKey(point.x, point.y), block.blockId);
//       });
//     });
//     return map;
//   }, [blocks]);

//   const ownerBlockMap = useMemo(() => {
//     const map = new Map();
//     blocks.forEach((block) => {
//       map.set(block.blockId, block);
//     });
//     return map;
//   }, [blocks]);

//   const totalQuota = useMemo(
//     () => ticketClasses.reduce((sum, ticketClass) => sum + Number(ticketClass.quota || 0), 0),
//     [ticketClasses]
//   );

//   const placedSeats = useMemo(
//     () => blocks.reduce((sum, block) => sum + demSoGhe(block), 0),
//     [blocks]
//   );

//   const mismatchBlocks = useMemo(
//     () => blocks.filter((block) => demSoGhe(block) !== Number(block.quota || 0)),
//     [blocks]
//   );

//   const selectedSeatCount = useMemo(() => demSoGhe(selectedBlock), [selectedBlock]);
//   const selectedRemaining = Math.max(0, Number(selectedBlock?.quota || 0) - selectedSeatCount);
//   const overCapacity = totalQuota > GRID_CAPACITY;

//   const previewCells = useMemo(() => {
//     const map = new Set();
//     if (!drawSelection || !selectedBlock) return map;

//     taoDanhSachOTrongKhung(drawSelection, occupiedMap)
//       .slice(0, selectedRemaining)
//       .forEach((cell) => map.add(seatKey(cell.x, cell.y)));

//     return map;
//   }, [drawSelection, occupiedMap, selectedBlock, selectedRemaining]);

//   const updateSelectedBlock = useCallback((updater) => {
//     setBlocks((prev) =>
//       prev.map((block) => (block.blockId === selectedBlockId ? updater(block) : block))
//     );
//   }, [selectedBlockId]);

//   const handleBlockFieldChange = (event) => {
//     const { name, value } = event.target;

//     updateSelectedBlock((block) => {
//       if (name === "ticketClassId") {
//         const nextTicketClass = ticketClasses.find(
//           (ticketClass) => String(ticketClass.ticketClassId) === String(value)
//         );

//         if (!nextTicketClass) return block;

//         return {
//           ...block,
//           ticketClassId: nextTicketClass.ticketClassId,
//           className: nextTicketClass.className,
//           type: nextTicketClass.type,
//           color: nextTicketClass.color,
//           price: Number(nextTicketClass.price || 0),
//           quota: Number(nextTicketClass.quota || 0),
//           seatPoints: normalizeSeatPoints(block.seatPoints || []).slice(
//             0,
//             Number(nextTicketClass.quota || 0)
//           ),
//         };
//       }

//       return {
//         ...block,
//         [name]: value,
//       };
//     });
//   };

//   const handleResetLayout = () => {
//     const defaultBlocks = buildDefaultBlocks(ticketClasses);
//     setBlocks(defaultBlocks);
//     setSelectedBlockId(defaultBlocks[0]?.blockId ?? "");
//     setMovingSeat(null);
//     setDrawSelection(null);
//     setIsDrawingArea(false);
//     setError("");
//     setSuccessMessage("");
//   };

//   const handleClearSelectedBlock = () => {
//     if (!selectedBlock) return;
//     updateSelectedBlock((block) => ({ ...block, seatPoints: [] }));
//     setMovingSeat(null);
//     setDrawSelection(null);
//     setIsDrawingArea(false);
//     setError("");
//   };



//   const handleDeleteSeat = useCallback((x, y) => {
//     const ownerBlockId = occupiedMap.get(seatKey(x, y));
//     if (!ownerBlockId) return;

//     setSelectedBlockId(ownerBlockId);
//     setBlocks((prev) =>
//       prev.map((block) => {
//         if (block.blockId !== ownerBlockId) return block;
//         return {
//           ...block,
//           seatPoints: normalizeSeatPoints(
//             (block.seatPoints || []).filter((point) => !(point.x === x && point.y === y))
//           ),
//         };
//       })
//     );

//     if (movingSeat?.x === x && movingSeat?.y === y) {
//       setMovingSeat(null);
//     }

//     setError("");
//     setSuccessMessage("");
//   }, [movingSeat, occupiedMap]);

//   const finalizeAreaDraw = useCallback(() => {
//     if (!isDrawingArea || !drawSelection || !selectedBlock) {
//       setIsDrawingArea(false);
//       setDrawSelection(null);
//       return;
//     }

//     const seatsCanAdd = Math.max(0, Number(selectedBlock.quota || 0) - demSoGhe(selectedBlock));

//     if (!seatsCanAdd) {
//       setError("Hạng vé này đã đủ số ghế theo quota. Bạn chỉ có thể dời hoặc xóa ghế hiện có.");
//       setIsDrawingArea(false);
//       setDrawSelection(null);
//       return;
//     }

//     const candidates = taoDanhSachOTrongKhung(drawSelection, occupiedMap);
//     const seatsToAdd = candidates.slice(0, seatsCanAdd);

//     if (!seatsToAdd.length) {
//       setIsDrawingArea(false);
//       setDrawSelection(null);
//       return;
//     }

//     updateSelectedBlock((block) => ({
//       ...block,
//       seatPoints: normalizeSeatPoints([...(block.seatPoints || []), ...seatsToAdd]),
//     }));

//     if (candidates.length > seatsCanAdd) {
//       setError(
//         `Khu này chỉ còn thiếu ${seatsCanAdd.toLocaleString("vi-VN")} ghế nên hệ thống chỉ thêm đủ quota trong vùng bạn vừa vẽ.`
//       );
//     } else {
//       setError("");
//     }

//     setIsDrawingArea(false);
//     setDrawSelection(null);
//   }, [drawSelection, isDrawingArea, occupiedMap, selectedBlock, updateSelectedBlock]);

//   useEffect(() => {
//     if (!isDrawingArea) return undefined;

//     const handleMouseUp = () => {
//       if (suppressMouseUpRef.current) {
//         suppressMouseUpRef.current = false;
//       }
//       finalizeAreaDraw();
//     };

//     window.addEventListener("mouseup", handleMouseUp);
//     return () => window.removeEventListener("mouseup", handleMouseUp);
//   }, [finalizeAreaDraw, isDrawingArea]);

// const handleSeatMouseDown = (x, y) => {
//   const ownerBlockId = occupiedMap.get(seatKey(x, y));

//   // Có ghế rồi => click 1 lần là xóa
//   if (ownerBlockId) {
//     handleDeleteSeat(x, y);
//     return;
//   }

//   if (!selectedBlock) return;

//   if (selectedRemaining <= 0) {
//     setError("Khu đang chọn đã đủ ghế theo quota nên không thể thêm mới.");
//     return;
//   }

//   suppressMouseUpRef.current = true;
//   setMovingSeat(null);
//   setDrawSelection({ startX: x, startY: y, endX: x, endY: y });
//   setIsDrawingArea(true);
//   setError("");
// };

//   const handleSeatMouseEnter = (x, y) => {
//     if (!isDrawingArea) return;

//     setDrawSelection((prev) =>
//       prev
//         ? {
//             ...prev,
//             endX: x,
//             endY: y,
//           }
//         : prev
//     );
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!blocks.length) {
//       setError("Không có khu vực nào để lưu.");
//       return;
//     }

//     if (overCapacity) {
//       setError(
//         `Tổng số ghế đang là ${totalQuota.toLocaleString("vi-VN")}, vượt quá sức chứa ${GRID_CAPACITY.toLocaleString("vi-VN")} vị trí.`
//       );
//       return;
//     }

//     if (mismatchBlocks.length) {
//       setError(
//         `Số ghế thực tế phải khớp quota đã khai báo. Hãy kiểm tra lại: ${mismatchBlocks
//           .map((block) => block.className)
//           .join(", ")}.`
//       );
//       return;
//     }

//     setSubmitting(true);
//     setError("");
//     setSuccessMessage("");

//     try {
//       const payload = buildLayoutPayload(blocks);
//       const response = await API.event.createLayout(eventId, payload);

//       if (laPhanHoiThanhCong(response)) {
//         setSuccessMessage(
//           `Đã lưu sơ đồ thành công • ${response.data.data?.seatsCreated ?? 0} ghế đã được tạo.`
//         );
//         onDone?.();
//         return;
//       }

//       setError("Không thể lưu sơ đồ chỗ ngồi.");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Có lỗi xảy ra khi lưu bước 3.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <form className="create-event-step3" onSubmit={handleSubmit}>
//       <div className="create-event-step3__toolbar create-event-step3__toolbar--arena">
//         <div>
//           <h3>Thiết lập sơ đồ chỗ ngồi</h3>
//         </div>

//         <div className="create-event-step3__toolbar-actions">
//           <button
//             type="button"
//             className="create-event-button create-event-button--secondary"
//             onClick={handleResetLayout}
//             disabled={loading || submitting}
//           >
//             Đặt lại sơ đồ
//           </button>

//           <button type="submit" className="create-event-button" disabled={loading || submitting}>
//             {submitting ? "Đang lưu..." : "Lưu sơ đồ"}
//           </button>
//         </div>
//       </div>

//       {loading ? <p className="create-event-feedback">Đang tải hạng vé...</p> : null}
//       {error ? <p className="create-event-feedback create-event-feedback--error">{error}</p> : null}
//       {successMessage ? (
//         <p className="create-event-feedback create-event-feedback--success">{successMessage}</p>
//       ) : null}

//       {!loading && !ticketClasses.length ? (
//         <p className="create-event-feedback">Chưa có hạng vé nào. Hãy quay lại bước 2.</p>
//       ) : null}

//       {!loading && ticketClasses.length ? (
//         <>
//           <div className="create-event-step3__top-stack">
//             <section className="create-event-section create-event-section--mockup create-event-step3__ticket-strip">
//               <div className="create-event-section__title-wrap">
//                 <h3>Danh sách khu / hạng vé</h3>
//               </div>

//               <div className="create-event-block-list create-event-block-list--top">
//                 {blocks.map((block) => {
//                   const isActive = block.blockId === selectedBlockId;
//                   const seatCount = demSoGhe(block);
//                   const isMismatch = seatCount !== Number(block.quota || 0);

//                   return (
//                     <button
//                       key={block.blockId}
//                       type="button"
//                       className={`create-event-block-card${isActive ? " is-active" : ""}${
//                         isMismatch ? " is-warning" : ""
//                       }`}
//                       onClick={() => setSelectedBlockId(block.blockId)}
//                     >
//                       <span
//                         className="create-event-block-card__dot"
//                         style={{ backgroundColor: block.color }}
//                       />
//                       <div>
//                         <strong>{block.blockName}</strong>
//                         <small>
//                           {block.className} • {nhanLoaiVe(block.type)} • {seatCount.toLocaleString("vi-VN")} /{" "}
//                           {Number(block.quota || 0).toLocaleString("vi-VN")} ghế
//                         </small>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </section>

//             <div className="create-event-step3__top-grid">
//               <section className="create-event-section create-event-section--mockup create-event-step3__config-card">
//                 <div className="create-event-section__title-wrap">
//                   <h3>Tùy chỉnh khu đang chọn</h3>
//                 </div>

//                 {selectedBlock ? (
//                   <>
//                     <div className="create-event-grid create-event-grid--two-columns">
//                       <label className="create-event-field">
//                         <span>Tên khu</span>
//                         <input
//                           type="text"
//                           name="blockName"
//                           value={selectedBlock.blockName}
//                           onChange={handleBlockFieldChange}
//                         />
//                       </label>

//                       <label className="create-event-field">
//                         <span>Mã khu</span>
//                         <input
//                           type="text"
//                           name="blockId"
//                           value={selectedBlock.blockId}
//                           onChange={handleBlockFieldChange}
//                         />
//                       </label>
//                     </div>

//                     <div className="create-event-grid create-event-grid--two-columns create-event-grid--align-end">
//                       <label className="create-event-field">
//                         <span>Hạng vé</span>
//                         <select
//                           name="ticketClassId"
//                           value={selectedBlock.ticketClassId}
//                           onChange={handleBlockFieldChange}
//                         >
//                           {ticketClasses.map((ticketClass) => (
//                             <option key={ticketClass.ticketClassId} value={ticketClass.ticketClassId}>
//                               {ticketClass.className}
//                             </option>
//                           ))}
//                         </select>
//                       </label>

//                       <div className="create-event-step3__mini-stats">
//                         <div className="create-event-step3__mini-stat">
//                           <strong>{selectedSeatCount.toLocaleString("vi-VN")}</strong>
//                           <span>Đã đặt</span>
//                         </div>
//                         <div className="create-event-step3__mini-stat">
//                           <strong>{Number(selectedBlock.quota || 0).toLocaleString("vi-VN")}</strong>
//                           <span>Quota</span>
//                         </div>
//                         <div className="create-event-step3__mini-stat">
//                           <strong>{selectedRemaining.toLocaleString("vi-VN")}</strong>
//                           <span>Còn thiếu</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="create-event-step3__panel-actions create-event-step3__panel-actions--top">
//                       <button
//                         type="button"
//                         className="create-event-button create-event-button--secondary"
//                         onClick={handleClearSelectedBlock}
//                       >
//                         Xóa toàn bộ ghế khu này
//                       </button>

//                       {movingSeat ? (
//                         <button
//                           type="button"
//                           className="create-event-button create-event-button--ghost"
//                           onClick={() => setMovingSeat(null)}
//                         >
//                           Bỏ chọn ghế đang dời
//                         </button>
//                       ) : null}
//                     </div>
//                   </>
//                 ) : (
//                   <p className="create-event-feedback">Chọn một khu để chỉnh sửa.</p>
//                 )}
//               </section>

//               <section className="create-event-section create-event-section--mockup create-event-step3__legend-card">
//                 <div className="create-event-section__title-wrap">
//                   <h3>Chú thích và thống kê</h3>
//                 </div>

//                 <div className="create-event-legend create-event-legend--grid">
//                   {ticketClasses.map((ticketClass) => (
//                     <div key={ticketClass.ticketClassId} className="create-event-legend__item">
//                       <span style={{ backgroundColor: ticketClass.color }} />
//                       <div>
//                         <strong>{ticketClass.className}</strong>
//                         <small>
//                           #{ticketClass.ticketClassId} • {nhanLoaiVe(ticketClass.type)} •{" "}
//                           {Number(ticketClass.price).toLocaleString("vi-VN")} VNĐ
//                         </small>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="create-event-step3__stats create-event-step3__stats--arena">
//                   <div className="create-event-step3__stat-card">
//                     <strong>{GRID_CAPACITY.toLocaleString("vi-VN")}</strong>
//                     <span>Sức chứa tối đa</span>
//                   </div>
//                   <div className="create-event-step3__stat-card">
//                     <strong>{totalQuota.toLocaleString("vi-VN")}</strong>
//                     <span>Tổng số chỗ của sự kiện</span>
//                   </div>
//                   <div className="create-event-step3__stat-card">
//                     <strong>{placedSeats.toLocaleString("vi-VN")}</strong>
//                     <span>Ghế đã đặt trên sơ đồ</span>
//                   </div>
//                 </div>
//               </section>
//             </div>
//           </div>

//           <section className="create-event-canvas create-event-canvas--arena">
//             <div className="create-event-canvas__stage create-event-canvas__stage--arena">
//               {CANVAS.stageLabel}
//             </div>

//             <div className="create-event-canvas__meta create-event-canvas__meta--arena">
//               <span>
//                 Khu đang chọn: <strong>{selectedBlock?.blockName || "Chưa chọn"}</strong>
//               </span>
//               <span>
//                 <strong>{selectedSeatCount.toLocaleString("vi-VN")}</strong> /{" "}
//                 {Number(selectedBlock?.quota || 0).toLocaleString("vi-VN")} ghế của khu này
//               </span>
//               <span>
//                 {movingSeat
//                   ? `Đang dời ghế: hàng ${movingSeat.y}, cột ${movingSeat.x}`
//                   : "Nhấn đúp vào ghế để xóa nhanh"}
//               </span>
//             </div>

//             <div className="create-event-seat-editor create-event-seat-editor--arena">
//               <div className="create-event-canvas__board create-event-canvas__board--grid create-event-canvas__board--arena">
//                 <div
//                   className="create-event-seat-grid create-event-seat-grid--arena"
//                   style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)` }}
//                 >
//                   {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
//                     const x = (index % GRID_COLS) + 1;
//                     const y = Math.floor(index / GRID_COLS) + 1;
//                     const key = seatKey(x, y);
//                     const ownerBlockId = occupiedMap.get(key);
//                     const ownerBlock = ownerBlockMap.get(ownerBlockId);
//                     const isActiveBlock = ownerBlockId === selectedBlockId;
//                     const isMovingSeat = movingSeat?.x === x && movingSeat?.y === y;
//                     const isPreview = previewCells.has(key);
//                     const isTarget = !ownerBlockId && Boolean(movingSeat);

//                     return (
//                       <button
//                         key={key}
//                         type="button"
//                         className={`create-event-seat-cell create-event-seat-cell--arena${ownerBlockId ? " is-filled" : ""}${
//                           isActiveBlock ? " is-selected" : ""
//                         }${isMovingSeat ? " is-moving" : ""}${isTarget ? " is-target" : ""}${
//                           isPreview ? " is-preview" : ""
//                         }`}
//                         style={
//                           ownerBlock
//                             ? {
//                                 backgroundColor: ownerBlock.color,
//                                 borderColor: ownerBlock.color,
//                               }
//                             : undefined
//                         }
//                         title={`Hàng ${y} • Cột ${x}${ownerBlock ? ` • ${ownerBlock.className}` : ""}`}
// onMouseDown={() => handleSeatMouseDown(x, y)}
// onMouseEnter={() => handleSeatMouseEnter(x, y)}
//                       >
//                         <span className="sr-only">Ghế {x}-{y}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </section>
//         </>
//       ) : null}

//       <div className="create-event-actions">
//         <button
//           type="button"
//           className="create-event-button create-event-button--ghost"
//           onClick={onBack}
//           disabled={loading || submitting}
//         >
//           Quay lại bước 2
//         </button>
//       </div>
//     </form>
//   );
// };

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API } from "../../../../api/api.js";

const CANVAS = {
  x: 0,
  y: 0,
  width: 1200,
  height: 760,
  stageLabel: "SÂN KHẤU",
};

const GRID_ROWS = 25;
const GRID_COLS = 40;
const GRID_CAPACITY = GRID_ROWS * GRID_COLS; // 1000
const BOARD_MARGIN = 1;
const BLOCK_GAP = 2;
const CELL_SIZE = 16;

function laPhanHoiThanhCong(response) {
  return response?.data?.status === "success";
}

function seatKey(x, y) {
  return `${x}-${y}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nhanLoaiVe(type) {
  return type === "STANDING" ? "Ghế đứng" : "Ghế ngồi";
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

function normalizeSeatPoints(points = []) {
  const map = new Map();

  points.forEach((point) => {
    const x = clamp(Number(point?.x || 0), 1, GRID_COLS);
    const y = clamp(Number(point?.y || 0), 1, GRID_ROWS);
    map.set(seatKey(x, y), { x, y });
  });

  return Array.from(map.values()).sort((a, b) => a.y - b.y || a.x - b.x);
}

function demSoGhe(block) {
  return normalizeSeatPoints(block?.seatPoints).length;
}

function taoPhanBoMacDinh(ticketClasses = []) {
  let cursorX = BOARD_MARGIN + 1;
  let cursorY = BOARD_MARGIN + 1;
  let bandHeight = 0;

  return ticketClasses.map((ticketClass, index) => {
    const quota = clamp(Number(ticketClass.quota || 0), 0, GRID_CAPACITY);
    const kyTu = String.fromCharCode(65 + index);
    const points = [];

    if (quota > 0) {
      let cols = clamp(
        Math.ceil(Math.sqrt(quota * 1.25)),
        5,
        Math.max(5, GRID_COLS - BOARD_MARGIN * 2)
      );
      let rows = Math.ceil(quota / cols);

      if (cursorX + cols > GRID_COLS - BOARD_MARGIN + 1) {
        cursorX = BOARD_MARGIN + 1;
        cursorY += bandHeight + BLOCK_GAP;
        bandHeight = 0;
      }

      if (cursorY + rows > GRID_ROWS - BOARD_MARGIN + 1) {
        cursorX = BOARD_MARGIN + 1;
        cursorY = BOARD_MARGIN + 1;
        bandHeight = 0;
        cols = Math.min(cols, GRID_COLS - BOARD_MARGIN * 2);
        rows = Math.ceil(quota / Math.max(cols, 1));
      }

      for (let i = 0; i < quota; i += 1) {
        const x = cursorX + (i % cols);
        const y = cursorY + Math.floor(i / cols);

        if (x > GRID_COLS - BOARD_MARGIN || y > GRID_ROWS - BOARD_MARGIN) break;
        points.push({ x, y });
      }

      bandHeight = Math.max(bandHeight, rows);
      cursorX += cols + BLOCK_GAP;
    }

    return {
      blockId: `${taoTienToMaKhu(ticketClass.className)}-${kyTu}`,
      blockName: `Khu ${kyTu}`,
      ticketClassId: ticketClass.ticketClassId,
      className: ticketClass.className,
      type: ticketClass.type,
      color: ticketClass.color,
      price: Number(ticketClass.price || 0),
      quota,
      seatPoints: normalizeSeatPoints(points),
      defaultIndex: index,
    };
  });
}

function taoGheTuLayoutDaLuu(savedBlock, layoutPayload) {
  if (Array.isArray(savedBlock?.seats) && savedBlock.seats.length) {
    return normalizeSeatPoints(savedBlock.seats);
  }

  const rows = Number(savedBlock?.rows || 0);
  const cols = Number(savedBlock?.cols || 0);
  if (!rows || !cols) return [];

  const savedCanvasWidth = Number(layoutPayload?.canvas?.width || CANVAS.width);
  const savedCanvasHeight = Number(layoutPayload?.canvas?.height || CANVAS.height);
  const savedGridCols = Number(layoutPayload?.grid?.cols || GRID_COLS);
  const savedGridRows = Number(layoutPayload?.grid?.rows || GRID_ROWS);

  const deletedSet = new Set(
    Array.isArray(savedBlock?.deletedSeats)
      ? savedBlock.deletedSeats.map((seat) => `${seat.row}-${seat.col}`)
      : []
  );

  const startCol = clamp(
    Math.round((Number(savedBlock?.position?.x || 0) / Math.max(savedCanvasWidth, 1)) * savedGridCols) + 1,
    1,
    GRID_COLS
  );

  const startRow = clamp(
    Math.round((Number(savedBlock?.position?.y || 0) / Math.max(savedCanvasHeight, 1)) * savedGridRows) + 1,
    1,
    GRID_ROWS
  );

  const points = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      if (deletedSet.has(`${row}-${col}`)) continue;
      const x = startCol + col - 1;
      const y = startRow + row - 1;
      if (x > GRID_COLS || y > GRID_ROWS) continue;
      points.push({ x, y });
    }
  }

  return normalizeSeatPoints(points);
}

function taoPayloadChoBlock(block) {
  const seatPoints = normalizeSeatPoints(block.seatPoints);

  if (!seatPoints.length) {
    return {
      blockId: String(block.blockId || "").trim(),
      blockName: String(block.blockName || "").trim(),
      ticketClassId: Number(block.ticketClassId),
      type: block.type,
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
    type: block.type,
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

function buildDefaultBlocks(ticketClasses = []) {
  return taoPhanBoMacDinh(ticketClasses);
}

function buildBlocksFromSavedLayout(ticketClasses = [], layoutPayload) {
  const defaultBlocks = buildDefaultBlocks(ticketClasses);
  const savedBlocks = Array.isArray(layoutPayload?.seatLayout) ? layoutPayload.seatLayout : [];

  return defaultBlocks.map((block, index) => {
    const savedBlock = savedBlocks.find(
      (item) => String(item.ticketClassId) === String(block.ticketClassId)
    );

    if (!savedBlock) return block;

    const savedSeats = taoGheTuLayoutDaLuu(savedBlock, layoutPayload);

    return {
      ...block,
      blockId: savedBlock.blockId || block.blockId,
      blockName: savedBlock.blockName || block.blockName,
      seatPoints: savedSeats.length
        ? savedSeats.slice(0, Number(block.quota || 0))
        : defaultBlocks[index]?.seatPoints || [],
      defaultIndex: index,
    };
  });
}

function taoDanhSachOTrongKhung(selection, occupiedMap) {
  if (!selection) return [];

  const minX = Math.max(1, Math.min(selection.startX, selection.endX));
  const maxX = Math.min(GRID_COLS, Math.max(selection.startX, selection.endX));
  const minY = Math.max(1, Math.min(selection.startY, selection.endY));
  const maxY = Math.min(GRID_ROWS, Math.max(selection.startY, selection.endY));

  const cells = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (!occupiedMap.has(seatKey(x, y))) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

/**
 * Step3SeatLayout
 *
 * Props for lifted state (passed from CreateEventPage so layout progress
 * survives navigating back to Step 2):
 *   blocks / setBlocks
 *   ticketClasses / setTicketClasses
 *   selectedBlockId / setSelectedBlockId
 *
 * When `blocks` is null on mount, the component fetches from the API as normal.
 * Once loaded the parent holds the data, so re-mounting (back → forward) skips
 * the fetch and restores the user's unsaved work immediately.
 */
export const Step3SeatLayout = ({
  eventId,
  // Lifted state from CreateEventPage
  blocks,
  setBlocks,
  ticketClasses,
  setTicketClasses,
  selectedBlockId,
  setSelectedBlockId,
  onDone,
  onBack,
}) => {
  const [movingSeat, setMovingSeat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [drawSelection, setDrawSelection] = useState(null);
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const suppressMouseUpRef = useRef(false);

  // Fetch only when blocks haven't been loaded yet (null = first visit or
  // invalidated because Step 2 ticket classes changed).
  useEffect(() => {
    if (blocks !== null) return; // Already have data — skip fetch, preserve progress

    const fetchData = async () => {
      if (!eventId) {
        setError("Thiếu mã sự kiện để tải sơ đồ chỗ ngồi.");
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
          setError("Không lấy được danh sách hạng vé.");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, blocks]);

  useEffect(() => {
    setMovingSeat(null);
    setDrawSelection(null);
    setIsDrawingArea(false);
  }, [selectedBlockId]);

  const selectedBlock = useMemo(
    () => (blocks ?? []).find((block) => block.blockId === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const occupiedMap = useMemo(() => {
    const map = new Map();
    (blocks ?? []).forEach((block) => {
      normalizeSeatPoints(block.seatPoints).forEach((point) => {
        map.set(seatKey(point.x, point.y), block.blockId);
      });
    });
    return map;
  }, [blocks]);

  const ownerBlockMap = useMemo(() => {
    const map = new Map();
    (blocks ?? []).forEach((block) => {
      map.set(block.blockId, block);
    });
    return map;
  }, [blocks]);

  const totalQuota = useMemo(
    () => (ticketClasses ?? []).reduce((sum, ticketClass) => sum + Number(ticketClass.quota || 0), 0),
    [ticketClasses]
  );

  const placedSeats = useMemo(
    () => (blocks ?? []).reduce((sum, block) => sum + demSoGhe(block), 0),
    [blocks]
  );

  const mismatchBlocks = useMemo(
    () => (blocks ?? []).filter((block) => demSoGhe(block) !== Number(block.quota || 0)),
    [blocks]
  );

  const selectedSeatCount = useMemo(() => demSoGhe(selectedBlock), [selectedBlock]);
  const selectedRemaining = Math.max(0, Number(selectedBlock?.quota || 0) - selectedSeatCount);
  const overCapacity = totalQuota > GRID_CAPACITY;

  const previewCells = useMemo(() => {
    const map = new Set();
    if (!drawSelection || !selectedBlock) return map;

    taoDanhSachOTrongKhung(drawSelection, occupiedMap)
      .slice(0, selectedRemaining)
      .forEach((cell) => map.add(seatKey(cell.x, cell.y)));

    return map;
  }, [drawSelection, occupiedMap, selectedBlock, selectedRemaining]);

  const updateSelectedBlock = useCallback((updater) => {
    setBlocks((prev) =>
      (prev ?? []).map((block) => (block.blockId === selectedBlockId ? updater(block) : block))
    );
  }, [selectedBlockId, setBlocks]);

  const handleBlockFieldChange = (event) => {
    const { name, value } = event.target;

    updateSelectedBlock((block) => {
      if (name === "ticketClassId") {
        const nextTicketClass = (ticketClasses ?? []).find(
          (ticketClass) => String(ticketClass.ticketClassId) === String(value)
        );

        if (!nextTicketClass) return block;

        return {
          ...block,
          ticketClassId: nextTicketClass.ticketClassId,
          className: nextTicketClass.className,
          type: nextTicketClass.type,
          color: nextTicketClass.color,
          price: Number(nextTicketClass.price || 0),
          quota: Number(nextTicketClass.quota || 0),
          seatPoints: normalizeSeatPoints(block.seatPoints || []).slice(
            0,
            Number(nextTicketClass.quota || 0)
          ),
        };
      }

      return {
        ...block,
        [name]: value,
      };
    });
  };

  const handleResetLayout = () => {
    const defaultBlocks = buildDefaultBlocks(ticketClasses ?? []);
    setBlocks(defaultBlocks);
    setSelectedBlockId(defaultBlocks[0]?.blockId ?? "");
    setMovingSeat(null);
    setDrawSelection(null);
    setIsDrawingArea(false);
    setError("");
    setSuccessMessage("");
  };

  const handleClearSelectedBlock = () => {
    if (!selectedBlock) return;
    updateSelectedBlock((block) => ({ ...block, seatPoints: [] }));
    setMovingSeat(null);
    setDrawSelection(null);
    setIsDrawingArea(false);
    setError("");
  };

  const handleDeleteSeat = useCallback((x, y) => {
    const ownerBlockId = occupiedMap.get(seatKey(x, y));
    if (!ownerBlockId) return;

    setSelectedBlockId(ownerBlockId);
    setBlocks((prev) =>
      (prev ?? []).map((block) => {
        if (block.blockId !== ownerBlockId) return block;
        return {
          ...block,
          seatPoints: normalizeSeatPoints(
            (block.seatPoints || []).filter((point) => !(point.x === x && point.y === y))
          ),
        };
      })
    );

    if (movingSeat?.x === x && movingSeat?.y === y) {
      setMovingSeat(null);
    }

    setError("");
    setSuccessMessage("");
  }, [movingSeat, occupiedMap, setBlocks, setSelectedBlockId]);

  const finalizeAreaDraw = useCallback(() => {
    if (!isDrawingArea || !drawSelection || !selectedBlock) {
      setIsDrawingArea(false);
      setDrawSelection(null);
      return;
    }

    const seatsCanAdd = Math.max(0, Number(selectedBlock.quota || 0) - demSoGhe(selectedBlock));

    if (!seatsCanAdd) {
      setError("Hạng vé này đã đủ số ghế theo quota. Bạn chỉ có thể dời hoặc xóa ghế hiện có.");
      setIsDrawingArea(false);
      setDrawSelection(null);
      return;
    }

    const candidates = taoDanhSachOTrongKhung(drawSelection, occupiedMap);
    const seatsToAdd = candidates.slice(0, seatsCanAdd);

    if (!seatsToAdd.length) {
      setIsDrawingArea(false);
      setDrawSelection(null);
      return;
    }

    updateSelectedBlock((block) => ({
      ...block,
      seatPoints: normalizeSeatPoints([...(block.seatPoints || []), ...seatsToAdd]),
    }));

    if (candidates.length > seatsCanAdd) {
      setError(
        `Khu này chỉ còn thiếu ${seatsCanAdd.toLocaleString("vi-VN")} ghế nên hệ thống chỉ thêm đủ quota trong vùng bạn vừa vẽ.`
      );
    } else {
      setError("");
    }

    setIsDrawingArea(false);
    setDrawSelection(null);
  }, [drawSelection, isDrawingArea, occupiedMap, selectedBlock, updateSelectedBlock]);

  useEffect(() => {
    if (!isDrawingArea) return undefined;

    const handleMouseUp = () => {
      if (suppressMouseUpRef.current) {
        suppressMouseUpRef.current = false;
      }
      finalizeAreaDraw();
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [finalizeAreaDraw, isDrawingArea]);

  const handleSeatMouseDown = (x, y) => {
    const ownerBlockId = occupiedMap.get(seatKey(x, y));

    // Có ghế rồi => click 1 lần là xóa
    if (ownerBlockId) {
      handleDeleteSeat(x, y);
      return;
    }

    if (!selectedBlock) return;

    if (selectedRemaining <= 0) {
      setError("Khu đang chọn đã đủ ghế theo quota nên không thể thêm mới.");
      return;
    }

    suppressMouseUpRef.current = true;
    setMovingSeat(null);
    setDrawSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsDrawingArea(true);
    setError("");
  };

  const handleSeatMouseEnter = (x, y) => {
    if (!isDrawingArea) return;

    setDrawSelection((prev) =>
      prev
        ? {
            ...prev,
            endX: x,
            endY: y,
          }
        : prev
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!(blocks ?? []).length) {
      setError("Không có khu vực nào để lưu.");
      return;
    }

    if (overCapacity) {
      setError(
        `Tổng số ghế đang là ${totalQuota.toLocaleString("vi-VN")}, vượt quá sức chứa ${GRID_CAPACITY.toLocaleString("vi-VN")} vị trí.`
      );
      return;
    }

    if (mismatchBlocks.length) {
      setError(
        `Số ghế thực tế phải khớp quota đã khai báo. Hãy kiểm tra lại: ${mismatchBlocks
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
          `Đã lưu sơ đồ thành công • ${response.data.data?.seatsCreated ?? 0} ghế đã được tạo.`
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
      <div className="create-event-step3__toolbar create-event-step3__toolbar--arena">
        <div>
          <h3>Thiết lập sơ đồ chỗ ngồi</h3>
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

      {!loading && !(ticketClasses ?? []).length ? (
        <p className="create-event-feedback">Chưa có hạng vé nào. Hãy quay lại bước 2.</p>
      ) : null}

      {!loading && (ticketClasses ?? []).length ? (
        <>
          <div className="create-event-step3__top-stack">
            <section className="create-event-section create-event-section--mockup create-event-step3__ticket-strip">
              <div className="create-event-section__title-wrap">
                <h3>Danh sách khu / hạng vé</h3>
              </div>

              <div className="create-event-block-list create-event-block-list--top">
                {(blocks ?? []).map((block) => {
                  const isActive = block.blockId === selectedBlockId;
                  const seatCount = demSoGhe(block);
                  const isMismatch = seatCount !== Number(block.quota || 0);

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
                        <strong>{block.blockName}</strong>
                        <small>
                          {block.className} • {nhanLoaiVe(block.type)} • {seatCount.toLocaleString("vi-VN")} /{" "}
                          {Number(block.quota || 0).toLocaleString("vi-VN")} ghế
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="create-event-step3__top-grid">
              <section className="create-event-section create-event-section--mockup create-event-step3__config-card">
                <div className="create-event-section__title-wrap">
                  <h3>Tùy chỉnh khu đang chọn</h3>
                </div>

                {selectedBlock ? (
                  <>
                    <div className="create-event-grid create-event-grid--two-columns">
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
                    </div>

                    <div className="create-event-grid create-event-grid--two-columns create-event-grid--align-end">
                      <label className="create-event-field">
                        <span>Hạng vé</span>
                        <select
                          name="ticketClassId"
                          value={selectedBlock.ticketClassId}
                          onChange={handleBlockFieldChange}
                        >
                          {(ticketClasses ?? []).map((ticketClass) => (
                            <option key={ticketClass.ticketClassId} value={ticketClass.ticketClassId}>
                              {ticketClass.className}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="create-event-step3__mini-stats">
                        <div className="create-event-step3__mini-stat">
                          <strong>{selectedSeatCount.toLocaleString("vi-VN")}</strong>
                          <span>Đã đặt</span>
                        </div>
                        <div className="create-event-step3__mini-stat">
                          <strong>{Number(selectedBlock.quota || 0).toLocaleString("vi-VN")}</strong>
                          <span>Quota</span>
                        </div>
                        <div className="create-event-step3__mini-stat">
                          <strong>{selectedRemaining.toLocaleString("vi-VN")}</strong>
                          <span>Còn thiếu</span>
                        </div>
                      </div>
                    </div>

                    <div className="create-event-step3__panel-actions create-event-step3__panel-actions--top">
                      <button
                        type="button"
                        className="create-event-button create-event-button--secondary"
                        onClick={handleClearSelectedBlock}
                      >
                        Xóa toàn bộ ghế khu này
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
                  <p className="create-event-feedback">Chọn một khu để chỉnh sửa.</p>
                )}
              </section>

              <section className="create-event-section create-event-section--mockup create-event-step3__legend-card">
                <div className="create-event-section__title-wrap">
                  <h3>Chú thích và thống kê</h3>
                </div>

                <div className="create-event-legend create-event-legend--grid">
                  {(ticketClasses ?? []).map((ticketClass) => (
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

                <div className="create-event-step3__stats create-event-step3__stats--arena">
                  <div className="create-event-step3__stat-card">
                    <strong>{GRID_CAPACITY.toLocaleString("vi-VN")}</strong>
                    <span>Sức chứa tối đa</span>
                  </div>
                  <div className="create-event-step3__stat-card">
                    <strong>{totalQuota.toLocaleString("vi-VN")}</strong>
                    <span>Tổng số chỗ của sự kiện</span>
                  </div>
                  <div className="create-event-step3__stat-card">
                    <strong>{placedSeats.toLocaleString("vi-VN")}</strong>
                    <span>Ghế đã đặt trên sơ đồ</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="create-event-canvas create-event-canvas--arena">
            <div className="create-event-canvas__stage create-event-canvas__stage--arena">
              {CANVAS.stageLabel}
            </div>

            <div className="create-event-canvas__meta create-event-canvas__meta--arena">
              <span>
                Khu đang chọn: <strong>{selectedBlock?.blockName || "Chưa chọn"}</strong>
              </span>
              <span>
                <strong>{selectedSeatCount.toLocaleString("vi-VN")}</strong> /{" "}
                {Number(selectedBlock?.quota || 0).toLocaleString("vi-VN")} ghế của khu này
              </span>
              <span>
                {movingSeat
                  ? `Đang dời ghế: hàng ${movingSeat.y}, cột ${movingSeat.x}`
                  : "Nhấn đúp vào ghế để xóa nhanh"}
              </span>
            </div>

            <div className="create-event-seat-editor create-event-seat-editor--arena">
              <div className="create-event-canvas__board create-event-canvas__board--grid create-event-canvas__board--arena">
                <div
                  className="create-event-seat-grid create-event-seat-grid--arena"
                  style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)` }}
                >
                  {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
                    const x = (index % GRID_COLS) + 1;
                    const y = Math.floor(index / GRID_COLS) + 1;
                    const key = seatKey(x, y);
                    const ownerBlockId = occupiedMap.get(key);
                    const ownerBlock = ownerBlockMap.get(ownerBlockId);
                    const isActiveBlock = ownerBlockId === selectedBlockId;
                    const isMovingSeat = movingSeat?.x === x && movingSeat?.y === y;
                    const isPreview = previewCells.has(key);
                    const isTarget = !ownerBlockId && Boolean(movingSeat);

                    return (
                      <button
                        key={key}
                        type="button"
                        className={`create-event-seat-cell create-event-seat-cell--arena${ownerBlockId ? " is-filled" : ""}${
                          isActiveBlock ? " is-selected" : ""
                        }${isMovingSeat ? " is-moving" : ""}${isTarget ? " is-target" : ""}${
                          isPreview ? " is-preview" : ""
                        }`}
                        style={
                          ownerBlock
                            ? {
                                backgroundColor: ownerBlock.color,
                                borderColor: ownerBlock.color,
                              }
                            : undefined
                        }
                        title={`Hàng ${y} • Cột ${x}${ownerBlock ? ` • ${ownerBlock.className}` : ""}`}
                        onMouseDown={() => handleSeatMouseDown(x, y)}
                        onMouseEnter={() => handleSeatMouseEnter(x, y)}
                      >
                        <span className="sr-only">Ghế {x}-{y}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
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
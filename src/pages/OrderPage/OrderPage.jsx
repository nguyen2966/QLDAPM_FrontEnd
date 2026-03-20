import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { API } from "../../api/api.js";
import { useSeatSocket } from "../../hooks/useSeatSocket.js";
import { SeatMap } from "./components/SeatMap.jsx";
import "./OrderPage.css";

const MAX_SELECTABLE_SEATS = 5;

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Đang cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function formatCountdown(deadline) {
  if (!deadline) return "00:00";

  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function OrderPage() {
  const location = useLocation();
  const { eventId } = useParams();

  const [eventDetail, setEventDetail] = useState(location.state?.eventDetail ?? null);
  const [seats, setSeats] = useState(location.state?.eventDetail?.seats ?? []);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(!location.state?.eventDetail);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("00:00");

  useEffect(() => {
    let cancelled = false;

    async function fetchEventDetail() {
      setLoading(true);
      setError("");

      try {
        const response = await API.event.getById(eventId);
        const data = response.data?.data;

        if (cancelled) return;

        setEventDetail(data ?? null);
        setSeats(data?.seats ?? []);
      } catch (fetchError) {
        if (cancelled) return;
        setError(getErrorMessage(fetchError, "Không thể tải dữ liệu sự kiện."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEventDetail();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const seatsById = useMemo(() => {
    const map = new Map();

    for (const seat of seats) {
      map.set(seat.seatId, seat);
    }

    return map;
  }, [seats]);

  useEffect(() => {
    setSelectedIds((previous) => {
      const next = new Set();
      let changed = false;

      previous.forEach((seatId) => {
        const seat = seatsById.get(seatId);
        if (seat?.status === "AVAILABLE") {
          next.add(seatId);
        } else {
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [seatsById]);

  useEffect(() => {
    if (!activeOrder?.holdExpiredAt) {
      setCountdown("00:00");
      return undefined;
    }

    const updateCountdown = () => {
      const nextCountdown = formatCountdown(activeOrder.holdExpiredAt);
      setCountdown(nextCountdown);

      if (nextCountdown === "00:00" && activeOrder.status === "PENDING") {
        setMessage("Đơn tạm giữ đã hết hạn. Hệ thống sẽ mở khóa ghế sau khi cron job đồng bộ.");
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeOrder]);

  useSeatSocket(
    Number(eventId),
    ({ seatId, status }) => {
      setSeats((previous) =>
        previous.map((seat) =>
          seat.seatId === seatId ? { ...seat, status } : seat,
        ),
      );

      if (status !== "AVAILABLE") {
        setSelectedIds((previous) => {
          if (!previous.has(seatId)) return previous;
          const next = new Set(previous);
          next.delete(seatId);
          return next;
        });
      }
    },
    Boolean(eventId),
  );

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedIds.has(seat.seatId)),
    [selectedIds, seats],
  );

  const selectedSeatIds = useMemo(
    () => selectedSeats.map((seat) => seat.seatId),
    [selectedSeats],
  );

  const totalAmount = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + Number(seat.ticketClass?.price || 0), 0),
    [selectedSeats],
  );

  const seatStats = useMemo(() => {
    return seats.reduce(
      (stats, seat) => {
        stats.total += 1;
        stats[seat.status] = (stats[seat.status] || 0) + 1;
        return stats;
      },
      { total: 0, AVAILABLE: 0, PENDING: 0, BOOKED: 0 },
    );
  }, [seats]);

  function handleSelectSeat(seat) {
    setError("");
    setMessage("");

    if (!seat) return;

    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(seat.seatId)) {
        next.delete(seat.seatId);
        return next;
      }

      if (seat.status !== "AVAILABLE") {
        return previous;
      }

      if (next.size >= MAX_SELECTABLE_SEATS) {
        setError("Backend chỉ cho đặt tối đa 5 ghế. Vui lòng bỏ bớt ghế trước khi chọn tiếp.");
        return previous;
      }

      next.add(seat.seatId);
      return next;
    });
  }

  async function handleCreateOrder() {
    if (!selectedSeatIds.length) {
      setError("Hãy chọn ít nhất 1 ghế trước khi tạo đơn.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await API.order.createOrder({ seatIds: selectedSeatIds });
      const data = response.data?.data;

      setActiveOrder({
        orderId: data?.order?.orderId,
        seatIds: selectedSeatIds,
        holdExpiredAt: data?.holdExpiredAt || data?.order?.expiredAt,
        totalAmount: data?.order?.totalAmount || totalAmount,
        status: data?.order?.status || "PENDING",
      });

      setSelectedIds(new Set());
      setSeats((previous) =>
        previous.map((seat) =>
          selectedSeatIds.includes(seat.seatId)
            ? { ...seat, status: "PENDING" }
            : seat,
        ),
      );
      setMessage("Đã tạo đơn tạm giữ ghế thành công. Bạn có 5 phút để thanh toán.");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể tạo đơn đặt ghế."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmPayment() {
    if (!activeOrder?.orderId || !activeOrder?.seatIds?.length) {
      setError("Không tìm thấy đơn tạm giữ để xác nhận thanh toán.");
      return;
    }

    setConfirming(true);
    setError("");
    setMessage("");

    try {
      await API.order.confirmPayment(activeOrder.orderId, {
        seatIds: activeOrder.seatIds,
      });

      setSeats((previous) =>
        previous.map((seat) =>
          activeOrder.seatIds.includes(seat.seatId)
            ? { ...seat, status: "BOOKED" }
            : seat,
        ),
      );
      setActiveOrder(null);
      setMessage("Thanh toán thành công. Ghế đã chuyển sang trạng thái đã đặt.");
    } catch (confirmError) {
      setError(getErrorMessage(confirmError, "Không thể xác nhận thanh toán."));
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="order-page order-page--loading">
        <div className="order-page__state-card">Đang tải sơ đồ ghế...</div>
      </div>
    );
  }

  if (!eventDetail) {
    return (
      <div className="order-page order-page--loading">
        <div className="order-page__state-card">Không tìm thấy thông tin sự kiện.</div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <section className="order-page__hero">
        <div>
          <p className="order-page__eyebrow">Đặt ghế thời gian thực</p>
          <h1>{eventDetail.eventName}</h1>
          <p className="order-page__meta">
            {eventDetail.venue?.venueName || "Đang cập nhật địa điểm"} - {formatDate(eventDetail.dateToStart)}
          </p>
        </div>

        <div className="order-page__stats">
          <div className="order-page__stat-card">
            <strong>{seatStats.total}</strong>
            <span>Tổng ghế</span>
          </div>
          <div className="order-page__stat-card">
            <strong>{seatStats.AVAILABLE}</strong>
            <span>Còn trống</span>
          </div>
          <div className="order-page__stat-card">
            <strong>{seatStats.PENDING}</strong>
            <span>Đang giữ</span>
          </div>
          <div className="order-page__stat-card">
            <strong>{seatStats.BOOKED}</strong>
            <span>Đã đặt</span>
          </div>
        </div>
      </section>

      {error ? <div className="order-page__alert order-page__alert--error">{error}</div> : null}
      {message ? <div className="order-page__alert order-page__alert--success">{message}</div> : null}

      <section className="order-page__content">
        <div className="order-page__map-card">
          <div className="order-page__section-head">
            <div>
              <h2>Sơ đồ ghế</h2>
              <p>
                Ghế được render theo seatLayoutMap + seats[] và cập nhật thời gian thực qua
                socket seat_updated.
              </p>
            </div>
          </div>

          <SeatMap
            seatLayoutMap={eventDetail.seatLayoutMap}
            seats={seats}
            ticketClasses={eventDetail.ticketClasses}
            selectedIds={selectedIds}
            onSelect={handleSelectSeat}
          />
        </div>

        <aside className="order-page__sidebar">
          <div className="order-page__panel">
            <h3>Ghế đang chọn</h3>
            <p className="order-page__panel-note">
              Bạn có thể chọn tối đa {MAX_SELECTABLE_SEATS} ghế cho mỗi đơn hàng.
            </p>

            {selectedSeats.length ? (
              <ul className="order-page__selected-list">
                {selectedSeats.map((seat) => (
                  <li key={seat.seatId} className="order-page__selected-item">
                    <div>
                      <strong>{seat.name}</strong>
                      <span>{seat.ticketClass?.className || "Không rõ hạng vé"}</span>
                    </div>
                    <strong>{formatCurrency(seat.ticketClass?.price)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="order-page__empty-box">Chưa có ghế nào được chọn.</div>
            )}

            <div className="order-page__summary-row">
              <span>Số lượng</span>
              <strong>{selectedSeats.length}</strong>
            </div>
            <div className="order-page__summary-row order-page__summary-row--total">
              <span>Tạm tính</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <button
              type="button"
              className="order-page__primary-btn"
              disabled={!selectedSeatIds.length || submitting}
              onClick={handleCreateOrder}
            >
              {submitting ? "Đang giữ ghế..." : "Tạo đơn tạm giữ"}
            </button>
          </div>

          <div className="order-page__panel">
            <h3>Đơn tạm giữ hiện tại</h3>
            {activeOrder ? (
              <>
                <div className="order-page__summary-row">
                  <span>Mã đơn hàng</span>
                  <strong>#{activeOrder.orderId}</strong>
                </div>
                <div className="order-page__summary-row">
                  <span>Trạng thái</span>
                  <strong>{activeOrder.status}</strong>
                </div>
                <div className="order-page__summary-row">
                  <span>Hết hạn sau</span>
                  <strong>{countdown}</strong>
                </div>
                <div className="order-page__summary-row order-page__summary-row--total">
                  <span>Tổng tiền</span>
                  <strong>{formatCurrency(activeOrder.totalAmount)}</strong>
                </div>
                <button
                  type="button"
                  className="order-page__secondary-btn"
                  disabled={confirming || countdown === "00:00"}
                  onClick={handleConfirmPayment}
                >
                  {confirming ? "Đang xác nhận..." : "Xác nhận thanh toán"}
                </button>
              </>
            ) : (
              <div className="order-page__empty-box">
                Chưa có đơn tạm giữ. Sau khi tạo đơn, backend sẽ đẩy trạng thái PENDING qua socket.
              </div>
            )}
          </div>

          <div className="order-page__panel">
            <h3>Hạng vé</h3>
            <ul className="order-page__ticket-class-list">
              {(eventDetail.ticketClasses || []).map((ticketClass) => (
                <li key={ticketClass.ticketClassId} className="order-page__ticket-class-item">
                  <span
                    className="order-page__ticket-class-color"
                    style={{ background: ticketClass.color || "#e2e8f0" }}
                  />
                  <div>
                    <strong>{ticketClass.className}</strong>
                    <span>{formatCurrency(ticketClass.price)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
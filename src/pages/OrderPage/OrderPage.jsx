import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API } from "../../api/api.js";
import { useSeatSocket } from "../../hooks/useSeatSocket.js";
import { SeatMap } from "./components/SeatMap.jsx";
import { EventHero } from "./components/EventHero.jsx";
import { SeatStats } from "./components/SeatStats.jsx";
import { OrderSummaryPanel } from "./components/OrderSummaryPanel.jsx";
import "./OrderPage.css";
import { LoadingState } from "../../components/LoadingState/LoadingState.jsx";

const MAX_SELECTABLE_SEATS = 5;

function getErrorMessage(error, fallbackMessage) {
  return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
  );
}

export function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [eventDetail, setEventDetail] = useState(location.state?.eventDetail ?? null);
  const [seats, setSeats] = useState(location.state?.eventDetail?.seats ?? []);
  const [loading, setLoading] = useState(!location.state?.eventDetail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Đọc dữ liệu từ sessionStorage (nếu có)
  const savedOrder = JSON.parse(sessionStorage.getItem(`activeOrder_${eventId}`) || "{}");

  // Khởi tạo state với dữ liệu đã lưu
  const [existingOrderId, setExistingOrderId] = useState(savedOrder.orderId || null);
  const [myLockedSeats, setMyLockedSeats] = useState(new Set(savedOrder.seatIds || []));
  const [selectedIds, setSelectedIds] = useState(new Set(savedOrder.seatIds || []));

  useEffect(() => {
    sessionStorage.removeItem(`activeOrder_${eventId}`);
  }, [eventId]);

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
        if (!cancelled) setLoading(false);
      }
    }

    fetchEventDetail();

    return () => { cancelled = true; };
  }, [eventId]);

  const seatsById = useMemo(() => {
    const map = new Map();
    for (const seat of seats) map.set(seat.seatId, seat);
    return map;
  }, [seats]);

  // Drop selected seats that are no longer AVAILABLE
  useEffect(() => {
    setSelectedIds((previous) => {
      const next = new Set();
      let changed = false;

      previous.forEach((seatId) => {
        const seat = seatsById.get(seatId);
        if (seat?.status === "AVAILABLE" || myLockedSeats.has(seatId)) {
          next.add(seatId);
        } else {
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [seatsById, myLockedSeats]);

  useSeatSocket(
      Number(eventId),
      ({ seatId, status }) => {
        setSeats((previous) =>
            previous.map((seat) => (seat.seatId === seatId ? { ...seat, status } : seat)),
        );

        if (status !== "AVAILABLE") {
          setSelectedIds((previous) => {
            if (!previous.has(seatId)) return previous;
            if (myLockedSeats.has(seatId)) return previous;

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

  const totalAmount = useMemo(
      () => selectedSeats.reduce((sum, seat) => sum + Number(seat.ticketClass?.price || 0), 0),
      [selectedSeats],
  );

  const seatStats = useMemo(
      () =>
          seats.reduce(
              (stats, seat) => {
                stats.total += 1;
                stats[seat.status] = (stats[seat.status] || 0) + 1;
                return stats;
              },
              { total: 0, AVAILABLE: 0, PENDING: 0, BOOKED: 0 },
          ),
      [seats],
  );

  function handleSelectSeat(seat) {
    setError("");

    if (!seat) return;

    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(seat.seatId)) {
        next.delete(seat.seatId);
        return next;
      }

      if (seat.status !== "AVAILABLE" && !myLockedSeats.has(seat.seatId)) return previous;

      if (next.size >= MAX_SELECTABLE_SEATS) {
        setError("Backend chỉ cho đặt tối đa 5 ghế. Vui lòng bỏ bớt ghế trước khi chọn tiếp.");
        return previous;
      }

      next.add(seat.seatId);
      return next;
    });
  }

  async function handleCreateOrder() {
    const selectedSeatIds = selectedSeats.map((s) => s.seatId);

    if (!selectedSeatIds.length) {
      setError("Hãy chọn ít nhất 1 ghế trước khi tạo đơn.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let orderData;

      if (existingOrderId) {
        // Gọi API Update đơn hàng (Backend sẽ trả về thời gian holdExpiredAt mới)
        const response = await API.order.updateOrder(existingOrderId, { seatIds: selectedSeatIds });
        orderData = response.data?.data;
      } else {
        // Gọi API Create mới
        const response = await API.order.createOrder({ seatIds: selectedSeatIds });
        orderData = response.data?.data;
      }

      const currentOrderId = orderData?.order?.orderId || existingOrderId;
      const currentExpiredAt = orderData?.holdExpiredAt || orderData?.order?.expiredAt;

      // LƯU VÀO SESSION STORAGE (Để sống sót qua nút Browser Back)
      sessionStorage.setItem(`activeOrder_${eventId}`, JSON.stringify({
        orderId: currentOrderId,
        seatIds: selectedSeatIds
      }));
      setExistingOrderId(currentOrderId);
      setMyLockedSeats(new Set(selectedSeatIds));

      navigate(`/order/confirm/${currentOrderId}`, {
        state: {
          eventId: eventId, // Bắt buộc truyền eventId sang
          orderId: currentOrderId,
          seatIds: selectedSeatIds,
          holdExpiredAt: currentExpiredAt, // Bắt buộc truyền để đồng bộ đếm ngược
          totalAmount: orderData?.order?.totalAmount || totalAmount,
          eventName: eventDetail.eventName || "Sự kiện"
        },
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể tạo đơn đặt ghế."));
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
        <LoadingState displayText={"Đang tải sơ đồ ghế"}/>
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
        <EventHero eventDetail={eventDetail} />

        {error && <div className="order-page__alert order-page__alert--error">{error}</div>}

        <section className="order-page__content">
          <div className="order-page__map-card">
            <div className="order-page__section-head">
              <h2>Sơ đồ ghế</h2>
            </div>

            <SeatMap
                seatLayoutMap={eventDetail.seatLayoutMap}
                seats={seats}
                ticketClasses={eventDetail.ticketClasses || []}
                selectedIds={selectedIds}
                myLockedSeats={myLockedSeats}
                onSelect={handleSelectSeat}
            />
          </div>

          <aside className="order-page__sidebar">
            <SeatStats seatStats={seatStats} />
            <OrderSummaryPanel
                selectedSeats={selectedSeats}
                totalAmount={totalAmount}
                submitting={submitting}
                onCreateOrder={handleCreateOrder}
            />
          </aside>
        </section>
      </div>
  );
}
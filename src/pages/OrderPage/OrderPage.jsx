import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API } from "../../api/api.js";
import { useSeatSocket } from "../../hooks/useSeatSocket.js";
import { SeatMap } from "./components/SeatMap.jsx";
import { EventHero } from "./components/EventHero.jsx";
import { SeatStats } from "./components/SeatStats.jsx";
import { OrderSummaryPanel } from "./components/OrderSummaryPanel.jsx";
import "./OrderPage.css";

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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(!location.state?.eventDetail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        if (seat?.status === "AVAILABLE") {
          next.add(seatId);
        } else {
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [seatsById]);

  useSeatSocket(
    Number(eventId),
    ({ seatId, status }) => {
      setSeats((previous) =>
        previous.map((seat) => (seat.seatId === seatId ? { ...seat, status } : seat)),
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

      if (seat.status !== "AVAILABLE") return previous;

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
      const response = await API.order.createOrder({ seatIds: selectedSeatIds });
      const data = response.data?.data;

      navigate(`/order/confirm/${data?.order?.orderId}`, {
        state: {
          orderId: data?.order?.orderId,
          seatIds: selectedSeatIds,
          holdExpiredAt: data?.holdExpiredAt || data?.order?.expiredAt,
          totalAmount: data?.order?.totalAmount || totalAmount,
          status: data?.order?.status || "PENDING",
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
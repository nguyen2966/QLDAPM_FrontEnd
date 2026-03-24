const MAX_SELECTABLE_SEATS = 5;

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function OrderSummaryPanel({ selectedSeats, totalAmount, submitting, onCreateOrder }) {
  return (
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
        disabled={!selectedSeats.length || submitting}
        onClick={onCreateOrder}
      >
        {submitting ? "Đang giữ ghế..." : "Tạo đơn tạm giữ"}
      </button>
    </div>
  );
}
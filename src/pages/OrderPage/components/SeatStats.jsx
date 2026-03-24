export function SeatStats({ seatStats }) {
  return (
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
  );
}
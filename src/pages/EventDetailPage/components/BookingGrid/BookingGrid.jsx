import { useNavigate } from "react-router-dom";
import "./BookingGrid.css"

export function BookingGrid({ eventDetail, organizername, eventImgUrl }) {
  const navigate = useNavigate();
  return (  
    <div className="booking-grid">

      <div className="booking-grid-event-img-block">
        <img 
          src={eventImgUrl} 
          alt="event banner" 
          className="booking-grid-img"
        />
      </div>

      <div className="booking-grid-order-block">

        <button className="booking-grid-ticket-bar"
         onClick={()=>{
          navigate(`/order/${eventDetail.eventId}`, {
            state: {eventDetail}
          })
         }
        }>
          Order Now
        </button>

        <div className="booking-grid-organizer">
          Organizer: {organizername}
        </div>

      </div>

    </div>
  );
}
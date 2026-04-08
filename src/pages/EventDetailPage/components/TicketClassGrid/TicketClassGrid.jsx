import { MiniHeader } from "../MiniHeader/MiniHeader.jsx";
import "./TicketClassGrid.css";

export function TicketClassGrid({ticketClasses}){
  console.log(ticketClasses);
  return(
    <div className="ticket-class-block">
      <MiniHeader title={"Các hạng vé"}/>
      <div className="ticket-class-grid">
        {ticketClasses.map(item => (
            <div className="ticket-class-grid-item"  key={item.ticketClassId}>
                <div className="ticket-class-grid-item-detail">
                  <p>{item.className}</p>
                  {item.description}
                </div>
                 
                 <div className="ticket-class-grid-item-price">
                  {item.price}
                </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
import { useParams } from "react-router-dom";
import { API } from "../../api/api.js";
import { useEffect, useState } from "react";
import "./EventDetail.css"
import { HeadLine } from "./components/HeadLine/HeadLine.jsx";
import { BookingGrid } from "./components/BookingGrid/BookingGrid.jsx";
import { DetailGrid } from "./components/DetailGrid/DetailGrid.jsx";
import { TicketClassGrid } from "./components/TicketClassGrid/TicketClassGrid.jsx";
import { TermsReview } from "./components/TermsReviewBlock/TermsReview.jsx";

export const EventDetail = () => {
  const { eventId } = useParams();
  const [eventDetail, setEventDetail] = useState(null);

  useEffect(()=>{
    const fetchEventDetail = async () => {
      try{
        const response = await API.event.getById(eventId);
        setEventDetail(response.data.data);
        console.log(response.data.data);
      } catch(error){
        console.log(error);
      }
    };

    fetchEventDetail();
  },[eventId]);


  return (
    <div className="event-detail-page">
        {eventDetail? <>
        <h1>{eventDetail.eventName}</h1>
        <HeadLine
          dateToStart={eventDetail.dateToStart}
          duration={eventDetail.duration}
          venueName={eventDetail.venue.venueName}
        />

        <BookingGrid
          eventDetail={eventDetail}
          organizername={eventDetail.organizer.user.name}
          eventImgUrl={eventDetail.eventImgUrl}
        />

        <DetailGrid
          description={eventDetail.description}
          mapUrl={eventDetail.venue.mapUrl}
        />

        <TicketClassGrid
          ticketClasses={eventDetail.ticketClasses}
        />

        <TermsReview/>
      </> : <p>hello</p>}
    </div>
  );
};
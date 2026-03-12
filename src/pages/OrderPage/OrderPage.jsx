import { useLocation, useParams } from "react-router-dom";
import "./OrderPage.css";
import { useEffect, useState } from "react";
import { API } from "../../api/api.js";
import { useSeatSocket } from "../../hooks/useSeatSocket.js";

export function OrderPage( ){
  const location = useLocation();
  const [eventDetail, setEventDetail] = useState(location.state?.eventDetail);
  const [seats, setSeats] = useState(location.state?.eventDetail?.seats ?? []);
  
  const {eventId} = useParams();
  useEffect(()=>{
    const fetchEventDetail = async () => {
      if(!eventDetail){
        try {
          const response = await API.event.getById(eventId);
          setEventDetail(response.data?.data);
          setSeats(response.data?.seats ?? []);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchEventDetail();
  },[eventDetail, eventId]);

  useSeatSocket(Number(eventId), ({ seatId, status }) => {
    setSeats(prev =>
      prev.map(s => s.seatId === seatId ? { ...s, status } : s)
    );
  });

  return (
    <div className="order-page"> 
      {/* TODO */}
    </div>
  );
}
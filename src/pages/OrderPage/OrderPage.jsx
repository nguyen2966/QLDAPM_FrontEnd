import { useLocation, useParams } from "react-router-dom";
import "./OrderPage.css";
import { useEffect, useState } from "react";
import { API } from "../../api/api.js";

export function OrderPage( ){
  const location = useLocation();
  const [eventDetail, setEventDetail] = useState(location.state?.eventDetail);
  
  const {eventId} = useParams();
  useEffect(()=>{
    const fetchEventDetail = async () => {
      if(!eventDetail){
        try {
          const response = await API.event.getById(eventId);
          setEventDetail(response.data?.data);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchEventDetail();
  },[eventDetail, eventId]);

  return (
    <div className="order-page"> 
     
    </div>
  );
}
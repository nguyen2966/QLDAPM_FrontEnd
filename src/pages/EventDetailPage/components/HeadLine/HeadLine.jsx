import "./HeadLine.css";
import dateIcon from "../../../../assets/calendar.png";
import clockIcon from "../../../../assets/clock.png";
import locationIcon from "../../../../assets/location.png";

export function HeadLine( {dateToStart, duration, venueName} ){
  return (
    <div className="head-line">
      <p>Một số thông tin</p>

      <p className="head-line-item">
        <img src={dateIcon}/>
        {dateToStart}
      </p>

      <p className="head-line-item">
        <img src={clockIcon}/>
        {duration} p
      </p>

      <p className="head-line-item">
        <img src={locationIcon}/>
        {venueName}
      </p>
    </div>
  );
};
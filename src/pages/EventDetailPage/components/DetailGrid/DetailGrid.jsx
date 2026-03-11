import { MiniHeader } from "../MiniHeader/MiniHeader.jsx";
import "./DetailGrid.css";
import sendIcon from "../../../../assets/send.png";
import ggMapImg from "../../../../assets/gg-map.webp";

export function DetailGrid({ description, mapUrl }) {
  return (
    <div className="detail-grid">
      
      <div className="detail-grid-description">
        <MiniHeader title="Mô tả sự kiện" />
        <div className="detail-grid-description-content">
          {description}
        </div>
      </div>

      <div className="detail-grid-location">
        <img src={ggMapImg} alt="gg-map img"/>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="detail-grid-map-button"
        >
          Xem trên google map  <img src={sendIcon}/>
        </a>
      </div>

    </div>
  );
}
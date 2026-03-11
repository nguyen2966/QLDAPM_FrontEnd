import { MiniHeader } from "../MiniHeader/MiniHeader.jsx";
import "./TermsReview.css";

export function TermsReview(){
  return(
    <div className="term-review-block">

      <div className="term-review-block-item">
        <MiniHeader title={"Điều khoản sử dụng"} />
        <div className="term-review-block-item-content">
           <ul>
             <li>Người tham gia phải trên 16 tuổi (trẻ em dưới 16 tuổi cần có ngườ giám hộ đi theo)</li>
             <li>Không được mang theo vũ khí, các vật sắc nhọn vào sự kiện </li>
             <li>Mỗi vé chỉ được sử dụng một lần</li>
             <li>Vé sau khi mua sẽ không được hoàn trả, trừ khi nhà tổ chức hủy sự kiện</li>
             <li>Nhà tổ chức có quyền từ chối vào cổng đối với các khách không tuân thủ quy định về an ninh</li>
           </ul>

        </div>
      </div>

      <div className="term-review-block-item">
        <MiniHeader title={"Review và đánh giá"} />
        <div className="term-review-block-item-content">

        </div>
      </div>

    </div>
  )
}
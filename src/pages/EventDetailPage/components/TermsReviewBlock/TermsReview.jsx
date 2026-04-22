import { MiniHeader } from "../MiniHeader/MiniHeader.jsx";

export function TermsReview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-red-50">
        <MiniHeader title={"Điều khoản sử dụng"} />
        <ul className="space-y-4 mt-6 text-gray-600">
          {[
            "Người tham gia phải trên 16 tuổi (trẻ em dưới 16 tuổi cần có người giám hộ đi theo).",
            "Không được mang theo vũ khí, các vật sắc nhọn vào sự kiện.",
            "Mỗi vé chỉ được sử dụng một lần duy nhất.",
            "Vé sau khi mua sẽ không được hoàn trả, trừ khi nhà tổ chức hủy sự kiện.",
            "Nhà tổ chức có quyền từ chối vào cổng đối với các khách không tuân thủ quy định."
          ].map((term, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="text-red-500 mt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              </span>
              <span>{term}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-red-50">
        <MiniHeader title={"Review và đánh giá"} />
        <div className="mt-6 flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
          <p>Chưa có đánh giá nào cho sự kiện này.</p>
        </div>
      </div>

    </div>
  );
}
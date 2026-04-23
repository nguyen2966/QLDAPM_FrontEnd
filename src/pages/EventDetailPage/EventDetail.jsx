import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../../api/api.js";
import { useEffect, useState } from "react";
import { LoadingState } from "../../components/LoadingState/LoadingState.jsx";

// --- Các Component giao diện nhỏ (Được định nghĩa ngay trong file để tái sử dụng) ---

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false
  });

  useEffect(() => {
    // Hàm tính toán thời gian cập nhật mỗi giây
    const interval = setInterval(() => {
      const targetTime = new Date(targetDate).getTime();
      const currentTime = new Date().getTime();
      const difference = targetTime - currentTime;

      if (difference <= 0) {
        // Nếu thời gian đã qua, dừng đếm ngược
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        // Tính toán ngày, giờ, phút, giây
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isExpired: false
        });
      }
    }, 1000);

    // Dọn dẹp interval khi component bị unmount
    return () => clearInterval(interval);
  }, [targetDate]);

  // Hàm định dạng số để luôn có 2 chữ số (VD: 09 thay vì 9)
  const format = (num) => String(num).padStart(2, '0');

  if (timeLeft.isExpired) {
    return <span className="text-red-600 font-bold">Sự kiện đã bắt đầu</span>;
  }

  return (
    <span className="font-mono text-sm">
      {format(timeLeft.days)} ngày : {format(timeLeft.hours)} : {format(timeLeft.minutes)} : {format(timeLeft.seconds)}
    </span>
  );
};

const SectionTitle = ({ title }) => (
  <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-3 mb-4">
    {title}
  </h2>
);

const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-gray-700 bg-white shadow-sm">
    <span className="text-gray-500">{icon}</span>
    <span className="font-medium">{text}</span>
  </div>
);

const fmtCurrency = (amount) => {
  const num = Number(amount);
  return isNaN(num) || num === 0
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(num);
};

const calProgress = (dueDate, startDate) => {
  const now = new Date().getTime();
  const due = new Date(dueDate).getTime();
  const start = new Date(startDate).getTime();

  let timeLeft = due - now;
  const durationTime = due - start;

  if(timeLeft > durationTime){
    timeLeft = durationTime;
  }

  if(timeLeft < 0) {
    return 0;
  }
  const progress = timeLeft / durationTime * 100;
  return progress >= 0 ? progress : 0;
}
// --- Component Chính ---

export const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventDetail, setEventDetail] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await API.event.getById(eventId);
        console.log("test: ", response.data.data)
        setEventDetail(response.data.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    fetchEventDetail();
  }, [eventId]);

  if (!eventDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingState displayText={"Đang tải sự kiện..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- Header Section --- */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {eventDetail.eventName}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <span className="text-gray-500 font-medium text-sm">
              EventPass / <Link
                to="/"
                className="text-gray-400 hover:text-red-700 transition-colors"
              >
                Sự kiện </Link> / <span className="text-red-600">{eventDetail.eventName}</span>
            </span>
            
            <div className="hidden md:block w-px h-6 bg-gray-300 mx-2"></div>

            <div className="flex flex-wrap gap-3">
              <Badge 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} 
                text={new Date(eventDetail.dateToStart).toLocaleDateString('vi-VN')} 
              />
              <Badge 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
                text={`${eventDetail.duration} phút`} 
              />
              <Badge 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>} 
                text={eventDetail.venue.venueName} 
              />
            </div>
          </div>
        </div>

        {/* --- Main Layout Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI (Ảnh, Mô tả, Loại vé) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Ảnh sự kiện */}
            <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={eventDetail.eventImgUrl} 
                alt="Event Banner" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Chi tiết sự kiện */}
            <section>
              <SectionTitle title="Chi tiết sự kiện" />
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
                {eventDetail.description || "Chào mừng bạn đến với sự kiện. Thông tin chi tiết đang được cập nhật thêm..."}
              </div>
            </section>

            {/* Danh sách hạng vé */}
            <section>
              <SectionTitle title="Các hạng vé" />
              <div className="space-y-4">
                {eventDetail.ticketClasses?.map(item => (
                  <div
                    key={item.ticketClassId}
                    className="relative flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-red-300 transition-colors"
                  >
                    {/* Thanh đệm */}
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-red-500 rounded-l-xl" style={{ backgroundColor: `${item.color}` }}></div>

                    <div className="ml-2 mb-4 sm:mb-0">
                      <p className="text-lg font-bold text-gray-900">{item.className}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.description || "Chưa có mô tả."}</p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <p className="text-xl font-extrabold text-red-600">
                        {fmtCurrency(item.price)}
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/order/${eventDetail.eventId}`, {
                            state: { eventDetail },
                          })
                        }
                        className="px-6 py-2 border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 font-medium rounded-lg transition-colors bg-white text-sm"
                      >
                        Chọn vé
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (Booking Form, Organizer, Map) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Box Đặt vé */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-1">Đặt vé ngay</h3>
              <p className="text-sm text-gray-500 mb-6">Chỉ từ <span className="font-bold text-red-600">{fmtCurrency(eventDetail.ticketClasses?.reduce(
                (acc, curr) => {
                  return Number(curr.price) < Number(acc.price) ? curr : acc;
                }
              ).price)}</span></p>
              
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2 font-medium">
                  <span>Thời gian còn lại</span>
                  <CountdownTimer targetDate={eventDetail.dateToStart} />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${calProgress(eventDetail.dateToStart, eventDetail.timeToRelease)}%` }}></div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/order/${eventDetail.eventId}`, { state: { eventDetail } })}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm"
              >
                Mua vé ngay
              </button>
            </div>

            {/* Box Ban tổ chức */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-500 mb-4 uppercase tracking-wider">Thông tin ban tổ chức</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-gray-900">{eventDetail.organizer?.user?.name || "Đang cập nhật"}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Đơn vị tổ chức sự kiện chuyên nghiệp, cam kết mang lại trải nghiệm tuyệt vời nhất cho người tham gia.</p>
            </div>

            {/* Box Bản đồ */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-500 mb-4 uppercase tracking-wider">Vị trí sự kiện</h3>
              
              <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-4 text-red-400">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              </div>
              
              <p className="text-sm text-gray-700 font-medium mb-4 text-center">{eventDetail.venue.venueName}</p>
              
              <a 
                href={eventDetail.venue.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-red-600 hover:text-red-600 transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                Mở Google Maps
              </a>
            </div>

          </div>
        </div>

        {/* --- Bottom Section (Terms & Reviews) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16 pt-10 border-t border-gray-200">
          
          {/* Điều khoản */}
          <div>
            <SectionTitle title="Điều khoản sử dụng" />
            <ul className="space-y-3 mt-4 text-sm text-gray-600 list-disc pl-5">
              <li>Người tham gia phải trên 16 tuổi (trẻ em dưới 16 tuổi cần có người giám hộ).</li>
              <li>Không được mang theo vũ khí, các vật sắc nhọn hoặc chất cấm vào sự kiện.</li>
              <li>Mỗi vé chỉ có giá trị sử dụng một lần duy nhất.</li>
              <li>Vé đã mua không được hoàn trả dưới mọi hình thức, trừ khi sự kiện bị hủy bởi ban tổ chức.</li>
              <li>Ban tổ chức có quyền từ chối sự tham gia của các cá nhân không tuân thủ quy định an ninh.</li>
            </ul>
          </div>

          {/* Đánh giá */}
          <div>
            <SectionTitle title="Đánh giá & Bình luận" />
            <div className="mt-4 flex flex-col items-center justify-center h-40 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
               <p className="text-sm">Chưa có đánh giá nào cho sự kiện này.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
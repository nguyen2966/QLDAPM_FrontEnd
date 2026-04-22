import { useNavigate } from "react-router-dom";

export function BookingGrid({ eventDetail, organizername, eventImgUrl }) {
  const navigate = useNavigate();
  return (  
    <div className="flex flex-col md:flex-row gap-8 bg-white p-4 rounded-2xl shadow-sm border border-red-100">
      
      {/* Cột Banner */}
      <div className="w-full md:w-2/3 h-64 md:h-[400px] rounded-xl overflow-hidden shadow-inner">
        <img 
          src={eventImgUrl} 
          alt="event banner" 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Cột Organizer & Nút Đặt Vé */}
      <div className="w-full md:w-1/3 flex flex-col justify-center space-y-8 p-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-red-500 uppercase tracking-wider font-bold mb-2">Đơn vị tổ chức</p>
          <p className="text-2xl font-bold text-gray-900">{organizername}</p>
        </div>
        
        <button 
         className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-red-500/30 flex justify-center items-center gap-2 text-lg"
         onClick={() => {
          navigate(`/order/${eventDetail.eventId}`, {
            state: { eventDetail }
          });
         }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
          Đặt Vé Ngay
        </button>
      </div>

    </div>
  );
}
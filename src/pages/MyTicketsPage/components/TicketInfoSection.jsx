import React, {useState} from 'react';
import { RefreshCw } from "lucide-react";

const TicketInfoSection = ({ ticketCode, ticketInfo, handleRefresh, loading }) => {
    const [showId, setShowId] = useState(false);

    // Mock data thông tin sự kiện (Thực tế bạn sẽ lấy từ API chi tiết vé)

    const { eventName, venue, seatName, ticketClass } = ticketInfo;

    return (
        <div className="bg-[#FFC1C1] rounded-2xl p-6 sm:p-8 flex flex-col border border-[#FDF2F2] h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{eventName}</h2>
            <p className="text-gray-600 mb-8">{venue}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                    <p className="text-gray-500 text-sm mb-1">Cổng</p>
                    <p className="font-bold text-lg text-gray-900">Không có</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Khu</p>
                    <p className="font-bold text-lg text-gray-900">{ticketClass}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Ghế</p>
                    <p className="font-bold text-lg text-gray-900">{seatName}</p>
                </div>
            </div>

            <div className="mb-auto">
                <label className="text-gray-700 text-sm font-medium mb-2 block">ID vé (Ticket ID)</label>
                <div className="relative">
                    <input
                        type={showId ? "text" : "password"}
                        value={ticketCode}
                        readOnly
                        className="w-full bg-gray-200 text-gray-800 font-mono py-3 px-4 rounded-lg outline-none pr-12"
                    />
                    <button
                        onClick={() => setShowId(!showId)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    >
                        {showId ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                    </button>
                </div>
            </div>

            <button
                onClick={handleRefresh}
                disabled={loading}
                className="mt-8 flex items-center justify-center gap-2 bg-[#E10D0C] hover:bg-[#FF3333] text-white font-medium py-3 px-6 rounded-lg transition-colors w-max"
            >
                <RefreshCw className={loading ? "animate-spin" : ""} width="18"
                           height="18" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2"
                           strokeLinecap="round" strokeLinejoin="round"
                />
                Làm mới mã
            </button>
        </div>
    );
};
export default TicketInfoSection

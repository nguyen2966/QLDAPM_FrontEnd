import React from 'react'
import {QRCodeSVG} from "qrcode.react";

const TicketQRSection = ({ qrToken, timeLeft, loading }) => {
    // Tính toán % cho thanh tiến trình (max 30s)
    const progressPercent = (timeLeft / 30) * 100;

    return (
        <div className="bg-[#FFC1C1] rounded-2xl p-6 sm:p-8 flex flex-col items-center border border-gray-200">
            <div className="w-full flex items-center gap-2 mb-6 text-gray-800 font-semibold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
                    <path d="M12 7v10"></path>
                    <path d="M8 7v10"></path>
                    <path d="M16 7v10"></path>
                </svg>
                <span>Vé điện tử</span>
            </div>

            <div className="bg-gray-200/60 w-full rounded-xl p-6 flex flex-col items-center">
                {/* Vùng chứa mã QR */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 w-56 h-56 flex items-center justify-center relative">
                    {loading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E10D0C]"></div>
                    ) : qrToken ? (
                        <QRCodeSVG value={qrToken} size={192} level="H" includeMargin={false} />
                    ) : (
                        <span className="text-gray-400 text-sm">Chưa có mã QR</span>
                    )}
                </div>

                {/* Thanh đếm ngược */}
                <div className="w-full max-w-[240px]">
                    <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                        <span>Mã sẽ làm mới trong</span>
                        <span className="text-gray-900 font-bold">{timeLeft}s</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-300 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#E10D0C] rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-gray-900 font-semibold">Xác nhận quyền sở hữu hợp lệ</p>
                <p className="text-gray-500 text-xs mt-1 italic">Mã được mã hóa theo thời gian thực bởi EventPass</p>
            </div>
        </div>
    );
};
export default TicketQRSection

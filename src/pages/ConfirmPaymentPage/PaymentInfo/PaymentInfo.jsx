import React from 'react'

const PaymentInfo = ({timeLeft, formatTime, orderId, eventName, seatIds, amount, handlePayment, loading, formatCurrency}) => {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 border border-gray-100 sticky top-6">

                {/* Box Đếm ngược thời gian */}
                <div className={`mb-6 p-4 rounded-lg flex flex-col items-center justify-center border ${
                    timeLeft > 60 ? "bg-red-50 border-red-100" : "bg-red-100 border-red-300 animate-pulse"
                }`}>
                    <span className="text-sm font-medium text-red-600 mb-1">Thời gian giữ ghế còn lại</span>
                    <span className={`text-3xl font-bold tracking-wider ${timeLeft > 60 ? "text-red-600" : "text-red-700"}`}>
                  {formatTime(timeLeft)}
                </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Tổng kết đơn hàng
                </h2>

                {/* Thông tin vé */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Mã đơn hàng:</span>
                        <span className="font-medium text-gray-900">#{orderId}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Sự kiện:</span>
                        <span className="font-medium text-gray-900 text-right">{eventName}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Ghế đã chọn:</span>
                        <span className="font-medium text-gray-900">
                    {seatIds?.length > 0 ? seatIds.join(", ") : "N/A"}
                  </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Số lượng vé:</span>
                        <span className="font-medium text-gray-900">{seatIds?.length || 0} vé</span>
                    </div>
                </div>

                {/* Tổng tiền */}
                <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-[#DC2626]">
                  {amount ? formatCurrency(amount) : "0"}
                </span>
                </div>

                {/* Nút Thanh toán */}
                <button
                    onClick={handlePayment}
                    disabled={loading || timeLeft <= 0}
                    className={`w-full py-4 rounded-lg text-white font-bold text-lg flex justify-center items-center transition ${
                        timeLeft <= 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : loading
                                ? "bg-[#DC2626]/80 cursor-not-allowed"
                                : "bg-[#DC2626] hover:bg-[#ED8D8D] shadow-md hover:shadow-lg"
                    }`}
                >
                    {timeLeft <= 0 ? (
                        "Hết thời gian giữ ghế"
                    ) : loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                        </>
                    ) : (
                        "Thanh toán ngay"
                    )}
                </button>

            </div>
        </div>
    )
}
export default PaymentInfo

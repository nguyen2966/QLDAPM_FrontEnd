import React from 'react'

const SuccessPayment = ({orderId, amount, navigate}) => {
    return (
        <div className="flex flex-col items-center text-center">
            {/* Icon Check Xanh */}
            <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 text-sm mb-6 px-2">
                Cảm ơn bạn đã tin tưởng đặt vé tại EventPass. Thông tin vé đã được gửi đến email của bạn.
            </p>

            {/* Khối thông tin đơn hàng */}
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin đơn hàng</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Mã đơn hàng:</span> #{orderId}</p>
                    <p><span className="font-medium">Tổng tiền:</span> {Number(amount).toLocaleString()} VNĐ</p>
                </div>
            </div>

            {/* Nút bấm */}
            <div className="w-full space-y-3">
                <button
                    onClick={() => navigate('/order/my-order')} // Đổi link này theo route quản lý vé của bạn
                    className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-lg transition duration-200"
                >
                    Xem vé của tôi
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition duration-200"
                >
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    )
}
export default SuccessPayment

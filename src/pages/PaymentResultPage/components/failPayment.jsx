import React from 'react'

const FailPayment = ({orderId, resultCode, message, navigate}) => {
    return (
        <div className="flex flex-col items-center text-center">
            {/* Icon X Đỏ */}
            <div className="w-16 h-16 bg-[#ef4444] rounded-full flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại!</h2>
            <p className="text-gray-600 text-sm mb-6 px-2">
                Rất tiếc, giao dịch của bạn không thành công. Vui lòng kiểm tra lại phương thức thanh toán hoặc thử lại sau.
            </p>

            {/* Khối thông tin lỗi */}
            <div className="w-full bg-red-50 rounded-lg p-4 mb-6 text-left border border-red-100">
                <h3 className="font-semibold text-gray-800 mb-2">Thông tin đơn hàng</h3>
                <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">#{orderId}</p>
                    <p className="text-red-600 mt-2">
                        <span className="font-medium">Mã lỗi:</span> {resultCode} ({message})
                    </p>
                </div>
            </div>

            {/* Nút bấm */}
            <div className="w-full space-y-3">
                <button
                    onClick={() => navigate(-1)} // Quay lại trang ConfirmPayment để thử lại
                    className="w-full py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold rounded-lg transition duration-200"
                >
                    Thử lại thanh toán
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
export default FailPayment

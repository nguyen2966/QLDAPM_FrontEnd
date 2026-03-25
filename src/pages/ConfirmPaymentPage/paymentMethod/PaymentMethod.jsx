import React from 'react'

const PaymentMethod = ({paymentMethod, setPaymentMethod}) => {
    return (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Phương thức thanh toán
            </h2>
            <div className="space-y-3">
                <div
                    className={`border-2 rounded-lg p-4 flex items-center cursor-pointer transition ${
                        paymentMethod === "momo" ? "border-[#a50064] bg-pink-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("momo")}
                >
                    <input
                        type="radio"
                        checked={paymentMethod === "momo"}
                        onChange={() => setPaymentMethod("momo")}
                        className="w-5 h-5 text-[#a50064] focus:ring-[#a50064] mr-4"
                    />
                    <div className="px-2 py-4 bg-[#a50064] rounded-md flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm">
                        MoMo
                    </div>
                    <div>
                        <span className="block font-semibold text-gray-800 text-lg">Ví điện tử MoMo</span>
                        <span className="text-sm text-gray-500">Thanh toán nhanh chóng, an toàn</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PaymentMethod
